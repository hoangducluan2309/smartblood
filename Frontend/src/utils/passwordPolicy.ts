export function getPasswordPolicyError(password: string): string | null {
  const length = Array.from(password).length;

  if (length < 8 || length > 64) {
    return 'Mật khẩu phải dài từ 8 đến 64 ký tự.';
  }
  if (new TextEncoder().encode(password).length > 72) {
    return 'Mật khẩu vượt quá giới hạn 72 byte UTF-8 của thuật toán bcrypt.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ in hoa (A-Z).';
  }
  if (!/[a-z]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ in thường (a-z).';
  }
  if (!/[0-9]/.test(password)) {
    return 'Mật khẩu phải có ít nhất 1 chữ số (0-9).';
  }
  const hasSpecialCharacter = Array.from(password).some((character) => {
    const code = character.charCodeAt(0);
    return (code >= 33 && code <= 47) ||
      (code >= 58 && code <= 64) ||
      (code >= 91 && code <= 96) ||
      (code >= 123 && code <= 126);
  });
  if (!hasSpecialCharacter) {
    return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt.';
  }

  return null;
}
