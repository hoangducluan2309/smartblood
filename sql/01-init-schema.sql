-- ==============================================================================
-- 01-init-schema.sql
-- HỆ THỐNG ĐIỀU PHỐI HIẾN MÁU NHÂN ĐẠO & DỰ BÁO NHU CẦU MÁU KHẨN CẤP
-- Cơ sở dữ liệu: SQL Server (MSSQL)
-- ==============================================================================

-- 1. Khởi tạo Cơ sở Dữ liệu (Database) nếu chưa tồn tại
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'HienMauDB')
BEGIN
    CREATE DATABASE HienMauDB;
END
GO

USE HienMauDB;
GO

-- ==============================================================================
-- BẢNG 1: NguoiDung (Tài khoản người dùng: Quản trị viên, Nhân viên bệnh viện, Tình nguyện viên)
-- ==============================================================================
IF OBJECT_ID(N'dbo.NguoiDung', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.NguoiDung (
        id INT IDENTITY(1,1) NOT NULL,
        ho_ten NVARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        mat_khau_hash VARCHAR(255) NOT NULL,
        so_dien_thoai VARCHAR(15) NOT NULL,
        cccd VARCHAR(12) NULL,
        nhom_mau VARCHAR(5) NULL,
        yeu_to_rh VARCHAR(10) NULL,
        dia_chi NVARCHAR(255) NULL,
        vai_tro VARCHAR(20) NOT NULL CONSTRAINT DF_NguoiDung_vai_tro DEFAULT 'DONOR',
        trang_thai NVARCHAR(30) NOT NULL CONSTRAINT DF_NguoiDung_trang_thai DEFAULT N'HoatDong',
        ngay_tao DATETIME2(0) NOT NULL CONSTRAINT DF_NguoiDung_ngay_tao DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_NguoiDung_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc khóa chính và duy nhất
        CONSTRAINT PK_NguoiDung PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_NguoiDung_email UNIQUE (email),
        CONSTRAINT UQ_NguoiDung_so_dien_thoai UNIQUE (so_dien_thoai),
        CONSTRAINT UQ_NguoiDung_cccd UNIQUE (cccd),

        -- Ràng buộc kiểm tra
        CONSTRAINT CK_NguoiDung_nhom_mau CHECK (nhom_mau IS NULL OR nhom_mau IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        CONSTRAINT CK_NguoiDung_yeu_to_rh CHECK (yeu_to_rh IS NULL OR yeu_to_rh IN ('Duong', 'Am', 'Rh+', 'Rh-')),
        CONSTRAINT CK_NguoiDung_vai_tro CHECK (vai_tro IN ('ADMIN', 'HOSPITAL_STAFF', 'DONOR')),
        CONSTRAINT CK_NguoiDung_trang_thai CHECK (trang_thai IN (N'HoatDong', N'Khoa', N'ChuaKichHoat'))
    );

    CREATE NONCLUSTERED INDEX IX_NguoiDung_nhom_mau ON dbo.NguoiDung (nhom_mau);
    CREATE NONCLUSTERED INDEX IX_NguoiDung_vai_tro ON dbo.NguoiDung (vai_tro);
END
GO

-- ==============================================================================
-- BẢNG 2: KhoMau (Lưu trữ thông tin lượng máu dự trữ theo nhóm máu và thành phần)
-- ==============================================================================
IF OBJECT_ID(N'dbo.KhoMau', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.KhoMau (
        id INT IDENTITY(1,1) NOT NULL,
        nhom_mau VARCHAR(5) NOT NULL,
        thanh_phan NVARCHAR(50) NOT NULL CONSTRAINT DF_KhoMau_thanh_phan DEFAULT N'ToanPhan',
        so_luong_con_lai_ml INT NOT NULL CONSTRAINT DF_KhoMau_so_luong DEFAULT 0,
        nguong_canh_bao_ml INT NOT NULL CONSTRAINT DF_KhoMau_nguong_canh_bao DEFAULT 500,
        don_vi_luu_tru NVARCHAR(150) NOT NULL,
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_KhoMau_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc khóa chính & kiểm tra
        CONSTRAINT PK_KhoMau PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_KhoMau_Nhom_ThanhPhan_DonVi UNIQUE (nhom_mau, thanh_phan, don_vi_luu_tru),
        CONSTRAINT CK_KhoMau_nhom_mau CHECK (nhom_mau IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        CONSTRAINT CK_KhoMau_thanh_phan CHECK (thanh_phan IN (N'ToanPhan', N'HongCau', N'TieuCau', N'HuyetTuong')),
        CONSTRAINT CK_KhoMau_so_luong CHECK (so_luong_con_lai_ml >= 0),
        CONSTRAINT CK_KhoMau_nguong_canh_bao CHECK (nguong_canh_bao_ml >= 0)
    );

    CREATE NONCLUSTERED INDEX IX_KhoMau_nhom_mau ON dbo.KhoMau (nhom_mau);
END
GO

-- ==============================================================================
-- BẢNG 3: SuKienHienMau (Chiến dịch, sự kiện vận động hiến máu)
-- ==============================================================================
IF OBJECT_ID(N'dbo.SuKienHienMau', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.SuKienHienMau (
        id INT IDENTITY(1,1) NOT NULL,
        ten_su_kien NVARCHAR(200) NOT NULL,
        mo_ta NVARCHAR(MAX) NULL,
        dia_diem NVARCHAR(255) NOT NULL,
        thoi_gian_bat_dau DATETIME2(0) NOT NULL,
        thoi_gian_ket_thuc DATETIME2(0) NOT NULL,
        so_luong_du_kien INT NOT NULL CONSTRAINT DF_SuKien_so_luong_du_kien DEFAULT 50,
        so_luong_da_dang_ky INT NOT NULL CONSTRAINT DF_SuKien_so_luong_da_dang_ky DEFAULT 0,
        trang_thai NVARCHAR(30) NOT NULL CONSTRAINT DF_SuKien_trang_thai DEFAULT N'SapDienRa',
        nguoi_tao_id INT NOT NULL,
        ngay_tao DATETIME2(0) NOT NULL CONSTRAINT DF_SuKien_ngay_tao DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_SuKien_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc khóa chính, ngoại và kiểm tra
        CONSTRAINT PK_SuKienHienMau PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_SuKien_NguoiTao FOREIGN KEY (nguoi_tao_id) REFERENCES dbo.NguoiDung(id),
        CONSTRAINT CK_SuKien_ThoiGian CHECK (thoi_gian_ket_thuc > thoi_gian_bat_dau),
        CONSTRAINT CK_SuKien_so_luong_du_kien CHECK (so_luong_du_kien > 0),
        CONSTRAINT CK_SuKien_so_luong_da_dang_ky CHECK (so_luong_da_dang_ky >= 0),
        CONSTRAINT CK_SuKien_trang_thai CHECK (trang_thai IN (N'SapDienRa', N'DangDienRa', N'KetThuc', N'DaHuy'))
    );

    CREATE NONCLUSTERED INDEX IX_SuKien_ThoiGian ON dbo.SuKienHienMau (thoi_gian_bat_dau, thoi_gian_ket_thuc);
    CREATE NONCLUSTERED INDEX IX_SuKien_TrangThai ON dbo.SuKienHienMau (trang_thai);
END
GO

-- ==============================================================================
-- BẢNG 4: LichHenHienMau (Đăng ký lịch hẹn hiến máu của tình nguyện viên)
-- ==============================================================================
IF OBJECT_ID(N'dbo.LichHenHienMau', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.LichHenHienMau (
        id INT IDENTITY(1,1) NOT NULL,
        nguoi_hien_id INT NOT NULL,
        su_kien_id INT NULL,
        ngay_hen DATETIME2(0) NOT NULL,
        khung_gio VARCHAR(20) NOT NULL,
        luong_mau_hien_ml INT NULL,
        tinh_trang_suc_khoe NVARCHAR(255) NULL,
        trang_thai NVARCHAR(30) NOT NULL CONSTRAINT DF_LichHen_trang_thai DEFAULT N'ChoXacNhan',
        ghi_chu NVARCHAR(500) NULL,
        ngay_tao DATETIME2(0) NOT NULL CONSTRAINT DF_LichHen_ngay_tao DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_LichHen_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc
        CONSTRAINT PK_LichHenHienMau PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_LichHen_NguoiHien FOREIGN KEY (nguoi_hien_id) REFERENCES dbo.NguoiDung(id),
        CONSTRAINT FK_LichHen_SuKien FOREIGN KEY (su_kien_id) REFERENCES dbo.SuKienHienMau(id),
        CONSTRAINT CK_LichHen_luong_mau CHECK (luong_mau_hien_ml IS NULL OR luong_mau_hien_ml IN (250, 350, 450)),
        CONSTRAINT CK_LichHen_trang_thai CHECK (trang_thai IN (N'ChoXacNhan', N'DaXacNhan', N'HoanThanh', N'DaHuy', N'KhongDen'))
    );

    CREATE NONCLUSTERED INDEX IX_LichHen_NguoiHien ON dbo.LichHenHienMau (nguoi_hien_id);
    CREATE NONCLUSTERED INDEX IX_LichHen_SuKien ON dbo.LichHenHienMau (su_kien_id);
    CREATE NONCLUSTERED INDEX IX_LichHen_NgayHen ON dbo.LichHenHienMau (ngay_hen);
END
GO

-- ==============================================================================
-- BẢNG 5: YeuCauMauKhanCap (Bệnh viện tạo yêu cầu tiếp tế máu khẩn cấp)
-- ==============================================================================
IF OBJECT_ID(N'dbo.YeuCauMauKhanCap', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.YeuCauMauKhanCap (
        id INT IDENTITY(1,1) NOT NULL,
        benh_vien_yeu_cau NVARCHAR(200) NOT NULL,
        nguoi_dai_dien_id INT NOT NULL,
        nhom_mau_can VARCHAR(5) NOT NULL,
        thanh_phan_can NVARCHAR(50) NOT NULL CONSTRAINT DF_YeuCau_thanh_phan DEFAULT N'ToanPhan',
        so_luong_can_ml INT NOT NULL,
        muc_do_khan_cap VARCHAR(20) NOT NULL CONSTRAINT DF_YeuCau_muc_do DEFAULT 'CAO',
        ly_do NVARCHAR(500) NOT NULL,
        han_chot DATETIME2(0) NOT NULL,
        trang_thai NVARCHAR(30) NOT NULL CONSTRAINT DF_YeuCau_trang_thai DEFAULT N'DangCho',
        ngay_tao DATETIME2(0) NOT NULL CONSTRAINT DF_YeuCau_ngay_tao DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_YeuCau_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc
        CONSTRAINT PK_YeuCauMauKhanCap PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_YeuCau_NguoiDaiDien FOREIGN KEY (nguoi_dai_dien_id) REFERENCES dbo.NguoiDung(id),
        CONSTRAINT CK_YeuCau_nhom_mau CHECK (nhom_mau_can IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
        CONSTRAINT CK_YeuCau_thanh_phan CHECK (thanh_phan_can IN (N'ToanPhan', N'HongCau', N'TieuCau', N'HuyetTuong')),
        CONSTRAINT CK_YeuCau_so_luong CHECK (so_luong_can_ml > 0),
        CONSTRAINT CK_YeuCau_muc_do CHECK (muc_do_khan_cap IN ('TRUNG_BINH', 'CAO', 'NGUY_CAP')),
        CONSTRAINT CK_YeuCau_trang_thai CHECK (trang_thai IN (N'DangCho', N'DangDieuPhoi', N'DaDapUng', N'DaHuy', N'HetHan'))
    );

    CREATE NONCLUSTERED INDEX IX_YeuCau_NhomMau ON dbo.YeuCauMauKhanCap (nhom_mau_can);
    CREATE NONCLUSTERED INDEX IX_YeuCau_TrangThai ON dbo.YeuCauMauKhanCap (trang_thai);
    CREATE NONCLUSTERED INDEX IX_YeuCau_MucDo ON dbo.YeuCauMauKhanCap (muc_do_khan_cap);
END
GO

-- ==============================================================================
-- BẢNG 6: DieuPhoiMau (Theo dõi quá trình xuất kho và vận chuyển máu cứu trợ)
-- ==============================================================================
IF OBJECT_ID(N'dbo.DieuPhoiMau', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.DieuPhoiMau (
        id INT IDENTITY(1,1) NOT NULL,
        yeu_cau_id INT NOT NULL,
        kho_mau_id INT NOT NULL,
        nguoi_dieu_phoi_id INT NOT NULL,
        so_luong_xuat_ml INT NOT NULL,
        trang_thai_van_chuyen NVARCHAR(30) NOT NULL CONSTRAINT DF_DieuPhoi_trang_thai DEFAULT N'ChuanBi',
        don_vi_van_chuyen NVARCHAR(150) NULL,
        thoi_gian_xuat DATETIME2(0) NULL,
        thoi_gian_nhan_du_kien DATETIME2(0) NULL,
        thoi_gian_nhan_thuc_te DATETIME2(0) NULL,
        ghi_chu NVARCHAR(500) NULL,
        ngay_tao DATETIME2(0) NOT NULL CONSTRAINT DF_DieuPhoi_ngay_tao DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL CONSTRAINT DF_DieuPhoi_ngay_cap_nhat DEFAULT SYSUTCDATETIME(),

        -- Ràng buộc
        CONSTRAINT PK_DieuPhoiMau PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_DieuPhoi_YeuCau FOREIGN KEY (yeu_cau_id) REFERENCES dbo.YeuCauMauKhanCap(id),
        CONSTRAINT FK_DieuPhoi_KhoMau FOREIGN KEY (kho_mau_id) REFERENCES dbo.KhoMau(id),
        CONSTRAINT FK_DieuPhoi_NguoiDieuPhoi FOREIGN KEY (nguoi_dieu_phoi_id) REFERENCES dbo.NguoiDung(id),
        CONSTRAINT CK_DieuPhoi_so_luong CHECK (so_luong_xuat_ml > 0),
        CONSTRAINT CK_DieuPhoi_trang_thai CHECK (trang_thai_van_chuyen IN (N'ChuanBi', N'DangGiao', N'DaNhan', N'ThatBai'))
    );

    CREATE NONCLUSTERED INDEX IX_DieuPhoi_YeuCau ON dbo.DieuPhoiMau (yeu_cau_id);
    CREATE NONCLUSTERED INDEX IX_DieuPhoi_KhoMau ON dbo.DieuPhoiMau (kho_mau_id);
END
GO
