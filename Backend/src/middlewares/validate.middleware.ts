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

  loginIdentifier: (field: string = 'email'): ValidationRule => {
    return (data) => {
      const val = String(data[field] || data.identifier || data.taiKhoan || data.soDienThoai || data.cccd || '').trim();
      if (!val) {
        return `Vui lòng nhập Email, Số điện thoại hoặc CCCD`;
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
      const phoneRegex = /^0[0-9]{9}$/;
      if (!phoneRegex.test(phone)) {
        return `Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số`;
      }
      return null;
    };
  },

  citizenId: (field: string = 'cccd'): ValidationRule => {
    return (data) => {
      const cccd = String(data[field] || '').trim();
      if (!cccd) return null;
      const cccdRegex = /^[0-9]{12}$/;
      if (!cccdRegex.test(cccd)) {
        return `Số CCCD phải gồm đúng 12 chữ số`;
      }
      return null;
    };
  },

  fullName: (field: string = 'hoTen', fieldName: string = 'Họ tên'): ValidationRule => {
    return (data) => {
      const val = String(data[field] || '').trim();
      if (!val) return null;
      if (/\d/.test(val)) {
        return `'${fieldName}' chỉ được chứa chữ cái, không được chứa số`;
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
