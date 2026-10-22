import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { xacThucToken } from '../middlewares/auth.middleware.js';
import { validateBody, Validators } from '../middlewares/validate.middleware.js';
import { loginRateLimiter, registerRateLimiter } from '../middlewares/rateLimiter.middleware.js';

const router: Router = Router();

// 1. Đăng ký tài khoản mới (Chống spam hàng loạt & kiểm tra dữ liệu đầu vào)
router.post(
  '/register',
  registerRateLimiter,
  validateBody([
    Validators.required('email', 'Email'),
    Validators.email('email'),
    Validators.required('matKhau', 'Mật khẩu'),
    Validators.minLength('matKhau', 8, 'Mật khẩu'),
    Validators.required('hoTen', 'Họ tên'),
    Validators.fullName('hoTen', 'Họ tên'),
    Validators.required('soDienThoai', 'Số điện thoại'),
    Validators.phone('soDienThoai'),
    Validators.citizenId('cccd'),
  ]),
  (req, res, next) => authController.register(req, res, next)
);

// 2. Đăng nhập hệ thống (Bảo vệ chống Brute-force & Ddos - Tối đa 30 request/phút)
router.post(
  '/login',
  loginRateLimiter,
  validateBody([
    Validators.loginIdentifier('email'),
    Validators.required('matKhau', 'Mật khẩu'),
  ]),
  (req, res, next) => authController.login(req, res, next)
);

// 3. Lấy thông tin tài khoản người dùng hiện tại (Yêu cầu JWT Token)
router.get('/profile', xacThucToken, (req, res, next) => authController.getProfile(req, res, next));
router.put('/profile', xacThucToken, (req, res, next) => authController.updateProfile(req, res, next));
router.put('/change-password', xacThucToken, (req, res, next) => authController.changePassword(req, res, next));

// 4. Quên mật khẩu & Đặt lại mật khẩu qua mã OTP Gmail (Chống brute-force rate limiter)
router.post(
  '/forgot-password',
  loginRateLimiter,
  validateBody([
    Validators.required('email', 'Email'),
    Validators.email('email'),
  ]),
  (req, res, next) => authController.forgotPassword(req, res, next)
);

router.post(
  '/reset-password',
  loginRateLimiter,
  validateBody([
    Validators.required('email', 'Email'),
    Validators.email('email'),
    Validators.required('otp', 'Mã OTP'),
    Validators.otp('otp', 'Mã OTP'),
    Validators.required('matKhauMoi', 'Mật khẩu mới'),
    Validators.minLength('matKhauMoi', 8, 'Mật khẩu mới'),
  ]),
  (req, res, next) => authController.resetPassword(req, res, next)
);

export const authRoutes: Router = router;

