import type { Request, Response, NextFunction } from 'express';

// Danh sách các trường nhạy cảm cần ẩn khi ghi log
const SENSITIVE_FIELDS = new Set([
  'password',
  'mat_khau',
  'matkhau',
  'mat_khau_hash',
  'token',
  'refreshtoken',
  'refresh_token',
  'accesstoken',
  'access_token',
  'authorization',
  'cccd',
  'so_dien_thoai',
  'secret',
]);

/**
 * Đệ quy làm sạch các trường dữ liệu nhạy cảm trong object hoặc array
 */
function maskSensitiveData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(maskSensitiveData);
  }

  if (typeof data === 'object') {
    const masked: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
        masked[key] = '*** MASKED ***';
      } else if (typeof value === 'object' && value !== null) {
        masked[key] = maskSensitiveData(value);
      } else {
        masked[key] = value;
      }
    }
    return masked;
  }

  return data;
}

/**
 * Middleware ghi log chi tiết request, response time và che giấu thông tin nhạy cảm
 */
export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const startTime = process.hrtime();
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  const ip = req.ip || req.socket.remoteAddress;

  // Lắng nghe sự kiện finish khi response gửi xong cho client
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const durationMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
    const statusCode = res.statusCode;

    // Phân loại mức độ log theo HTTP status code
    let statusColor = '\x1b[32m'; // Xanh lá: 2xx, 3xx
    if (statusCode >= 400 && statusCode < 500) {
      statusColor = '\x1b[33m'; // Vàng: 4xx
    } else if (statusCode >= 500) {
      statusColor = '\x1b[31m'; // Đỏ: 5xx
    }
    const resetColor = '\x1b[0m';

    console.log(
      `[${timestamp}] [${method}] ${url} -> ${statusColor}${statusCode}${resetColor} (${durationMs}ms) - IP: ${ip}`
    );

    // Ghi log chi tiết payload trong môi trường development (đã che trường nhạy cảm)
    if (process.env.NODE_ENV === 'development' && req.body && Object.keys(req.body).length > 0) {
      const sanitizedBody = maskSensitiveData(req.body);
      console.log(`  └─ [Payload]:`, JSON.stringify(sanitizedBody));
    }
  });

  next();
}
