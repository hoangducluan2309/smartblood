import { sequelize, authenticateDatabase } from '../config/database.js';
import { NguoiDung } from '../models/NguoiDung.js';
import { comparePassword, hashPassword } from '../utils/password.util.js';

async function inspect() {
  await authenticateDatabase();

  const users = await NguoiDung.findAll();
  console.log(`\n=== TỔNG SỐ TÀI KHOẢN TRONG CSDL: ${users.length} ===`);
  
  for (const u of users) {
    const isPass123 = await comparePassword('Password@123', u.matKhauHash);
    const is123456 = await comparePassword('123456', u.matKhauHash);
    console.log(`- ID: ${u.id}`);
    console.log(`  Email: "${u.email}"`);
    console.log(`  Vai trò: ${u.vaiTro}`);
    console.log(`  Trạng thái: ${u.trangThai}`);
    console.log(`  matKhauHash: ${u.matKhauHash}`);
    console.log(`  Khớp với "Password@123": ${isPass123}`);
    console.log(`  Khớp với "123456": ${is123456}`);
    console.log('-------------------------------------------');
  }

  if (users.length === 0) {
    console.log('Chưa có user nào trong bảng NguoiDung! Đang tiến hành tạo tài khoản mẫu...');
    const hash = await hashPassword('123456');
    const hashPw = await hashPassword('Password@123');
    
    await NguoiDung.create({
      hoTen: 'Quản Trị Viên Hệ Thống',
      email: 'admin@hienmau.vn',
      matKhauHash: hashPw,
      soDienThoai: '0901000001',
      vaiTro: 'ADMIN',
      nhomMau: 'O',
      yeuToRh: '+',
      trangThai: 'HoatDong'
    });
    console.log('Đã tạo admin@hienmau.vn với mật khẩu Password@123');
  }

  await sequelize.close();
}

inspect().catch(err => {
  console.error('Lỗi khi inspect:', err);
  process.exit(1);
});
