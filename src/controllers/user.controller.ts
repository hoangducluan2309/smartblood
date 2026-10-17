import type { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { AppError } from '../utils/AppError.js';

export class UserController {
  /**
   * GET /api/v1/users
   * Admin: Xem danh sách tài khoản
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await userService.layDanhSachNguoiDung(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách người dùng thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/users/:id
   * Admin: Xem chi tiết 1 người dùng
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID người dùng không hợp lệ.');
      const user = await userService.layChiTietNguoiDung(id);
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin người dùng thành công.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/users
   * Admin: Tạo tài khoản người dùng mới
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const newUser = await userService.taoNguoiDung(req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo tài khoản người dùng mới thành công.',
        data: newUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Admin: Cập nhật thông tin người dùng
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID người dùng không hợp lệ.');
      const updatedUser = await userService.capNhatNguoiDung(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật tài khoản người dùng thành công.',
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/users/:id/status
   * Admin: Đổi nhanh trạng thái tài khoản (Khóa / Mở khóa)
   */
  async toggleUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID người dùng không hợp lệ.');
      const result = await userService.thayDoiTrangThai(id, req.user.id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Admin: Xóa tài khoản người dùng
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID người dùng không hợp lệ.');
      const result = await userService.xoaNguoiDung(id, req.user.id);
      res.status(200).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
