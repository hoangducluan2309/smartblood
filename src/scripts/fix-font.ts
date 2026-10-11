import { sequelize } from '../config/database';

async function main() {
  try {
    console.log('--- ĐANG KIỂM TRA DỮ LIỆU CẦN KHẮC PHỤC FONT TIẾNG VIỆT ---');

    // 1. Sửa bảng NguoiDung
    await sequelize.query(`
      UPDATE dbo.NguoiDung 
      SET ho_ten = N'Trần Văn Test' 
      WHERE id = 4 AND ho_ten LIKE '%?%'
    `);

    // 2. Sửa bảng YeuCauMauKhanCap
    await sequelize.query(`
      UPDATE dbo.YeuCauMauKhanCap 
      SET benh_vien_yeu_cau = N'Bệnh viện Chợ Rẫy',
          ly_do = N'Cấp cứu bệnh nhân tai nạn giao thông mất máu cấp'
      WHERE id = 1;

      UPDATE dbo.YeuCauMauKhanCap 
      SET benh_vien_yeu_cau = N'Bệnh viện Chợ Rẫy',
          ly_do = N'Cần gấp lượng lớn'
      WHERE id = 2;
    `);

    // 3. Sửa bảng LichHenHienMau
    await sequelize.query(`
      UPDATE dbo.LichHenHienMau 
      SET tinh_trang_suc_khoe = N'Tốt, không dùng thuốc',
          ghi_chu = N'Đã lấy 350ml máu O+ an toàn'
      WHERE tinh_trang_suc_khoe LIKE '%?%' OR ghi_chu LIKE '%?%';
    `);

    // 4. Sửa bảng DieuPhoiMau
    await sequelize.query(`
      UPDATE dbo.DieuPhoiMau 
      SET don_vi_van_chuyen = N'Xe Cấp Cứu 115 - Chợ Rẫy',
          ghi_chu = N'Ưu tiên còi hú vận chuyển khẩn cấp trong 30 phút'
      WHERE don_vi_van_chuyen LIKE '%?%' OR ghi_chu LIKE '%?%';
    `);

    console.log('✅ ĐÃ KHẮC PHỤC THÀNH CÔNG TẤT CẢ DỮ LIỆU LỖI FONT TIẾNG VIỆT!');

  } catch (err) {
    console.error('Lỗi khắc phục:', err);
  } finally {
    await sequelize.close();
  }
}

main();
