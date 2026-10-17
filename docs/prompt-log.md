# NHẬT KÝ LÀM VIỆC & PROMPT ENGINEERING LOG (AI PAIR PROGRAMMING JOURNAL)

- **Đề tài**: Hệ thống Điều phối Hiến máu Nhân đạo & Dự báo Nhu cầu Máu Khẩn cấp - Backend API
- **Phân công**: Kỹ sư Backend
- **Công cụ hỗ trợ**: Google Antigravity (Advanced Agentic AI Pair Programmer)
- **Công nghệ chính**: Node.js, Express 5, TypeScript (ESM NodeNext), Sequelize 6, SQL Server (MSSQL), pnpm, OpenAPI 3.0, Swagger UI, Postman.

---

## 1. GIAI ĐOẠN 1: THIẾT LẬP DỰ ÁN & CƠ SỞ DỮ LIỆU SQL SERVER

### **Yêu cầu & Prompt chính:**
- Thiết lập cấu hình `package.json` (type: module, pnpm), `tsconfig.json` (ES2022, NodeNext, strict).
- Viết 3 script SQL: `01-init-schema.sql` (6 bảng, ràng buộc toàn vẹn, UTF-8), `02-seed-data.sql` (nạp dữ liệu mẫu ban đầu), `03-app-user.sql` (tạo login/user `hienmau_app` theo nguyên tắc Least Privilege).

### **Giải pháp & Quyết định Kỹ thuật:**
- **Giải quyết lỗi Collation**: Xóa bỏ chỉ định bảng mã `...UTF8` không tương thích trên SQL Server 2014/2016, chuyển sang bảng mã mặc định kết hợp kiểu `NVARCHAR` và tiền tố Unicode `N'...'` giúp tương thích 100% mọi phiên bản SQL Server.
- **Tắt `CHECK_POLICY` cho môi trường Dev**: Tránh lỗi Windows Password Complexity (Error 15118) khi lập trình cục bộ.

---

## 2. GIAI ĐOẠN 2: KẾT NỐI SEQUELIZE & KIẾN TRÚC XỬ LÝ LỖI TẬP TRUNG

### **Yêu cầu & Prompt chính:**
- Khởi tạo instance Sequelize kết nối MSSQL (`tedious`), đọc `.env`.
- Viết `src/utils/AppError.ts`, `src/middlewares/logger.middleware.ts` (che dữ liệu nhạy cảm), `src/middlewares/error.middleware.ts` (bắt toàn bộ ngoại lệ và ẩn SQL/Stack trace).
- Sắp xếp thứ tự Middleware chuẩn trong `server.ts`.

### **Giải pháp & Quyết định Kỹ thuật:**
- Thiết lập thứ tự Middleware: `helmet` $\rightarrow$ `cors` $\rightarrow$ `express.json` $\rightarrow$ `loggerMiddleware` $\rightarrow$ `routes` $\rightarrow$ `404 handler` $\rightarrow$ `errorMiddleware`.
- Format phản hồi đồng nhất: Thành công `{ success: true, message, data }`, Thất bại `{ success: false, message, data: null }`.

---

## 3. GIAI ĐOẠN 3: PHÂN HỆ AUTHENTICATION & PHÂN QUYỀN (RBAC)

### **Yêu cầu & Prompt chính:**
- Xây dựng Model `NguoiDung`, băm mật khẩu `bcryptjs`, cấp JWT Token (1 ngày).
- Middleware `xacThucToken` và `phanQuyen('ADMIN', 'HOSPITAL_STAFF', 'DONOR')`.

### **Giải pháp & Quyết định Kỹ thuật:**
- Sử dụng thư viện `bcryptjs` (thuần JavaScript) thay cho `bcrypt` (C++ native addon) để loại bỏ hoàn toàn rủi ro thiếu trình biên dịch node-gyp trên hệ điều hành Windows.
- Ghi đè phương thức `toJSON()` trong Model `NguoiDung` để ngăn chặn rò rỉ `matKhauHash` trong tất cả các API response.

---

## 4. GIAI ĐOẠN 4: SỰ KIỆN, LỊCH HẸN & QUY TẮC NGHIỆP VỤ 84 NGÀY

### **Yêu cầu & Prompt chính:**
- Xây dựng Models `SuKienHienMau`, `LichHenHienMau`, `KhoMau` và thiết lập Associations.
- Đặt lịch hẹn có kiểm tra quy tắc $\ge 84$ ngày (12 tuần) kể từ lần hiến thành công trước.
- Cập nhật kết quả hiến máu $\rightarrow$ tự động cộng lượng máu vào `KhoMau` bằng **Sequelize Transaction**.

### **Giải pháp & Quyết định Kỹ thuật:**
- Áp dụng `sequelize.transaction(async (t) => { ... })` đảm bảo tính nguyên tử (Atomicity): nếu lưu lịch hẹn thất bại hoặc cộng kho thất bại, toàn bộ giao dịch được rollback, không gây lệch số liệu kho.

---

## 5. GIAI ĐOẠN 5: ĐIỀU PHỐI CẤP CỨU & MA TRẬN NHÓM MÁU TƯƠNG THÍCH

### **Yêu cầu & Prompt chính:**
- Tiện ích `bloodCompatibility.util.ts`: Ma trận tương thích truyền máu (Toàn phần, Hồng cầu, Huyết tương).
- Bệnh viện tạo yêu cầu máu khẩn cấp $\rightarrow$ Admin điều phối xuất kho theo nguyên tắc **FEFO (First Expired First Out)**.
- Kiểm tra dung lượng kho: nếu thiếu, trả về lỗi 400 kèm chi tiết số lượng thiếu hụt.

### **Giải pháp & Quyết định Kỹ thuật:**
- Khóa bi quan `lock: t.LOCK.UPDATE` trên dòng dữ liệu trong quá trình điều phối xuất kho để phòng tránh hiện tượng Race Condition khi có nhiều yêu cầu xuất kho đồng thời.

---

## 6. GIAI ĐOẠN 6: PHÂN HỆ DỰ BÁO & CẢNH BÁO SỚM

### **Yêu cầu & Prompt chính:**
- Phân tích rủi ro kho máu theo 3 cấp độ: `AN_TOAN`, `NGUY_CO_THIEU`, `THIEU_NGHIEM_TRONG`.
- Tìm kiếm danh sách `DONOR` khẩn cấp: Lọc theo ma trận tương thích nhóm máu và điều kiện $\ge 84$ ngày.

---

## 7. GIAI ĐOẠN 7: TÀI LIỆU OPENAPI 3.0, SWAGGER UI & POSTMAN AUTOMATED TEST SUITE

### **Yêu cầu & Prompt chính:**
- Viết `docs/openapi.yaml` độc lập, mount Swagger UI tại `/api-docs`.
- Thiết lập Postman Collection `postman/HienMau_API.postman_collection.json` tích hợp test scripts `pm.test` cho 9 ca kiểm thử cốt lõi (T01 - T09).
- Xuất báo cáo kiểm thử `docs/test-results.md`.

### **Kết quả:**
- Toàn bộ 9/9 ca kiểm thử tự động trên Postman đạt kết quả **PASS 100%**. Hệ thống sẵn sàng bàn giao cho đội ngũ Frontend và nộp báo cáo đồ án.
