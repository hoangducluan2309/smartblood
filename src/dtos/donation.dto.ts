import type { TrangThaiLichHen } from '../models/LichHenHienMau.js';
import type { TrangThaiSuKien } from '../models/SuKienHienMau.js';

export interface CreateSuKienDTO {
  tenSuKien: string;
  moTa?: string;
  diaDiem: string;
  thoiGianBatDau: string | Date;
  thoiGianKetThuc: string | Date;
  soLuongDuKien?: number;
}

export interface CreateLichHenDTO {
  suKienId?: number;
  ngayHen: string | Date;
  khungGio: string;
  luongMauHienMl?: number;
  tinhTrangSucKhoe?: string;
  ghiChu?: string;
}

export type ResultStatusInput = 'THANH_CONG' | 'HoanThanh' | 'BI_TU_CHOI' | 'DaHuy' | 'KhongDen' | 'DaXacNhan';

export interface UpdateLichHenStatusDTO {
  trangThai: ResultStatusInput;
  luongMauThucTeMl?: number;
  donViLuuTru?: string;
  ghiChu?: string;
}
