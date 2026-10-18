import type { ThanhPhanMau } from '../models/KhoMau.js';
import type { MucDoKhanCap } from '../models/YeuCauMauKhanCap.js';
import type { PaginationQuery } from './pagination.dto.js';

export type MucDoKhanCapInput = 'TRUNG_BINH' | 'CAO' | 'NGUY_CAP' | 'RAT_KHAN' | 'KHAN_CAP';

export interface CreateEmergencyRequestDTO {
  benhVienYeuCau: string;
  nhomMauCan: string;
  thanhPhanCan?: ThanhPhanMau;
  soLuongCanMl?: number;
  soLuongTui?: number; // Hỗ trợ nhập số lượng túi (1 túi = 350ml) hoặc số lượng ml trực tiếp
  mucDoKhanCap?: MucDoKhanCapInput;
  lyDo: string;
  hanChot: string | Date;
}

export interface DispatchEmergencyRequestDTO {
  khoMauId?: number; // Lô kho máu cụ thể được chọn để xuất
  khoMauIds?: number[]; // Danh sách các lô kho máu cụ thể
  nhomMauXuat?: string; // Nhóm máu chọn xuất (nếu chọn xuất nhóm máu tương thích)
  soLuongXuatMl?: number;
  soLuongTui?: number;
  donViVanChuyen?: string;
  bienSoXe?: string;
  taiXe?: string;
  soDienThoaiTaiXe?: string;
  thoiGianNhanDuKien?: string | Date;
  ghiChu?: string;
}

export interface DirectDispatchDTO {
  benhVienNhan: string;
  nhomMau: string;
  thanhPhan?: ThanhPhanMau;
  soLuongXuatMl?: number;
  soLuongTui?: number;
  khoMauId?: number;
  donViVanChuyen?: string;
  bienSoXe?: string;
  taiXe?: string;
  soDienThoaiTaiXe?: string;
  thoiGianNhanDuKien?: string | Date;
  ghiChu?: string;
}

export interface BloodInventoryQueryDTO extends PaginationQuery {
  nhomMau?: string;
  thanhPhan?: ThanhPhanMau;
  chiLayCanhBao?: boolean | string;
}

export interface EmergencyRequestQueryDTO extends PaginationQuery {
  trangThai?: 'DangCho' | 'DaDapUng' | 'DaHuy' | 'HetHan';
  mucDoKhanCap?: MucDoKhanCap;
  nhomMau?: string;
}
