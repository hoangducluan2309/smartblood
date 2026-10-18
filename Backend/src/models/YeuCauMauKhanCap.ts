import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional, type NonAttribute } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { NguoiDung } from './NguoiDung.js';
import type { ThanhPhanMau } from './KhoMau.js';

export type MucDoKhanCap = 'TRUNG_BINH' | 'CAO' | 'NGUY_CAP';
export type TrangThaiYeuCau = 'DangCho' | 'DangDieuPhoi' | 'DaDapUng' | 'DaHuy' | 'HetHan';

export class YeuCauMauKhanCap extends Model<InferAttributes<YeuCauMauKhanCap>, InferCreationAttributes<YeuCauMauKhanCap>> {
  declare id: CreationOptional<number>;
  declare benhVienYeuCau: string;
  declare nguoiDaiDienId: number;
  declare nhomMauCan: string;
  declare thanhPhanCan: CreationOptional<ThanhPhanMau>;
  declare soLuongCanMl: number;
  declare mucDoKhanCap: CreationOptional<MucDoKhanCap>;
  declare lyDo: string;
  declare hanChot: Date;
  declare trangThai: CreationOptional<TrangThaiYeuCau>;
  declare ngayTao: CreationOptional<Date>;
  declare ngayCapNhat: CreationOptional<Date>;

  // Quan hệ
  declare nguoiDaiDien?: NonAttribute<NguoiDung>;
}

YeuCauMauKhanCap.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    benhVienYeuCau: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: 'benh_vien_yeu_cau',
    },
    nguoiDaiDienId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'nguoi_dai_dien_id',
    },
    nhomMauCan: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: 'nhom_mau_can',
    },
    thanhPhanCan: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ToanPhan',
      field: 'thanh_phan_can',
    },
    soLuongCanMl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'so_luong_can_ml',
    },
    mucDoKhanCap: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'CAO',
      field: 'muc_do_khan_cap',
    },
    lyDo: {
      type: DataTypes.STRING(500),
      allowNull: false,
      field: 'ly_do',
    },
    hanChot: {
      type: DataTypes.DATE,
      allowNull: false,
      field: 'han_chot',
    },
    trangThai: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'DangCho',
      field: 'trang_thai',
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
    tableName: 'YeuCauMauKhanCap',
    timestamps: true,
    createdAt: 'ngay_tao',
    updatedAt: 'ngay_cap_nhat',
  }
);
