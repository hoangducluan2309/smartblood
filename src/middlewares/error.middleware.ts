import type { Request, Response, NextFunction } from 'express';
import {
  ValidationError,
  UniqueConstraintError,
  ForeignKeyConstraintError,
  DatabaseError,
  ConnectionError,
} from 'sequelize';
import { AppError } from '../utils/AppError.js';

interface ErrorResponse {
  success: false;
  message: string;
  data: null;
}

/**
 * Middleware xử lý lỗi tập trung cho toàn bộ ứng dụng
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.';

  // 1. Lỗi nghiệp vụ tùy chỉnh (AppError)
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // 2. Lỗi cú pháp JSON trong request body (Express Body Parser)
  else if (err instanceof SyntaxError && 'status' in err && (err as { status: number }).status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Cú pháp dữ liệu JSON gửi lên không hợp lệ.';
  }
  // 3. Lỗi xác thực dữ liệu của Sequelize (Validation Error)
  else if (err instanceof ValidationError) {
    statusCode = 422;
    message = err.errors.map((e) => e.message).join(', ') || 'Dữ liệu không hợp lệ.';
  }
  // 4. Lỗi trùng lặp dữ liệu duy nhất trong CSDL (Unique Constraint)
  else if (err instanceof UniqueConstraintError) {
    statusCode = 409;
    message = 'Dữ liệu đã tồn tại trong hệ thống (Email, Số điện thoại hoặc CCCD đã được sử dụng).';
  }
  // 5. Lỗi ràng buộc khóa ngoại (Foreign Key Constraint)
  else if (err instanceof ForeignKeyConstraintError) {
    statusCode = 400;
    message = 'Dữ liệu tham chiếu khóa ngoại không hợp lệ hoặc không tồn tại.';
  }
  // 6. Lỗi kết nối CSDL (Connection / Timeout)
  else if (err instanceof ConnectionError) {
    statusCode = 503;
    message = 'Dịch vụ cơ sở dữ liệu tạm thời không khả dụng. Vui lòng thử lại.';
    console.error('[Sequelize Connection Error]:', (err as Error).message);
  }
  // 7. Lỗi truy vấn cơ sở dữ liệu (Database Error)
  else if (err instanceof DatabaseError) {
    statusCode = 500;
    message = 'Đã xảy ra lỗi trong quá trình xử lý cơ sở dữ liệu.';
    // Tuyệt đối không gửi câu lệnh SQL về client, chỉ log ở server
    console.error('[Sequelize Database Error]:', (err as Error).message);
  }
  // 8. Các lỗi chưa xác định khác (500)
  else {
    const errorObj = err as Error;
    console.error('[Unhandled Internal Error]:', errorObj?.stack || errorObj?.message || err);
  }

  // Luôn trả về định dạng chuẩn: { success: false, message: string, data: null }
  res.status(statusCode).json({
    success: false,
    message,
    data: null,
  });
}
