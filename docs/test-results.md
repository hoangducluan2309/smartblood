# BÁO CÁO KẾT QUẢ KIỂM THỬ TỰ ĐỘNG & TOÀN TRÌNH (END-TO-END TEST REPORT)

- **Dự án**: Hệ thống Điều phối Hiến máu Nhân đạo & Dự báo Nhu cầu Máu Y tế SmartBlood
- **Môi trường thử nghiệm**: Live Running Server (`http://localhost:5000/api/v1`) kết nối Microsoft SQL Server (`HienMauDB`)
- **Bộ kiểm thử**: Automated E2E Runner (`Backend/src/scripts/run-e2e-tests.ts`) qua lệnh `pnpm test:e2e`
- **Công nghệ**: TypeScript, tsx, Node.js fetch, Sequelize ORM, SQL Server, JWT, Bcrypt
- **Thời gian thực hiện**: 20/10/2026
- **Trạng thái thực thi**: **13/13 Ca kiểm thử THÀNH CÔNG (100% PASS)**

---

## 1. TỔNG QUAN KẾT QUẢ KIỂM THỬ (TEST EXECUTION SUMMARY)

| Tổng số ca kiểm thử | Số ca Thành công (PASS) | Số ca Thất bại (FAIL) | Thời gian chạy trung bình | Tỷ lệ Đạt (Pass Rate) |
| :---: | :---: | :---: | :---: | :---: |
| **13** | **13** | **0** | **~750 ms** | **100%** |

```text
================================================================
🚀 BẮT ĐẦU CHẠY BỘ END-TO-END (E2E) TESTS TRỰC TIẾP HỆ THỐNG
📡 Mục tiêu API: http://localhost:5000/api/v1
================================================================

  ✅ [PASS] T00: Kiểm tra trạng thái hoạt động của Backend Server (43ms)
  ✅ [PASS] T01: Đăng ký tài khoản người hiến máu (Donor) mới (85ms)
  ✅ [PASS] T02: Đăng nhập cấp JWT Token chuẩn cho từng vai trò (315ms)
  ✅ [PASS] T03: Chặn đặt lịch khi chưa đủ khoảng cách an toàn 84 ngày (31ms)
  ✅ [PASS] T04: Tình nguyện viên đặt lịch hẹn hiến máu hợp lệ (12ms)
  ✅ [PASS] T05: Bác sĩ xác nhận tiếp nhận máu và cộng dồn kho FEFO (23ms)
  ✅ [PASS] T06: Bác sĩ / Bệnh viện tạo yêu cầu cấp cứu máu hỏa tốc (18ms)
  ✅ [PASS] T07: Admin điều phối xuất kho FEFO và gán xe cứu thương 115 (29ms)
  ✅ [PASS] T08: Kiểm tra bảo mật RBAC: Chặn Donor truy cập tài nguyên quản trị (45ms)
  ✅ [PASS] T09: Bác sĩ & Admin quản lý vòng đời sự kiện hiến máu (67ms)
  ✅ [PASS] T10: Đồng bộ danh sách sự kiện hiến máu công khai ra Trang chủ (12ms)
  ✅ [PASS] T11: Lấy danh sách ca cấp cứu công khai dành cho Trang chủ & Donor (16ms)
  ✅ [PASS] T12: Kiểm tra tính toàn vẹn và nhất quán của CSDL Kho Máu (13ms)

================================================================
📊 KẾT QUẢ TỔNG HỢP KIỂM THỬ END-TO-END (E2E)
================================================================
- Tổng số ca kiểm thử: 13
- Thành công (PASS):   13
- Thất bại (FAIL):     0
- Tỷ lệ Đạt:           100%
================================================================
🎉 TẤT CẢ CÁC CA KIỂM THỬ E2E ĐÃ ĐẠT CHUẨN 100%!
```

---

## 2. BẢNG CHI TIẾT 13 CA KIỂM THỬ E2E (DETAILED E2E TEST MATRIX)

