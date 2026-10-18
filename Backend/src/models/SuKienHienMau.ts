import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { NguoiDung } from './NguoiDung.js';

export type TrangThaiSuKien = 'SapDienRa' | 'DangDienRa' | 'KetThuc' | 'DaHuy';

export class SuKienHienMau extends Model<InferAttributes<SuKienHienMau>, InferCreationAttributes<SuKienHienMau>> {
  declare id: CreationOptional<number>;
  declare tenSuKien: string;
  declare moTa: CreationOptional<string | null>;
  declare diaDiem: string;
  declare thoiGianBatDau: Date;
  declare thoiGianKetThuc: Date;
  declare soLuongDuKien: CreationOptional<number>;
  declare soLuongDaDangKy: CreationOptional<number>;
  declare trangThai: CreationOptional<TrangThaiSuKien>;
  declare nguoiTaoId: number;
  declare ngayTao: CreationOptional<Date>;
  declare ngayCapNhat: CreationOptional<Date>;

  // Quan hệ
  declare nguoiTao?: NonAttribute<NguoiDung>;
}

SuKienHienMau.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tenSuKien: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'ten_su_kien',
    },
    moTa: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'mo_ta',
    },
    diaDiem: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'dia_diem',
    },
    thoiGianBatDau: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'thoi_gian_bat_dau',
    },
    thoiGianKetThuc: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'thoi_gian_ket_thuc',
    },
    soLuongDuKien: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      field: 'so_luong_du_kien',
    },
    soLuongDaDangKy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'so_luong_da_dang_ky',
    },
    trangThai: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'SapDienRa',
      field: 'trang_thai',
    },
    nguoiTaoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'nguoi_tao_id',
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
    tableName: 'SuKienHienMau',
    timestamps: true,
    createdAt: 'ngay_tao',
    updatedAt: 'ngay_cap_nhat',
  }
);
