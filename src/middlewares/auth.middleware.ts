import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import type { AuthUserPayload } from '../dtos/auth.dto.js';
import type { VaiTro } from '../models/NguoiDung.js';

// Mở rộng kiểu dữ liệu Request của Express để chứa thông tin user sau khi xác thực
declare global {
  namespace Express {
    interface Request {
      user?: AuthUserPayload;
    }
  }
}

/**
 * Middleware xác thực Bearer JWT Token
 */
export function xacThucToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(AppError.unauthorized('Vui lòng đăng nhập để thực hiện chức năng này.'));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(AppError.unauthorized('Token xác thực không được để trống.'));
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret_hienmau_2026';

  try {
    const decoded = jwt.verify(token, jwtSecret) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error: unknown) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'));
    }
    return next(AppError.unauthorized('Token xác thực không hợp lệ hoặc đã bị thay đổi.'));
  }
}

/**
 * Middleware phân quyền (Role-based Access Control - RBAC)
 * @param allowedRoles Danh sách các vai trò được phép truy cập
 */
export function phanQuyen(...allowedRoles: VaiTro[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Yêu cầu xác thực tài khoản trước.'));
    }

    if (!allowedRoles.includes(req.user.vaiTro)) {
      return next(
        AppError.forbidden(`Truy cập bị từ chối. Chức năng này chỉ dành cho: [${allowedRoles.join(', ')}].`)
      );
    }

    next();
  };
}
