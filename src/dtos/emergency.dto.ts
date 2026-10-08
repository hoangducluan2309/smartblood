import type { ThanhPhanMau } from '../models/KhoMau.js';
import type { MucDoKhanCap } from '../models/YeuCauMauKhanCap.js';

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
  donViVanChuyen?: string;
  thoiGianNhanDuKien?: string | Date;
  ghiChu?: string;
}
