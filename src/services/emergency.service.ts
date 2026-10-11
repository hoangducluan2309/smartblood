import { Op, type Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { KhoMau, YeuCauMauKhanCap, DieuPhoiMau, NguoiDung } from '../models/index.js';
import { getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.util.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateEmergencyRequestDTO,
  DispatchEmergencyRequestDTO,
  MucDoKhanCapInput,
  BloodInventoryQueryDTO,
  EmergencyRequestQueryDTO,
} from '../dtos/emergency.dto.js';
import type { MucDoKhanCap } from '../models/YeuCauMauKhanCap.js';
import { parsePaginationParams, buildPaginatedResponse } from '../dtos/pagination.dto.js';

export class EmergencyService {
  /**
   * 1. Xem tồn kho máu theo nguyên tắc FEFO (Hạn sử dụng / Ngày cập nhật cũ nhất xuất trước)
   * Có hỗ trợ Tìm kiếm, Lọc và Phân trang (Search, Filter, Pagination)
   */
  async layTonKhoMauFEFO(query: BloodInventoryQueryDTO = {}) {
    const { page, limit, offset } = parsePaginationParams(query);
    const whereClause: Record<string, unknown> = {};

    // 1. Lọc theo nhóm máu
    if (query.nhomMau) {
      whereClause.nhomMau = query.nhomMau.trim().replace(/\s+/g, '+').toUpperCase();
    }

    // 2. Lọc theo thành phần máu
    if (query.thanhPhan) {
      whereClause.thanhPhan = query.thanhPhan;
    }

    // 3. Tìm kiếm theo đơn vị lưu trữ hoặc nhóm máu
    if (query.search && query.search.trim() !== '') {
      const keyword = `%${query.search.trim()}%`;
      whereClause[Op.or as unknown as string] = [
        { donViLuuTru: { [Op.like]: keyword } },
        { nhomMau: { [Op.like]: keyword } },
      ];
    }

    const { count, rows } = await KhoMau.findAndCountAll({
      where: whereClause,
      order: [
        ['ngayCapNhat', 'ASC'], // FEFO
        ['nhomMau', 'ASC'],
      ],
      limit,
      offset,
    });

    const items = rows.map((item) => {
      const isLowStock = item.soLuongConLaiMl <= item.nguongCanhBaoMl;
      return {
        ...item.toJSON(),
        canhBaoThieuMau: isLowStock,
        trangThaiKho: isLowStock ? 'CANH_BAO_THIEU_MAU' : 'DU_TRU_AN_TOAN',
      };
    });

    return buildPaginatedResponse(items, count, page, limit);
  }

  /**
   * 1b. Xem danh sách yêu cầu máu khẩn cấp có Tìm kiếm, Lọc và Phân trang
   */
  async layDanhSachYeuCauKhanCap(query: EmergencyRequestQueryDTO = {}) {
    const { page, limit, offset } = parsePaginationParams(query);
    const whereClause: Record<string, unknown> = {};

    if (query.trangThai) {
      whereClause.trangThai = query.trangThai;
    }

    if (query.mucDoKhanCap) {
      whereClause.mucDoKhanCap = query.mucDoKhanCap;
    }

    if (query.nhomMau) {
      whereClause.nhomMauCan = query.nhomMau.trim().replace(/\s+/g, '+').toUpperCase();
    }

    if (query.search && query.search.trim() !== '') {
      const keyword = `%${query.search.trim()}%`;
      whereClause[Op.or as unknown as string] = [
        { benhVienYeuCau: { [Op.like]: keyword } },
        { lyDo: { [Op.like]: keyword } },
      ];
    }

    const { count, rows } = await YeuCauMauKhanCap.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: 'nguoiDaiDien',
          attributes: ['id', 'hoTen', 'email', 'soDienThoai'],
        },
      ],
      order: [
        ['mucDoKhanCap', 'DESC'],
        ['hanChot', 'ASC'],
      ],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, page, limit);
  }

  /**
   * 2. Bệnh viện tạo yêu cầu máu khẩn cấp
   */
  async taoYeuCauKhanCap(nguoiDaiDienId: number, data: CreateEmergencyRequestDTO) {
    const { benhVienYeuCau, nhomMauCan, thanhPhanCan, soLuongCanMl, soLuongTui, mucDoKhanCap, lyDo, hanChot } = data;

    if (!benhVienYeuCau || !nhomMauCan || !lyDo || !hanChot) {
      throw AppError.badRequest('Vui lòng điền đầy đủ: tên bệnh viện, nhóm máu cần, lý do và hạn chót.');
    }

    // Tính toán số ml máu cần thiết (Mặc định 1 túi = 350ml nếu truyền soLuongTui)
    let finalVolumeMl = soLuongCanMl;
    if (!finalVolumeMl && soLuongTui && soLuongTui > 0) {
      finalVolumeMl = soLuongTui * 350;
    }

    if (!finalVolumeMl || finalVolumeMl <= 0) {
      throw AppError.badRequest('Số lượng máu yêu cầu (ml hoặc số túi) phải lớn hơn 0.');
    }

    const deadline = new Date(hanChot);
    if (isNaN(deadline.getTime())) {
      throw AppError.badRequest('Định dạng hạn chót thời gian không hợp lệ.');
    }

    // Chuẩn hóa mức độ khẩn cấp
    let normalizedUrgency: MucDoKhanCap = 'CAO';
    if (mucDoKhanCap === 'RAT_KHAN' || mucDoKhanCap === 'NGUY_CAP') {
      normalizedUrgency = 'NGUY_CAP';
    } else if (mucDoKhanCap === 'TRUNG_BINH') {
      normalizedUrgency = 'TRUNG_BINH';
    }

    return YeuCauMauKhanCap.create({
      benhVienYeuCau: benhVienYeuCau.trim(),
      nguoiDaiDienId,
      nhomMauCan: nhomMauCan.trim().toUpperCase(),
      thanhPhanCan: thanhPhanCan || 'ToanPhan',
      soLuongCanMl: finalVolumeMl,
      mucDoKhanCap: normalizedUrgency,
      lyDo: lyDo.trim(),
      hanChot: deadline,
      trangThai: 'DangCho',
    });
  }

  /**
   * 3. Điều phối xuất kho theo FEFO và kiểm tra ma trận tương thích nhóm máu
   */
  async dieuPhoiXuatKho(yeuCauId: number, nguoiDieuPhoiId: number, dispatchData: DispatchEmergencyRequestDTO) {
    // THỰC THI TRANSACTION ĐỂ ĐẢM BẢO TOÀN VẸN DỮ LIỆU
    return sequelize.transaction(async (t: Transaction) => {
      // 1. Tìm đơn yêu cầu máu khẩn cấp
      const yeuCau = await YeuCauMauKhanCap.findByPk(yeuCauId, {
        include: [
          {
            model: NguoiDung,
            as: 'nguoiDaiDien',
            attributes: ['id', 'hoTen', 'email', 'soDienThoai'],
          },
        ],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!yeuCau) {
        throw AppError.notFound('Yêu cầu máu khẩn cấp không tồn tại.');
      }

      if (yeuCau.trangThai === 'DaDapUng') {
        throw AppError.badRequest('Yêu cầu máu này đã được đáp ứng hoàn tất.');
      }

      if (yeuCau.trangThai === 'DaHuy' || yeuCau.trangThai === 'HetHan') {
        throw AppError.badRequest('Yêu cầu máu này đã bị hủy hoặc hết hạn.');
      }

      // 2. Tra cứu danh sách nhóm máu tương thích theo ma trận y khoa
      const compatibleBloodTypes = getCompatibleDonorBloodTypes(yeuCau.nhomMauCan, yeuCau.thanhPhanCan);

      // 3. Tìm các túi máu có sẵn trong kho theo FEFO
      const availableInventories = await KhoMau.findAll({
        where: {
          nhomMau: { [Op.in]: compatibleBloodTypes },
          thanhPhan: yeuCau.thanhPhanCan,
          soLuongConLaiMl: { [Op.gt]: 0 },
        },
        order: [['ngayCapNhat', 'ASC']], // FEFO: Ngày lưu trữ/cập nhật cũ nhất xuất trước
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // 4. Tính tổng lượng máu tương thích hiện có trong kho
      const totalAvailableMl = availableInventories.reduce((sum, item) => sum + item.soLuongConLaiMl, 0);

      // 5. NẾU KHÔNG ĐỦ SỐ LƯỢNG MÁU TƯƠNG THÍCH -> BÁO LỖI VÀ TRẢ VỀ SỐ LƯỢNG CÒN THIẾU
      if (totalAvailableMl < yeuCau.soLuongCanMl) {
        const missingMl = yeuCau.soLuongCanMl - totalAvailableMl;
        throw AppError.badRequest(
          `Kho không đủ số lượng máu tương thích cho nhóm ${yeuCau.nhomMauCan}. Cần: ${yeuCau.soLuongCanMl}ml, Hiện có: ${totalAvailableMl}ml, Còn thiếu: ${missingMl}ml.`
        );
      }

      // 6. ĐỦ MÁU -> TIẾN HÀNH TRỪ KHO THEO FEFO & TẠO PHIẾU ĐIỀU PHỐI
      let remainingNeeded = yeuCau.soLuongCanMl;
      const dispatchRecords: DieuPhoiMau[] = [];

      for (const inv of availableInventories) {
        if (remainingNeeded <= 0) break;

        const deductAmount = Math.min(inv.soLuongConLaiMl, remainingNeeded);
        inv.soLuongConLaiMl -= deductAmount;
        await inv.save({ transaction: t });

        // Tạo bản ghi điều phối chi tiết
        const dispatchRecord = await DieuPhoiMau.create(
          {
            yeuCauId: yeuCau.id,
            khoMauId: inv.id,
            nguoiDieuPhoiId,
            soLuongXuatMl: deductAmount,
            trangThaiVanChuyen: 'DangGiao',
            donViVanChuyen: dispatchData.donViVanChuyen || 'Đội Cứu Trợ Y Tế Khẩn Cấp',
            thoiGianXuat: new Date(),
            thoiGianNhanDuKien: dispatchData.thoiGianNhanDuKien
              ? new Date(dispatchData.thoiGianNhanDuKien)
              : new Date(Date.now() + 2 * 3600 * 1000), // Mặc định sau 2 tiếng
            ghiChu:
              dispatchData.ghiChu ||
              `Xuất ${deductAmount}ml nhóm máu ${inv.nhomMau} (${inv.thanhPhan}) chi viện cho ${yeuCau.benhVienYeuCau}`,
          },
          { transaction: t }
        );

        dispatchRecords.push(dispatchRecord);
        remainingNeeded -= deductAmount;
      }

      // 7. Cập nhật trạng thái yêu cầu sang 'DaDapUng'
      yeuCau.trangThai = 'DaDapUng';
      await yeuCau.save({ transaction: t });

      return {
        yeuCau,
        danhSachXuatKho: dispatchRecords,
        tongLuongXuatMl: yeuCau.soLuongCanMl,
      };
    });
  }
}

export const emergencyService = new EmergencyService();
