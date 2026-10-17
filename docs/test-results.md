# BÁO CÁO KẾT QUẢ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST REPORT)

- **Dự án**: Hệ thống Điều phối Hiến máu Nhân đạo & Dự báo Nhu cầu Máu Khẩn cấp - Backend API
- **Công nghệ**: Node.js, Express 5, TypeScript (ESM NodeNext), Sequelize 6, SQL Server (MSSQL), Postman Runner
- **Thời gian thực hiện**: 08/10/2026
- **Người thực hiện**: Kỹ sư Backend (Nhóm Backend)

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ (TEST SUMMARY)

| Tổng số ca kiểm thử | Số ca Thành công (PASS) | Số ca Thất bại (FAIL) | Tỷ lệ Đạt (Pass Rate) |
| :---: | :---: | :---: | :---: |
| **9** | **9** | **0** | **100%** |

---

## 2. BẢNG CHI TIẾT CÁC CA KIỂM THỬ (TEST CASES EXECUTION)

| Mã Test | Tên Ca Kiểm Thử | Endpoint / Method | Dữ liệu Đầu Vào & Ràng Buộc | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **T01** | Đăng ký tài khoản Donor mới | `POST /api/v1/auth/register` | Họ tên, email duy nhất, số điện thoại, mật khẩu, nhóm máu A+ | HTTP 201 Created; Trả về user info, không có `matKhauHash` | HTTP 201 Created; Schema chuẩn; `matKhauHash` bị ẩn | **PASS** |
| **T02** | Đăng nhập lấy JWT Access Token | `POST /api/v1/auth/login` | Email + Mật khẩu vừa tạo | HTTP 200 OK; Cấp JWT Token (hạn 1 ngày), lưu vào biến môi trường | HTTP 200 OK; Token hợp lệ dạng Bearer; Lưu tự động vào `donorToken` | **PASS** |
| **T03** | Kiểm tra quy tắc nghiệp vụ 84 ngày | `POST /api/v1/donation-appointments` | Đặt lịch hẹn mới sau lần hiến máu thành công chỉ 10 ngày (< 84 ngày) | HTTP 400 Bad Request; Thông báo rõ lý do chưa đủ khoảng cách 84 ngày | HTTP 400 Bad Request; Message: *"Chưa đủ khoảng cách tối thiểu 84 ngày..."* | **PASS** |
| **T04** | Đặt lịch hẹn hiến máu hợp lệ | `POST /api/v1/donation-appointments` | Tình nguyện viên đủ điều kiện đặt lịch hẹn theo sự kiện (350ml) | HTTP 201 Created; Trạng thái lịch hẹn `ChoXacNhan` | HTTP 201 Created; Tạo lịch hẹn thành công với ID mới | **PASS** |
| **T05** | Cập nhật kết quả hiến máu & Cộng kho | `PUT /api/v1/donation-appointments/:id/status` | Hospital Staff xác nhận `THANH_CONG`, lượng máu 350ml | HTTP 200 OK; Chuyển `HoanThanh`; Tồn kho máu A+ tự động tăng 350ml trong Transaction | HTTP 200 OK; Tồn kho KhoMau tăng chính xác 350ml trong cùng giao dịch | **PASS** |
| **T06** | Bệnh viện tạo yêu cầu máu khẩn cấp | `POST /api/v1/emergency-requests` | Bệnh viện Chợ Rẫy yêu cầu 350ml máu A+, mức độ `RAT_KHAN` | HTTP 201 Created; Trạng thái `DangCho` | HTTP 201 Created; Đơn yêu cầu được lưu vết | **PASS** |
| **T07** | Điều phối xuất kho theo FEFO | `POST /api/v1/emergency-requests/:id/dispatch` | Admin điều phối xuất 350ml máu chi viện khẩn | HTTP 200 OK; Trừ kho máu theo lô cũ nhất; Trạng thái `DaDapUng`; Tạo `DieuPhoiMau` | HTTP 200 OK; Kho máu giảm 350ml; Tạo lệnh vận chuyển `DangGiao` | **PASS** |
| **T08** | Kiểm tra phân quyền (RBAC) | `POST /api/v1/donation-events` | Dùng Token của `DONOR` để gọi API tạo sự kiện (chỉ dành cho `ADMIN`) | HTTP 403 Forbidden; Chặn truy cập trái phép | HTTP 403 Forbidden; Báo lỗi không có quyền truy cập | **PASS** |
| **T09** | Kiểm tra tính bền vững & Toàn vẹn dữ liệu | `GET /api/v1/blood-inventories` | Gọi truy vấn danh sách kho sau khi restart server | HTTP 200 OK; Toàn bộ số lượng sau xuất/nhập được lưu kiên cố trong MSSQL | HTTP 200 OK; Dữ liệu tồn kho chính xác tuyệt đối | **PASS** |

---

## 3. KẾT LUẬN & ĐÁNH GIÁ

1. **Tính Đúng đắn Nghiệp vụ**:
   - Quy tắc 84 ngày (12 tuần) ngăn chặn tuyệt đối các trường hợp hiến máu quá sớm, đảm bảo sức khỏe cho người hiến.
   - Nguyên tắc FEFO xuất các lô máu cũ nhất trước, tối ưu hóa hạn sử dụng sinh học của máu.
2. **Tính Toàn vẹn Dữ liệu**:
   - Mọi hoạt động tăng/giảm kho máu đều được bảo vệ trong **Sequelize Managed Transaction**, không xảy ra tình trạng mất đồng bộ khi có lỗi gián đoạn.
3. **Tính An ninh & Bảo mật**:
   - Hệ thống RBAC hoạt động chính xác, mã hóa mật khẩu 1 lớp an toàn (bcrypt salt round 10), ẩn hoàn toàn chuỗi hash trong toàn bộ các response trả về cho client.
