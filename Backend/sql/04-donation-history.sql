-- ==============================================================================
-- 04-donation-history.sql
-- Nạp dữ liệu Lịch sử hiến máu tình nguyện (Donation History) cho HienMauDB
-- ==============================================================================

USE HienMauDB;
GO

PRINT N'--- BẮT ĐẦU NẠP DỮ LIỆU LỊCH SỬ HIẾN MÁU (DONATION HISTORY) ---';

-- 1. LẤY ID CỦA CÁC TÀI KHOẢN NGƯỜI HIẾN MÁU (DONOR) VÀ SỰ KIỆN
DECLARE @DonorAnId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE email = 'nguyenvanan.donor@gmail.com');
DECLARE @DonorLongId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE email = 'long@gmail.com');
DECLARE @Event1Id INT = (SELECT TOP 1 id FROM dbo.SuKienHienMau WHERE ten_su_kien LIKE N'%Hành Trình Đỏ%');
DECLARE @Event2Id INT = (SELECT TOP 1 id FROM dbo.SuKienHienMau WHERE ten_su_kien LIKE N'%Thalassemia%');

-- Nếu chưa có donor An, tự động tạo donor mẫu
IF @DonorAnId IS NULL
BEGIN
    INSERT INTO dbo.NguoiDung (
        ho_ten, email, mat_khau_hash, so_dien_thoai, cccd, nhom_mau, yeu_to_rh, dia_chi, vai_tro, trang_thai
    )
    VALUES (
        N'Nguyễn Văn An',
        'nguyenvanan.donor@gmail.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        '0903000003',
        '001090000003',
        'A+',
        'Duong',
        N'123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
        'DONOR',
        N'HoatDong'
    );
    SET @DonorAnId = SCOPE_IDENTITY();
    PRINT N'Đã khởi tạo tài khoản Donor: Nguyễn Văn An (ID: ' + CAST(@DonorAnId AS NVARCHAR(10)) + N')';
END;

-- ==============================================================================
-- 2. NẠP LỊCH SỬ HIẾN MÁU CHO DONOR: NGUYỄN VĂN AN (Nhóm máu A+)
-- Bao gồm các mốc hiến máu đã hoàn thành và lịch hẹn sắp tới
-- ==============================================================================
IF @DonorAnId IS NOT NULL
BEGIN
    -- Lần hiến 1: 15/05/2024 (Đã hoàn thành 350ml - Hành Trình Đỏ)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = '2024-05-15')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            @Event1Id,
            '2024-05-15 08:30:00',
            '08:30 - 09:30',
            350,
            N'Sức khỏe tốt, huyết áp 120/80 mmHg, đủ điều kiện hiến máu',
            N'HoanThanh',
            N'Đã tiếp nhận 350ml máu A+. Giấy chứng nhận số: GCN-2024-00159. Điểm hiến: Nhà Văn Hóa Thanh Niên TP.HCM',
            '2024-05-10 09:00:00'
        );
    END;

    -- Lần hiến 2: 20/10/2024 (Đã hoàn thành 350ml - Ngày Hội Giọt Hồng)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = '2024-10-20')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            @Event2Id,
            '2024-10-20 09:00:00',
            '09:00 - 10:00',
            350,
            N'Sức khỏe ổn định, không có tiền sử bệnh tim mạch',
            N'HoanThanh',
            N'Đã tiếp nhận 350ml máu A+. Giấy chứng nhận số: GCN-2024-00892. Điểm hiến: Bệnh viện Truyền máu Huyết học',
            '2024-10-15 14:00:00'
        );
    END;

    -- Lần hiến 3: 15/04/2025 (Đã hoàn thành 450ml - Hiến máu định kỳ tại Chợ Rẫy)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = '2025-04-15')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            NULL,
            '2025-04-15 08:00:00',
            '08:00 - 09:00',
            450,
            N'Thể trạng rất tốt, cân nặng 68kg, thể tích tiếp nhận 450ml',
            N'HoanThanh',
            N'Đã tiếp nhận 450ml máu A+. Giấy chứng nhận số: GCN-2025-00341. Địa điểm: Bệnh viện Chợ Rẫy (Khoa Huyết Học)',
            '2025-04-10 10:30:00'
        );
    END;

    -- Lần hiến 4: 10/09/2025 (Đã hoàn thành 350ml - Vì Bệnh Nhân Thalassemia)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = '2025-09-10')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            @Event2Id,
            '2025-09-10 09:30:00',
            '09:30 - 10:30',
            350,
            N'Sức khỏe bình thường, xét nghiệm sàng lọc nhanh đạt chuẩn',
            N'HoanThanh',
            N'Đã tiếp nhận 350ml máu A+. Giấy chứng nhận số: GCN-2025-00788. Điểm hiến: Hội trường Bệnh viện Truyền máu',
            '2025-09-05 11:00:00'
        );
    END;

    -- Lần hiến 5: 22/12/2025 (Đã hoàn thành 350ml - Giọt Hồng Tri Ân)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = '2025-12-22')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            @Event1Id,
            '2025-12-22 08:30:00',
            '08:30 - 09:30',
            350,
            N'Sức khỏe tốt, huyết áp ổn định',
            N'HoanThanh',
            N'Đã tiếp nhận 350ml máu A+. Giấy chứng nhận số: GCN-2025-01045. Điểm hiến: Nhà Văn Hóa Thanh Niên TP.HCM',
            '2025-12-18 16:00:00'
        );
    END;

    -- Lịch hẹn sắp tới: Ngày 25 tháng này (Trạng thái: ChoXacNhan / Đang chờ duyệt)
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorAnId AND CAST(ngay_hen AS DATE) = CAST(DATEADD(DAY, 5, SYSUTCDATETIME()) AS DATE))
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorAnId,
            @Event1Id,
            DATEADD(DAY, 5, SYSUTCDATETIME()),
            '08:30 - 09:30',
            350,
            N'Tốt, sẵn sàng tham gia hiến máu tình nguyện',
            N'ChoXacNhan',
            N'Đăng ký tại sự kiện Hành Trình Đỏ 2026. Địa điểm: Nhà Văn Hóa Thanh Niên TP.HCM',
            SYSUTCDATETIME()
        );
    END;

    PRINT N'Đã nạp thành công 5 lần hiến hoàn thành + 1 lịch hẹn sắp tới cho Donor Nguyễn Văn An.';
