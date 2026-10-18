/**
 * Kiểm tra tính hợp lệ của mật khẩu theo chính sách bảo mật
 * @param password Mật khẩu cần kiểm tra
 * @returns Thông báo lỗi nếu không hợp lệ, hoặc null nếu hợp lệ
 */
export function getPasswordPolicyError(password: string): string | null {
  if (!password || typeof password !== 'string') {
    return 'Mật khẩu không được để trống.';
  }
  if (password.length < 6) {
    return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
  }
  return null;
}
