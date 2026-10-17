import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';

export type VaiTro = 'ADMIN' | 'HOSPITAL_STAFF' | 'DONOR';
export type TrangThaiUser = 'HoatDong' | 'Khoa' | 'ChuaKichHoat';

export class NguoiDung extends Model<InferAttributes<NguoiDung>, InferCreationAttributes<NguoiDung>> {
  declare id: CreationOptional<number>;
  declare hoTen: string;
  declare email: string;
  declare matKhauHash: string;
  declare soDienThoai: string;
  declare cccd: CreationOptional<string | null>;
  declare nhomMau: CreationOptional<string | null>;
  declare yeuToRh: CreationOptional<string | null>;
  declare diaChi: CreationOptional<string | null>;
  declare vaiTro: CreationOptional<VaiTro>;
  declare trangThai: CreationOptional<TrangThaiUser>;
  declare ngayTao: CreationOptional<Date>;
  declare ngayCapNhat: CreationOptional<Date>;

  /**
   * Loại bỏ matKhauHash khỏi JSON trả về client
   */
  toJSON(): object {
    const values = { ...this.get() };
    delete (values as { matKhauHash?: string }).matKhauHash;
    return values;
  }
}

NguoiDung.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    hoTen: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'ho_ten',
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      field: 'email',
      validate: {
        isEmail: { msg: 'Email không đúng định dạng.' },
      },
    },
    matKhauHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'mat_khau_hash',
    },
    soDienThoai: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      field: 'so_dien_thoai',
    },
    cccd: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
      field: 'cccd',
    },
    nhomMau: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: 'nhom_mau',
    },
    yeuToRh: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'yeu_to_rh',
    },
    diaChi: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'dia_chi',
    },
    vaiTro: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'DONOR',
      field: 'vai_tro',
    },
    trangThai: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: 'HoatDong',
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
    tableName: 'NguoiDung',
    timestamps: true,
    createdAt: 'ngay_tao',
    updatedAt: 'ngay_cap_nhat',
  }
);
