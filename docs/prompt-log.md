# NHẬT KÝ PROMPT VÀ TIẾN TRÌNH PHÁT TRIỂN HỆ THỐNG BACKEND
**Đề tài:** Hệ thống Điều phối Hiến máu Nhân đạo & Dự báo Nhu cầu Máu Khẩn cấp (**BloodSmart**)  
**Học phần:** Đồ án Backend / Lập trình Web Nâng Cao  
**Sinh viên thực hiện:** Kỹ sư Backend  
**Công cụ cộng tác AI:** Google Antigravity (Advanced Agentic AI Pair Programmer)  
**Môi trường & Công nghệ:** Node.js, Express.js 5, TypeScript (ESM NodeNext), Sequelize ORM, Microsoft SQL Server (MSSQL), OpenAPI 3.0, Swagger UI, Postman.

---

## MỤC LỤC CÁC BƯỚC PROMPT (SDLC PROMPT SEQUENCE)

1. [Prompt 1: Khởi tạo kiến trúc dự án Express 5, TypeScript ESM & Schema CSDL MSSQL](#prompt-1)
2. [Prompt 2: Cấu hình Sequelize ORM, Middleware Pipeline & Xử lý lỗi tập trung](#prompt-2)
3. [Prompt 3: Xây dựng Module Authentication & Phân quyền RBAC 3 cấp](#prompt-3)
4. [Prompt 4: Module Quản lý Sự kiện & Đặt lịch hẹn hiến máu (Quy tắc giãn cách 84 ngày)](#prompt-4)
5. [Prompt 5: Module Kho máu, Thuật toán FEFO & Ma trận tương thích truyền máu (ACID Transaction)](#prompt-5)
6. [Prompt 6: Module Dự báo nguy cơ thiếu hụt máu & Gợi ý Donor khẩn cấp](#prompt-6)
7. [Prompt 7: Module Quản lý Người dùng (Users CRUD) & Điều phối xe cứu thương 115](#prompt-7)
8. [Prompt 8: Xây dựng bộ Unit Tests tự động bằng TypeScript (100% PASS)](#prompt-8)
9. [Prompt 9: Đặc tả toàn bộ 28 routes bằng OpenAPI 3.0.3 & Swagger UI tại /api-docs](#prompt-9)
10. [Prompt 10: Xây dựng kịch bản kiểm thử tự động trên Postman Collection (T01 - T09)](#prompt-10)

---

<a name="prompt-1"></a>
### PROMPT 1: KHỞI TẠO KIẾN TRÚC DỰ ÁN EXPRESS 5, TYPESCRIPT ESM & SCHEMA CSDL MSSQL

**Mục tiêu:** Thiết lập nền tảng dự án chuẩn hiện đại, type-safe và khởi tạo toàn bộ CSDL quan hệ trên Microsoft SQL Server.

**Nội dung Prompt:**
```text
Bạn là một Senior Backend Architect. Hãy giúp tôi khởi tạo dự án Backend cho hệ thống Điều phối Hiến máu Nhân đạo (BloodSmart):
1. Cấu hình package.json với type: "module" (ESM), cài đặt Express 5, TypeScript 5.7, @types/node, tsx để chạy dev hot-reload.
2. Cấu hình tsconfig.json theo chuẩn target ES2022, module NodeNext, strict: true.
3. Thiết kế CSDL Microsoft SQL Server (MSSQL) lưu trữ đầy đủ nghiệp vụ y tế với 6 bảng:
   - NguoiDung (id, hoTen, email, matKhau, soDienThoai, cccd, nhomMau, yeuToRh, vaiTro [ADMIN, HOSPITAL_STAFF, DONOR], trangThai).
   - SuKienHienMau (id, tenSuKien, diaDiem, thoiGianBatDau, thoiGianKetThuc, chiTieuMl, trangThai).
   - LichHenHienMau (id, nguoiHienId, suKienId, ngayHen, khungGio, luongMauHienMl, tinhTrangSucKhoe, trangThai).
   - KhoMau (id, maTuiMau, nhomMau, thanhPhan, soLuongConLaiMl, nguongCanhBaoMl, donViLuuTru, ngaySanXuat, hanSuDung).
   - YeuCauMauKhanCap (id, benhVienYeuCau, nguoiDaiDienId, nhomMauCan, thanhPhanCan, soLuongCanMl, mucDoKhanCap, lyDo, hanChot, trangThai).
   - DieuPhoiMau (id, yeuCauId, khoMauId, nguoiDieuPhoiId, soLuongXuatMl, trangThaiVanChuyen, donViVanChuyen, thoiGianXuat).
4. Viết các script SQL tạo bảng (01-init-schema.sql) hỗ trợ tiếng Việt có dấu Unicode (NVARCHAR), script nạp dữ liệu mẫu (02-seed-data.sql) và script tạo user ứng dụng theo nguyên tắc Least Privilege (03-app-user.sql).
```
**Kết quả đạt được:**
- Khởi tạo thành công thư mục mã nguồn chuẩn TypeScript ESM.
- 3 script SQL chạy thành công trên SQL Server mà không gặp lỗi Collation hay Password Policy.

---

<a name="prompt-2"></a>
### PROMPT 2: CẤU HÌNH SEQUELIZE ORM, MIDDLEWARE PIPELINE & XỬ LÝ LỖI TẬP TRUNG

**Mục tiêu:** Kết nối CSDL SQL Server thông qua Sequelize và xây dựng hệ thống xử lý lỗi tập trung, không để lộ thông tin nhạy cảm.

**Nội dung Prompt:**
```text
Tiếp tục dự án Backend BloodSmart:
1. Hãy tạo file src/config/database.ts kết nối SQL Server thông qua Sequelize ORM và driver tedious, đọc biến môi trường từ .env.
2. Thiết kế lớp xử lý lỗi AppError kế thừa Error tại src/utils/AppError.ts phân biệt rõ:
   - Operational Error (lỗi nghiệp vụ dự kiến: 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 409 Conflict).
   - Programmer Error (lỗi hệ thống không mong muốn: 500).
3. Viết error.middleware.ts bắt toàn bộ lỗi tập trung, định dạng phản hồi chuẩn:
   { success: false, message: string, data: null }, giấu stack trace khi ở chế độ Production.
4. Cấu hình pipeline middleware trong src/server.ts theo thứ tự chuẩn: helmet -> cors -> express.json -> loggerMiddleware -> routes -> 404 handler -> errorMiddleware.
```
**Kết quả đạt được:**
- Server kết nối ổn định tới SQL Server.
- Mọi ngoại lệ runtime được bắt tại một nơi duy nhất, response luôn có cấu trúc đồng nhất.

---

<a name="prompt-3"></a>
### PROMPT 3: MODULE AUTHENTICATION & PHÂN QUYỀN RBAC 3 CẤP

**Mục tiêu:** Bảo mật hệ thống với xác thực JWT và phân quyền theo 3 vai trò (ADMIN, HOSPITAL_STAFF, DONOR).

**Nội dung Prompt:**
```text
Hãy xây dựng phân hệ Xác thực và Phân quyền (Auth & RBAC) cho hệ thống BloodSmart:
1. Tạo Model NguoiDung bằng Sequelize với đầy đủ kiểu dữ liệu, ràng buộc Unique cho email/cccd, và override toJSON() để không bao giờ để lộ trường matKhauHash.
2. Viết tiện ích password.util.ts băm và kiểm tra mật khẩu bằng bcryptjs (salt rounds = 10).
3. Viết auth.service.ts và auth.controller.ts xử lý:
   - Đăng ký tài khoản (hỗ trợ nhập nhóm máu, CCCD, số điện thoại, mặc định vai trò DONOR).
   - Đăng nhập (hỗ trợ đăng nhập linh hoạt bằng Email, Số điện thoại hoặc CCCD; cấp JWT Token có thời hạn).
   - Lấy thông tin tài khoản hiện tại (GET /api/v1/auth/profile).
4. Viết auth.middleware.ts gồm:
   - xacThucToken: giải mã Bearer Token từ Authorization header, gán req.user.
   - phanQuyen(...roles): chặn người dùng không có quyền tương ứng và trả về 403 Forbidden.
5. Viết validate.middleware.ts kiểm tra tính hợp lệ của email, số điện thoại Việt Nam, độ dài mật khẩu >= 6 ký tự.
```
**Kết quả đạt được:**
- Endpoint `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/profile`.
- Bảo mật tuyệt đối mật khẩu người dùng, hỗ trợ xác thực đa định danh (Email/SĐT/CCCD).

---

<a name="prompt-4"></a>
### PROMPT 4: MODULE QUẢN LÝ SỰ KIỆN & ĐẶT LỊCH HẸN (QUY TẮC Y TẾ 84 NGÀY)

**Mục tiêu:** Hiện thực hóa quy định y tế của Bộ Y Tế về khoảng cách hiến máu tối thiểu 84 ngày giữa các lần hiến.

**Nội dung Prompt:**
```text
Hãy xây dựng phân hệ Quản lý Sự kiện & Đặt lịch hẹn hiến máu:
1. Tạo Model SuKienHienMau và LichHenHienMau, khai báo quan hệ 1-N giữa NguoiDung, SuKienHienMau và LichHenHienMau.
2. Xây dựng donation.service.ts và donation.controller.ts:
   - Sự kiện: CRUD sự kiện hiến máu (Chỉ ADMIN được thêm/sửa/xóa/đổi trạng thái). Hỗ trợ tìm kiếm, lọc theo ngày và phân trang.
   - Đặt lịch hẹn: DONOR đăng ký lịch hẹn theo khung giờ sáng/chiều.
   - QUY TẮC Y TẾ BẮT BUỘC: Khi DONOR đặt lịch, hệ thống phải tra cứu lần hiến máu thành công gần nhất (trangThai = 'HoanThanh'). Nếu khoảng cách từ lần hiến trước đến ngày hẹn mới < 84 ngày (12 tuần), từ chối ngay với mã lỗi 400 và thông báo rõ số ngày còn lại phải chờ.
   - Cập nhật kết quả hiến máu: Nhân viên y tế/Admin cập nhật trạng thái kết quả. Nếu thành công, tự động cộng số lượng máu vào bảng KhoMau trong một Sequelize Database Transaction.
   - Lịch sử hiến máu cá nhân: DONOR tra cứu lịch sử, số chứng nhận điện tử và mã QR.
```
**Kết quả đạt được:**
- Đảm bảo an toàn sinh học y tế, ngăn ngừa hiến máu quá dày gây thiếu máu cho người hiến.
- Tự động hóa liên kết giữa lịch hẹn thành công và số lượng tồn kho.

---

<a name="prompt-5"></a>
### PROMPT 5: MODULE KHO MÁU, THUẬT TOÁN FEFO & MA TRẬN NHÓM MÁU (ACID TRANSACTION)

**Mục tiêu:** Cài đặt thuật toán xuất kho theo hạn dùng FEFO kết hợp ma trận tương thích truyền máu và khóa dòng chống xung đột.

**Nội dung Prompt:**
```text
Hãy xây dựng phân hệ Quản lý Kho Máu và Điều phối Cấp cứu Khẩn cấp:
1. Viết tiện ích bloodCompatibility.util.ts định nghĩa ma trận tương thích nhóm máu y học:
   - Máu toàn phần / Khối hồng cầu: O- cho được tất cả; AB+ nhận được tất cả.
   - Huyết tương (Plasma): AB cho được tất cả; O nhận được tất cả.
2. Xây dựng chức năng Bệnh viện tạo yêu cầu máu khẩn cấp (mức độ từ TRUNG_BINH đến NGUY_CAP, giờ G cần máu).
3. Xây dựng thuật toán Điều phối xuất kho chi viện khẩn cấp (emergency.service.ts):
   - Nhận yêu cầu -> tra cứu danh sách nhóm máu tương thích.
   - Tìm các túi máu có sẵn trong kho theo chiến lược FEFO (First-Expired, First-Out: ưu tiên lô có hạn dùng gần nhất).
   - Kiểm tra trữ lượng: nếu tổng máu tương thích < số lượng cần, quăng lỗi 400 kèm chi tiết thể tích thiếu hụt.
   - Nếu đủ máu: trừ kho và tạo các bản ghi DieuPhoiMau chi tiết (ghi nhận đơn vị vận chuyển, biển số xe 115, tài xế).
   - ĐẶC BIỆT: Toàn bộ quá trình phải bọc trong sequelize.transaction() với mức khóa dòng lock: t.LOCK.UPDATE để chống hiện tượng Race Condition gây âm kho khi nhiều bác sĩ điều phối đồng thời.
```
**Kết quả đạt được:**
- Xuất kho chuẩn y tế FEFO, tối ưu hóa thời hạn bảo quản chế phẩm máu.
- Bảo toàn dữ liệu 100% nhờ giao dịch nguyên tử (ACID).

---

<a name="prompt-6"></a>
### PROMPT 6: MODULE DỰ BÁO NGUY CƠ THIẾU HỤT MÁU & GỢI Ý DONOR KHẨN CẤP

**Mục tiêu:** Xây dựng hệ thống cảnh báo sớm rủi ro kho máu và tự động tìm kiếm lực lượng hiến máu chi viện.

**Nội dung Prompt:**
```text
Hãy xây dựng phân hệ Dự báo & Cảnh báo sớm (forecast.service.ts, forecast.controller.ts):
1. API Phân tích nguy cơ thiếu hụt máu toàn hệ thống (GET /api/v1/forecasts/shortage-risk):
   - Đối chiếu giữa Tồn kho hiện tại, Ngưỡng cảnh báo an toàn và Nhu cầu cấp cứu đang chờ theo 8 nhóm máu.
   - Phân loại rủi ro thành 3 mức: AN_TOAN, NGUY_CO_THIEU, THIEU_NGHIEM_TRONG.
   - Trả về khuyến nghị hành động cụ thể cho ban điều phối.
2. API Tìm kiếm tình nguyện viên khẩn cấp (GET /api/v1/forecasts/urgent-donors):
   - Đầu vào là nhóm máu bệnh viện đang cần gấp (ví dụ: 'A+').
   - Hệ thống tự động tra ma trận nhóm máu tương thích (ví dụ: A+, A-, O+, O-).
   - Quét tìm các DONOR có trạng thái hoạt động, đã đủ khoảng cách >= 84 ngày kể từ lần hiến trước (hoặc chưa từng hiến).
   - Sắp xếp ưu tiên người có khoảng cách hiến lâu nhất lên đầu để liên hệ kích hoạt hiến máu khẩn cấp.
```
**Kết quả đạt được:**
- Hỗ trợ bệnh viện chủ động nguồn máu thay vì bị động chờ người hiến.
- Tự động hóa khâu rà soát danh sách tình nguyện viên sẵn sàng hiến máu.

---

<a name="prompt-7"></a>
### PROMPT 7: MODULE QUẢN LÝ NGƯỜI DÙNG & ĐIỀU PHỐI XE CỨU THƯƠNG 115

**Mục tiêu:** Hoàn thiện bảng điều khiển Quản trị viên (Users CRUD) và quy trình điều động xe cấp cứu trực tiếp.

**Nội dung Prompt:**
```text
Hãy bổ sung các tính năng quản trị nâng cao cho hệ thống BloodSmart:
1. Xây dựng phân hệ Quản lý Người dùng (user.service.ts, user.controller.ts, user.routes.ts):
   - Danh sách người dùng có tìm kiếm, lọc theo vai trò, phân trang (GET /api/v1/users).
   - Tạo mới, cập nhật, khóa/mở khóa tài khoản (PUT/PATCH /api/v1/users/:id/status).
   - Xóa tài khoản vĩnh viễn: Thực hiện trong Transaction an toàn, tự động chuyển quyền sở hữu sự kiện, ca cấp cứu và lịch sử điều phối sang Admin thao tác trước khi xóa để không vi phạm ràng buộc khóa ngoại.
2. Xây dựng chức năng Điều phối xe cứu trợ trực tiếp (POST /api/v1/emergency-requests/direct-dispatch):
   - Admin xuất kho trực tiếp chi viện hỏa tốc cho bệnh viện kèm thông tin biển số xe 115, tài xế, số điện thoại.
3. API Lịch sử các chuyến xe điều phối (GET /api/v1/emergency-requests/dispatches) và cập nhật tiến độ giao nhận (PATCH /api/v1/emergency-requests/dispatches/:id/status).
```
**Kết quả đạt được:**
- Đảm bảo tính toàn vẹn dữ liệu người dùng khi xóa.
- Nâng cao năng lực giám sát lộ trình vận chuyển máu cấp cứu 115 trong thời gian thực.

---

<a name="prompt-8"></a>
### PROMPT 8: XÂY DỰNG BỘ UNIT TESTS TỰ ĐỘNG BẰNG TYPESCRIPT

**Mục tiêu:** Viết bộ kiểm thử đơn vị tự động để chứng minh tính đúng đắn của toàn bộ logic nghiệp vụ y tế.

**Nội dung Prompt:**
```text
Hãy xây dựng bộ Unit Test tự động viết bằng TypeScript tại src/scripts/run-unit-tests.ts để chạy qua lệnh npm run test:
1. Unit Test 1: Kiểm thử ma trận tương thích nhóm máu toàn phần & hồng cầu (O- cho tất cả, AB+ nhận tất cả).
2. Unit Test 2: Kiểm thử ma trận tương thích huyết tương Plasma (AB cho tất cả, O nhận tất cả).
3. Unit Test 3: Kiểm thử lớp xử lý lỗi AppError và các Factory Methods chuẩn HTTP status code.
4. Unit Test 4: Kiểm thử thuật toán phân trang (Pagination offset & metadata).
5. Unit Test 5: Kiểm thử bộ quy tắc tiền kiểm tra dữ liệu đầu vào (Input Validators: Email, SĐT, required, minLength).
6. Unit Test 6: Kiểm thử logic quy tắc giãn cách 84 ngày giữa 2 lần hiến máu.
Tất cả các test case phải tự động assert và in kết quả PASS/FAIL trực quan.
```
**Kết quả đạt được:**
- Chạy lệnh `npm run test` vượt qua **6/6 test cases (100% PASS)**, đảm bảo tiêu chí chấm điểm khắt khe của môn học.

---

<a name="prompt-9"></a>
### PROMPT 9: ĐẶC TẢ TOÀN BỘ 28 ROUTES BẰNG OPENAPI 3.0.3 & SWAGGER UI

**Mục tiêu:** Tạo tài liệu API chuẩn quốc tế độc lập, không dùng chú thích JSDoc làm rối code, phục vụ tích hợp giao diện Frontend.

**Nội dung Prompt:**
```text
Hãy xây dựng tài liệu API chuẩn OpenAPI 3.0.3 cho toàn bộ hệ thống:
1. Viết file docs/openapi.yaml độc lập đặc tả đầy đủ 28 routing paths và 41 operations của hệ thống:
   - Auth, Users, Donation Events, Donation Appointments, Blood Inventories, Emergency Requests, Dispatches, Forecasts.
   - Đầy đủ components/securitySchemes (BearerAuth JWT), parameters, requestBody, responses (200, 201, 400, 401, 403, 404, 409, 500) và các DTO schemas.
2. Viết src/config/swagger.config.ts sử dụng js-yaml để đọc docs/openapi.yaml lúc runtime và mount Swagger UI tại endpoint /api-docs trong server.ts.
3. Đảm bảo cấu trúc dữ liệu trong tài liệu khớp 100% với code Backend thực tế.
```
**Kết quả đạt được:**
- Giao diện tài liệu trực quan hoạt động tại `http://localhost:5000/api-docs`.
- Frontend có thể đọc tài liệu và test trực tiếp các API trên giao diện web.

---

<a name="prompt-10"></a>
### PROMPT 10: XÂY DỰNG KỊCH BẢN KIỂM THỬ TỰ ĐỘNG POSTMAN (T01 - T09)

**Mục tiêu:** Xây dựng bộ kịch bản kiểm thử tích hợp tự động trên Postman Collection phục vụ báo cáo nghiệm thu đồ án.

**Nội dung Prompt:**
```text
Backend hệ thống đang chạy tại http://localhost:5000. Hãy xây dựng bộ kiểm thử tự động trên Postman:
1. Tạo Postman Collection tại postman/HienMau_API.postman_collection.json sử dụng biến môi trường {{baseUrl}} và {{token}}.
2. Viết mã JavaScript tự động kiểm thử (pm.test, pm.expect) trong tab Tests cho 9 ca kiểm thử:
   - T01: Đăng ký tài khoản Donor mới (201 Created).
   - T02: Đăng nhập lấy JWT Token (200 OK, tự động lưu token vào biến môi trường).
   - T03: Đặt lịch hẹn khi chưa đủ 84 ngày (Kỳ vọng 400 Bad Request kèm thông báo số ngày còn lại).
   - T04: Đặt lịch hẹn hợp lệ (201 Created).
   - T05: Cập nhật kết quả hiến máu thành công (200 OK) -> Kiểm chứng kho máu tăng tương ứng.
   - T06: Bệnh viện tạo yêu cầu máu khẩn cấp (201 Created).
   - T07: Điều phối xuất kho chi viện theo FEFO (200 OK) -> Kiểm chứng kho máu giảm đúng số lượng.
   - T08: Truy cập API quản trị bằng Token của Donor (Kỳ vọng 403 Forbidden).
   - T09: Kiểm chứng tính bền vững dữ liệu sau khi restart server.
3. Tạo file docs/test-results.md ghi nhận kết quả thực tế.
```
**Kết quả đạt được:**
- Bộ Postman Collection hoàn chỉnh, chạy tự động 9/9 kịch bản kiểm thử đạt 100% PASS.
- Báo cáo kết quả kiểm định `docs/test-results.md` hoàn tất.

---

## TỔNG KẾT & ĐÁNH GIÁ CỦA SINH VIÊN

Thông qua chuỗi **10 câu prompt tuần tự theo chu trình phát triển phần mềm (SDLC)**, em đã:
1. **Thiết kế kiến trúc chuẩn mực:** Phân tầng 3 lớp (3-Tier Layered Architecture), quản lý cấu hình tập trung.
2. **Cài đặt các thuật toán y tế chuyên sâu:** FEFO, Ma trận tương thích truyền máu, Quy tắc 84 ngày, Cảnh báo sớm rủi ro kho máu.
3. **Đảm bảo tính toàn vẹn dữ liệu:** Tận dụng tối đa ACID Transactions và Bi-pessimistic Locking trong SQL Server.
4. **Đạt chuẩn bàn giao công nghiệp:** Có đầy đủ OpenAPI 3.0 / Swagger UI và bộ kiểm thử tự động trên cả TypeScript Unit Test và Postman Collection.
