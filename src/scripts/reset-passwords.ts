import { sequelize, authenticateDatabase } from '../config/database.js';
import { NguoiDung } from '../models/NguoiDung.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';

async function resetAllPasswords() {
  await authenticateDatabase();
  console.log('--- Bắt đầu đặt lại mật khẩu cho tất cả tài khoản mẫu ---');

  const newHash = await hashPassword('Password@123');

  // 1. Cập nhật các tài khoản chính
  const accounts = [
    { email: 'admin@hienmau.vn', hoTen: 'Quản Trị Viên Hệ Thống', vaiTro: 'ADMIN', soDienThoai: '0901000001', cccd: '001090000001' },
    { email: 'admin.hn@hienmau.vn', hoTen: 'Quản Trị Viên Hệ Thống HN', vaiTro: 'ADMIN', soDienThoai: '0901001001', cccd: '079001001001' },
    { email: 'admin.hcm@hienmau.vn', hoTen: 'Lương Văn Long (Admin)', vaiTro: 'ADMIN', soDienThoai: '0909999999', cccd: '079079079079' },
    { email: 'staff.choray@hienmau.vn', hoTen: 'BS. Trần Thị Mai (BV Chợ Rẫy)', vaiTro: 'HOSPITAL_STAFF', soDienThoai: '0902000002', cccd: '001090000002' },
    { email: 'staff@hienmau.vn', hoTen: 'BS. Nguyễn Văn B', vaiTro: 'HOSPITAL_STAFF', soDienThoai: '0912345678', cccd: '079090005555' },
    { email: 'nguyenvanan.donor@gmail.com', hoTen: 'Nguyễn Văn An', vaiTro: 'DONOR', soDienThoai: '0903000003', cccd: '001090000003' },
    { email: 'test.donor@gmail.com', hoTen: 'Người Hiến Máu Test', vaiTro: 'DONOR', soDienThoai: '0987654321', cccd: '001090000004' },
    { email: 'luongvanlong91@gmail.com', hoTen: 'Lương Văn Long', vaiTro: 'DONOR', soDienThoai: '0937944074', cccd: '075091003630' },
  ];

  for (const acc of accounts) {
    let user = await NguoiDung.findOne({ where: { email: acc.email } });
    if (user) {
      user.matKhauHash = newHash;
      user.trangThai = 'HoatDong';
      await user.save();
      console.log(`[OK] Đã cập nhật mật khẩu "Password@123" cho tài khoản: ${acc.email} (${acc.vaiTro})`);
    } else {
      await NguoiDung.create({
        hoTen: acc.hoTen,
        email: acc.email,
        matKhauHash: newHash,
        soDienThoai: acc.soDienThoai,
        cccd: acc.cccd,
        vaiTro: acc.vaiTro as any,
        trangThai: 'HoatDong',
        nhomMau: 'O+',
        yeuToRh: 'Duong'
      });
      console.log(`[TẠO MỚI] Đã tạo tài khoản: ${acc.email} với mật khẩu "Password@123"`);
    }

    // Kiểm tra lại bcrypt compare
    const check = await NguoiDung.findOne({ where: { email: acc.email } });
    const isMatch = check ? await comparePassword('Password@123', check.matKhauHash) : false;
    console.log(`     --> Xác thực kiểm thử mật khẩu "Password@123": ${isMatch ? 'THÀNH CÔNG (MATCH)' : 'THẤT BẠI'}`);
  }

  console.log('\n--- Hoàn tất 100%! Tất cả tài khoản mẫu đã có mật khẩu chuẩn Password@123 ---');
  await sequelize.close();
}

resetAllPasswords().catch(err => {
  console.error('Lỗi khi đặt lại mật khẩu:', err);
  process.exit(1);
});
