interface AttemptRecord {
  failedAttempts: number; // Số lần sai trong giai đoạn 1 (tối đa 5)
  lockedUntil: number | null; // Timestamp kết thúc tạm khóa 5 phút
  hasBeenTempLocked: boolean; // Đã từng bị tạm khóa 5 phút trước đó hay chưa
  postLockoutAttempts: number; // Số lần sai sau khi hết 5 phút tạm khóa (tối đa 3)
  lastAttemptAt: number;
}

export interface FailedAttemptResult {
  stage: 1 | 2;
  attempts: number;
  remainingAttempts: number;
  isTempLocked: boolean;
  isPermanentLock: boolean;
  lockDurationMinutes: number;
  message: string;
}

export interface LockoutCheckResult {
  isLocked: boolean;
  remainingMinutes: number;
  remainingSeconds: number;
  hasBeenTempLocked: boolean;
  postLockoutAttempts: number;
  failedAttempts: number;
}

/**
 * Quản lý số lần đăng nhập thất bại và cơ chế khóa 2 giai đoạn:
 * - Giai đoạn 1: Nhập sai tối đa 5 lần -> Tạm khóa 3 phút.
 * - Giai đoạn 2: Sau 3 phút tạm khóa, nếu nhập sai thêm 3 lần nữa -> Khóa luôn (trực tiếp vào Database),
 *   chỉ tài khoản Admin mới có quyền mở khóa lại.
 */
export class LoginLimiterService {
  private static instance: LoginLimiterService;
  private attempts = new Map<string, AttemptRecord>();

  public readonly STAGE1_MAX_ATTEMPTS = 5;
  public readonly STAGE2_MAX_ATTEMPTS = 3;
  public readonly LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 phút

  private constructor() {
    // Tự động dọn dẹp các bản ghi không còn hoạt động mỗi 10 phút
    const timer = setInterval(() => {
      this.cleanup();
    }, 10 * 60 * 1000);
    timer.unref?.();
  }

  public static getInstance(): LoginLimiterService {
    if (!LoginLimiterService.instance) {
      LoginLimiterService.instance = new LoginLimiterService();
    }
    return LoginLimiterService.instance;
  }

  private normalizeKey(identifier: string): string {
    return identifier.trim().toLowerCase();
  }

