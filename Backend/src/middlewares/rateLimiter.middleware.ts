import type { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number; // Khoảng thời gian theo dõi (milliseconds)
  maxRequests: number; // Số lượng request tối đa trong khoảng thời gian
  message: string; // Thông điệp trả về khi vượt giới hạn
}

/**
 * Middleware Rate Limiter nhẹ và tối ưu để ngăn chặn tấn công Brute-force & DDoS
 * Phục vụ giải quyết bài toán: "Một người liên tục gửi hàng nghìn request đến API Login"
 */
export function createRateLimiter(options: RateLimitOptions) {
  const store = new Map<string, RateLimitRecord>();

  // Tự động dọn dẹp các IP đã hết hạn mỗi 5 phút
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (now >= record.resetAt) {
        store.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
  timer.unref?.();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const now = Date.now();
    let record = store.get(clientIp);

    if (!record || now >= record.resetAt) {
      record = {
        count: 1,
        resetAt: now + options.windowMs,
      };
      store.set(clientIp, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        success: false,
        message: options.message,
        retryAfter: retryAfterSeconds,
      });
      return;
    }

    next();
  };
}

/**
 * 1. Giới hạn tấn công Brute-force vào API Login
 * Tối đa 30 request / 1 phút từ cùng 1 IP
 */
export const loginRateLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 phút
  maxRequests: 30,
  message: 'Phát hiện lưu lượng bất thường. Bạn đã gửi quá nhiều yêu cầu đăng nhập liên tục (tối đa 30 lần/phút). Vui lòng thử lại sau 1 phút.',
});

/**
 * 2. Ngăn chặn bot spam tạo tài khoản hàng loạt
 * Tối đa 10 request đăng ký / 5 phút từ cùng 1 IP
 */
export const registerRateLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000, // 5 phút
  maxRequests: 10,
  message: 'Bạn đã gửi quá nhiều yêu cầu đăng ký tài khoản từ địa chỉ này. Vui lòng thử lại sau 5 phút.',
});
