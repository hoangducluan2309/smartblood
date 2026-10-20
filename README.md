# SmartBlood - Hệ Thống Điều Phối Hiến Máu Nhân Đạo & Quản Lý Sự Kiện Y Tế

> **Hệ thống phần mềm Y tế toàn diện (Full-Stack Monorepo)**  
> **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + Leaflet Maps + Socket.io-client  
> **Backend:** Node.js (Express) + TypeScript + Sequelize ORM + Microsoft SQL Server + Socket.io Realtime + JWT + OpenAPI / Swagger  
> **Cơ sở dữ liệu:** Microsoft SQL Server (HienMauDB)

---

## 1. Cấu Trúc Dự Án (Project Structure)

Dự án được phân chia gọn gàng thành **2 thư mục chính độc lập**: `Frontend` và `Backend`, kết nối monorepo qua `pnpm`:

```text
smartblood/
├── Backend/                         # Máy chủ API & Dịch vụ Y tế (Node.js + Express + TypeScript)
│   ├── sql/                         # Kịch bản khởi tạo & Nạp dữ liệu CSDL SQL Server
│   │   ├── 01-init-schema.sql       # Khởi tạo CSDL HienMauDB & các bảng quan hệ
│   │   ├── 02-seed-data.sql         # Nạp dữ liệu tài khoản & sự kiện hiến máu mẫu
│   │   ├── 03-app-user.sql          # Tạo user database hienmau_app & phân quyền
│   │   ├── 04-donation-history.sql  # Lịch sử hiến máu đã xác nhận & chu kỳ an toàn
│   │   ├── 05-emergency-requests.sql# 8 ca cấp cứu bao phủ các nhóm máu & xe 115
│   │   └── 06-blood-inventory-rbac.sql # Quy tắc bảo mật phân quyền Kho máu FEFO
│   ├── src/
│   │   ├── config/                  # Kết nối Database Sequelize, cấu hình Swagger
│   │   ├── controllers/             # Bộ điều khiển (Auth, User, Donation, Emergency, Forecast)
│   │   ├── dtos/                    # Data Transfer Objects & Validation Schemas
│   │   ├── middlewares/             # Xác thực JWT (RBAC), Validate dữ liệu đầu vào, Logger
│   │   ├── models/                  # Định nghĩa Sequelize Models quan hệ 1-N, N-N
│   │   ├── routes/                  # Express RESTful Endpoints chuẩn REST
│   │   ├── scripts/                 # Kịch bản kiểm thử tự động (Unit Tests)
│   │   ├── services/                # Nghiệp vụ y tế, tính chu kỳ 84 ngày, thuật toán FEFO
│   │   ├── utils/                   # Xử lý lỗi AppError, ma trận tương thích máu, Socket realtime
│   │   └── server.ts                # Điểm khởi chạy Backend Server (Port 5000)
│   ├── .env                         # Cấu hình môi trường Backend (Port, DB MSSQL, JWT_SECRET)
│   ├── package.json                 # Dependencies độc lập của Backend
│   └── tsconfig.json                # Cấu hình TypeScript cho Backend
│
├── Frontend/                        # Ứng dụng Giao diện Web (React 19 + Vite + TypeScript)
│   ├── src/
│   │   ├── api/                     # Cấu hình Axios Client & Interceptors đính kèm JWT
│   │   ├── components/              # Các thành phần giao diện dùng chung:
│   │   │   ├── admin/               # Modals tạo, sửa, xóa, tắt thẻ sự kiện hiến máu
│   │   │   ├── donor/               # Modal đặt lịch hẹn hiến máu (BookModal)
│   │   │   ├── map/                 # Bản đồ số Leaflet định vị điểm hiến (EventMap)
│   │   │   ├── auth/                # Modal đăng nhập / đăng ký tích hợp nút đăng nhập mẫu
│   │   │   └── RoleSidebar, Navbar  # Thanh điều hướng phân quyền theo từng vai trò
│   │   ├── contexts/                # Quản lý State toàn cục (AuthContext, CallModalContext, EmergencyContext)
│   │   ├── layouts/                 # Khung sườn giao diện chuẩn y tế (MainLayout)
│   │   ├── pages/                   # Các trang tính năng nghiệp vụ:
│   │   │   ├── admin/               # Quản lý người dùng, Quản lý kho, Quản lý chu kỳ 84 ngày, Điều phối xe 115
│   │   │   ├── staff/               # Bàn tiếp nhận duyệt lịch hẹn, Khám sàng lọc, Phát lệnh cấp cứu
│   │   │   ├── donor/               # Danh sách sự kiện hiến máu (/events), Tra cứu lịch sử hiến cá nhân
│   │   │   └── public/              # Trang chủ (/), Bản đồ điểm hiến, Quy trình, Điều kiện hiến máu
│   │   ├── routes/                  # Định tuyến AppRoutes phân quyền theo vai trò (ADMIN, STAFF, DONOR)
│   │   ├── types/                   # Định nghĩa TypeScript Types toàn hệ thống
│   │   ├── utils/                   # Tiện ích giao diện, kiểm tra CCCD, chu kỳ an toàn
│   │   ├── App.tsx                  # Root App Component
│   │   ├── index.css                # Style Tailwind CSS toàn cục & Hiệu ứng thẻ chỉ số
│   │   └── main.tsx                 # Điểm gắn kết React DOM
│   ├── index.html                   # HTML Entry với tiêu đề & font chuẩn y tế
│   ├── vite.config.ts               # Cấu hình Vite & Reverse Proxy sang Backend
│   ├── package.json                 # Dependencies độc lập của Frontend
│   └── tsconfig.json                # Cấu hình TypeScript cho Frontend
│
├── docs/                            # Tài liệu đặc tả OpenAPI (openapi.yaml)
├── postman/                         # Bộ sưu tập Postman Collection kiểm thử API
├── .env                             # Cấu hình môi trường gốc
├── package.json                     # Monorepo Orchestrator (Chạy song song bằng 1 lệnh pnpm dev)
├── pnpm-workspace.yaml              # Liên kết Workspace Frontend & Backend
└── README.md                        # Hướng dẫn chi tiết hệ thống & khởi chạy
```

