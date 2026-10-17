export type BloodTypeLetter = 'A' | 'B' | 'AB' | 'O';
export type RhFactor = '+' | '-';
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'RAT_KHAN' | 'KHAN_CAP' | 'BINH_THUONG';

export type UserRole = 'DONOR' | 'HOSPITAL_STAFF' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  hoTen?: string;
  phone: string;
  soDienThoai?: string;
  email: string;
  role: UserRole;
  nhomMau?: BloodTypeLetter;
  yeuToRh?: RhFactor;
  bloodType?: BloodGroup;
  hospitalId?: string;
  hospitalName?: string;
  isAvailableDonor?: boolean;
  cccd?: string;
  avatarUrl?: string;
  donationCount?: number;
  lastDonationDate?: string;
}

export interface LoginCredentials {
  email?: string;
  matKhau?: string;
  password?: string;
  phone?: string;
  phoneOrEmail?: string;
  [key: string]: any;
}

export interface RegisterData {
  email: string;
  matKhau: string;
  hoTen: string;
  soDienThoai: string;
  cccd?: string;
  nhomMau: BloodTypeLetter;
  yeuToRh: RhFactor;
  role?: UserRole;
  fullName?: string;
  phone?: string;
  password?: string;
  bloodType?: BloodGroup;
  hospitalName?: string;
  [key: string]: any;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface DonationEvent {
  id: string | number;
  tenSuKien: string;
  diaDiem: string;
  diaChi: string;
  quanHuyen: string;
  ngayToChuc: string;
  gioBatDau: string;
  gioKetThuc: string;
  lat: number;
  lng: number;
  daDangKy: number;
  chiTieu: number;
  donViToChuc: string;
  ghiChu?: string;
  trangThai?: 'SapDienRa' | 'DangDienRa' | 'KetThuc' | 'DaHuy';
  isDismissed?: boolean;
  dismissReason?: string;
}

export interface DonationAppointment {
  id: string | number;
  rawId?: number;
  eventId: string | number;
  tenSuKien?: string;
  diaDiem?: string;
  diaChi?: string;
  thoiGianHen: string;
  ngayHen: string;
  khungGio: string;
  luongMau?: string | number;
  luongMauHienMl?: number;
  nhomMau?: BloodGroup;
  trangThai: 'CHO_TIEP_NHAN' | 'DA_TIEP_NHAN' | 'HOAN_THANH' | 'DA_HUY';
  soChungNhan?: string;
  tinhTrangSucKhoe?: string;
  ghiChu?: string;
  createdAt?: string;
  maQR?: string;
}

// Emergency request model for hospital & dispatch
export interface EmergencyBloodRequest {
  id: string;
  hospitalName: string;
  department?: string;
  patientName: string;
  patientCode?: string;
  bloodType: BloodGroup;
  unitsNeeded: number;
  urgency: 'RAT_KHAN' | 'KHAN_CAP';
  contactDoctor: string;
  contactPhone: string;
  status: 'CHO_DUYET' | 'DANG_GIAO_XE_CAP_CUU' | 'DA_GIAO_THANH_CONG' | 'DA_HUY';
  createdAt: string;
  deadline?: string;
  note?: string;
  dispatchInfo?: {
    ambulanceCode: string;
    driverName: string;
    driverPhone: string;
    etaMinutes: number;
    dispatchedAt: string;
    selectedLots?: string[];
  };
}

// FEFO Blood inventory item
export interface BloodInventoryItem {
  id: string;
  maLo: string;
  nhomMau: BloodGroup;
  theTich: '250ml' | '350ml' | '450ml';
  ngayNhap: string;
  ngayHetHan: string;
  soNgayConLai: number;
  viTriTuLanh: string;
  trangThai: 'SAN_SANG' | 'KHOA_DIEU_PHOI' | 'HET_HAN';
  donorName?: string;
}

export interface DispatchRecordItem {
  id: number;
  yeuCauId: number;
  khoMauId: number;
  nguoiDieuPhoiId: number;
  soLuongXuatMl: number;
  trangThaiVanChuyen: 'ChuanBi' | 'DangGiao' | 'DaNhan' | 'ThatBai';
  donViVanChuyen?: string;
  thoiGianXuat?: string;
  thoiGianNhanDuKien?: string;
  thoiGianNhanThucTe?: string;
  ghiChu?: string;
  ngayTao?: string;
  yeuCau?: {
    id: number;
    benhVienYeuCau: string;
    nhomMauCan: BloodGroup;
    thanhPhanCan: string;
    mucDoKhanCap: string;
    lyDo: string;
    trangThai: string;
  };
  khoMau?: {
    id: number;
    nhomMau: BloodGroup;
    thanhPhan: string;
    donViLuuTru: string;
  };
  nguoiDieuPhoi?: {
    id: number;
    hoTen: string;
    email: string;
    soDienThoai: string;
  };
}

export interface BloodStockSummary {
  nhomMau?: BloodGroup;
  bloodGroup?: BloodGroup;
  soLuongTui?: number;
  unitsAvailable?: number;
  nguongAnToan?: number;
  safeThreshold?: number;
  criticalThreshold?: number;
  mucDo?: 'CRITICAL' | 'WARNING' | 'SAFE' | 'SUFFICIENT';
  status?: 'CRITICAL' | 'WARNING' | 'SAFE' | 'SUFFICIENT';
  phanTram?: number;
  tuiSapHetHan?: number;
  tongMl?: number;
}

// Forecast & AI Shortage Risk Analysis Types
export interface ShortageRiskForecast {
  bloodGroup: BloodGroup;
  currentStock: number; // Lượng dự trữ hiện tại (đơn vị)
  forecastDemand30Days: number; // Nhu cầu dự báo 30 ngày tới
  deficit: number; // Thâm hụt (âm = thiếu, dương = thừa)
  riskLevel: 'CAO' | 'TRUNG_BINH' | 'THAP'; // Mức độ rủi ro
  daysOfSupply: number; // Số ngày dự trữ còn lại
  trend: 'TANG' | 'GIAM' | 'ON_DINH'; // Xu hướng tiêu thụ
  recommendation: string; // Khuyến nghị hành động
  criticalDate?: string; // Ngày dự kiến bắt đầu chạm ngưỡng cạn kiệt
}

export interface UrgentDonor {
  id: string;
  hoTen: string;
  soDienThoai: string;
  email?: string;
  nhomMau: BloodGroup;
  diaChi: string;
  quanHuyen: string;
  lanHienCuoi: string; // YYYY-MM-DD
  soNgayDaQua: number; // Số ngày đã trôi qua kể từ lần hiến cuối (> 84 ngày)
  soLanDaHien: number;
  khoangCachKm?: number;
  trangThaiSanSang: boolean;
}

export interface EmergencyAlertPayload {
  id: string;
  hospitalName: string;
  department?: string;
  bloodGroup: BloodGroup;
  unitsRequired: number;
  urgencyLevel: 'RAT_KHAN' | 'KHAN_CAP';
  patientName?: string;
  patientCode?: string;
  timestamp: string;
  message?: string;
  notes?: string;
}

export interface EmergencyCardItem {
  id: string;
  patient: string;
  bloodType: BloodGroup;
  units: string;
  unitsNeeded: number;
  hospital: string;
  department?: string;
  address: string;
  contact: string;
  coordinator: string;
  deadline: string;
  urgencyBadge: 'BÁO ĐỘNG ĐỎ' | 'KHẨN CẤP' | 'ƯU TIÊN CAO';
  isAlertActive: boolean;
  isDismissed: boolean;
  dismissedAt?: string;
  dismissReason?: string;
}