END;

-- ==============================================================================
-- 3. NẠP LỊCH SỬ HIẾN MÁU CHO DONOR: TRẦN VĂN LONG (Nhóm máu O+)
-- ==============================================================================
IF @DonorLongId IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorLongId AND CAST(ngay_hen AS DATE) = '2025-03-12')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorLongId,
            @Event1Id,
            '2025-03-12 09:00:00',
            '09:00 - 10:00',
            350,
            N'Sức khỏe tốt, mạch đập đều, đủ tiêu chuẩn',
            N'HoanThanh',
            N'Đã tiếp nhận 350ml máu O+. Giấy chứng nhận số: GCN-2025-00210. Địa điểm: Nhà Văn Hóa Thanh Niên TP.HCM',
            '2025-03-08 10:00:00'
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM dbo.LichHenHienMau WHERE nguoi_hien_id = @DonorLongId AND CAST(ngay_hen AS DATE) = '2025-08-20')
    BEGIN
        INSERT INTO dbo.LichHenHienMau (
            nguoi_hien_id, su_kien_id, ngay_hen, khung_gio, luong_mau_hien_ml, tinh_trang_suc_khoe, trang_thai, ghi_chu, ngay_tao
        )
        VALUES (
            @DonorLongId,
            NULL,
            '2025-08-20 08:30:00',
            '08:30 - 09:30',
            450,
            N'Thể trạng tốt, xét nghiệm huyết sắc tố Hb đạt 135 g/L',
            N'HoanThanh',
            N'Đã tiếp nhận 450ml máu O+. Giấy chứng nhận số: GCN-2025-00670. Địa điểm: Bệnh viện Chợ Rẫy',
            '2025-08-15 08:00:00'
        );
    END;

    PRINT N'Đã nạp lịch sử hiến máu cho Donor Trần Văn Long.';
END;

-- ==============================================================================
-- 4. TẠO VIEW TỔNG HỢP: dbo.v_LichSuHienMau (Để truy vấn nhanh báo cáo)
-- ==============================================================================
IF OBJECT_ID(N'dbo.v_LichSuHienMau', N'V') IS NOT NULL
BEGIN
    DROP VIEW dbo.v_LichSuHienMau;
END;
GO

CREATE VIEW dbo.v_LichSuHienMau AS
SELECT 
    lh.id,
    lh.nguoi_hien_id,
    nd.ho_ten AS ho_ten_nguoi_hien,
    nd.so_dien_thoai,
    nd.email,
    nd.nhom_mau,
    nd.yeu_to_rh,
    lh.su_kien_id,
    COALESCE(sk.ten_su_kien, N'Hiến Máu Tình Nguyện Định Kỳ') AS ten_su_kien,
    COALESCE(sk.dia_diem, N'Bệnh viện Chợ Rẫy (Trung Tâm Truyền Máu)') AS dia_diem,
    lh.ngay_hen,
    lh.khung_gio,
    lh.luong_mau_hien_ml,
    lh.tinh_trang_suc_khoe,
    lh.trang_thai,
    lh.ghi_chu,
    lh.ngay_tao,
    lh.ngay_cap_nhat
FROM dbo.LichHenHienMau lh
INNER JOIN dbo.NguoiDung nd ON lh.nguoi_hien_id = nd.id
LEFT JOIN dbo.SuKienHienMau sk ON lh.su_kien_id = sk.id;
GO

PRINT N'--- HOÀN TẤT NẠP DỮ LIỆU LỊCH SỬ HIẾN MÁU VÀO CSDL HienMauDB ---';
GO
