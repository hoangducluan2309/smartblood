import { AuthService } from '../services/auth.service.js';
import { authenticateDatabase, sequelize } from '../config/database.js';

async function testServiceDirectly() {
  await authenticateDatabase();

  const authService = new AuthService();
  
  try {
    console.log('\n--- BẮT ĐẦU KIỂM TRA ĐĂNG NHẬP QUA AUTH SERVICE ---');
    const result = await authService.dangNhap({
      email: 'admin@hienmau.vn',
      matKhau: 'Password@123'
    });

    console.log('✅ ĐĂNG NHẬP THÀNH CÔNG 100%!');
    console.log('User ID:', result.user.id);
    console.log('Email:', result.user.email);
    console.log('Họ tên:', result.user.hoTen);
    console.log('Vai trò:', result.user.vaiTro);
    console.log('Access Token được cấp:', result.accessToken.substring(0, 30) + '...');
  } catch (error: any) {
    console.error('❌ Đăng nhập thất bại:', error.message);
  }

  await sequelize.close();
}

testServiceDirectly();
