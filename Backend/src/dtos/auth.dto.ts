import type { VaiTro, TrangThaiUser } from '../models/NguoiDung.js';

export interface RegisterDTO {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  cccd?: string;
  nhomMau?: string;
  yeuToRh?: string;
  diaChi?: string;
}

export interface LoginDTO {
  email?: string;
  matKhau?: string;
  password?: string;
  soDienThoai?: string;
  cccd?: string;
  taiKhoan?: string;
  identifier?: string;
  phoneOrEmail?: string;
}

export interface UpdateMyProfileDTO {
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi?: string;
}

export interface ChangeMyPasswordDTO {
  matKhauHienTai: string;
  matKhauMoi: string;
  xacNhanMatKhau: string;
}

export interface UserResponseDTO {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  cccd?: string | null;
  nhomMau?: string | null;
  yeuToRh?: string | null;
  diaChi?: string | null;
  vaiTro: VaiTro;
  trangThai: TrangThaiUser;
  ngayTao?: Date;
  ngayCapNhat?: Date;
}

export interface LoginResponseDTO {
  accessToken: string;
  user: UserResponseDTO;
}

export interface AuthUserPayload {
  id: number;
  email: string;
  vaiTro: VaiTro;
  hoTen: string;
}
