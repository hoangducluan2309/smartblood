import { sequelize, authenticateDatabase } from '../config/database.js';

async function fixUniqueConstraint() {
  await authenticateDatabase();
  console.log('--- SỬA LỖI RÀNG BUỘC UQ_NguoiDung_cccd TRONG SQL SERVER ---');

  try {
    // 1. Kiểm tra và xóa ràng buộc cũ
    await sequelize.query(`
      IF OBJECT_ID('dbo.UQ_NguoiDung_cccd', 'UQ') IS NOT NULL
      BEGIN
          ALTER TABLE dbo.NguoiDung DROP CONSTRAINT UQ_NguoiDung_cccd;
          PRINT 'Đã drop constraint UQ_NguoiDung_cccd cũ.';
      END
      ELSE IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_NguoiDung_cccd' AND object_id = OBJECT_ID('dbo.NguoiDung'))
      BEGIN
          DROP INDEX UQ_NguoiDung_cccd ON dbo.NguoiDung;
          PRINT 'Đã drop index UQ_NguoiDung_cccd cũ.';
      END
    `);
    console.log('[1/2] Đã gỡ bỏ ràng buộc UQ_NguoiDung_cccd không cho phép nhiều NULL.');

    // 2. Tạo Filtered Unique Index: Chỉ bắt unique khi cccd khác NULL
    await sequelize.query(`
      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UQ_NguoiDung_cccd' AND object_id = OBJECT_ID('dbo.NguoiDung'))
      BEGIN
          CREATE UNIQUE NONCLUSTERED INDEX UQ_NguoiDung_cccd 
          ON dbo.NguoiDung (cccd) 
          WHERE cccd IS NOT NULL;
          PRINT 'Đã tạo Filtered Unique Index UQ_NguoiDung_cccd (WHERE cccd IS NOT NULL).';
      END
    `);
    console.log('[2/2] Đã tạo thành công Filtered Unique Index UQ_NguoiDung_cccd cho phép nhiều bản ghi có cccd = NULL.');

    console.log('\n✅ SỬA THÀNH CÔNG 100%! Bây giờ người dùng có thể đăng ký tài khoản thoải mái mà không bị lỗi trùng CCCD NULL.');
  } catch (err: any) {
    console.error('Lỗi khi fix:', err.message);
  }

  await sequelize.close();
}

fixUniqueConstraint();