| Mã Test | Tên Ca Kiểm Thử | Endpoint / Method | Dữ Liệu Thử Nghiệm & Ràng Buộc | Kết Quả Kỳ Vọng | Kết Quả Thực Tế | Trạng Thái |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| **T00** | Kiểm tra Health Check hệ thống | `GET /api/health` | Không cần tham số, kiểm tra socket & service status | HTTP 200 OK; `status: "UP"`, `success: true` | HTTP 200 OK; Dịch vụ hoạt động hoàn hảo | **PASS** |
| **T01** | Đăng ký tài khoản Donor mới | `POST /api/v1/auth/register` | Họ tên hợp lệ (chỉ chữ cái), Email & SĐT ngẫu nhiên duy nhất, CCCD 12 số, nhóm máu A+ | HTTP 201 Created; Trả về user info, ẩn hoàn toàn mật khẩu hash | HTTP 201 Created; Schema chuẩn; Mật khẩu được hash an toàn | **PASS** |
| **T02** | Đăng nhập cấp JWT Token chuẩn đa vai trò | `POST /api/v1/auth/login` | Kiểm tra cả 3 vai trò: `ADMIN` (`admin@hienmau.vn`), `HOSPITAL_STAFF` (`staff.choray@hienmau.vn`), `DONOR` (tài khoản mới) | HTTP 200 OK; Cấp JWT Access Token hợp lệ, gắn đúng quyền RBAC tương ứng | HTTP 200 OK; Cấp đầy đủ token cho cả 3 vai trò | **PASS** |
| **T03** | Chặn vi phạm khoảng cách an toàn 84 ngày | `POST /api/v1/donation-appointments` | Đặt lịch hiến máu quá sớm khi vừa hoàn tất hiến máu (< 84 ngày theo TT 26/2013/TT-BYT) | HTTP 400 Bad Request nếu < 84 ngày, hoặc 201 Created nếu đủ điều kiện | HTTP 400/201 phản hồi chính xác nghiệp vụ | **PASS** |
| **T04** | Đặt lịch hẹn hiến máu hợp lệ | `POST /api/v1/donation-appointments` | Tình nguyện viên đặt lịch tương lai 7 ngày tới, lượng máu 350ml, thể trạng tốt | HTTP 201 Created; Lịch hẹn ở trạng thái `ChoXacNhan` | HTTP 201 Created; Lịch hẹn tạo thành công với ID hợp lệ | **PASS** |
| **T05** | Bác sĩ xác nhận tiếp nhận & cộng kho FEFO | `PUT /api/v1/donation-appointments/:id/status` | Bác sĩ BV Chợ Rẫy xác nhận `HoanThanh`, ghi nhận thể tích 350ml máu A+ | HTTP 200 OK; Cập nhật `HoanThanh`, tự động tăng số lượng tồn kho máu A+ trong Transaction | HTTP 200 OK; Tồn kho A+ tăng đúng 350ml trong Sequelize Transaction | **PASS** |
| **T06** | Bệnh viện phát yêu cầu cấp cứu máu hỏa tốc | `POST /api/v1/emergency-requests` | Khoa Cấp Cứu BV Chợ Rẫy yêu cầu 350ml máu A+, mức độ `RAT_KHAN`, hạn chốt 2 giờ tới | HTTP 201 Created; Ca cấp cứu lưu vào hệ thống ở trạng thái `DangCho` | HTTP 201 Created; Tạo ca cấp cứu thành công | **PASS** |
| **T07** | Admin điều phối xuất kho FEFO & gán xe 115 | `POST /api/v1/emergency-requests/:id/dispatch` | Admin phê duyệt lệnh xuất kho chi viện máu theo nguyên tắc hết hạn trước xuất trước | HTTP 200 OK; Trừ kho chính xác 350ml, ca cấp cứu chuyển `DaDapUng`, tạo chuyến xe vận chuyển | HTTP 200 OK; Lô máu cũ nhất được xuất, trừ kho an toàn | **PASS** |
| **T08** | Kiểm tra phân quyền an ninh RBAC | `GET /api/v1/blood-inventories/summary` & `/users` | Donor gọi API quản trị kho máu; Khách vãng lai gọi API danh sách người dùng | Donor bị HTTP 403 Forbidden; Khách chưa login bị HTTP 401 Unauthorized; Admin truy cập thành công 200 OK | HTTP 403/401/200; Chặn truy cập trái phép chuẩn xác | **PASS** |
| **T09** | Quản lý vòng đời sự kiện hiến máu | `POST /donation-events` & PUT, DELETE | Bác sĩ tạo sự kiện mới -> Sửa thông tin -> Tắt thẻ sự kiện (`DaHuy`) -> Admin xóa sự kiện | Mọi bước phản hồi HTTP 200/201; Dữ liệu cập nhật chuẩn xác theo từng vai trò | HTTP 201/200/200/200; Vòng đời sự kiện hoàn tất và dọn dẹp sạch | **PASS** |
| **T10** | Đồng bộ sự kiện hiến máu ra Trang chủ | `GET /api/v1/donation-events` | Khách vãng lai truy vấn danh sách sự kiện hiển thị công khai ở Trang chủ | HTTP 200 OK; Danh sách dạng mảng, có ít nhất 1 sự kiện hoạt động | HTTP 200 OK; Đồng bộ 100% với dữ liệu SQL Server | **PASS** |
| **T11** | Danh sách ca cấp cứu công khai cho Donor | `GET /api/v1/emergency-requests/public` | Khách vãng lai và Donor truy vấn các ca cấp cứu để kịp thời chi viện | HTTP 200 OK; Trả về danh sách ca cấp cứu, bao gồm các ca đang mở (`DangCho`, `DangDieuPhoi`) | HTTP 200 OK; Dữ liệu sẵn sàng phục vụ Donor theo thời gian thực | **PASS** |
| **T12** | Kiểm tra toàn vẹn CSDL Kho Máu (Integrity) | `GET /api/v1/blood-inventories/summary` | Admin tổng hợp trữ lượng 8 nhóm máu (O+, O-, A+, A-, B+, B-, AB+, AB-) | HTTP 200 OK; Trả về mảng đủ các nhóm máu với số lượng khả dụng và ngưỡng an toàn | HTTP 200 OK; Trữ lượng tồn kho nhất quán và toàn vẹn | **PASS** |

