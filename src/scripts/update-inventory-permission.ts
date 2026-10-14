import { sequelize, authenticateDatabase } from '../config/database.js';

async function updatePermissions() {
  await authenticateDatabase();
  console.log('\n=== CẬP NHẬT PHÂN QUYỀN CƠ SỞ DỮ LIỆU SQL SERVER ===');

  // 1. Tạo bảng PhanQuyenChucNang nếu chưa có
  await sequelize.query(`
    IF OBJECT_ID(N'dbo.PhanQuyenChucNang', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.PhanQuyenChucNang (
        id INT IDENTITY(1,1) PRIMARY KEY CLUSTERED,
        ma_chuc_nang VARCHAR(50) NOT NULL UNIQUE,
        ten_chuc_nang NVARCHAR(150) NOT NULL,
        vai_tro_cho_phep NVARCHAR(255) NOT NULL,
        mo_ta NVARCHAR(255) NULL,
        ngay_tao DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME(),
        ngay_cap_nhat DATETIME2(0) NOT NULL DEFAULT SYSUTCDATETIME()
      );
      PRINT 'Da tao bang dbo.PhanQuyenChucNang thanh cong.';
    END
  `);

  // 2. Chèn / Cập nhật quyền xem tồn kho máu: Chỉ ADMIN và HOSPITAL_STAFF
  await sequelize.query(`
    MERGE dbo.PhanQuyenChucNang AS target
    USING (VALUES 
      ('XEM_TON_KHO_MAU', N'Xem Tồn Kho Máu', 'ADMIN,HOSPITAL_STAFF', N'Chỉ Bác sĩ và Admin được xem tồn kho máu; Donor và Khách bị chặn.'),
      ('QUAN_LY_KHO_FEFO', N'Quản Lý Kho FEFO', 'ADMIN', N'Chỉ Admin được thêm/sửa/xóa/hủy túi máu trong kho.'),
      ('PHAT_LENH_CAP_CUU', N'Phát Lệnh Cấp Cứu', 'ADMIN,HOSPITAL_STAFF', N'Bác sĩ và Admin có quyền kích hoạt lệnh cấp cứu.'),
      ('TAT_THE_CAP_CUU', N'Tắt Thẻ Cấp Cứu', 'ADMIN,HOSPITAL_STAFF', N'Bác sĩ và Admin có quyền tắt thẻ ca cấp cứu.'),
      ('TAO_SU_KIEN_HIEN', N'Tạo Sự Kiện Hiến', 'ADMIN', N'Chỉ Admin có quyền tạo ngày hội/sự kiện hiến máu.'),
      ('TAT_SU_KIEN_HIEN', N'Tắt Sự Kiện Hiến', 'ADMIN', N'Chỉ Admin có quyền tắt thẻ sự kiện hiến máu.')
    ) AS source (ma_chuc_nang, ten_chuc_nang, vai_tro_cho_phep, mo_ta)
    ON target.ma_chuc_nang = source.ma_chuc_nang
    WHEN MATCHED THEN 
      UPDATE SET 
        ten_chuc_nang = source.ten_chuc_nang,
        vai_tro_cho_phep = source.vai_tro_cho_phep,
        mo_ta = source.mo_ta,
        ngay_cap_nhat = SYSUTCDATETIME()
    WHEN NOT MATCHED THEN 
      INSERT (ma_chuc_nang, ten_chuc_nang, vai_tro_cho_phep, mo_ta)
      VALUES (source.ma_chuc_nang, source.ten_chuc_nang, source.vai_tro_cho_phep, source.mo_ta);
  `);

  console.log('✅ Đã cập nhật chính sách phân quyền vào bảng dbo.PhanQuyenChucNang!');

  // 3. Đọc lại dữ liệu để xác nhận
  const [rows] = await sequelize.query('SELECT ma_chuc_nang, ten_chuc_nang, vai_tro_cho_phep, mo_ta FROM dbo.PhanQuyenChucNang');
  console.table(rows);

  await sequelize.close();
}

updatePermissions().catch(console.error);
