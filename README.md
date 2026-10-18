# SmartBlood - Hệ Thống Điều Phối Hiến Máu Nhân Đạo & Dự Báo Nhu Cầu Máu Y Tế

> **Hệ thống phần mềm toàn diện (Full-Stack Monorepo)**  
> **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Leaflet Maps + Socket.io-client  
> **Backend:** Node.js (Express) + TypeScript + Sequelize ORM + SQL Server + Socket.io Realtime + JWT  
> **Cơ sở dữ liệu:** Microsoft SQL Server (HienMauDB)

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án được phân chia gọn gàng thành **2 thư mục chính độc lập**: `Frontend` và `Backend`, sẵn sàng đưa lên GitHub và triển khai:

```text
smartblood/
├── Backend/                         # Máy chủ API & Dịch vụ Y tế (Node.js + Express + TypeScript)
│   ├── sql/                         # Kịch bản khởi tạo & Nạp dữ liệu CSDL SQL Server
│   │   ├── 01-init-schema.sql       # Khởi tạo CSDL HienMauDB & các bảng quan hệ
│   │   ├── 02-seed-data.sql         # Nạp dữ liệu tài khoản & điểm hiến máu mẫu
│   │   ├── 03-app-user.sql          # Tạo user database hienmau_app & phân quyền
│   │   ├── 04-donation-history.sql  # Lịch sử hiến máu đã xác nhận & chu kỳ an toàn
│   │   ├── 05-emergency-requests.sql# Ca yêu cầu cấp cứu & điều phối xe 115
│   │   └── 06-blood-inventory-rbac.sql # Quy tắc quản lý kho máu FEFO & RBAC
│   ├── src/
│   │   ├── config/                  # Kết nối Database Sequelize, Swagger API Docs
│   │   ├── controllers/             # Bộ điều khiển (Auth, User, Donation, Emergency, Forecast)
│   │   ├── dtos/                    # Data Transfer Objects
│   │   ├── middlewares/             # Xác thực JWT (RBAC), kiểm tra dữ liệu đầu vào, Logger
│   │   ├── models/                  # Định nghĩa Sequelize Models quan hệ 1-N, N-N
│   │   ├── routes/                  # Express RESTful Endpoints
│   │   ├── services/                # Nghiệp vụ y tế, tính chu kỳ 84 ngày, thuật toán FEFO
│   │   ├── utils/                   # Xử lý lỗi AppError, tương thích máu, Socket realtime
│   │   └── server.ts                # Điểm khởi chạy Backend Server (Port 5000)
│   ├── .env                         # Cấu hình môi trường Backend (Port, DB, JWT_SECRET)
│   ├── package.json                 # Dependencies độc lập của Backend
│   └── tsconfig.json                # Cấu hình TypeScript cho Backend
│
├── Frontend/                        # Ứng dụng Giao diện Web (React 19 + Vite + TypeScript)
│   ├── src/
│   │   ├── api/                     # Cấu hình Axios Client & Interceptors đính kèm Token
│   │   ├── components/              # Các thành phần giao diện (RoleSidebar, Navbar, Modals...)
│   │   ├── contexts/                # Quản lý State toàn cục (AuthContext, CallModalContext, EmergencyContext)
│   │   ├── hooks/                   # Custom Hooks (useSocket realtime)
│   │   ├── layouts/                 # Khung sườn giao diện chuẩn y tế (MainLayout)
│   │   ├── pages/                   # Các trang tính năng nghiệp vụ:
│   │   │   ├── admin/               # Quản lý tài khoản, Quản lý kho, Quản lý hiến máu, Điều phối xe 115
│   │   │   ├── staff/               # Bàn tiếp nhận duyệt lịch hẹn, Phát lệnh cấp cứu
│   │   │   ├── donor/               # Đặt lịch hẹn, Tra cứu lịch sử hiến máu cá nhân
│   │   │   ├── auth/                # Đăng nhập, Đăng ký (bỏ nhóm máu ban đầu, cập nhật sau duyệt)
│   │   │   └── public/              # Trang chủ, Bản đồ điểm hiến, Quy trình, Điều kiện hiến máu
│   │   ├── routes/                  # Định tuyến AppRoutes phân quyền theo vai trò
│   │   ├── types/                   # Định nghĩa TypeScript Types toàn hệ thống
│   │   ├── utils/                   # Tiện ích giao diện, kiểm tra CCCD, chu kỳ an toàn
│   │   ├── App.tsx                  # Root App Component
│   │   ├── index.css                # Style toàn cục & Hiệu ứng 3D thẻ chỉ số
│   │   └── main.tsx                 # Điểm gắn kết React DOM
│   ├── index.html                   # HTML Entry với tiêu đề & font chuẩn y tế
│   ├── vite.config.ts               # Cấu hình Vite, Tailwind CSS & Reverse Proxy sang Backend
│   ├── package.json                 # Dependencies độc lập của Frontend
│   └── tsconfig.json                # Cấu hình TypeScript cho Frontend
│
├── docs/                            # Tài liệu đặc tả OpenAPI, kết quả kiểm thử
├── postman/                         # Bộ sưu tập Postman Collection kiểm thử API
├── .env                             # Cấu hình môi trường gốc
├── .gitignore                       # Loại trừ node_modules, dist, .env khi đẩy lên GitHub
├── package.json                     # Monorepo Orchestrator (Chạy song song bằng 1 lệnh)
├── pnpm-workspace.yaml              # Liên kết Workspace Frontend & Backend
└── README.md                        # Hướng dẫn chi tiết nộp bài & khởi chạy
```

