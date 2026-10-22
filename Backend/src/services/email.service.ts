import nodemailer, { type Transporter } from 'nodemailer';

export class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;

  private constructor() {
    this.initTransporter();
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initTransporter(): void {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;

    if (user && pass) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
      console.log(`📧 [EMAIL SERVICE] Đã kết nối Gmail SMTP với tài khoản: ${user}`);
    } else {
      this.transporter = null;
      console.log('⚠️ [EMAIL SERVICE] Chưa cấu hình EMAIL_USER và EMAIL_APP_PASSWORD trong .env. Hệ thống sẽ in mã OTP ra Terminal để kiểm thử.');
    }
  }

  /**
   * Gửi email mã OTP cấp lại mật khẩu
   */
  public async sendPasswordResetOtp(
    toEmail: string,
    hoTen: string,
    otpCode: string
  ): Promise<{ sent: boolean; simulated: boolean }> {
    const nowStr = new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

    // HTML Email Template chuẩn Y tế SMARTBLOOD cực đẹp
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Mã Xác Thực Đặt Lại Mật Khẩu - SMARTBLOOD</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
  <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #dc2626 0%, #e11d48 50%, #991b1b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
      <div style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; margin-bottom: 6px;">
        🩸 SMARTBLOOD
      </div>
      <div style="font-size: 13px; font-weight: 500; opacity: 0.95;">
        Hệ Thống Điều Phối Hiến Máu Nhân Đạo & Cấp Cứu 24/7
      </div>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px 24px; color: #334155; line-height: 1.6;">
      <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 12px;">
        Yêu Cầu Cấp Lại Mật Khẩu
      </h2>
      <p style="font-size: 14px; margin-bottom: 20px;">
        Xin chào <strong>${hoTen}</strong>, hệ thống đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>${toEmail}</strong> vào lúc ${nowStr}.
      </p>

      <p style="font-size: 14px; margin-bottom: 16px;">
        Vui lòng sử dụng mã xác thực OTP 6 chữ số dưới đây để tiến hành thiết lập mật khẩu mới:
      </p>

      <!-- OTP Box -->
      <div style="background-color: #fef2f2; border: 2px dashed #f87171; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #dc2626; font-family: monospace;">
          ${otpCode}
        </span>
        <div style="font-size: 12px; color: #dc2626; font-weight: 600; margin-top: 8px;">
          ⏱️ Mã có hiệu lực trong vòng 5 phút (hết hạn lúc 5 phút tới)
        </div>
      </div>

      <div style="background-color: #f1f5f9; border-radius: 12px; padding: 14px 16px; font-size: 12px; color: #64748b; margin-bottom: 20px;">
        ⚠️ <strong>Lưu ý an toàn:</strong> Tuyệt đối không chia sẻ mã xác thực này cho bất kỳ ai, kể cả nhân viên y tế hay quản trị viên hệ thống. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc liên hệ ngay hotline 1900 6868.
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
      © 2026 SMARTBLOOD - Vì Sự Sống Của Người Bệnh.<br>
      Email tự động, vui lòng không phản hồi thư này.
    </div>

  </div>
</body>
</html>
    `;

    // Nếu đã cấu hình Gmail Transporter thật
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"SMARTBLOOD Y Tế" <${process.env.EMAIL_USER}>`,
          to: toEmail,
          subject: `[SMARTBLOOD] Mã OTP Xác Thực Đặt Lại Mật Khẩu: ${otpCode}`,
          html: htmlContent,
        });

        console.log(`✅ [EMAIL SENT] Đã gửi mã OTP (${otpCode}) thành công đến Gmail: ${toEmail}`);
        return { sent: true, simulated: false };
      } catch (err: any) {
        console.error(`❌ [EMAIL ERROR] Lỗi khi gửi Gmail qua SMTP:`, err.message);
        // Fallback in ra console để dev không bị gián đoạn
        console.log(`\n=============================================================`);
        console.log(`🔑 [OTP FALLBACK CONSOLE] Gửi cho: ${toEmail} | MÃ OTP: ${otpCode}`);
        console.log(`=============================================================\n`);
        return { sent: true, simulated: true };
      }
    } else {
      // Trường hợp chưa cấu hình App Password: In ra console rõ ràng
      console.log(`\n=============================================================`);
      console.log(`📧 [EMAIL MOCK] Bạn chưa cấu hình EMAIL_USER và EMAIL_APP_PASSWORD.`);
      console.log(`👤 Người nhận: ${hoTen} <${toEmail}>`);
      console.log(`🔑 MÃ XÁC THỰC OTP: >>> ${otpCode} <<< (Hiệu lực: 5 phút)`);
      console.log(`=============================================================\n`);
      return { sent: true, simulated: true };
    }
  }
}

export const emailService = EmailService.getInstance();
