import { Op } from 'sequelize';
import { sequelize } from '../config/database.js';
import { NguoiDung, type VaiTro, type TrangThaiUser } from '../models/NguoiDung.js';
import { LichHenHienMau, SuKienHienMau, YeuCauMauKhanCap, DieuPhoiMau } from '../models/index.js';
import { hashPassword } from '../utils/password.util.js';
import { getPasswordPolicyError } from '../utils/passwordPolicy.js';
import { AppError } from '../utils/AppError.js';
import { parsePaginationParams, buildPaginatedResponse } from '../dtos/pagination.dto.js';

export interface UserQueryDTO {
  page?: number | string;
  limit?: number | string;
  search?: string;
  vaiTro?: string;
  trangThai?: string;
  nhomMau?: string;
}

export interface CreateUserDTO {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  cccd?: string;
  vaiTro?: VaiTro;
  nhomMau?: string;
  yeuToRh?: string;
  diaChi?: string;
  trangThai?: TrangThaiUser;
}

export interface UpdateUserDTO {
  hoTen?: string;
  email?: string;
  matKhau?: string;
  soDienThoai?: string;
  cccd?: string;
  vaiTro?: VaiTro;
  nhomMau?: string;
  yeuToRh?: string;
  diaChi?: string;
  trangThai?: TrangThaiUser;
}

