import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { xacThucToken } from '../middlewares/auth.middleware.js';

import { validateBody, Validators } from '../middlewares/validate.middleware.js';

const router: Router = Router();

// 1. Đăng ký tài khoản mới (Có kiểm tra dữ liệu đầu vào)
router.post(
  '/register',
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

// 2. Đăng nhập hệ thống (Hỗ trợ Email, Số điện thoại hoặc CCCD)
router.post(
  '/login',
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

export const authRoutes: Router = router;
