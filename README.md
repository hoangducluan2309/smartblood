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
│   │   │   ├── admin/               # Tổng quan Dashboard, Quản lý tài khoản, Quản lý kho, Chu kỳ 84 ngày, Điều phối xe 115
│   │   │   ├── staff/               # Bàn tiếp nhận duyệt lịch hẹn, Khám sàng lọc, Phát lệnh cấp cứu
│   │   │   ├── donor/               # Danh sách sự kiện hiến máu (/events), Tra cứu lịch sử hiến cá nhân
│   │   │   └── public/              # Trang chủ (/), Cấp cứu khẩn (/emergency), Bản đồ, Quy trình, FAQ
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

  # Gmail SMTP Configuration (Cấp lại mật khẩu qua OTP 6 số)
  # Đăng nhập Gmail -> Quản lý tài khoản Google -> Bảo mật -> Mật khẩu ứng dụng (App Password)
  EMAIL_USER=your_gmail@gmail.com
  EMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
  EMAIL_FROM="Hệ thống SMARTBLOOD" <your_gmail@gmail.com>
  ```
  *(💡 **Lưu ý**: Nếu chưa cấu hình `EMAIL_USER`/`EMAIL_APP_PASSWORD`, hệ thống sẽ tự động kích hoạt cơ chế Fallback in mã OTP ra Terminal phục vụ chấm đồ án mà không báo lỗi).*
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

### Bước 4: Khởi chạy bằng Docker (Không phụ thuộc môi trường máy cá nhân)

Hệ thống đã được đóng gói sẵn **Docker Multi-Stage & Docker Compose** để triển khai trên bất kỳ máy chủ nào:

```bash
# Khởi chạy toàn bộ hệ thống (Database MSSQL + Backend + Frontend Nginx)
docker compose up -d --build
```
- **Frontend Web UI**: `http://localhost:3000`
- **Backend API & Swagger**: `http://localhost:5000/api-docs`
- **Health Check**: `http://localhost:5000/api/health`

---

## 3. Tài Khoản Thử Nghiệm Chuẩn Database (Demo Accounts)

> 🔑 **Mật khẩu mặc định cho cả 3 tài khoản mẫu trong Database:** **`Password@123`**  
> *(Giao diện Đăng nhập cũng tích hợp sẵn các nút bấm đăng nhập nhanh 1-click cho từng vai trò).*

| Vai trò | Email đăng nhập | Tên người dùng trong DB | Quyền hạn & Chức năng chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (ADMIN)** | `admin@hienmau.vn` | **Quản Trị Viên Hệ Thống** | Toàn quyền hệ thống: Quản lý người dùng, Tạo/Sửa/Xóa sự kiện hiến máu, Quản lý kho máu FEFO, Giám sát chu kỳ hiến máu 84 ngày, Điều phối xe cấp cứu 115. |
| **Bác sĩ / Y tế (HOSPITAL_STAFF)** | `staff.choray@hienmau.vn` | **BS. Trần Thị Mai (BV Chợ Rẫy)** | Tạo/Sửa/Xóa/Tắt thẻ sự kiện hiến máu, Bàn tiếp nhận & duyệt lịch hẹn, Khám sàng lọc, Tự động cộng dồn kho máu, Phát lệnh cấp cứu khẩn cấp, Xem tồn kho FEFO. |
| **Người hiến máu (DONOR)** | `nguyenvanan.donor@gmail.com` | **Nguyễn Văn An** *(Nhóm máu: A+)* | Đã có sẵn lịch sử 5 lần hiến máu thành công + 1 lịch hẹn sắp tới. Theo dõi chu kỳ phục hồi 84 ngày, Giấy chứng nhận điện tử, Đặt lịch tham gia sự kiện. |

---

## 4. Các Tính Năng Nghiệp Vụ Nổi Bật Đã Hoàn Thiện

### 1. Tổng Quan Hệ Thống & Giám Sát Cấp Cứu Toàn Diện (Admin Dashboard)
- **4 Thẻ KPI đồng bộ thời gian thực 100% từ SQL Server**:
  - **Tổng trữ lượng toàn kho**: Số túi và số lít máu đạt chuẩn, đồng bộ trực tiếp từ bảng `KhoMau` (`/api/v1/blood-inventories/summary`).
  - **Ca cấp cứu đang xử lý**: Đồng bộ theo thời gian thực qua Socket.io và bảng `YeuCauMauKhanCap`.
  - **Người hiến đã đăng ký**: Lấy số lượng người hiến máu thực tế từ CSDL (`/api/v1/users?vaiTro=DONOR`), có liên kết chuyển nhanh sang quản lý tài khoản.
  - **Sự kiện hiến máu tháng**: Đếm số chiến dịch đang mở thực tế trong CSDL (`/api/v1/donation-events`), có liên kết chuyển nhanh sang quản lý sự kiện.
