import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Băm mật khẩu bằng thuật toán bcrypt
 */
export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

/**
 * So khớp mật khẩu người dùng nhập với chuỗi băm trong CSDL
 */
export async function comparePassword(plainText: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plainText, hashed);
}
