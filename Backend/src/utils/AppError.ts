/**
 * Lớp xử lý lỗi tùy chỉnh cho toàn bộ hệ thống (Operational Errors)
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Giữ nguyên stack trace hữu ích cho việc debug
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  // Các phương thức tiện ích khởi tạo nhanh mã lỗi phổ biến
  static badRequest(message: string = 'Yêu cầu không hợp lệ'): AppError {
    return new AppError(message, 400);
  }

  static unauthorized(message: string = 'Không có quyền truy cập hoặc phiên đăng nhập đã hết hạn'): AppError {
    return new AppError(message, 401);
  }

  static forbidden(message: string = 'Bạn không có quyền thực hiện hành động này'): AppError {
    return new AppError(message, 403);
  }

  static notFound(message: string = 'Tài nguyên yêu cầu không tồn tại'): AppError {
    return new AppError(message, 404);
  }

  static conflict(message: string = 'Dữ liệu bị trùng lặp hoặc xung đột'): AppError {
    return new AppError(message, 409);
  }

  static unprocessableEntity(message: string = 'Dữ liệu đầu vào không hợp lệ'): AppError {
    return new AppError(message, 422);
  }

  static internal(message: string = 'Lỗi máy chủ nội bộ'): AppError {
    return new AppError(message, 500);
  }
}
