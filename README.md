# SmartBlood - Hệ Thống Điều Phối Hiến Máu Nhân Đạo & Dự Báo Nhu Cầu Khẩn Cấp

> Đồ án môn học (Nhóm 2 người)  
> Công nghệ: React (Vite) + TailwindCSS + Node.js (Express) + Socket.io + SQL Server (2014/2019) + Redis GEO + Leaflet OSM.

---

## 1. Cấu Trúc Toàn Dự Án (`/client`, `/server`, `/database`)

```text
smartblood/
├── client/                      # Frontend Web App (Mobile-first, Responsive)
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Reusable Components (Bo góc 12px, màu #D32F2F)
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── BloodTypeBadge.jsx
│   │   │   ├── features/        # Các Section & Modal nghiệp vụ
│   │   │   │   ├── EmergencyBanner.jsx       # Banner khẩn cấp cuộn ngang realtime
│   │   │   │   ├── Hero.jsx                  # 2 nút CTA chuẩn
│   │   │   │   ├── StatsSection.jsx          # Số liệu thống kê
│   │   │   │   ├── BloodInventorySection.jsx # Kho máu 8 nhóm dạng progress bar
│   │   │   │   ├── UrgentRequestsSection.jsx # Danh sách ca cấp cứu khẩn cấp
│   │   │   │   ├── UrgentRequestCard.jsx     # Card ca cấp cứu tái sử dụng
│   │   │   │   ├── DonationProcessSection.jsx# Quy trình 3 bước
│   │   │   │   ├── EligibilityFaqSection.jsx # Điều kiện hiến & FAQ Accordion
│   │   │   │   ├── QuickRegisterModal.jsx    # Đăng ký online & sinh mã QR
│   │   │   │   └── StaffQrScannerModal.jsx   # Quét QR xem số lần hiến & nhập đơn vị
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx                # Responsive, Role Switcher
│   │   │       └── Footer.jsx                # Hotline, thông tin đồ án
│   │   ├── mock/                # Mock data độc lập (sẵn sàng thay bằng API)
│   │   │   ├── bloodInventory.mock.js
│   │   │   ├── urgentRequests.mock.js
│   │   │   ├── stats.mock.js
│   │   │   ├── events.mock.js
│   │   │   └── faq.mock.js
│   │   ├── services/            # Tầng giao tiếp dữ liệu (Service Layer)
│   │   │   └── bloodService.js  # Chỉ cần đổi USE_MOCK = false là kết nối Backend
│   │   ├── pages/
│   │   │   └── HomePage.jsx     # Trang chủ hoàn chỉnh
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── tailwind.config.js       # Cấu hình màu #D32F2F, bo góc 12px, font Inter
│   └── package.json
│
├── server/                      # Backend API (Node.js + Express + Socket.io)
│   ├── src/
│   │   └── server.js            # Khung API chuẩn khớp 100% với Frontend bloodService
│   ├── .env.example             # Mẫu cấu hình SQL Server, Redis, JWT
│   └── package.json
│
└── database/                    # Cơ sở dữ liệu SQL Server (2014 / 2019)
    └── schema.sql               # Tạo 8 bảng chuẩn hóa quan hệ 1-N, N-N
```

---

## 2. Hướng Dẫn Chạy Thử Giao Diện Frontend (Client)

### Bước 1: Di chuyển vào thư mục client và cài dependencies
```bash
cd client
npm install
```

### Bước 2: Khởi động máy chủ dev (Vite)
```bash
npm run dev
```
Mở trình duyệt truy cập: `http://localhost:5173`

---

## 3. Các Điểm Phối Hợp Quan Trọng Giữa 2 Thành Viên (Frontend & Backend)

### Khớp nối API giữa `bloodService.js` và `server.js`

| Nghiệp vụ | Hàm Frontend (`bloodService.js`) | Endpoint Backend (`server.js`) | Dữ liệu trả về / Yêu cầu |
| :--- | :--- | :--- | :--- |
| **Kho máu 8 nhóm** | `getBloodInventory()` | `GET /api/inventory` | Mảng 8 nhóm máu kèm % và cảnh báo CRITICAL/WARNING/SAFE |
| **Ca cấp cứu khẩn** | `getUrgentRequests()` | `GET /api/urgent-requests` | Danh sách ca cấp cứu, khoảng cách GPS, cờ `isRareBlood` |
| **Số liệu thống kê** | `getSystemStats()` | `GET /api/stats` | Tổng lượt hiến, số bệnh viện, số TNV, ca cấp cứu |
| **Quét mã QR (Y tế)** | `scanDonorQr(token)` | `POST /api/donors/verify-qr` | Trả về: Họ tên, nhóm máu, **số lần đã hiến**, lịch sử chi tiết |
| **Nhập đơn vị máu** | `submitDonationRecord(data)` | `POST /api/donations/record` | Lưu đơn vị máu (250/350/450ml), tăng lượt hiến, cấp mã chứng nhận |
| **Đăng ký hiến máu** | `registerDonation(data)` | `POST /api/donations/register` | Lưu người dùng, sinh mã QR token |
| **Realtime Alert** | `socket.on('new_urgent_request')` | `io.emit('new_urgent_request')` | Bắn thông báo tức thì lên màn hình và thanh Banner cuộn |
