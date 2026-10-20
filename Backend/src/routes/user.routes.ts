import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';
import { validateBody, Validators } from '../middlewares/validate.middleware.js';

const router: Router = Router();

// Tất cả các routes bên dưới đều yêu cầu quyền Quản trị viên (ADMIN)
router.use(xacThucToken, phanQuyen('ADMIN'));

// 1. Xem danh sách người dùng
router.get('/', (req, res, next) => userController.getUsers(req, res, next));

// 2. Xem chi tiết 1 người dùng
router.get('/:id', (req, res, next) => userController.getUserById(req, res, next));

// 3. Tạo tài khoản người dùng mới
router.post(
  '/',
  validateBody([
    Validators.required('hoTen', 'Họ tên'),
    Validators.required('email', 'Email'),
    Validators.email('email'),
    Validators.required('matKhau', 'Mật khẩu'),
    Validators.minLength('matKhau', 8, 'Mật khẩu'),
    Validators.required('soDienThoai', 'Số điện thoại'),
  ]),
  (req, res, next) => userController.createUser(req, res, next)
);

// 4. Cập nhật tài khoản người dùng
router.put('/:id', (req, res, next) => userController.updateUser(req, res, next));

// 5. Admin đặt lại mật khẩu cho tài khoản người dùng
router.put('/:id/password', (req, res, next) => userController.resetPassword(req, res, next));

// 6. Khóa / Mở khóa nhanh tài khoản
router.put('/:id/status', (req, res, next) => userController.toggleUserStatus(req, res, next));
router.patch('/:id/status', (req, res, next) => userController.toggleUserStatus(req, res, next));

// 7. Xóa vĩnh viễn tài khoản người dùng
router.delete('/:id', (req, res, next) => userController.deleteUser(req, res, next));

export const userRoutes: Router = router;
