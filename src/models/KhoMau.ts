import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';

export type ThanhPhanMau = 'ToanPhan' | 'HongCau' | 'TieuCau' | 'HuyetTuong';

export class KhoMau extends Model<InferAttributes<KhoMau>, InferCreationAttributes<KhoMau>> {
  declare id: CreationOptional<number>;
  declare nhomMau: string;
  declare thanhPhan: CreationOptional<ThanhPhanMau>;
  declare soLuongConLaiMl: CreationOptional<number>;
  declare nguongCanhBaoMl: CreationOptional<number>;
  declare donViLuuTru: string;
  declare ngayCapNhat: CreationOptional<Date>;
}

KhoMau.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nhomMau: {
      type: DataTypes.STRING(5),
      allowNull: false,
      field: 'nhom_mau',
    },
    thanhPhan: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'ToanPhan',
      field: 'thanh_phan',
    },
    soLuongConLaiMl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: 'so_luong_con_lai_ml',
    },
    nguongCanhBaoMl: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500,
      field: 'nguong_canh_bao_ml',
    },
    donViLuuTru: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'don_vi_luu_tru',
    },
    ngayCapNhat: {
      type: DataTypes.DATE,
      field: 'ngay_cap_nhat',
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'KhoMau',
    timestamps: true,
    createdAt: false,
    updatedAt: 'ngay_cap_nhat',
  }
);
