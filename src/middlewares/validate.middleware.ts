import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

type ValidationRule = (data: Record<string, unknown>) => string | null;

/**
 * Middleware kiểm tra và xác thực dữ liệu đầu vào (Input Validation Middleware)
 */
export function validateBody(rules: ValidationRule[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const error = rule(req.body || {});
      if (error) {
        errors.push(error);
      }
    }

    if (errors.length > 0) {
      return next(AppError.badRequest(`Dữ liệu đầu vào không hợp lệ: ${errors.join('; ')}`));
    }

    next();
  };
}

// ==============================================================================
// CÁC QUY TẮC VALIDATION TÁI SỬ DỤNG
// ==============================================================================

export const Validators = {
  required: (field: string, fieldName: string): ValidationRule => {
    return (data) => {
      const val = data[field];
      if (val === undefined || val === null || String(val).trim() === '') {
        return `Trường '${fieldName}' là bắt buộc`;
      }
      return null;
    };
  },

  email: (field: string = 'email'): ValidationRule => {
    return (data) => {
      const email = String(data[field] || '').trim();
      if (!email) return null; // Để required kiểm tra nếu cần
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return `Email không đúng định dạng`;
      }
      return null;
    };
  },

  minLength: (field: string, min: number, fieldName: string): ValidationRule => {
    return (data) => {
      const val = String(data[field] || '').trim();
      if (!val) return null;
      if (val.length < min) {
        return `'${fieldName}' phải có độ dài tối thiểu ${min} ký tự`;
      }
      return null;
    };
  },

  phone: (field: string = 'soDienThoai'): ValidationRule => {
    return (data) => {
      const phone = String(data[field] || '').trim();
      if (!phone) return null;
      const phoneRegex = /^[0-9]{10,11}$/;
      if (!phoneRegex.test(phone)) {
        return `Số điện thoại phải gồm 10 đến 11 chữ số`;
      }
      return null;
    };
  },

  oneOf: (field: string, allowedValues: string[], fieldName: string): ValidationRule => {
    return (data) => {
      const val = data[field];
      if (val === undefined || val === null) return null;
      if (!allowedValues.includes(String(val))) {
        return `'${fieldName}' chỉ được nhận một trong các giá trị: [${allowedValues.join(', ')}]`;
      }
      return null;
    };
  },

  isPositiveNumber: (field: string, fieldName: string): ValidationRule => {
    return (data) => {
      const val = data[field];
      if (val === undefined || val === null) return null;
      const num = Number(val);
      if (isNaN(num) || num <= 0) {
        return `'${fieldName}' phải là số dương lớn hơn 0`;
      }
      return null;
    };
  },
};
