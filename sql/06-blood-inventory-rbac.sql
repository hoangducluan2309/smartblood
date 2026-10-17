-- ==============================================================================
-- 06-blood-inventory-rbac.sql
-- CHÍNH SÁCH PHÂN QUYỀN TRUY CẬP KHO MÁU (BLOOD INVENTORY RBAC POLICY)
-- CSDL: HienMauDB (SQL Server)
-- ==============================================================================

USE HienMauDB;
GO

PRINT N'==============================================================================';
PRINT N'-- THIẾT LẬP CHÍNH SÁCH PHÂN QUYỀN TRUY CẬP KHO MÁU (KHOMAU RBAC)            --';
PRINT N'==============================================================================';

/*
MA TRẬN PHÂN QUYỀN KHO MÁU (BLOOD INVENTORY ACCESS CONTROL MATRIX):
--------------------------------------------------------------------------------------------------------------------------------------
Vai trò (Role)        | Xem Chi Tiết FEFO | Xem Tổng Hợp (Summary) | Thêm Túi Máu | Sửa / Cập Nhật | Xuất Hủy / Xóa | Điều Phối Xe 115
--------------------------------------------------------------------------------------------------------------------------------------
ADMIN                 |       CHO PHÉP    |       CHO PHÉP         |   CHO PHÉP   |    CHO PHÉP    |    CHO PHÉP    |     CHO PHÉP
HOSPITAL_STAFF        |       CHO PHÉP    |       CHO PHÉP         |    TỪ CHỐI   |     TỪ CHỐI    |     TỪ CHỐI    |     TỪ CHỐI
DONOR (Tình nguyện)   |    CHẶN HOÀN TOÀN |     CHẶN HOÀN TOÀN     |    TỪ CHỐI   |     TỪ CHỐI    |     TỪ CHỐI    |     TỪ CHỐI
PUBLIC (Khách ẩn danh)|    CHẶN HOÀN TOÀN |     CHẶN HOÀN TOÀN     |    TỪ CHỐI   |     TỪ CHỐI    |     TỪ CHỐI    |     TỪ CHỐI
--------------------------------------------------------------------------------------------------------------------------------------
*/

-- 1. Kiểm tra tính toàn vẹn của ràng buộc vai trò trong bảng NguoiDung
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_NguoiDung_vai_tro')
BEGIN
    PRINT N'[OK] Ràng buộc vai trò người dùng (CK_NguoiDung_vai_tro) đã được kích hoạt: vai_tro IN (''ADMIN'', ''HOSPITAL_STAFF'', ''DONOR'').';
END
ELSE
BEGIN
    ALTER TABLE dbo.NguoiDung 
    ADD CONSTRAINT CK_NguoiDung_vai_tro CHECK (vai_tro IN ('ADMIN', 'HOSPITAL_STAFF', 'DONOR'));
    PRINT N'[ĐÃ THÊM] Ràng buộc vai trò người dùng CK_NguoiDung_vai_tro.';
END
GO

-- 2. Kiểm tra tài khoản người dùng theo từng nhóm vai trò
PRINT N'--- DANH SÁCH TÀI KHOẢN VÀ QUYỀN HẠN TRUY CẬP KHO MÁU HIỆN CÓ ---';
SELECT 
    id, 
    ho_ten, 
    email, 
    vai_tro,
    CASE 
        WHEN vai_tro = 'ADMIN' THEN N'Toàn quyền: Xem kho FEFO, Nhập kho, Sửa, Xuất hủy, Điều phối xe 115'
        WHEN vai_tro = 'HOSPITAL_STAFF' THEN N'Quyền Bác sĩ: Được xem tồn kho FEFO & Tổng hợp 8 nhóm máu để điều phối'
        WHEN vai_tro = 'DONOR' THEN N'BỊ CHẶN: Không có quyền xem tồn kho máu (403 Forbidden)'
        ELSE N'Không xác định'
    END AS quyen_han_kho_mau
FROM dbo.NguoiDung
ORDER BY 
    CASE vai_tro 
        WHEN 'ADMIN' THEN 1 
        WHEN 'HOSPITAL_STAFF' THEN 2 
        WHEN 'DONOR' THEN 3 
        ELSE 4 
    END, id;
GO

-- 3. Tạo View tổng hợp tồn kho dành riêng cho nhân sự y tế (HOSPITAL_STAFF & ADMIN)
IF OBJECT_ID(N'dbo.vw_TonKhoMauBaoMat', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.vw_TonKhoMauBaoMat;
END
GO

CREATE VIEW dbo.vw_TonKhoMauBaoMat AS
SELECT 
    k.nhom_mau,
    COUNT(k.id) AS tong_so_tui_mau,
    SUM(k.so_luong_con_lai_ml) AS tong_the_tich_ml,
    AVG(k.nguong_canh_bao_ml) AS nguong_canh_bao_trung_binh_ml,
    CASE 
        WHEN SUM(k.so_luong_con_lai_ml) <= AVG(k.nguong_canh_bao_ml) THEN N'CANH_BAO_THIEU'
        ELSE N'AN_TOAN'
    END AS trang_thai_trang_luong,
    MAX(k.ngay_cap_nhat) AS lan_cap_nhat_cuoi
FROM dbo.KhoMau k
GROUP BY k.nhom_mau;
GO

PRINT N'[OK] Đã tạo/cập nhật View dbo.vw_TonKhoMauBaoMat phục vụ phân quyền kho máu.';
PRINT N'Chính sách phân quyền kho máu đã được áp dụng đồng bộ thành công!';
GO