- **Giám sát FEFO 8 nhóm máu**: Cảnh báo ngưỡng thiếu hụt an toàn và phân tích rủi ro.
- **Giám sát trực tiếp xe cấp cứu 115**: Theo dõi tiến độ giao máu hỏa tốc và hỗ trợ gọi tài xế tức thời.

### 2. Quản Lý Sự Kiện Hiến Máu & Đồng Bộ Màn Hình Trang Chủ
- **Phân quyền Admin & Bác sĩ (HOSPITAL_STAFF)**: Tạo mới, Chỉnh sửa thông tin, Xóa vĩnh viễn, hoặc Bật/Tắt thẻ sự kiện (kèm ghi chú lý do như *"Đã đủ chỉ tiêu"*, *"Thời tiết xấu"*...).
- **Giao diện thẻ sự kiện chuẩn đẹp**: Nút **"Sửa"** và **"Xóa"** được bố trí cạnh nhau ở đáy thẻ (`grid grid-cols-2`), tự động loại bỏ việc lặp lại tên địa điểm và địa chỉ chi tiết.
- **Đồng bộ thời gian thực ra màn hình Trang chủ**: Mục *"Các Đợt Hiến Máu Sắp Diễn Ra"* trên trang chủ tự động truy vấn từ CSDL SQL Server, hiển thị ngày giờ chuẩn tiếng Việt, thanh tiến độ % chỉ tiêu và nút bấm chuyển thẳng vào modal đăng ký của đúng sự kiện đó thông qua tham số `?id=...`.
- **Bản đồ số Leaflet & Lọc theo Quận Huyện**: Tích hợp chế độ xem Lưới thẻ (Card Grid) và Bản đồ số (Map View) định vị chính xác vị trí tiếp nhận tại TP.HCM (Quận 1, Quận 5, Quận 10, TP. Thủ Đức...).

### 3. Màn Hình Cấp Cứu Khẩn Dành Riêng Cho Người Hiến Máu (`/emergency`)
- **Tập trung cao độ vào các ca đang khẩn cấp**: Danh sách tự động lọc chỉ hiển thị các ca cấp cứu đang cần máu (`!isDismissed`) để Donor và cộng đồng dễ dàng nắm bắt và bấm **"Gọi Cứu Trợ Ngay"**.
- **Loại bỏ các tùy chọn gây nhiễu**: Ẩn hoàn toàn các tab *"Đã tắt / Xong"* và *"Tất cả"* khỏi màn hình công khai.
- **Quyền tắt thẻ của Bác sĩ & Admin**: Bác sĩ và Quản trị viên vẫn có nút bấm tắt thẻ ngay khi ca bệnh tiếp nhận đủ máu để ẩn ngay khỏi danh sách kêu gọi.

### 4. Quản Lý Chu Kỳ An Toàn 84 Ngày (Thông tư 26/2013/TT-BYT)
- Tự động thống kê các Donor đã hoàn thành hiến máu (`trangThai: 'HoanThanh'`).
- Tự động tính toán khoảng cách an toàn **tối thiểu 84 ngày** (12 tuần) giữa 2 lần hiến máu toàn phần.
- Phân loại trực quan:
  - **Đủ điều kiện hiến tiếp ($\ge 84$ ngày)**: Đánh dấu xanh, sẵn sàng nhận thông báo kêu gọi khi có ca cấp cứu.
  - **Đang trong chu kỳ phục hồi ($< 84$ ngày)**: Đánh dấu vàng, hiển thị thanh % hồi phục sinh học và ngày dự kiến đủ điều kiện hiến tiếp.
- Tích hợp **Hộp thoại cuộc gọi thông minh**: Gọi điện thoại thoại trực tiếp đến Donor qua số điện thoại chuẩn trong database.

### 5. Bàn Tiếp Nhận, Khám Sàng Lọc & Cộng Dồn Kho Máu (FEFO Transaction)
- Bác sĩ kiểm tra sinh hiệu (huyết áp, nhịp tim, cân nặng), xét nghiệm nhanh nhóm máu và xác nhận tiếp nhận máu.
- Khi bấm **"Xác nhận tiếp nhận"**, hệ thống tự động:
  - Chuyển trạng thái lịch hẹn sang `HoanThanh`.
  - Cập nhật nhóm máu chuẩn vào hồ sơ cá nhân của Donor.
  - Cộng dồn thể tích vào Kho máu (`KhoMau`) bằng Sequelize Database Transaction, bảo đảm tính toàn vẹn dữ liệu.

