import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { NguoiDung } from './NguoiDung.js';
import type { SuKienHienMau } from './SuKienHienMau.js';

export type TrangThaiLichHen = 'ChoXacNhan' | 'DaXacNhan' | 'HoanThanh' | 'DaHuy' | 'KhongDen';

export class LichHenHienMau extends Model<InferAttributes<LichHenHienMau>, InferCreationAttributes<LichHenHienMau>> {
  declare id: CreationOptional<number>;
  declare nguoiHienId: number;
  declare suKienId: CreationOptional<number | null>;
  declare ngayHen: Date;
  declare khungGio: string;
  declare luongMauHienMl: CreationOptional<number | null>;
  declare tinhTrangSucKhoe: CreationOptional<string | null>;
  declare trangThai: CreationOptional<TrangThaiLichHen>;
  declare ghiChu: CreationOptional<string | null>;
  declare ngayTao: CreationOptional<Date>;
  declare ngayCapNhat: CreationOptional<Date>;

  // Quan hệ
  declare nguoiHien?: NonAttribute<NguoiDung>;
  declare suKien?: NonAttribute<SuKienHienMau>;
}

LichHenHienMau.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nguoiHienId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'nguoi_hien_id',
    },
    suKienId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'su_kien_id',
    },
    ngayHen: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'ngay_hen',
    },
    khungGio: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'khung_gio',
    },
    luongMauHienMl: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'luong_mau_hien_ml',
    },
    tinhTrangSucKhoe: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'tinh_trang_suc_khoe',
    },
    trangThai: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'ChoXacNhan',
      field: 'trang_thai',
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
    tableName: 'LichHenHienMau',
    timestamps: true,
    createdAt: 'ngay_tao',
    updatedAt: 'ngay_cap_nhat',
  }
);