---

## 2. Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Bước 1: Khởi tạo Cơ sở dữ liệu SQL Server
Mở **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio, kết nối tới SQL Server cục bộ và lần lượt chạy các file script trong thư mục `Backend/sql/`:
1. `01-init-schema.sql`: Khởi tạo database `HienMauDB` và 6 bảng nghiệp vụ.
2. `02-seed-data.sql`: Nạp tài khoản và sự kiện mẫu.
3. `03-app-user.sql`: Khởi tạo user `hienmau_app` (Password: `HienMau@2026!`).
4. `04-donation-history.sql`: Nạp lịch sử các lần hiến máu thành công đã được duyệt.
5. `05-emergency-requests.sql`: Nạp các ca cấp cứu và điều phối xe 115.
6. `06-blood-inventory-rbac.sql`: Kích hoạt cơ chế phân quyền bảo mật kho máu.

---

### Bước 2: Khởi chạy dự án

Bạn có thể chạy toàn bộ hệ thống bằng **1 lệnh duy nhất** từ thư mục gốc, hoặc chạy độc lập từng thư mục:

#### Cách 1: Chạy song song từ thư mục gốc (Khuyên dùng)
```bash
# 1. Cài đặt toàn bộ dependencies
pnpm install

# 2. Khởi chạy đồng thời cả Backend (Port 5000) và Frontend (Port 3000)
pnpm dev
```

#### Cách 2: Chạy độc lập từng thư mục
* **Khởi chạy Backend (Port 5000):**
  ```bash
  cd Backend
  pnpm install
  pnpm dev
  ```
* **Khởi chạy Frontend (Port 3000):**
  ```bash
  cd Frontend
  pnpm install
  pnpm dev
  ```

Sau khi khởi chạy, truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**.  
Tài liệu Swagger API có tại: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**.

---

## 3. Tài Khoản Thử Nghiệm Theo Từng Vai Trò (Demo Accounts)

Mật khẩu mặc định cho tất cả tài khoản mẫu: **`Admin@123`**

| Vai trò | Email đăng nhập | Quyền hạn chính |
| :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@hienmau.vn` | Toàn quyền hệ thống, Quản lý tài khoản, Duyệt lịch, Quản lý hiến máu (chu kỳ 84 ngày), Điều phối xe 115 |
| **Bác sĩ / Y tế (HOSPITAL_STAFF)** | `bacsichoray@gmail.com` | Tiếp nhận & duyệt lịch hẹn, Khám sàng lọc, Cộng kho máu tự động, Phát lệnh cấp cứu khẩn |
| **Người hiến máu (DONOR)** | `nguyenvanan.donor@gmail.com` | Đặt lịch hiến máu, Tra cứu lịch sử hiến máu đã xác nhận, Xem giấy chứng nhận |
| **Người hiến máu mới** | `namanh@gmail.com` | Đăng ký tài khoản không cần chọn nhóm máu, hồ sơ tự động cập nhật sau khi bác sĩ xét nghiệm & duyệt |

---

## 4. Các Tính Năng Nổi Bật Đã Hoàn Thiện

1. **Quản Lý Hiến Máu & Theo Dõi Chu Kỳ 84 Ngày**:
   - Thống kê tự động tất cả Donor đã được duyệt hiến máu thành công (`trangThai: 'HoanThanh'`).
   - Kiểm tra điều kiện hiến máu tiếp theo theo **Thông tư 26/2013/TT-BYT** (khoảng cách tối thiểu 84 ngày / 12 tuần).
   - Phân loại rõ ràng trạng thái: **Đủ điều kiện hiến tiếp ($\ge 84$ ngày)** và **Đang phục hồi ($< 84$ ngày)** với thanh tiến độ % phục hồi và hiển thị ngày dự kiến đủ điều kiện.
   - Nút gọi điện thoại thông minh tích hợp **Hộp thoại cuộc gọi khẩn cấp** chuẩn số điện thoại của Donor.

2. **Duyệt Lịch Hẹn & Tiếp Nhận Cộng Kho Máu (FEFO Transaction)**:
   - Thống kê 4 thẻ chỉ số KPI sinh động: Tổng lịch hẹn, Chờ duyệt, Đã duyệt, Đã cộng kho.
   - Khi bác sĩ xác nhận "Tiếp nhận hiến máu", hệ thống tự động cộng dồn thể tích vào Kho máu theo thuật toán FEFO và cập nhật nhóm máu chuẩn vào hồ sơ cá nhân của Donor.

3. **Điều Phối Xe Cứu Thương 115 & Cấp Cứu Realtime**:
   - WebSocket Socket.io tự động phát còi báo động đỏ âm thanh khi có bệnh viện yêu cầu máu khẩn cấp.
   - Điều phối tài xế xe 115 giao máu tới phòng mổ khẩn. Hộp thoại cuộc gọi hiển thị chuẩn số hotline tài xế và số tổng đài cấp cứu 1900 6868.

4. **Đăng Ký Tài Khoản Linh Hoạt**:
   - Người đăng ký hiến máu lần đầu không bắt buộc phải biết nhóm máu. Bác sĩ/Admin sẽ xác nhận nhóm máu thực tế sau khi tiếp nhận.