### 6. Quản Lý Kho Máu & Phân Quyền Bảo Mật RBAC
- Quản lý kho theo phương pháp **FEFO** (First Expired, First Out - Túi máu có hạn dùng gần nhất được ưu tiên xuất trước).
- Cảnh báo trực quan ngưỡng thiếu hụt an toàn (Đỏ/Vàng/Xanh) cho 8 nhóm máu: `A+`, `A-`, `B+`, `B-`, `O+`, `O-`, `AB+`, `AB-`.
- **Ma trận bảo mật RBAC**:
  - `ADMIN` & `HOSPITAL_STAFF`: Cho phép xem chi tiết kho máu FEFO và điều phối.
  - `DONOR` & `PUBLIC`: Bị chặn hoàn toàn (Trả về mã lỗi `403 Forbidden`).

### 7. Điều Phối Xe Cứu Thương 115 & Còi Báo Động Đỏ Realtime
- Bệnh viện phát yêu cầu cấp cứu khẩn cấp (`NGUY_CAP` / `RAT_KHAN`).
- WebSocket (Socket.io) tự động kích hoạt còi hú báo động đỏ âm thanh trên toàn hệ thống.
- Bàn điều phối xe 115 kết nối tài xế cấp cứu, hỗ trợ cuộc gọi nhanh qua hotline tài xế và tổng đài 1900 6868 để chuyển máu kịp thời tới phòng mổ.

### 8. An Ninh Đăng Nhập & Cơ Chế Khóa Tài Khoản 2 Giai Đoạn (Brute-Force Protection)
- **Sai mật khẩu không cấp JWT**: Mọi yêu cầu đăng nhập sai mật khẩu hoặc tài khoản không tồn tại đều trả về lỗi `401 Unauthorized`, tuyệt đối **không cấp JWT Token**.
- **Cơ chế Khóa 2 Giai đoạn Độc quyền**:
  - **Giai đoạn 1 (Tạm khóa 3 phút)**: Nhập sai mật khẩu liên tiếp **5 lần**, hệ thống kích hoạt cơ chế tạm khóa tài khoản trong **3 phút**, có đồng hồ đếm ngược từng giây.
  - **Giai đoạn 2 (Khóa luôn vào CSDL)**: Sau khi hết 3 phút tạm khóa, nếu người dùng tiếp tục nhập sai **3 lần nữa**, hệ thống sẽ **khóa luôn tài khoản vĩnh viễn** trực tiếp trong CSDL (`user.trangThai = 'Khoa'`). Mọi nỗ lực đăng nhập sau đó đều bị chặn với mã lỗi `403 Forbidden`.
  - **Chỉ Admin mới có quyền mở lại**: Tài khoản bị khóa chỉ có thể được mở lại bởi tài khoản Quản trị viên (Admin).
- **Đồng bộ thời gian thực vào Trang Quản Lý Tài Khoản Admin**:
  - Huy hiệu trạng thái phân biệt rõ ràng:
    - 🔴 **Bị Khóa (Chờ Admin mở)**: Dành cho tài khoản bị khóa vĩnh viễn trong CSDL.
    - 🟡 **Tạm Khóa 3p (Còn Xp Ys)**: Dành cho tài khoản đang trong chu kỳ 3 phút tạm khóa.
    - 🟢 **Hoạt Động**: Tài khoản hoạt động bình thường, kèm cảnh báo số lần nhập sai nếu có.
  - Nút **Mở khóa nhanh (`Unlock`)**: Cho phép Admin mở khóa tài khoản ngay lập tức cho người dùng mà không cần chờ hết thời gian.
### 9. Quên Mật Khẩu & Cấp Lại Qua Mã OTP Gmail Thực Tế (Gmail SMTP & Glassmorphism Modal)
- **Tích hợp Google Gmail SMTP thực tế (`nodemailer`)**: Gửi email HTML thương hiệu SMARTBLOOD chuẩn y tế đến hộp thư của người dùng với mã xác thực OTP 6 số ngẫu nhiên.
- **Quy tắc an toàn & Chống lạm dụng**:
  - Mã OTP có hiệu lực chính xác trong **5 phút (300 giây)**.
  - Bộ đếm thời gian chờ gửi lại (Cooldown) **60 giây** để chống spam hòm thư.
  - Giới hạn thử sai **tối đa 5 lần** (vượt quá 5 lần mã tự động hủy ngay để triệt tiêu nguy cơ Brute-force).
