import jwt from 'jsonwebtoken';
import { NguoiDung } from '../models/NguoiDung.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { AppError } from '../utils/AppError.js';
import type { RegisterDTO, LoginDTO, LoginResponseDTO, UserResponseDTO, AuthUserPayload } from '../dtos/auth.dto.js';

export class AuthService {
  /**
   * Đăng ký tài khoản người dùng mới
   */
  async dangKy(input: RegisterDTO): Promise<UserResponseDTO> {
    const { hoTen, email, matKhau, soDienThoai, cccd, nhomMau, yeuToRh, diaChi, vaiTro } = input;

    if (!email || !matKhau || !hoTen || !soDienThoai) {
      throw AppError.badRequest('Vui lòng cung cấp đầy đủ: họ tên, email, mật khẩu và số điện thoại.');
    }

    if (matKhau.length < 6) {
      throw AppError.badRequest('Mật khẩu phải có độ dài tối thiểu 6 ký tự.');
    }

    // 1. Kiểm tra email đã tồn tại chưa
    const existingEmail = await NguoiDung.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingEmail) {
      throw AppError.conflict('Email này đã được sử dụng trong hệ thống.');
    }

    // 2. Kiểm tra số điện thoại đã tồn tại chưa
    const existingPhone = await NguoiDung.findOne({ where: { soDienThoai: soDienThoai.trim() } });
    if (existingPhone) {
      throw AppError.conflict('Số điện thoại này đã được sử dụng trong hệ thống.');
    }

    // 3. Kiểm tra CCCD (nếu có cung cấp)
    if (cccd && cccd.trim()) {
      const existingCccd = await NguoiDung.findOne({ where: { cccd: cccd.trim() } });
      if (existingCccd) {
        throw AppError.conflict('Số CCCD này đã tồn tại trong hệ thống.');
      }
    }

    // 4. Băm mật khẩu an toàn với bcrypt
    const matKhauHash = await hashPassword(matKhau);

    // 5. Tạo người dùng mới
    const newUser = await NguoiDung.create({
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhauHash,
      soDienThoai: soDienThoai.trim(),
      cccd: cccd ? cccd.trim() : null,
      nhomMau: nhomMau || null,
      yeuToRh: yeuToRh || null,
      diaChi: diaChi ? diaChi.trim() : null,
      vaiTro: vaiTro || 'DONOR',
      trangThai: 'HoatDong',
    });

    return newUser.toJSON() as UserResponseDTO;
  }

  /**
   * Đăng nhập và cấp phát JWT Access Token (thời hạn 1 ngày)
   */
  async dangNhap(input: LoginDTO): Promise<LoginResponseDTO> {
    const { email, matKhau } = input;

    if (!email || !matKhau) {
      throw AppError.badRequest('Vui lòng nhập đầy đủ email và mật khẩu.');
    }

    // 1. Tìm người dùng theo email
    const user = await NguoiDung.findOne({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      throw AppError.unauthorized('Email hoặc mật khẩu không chính xác.');
    }

    // 2. Kiểm tra trạng thái tài khoản
    if (user.trangThai === 'Khoa') {
      throw AppError.forbidden('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // 3. Kiểm tra mật khẩu
    const isPasswordValid = await comparePassword(matKhau, user.matKhauHash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Email hoặc mật khẩu không chính xác.');
    }

    // 4. Tạo JWT Access Token
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_hienmau_2026';
    const payload: AuthUserPayload = {
      id: user.id,
      email: user.email,
      vaiTro: user.vaiTro,
      hoTen: user.hoTen,
    };

    const accessToken = jwt.sign(payload, jwtSecret, {
      expiresIn: '1d', // Token có thời hạn 1 ngày
    });

    return {
      accessToken,
      user: user.toJSON() as UserResponseDTO,
    };
  }

  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   */
  async layThongTinCaNhan(userId: number): Promise<UserResponseDTO> {
    const user = await NguoiDung.findByPk(userId);
    if (!user) {
      throw AppError.notFound('Không tìm thấy thông tin người dùng.');
    }
    return user.toJSON() as UserResponseDTO;
  }
}

export const authService = new AuthService();