export class UserService {
  /**
   * 1. Lấy danh sách tài khoản (Hỗ trợ Tìm kiếm, Lọc theo Vai trò, Trạng thái, Phân trang)
   */
  async layDanhSachNguoiDung(query: UserQueryDTO = {}) {
    const { page, limit, offset } = parsePaginationParams(query);
    const whereClause: Record<string, unknown> = {};

    if (query.vaiTro && query.vaiTro !== 'ALL') {
      whereClause.vaiTro = query.vaiTro;
    }

    if (query.trangThai && query.trangThai !== 'ALL') {
      whereClause.trangThai = query.trangThai;
    }

    if (query.nhomMau && query.nhomMau !== 'ALL') {
      whereClause.nhomMau = query.nhomMau;
    }

    if (query.search && query.search.trim() !== '') {
      const kw = `%${query.search.trim()}%`;
      whereClause[Op.or as unknown as string] = [
        { hoTen: { [Op.like]: kw } },
        { email: { [Op.like]: kw } },
        { soDienThoai: { [Op.like]: kw } },
        { cccd: { [Op.like]: kw } },
      ];
    }

    const { count, rows } = await NguoiDung.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['matKhauHash'] },
      order: [['id', 'DESC']],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, page, limit);
  }

  /**
   * 2. Lấy chi tiết 1 người dùng theo ID
   */
  async layChiTietNguoiDung(id: number) {
    const user = await NguoiDung.findByPk(id, {
      attributes: { exclude: ['matKhauHash'] },
    });
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản người dùng.');
    }
    return user;
  }

  /**
   * 3. Admin tạo người dùng mới
   */
  async taoNguoiDung(data: CreateUserDTO) {
    const { hoTen, email, matKhau, soDienThoai, cccd, vaiTro, nhomMau, yeuToRh, diaChi, trangThai } = data;

    if (!email || typeof matKhau !== 'string' || !hoTen || !soDienThoai) {
      throw AppError.badRequest('Vui lòng cung cấp đầy đủ: họ tên, email, mật khẩu và số điện thoại.');
    }
    const passwordPolicyError = getPasswordPolicyError(matKhau);
    if (passwordPolicyError) throw AppError.badRequest(passwordPolicyError);

    // Kiểm tra trùng lặp Email
    const existEmail = await NguoiDung.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existEmail) throw AppError.conflict('Email này đã được sử dụng.');

    // Kiểm tra trùng lặp SĐT
    const existPhone = await NguoiDung.findOne({ where: { soDienThoai: soDienThoai.trim() } });
    if (existPhone) throw AppError.conflict('Số điện thoại này đã được sử dụng.');

    // Kiểm tra trùng lặp CCCD nếu có
    if (cccd && cccd.trim()) {
      const existCccd = await NguoiDung.findOne({ where: { cccd: cccd.trim() } });
      if (existCccd) throw AppError.conflict('Số CCCD này đã tồn tại trong hệ thống.');
    }

    // Chuẩn hóa nhóm máu và Rh
    let cleanNhomMau = nhomMau ? nhomMau.trim().toUpperCase() : null;
    let cleanRh = yeuToRh ? (yeuToRh === '+' || yeuToRh === 'Rh+' || yeuToRh === 'Duong' ? 'Rh+' : 'Rh-') : null;

    if (cleanNhomMau && ['A', 'B', 'AB', 'O'].includes(cleanNhomMau)) {
      cleanNhomMau = `${cleanNhomMau}${cleanRh === 'Rh-' ? '-' : '+'}`;
      if (!cleanRh) cleanRh = 'Rh+';
    }

    const matKhauHash = await hashPassword(matKhau);

    const newUser = await NguoiDung.create({
      hoTen: hoTen.trim(),
      email: email.trim().toLowerCase(),
      matKhauHash,
      soDienThoai: soDienThoai.trim(),
      cccd: cccd && cccd.trim() ? cccd.trim() : null,
      vaiTro: vaiTro || 'DONOR',
      nhomMau: cleanNhomMau,
      yeuToRh: cleanRh,
      diaChi: diaChi ? diaChi.trim() : null,
      trangThai: trangThai || 'HoatDong',
    });

    const userJson = newUser.toJSON();
    delete (userJson as any).matKhauHash;
    return userJson;
  }

  /**
   * 4. Admin cập nhật thông tin người dùng
   */
  async capNhatNguoiDung(id: number, data: UpdateUserDTO) {
    const user = await NguoiDung.findByPk(id);
    if (!user) {
      throw AppError.notFound('Không tìm thấy tài khoản người dùng.');
    }

    if (data.email && data.email.trim().toLowerCase() !== user.email.toLowerCase()) {
      const exist = await NguoiDung.findOne({ where: { email: data.email.trim().toLowerCase() } });
      if (exist) throw AppError.conflict('Email mới này đã thuộc về tài khoản khác.');
      user.email = data.email.trim().toLowerCase();
    }

    if (data.soDienThoai && data.soDienThoai.trim() !== user.soDienThoai) {
      const exist = await NguoiDung.findOne({ where: { soDienThoai: data.soDienThoai.trim() } });
      if (exist) throw AppError.conflict('Số điện thoại mới này đã thuộc về tài khoản khác.');
      user.soDienThoai = data.soDienThoai.trim();
    }

    if (data.cccd !== undefined) {
      const newCccd = data.cccd ? data.cccd.trim() : null;
      if (newCccd && newCccd !== user.cccd) {
        const exist = await NguoiDung.findOne({ where: { cccd: newCccd } });
        if (exist) throw AppError.conflict('Số CCCD này đã thuộc về tài khoản khác.');
      }
      user.cccd = newCccd;
    }

    if (data.hoTen) user.hoTen = data.hoTen.trim();
    if (data.vaiTro) user.vaiTro = data.vaiTro;
    if (data.trangThai) user.trangThai = data.trangThai;
    if (data.diaChi !== undefined) user.diaChi = data.diaChi ? data.diaChi.trim() : null;

    if (data.nhomMau !== undefined) {
      let cleanMau = data.nhomMau ? data.nhomMau.trim().toUpperCase() : null;
      if (cleanMau && ['A', 'B', 'AB', 'O'].includes(cleanMau)) {
        cleanMau = `${cleanMau}+`;
      }
      user.nhomMau = cleanMau;
    }

    if (data.yeuToRh !== undefined) {
      user.yeuToRh = data.yeuToRh ? (data.yeuToRh === '+' || data.yeuToRh === 'Rh+' || data.yeuToRh === 'Duong' ? 'Rh+' : 'Rh-') : null;
    }

    // Đổi mật khẩu nếu có cung cấp
    if (data.matKhau !== undefined && data.matKhau !== '') {
      if (typeof data.matKhau !== 'string') {
        throw AppError.badRequest('Mật khẩu không hợp lệ.');
      }
      const passwordPolicyError = getPasswordPolicyError(data.matKhau);
      if (passwordPolicyError) throw AppError.badRequest(passwordPolicyError);
      user.matKhauHash = await hashPassword(data.matKhau);
    }

    await user.save();

    const userJson = user.toJSON();
    delete (userJson as any).matKhauHash;
    return userJson;
  }

  async datLaiMatKhau(id: number, currentUserId: number, matKhauMoi: unknown): Promise<void> {
    if (id === currentUserId) {
      throw AppError.badRequest('Để đổi mật khẩu của chính mình, hãy dùng mục Hồ sơ cá nhân.');
    }
    if (typeof matKhauMoi !== 'string') {
      throw AppError.badRequest('Vui lòng nhập mật khẩu mới hợp lệ.');
    }
    const passwordPolicyError = getPasswordPolicyError(matKhauMoi);
    if (passwordPolicyError) throw AppError.badRequest(passwordPolicyError);

    const user = await NguoiDung.findByPk(id);
    if (!user) throw AppError.notFound('Không tìm thấy tài khoản người dùng.');

    user.matKhauHash = await hashPassword(matKhauMoi);
    await user.save();
  }

  /**
   * 5. Khóa hoặc Mở khóa nhanh tài khoản
   */
  async thayDoiTrangThai(id: number, currentUserId: number): Promise<{ id: number; trangThai: string; message: string }> {
    if (id === currentUserId) {
      throw AppError.badRequest('Bạn không thể tự khóa tài khoản của chính mình.');
    }

    const user = await NguoiDung.findByPk(id);
    if (!user) throw AppError.notFound('Không tìm thấy tài khoản người dùng.');

    user.trangThai = user.trangThai === 'HoatDong' ? 'Khoa' : 'HoatDong';
    await user.save();

    return { id: user.id, trangThai: user.trangThai, message: `Đã đổi trạng thái tài khoản thành: ${user.trangThai}` };
  }

  /**
   * 6. Xóa vĩnh viễn tài khoản người dùng
   */
  async xoaNguoiDung(id: number, currentUserId: number) {
    if (id === currentUserId) {
      throw AppError.badRequest('Bạn không thể tự xóa tài khoản của chính mình.');
    }

    const user = await NguoiDung.findByPk(id);
    if (!user) throw AppError.notFound('Không tìm thấy tài khoản người dùng.');

    // Xử lý các liên kết phụ thuộc trong Transaction đảm bảo toàn vẹn dữ liệu
    await sequelize.transaction(async (t) => {
      // 1. Chuyển quyền đại diện các yêu cầu khẩn cấp sang Admin đang thao tác
      await YeuCauMauKhanCap.update(
        { nguoiDaiDienId: currentUserId },
        { where: { nguoiDaiDienId: id }, transaction: t }
      );

      // 2. Chuyển quyền điều phối sang Admin đang thao tác
      await DieuPhoiMau.update(
        { nguoiDieuPhoiId: currentUserId },
        { where: { nguoiDieuPhoiId: id }, transaction: t }
      );

      // 3. Chuyển quyền sở hữu sự kiện hiến máu sang Admin đang thao tác
      await SuKienHienMau.update(
        { nguoiTaoId: currentUserId },
        { where: { nguoiTaoId: id }, transaction: t }
      );

      // 4. Tự động xóa các lịch hẹn hiến máu của tài khoản này
      await LichHenHienMau.destroy({ where: { nguoiHienId: id }, transaction: t });

      // 5. Xóa tài khoản người dùng
      await user.destroy({ transaction: t });
    });

    return { id, message: `Đã xóa vĩnh viễn tài khoản [${user.hoTen}] thành công.` };
  }
}

export const userService = new UserService();