---

## 2. Hướng Dẫn Cài Đặt & Khởi Chạy (Quick Start)

### Bước 1: Khởi tạo Cơ sở dữ liệu SQL Server
Mở **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio, kết nối tới máy chủ SQL Server cục bộ và lần lượt thực thi các file kịch bản trong thư mục `Backend/sql/`:
1. `01-init-schema.sql`: Khởi tạo database `HienMauDB` và 6 bảng dữ liệu nghiệp vụ quan hệ.
2. `02-seed-data.sql`: Nạp tài khoản mẫu, sự kiện hiến máu và kho máu ban đầu.
3. `03-app-user.sql`: Khởi tạo tài khoản database `hienmau_app` (Password: `HienMau@2026!`) và cấp quyền.
4. `04-donation-history.sql`: Nạp lịch sử các lần hiến máu thành công đã được duyệt & view tổng hợp.
5. `05-emergency-requests.sql`: Nạp 8 ca cấp cứu chuẩn hóa bao phủ 8 nhóm máu và dữ liệu điều phối xe 115.
6. `06-blood-inventory-rbac.sql`: Kích hoạt chính sách kiểm soát phân quyền kho máu (RBAC).

---

### Bước 2: Cấu hình biến môi trường
File `.env` mẫu đã được cấu hình sẵn trong cả 2 thư mục:
* **Backend/.env**:
  ```ini
  PORT=5000
  NODE_ENV=development
  DB_HOST=localhost
  DB_PORT=1433
  DB_NAME=HienMauDB
  DB_USER=hienmau_app
  DB_PASSWORD=HienMau@2026!
  DB_ENCRYPT=false
  DB_TRUST_SERVER_CERTIFICATE=true
  JWT_SECRET=your_super_secret_jwt_key_blood_donation_2026
  JWT_EXPIRES_IN=7d
  CORS_ORIGIN=http://localhost:3000
  ```
* **Frontend/.env**:
  ```ini
  VITE_API_URL=http://localhost:5000/api/v1
  VITE_SOCKET_URL=http://localhost:5000
  ```

---

### Bước 3: Khởi chạy dự án

