import { Op, type Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { SuKienHienMau, LichHenHienMau, NguoiDung, KhoMau } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateSuKienDTO,
  CreateLichHenDTO,
  UpdateLichHenStatusDTO,
  SuKienQueryDTO,
  LichHenQueryDTO,
} from '../dtos/donation.dto.js';
import type { TrangThaiLichHen } from '../models/LichHenHienMau.js';
import { parsePaginationParams, buildPaginatedResponse } from '../dtos/pagination.dto.js';
import type { AuthUserPayload } from '../dtos/auth.dto.js';

export class DonationService {
  /**
   * 1. Lấy danh sách sự kiện hiến máu có Tìm kiếm, Lọc và Phân trang (Search, Filter, Pagination)
   */
  async layDanhSachSuKien(query: SuKienQueryDTO = {}) {
    const { page, limit, offset } = parsePaginationParams(query);
    const whereClause: Record<string, unknown> = {};

    // 1. Lọc theo trạng thái
    if (query.trangThai) {
      whereClause.trangThai = query.trangThai;
    }

    // 2. Lọc theo khoảng ngày diễn ra
    if (query.tuNgay || query.denNgay) {
      const dateCondition: Record<symbol, unknown> = {};
      if (query.tuNgay) {
        dateCondition[Op.gte] = new Date(query.tuNgay);
      }
      if (query.denNgay) {
        dateCondition[Op.lte] = new Date(query.denNgay);
      }
      whereClause.thoiGianBatDau = dateCondition;
    }

    // 3. Tìm kiếm theo tên sự kiện hoặc địa điểm (Op.like)
    if (query.search && query.search.trim() !== '') {
      const keyword = `%${query.search.trim()}%`;
      whereClause[Op.or as unknown as string] = [
        { tenSuKien: { [Op.like]: keyword } },
        { diaDiem: { [Op.like]: keyword } },
      ];
    }

    const { count, rows } = await SuKienHienMau.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: 'nguoiTao',
          attributes: ['id', 'hoTen', 'email'],
        },
      ],
      order: [['thoiGianBatDau', 'ASC']],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, page, limit);
  }

  /**
   * 1b. Lấy danh sách lịch hẹn hiến máu có Phân trang, Tìm kiếm, Lọc
   * - DONOR: Chỉ xem lịch hẹn của chính mình
   * - ADMIN / HOSPITAL_STAFF: Xem toàn bộ lịch hẹn
   */
  async layDanhSachLichHen(query: LichHenQueryDTO = {}, currentUser: AuthUserPayload) {
    const { page, limit, offset } = parsePaginationParams(query);
    const whereClause: Record<string, unknown> = {};

    // Phân quyền dữ liệu
    if (currentUser.vaiTro === 'DONOR') {
      whereClause.nguoiHienId = currentUser.id;
    } else if (query.nguoiHienId) {
      whereClause.nguoiHienId = Number(query.nguoiHienId);
    }

    if (query.suKienId) {
      whereClause.suKienId = Number(query.suKienId);
    }

    if (query.trangThai) {
      whereClause.trangThai = query.trangThai;
    }

    const { count, rows } = await LichHenHienMau.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: 'nguoiHien',
          attributes: ['id', 'hoTen', 'email', 'soDienThoai', 'nhomMau', 'yeuToRh'],
        },
        {
          model: SuKienHienMau,
          as: 'suKien',
          attributes: ['id', 'tenSuKien', 'diaDiem', 'thoiGianBatDau'],
        },
      ],
      order: [['ngayHen', 'DESC']],
      limit,
      offset,
    });

    return buildPaginatedResponse(rows, count, page, limit);
  }

  /**
   * 2. Tạo sự kiện hiến máu mới (Dành cho Admin)
   */
  async taoSuKien(nguoiTaoId: number, data: CreateSuKienDTO) {
    const { tenSuKien, moTa, diaDiem, thoiGianBatDau, thoiGianKetThuc, soLuongDuKien } = data;

    if (!tenSuKien || !diaDiem || !thoiGianBatDau || !thoiGianKetThuc) {
      throw AppError.badRequest('Vui lòng điền đầy đủ tên sự kiện, địa điểm, thời gian bắt đầu và kết thúc.');
    }

    const startDate = new Date(thoiGianBatDau);
    const endDate = new Date(thoiGianKetThuc);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw AppError.badRequest('Định dạng thời gian không hợp lệ.');
    }

    if (endDate <= startDate) {
      throw AppError.badRequest('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
    }

    return SuKienHienMau.create({
      tenSuKien: tenSuKien.trim(),
      moTa: moTa ? moTa.trim() : null,
      diaDiem: diaDiem.trim(),
      thoiGianBatDau: startDate,
      thoiGianKetThuc: endDate,
      soLuongDuKien: soLuongDuKien || 50,
      soLuongDaDangKy: 0,
      trangThai: 'SapDienRa',
      nguoiTaoId,
    });
  }

  /**
   * 3. Đặt lịch hẹn hiến máu (Quy tắc 84 ngày)
   */
  async datLichHen(nguoiHienId: number, data: CreateLichHenDTO) {
    const { suKienId, ngayHen, khungGio, luongMauHienMl, tinhTrangSucKhoe, ghiChu } = data;

    if (!ngayHen || !khungGio) {
      throw AppError.badRequest('Vui lòng chọn ngày hẹn và khung giờ hiến máu.');
    }

    const appointmentDate = new Date(ngayHen);
    if (isNaN(appointmentDate.getTime())) {
      throw AppError.badRequest('Định dạng ngày hẹn không hợp lệ.');
    }

    // 1. Kiểm tra sự tồn tại của người hiến
    const donor = await NguoiDung.findByPk(nguoiHienId);
    if (!donor) {
      throw AppError.notFound('Không tìm thấy thông tin người hiến máu.');
    }

    // 2. KIỂM TRA QUY TẮC NGHIỆP VỤ 84 NGÀY (12 TUẦN) KỂ TỪ LẦN HIẾN THÀNH CÔNG GẦN NHẤT
    const lanHienThanhCongGanNhat = await LichHenHienMau.findOne({
      where: {
        nguoiHienId,
        trangThai: 'HoanThanh',
      },
      order: [['ngayHen', 'DESC']],
    });

    if (lanHienThanhCongGanNhat) {
      const lastDonationDate = new Date(lanHienThanhCongGanNhat.ngayHen);
      const diffTime = appointmentDate.getTime() - lastDonationDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 84) {
        throw AppError.badRequest(
          `Chưa đủ khoảng cách tối thiểu 84 ngày kể từ lần hiến máu trước (Lần gần nhất: ${lastDonationDate.toLocaleDateString('vi-VN')}, cách ${diffDays} ngày).`
        );
      }
    }

    // 3. Nếu đặt lịch theo sự kiện, kiểm tra sự kiện có hợp lệ không
    if (suKienId) {
      const suKien = await SuKienHienMau.findByPk(suKienId);
      if (!suKien) {
        throw AppError.notFound('Sự kiện hiến máu không tồn tại.');
      }
      if (suKien.trangThai === 'KetThuc' || suKien.trangThai === 'DaHuy') {
        throw AppError.badRequest('Sự kiện hiến máu này đã kết thúc hoặc bị hủy.');
      }

      // Tăng số lượng đã đăng ký
      await suKien.increment('soLuongDaDangKy', { by: 1 });
    }

    // 4. Tạo lịch hẹn mới
    return LichHenHienMau.create({
      nguoiHienId,
      suKienId: suKienId || null,
      ngayHen: appointmentDate,
      khungGio,
      luongMauHienMl: luongMauHienMl || 350,
      tinhTrangSucKhoe: tinhTrangSucKhoe || 'Bình thường',
      trangThai: 'ChoXacNhan',
      ghiChu: ghiChu || null,
    });
  }

  /**
   * 4. Cập nhật kết quả hiến máu (Sử dụng Transaction để đảm bảo tính toàn vẹn với KhoMau)
   */
  async capNhatKetQuaLichHen(lichHenId: number, data: UpdateLichHenStatusDTO) {
    const { trangThai, luongMauThucTeMl, donViLuuTru, ghiChu } = data;

    // Chuẩn hóa trạng thái
    let targetStatus: TrangThaiLichHen;
    if (trangThai === 'THANH_CONG' || trangThai === 'HoanThanh') {
      targetStatus = 'HoanThanh';
    } else if (trangThai === 'BI_TU_CHOI' || trangThai === 'DaHuy') {
      targetStatus = 'DaHuy';
    } else if (trangThai === 'KhongDen') {
      targetStatus = 'KhongDen';
    } else if (trangThai === 'DaXacNhan') {
      targetStatus = 'DaXacNhan';
    } else {
      throw AppError.badRequest(`Trạng thái không hợp lệ: ${trangThai}`);
    }

    // THỰC THI TRANSACTION
    return sequelize.transaction(async (t: Transaction) => {
      // 1. Tìm lịch hẹn và thông tin người hiến
      const appointment = await LichHenHienMau.findByPk(lichHenId, {
        include: [
          {
            model: NguoiDung,
            as: 'nguoiHien',
            attributes: { exclude: ['matKhauHash'] },
          },
        ],
        transaction: t,
      });

      if (!appointment) {
        throw AppError.notFound('Lịch hẹn hiến máu không tồn tại.');
      }

      // 2. Nếu trạng thái là Hoàn Thành (Hiến máu thành công) -> CỘNG VÀO KHO MÁU
      if (targetStatus === 'HoanThanh') {
        const bloodAmount = luongMauThucTeMl || appointment.luongMauHienMl || 350;
        const donorBloodType = appointment.nguoiHien?.nhomMau || 'O+';
        const storageFacility = donViLuuTru || 'Kho Lưu Trữ Trung Tâm - TP.HCM';

        // Tìm hoặc tạo bản ghi kho máu tương ứng
        let inventoryItem = await KhoMau.findOne({
          where: {
            nhomMau: donorBloodType,
            thanhPhan: 'ToanPhan',
            donViLuuTru: storageFacility,
          },
          transaction: t,
        });

        if (inventoryItem) {
          await inventoryItem.increment('soLuongConLaiMl', {
            by: bloodAmount,
            transaction: t,
          });
        } else {
          inventoryItem = await KhoMau.create(
            {
              nhomMau: donorBloodType,
              thanhPhan: 'ToanPhan',
              soLuongConLaiMl: bloodAmount,
              nguongCanhBaoMl: 500,
              donViLuuTru: storageFacility,
            },
            { transaction: t }
          );
        }

        // Cập nhật lượng máu thực tế và trạng thái lịch hẹn
        appointment.luongMauHienMl = bloodAmount;
      }

      // 3. Cập nhật thông tin lịch hẹn
      appointment.trangThai = targetStatus;
      if (ghiChu) {
        appointment.ghiChu = ghiChu;
      }
      await appointment.save({ transaction: t });

      return appointment;
    });
  }

  /**
   * 5. Cập nhật sự kiện hiến máu (Admin)
   */
  async capNhatSuKien(id: number, data: Partial<CreateSuKienDTO>) {
    const suKien = await SuKienHienMau.findByPk(id);
    if (!suKien) {
      throw AppError.notFound('Sự kiện hiến máu không tồn tại.');
    }

    if (data.tenSuKien) suKien.tenSuKien = data.tenSuKien.trim();
    if (data.moTa !== undefined) suKien.moTa = data.moTa ? data.moTa.trim() : null;
    if (data.diaDiem) suKien.diaDiem = data.diaDiem.trim();
    if (data.thoiGianBatDau) suKien.thoiGianBatDau = new Date(data.thoiGianBatDau);
    if (data.thoiGianKetThuc) suKien.thoiGianKetThuc = new Date(data.thoiGianKetThuc);
    if (data.soLuongDuKien !== undefined) suKien.soLuongDuKien = Number(data.soLuongDuKien);
    if (data.trangThai) {
      if (!['SapDienRa', 'DangDienRa', 'KetThuc', 'DaHuy'].includes(data.trangThai)) {
        throw AppError.badRequest(`Trạng thái sự kiện không hợp lệ: ${data.trangThai}`);
      }
      suKien.trangThai = data.trangThai;
    }

    await suKien.save();
    return suKien;
  }

  /**
   * 5b. Đổi trạng thái sự kiện hiến máu (Tắt / Khôi phục / Kết thúc) - Dành cho Admin
   */
  async doiTrangThaiSuKien(id: number, trangThai: any, lyDo?: string) {
    const suKien = await SuKienHienMau.findByPk(id);
    if (!suKien) {
      throw AppError.notFound('Sự kiện hiến máu không tồn tại.');
    }

    if (!['SapDienRa', 'DangDienRa', 'KetThuc', 'DaHuy'].includes(trangThai)) {
      throw AppError.badRequest(`Trạng thái sự kiện không hợp lệ: ${trangThai}`);
    }

    suKien.trangThai = trangThai;
    if (lyDo && lyDo.trim()) {
      const cleanReason = lyDo.trim();
      if (!suKien.moTa?.includes(cleanReason)) {
        suKien.moTa = suKien.moTa ? `${suKien.moTa} [${cleanReason}]` : cleanReason;
      }
    }

    await suKien.save();
    return suKien;
  }

  /**
   * 6. Xóa sự kiện hiến máu (Admin)
   */
  async xoaSuKien(id: number) {
    const suKien = await SuKienHienMau.findByPk(id);
    if (!suKien) {
      throw AppError.notFound('Sự kiện hiến máu không tồn tại.');
    }

    // Xóa liên kết lịch hẹn hoặc cập nhật suKienId = null
    await LichHenHienMau.update({ suKienId: null }, { where: { suKienId: id } });
    await suKien.destroy();
    return { id, message: 'Đã xóa sự kiện hiến máu thành công.' };
  }

  /**
   * 7. Lấy lịch sử hiến máu của chính người dùng (Donor)
   */
  async layLichSuHienMauCuaToi(donorId: number): Promise<any[]> {
    const donor = await NguoiDung.findByPk(donorId, {
      attributes: ['id', 'hoTen', 'nhomMau', 'yeuToRh'],
    });

    const rows = await LichHenHienMau.findAll({
      where: { nguoiHienId: donorId },
      include: [
        {
          model: SuKienHienMau,
          as: 'suKien',
          attributes: ['id', 'tenSuKien', 'diaDiem', 'thoiGianBatDau'],
        },
      ],
      order: [['ngayHen', 'DESC']],
    });

    return rows.map((item) => {
      let statusFrontend: 'CHO_TIEP_NHAN' | 'DA_TIEP_NHAN' | 'HOAN_THANH' | 'DA_HUY' = 'CHO_TIEP_NHAN';
      if (item.trangThai === 'HoanThanh') statusFrontend = 'HOAN_THANH';
      else if (item.trangThai === 'DaXacNhan') statusFrontend = 'DA_TIEP_NHAN';
      else if (item.trangThai === 'DaHuy' || item.trangThai === 'KhongDen') statusFrontend = 'DA_HUY';
      else statusFrontend = 'CHO_TIEP_NHAN';

      const appointmentDate = new Date(item.ngayHen);
      const formattedDate = appointmentDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const year = appointmentDate.getFullYear();

      // Chiết xuất địa điểm từ sự kiện hoặc ghi chú
      let location = item.suKien?.diaDiem;
      if (!location && item.ghiChu) {
        if (item.ghiChu.includes('Địa điểm:')) {
          location = item.ghiChu.split('Địa điểm:')[1]?.split('.')[0]?.trim();
        } else if (item.ghiChu.includes('Điểm hiến:')) {
          location = item.ghiChu.split('Điểm hiến:')[1]?.split('.')[0]?.trim();
        }
      }
      if (!location) {
        location = 'Bệnh viện Chợ Rẫy (Trung Tâm Truyền Máu)';
      }

      let certificateNumber: string | undefined = undefined;
      if (item.ghiChu && item.ghiChu.includes('Giấy chứng nhận số:')) {
        certificateNumber = item.ghiChu.split('Giấy chứng nhận số:')[1]?.split('.')[0]?.trim();
      }
      if (!certificateNumber && item.trangThai === 'HoanThanh') {
        certificateNumber = `GCN-${year}-${String(item.id).padStart(5, '0')}`;
      }

      return {
        id: `DON-${year}-${String(item.id).padStart(3, '0')}`,
        rawId: item.id,
        eventId: item.suKienId || 0,
        tenSuKien: item.suKien?.tenSuKien || 'Hiến Máu Tình Nguyện Định Kỳ',
        diaDiem: location,
        diaChi: location,
        thoiGianHen: `${formattedDate} ${item.khungGio}`,
        ngayHen: formattedDate,
        khungGio: item.khungGio,
        luongMau: `${item.luongMauHienMl || 350}ml`,
        luongMauHienMl: item.luongMauHienMl || 350,
        nhomMau: donor?.nhomMau || 'O+',
        trangThai: statusFrontend,
        trangThaiGoc: item.trangThai,
        maQR: `QR-DON-${year}-${item.id}`,
        soChungNhan: certificateNumber,
        tinhTrangSucKhoe: item.tinhTrangSucKhoe,
        ghiChu: item.ghiChu,
        createdAt: item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '',
      };
    });
  }

  /**
   * 8. Hủy / Xóa lịch hẹn hiến máu
   */
  async xoaLichHen(lichHenId: number, currentUserId: number, currentUserRole: string) {
    const appointment = await LichHenHienMau.findByPk(lichHenId);
    if (!appointment) {
      throw AppError.notFound('Lịch hẹn hiến máu không tồn tại.');
    }

    // Kiểm tra quyền: Người tạo (Donor) hoặc Admin / Hospital Staff
    if (currentUserRole === 'DONOR' && appointment.nguoiHienId !== currentUserId) {
      throw AppError.forbidden('Bạn không có quyền thao tác trên lịch hẹn của người khác.');
    }

    // Đánh dấu hủy
    appointment.trangThai = 'DaHuy';
    await appointment.save();
    return { id: lichHenId, message: 'Đã hủy lịch hẹn hiến máu thành công.' };
  }
}

export const donationService = new DonationService();
