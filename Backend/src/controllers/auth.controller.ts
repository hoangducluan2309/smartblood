import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

export class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await authService.dangKy(req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký tài khoản thành công.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.dangNhap(req.body);
      res.status(200).json({
        success: true,
        message: 'Đăng nhập thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/profile
   */
  async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      const user = await authService.layThongTinCaNhan(req.user.id);
      res.status(200).json({
        success: true,
        message: 'Lấy thông tin tài khoản thành công.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const user = await authService.capNhatThongTinCaNhan(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật hồ sơ thành công.',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await authService.doiMatKhauCaNhan(req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Đổi mật khẩu thành công.',
      });
    } catch (error) {
      next(error);
    }
  }

}

export const authController = new AuthController();
