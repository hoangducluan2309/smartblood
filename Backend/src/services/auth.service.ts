import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { NguoiDung } from '../models/NguoiDung.js';
import { hashPassword, comparePassword } from '../utils/password.util.js';
import { getPasswordPolicyError } from '../utils/passwordPolicy.js';
import { AppError } from '../utils/AppError.js';
import { loginLimiter } from './loginLimiter.service.js';
import { otpService } from './otp.service.js';
import { emailService } from './email.service.js';
import type {
  RegisterDTO,
  LoginDTO,
  LoginResponseDTO,
  UserResponseDTO,
  AuthUserPayload,
  UpdateMyProfileDTO,
  ChangeMyPasswordDTO,
} from '../dtos/auth.dto.js';

export class AuthService {
  /**
   * Đăng ký tài khoản người dùng mới (Chỉ cho phép tạo 1 tài khoản cho mỗi request)
   */
  async dangKy(input: RegisterDTO): Promise<UserResponseDTO> {
    if (!input || Array.isArray(input) || typeof input !== 'object') {
      throw AppError.badRequest('Hệ thống chỉ cho phép tạo duy nhất 1 tài khoản cho mỗi yêu cầu đăng ký.');
    }

    const { hoTen, email, matKhau, soDienThoai, cccd, nhomMau, yeuToRh, diaChi } = input;

    if (!email || typeof matKhau !== 'string' || !hoTen || !soDienThoai) {
      throw AppError.badRequest('Vui lòng cung cấp đầy đủ: họ tên, email, mật khẩu và số điện thoại.');
    }

    if (/\d/.test(hoTen)) {
      throw AppError.badRequest('Họ và tên chỉ được chứa chữ cái, không được chứa số.');
    }

    if (!/^0\d{9}$/.test(soDienThoai.trim())) {
      throw AppError.badRequest('Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.');
    }

    if (cccd && cccd.trim() && !/^\d{12}$/.test(cccd.trim())) {
      throw AppError.badRequest('Số CCCD phải gồm đúng 12 chữ số.');
    }

    const passwordPolicyError = getPasswordPolicyError(matKhau);
    if (passwordPolicyError) {
      throw AppError.badRequest(passwordPolicyError);
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

    // Chuẩn hóa nhóm máu và yếu tố Rh để tuân thủ CHECK CONSTRAINT trong CSDL
    let normalizedNhomMau: string | null = null;
    let normalizedRh: string | null = null;

    if (nhomMau) {
      const cleanMau = nhomMau.trim().toUpperCase();
      if (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(cleanMau)) {
        normalizedNhomMau = cleanMau;
        normalizedRh = cleanMau.endsWith('+') ? 'Rh+' : 'Rh-';
      } else if (['A', 'B', 'AB', 'O'].includes(cleanMau)) {
        const rhSign = (yeuToRh && (yeuToRh.includes('-') || yeuToRh.toLowerCase().includes('am'))) ? '-' : '+';
        normalizedNhomMau = `${cleanMau}${rhSign}`;
        normalizedRh = rhSign === '-' ? 'Rh-' : 'Rh+';
      }
    }

    if (yeuToRh && !normalizedRh) {
      if (yeuToRh === '+' || yeuToRh === 'Rh+' || yeuToRh.toLowerCase().includes('duong')) {
        normalizedRh = 'Rh+';
      } else if (yeuToRh === '-' || yeuToRh === 'Rh-' || yeuToRh.toLowerCase().includes('am')) {
        normalizedRh = 'Rh-';
      }
    }

    // 5. Tạo người dùng mới
    const newUser = await NguoiDung.create({
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhauHash,
      soDienThoai: soDienThoai.trim(),
      cccd: cccd ? cccd.trim() : null,
      nhomMau: normalizedNhomMau,
      yeuToRh: normalizedRh,
      diaChi: diaChi ? diaChi.trim() : null,
      vaiTro: 'DONOR',
      trangThai: 'HoatDong',
    });

    return newUser.toJSON() as UserResponseDTO;
  }

  /**
   * Đăng nhập và cấp phát JWT Access Token
   * Tuân thủ quy tắc bảo mật:
   * - Nhập sai mật khẩu: Trả về lỗi 401, không cấp JWT
   * - Nhập sai tối đa 5 lần: Khóa tài khoản tạm thời trong 15 phút
   * - Tài khoản không tồn tại: Trả về lỗi 401, không cấp JWT
   * - Tài khoản bị khóa: Từ chối đăng nhập (403), không cấp JWT
   */
  async dangNhap(input: LoginDTO): Promise<LoginResponseDTO> {
    const matKhau = input.matKhau || input.password;
    const identifier = (
      input.email ||
      input.taiKhoan ||
      input.soDienThoai ||
      input.cccd ||
      input.identifier ||
      input.phoneOrEmail ||
      ''
    ).trim();

    if (!identifier || !matKhau) {
      throw AppError.badRequest('Vui lòng nhập tài khoản (Email, Số điện thoại hoặc CCCD) và mật khẩu.');
    }

    // 1. Kiểm tra tài khoản có đang bị tạm khóa 3 phút do nhập sai mật khẩu quá 5 lần không
    const preLockCheck = loginLimiter.checkLockout(identifier);
    if (preLockCheck.isLocked) {
      throw AppError.unauthorized(
        `Tài khoản đang bị tạm khóa do nhập sai mật khẩu 5 lần liên tiếp. Vui lòng thử lại sau ${preLockCheck.remainingMinutes} phút (${preLockCheck.remainingSeconds} giây) hoặc liên hệ Quản trị viên để được hỗ trợ mở khóa.`
      );
    }

    // 2. Tìm người dùng theo Email, Số điện thoại hoặc CCCD
    const user = await NguoiDung.findOne({
      where: {
        [Op.or]: [
          { email: identifier.toLowerCase() },
          { soDienThoai: identifier },
          { cccd: identifier },
        ],
      },
    });

    // Trường hợp 3 trong bảng quy tắc: Tài khoản không tồn tại -> Không cấp JWT (401)
    if (!user) {
      const attemptResult = loginLimiter.recordFailedAttempt(identifier);
      if (attemptResult.isTempLocked) {
        throw AppError.unauthorized(
          `Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị tạm khóa trong 3 phút để bảo vệ an toàn thông tin. Vui lòng thử lại sau thời gian trên hoặc liên hệ Quản trị viên để được hỗ trợ mở khóa sớm.`
        );
      }
      throw AppError.unauthorized('Tài khoản không tồn tại trong hệ thống hoặc mật khẩu không chính xác.');
    }

    // Kiểm tra khóa theo email chính xác của user (tránh trường hợp dùng số điện thoại khác nhau)
    const userLockCheck = loginLimiter.checkLockout(user.email);
    if (userLockCheck.isLocked) {
      throw AppError.unauthorized(
        `Tài khoản đang bị tạm khóa do nhập sai mật khẩu 5 lần liên tiếp. Vui lòng thử lại sau ${userLockCheck.remainingMinutes} phút (${userLockCheck.remainingSeconds} giây) hoặc liên hệ Quản trị viên để được hỗ trợ mở khóa.`
      );
    }

    // Trường hợp 4 trong bảng quy tắc: Tài khoản bị khóa (chỉ admin mới mở lại được) -> Từ chối đăng nhập
    if (user.trangThai === 'Khoa') {
      throw AppError.forbidden('Tài khoản hiện đang bị khóa nhằm bảo vệ an toàn thông tin. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ mở lại.');
    }

    // Trường hợp 2 trong bảng quy tắc: Đúng tài khoản, sai mật khẩu -> Không cấp JWT, đếm số lần sai theo 2 giai đoạn
    const isPasswordValid = await comparePassword(matKhau, user.matKhauHash);
    if (!isPasswordValid) {
      const attemptResult = loginLimiter.recordFailedAttempt(user.email);

      // GIAI ĐOẠN 2: Sau 3 phút tạm khóa, nhập sai thêm 3 lần -> KHÓA LUÔN VÀO CSDL (Chỉ Admin mới mở lại được)
      if (attemptResult.isPermanentLock) {
        user.trangThai = 'Khoa';
        await user.save();
        throw AppError.unauthorized(
          'Tài khoản đã bị khóa vĩnh viễn do tiếp tục nhập sai mật khẩu sau thời gian tạm khóa nhằm bảo vệ an toàn thông tin. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ mở lại.'
        );
      }

      // GIAI ĐOẠN 1: Nhập sai đạt ngưỡng 5 lần -> Kích hoạt tạm khóa 3 phút
      if (attemptResult.isTempLocked) {
        throw AppError.unauthorized(
          'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị tạm khóa trong 3 phút để bảo vệ an toàn thông tin. Vui lòng thử lại sau thời gian trên hoặc liên hệ Quản trị viên để được hỗ trợ mở khóa sớm.'
        );
      }

      // Chưa đạt ngưỡng -> Cảnh báo số lần thử còn lại tương ứng với từng giai đoạn
      throw AppError.unauthorized(attemptResult.message);
    }

    // Trường hợp 1 trong bảng quy tắc: Đúng tài khoản, đúng mật khẩu -> Reset số lần sai và Cấp JWT
    loginLimiter.resetAttempts(user.email);

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

  async capNhatThongTinCaNhan(userId: number, input: UpdateMyProfileDTO): Promise<UserResponseDTO> {
    const user = await NguoiDung.findByPk(userId);
    if (!user) throw AppError.notFound('Không tìm thấy thông tin người dùng.');
    if (
      !input ||
      typeof input.hoTen !== 'string' ||
      typeof input.email !== 'string' ||
      typeof input.soDienThoai !== 'string' ||
      (input.diaChi !== undefined && typeof input.diaChi !== 'string')
    ) {
      throw AppError.badRequest('Thông tin hồ sơ không hợp lệ.');
    }

    const hoTen = input.hoTen?.trim();
    const email = input.email?.trim().toLowerCase();
    const soDienThoai = input.soDienThoai?.trim();

    if (!hoTen || !email || !soDienThoai) {
      throw AppError.badRequest('Họ tên, email và số điện thoại không được để trống.');
    }
    if (/\d/.test(hoTen)) {
      throw AppError.badRequest('Họ và tên chỉ được chứa chữ cái, không được chứa số.');
    }
    if (hoTen.length > 100 || email.length > 100 || soDienThoai.length > 15) {
      throw AppError.badRequest('Họ tên, email hoặc số điện thoại vượt quá độ dài cho phép.');
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw AppError.badRequest('Email không đúng định dạng.');
    }

    const duplicateEmail = await NguoiDung.findOne({ where: { email } });
    if (duplicateEmail && duplicateEmail.id !== userId) {
      throw AppError.conflict('Email này đã thuộc về tài khoản khác.');
    }
    const duplicatePhone = await NguoiDung.findOne({ where: { soDienThoai } });
    if (duplicatePhone && duplicatePhone.id !== userId) {
      throw AppError.conflict('Số điện thoại này đã thuộc về tài khoản khác.');
    }

    const diaChi = input.diaChi?.trim() || null;
    if ((diaChi?.length || 0) > 255) {
      throw AppError.badRequest('Địa chỉ vượt quá độ dài cho phép.');
    }

    user.hoTen = hoTen;
    user.email = email;
    user.soDienThoai = soDienThoai;
    user.diaChi = diaChi;
    await user.save();

    return user.toJSON() as UserResponseDTO;
  }

  async doiMatKhauCaNhan(userId: number, input: ChangeMyPasswordDTO): Promise<void> {
    if (
      !input ||
      typeof input.matKhauHienTai !== 'string' ||
      typeof input.matKhauMoi !== 'string' ||
      typeof input.xacNhanMatKhau !== 'string'
    ) {
      throw AppError.badRequest('Thông tin mật khẩu không hợp lệ.');
    }
    const { matKhauHienTai, matKhauMoi, xacNhanMatKhau } = input;
    if (!matKhauHienTai.trim() || !matKhauMoi || !xacNhanMatKhau) {
      throw AppError.badRequest('Vui lòng nhập đầy đủ các trường mật khẩu.');
    }
    const passwordPolicyError = getPasswordPolicyError(matKhauMoi);
    if (passwordPolicyError) {
      throw AppError.badRequest(passwordPolicyError);
    }
    if (matKhauMoi !== xacNhanMatKhau) {
      throw AppError.badRequest('Mật khẩu xác nhận không khớp.');
    }
    if (matKhauMoi === matKhauHienTai) {
      throw AppError.badRequest('Mật khẩu mới phải khác mật khẩu hiện tại.');
    }

    const user = await NguoiDung.findByPk(userId);
    if (!user) throw AppError.notFound('Không tìm thấy thông tin người dùng.');
    if (!(await comparePassword(matKhauHienTai, user.matKhauHash))) {
      throw AppError.badRequest('Mật khẩu hiện tại không chính xác.');
    }

    user.matKhauHash = await hashPassword(matKhauMoi);
    await user.save();
  }

  /**
   * Yêu cầu đặt lại mật khẩu: Sinh mã OTP và gửi qua Gmail thực tế
   */
  async yeuCauQuenMatKhau(emailInput: string): Promise<{ message: string; email: string }> {
    if (!emailInput || typeof emailInput !== 'string') {
      throw AppError.badRequest('Vui lòng cung cấp địa chỉ email hợp lệ.');
    }
    const cleanEmail = emailInput.trim().toLowerCase();

    const user = await NguoiDung.findOne({ where: { email: cleanEmail } });
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản nào gắn với địa chỉ email này trong hệ thống.');
    }

    try {
      const otpInfo = otpService.generateOtp(user.email);
      await emailService.sendPasswordResetOtp(user.email, user.hoTen, otpInfo.code);

      return {
        message: `Mã xác thực OTP (6 chữ số) đã được gửi đến hộp thư Gmail [${user.email}]. Mã có hiệu lực trong vòng 5 phút.`,
        email: user.email,
      };
    } catch (err: any) {
      throw AppError.badRequest(err.message || 'Không thể tạo mã xác thực OTP.');
    }
  }

  /**
   * Xác thực mã OTP và tiến hành cập nhật mật khẩu mới
   */
  async xacNhanDatLaiMatKhau(
    emailInput: string,
    otpCode: string,
    matKhauMoi: string
  ): Promise<{ message: string }> {
    if (!emailInput || !otpCode || !matKhauMoi) {
      throw AppError.badRequest('Vui lòng cung cấp đầy đủ: email, mã xác thực OTP và mật khẩu mới.');
    }
    const cleanEmail = emailInput.trim().toLowerCase();

    // 1. Kiểm tra chính sách mật khẩu mới
    const passwordPolicyError = getPasswordPolicyError(matKhauMoi);
    if (passwordPolicyError) {
      throw AppError.badRequest(passwordPolicyError);
    }

    // 2. Xác thực mã OTP
    const verifyResult = otpService.verifyOtp(cleanEmail, otpCode);
    if (!verifyResult.valid) {
      throw AppError.badRequest(verifyResult.message);
    }

    // 3. Tìm tài khoản người dùng
    const user = await NguoiDung.findOne({ where: { email: cleanEmail } });
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản người dùng.');
    }

    // 4. Cập nhật mật khẩu mới và gỡ trạng thái khóa nếu có
    user.matKhauHash = await hashPassword(matKhauMoi);
    if (user.trangThai === 'Khoa') {
      user.trangThai = 'HoatDong';
    }
    await user.save();

    // 5. Đặt lại bộ đếm vi phạm đăng nhập
    loginLimiter.resetAttempts(user.email);

    return {
      message: 'Đặt lại mật khẩu thành công! Tài khoản của bạn đã được cập nhật, bạn có thể đăng nhập ngay.',
    };
  }
}

export const authService = new AuthService();