Bạn có thể chạy toàn bộ hệ thống bằng **1 lệnh duy nhất** từ thư mục gốc:

```bash
# 1. Cài đặt toàn bộ dependencies cho cả Frontend và Backend
pnpm install

# 2. Khởi chạy đồng thời cả Backend (Port 5000) và Frontend (Port 3000)
pnpm dev
```

*Nếu muốn chạy độc lập từng thư mục:*
* **Backend:** `cd Backend && pnpm dev` (Chạy tại: `http://localhost:5000`)
* **Frontend:** `cd Frontend && pnpm dev` (Chạy tại: `http://localhost:3000`)

---

## 3. Tài Khoản Thử Nghiệm Chuẩn Database (Demo Accounts)

> 🔑 **Mật khẩu mặc định cho các tài khoản mẫu trong Database:** **`Password@123`**  
> *(Giao diện Đăng nhập cũng tích hợp sẵn các nút bấm đăng nhập nhanh 1-click cho từng vai trò).*

| Vai trò | Email đăng nhập | Tên người dùng trong DB | Quyền hạn & Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@hienmau.vn` | **Quản Trị Viên Hệ Thống** | Toàn quyền hệ thống: Quản lý người dùng, Tạo/Sửa/Xóa sự kiện hiến máu, Quản lý kho máu FEFO, Giám sát chu kỳ hiến máu 84 ngày, Điều phối xe cấp cứu 115. |
| **Bác sĩ / Y tế (HOSPITAL_STAFF)** | `staff.choray@hienmau.vn` | **BS. Trần Thị Mai (BV Chợ Rẫy)** | Tạo/Sửa/Xóa/Tắt thẻ sự kiện hiến máu, Bàn tiếp nhận & duyệt lịch hẹn, Khám sàng lọc, Tự động cộng dồn kho máu, Phát lệnh cấp cứu khẩn cấp, Xem tồn kho FEFO. |
| **Người hiến máu (DONOR)** | `nguyenvanan.donor@gmail.com` | **Nguyễn Văn An** *(Nhóm máu: A+)* | Đã có sẵn lịch sử 5 lần hiến máu thành công + 1 lịch hẹn sắp tới. Xem chu kỳ phục hồi 84 ngày, Giấy chứng nhận điện tử, Đặt lịch tham gia sự kiện. |
| **Người hiến máu (Nhóm máu hiếm)** | `namanh@gmail.com` | **nam anh** *(Nhóm máu: AB-)* | Tài khoản tình nguyện viên nhóm máu hiếm (Rh-), tra cứu và đăng ký hiến máu nhanh khi có lệnh điều phối khẩn. |
| **Người hiến máu mới** | `testname123@example.com` | **Nguyen Van 123** | Tài khoản đăng ký mới chưa xác định nhóm máu; hồ sơ tự động cập nhật sau khi đến khám sàng lọc và được bác sĩ duyệt. |

---

## 4. Các Tính Năng Nghiệp Vụ Nổi Bật Đã Hoàn Thiện

### 1. Quản Lý Sự Kiện Hiến Máu & Đồng Bộ Trang Chủ
- **Phân quyền Admin & Bác sĩ (HOSPITAL_STAFF)**: Tạo mới, Chỉnh sửa thông tin, Xóa vĩnh viễn, hoặc Bật/Tắt thẻ sự kiện (kèm ghi chú lý do như *"Đã đủ chỉ tiêu"*, *"Thời tiết xấu"*...).
- **Đồng bộ thời gian thực ra màn hình Trang chủ**: Mục *"Các Đợt Hiến Máu Sắp Diễn Ra"* trên trang chủ tự động truy vấn từ CSDL SQL Server, hiển thị các sự kiện thực tế (*Hành Trình Đỏ 2026*, *Vì Bệnh Nhân Thalassemia*...), hiển thị ngày giờ chuẩn tiếng Việt, thanh tiến độ % chỉ tiêu và nút bấm chuyển thẳng vào modal đăng ký.
- **Bản đồ số Leaflet & Lọc theo Quận Huyện**: Tích hợp chế độ xem Lưới thẻ (Card Grid) và Bản đồ số (Map View) định vị chính xác vị trí tiếp nhận tại TP.HCM (Quận 1, Quận 5, Quận 10, TP. Thủ Đức...).

### 2. Quản Lý Chu Kỳ An Toàn 84 Ngày (Thông tư 26/2013/TT-BYT)
- Tự động thống kê các Donor đã hoàn thành hiến máu (`trangThai: 'HoanThanh'`).
- Tự động tính toán khoảng cách an toàn **tối thiểu 84 ngày** (12 tuần) giữa 2 lần hiến máu toàn phần.
- Phân loại trực quan:
  - **Đủ điều kiện hiến tiếp ($\ge 84$ ngày)**: Đánh dấu xanh, sẵn sàng nhận thông báo kêu gọi khi có ca cấp cứu.
  - **Đang trong chu kỳ phục hồi ($< 84$ ngày)**: Đánh dấu vàng, hiển thị thanh % hồi phục sinh học và ngày dự kiến đủ điều kiện hiến tiếp.
- Tích hợp **Hộp thoại cuộc gọi thông minh**: Gọi điện thoại thoại trực tiếp đến Donor qua số điện thoại chuẩn trong database.

### 3. Bàn Tiếp Nhận, Khám Sàng Lọc & Cộng Dồn Kho Máu (FEFO Transaction)
- Bác sĩ kiểm tra sinh hiệu (huyết áp, nhịp tim, cân nặng), xét nghiệm nhanh nhóm máu và xác nhận tiếp nhận máu.
- Khi bấm **"Xác nhận tiếp nhận"**, hệ thống tự động:
  - Chuyển trạng thái lịch hẹn sang `HoanThanh`.
  - Cập nhật nhóm máu chuẩn vào hồ sơ cá nhân của Donor.
  - Cộng dồn thể tích vào Kho máu (`KhoMau`) bằng Sequelize Database Transaction, bảo đảm tính toàn vẹn dữ liệu.

### 4. Quản Lý Kho Máu & Phân Quyền Bảo Mật RBAC
- Quản lý kho theo phương pháp **FEFO** (First Expired, First Out - Túi máu có hạn dùng gần nhất được ưu tiên xuất trước).
- Cảnh báo trực quan ngưỡng thiếu hụt an toàn (Đỏ/Vàng/Xanh) cho 8 nhóm máu: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`.
- **Ma trận bảo mật RBAC**:
  - `ADMIN` & `HOSPITAL_STAFF`: Cho phép xem chi tiết kho máu FEFO và điều phối.
  - `DONOR` & `PUBLIC`: Bị chặn hoàn toàn (Trả về mã lỗi `403 Forbidden`).