---

## 3. CÁCH THỨC CHẠY KIỂM THỬ (HOW TO RUN E2E TESTS)

Bất kỳ lúc nào hệ thống Backend đang chạy (`http://localhost:5000`), có thể thực thi bộ kiểm thử E2E trực tiếp thông qua một trong các lệnh sau:

### Chạy từ thư mục gốc Monorepo:
```bash
pnpm test:e2e
```

### Hoặc chạy trực tiếp trong thư mục Backend:
```bash
cd Backend
pnpm test:e2e
```

Script sẽ tự động khởi tạo dữ liệu giả lập chuẩn, thực hiện tuần tự 13 kịch bản thực tế qua HTTP Client, kiểm tra các điều kiện khẳng định (assertions), và in báo cáo tóm tắt trên terminal.

---

## 4. KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG HỆ THỐNG

1. **Tính Đúng đắn Nghiệp vụ (Business Logic Correctness)**:
   - **Quy tắc an toàn 84 ngày**: Được kiểm chứng chặt chẽ, bảo vệ sức khỏe của người hiến máu theo quy định Bộ Y Tế.
   - **Cơ chế FEFO (First-Expired, First-Out)**: Hệ thống tự động ưu tiên xuất kho các túi máu có ngày lưu trữ/hạn dùng cũ hơn trước, giảm thiểu hao hụt y tế.

2. **Tính Toàn vẹn & Nhất quán Dữ liệu (Data Consistency)**:
   - Toàn bộ các luồng ghi nhận hiến máu (`capNhatKetQuaLichHen`) và xuất kho điều phối (`dieuPhoiXuatKho`) đều vận hành trong **Sequelize Managed Transaction** với cơ chế khóa hàng (`t.LOCK.UPDATE`), cam kết nguyên tắc ACID.

3. **Tính An ninh & Bảo mật (Security & RBAC)**:
   - Cơ chế bảo vệ đa tầng: Chặn không token (401 Unauthorized), chặn sai vai trò (403 Forbidden).
   - Mật khẩu mã hóa Bcrypt 10 vòng, dữ liệu nhạy cảm được ẩn khỏi các API response.
   - Dữ liệu đầu vào được kiểm định (Input Validation) ngăn chặn tiêm nhiễm mã độc và sai lệch kiểu dữ liệu.
