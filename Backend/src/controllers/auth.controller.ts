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

  /**
   * POST /api/v1/auth/forgot-password
   */
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = req.body?.email;
      const result = await authService.yeuCauQuenMatKhau(email);
      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, matKhauMoi } = req.body;
      const result = await authService.xacNhanDatLaiMatKhau(email, otp, matKhauMoi);
      res.status(200).json({
        success: true,
        message: result.message,
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
