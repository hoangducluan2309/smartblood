import { Op, type Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { SuKienHienMau, LichHenHienMau, NguoiDung, KhoMau } from '../models/index.js';
import { AppError } from '../utils/AppError.js';
import type { CreateSuKienDTO, CreateLichHenDTO, UpdateLichHenStatusDTO, ResultStatusInput } from '../dtos/donation.dto.js';
import type { TrangThaiLichHen } from '../models/LichHenHienMau.js';

export class DonationService {
  /**
   * 1. Lấy danh sách sự kiện hiến máu đang mở (SapDienRa, DangDienRa)
   */
  async layDanhSachSuKien(chiLayDangMo: boolean = true) {
    const whereClause = chiLayDangMo
      ? {
          trangThai: {
            [Op.in]: ['SapDienRa', 'DangDienRa'],
          },
        }
      : {};

    return SuKienHienMau.findAll({
      where: whereClause,
      include: [
        {
          model: NguoiDung,
          as: 'nguoiTao',
          attributes: ['id', 'hoTen', 'email'],
        },
      ],
      order: [['thoiGianBatDau', 'ASC']],
    });
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
}

export const donationService = new DonationService();
