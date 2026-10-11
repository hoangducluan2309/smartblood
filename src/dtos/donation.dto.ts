import type { TrangThaiLichHen } from '../models/LichHenHienMau.js';
import type { TrangThaiSuKien } from '../models/SuKienHienMau.js';
import type { PaginationQuery } from './pagination.dto.js';

export interface CreateSuKienDTO {
  tenSuKien: string;
  moTa?: string;
  diaDiem: string;
  thoiGianBatDau: string | Date;
  thoiGianKetThuc: string | Date;
  soLuongDuKien?: number;
}

export interface SuKienQueryDTO extends PaginationQuery {
  trangThai?: TrangThaiSuKien;
  tuNgay?: string;
  denNgay?: string;
}

export interface CreateLichHenDTO {
  suKienId?: number;
  ngayHen: string | Date;
  khungGio: string;
  luongMauHienMl?: number;
  tinhTrangSucKhoe?: string;
  ghiChu?: string;
}

export interface LichHenQueryDTO extends PaginationQuery {
  trangThai?: TrangThaiLichHen;
  suKienId?: number | string;
  nguoiHienId?: number | string;
}

export type ResultStatusInput = 'THANH_CONG' | 'HoanThanh' | 'BI_TU_CHOI' | 'DaHuy' | 'KhongDen' | 'DaXacNhan';

export interface UpdateLichHenStatusDTO {
  trangThai: ResultStatusInput;
  luongMauThucTeMl?: number;
  donViLuuTru?: string;
  ghiChu?: string;
}
