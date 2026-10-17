-- ==============================================================================
-- 05-emergency-requests.sql
-- Chuẩn hóa và đồng bộ chính xác 8 CA CẤP CỨU MÁU KHẨN CẤP trong HienMauDB
-- Bao phủ 8 nhóm máu (O-, O+, A-, A+, B-, B+, AB-, AB+) tại các bệnh viện lớn
-- ==============================================================================

USE HienMauDB;
GO

PRINT N'--- BẮT ĐẦU ĐỒNG BỘ CHÍNH XÁC 8 CA CẤP CỨU MÁU KHẨN CẤP ---';

-- 1. LẤY ID CỦA ĐẠI DIỆN BỆNH VIỆN VÀ QUẢN TRỊ VIÊN
DECLARE @StaffChoRayId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE email = 'staff.choray@hienmau.vn');
DECLARE @StaffGeneralId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE email = 'staff@hienmau.vn');
DECLARE @AdminId INT = (SELECT TOP 1 id FROM dbo.NguoiDung WHERE vai_tro = 'ADMIN');

IF @StaffChoRayId IS NULL SET @StaffChoRayId = @StaffGeneralId;
IF @StaffChoRayId IS NULL SET @StaffChoRayId = @AdminId;

-- ==============================================================================
-- 2. CẬP NHẬT 7 BẢN GHI HIỆN CÓ (ID: 1, 2, 3, 4, 5, 6, 8)
-- ==============================================================================

