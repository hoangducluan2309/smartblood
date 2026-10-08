import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { xacThucToken } from '../middlewares/auth.middleware.js';

const router: Router = Router();

// 1. Đăng ký tài khoản mới
router.post('/register', (req, res, next) => authController.register(req, res, next));

// 2. Đăng nhập hệ thống
router.post('/login', (req, res, next) => authController.login(req, res, next));

// 3. Lấy thông tin tài khoản người dùng hiện tại (Yêu cầu JWT Token)
router.get('/profile', xacThucToken, (req, res, next) => authController.getProfile(req, res, next));

export const authRoutes: Router = router;
