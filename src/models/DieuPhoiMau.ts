import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { YeuCauMauKhanCap } from './YeuCauMauKhanCap.js';
import type { KhoMau } from './KhoMau.js';
import type { NguoiDung } from './NguoiDung.js';

export type TrangThaiVanChuyen = 'ChuanBi' | 'DangGiao' | 'DaNhan' | 'ThatBai';

export class DieuPhoiMau extends Model<InferAttributes<DieuPhoiMau>, InferCreationAttributes<DieuPhoiMau>> {
  declare id: CreationOptional<number>;
  declare yeuCauId: number;
  declare khoMauId: number;
  declare nguoiDieuPhoiId: number;
  declare soLuongXuatMl: number;
  declare trangThaiVanChuyen: CreationOptional<TrangThaiVanChuyen>;
  declare donViVanChuyen: CreationOptional<string | null>;
  declare thoiGianXuat: CreationOptional<Date | null>;
  declare thoiGianNhanDuKien: CreationOptional<Date | null>;
  declare thoiGianNhanThucTe: CreationOptional<Date | null>;
  declare ghiChu: CreationOptional<string | null>;
  declare ngayTao: CreationOptional<Date>;
  declare ngayCapNhat: CreationOptional<Date>;

  // Quan hệ
  declare yeuCau?: NonAttribute<YeuCauMauKhanCap>;
  declare khoMau?: NonAttribute<KhoMau>;
  declare nguoiDieuPhoi?: NonAttribute<NguoiDung>;
}

DieuPhoiMau.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    yeuCauId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'yeu_cau_id',
    },
    khoMauId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'kho_mau_id',
    },
    nguoiDieuPhoiId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'nguoi_dieu_phoi_id',
    },
    soLuongXuatMl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'so_luong_xuat_ml',
    },
    trangThaiVanChuyen: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'ChuanBi',
      field: 'trang_thai_van_chuyen',
    },
    donViVanChuyen: {
      type: DataTypes.STRING(150),
      allowNull: true,
      field: 'don_vi_van_chuyen',
    },
    thoiGianXuat: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'thoi_gian_xuat',
    },
    thoiGianNhanDuKien: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'thoi_gian_nhan_du_kien',
    },
    thoiGianNhanThucTe: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'thoi_gian_nhan_thuc_te',
    },
    ghiChu: {
      type: DataTypes.STRING(500),
      allowNull: true,
      field: 'ghi_chu',
    },
    ngayTao: {
      type: DataTypes.DATE,
      field: 'ngay_tao',
      defaultValue: DataTypes.NOW,
    },
    ngayCapNhat: {
      type: DataTypes.DATE,
      field: 'ngay_cap_nhat',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'DieuPhoiMau',
    timestamps: true,
    createdAt: 'ngay_tao',
    updatedAt: 'ngay_cap_nhat',
  }
);