-- Ca 1: Bệnh viện Chợ Rẫy (Khoa Cấp Cứu) - Nhóm A+ (BÁO ĐỘNG ĐỎ)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 1)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Chợ Rẫy (Khoa Cấp Cứu)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'A+',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 700,
        muc_do_khan_cap = 'NGUY_CAP',
        ly_do = N'Bệnh nhân Nguyễn Văn A (45 tuổi) - Tai nạn giao thông gãy xương đùi hở mất máu cấp. BS. Lê Minh (0908123456)',
        han_chot = DATEADD(HOUR, 2, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 1;
    PRINT N'Đã cập nhật ca cấp cứu #1 (A+) -> DangCho';
END;

-- Ca 2: Bệnh viện Chợ Rẫy (Khoa Hồi Sức Cấp Cứu / ICU) - Nhóm O- (BÁO ĐỘNG ĐỎ)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 2)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Chợ Rẫy (Khoa Hồi Sức Cấp Cứu / ICU)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'O-',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 1050,
        muc_do_khan_cap = 'NGUY_CAP',
        ly_do = N'Bệnh nhân Lê Văn T. (32 tuổi) - Sốc mất máu nặng đa chấn thương lồng ngực. Cần máu O- cấp cứu hỏa tốc. BS. Trực Cấp Cứu Chợ Rẫy (0908123456)',
        han_chot = DATEADD(MINUTE, 45, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 2;
    PRINT N'Đã cập nhật ca cấp cứu #2 (O-) -> DangCho';
END;

-- Ca 3: Bệnh viện Chợ Rẫy (Khoa Ngoại Tiêu Hóa) - Nhóm O+ (BÁO ĐỘNG ĐỎ)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 3)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Chợ Rẫy (Khoa Ngoại Tiêu Hóa)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'O+',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 1050,
        muc_do_khan_cap = 'NGUY_CAP',
        ly_do = N'Bệnh nhân Vũ Đức H. (50 tuổi) - Xuất huyết tiêu hóa ồ ạt do giãn vỡ tĩnh mạch thực quản. BS. Trần Hoàng (0903112233)',
        han_chot = DATEADD(HOUR, 2, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 3;
    PRINT N'Đã cập nhật ca cấp cứu #3 (O+) -> DangCho';
END;

-- Ca 4: Bệnh viện Đại học Y Dược TP.HCM (Khoa Ngoại Lồng Ngực) - Nhóm AB- (KHẨN CẤP)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 4)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Đại học Y Dược TP.HCM (Khoa Ngoại Lồng Ngực)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'AB-',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 700,
        muc_do_khan_cap = 'CAO',
        ly_do = N'Bệnh nhân Trần Thị B (58 tuổi) - Phẫu thuật tim hở thay van 2 lá khẩn cấp. BS. Phạm Hương (0912987654)',
        han_chot = DATEADD(HOUR, 3, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 4;
    PRINT N'Đã cập nhật ca cấp cứu #4 (AB-) -> DangCho';
END;

-- Ca 5: Bệnh viện Nhân dân 115 (Khoa Cấp Cứu) - Nhóm A- (KHẨN CẤP)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 5)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Nhân dân 115 (Khoa Cấp Cứu)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'A-',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 700,
        muc_do_khan_cap = 'CAO',
        ly_do = N'Bệnh nhân Hoàng C (62 tuổi) - Xuất huyết nội sau chấn thương vùng bụng kín. Điều phối viên Trực ban (0988776655)',
        han_chot = DATEADD(HOUR, 4, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 5;
    PRINT N'Đã cập nhật ca cấp cứu #5 (A-) -> DangCho';
END;

-- Ca 6: Bệnh viện Truyền Máu Huyết Học TP.HCM - Nhóm B+ (KHẨN CẤP)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 6)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Truyền Máu Huyết Học TP.HCM',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'B+',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 700,
        muc_do_khan_cap = 'CAO',
        ly_do = N'Bệnh nhân Đỗ Văn M (28 tuổi) - Thiếu máu tán huyết cấp tính cần truyền hồng cầu khẩn. BS. Kim Oanh (0909556677)',
        han_chot = DATEADD(HOUR, 5, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 6;
    PRINT N'Đã cập nhật ca cấp cứu #6 (B+) -> DangCho';
END;

-- Ca 7 (Bản ghi ID 8): Bệnh viện Nhi Đồng 1 (Khoa Cấp Cứu Sơ Sinh) - Nhóm B- (BÁO ĐỘNG ĐỎ)
IF EXISTS (SELECT 1 FROM dbo.YeuCauMauKhanCap WHERE id = 8)
BEGIN
    UPDATE dbo.YeuCauMauKhanCap
    SET benh_vien_yeu_cau = N'Bệnh viện Nhi Đồng 1 (Khoa Cấp Cứu Sơ Sinh)',
        nguoi_dai_dien_id = @StaffChoRayId,
        nhom_mau_can = 'B-',
        thanh_phan_can = N'ToanPhan',
        so_luong_can_ml = 700,
        muc_do_khan_cap = 'NGUY_CAP',
        ly_do = N'Bệnh nhi sơ sinh Nguyễn Tuấn K. (3 ngày tuổi) - Vàng da tán huyết bất đồng nhóm máu mẹ con cần thay máu gấp. BS. Trực Sơ Sinh (0908889900)',
        han_chot = DATEADD(HOUR, 2, SYSUTCDATETIME()),
        trang_thai = N'DangCho'
    WHERE id = 8;
    PRINT N'Đã cập nhật ca cấp cứu #8 (B-) -> DangCho';
END;

-- ==============================================================================
-- 3. NẠP CA THỨ 8 ĐỂ ĐẢM BẢO CHÍNH XÁC 8 BẢN GHI TRONG CƠ SỞ DỮ LIỆU
-- ==============================================================================
DECLARE @CurrentCount INT = (SELECT COUNT(*) FROM dbo.YeuCauMauKhanCap);
IF @CurrentCount < 8
BEGIN
    -- Ca 8: Bệnh viện Nhân dân Gia Định (Khoa Cấp Cứu) - Nhóm AB+ (KHẨN CẤP)
    INSERT INTO dbo.YeuCauMauKhanCap (
        benh_vien_yeu_cau, nguoi_dai_dien_id, nhom_mau_can, thanh_phan_can, 
        so_luong_can_ml, muc_do_khan_cap, ly_do, han_chot, trang_thai, ngay_tao, ngay_cap_nhat
    )
    VALUES (
        N'Bệnh viện Nhân dân Gia Định (Khoa Cấp Cứu)',
        @StaffChoRayId,
        'AB+',
        N'ToanPhan',
        700,
        'CAO',
        N'Bệnh nhân Phan Thanh D. (39 tuổi) - Phẫu thuật cấp cứu vỡ phình động mạch chủ bụng. BS. Quang Tuấn (0913445566)',
        DATEADD(HOUR, 6, SYSUTCDATETIME()),
        N'DangCho',
        SYSUTCDATETIME(),
        SYSUTCDATETIME()
    );
    PRINT N'Đã nạp bổ sung ca cấp cứu thứ 8: Bệnh viện Nhân dân Gia Định (AB+) -> DangCho';
END;

-- ==============================================================================
-- 4. BÁO CÁO TỔNG KẾT 8 CA CẤP CỨU TRONG DATABASE
-- ==============================================================================
PRINT N'';
PRINT N'--- BẢNG TỔNG HỢP CHÍNH XÁC 8 CA CẤP CỨU (HienMauDB) ---';
SELECT 
    id AS [ID],
    benh_vien_yeu_cau AS [Bệnh Viện Yêu Cầu],
    nhom_mau_can AS [Nhóm Máu],
    so_luong_can_ml AS [Thể Tích (ml)],
    muc_do_khan_cap AS [Mức Độ],
    trang_thai AS [Trạng Thái],
    han_chot AS [Hạn Chót],
    ly_do AS [Chỉ Dẫn / Bệnh Nhân]
FROM dbo.YeuCauMauKhanCap
ORDER BY id ASC;

GO
