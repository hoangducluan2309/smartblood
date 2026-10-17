import { Op } from 'sequelize';
import { KhoMau, YeuCauMauKhanCap, LichHenHienMau, NguoiDung } from '../models/index.js';
import { getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.util.js';

export type MucDoNguyCo = 'AN_TOAN' | 'NGUY_CO_THIEU' | 'THIEU_NGHIEM_TRONG';

export interface BloodGroupRiskReport {
  nhomMau: string;
  tonKhoHienTaiMl: number;
  nguongAnToanMl: number;
  nhuCauDangChoMl: number;
  tongLieuUocTinhConLaiMl: number;
  tiLeDapUngPhanTram: number;
  mucDoNguyCo: MucDoNguyCo;
  khuyenNghi: string;
}

export interface UrgentDonorCandidate {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  nhomMau: string | null;
  yeuToRh: string | null;
  diaChi: string | null;
  ngayHienGanNhat: Date | null;
  soNgayKeTuLanHienTruoc: number | null;
  trangThaiSanSang: boolean;
}

/**
 * Thuật toán phân loại mức độ rủi ro kho máu
 */
export function danhGiaMucDoNguyCo(
  tonKho: number,
  nguongAnToan: number,
  nhuCauDangCho: number
): { mucDo: MucDoNguyCo; khuyenNghi: string } {
  const tonKhoSauKhiTruNhuCau = tonKho - nhuCauDangCho;

  // 1. Thiếu nghiêm trọng: Tồn kho không đủ đáp ứng nhu cầu chờ hoặc dưới 40% ngưỡng an toàn
  if (tonKhoSauKhiTruNhuCau < 0 || tonKho <= nguongAnToan * 0.4) {
    return {
      mucDo: 'THIEU_NGHIEM_TRONG',
      khuyenNghi: 'CẦN KÍCH HOẠT BÁO ĐỘNG ĐỎ: Phát động ngày hội hiến máu khẩn cấp và liên hệ trực tiếp nhóm tình nguyện viên tương thích ngay lập tức.',
    };
  }

  // 2. Nguy cơ thiếu: Tồn kho nằm dưới hoặc xấp xỉ ngưỡng an toàn (<= 100% ngưỡng)
  if (tonKho <= nguongAnToan || tonKhoSauKhiTruNhuCau <= nguongAnToan * 0.5) {
    return {
      mucDo: 'NGUY_CO_THIEU',
      khuyenNghi: 'CẢNH BÁO MỨC VÀNG: Cần lên kế hoạch điều phối tiếp viện và gửi thông báo nhắc lịch hiến máu định kỳ cho các tình nguyện viên.',
    };
  }

  // 3. An toàn: Tồn kho dồi dào, vượt ngưỡng an toàn
  return {
    mucDo: 'AN_TOAN',
    khuyenNghi: 'Trữ lượng máu ổn định, đủ khả năng đáp ứng nhu cầu điều trị và cấp cứu thông thường.',
  };
}

export class ForecastService {
  /**
   * 1. Tính toán và phân tích nguy cơ thiếu hụt máu trên toàn hệ thống
   */
  async tinhToanNguyCoThieuHut(): Promise<{
    tongTonKhoToanHeThongMl: number;
    tongNhuCauDangChoMl: number;
    soNhomMauThieuNghiemTrong: number;
    chiTietTheoNhomMau: BloodGroupRiskReport[];
    thoiDiemDuBao: Date;
  }> {
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    // Lấy toàn bộ tồn kho hiện tại
    const allInventories = await KhoMau.findAll();

    // Lấy toàn bộ yêu cầu khẩn cấp đang chờ duyệt
    const pendingRequests = await YeuCauMauKhanCap.findAll({
      where: {
        trangThai: {
          [Op.in]: ['DangCho', 'DangDieuPhoi'],
        },
      },
    });

    const reportList: BloodGroupRiskReport[] = [];
    let tongTonKhoToanHeThongMl = 0;
    let tongNhuCauDangChoMl = 0;
    let soNhomMauThieuNghiemTrong = 0;

    for (const type of bloodTypes) {
      // Tổng tồn kho của nhóm máu này
      const currentStock = allInventories
        .filter((item) => item.nhomMau === type)
        .reduce((sum, item) => sum + item.soLuongConLaiMl, 0);

      // Ngưỡng an toàn tổng hợp
      const safetyThreshold = allInventories
        .filter((item) => item.nhomMau === type)
        .reduce((sum, item) => sum + item.nguongCanhBaoMl, 0) || 1000;

      // Nhu cầu đang chờ cấp phát
      const pendingDemand = pendingRequests
        .filter((req) => req.nhomMauCan === type)
        .reduce((sum, req) => sum + req.soLuongCanMl, 0);

      tongTonKhoToanHeThongMl += currentStock;
      tongNhuCauDangChoMl += pendingDemand;

      const { mucDo, khuyenNghi } = danhGiaMucDoNguyCo(currentStock, safetyThreshold, pendingDemand);
      if (mucDo === 'THIEU_NGHIEM_TRONG') {
        soNhomMauThieuNghiemTrong++;
      }

      const tonKhoSauNhuCau = currentStock - pendingDemand;
      const tiLeDapUng = safetyThreshold > 0 ? Math.round((currentStock / safetyThreshold) * 100) : 100;

      reportList.push({
        nhomMau: type,
        tonKhoHienTaiMl: currentStock,
        nguongAnToanMl: safetyThreshold,
        nhuCauDangChoMl: pendingDemand,
        tongLieuUocTinhConLaiMl: tonKhoSauNhuCau,
        tiLeDapUngPhanTram: tiLeDapUng,
        mucDoNguyCo: mucDo,
        khuyenNghi,
      });
    }

    return {
      tongTonKhoToanHeThongMl,
      tongNhuCauDangChoMl,
      soNhomMauThieuNghiemTrong,
      chiTietTheoNhomMau: reportList,
      thoiDiemDuBao: new Date(),
    };
  }

  /**
   * 2. Tìm kiếm danh sách tình nguyện viên hiến máu khẩn cấp (Đủ điều kiện >= 84 ngày)
   * @param targetBloodType Nhóm máu bệnh viện đang cần (vd: 'A+', 'O-')
   */
  async timKiemNguoiHienMauKhanCap(targetBloodType?: string): Promise<{
    nhomMauCanTim: string;
    nhomMauTuongThich: string[];
    tongSoLuongKhaDung: number;
    danhSachNguoiHien: UrgentDonorCandidate[];
  }> {
    const requiredType = targetBloodType ? targetBloodType.trim().toUpperCase() : 'O+';
    const compatibleTypes = getCompatibleDonorBloodTypes(requiredType, 'ToanPhan');

    // 1. Tìm tất cả DONOR có nhóm máu tương thích và đang Hoạt động
    const donors = await NguoiDung.findAll({
      where: {
        vaiTro: 'DONOR',
        trangThai: 'HoatDong',
        nhomMau: {
          [Op.in]: compatibleTypes,
        },
      },
      attributes: ['id', 'hoTen', 'email', 'soDienThoai', 'nhomMau', 'yeuToRh', 'diaChi'],
    });

    const eligibleDonors: UrgentDonorCandidate[] = [];
    const now = new Date();

    for (const donor of donors) {
      // 2. Tra cứu lần hiến máu thành công gần nhất của tình nguyện viên này
      const lastDonation = await LichHenHienMau.findOne({
        where: {
          nguoiHienId: donor.id,
          trangThai: 'HoanThanh',
        },
        order: [['ngayHen', 'DESC']],
      });

      if (!lastDonation) {
        // Chưa từng hiến máu -> Hoàn toàn sẵn sàng
        eligibleDonors.push({
          id: donor.id,
          hoTen: donor.hoTen,
          email: donor.email,
          soDienThoai: donor.soDienThoai,
          nhomMau: donor.nhomMau,
          yeuToRh: donor.yeuToRh,
          diaChi: donor.diaChi,
          ngayHienGanNhat: null,
          soNgayKeTuLanHienTruoc: null,
          trangThaiSanSang: true,
        });
      } else {
        const lastDate = new Date(lastDonation.ngayHen);
        const diffTime = now.getTime() - lastDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // ĐỦ ĐIỀU KIỆN >= 84 NGÀY
        if (diffDays >= 84) {
          eligibleDonors.push({
            id: donor.id,
            hoTen: donor.hoTen,
            email: donor.email,
            soDienThoai: donor.soDienThoai,
            nhomMau: donor.nhomMau,
            yeuToRh: donor.yeuToRh,
            diaChi: donor.diaChi,
            ngayHienGanNhat: lastDate,
            soNgayKeTuLanHienTruoc: diffDays,
            trangThaiSanSang: true,
          });
        }
      }
    }

    // Sắp xếp ưu tiên: Người chưa từng hiến hoặc có khoảng cách hiến lâu nhất lên trước
    eligibleDonors.sort((a, b) => {
      const daysA = a.soNgayKeTuLanHienTruoc ?? 9999;
      const daysB = b.soNgayKeTuLanHienTruoc ?? 9999;
      return daysB - daysA;
    });

    return {
      nhomMauCanTim: requiredType,
      nhomMauTuongThich: compatibleTypes,
      tongSoLuongKhaDung: eligibleDonors.length,
      danhSachNguoiHien: eligibleDonors,
    };
  }
}

export const forecastService = new ForecastService();
