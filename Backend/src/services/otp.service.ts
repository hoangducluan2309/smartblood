interface OtpRecord {
  code: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

export class OtpService {
  private static instance: OtpService;
  private otps = new Map<string, OtpRecord>();

  public readonly OTP_TTL_MS = 5 * 60 * 1000; // 5 phút
  public readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 giây giữa 2 lần gửi
  public readonly MAX_VERIFY_ATTEMPTS = 5; // Tối đa 5 lần nhập sai mã

  private constructor() {
    // Tự động dọn dẹp các mã OTP đã hết hạn mỗi 5 phút
    const timer = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
    timer.unref?.();
  }

  public static getInstance(): OtpService {
    if (!OtpService.instance) {
      OtpService.instance = new OtpService();
    }
    return OtpService.instance;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  /**
   * Tạo mã OTP ngẫu nhiên 6 chữ số cho email
   */
  public generateOtp(email: string): { code: string; expiresInMinutes: number } {
    const key = this.normalizeEmail(email);
    const now = Date.now();
    const existing = this.otps.get(key);

    // Kiểm tra cooldown gửi lại (phải cách nhau tối thiểu 60 giây)
    if (existing && now - existing.createdAt < this.RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((this.RESEND_COOLDOWN_MS - (now - existing.createdAt)) / 1000);
      throw new Error(`Vui lòng chờ ${waitSeconds} giây nữa trước khi yêu cầu gửi lại mã OTP.`);
    }

    // Sinh 6 chữ số ngẫu nhiên từ 100000 đến 999999
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    this.otps.set(key, {
      code,
      expiresAt: now + this.OTP_TTL_MS,
      attempts: 0,
      createdAt: now,
    });

    return {
      code,
      expiresInMinutes: 5,
    };
  }

  /**
   * Xác thực mã OTP người dùng nhập
   */
  public verifyOtp(email: string, inputCode: string): { valid: boolean; message: string } {
    const key = this.normalizeEmail(email);
    const record = this.otps.get(key);
    const now = Date.now();

    if (!record) {
      return {
        valid: false,
        message: 'Mã xác thực OTP không tồn tại hoặc đã hết hạn. Vui lòng yêu cầu gửi mã mới.',
      };
    }

    // Kiểm tra hết hạn (5 phút)
    if (now > record.expiresAt) {
      this.otps.delete(key);
      return {
        valid: false,
        message: 'Mã xác thực OTP đã hết hạn (quá 5 phút). Vui lòng yêu cầu gửi lại mã mới.',
      };
    }

    // Kiểm tra vượt quá số lần nhập sai
    if (record.attempts >= this.MAX_VERIFY_ATTEMPTS) {
      this.otps.delete(key);
      return {
        valid: false,
        message: 'Bạn đã nhập sai mã OTP quá 5 lần. Mã này đã bị hủy vì lý do bảo mật, vui lòng yêu cầu mã mới.',
      };
    }

    const cleanInput = inputCode.trim();
    if (cleanInput !== record.code) {
      record.attempts += 1;
      const remainingAttempts = this.MAX_VERIFY_ATTEMPTS - record.attempts;
      return {
        valid: false,
        message: `Mã OTP không chính xác. Bạn còn ${remainingAttempts} lần thử.`,
      };
    }

    // Xác thực thành công -> Xóa mã OTP để không bị dùng lại (Single-use)
    this.otps.delete(key);
    return {
      valid: true,
      message: 'Xác thực OTP thành công.',
    };
  }

  /**
   * Xóa OTP thủ công
   */
  public removeOtp(email: string): void {
    const key = this.normalizeEmail(email);
    this.otps.delete(key);
  }

  /**
   * Dọn dẹp các mã hết hạn
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.otps.entries()) {
      if (now > record.expiresAt) {
        this.otps.delete(key);
      }
    }
  }
}

export const otpService = OtpService.getInstance();