### 5. Điều Phối Xe Cứu Thương 115 & Còi Báo Động Đỏ Realtime
- Bệnh viện phát yêu cầu cấp cứu khẩn cấp (`NGUY_CAP` / `RAT_KHAN`).
- WebSocket (Socket.io) tự động kích hoạt còi hú báo động đỏ âm thanh trên toàn hệ thống.
- Bàn điều phối xe 115 kết nối tài xế cấp cứu, hỗ trợ cuộc gọi nhanh qua hotline tài xế và tổng đài 1900 6868 để chuyển máu kịp thời tới phòng mổ.

---

## 5. Kiểm Thử Hệ Thống (Testing & API Docs)

### Unit Tests
Dự án tích hợp bộ kiểm thử tự động kiểm tra các logic y tế cốt lõi:
```bash
# Chạy bộ Unit Tests Backend
pnpm --prefix Backend test
```
*Kết quả:* **6/6 Tests Pass (100%)**:
- Quy tắc ma trận tương thích nhóm máu truyền toàn phần (O- cho tất cả, AB+ nhận tất cả).
- Quy tắc tương thích huyết tương (Plasma).
- Lớp ngoại lệ `AppError` và chuẩn HTTP Status Codes.
- Thuật toán phân trang (Pagination Helpers).
- Cơ chế DTO Validation đầu vào.
- Tính chu kỳ an toàn 84 ngày.

### Tài Liệu API Chuẩn OpenAPI / Swagger
- Truy cập Swagger UI trực tiếp tại: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**
- File đặc tả OpenAPI chuẩn: `docs/openapi.yaml`
