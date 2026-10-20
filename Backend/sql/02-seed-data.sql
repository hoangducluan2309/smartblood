-- ==============================================================================
-- 02-seed-data.sql
-- Dữ liệu khởi tạo mẫu (Seed Data) cho HienMauDB
-- ==============================================================================

USE HienMauDB;
GO

-- 1. NẠP DỮ LIỆU TÀI KHOẢN MẪU (3 vai trò: ADMIN, HOSPITAL_STAFF, DONOR)
-- Ghi chú: Mật khẩu mặc định mẫu cho cả 3 tài khoản là 'Password@123' 
-- (Được mã hóa sẵn bằng bcrypt với salt round = 10)
IF NOT EXISTS (SELECT 1 FROM dbo.NguoiDung WHERE email = 'admin@hienmau.vn')
BEGIN
    INSERT INTO dbo.NguoiDung (
        ho_ten, 
        email, 
        mat_khau_hash, 
        so_dien_thoai, 
        cccd, 
        nhom_mau, 
        yeu_to_rh, 
        dia_chi, 
        vai_tro, 
        trang_thai
    )
    VALUES 
    (
        N'Quản Trị Viên Hệ Thống',
        'admin@hienmau.vn',
        '$2b$10$VQ1czTUBfLDw.4z7c0RiSu6hQatWKjWMz3FjlbP8lund/hd6lq4/e',
        '0901000001',
        '001090000001',
        'O+',
        'Duong',
        N'Trung tâm Điều phối Máu Quốc gia, Hà Nội',
        'ADMIN',
        N'HoatDong'
    ),
    (
        N'BS. Trần Thị Mai (BV Chợ Rẫy)',
        'staff.choray@hienmau.vn',
        '$2b$10$VQ1czTUBfLDw.4z7c0RiSu6hQatWKjWMz3FjlbP8lund/hd6lq4/e',
        '0902000002',
        '001090000002',
        'B+',
        'Duong',
        N'Khoa Huyết học Truyền máu - Bệnh viện Chợ Rẫy, TP.HCM',
        'HOSPITAL_STAFF',
        N'HoatDong'
    ),
    (
        N'Nguyễn Văn An',
        'nguyenvanan.donor@gmail.com',
        '$2b$10$VQ1czTUBfLDw.4z7c0RiSu6hQatWKjWMz3FjlbP8lund/hd6lq4/e',
        '0903000003',
        '001090000003',
        'A+',
        'Duong',
        N'123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        'DONOR',
        N'HoatDong'
    );
END
GO

-- 2. NẠP DỮ LIỆU TỒN KHO MÁU BAN ĐẦU (4 Nhóm máu chính: A+, B+, O+, AB+)
IF NOT EXISTS (SELECT 1 FROM dbo.KhoMau WHERE don_vi_luu_tru = N'Kho Lưu Trữ Trung Tâm - TP.HCM')
BEGIN
    INSERT INTO dbo.KhoMau (
        nhom_mau, 
        thanh_phan, 
        so_luong_con_lai_ml, 
        nguong_canh_bao_ml, 
        don_vi_luu_tru
    )
    VALUES
    ('O+',  N'ToanPhan', 4500, 1500, N'Kho Lưu Trữ Trung Tâm - TP.HCM'),
    ('A+',  N'ToanPhan', 3200, 1000, N'Kho Lưu Trữ Trung Tâm - TP.HCM'),
    ('B+',  N'ToanPhan', 2800, 1000, N'Kho Lưu Trữ Trung Tâm - TP.HCM'),
    ('AB+', N'ToanPhan', 1200, 500,  N'Kho Lưu Trữ Trung Tâm - TP.HCM');
END
GO

-- 3. NẠP DỮ LIỆU SỰ KIỆN HIẾN MÁU (2 Sự kiện)
DECLARE @AdminId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE vai_tro = 'ADMIN');

IF @AdminId IS NOT NULL AND NOT EXISTS (SELECT 1 FROM dbo.SuKienHienMau WHERE ten_su_kien LIKE N'%Giọt Hồng Tình Nguyện%')
BEGIN
    INSERT INTO dbo.SuKienHienMau (
        ten_su_kien,
        mo_ta,
        dia_diem,
        thoi_gian_bat_dau,
        thoi_gian_ket_thuc,
        so_luong_du_kien,
        so_luong_da_dang_ky,
        trang_thai,
        nguoi_tao_id
    )
    VALUES
    (
        N'Hành Trình Đỏ - Giọt Hồng Tình Nguyện 2026',
        N'Chiến dịch hiến máu tình nguyện quy mô toàn thành phố nhằm bổ sung lượng máu dự trữ trước dịp lễ.',
        N'Nhà Văn Hóa Thanh Niên, Số 4 Phạm Ngọc Thạch, Bến Nghé, Quận 1, TP.HCM',
        DATEADD(DAY, 7, SYSUTCDATETIME()),
        DATEADD(DAY, 7, DATEADD(HOUR, 8, SYSUTCDATETIME())),
        200,
        1,
        N'SapDienRa',
        @AdminId
    ),
    (
        N'Ngày Hội Hiến Máu Khẩn Cấp - Vì Bệnh Nhân Thalassemia',
        N'Chương trình tiếp nhận máu khẩn cấp hỗ trợ bệnh nhi tan máu bẩm sinh và phẫu thuật cấp cứu.',
        N'Hội trường A - Bệnh viện Truyền máu Huyết học, 118 Hồng Bàng, Quận 5, TP.HCM',
        DATEADD(DAY, 14, SYSUTCDATETIME()),
        DATEADD(DAY, 14, DATEADD(HOUR, 6, SYSUTCDATETIME())),
        150,
        0,
        N'SapDienRa',
        @AdminId
    );
END
GO