- **Giao diện Modal 2 bước cao cấp**:
  - **Bước 1**: Nhập email $\rightarrow$ Bấm *"GỬI MÃ OTP QUA GMAIL"*.
  - **Bước 2**: Hiển thị email nhận mã, đồng hồ đếm ngược `5:00`, ô nhập 6 chữ số cỡ lớn, 2 ô mật khẩu mới (tối thiểu 8 ký tự, có toggle ẩn/hiện mắt), nút gửi lại mã có cooldown.
  - **Trải nghiệm phím tắt thông minh**: Hỗ trợ nhấn phím **`Esc` (Escape)** hoặc click ra ngoài vùng nền mờ (Backdrop click) để lập tức đóng modal và quay về form Đăng nhập mà không bị thoát ra Trang chủ.
- **Tự động mở khóa & Phục hồi tài khoản**: Sau khi người dùng xác thực OTP và đổi mật khẩu thành công, hệ thống tự động băm mật khẩu mới bằng **Bcrypt 10 vòng**, mở khóa tài khoản nếu đang bị tạm khóa và reset toàn bộ lượt vi phạm để người dùng đăng nhập lại ngay lập tức.
- **Cơ chế Fallback Console**: Tự động in mã OTP ra Terminal/Console khi chưa cấu hình `EMAIL_APP_PASSWORD`, đảm bảo đồ án chạy mượt mà trên mọi máy chấm điểm.

---

## 5. Kiểm Thử Hệ Thống (Testing & API Docs)

### 1. Unit Tests (Logic Cốt Lõi)
Dự án tích hợp bộ kiểm thử tự động kiểm tra các logic y tế cốt lõi:
```bash
# Chạy bộ Unit Tests Backend
pnpm --prefix Backend test
```
*Kết quả:* **7/7 Tests Pass (100%)**:
- **Test 1:** Quy tắc ma trận tương thích nhóm máu truyền toàn phần (O- cho tất cả, AB+ nhận tất cả).
- **Test 2:** Quy tắc tương thích huyết tương (Plasma).
- **Test 3:** Lớp ngoại lệ `AppError` và chuẩn HTTP Status Codes.
- **Test 4:** Thuật toán phân trang (Pagination Helpers).
- **Test 5:** Cơ chế DTO Validation đầu vào.
- **Test 6:** Quy tắc khoảng cách an toàn 84 ngày giữa 2 lần hiến máu.
- **Test 7:** Cơ chế LoginLimiter 2 giai đoạn (Tạm khóa 3 phút sau 5 lần sai, và khóa luôn sau 3 lần sai nữa).

### 2. End-to-End Tests (E2E Integration Tests)
Bộ kiểm thử tích hợp toàn diện 19 kịch bản vận hành thực tế qua HTTP Client trực tiếp:
```bash
# Chạy bộ kiểm thử E2E
pnpm test:e2e
```
*Kết quả:* **19/19 Ca kiểm thử E2E Đạt Chuẩn (100% PASS)**:
- Kiểm tra toàn diện vòng đời: Health Check (T00), Đăng ký (T01), Đăng nhập RBAC (T02), Chặn vi phạm chu kỳ 84 ngày (T03), Đặt lịch hiến máu (T04), Xác nhận tiếp nhận cộng kho FEFO (T05), Phát lệnh cấp cứu (T06), Điều phối xuất kho FEFO gán xe 115 (T07), Phân quyền an ninh RBAC (T08), Quản lý sự kiện hiến máu (T09), Đồng bộ Trang chủ (T10), Danh sách cấp cứu công khai (T11), Toàn vẹn CSDL Kho Máu (T12), Đăng nhập sai mật khẩu 401 không cấp JWT (T13), **Tự động khóa 2 giai đoạn 3 phút & Khóa luôn CSDL (T14)**, Tài khoản không tồn tại (T15), Chống spam đăng ký mảng (T16), **Quên mật khẩu gửi OTP Gmail thực tế & Chặn email sai (T17)**, và **Xác thực OTP đặt lại mật khẩu mới an toàn (T18)**.
- Báo cáo chi tiết xem tại: [`docs/test-results.md`](file:///c:/smartblood/docs/test-results.md)

### 3. Tài Liệu API Chuẩn OpenAPI / Swagger
- Truy cập Swagger UI trực tiếp tại: **[http://localhost:5000/api-docs](http://localhost:5000/api-docs)**
- File đặc tả OpenAPI chuẩn: `docs/openapi.yaml`

