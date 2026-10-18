import { NguoiDung } from './NguoiDung.js';
import { SuKienHienMau } from './SuKienHienMau.js';
import { LichHenHienMau } from './LichHenHienMau.js';
import { KhoMau } from './KhoMau.js';
import { YeuCauMauKhanCap } from './YeuCauMauKhanCap.js';
import { DieuPhoiMau } from './DieuPhoiMau.js';

// ==============================================================================
// THIẾT LẬP CÁC MỐI QUAN HỆ (ASSOCIATIONS)
// ==============================================================================

// 1. NguoiDung <-> SuKienHienMau
NguoiDung.hasMany(SuKienHienMau, {
  foreignKey: 'nguoiTaoId',
  as: 'suKienDaTao',
});
SuKienHienMau.belongsTo(NguoiDung, {
  foreignKey: 'nguoiTaoId',
  as: 'nguoiTao',
});

// 2. NguoiDung <-> LichHenHienMau
NguoiDung.hasMany(LichHenHienMau, {
  foreignKey: 'nguoiHienId',
  as: 'danhSachLichHen',
});
LichHenHienMau.belongsTo(NguoiDung, {
  foreignKey: 'nguoiHienId',
  as: 'nguoiHien',
});

// 3. SuKienHienMau <-> LichHenHienMau
SuKienHienMau.hasMany(LichHenHienMau, {
  foreignKey: 'suKienId',
  as: 'lichHenThamGia',
});
LichHenHienMau.belongsTo(SuKienHienMau, {
  foreignKey: 'suKienId',
  as: 'suKien',
});

// 4. NguoiDung (Bác sĩ/Nhân viên BV) <-> YeuCauMauKhanCap
NguoiDung.hasMany(YeuCauMauKhanCap, {
  foreignKey: 'nguoiDaiDienId',
  as: 'yeuCauMauDaTao',
});
YeuCauMauKhanCap.belongsTo(NguoiDung, {
  foreignKey: 'nguoiDaiDienId',
  as: 'nguoiDaiDien',
});

// 5. YeuCauMauKhanCap <-> DieuPhoiMau
YeuCauMauKhanCap.hasMany(DieuPhoiMau, {
  foreignKey: 'yeuCauId',
  as: 'cacDotDieuPhoi',
});
DieuPhoiMau.belongsTo(YeuCauMauKhanCap, {
  foreignKey: 'yeuCauId',
  as: 'yeuCau',
});

// 6. KhoMau <-> DieuPhoiMau
KhoMau.hasMany(DieuPhoiMau, {
  foreignKey: 'khoMauId',
  as: 'lichSuXuatKho',
});
DieuPhoiMau.belongsTo(KhoMau, {
  foreignKey: 'khoMauId',
  as: 'khoMau',
});

// 7. NguoiDung (Admin điều phối) <-> DieuPhoiMau
NguoiDung.hasMany(DieuPhoiMau, {
  foreignKey: 'nguoiDieuPhoiId',
  as: 'cacLenhDieuPhoiDaXyLy',
});
DieuPhoiMau.belongsTo(NguoiDung, {
  foreignKey: 'nguoiDieuPhoiId',
  as: 'nguoiDieuPhoi',
});

export { NguoiDung, SuKienHienMau, LichHenHienMau, KhoMau, YeuCauMauKhanCap, DieuPhoiMau };