  /**
   * Kiểm tra xem tài khoản có đang trong thời gian bị tạm khóa 3 phút hay không
   */
  public checkLockout(identifier: string): LockoutCheckResult {
    const key = this.normalizeKey(identifier);
    const record = this.attempts.get(key);
    const now = Date.now();

    if (!record) {
      return {
        isLocked: false,
        remainingMinutes: 0,
        remainingSeconds: 0,
        hasBeenTempLocked: false,
        postLockoutAttempts: 0,
        failedAttempts: 0,
      };
    }

    // Kiểm tra xem có đang bị tạm khóa 3 phút không
    if (record.lockedUntil) {
      if (now < record.lockedUntil) {
        const remainingMs = record.lockedUntil - now;
        const remainingSeconds = Math.ceil(remainingMs / 1000);
        const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));

        return {
          isLocked: true,
          remainingMinutes,
          remainingSeconds,
          hasBeenTempLocked: record.hasBeenTempLocked,
          postLockoutAttempts: record.postLockoutAttempts,
          failedAttempts: record.failedAttempts,
        };
      } else {
        // Đã hết 3 phút tạm khóa -> Cho phép thử đăng nhập tiếp (chuyển sang giai đoạn 2)
        record.lockedUntil = null;
      }
    }

    return {
      isLocked: false,
      remainingMinutes: 0,
      remainingSeconds: 0,
      hasBeenTempLocked: record.hasBeenTempLocked,
      postLockoutAttempts: record.postLockoutAttempts,
      failedAttempts: record.failedAttempts,
    };
  }

  /**
   * Ghi nhận 1 lần nhập sai mật khẩu theo chu trình 2 giai đoạn:
   * - Giai đoạn 1: Đếm tới 5 lần -> Tạm khóa 3 phút.
   * - Giai đoạn 2: Sau 3 phút, đếm tới 3 lần -> Báo hiệu khóa vĩnh viễn (isPermanentLock = true).
   */
  public recordFailedAttempt(identifier: string): FailedAttemptResult {
    const key = this.normalizeKey(identifier);
    const now = Date.now();
    let record = this.attempts.get(key);

    if (!record) {
      record = {
        failedAttempts: 1,
        lockedUntil: null,
        hasBeenTempLocked: false,
        postLockoutAttempts: 0,
        lastAttemptAt: now,
      };
      this.attempts.set(key, record);

      return {
        stage: 1,
        attempts: 1,
        remainingAttempts: this.STAGE1_MAX_ATTEMPTS - 1,
        isTempLocked: false,
        isPermanentLock: false,
        lockDurationMinutes: 3,
        message: `Mật khẩu không chính xác. Bạn còn ${this.STAGE1_MAX_ATTEMPTS - 1} lần thử trước khi tài khoản bị tạm khóa 3 phút.`,
      };
    }

    record.lastAttemptAt = now;

    // Trường hợp: Tài khoản ĐÃ TỪNG bị tạm khóa 3 phút trước đó (Giai đoạn 2)
    if (record.hasBeenTempLocked) {
      record.postLockoutAttempts += 1;

      // Đã nhập sai 3 lần sau khi tạm khóa -> Khóa vĩnh viễn (chỉ admin mới mở lại được)
      if (record.postLockoutAttempts >= this.STAGE2_MAX_ATTEMPTS) {
        return {
          stage: 2,
          attempts: record.postLockoutAttempts,
          remainingAttempts: 0,
          isTempLocked: false,
          isPermanentLock: true,
          lockDurationMinutes: 0,
          message:
            'Tài khoản đã bị khóa vĩnh viễn do tiếp tục nhập sai mật khẩu sau thời gian tạm khóa nhằm bảo vệ an toàn thông tin. Vui lòng liên hệ Quản trị viên hệ thống để được hỗ trợ mở lại.',
        };
      }

      const remainingAfterTemp = this.STAGE2_MAX_ATTEMPTS - record.postLockoutAttempts;
      return {
        stage: 2,
        attempts: record.postLockoutAttempts,
        remainingAttempts: remainingAfterTemp,
        isTempLocked: false,
        isPermanentLock: false,
        lockDurationMinutes: 0,
        message: `Mật khẩu không chính xác. Bạn còn ${remainingAfterTemp} lượt thử cuối cùng trước khi tài khoản bị khóa. Vui lòng kiểm tra lại mật khẩu hoặc liên hệ Quản trị viên để được hỗ trợ.`,
      };
    }

    // Trường hợp: Giai đoạn 1 (Chưa từng bị tạm khóa)
    record.failedAttempts += 1;

    // Đạt 5 lần nhập sai -> Kích hoạt tạm khóa 3 phút
    if (record.failedAttempts >= this.STAGE1_MAX_ATTEMPTS) {
      record.lockedUntil = now + this.LOCKOUT_DURATION_MS;
      record.hasBeenTempLocked = true;
      record.postLockoutAttempts = 0; // Khởi tạo bộ đếm cho giai đoạn sau khi mở khóa

      return {
        stage: 1,
        attempts: record.failedAttempts,
        remainingAttempts: 0,
        isTempLocked: true,
        isPermanentLock: false,
        lockDurationMinutes: 3,
        message:
          'Bạn đã nhập sai mật khẩu 5 lần liên tiếp. Tài khoản đã bị tạm khóa trong 3 phút để bảo vệ an toàn thông tin. Vui lòng thử lại sau thời gian trên hoặc liên hệ Quản trị viên để được hỗ trợ mở khóa sớm.',
      };
    }

    const remainingStage1 = this.STAGE1_MAX_ATTEMPTS - record.failedAttempts;
    return {
      stage: 1,
      attempts: record.failedAttempts,
      remainingAttempts: remainingStage1,
      isTempLocked: false,
      isPermanentLock: false,
      lockDurationMinutes: 3,
      message: `Mật khẩu không chính xác. Bạn còn ${remainingStage1} lần thử trước khi tài khoản bị tạm khóa 3 phút.`,
    };
  }

  /**
   * Đặt lại toàn bộ số lần sai khi đăng nhập thành công hoặc khi Admin mở khóa
   */
  public resetAttempts(identifier: string): void {
    const key = this.normalizeKey(identifier);
    this.attempts.delete(key);
  }

  /**
   * Tự động dọn dẹp các bản ghi không còn hoạt động
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (record.lockedUntil && now >= record.lockedUntil && !record.hasBeenTempLocked) {
        this.attempts.delete(key);
      } else if (!record.lockedUntil && now - record.lastAttemptAt > 60 * 60 * 1000) {
        // Nếu không có hoạt động trong hơn 1 tiếng
        this.attempts.delete(key);
      }
    }
  }
}

export const loginLimiter = LoginLimiterService.getInstance();
