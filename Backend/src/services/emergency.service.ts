import { Op, type Transaction } from 'sequelize';
import { sequelize } from '../config/database.js';
import { KhoMau, YeuCauMauKhanCap, DieuPhoiMau, NguoiDung } from '../models/index.js';
import { getCompatibleDonorBloodTypes } from '../utils/bloodCompatibility.util.js';
import { AppError } from '../utils/AppError.js';
import type {
  CreateEmergencyRequestDTO,
  DispatchEmergencyRequestDTO,
  DirectDispatchDTO,
  MucDoKhanCapInput,
  BloodInventoryQueryDTO,
  EmergencyRequestQueryDTO,
} from '../dtos/emergency.dto.js';
import type { MucDoKhanCap } from '../models/YeuCauMauKhanCap.js';
import type { TrangThaiVanChuyen } from '../models/DieuPhoiMau.js';
import { parsePaginationParams, buildPaginatedResponse, type PaginationQuery } from '../dtos/pagination.dto.js';

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
   * 3. Điều phối xuất kho theo FEFO hoặc theo nhóm máu / lô kho máu được chỉ định
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

      // Nếu người điều phối chọn xuất nhóm máu cụ thể
      let targetBloodTypes = compatibleBloodTypes;
      if (dispatchData.nhomMauXuat) {
        const chosenGroup = dispatchData.nhomMauXuat.trim().toUpperCase();
        if (!compatibleBloodTypes.includes(chosenGroup)) {
          throw AppError.badRequest(
            `Nhóm máu xuất [${chosenGroup}] không tương thích y khoa với nhóm máu cần [${yeuCau.nhomMauCan}] (${yeuCau.thanhPhanCan}). Nhóm máu tương thích hợp lệ: ${compatibleBloodTypes.join(', ')}`
          );
        }
        targetBloodTypes = [chosenGroup];
      }

      // 3. Xây dựng điều kiện truy vấn kho máu
      const inventoryWhere: Record<string, unknown> = {
        nhomMau: { [Op.in]: targetBloodTypes },
        thanhPhan: yeuCau.thanhPhanCan,
        soLuongConLaiMl: { [Op.gt]: 0 },
      };

      if (dispatchData.khoMauId) {
        inventoryWhere.id = dispatchData.khoMauId;
      } else if (dispatchData.khoMauIds && dispatchData.khoMauIds.length > 0) {
        inventoryWhere.id = { [Op.in]: dispatchData.khoMauIds };
      }

      // Tìm các túi máu có sẵn trong kho theo FEFO
      const availableInventories = await KhoMau.findAll({
        where: inventoryWhere,
        order: [['ngayCapNhat', 'ASC']], // FEFO: Ngày lưu trữ/cập nhật cũ nhất xuất trước
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      // 4. Tính tổng lượng máu tương thích hiện có trong kho
      const totalAvailableMl = availableInventories.reduce((sum, item) => sum + item.soLuongConLaiMl, 0);

      // Tính thể tích cần xuất theo lựa chọn của người điều phối
      let requiredMl = yeuCau.soLuongCanMl;
      if (dispatchData.soLuongXuatMl && Number(dispatchData.soLuongXuatMl) > 0) {
        requiredMl = Number(dispatchData.soLuongXuatMl);
      } else if (dispatchData.soLuongTui && Number(dispatchData.soLuongTui) > 0) {
        requiredMl = Number(dispatchData.soLuongTui) * 350;
      }

      if (totalAvailableMl < requiredMl) {
        const missingMl = requiredMl - totalAvailableMl;
        throw AppError.badRequest(
          `Kho không đủ số lượng máu cho nhóm ${yeuCau.nhomMauCan}. Cần xuất: ${requiredMl}ml, Hiện có: ${totalAvailableMl}ml, Còn thiếu: ${missingMl}ml.`
        );
      }

      // 5. TIẾN HÀNH TRỪ KHO THEO FEFO & TẠO PHIẾU ĐIỀU PHỐI XE 115
      let remainingNeeded = requiredMl;
      const dispatchRecords: DieuPhoiMau[] = [];

      const vehicleString = dispatchData.bienSoXe
        ? `${dispatchData.donViVanChuyen || 'Đội Cấp Cứu 115'} [BS: ${dispatchData.bienSoXe}]`
        : (dispatchData.donViVanChuyen || 'Đội Cứu Trợ Y Tế Khẩn Cấp 115');

      const driverDetails = dispatchData.taiXe
        ? `Tài xế: ${dispatchData.taiXe}${dispatchData.soDienThoaiTaiXe ? ' (' + dispatchData.soDienThoaiTaiXe + ')' : ''}. `
        : '';

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
            donViVanChuyen: vehicleString,
            thoiGianXuat: new Date(),
            thoiGianNhanDuKien: dispatchData.thoiGianNhanDuKien
              ? new Date(dispatchData.thoiGianNhanDuKien)
              : new Date(Date.now() + 2 * 3600 * 1000), // Mặc định sau 2 tiếng
            ghiChu: `${driverDetails}${
              dispatchData.ghiChu ||
              `Xuất ${deductAmount}ml nhóm máu ${inv.nhomMau} (${inv.thanhPhan}) chi viện cho ${yeuCau.benhVienYeuCau}`
            }`.slice(0, 500),
          },
          { transaction: t }
        );

        dispatchRecords.push(dispatchRecord);
        remainingNeeded -= deductAmount;
      }

      // 6. Cập nhật trạng thái yêu cầu sang 'DaDapUng' hoặc 'DangDieuPhoi'
      yeuCau.trangThai = (yeuCau.soLuongCanMl <= requiredMl) ? 'DaDapUng' : 'DangDieuPhoi';
      await yeuCau.save({ transaction: t });

      return {
        yeuCau,
        danhSachXuatKho: dispatchRecords,
        tongLuongXuatMl: requiredMl,
      };
    });
  }

  /**
   * 3b. Tạo lệnh điều phối xe cứu trợ và xuất kho trực tiếp
   */
  async dieuPhoiTrucTiep(nguoiDieuPhoiId: number, data: DirectDispatchDTO) {
    const { benhVienNhan, nhomMau, thanhPhan = 'ToanPhan', khoMauId } = data;
    if (!benhVienNhan || !nhomMau) {
      throw AppError.badRequest('Vui lòng cung cấp tên bệnh viện nhận và nhóm máu cần xuất.');
    }

    let volumeMl = data.soLuongXuatMl;
    if (!volumeMl && data.soLuongTui && data.soLuongTui > 0) {
      volumeMl = data.soLuongTui * 350;
    }
    if (!volumeMl || volumeMl <= 0) {
      throw AppError.badRequest('Thể tích máu xuất kho phải lớn hơn 0ml.');
    }

    return sequelize.transaction(async (t: Transaction) => {
      // 1. Tạo bản ghi yêu cầu cấp cứu tương ứng
      const yeuCau = await YeuCauMauKhanCap.create(
        {
          benhVienYeuCau: benhVienNhan.trim(),
          nguoiDaiDienId: nguoiDieuPhoiId,
          nhomMauCan: nhomMau.trim().toUpperCase(),
          thanhPhanCan: thanhPhan,
          soLuongCanMl: volumeMl,
          mucDoKhanCap: 'NGUY_CAP',
          lyDo: `Điều phối xuất máu chi viện trực tiếp: ${data.ghiChu || 'Cứu trợ hỏa tốc'}`,
          hanChot: new Date(Date.now() + 2 * 3600 * 1000),
          trangThai: 'DaDapUng',
        },
        { transaction: t }
      );

      // 2. Tra cứu kho máu
      const inventoryWhere: Record<string, unknown> = {
        nhomMau: nhomMau.trim().toUpperCase(),
        thanhPhan,
        soLuongConLaiMl: { [Op.gt]: 0 },
      };
      if (khoMauId) {
        inventoryWhere.id = khoMauId;
      }

      const availableInventories = await KhoMau.findAll({
        where: inventoryWhere,
        order: [['ngayCapNhat', 'ASC']],
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      const totalAvailableMl = availableInventories.reduce((sum, item) => sum + item.soLuongConLaiMl, 0);
      if (totalAvailableMl < volumeMl) {
        throw AppError.badRequest(
          `Kho không đủ nhóm máu ${nhomMau} (${thanhPhan}). Cần xuất: ${volumeMl}ml, Hiện có trong kho: ${totalAvailableMl}ml.`
        );
      }

      let remainingNeeded = volumeMl;
      const dispatchRecords: DieuPhoiMau[] = [];

      const vehicleString = data.bienSoXe
        ? `${data.donViVanChuyen || 'Đội Cấp Cứu 115'} [BS: ${data.bienSoXe}]`
        : (data.donViVanChuyen || 'Đội Cứu Trợ Y Tế Khẩn Cấp 115');

      const driverDetails = data.taiXe
        ? `Tài xế: ${data.taiXe}${data.soDienThoaiTaiXe ? ' (' + data.soDienThoaiTaiXe + ')' : ''}. `
        : '';

      for (const inv of availableInventories) {
        if (remainingNeeded <= 0) break;

        const deductAmount = Math.min(inv.soLuongConLaiMl, remainingNeeded);
        inv.soLuongConLaiMl -= deductAmount;
        await inv.save({ transaction: t });

        const record = await DieuPhoiMau.create(
          {
            yeuCauId: yeuCau.id,
            khoMauId: inv.id,
            nguoiDieuPhoiId,
            soLuongXuatMl: deductAmount,
            trangThaiVanChuyen: 'DangGiao',
            donViVanChuyen: vehicleString,
            thoiGianXuat: new Date(),
            thoiGianNhanDuKien: data.thoiGianNhanDuKien
              ? new Date(data.thoiGianNhanDuKien)
              : new Date(Date.now() + 2 * 3600 * 1000),
            ghiChu: `${driverDetails}${data.ghiChu || `Xuất ${deductAmount}ml nhóm ${inv.nhomMau} (${inv.thanhPhan}) cho ${benhVienNhan}`}`.slice(0, 500),
          },
          { transaction: t }
        );

        dispatchRecords.push(record);
        remainingNeeded -= deductAmount;
      }

      return {
        yeuCau,
        danhSachXuatKho: dispatchRecords,
        tongLuongXuatMl: volumeMl,
      };
    });
  }

  /**
   * 3c. Xem danh sách các chuyến xe điều phối đã xuất kho
   */
  async layDanhSachDieuPhoi(query: PaginationQuery = {}) {
    const { page, limit, offset } = parsePaginationParams(query);
    const { count, rows } = await DieuPhoiMau.findAndCountAll({
      include: [
        {
          model: YeuCauMauKhanCap,
          as: 'yeuCau',
          attributes: ['id', 'benhVienYeuCau', 'nhomMauCan', 'thanhPhanCan', 'mucDoKhanCap', 'lyDo', 'trangThai'],
        },
        {
          model: KhoMau,
          as: 'khoMau',
          attributes: ['id', 'nhomMau', 'thanhPhan', 'donViLuuTru'],
        },
        {
          model: NguoiDung,
          as: 'nguoiDieuPhoi',
          attributes: ['id', 'hoTen', 'email', 'soDienThoai'],
        },
      ],
      order: [['ngayTao', 'DESC']],
      limit,
      offset,
    });

    const result = buildPaginatedResponse(rows, count, page, limit);
    return {
      ...result,
      items: result.items.map((record) => {
        const ghiChu = record.ghiChu || '';
        const driverDetails = ghiChu.match(/^Tài xế:\s*(.*?)\s*\((\d{10})\)\.\s*/);
        return {
          ...record.toJSON(),
          taiXe: driverDetails?.[1],
          soDienThoaiTaiXe: driverDetails?.[2],
        };
      }),
    };
  }

  /**
   * 3d. Cập nhật trạng thái vận chuyển của chuyến xe điều phối
   */
  async capNhatTrangThaiVanChuyen(id: number, trangThai: TrangThaiVanChuyen, ghiChu?: string) {
    const record = await DieuPhoiMau.findByPk(id);
    if (!record) {
      throw AppError.notFound('Không tìm thấy thông tin chuyến xe điều phối.');
    }

    record.trangThaiVanChuyen = trangThai;
    if (trangThai === 'DaNhan') {
      record.thoiGianNhanThucTe = new Date();
    }
    if (ghiChu) {
      record.ghiChu = `${record.ghiChu ? record.ghiChu + ' | ' : ''}${ghiChu.trim()}`.slice(0, 500);
    }
    await record.save();
    return record;
  }

  /**
   * 3. Tổng hợp số lượng tồn kho theo 8 nhóm máu (Summary)
   */
  async layTongHopTonKho() {
    const bloodGroups = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
    const inventories = await KhoMau.findAll();

    return bloodGroups.map((group) => {
      const itemsOfGroup = inventories.filter((i) => i.nhomMau === group);
      const totalMl = itemsOfGroup.reduce((sum, i) => sum + i.soLuongConLaiMl, 0);
      const totalSafeMl = itemsOfGroup.reduce((sum, i) => sum + i.nguongCanhBaoMl, 0) || (group.endsWith('-') ? 1000 : 1500);
      
      const soLuongTui = Math.round(totalMl / 350);
      const nguongAnToan = Math.round(totalSafeMl / 350) || 10;
      const phanTram = Math.min(100, Math.round((totalMl / totalSafeMl) * 100));
      
      const isCritical = totalMl < totalSafeMl * 0.5;
      const isWarning = !isCritical && totalMl < totalSafeMl;

      return {
        nhomMau: group,
        bloodGroup: group,
        soLuongTui,
        unitsAvailable: soLuongTui,
        soLuongMl: totalMl,
        nguongAnToan,
        safeThreshold: nguongAnToan,
        phanTram,
        mucDo: isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'SAFE',
        status: isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'SAFE',
        tuiSapHetHan: itemsOfGroup.filter((i) => {
          const diffDays = Math.ceil((new Date(i.ngayCapNhat).getTime() - Date.now()) / (1000 * 3600 * 24));
          return diffDays <= 5;
        }).length,
      };
    });
  }

  /**
   * 4. Thêm mới túi máu / mặt hàng vào kho máu (Admin)
   */
  async themMoiTonKho(data: {
    nhomMau: string;
    thanhPhan?: 'ToanPhan' | 'HongCau' | 'TieuCau' | 'HuyetTuong';
    soLuongConLaiMl: number;
    nguongCanhBaoMl?: number;
    donViLuuTru: string;
  }) {
    const { nhomMau, thanhPhan = 'ToanPhan', soLuongConLaiMl, nguongCanhBaoMl = 500, donViLuuTru } = data;

    if (!nhomMau || !donViLuuTru || soLuongConLaiMl === undefined) {
      throw AppError.badRequest('Vui lòng cung cấp nhóm máu, đơn vị lưu trữ và thể tích túi máu.');
    }

    const cleanNhomMau = nhomMau.trim().replace(/\s+/g, '+').toUpperCase();
    if (!['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(cleanNhomMau)) {
      throw AppError.badRequest('Nhóm máu không hợp lệ (A+, A-, B+, B-, AB+, AB-, O+, O-).');
    }

    if (soLuongConLaiMl < 0) {
      throw AppError.badRequest('Thể tích máu không được nhỏ hơn 0.');
    }

    // Kiểm tra xem đã tồn tại bộ (nhomMau, thanhPhan, donViLuuTru) chưa theo ràng buộc UNIQUE
    let item = await KhoMau.findOne({
      where: {
        nhomMau: cleanNhomMau,
        thanhPhan,
        donViLuuTru: donViLuuTru.trim(),
      },
    });

    if (item) {
      item.soLuongConLaiMl += Number(soLuongConLaiMl);
      if (nguongCanhBaoMl !== undefined) item.nguongCanhBaoMl = Number(nguongCanhBaoMl);
      await item.save();
      return item;
    }

    return KhoMau.create({
      nhomMau: cleanNhomMau,
      thanhPhan,
      soLuongConLaiMl: Number(soLuongConLaiMl),
      nguongCanhBaoMl: Number(nguongCanhBaoMl),
      donViLuuTru: donViLuuTru.trim(),
    });
  }

  /**
   * 5. Chỉnh sửa thông tin túi máu / thể tích trong kho (Admin)
   */
  async capNhatTonKho(id: number, data: {
    soLuongConLaiMl?: number;
    nguongCanhBaoMl?: number;
    donViLuuTru?: string;
    thanhPhan?: 'ToanPhan' | 'HongCau' | 'TieuCau' | 'HuyetTuong';
  }) {
    const item = await KhoMau.findByPk(id);
    if (!item) {
      throw AppError.notFound('Không tìm thấy túi máu / mặt hàng trong kho.');
    }

    if (data.soLuongConLaiMl !== undefined) {
      if (data.soLuongConLaiMl < 0) {
        throw AppError.badRequest('Thể tích máu không được nhỏ hơn 0.');
      }
      item.soLuongConLaiMl = Number(data.soLuongConLaiMl);
    }

    if (data.nguongCanhBaoMl !== undefined) {
      item.nguongCanhBaoMl = Number(data.nguongCanhBaoMl);
    }

    if (data.donViLuuTru) {
      item.donViLuuTru = data.donViLuuTru.trim();
    }

    if (data.thanhPhan) {
      item.thanhPhan = data.thanhPhan;
    }

    await item.save();
    return item;
  }

  /**
   * 6. Xuất hủy / Xóa lô túi máu khỏi kho (Admin)
   */
  async xoaTonKho(id: number) {
    const item = await KhoMau.findByPk(id);
    if (!item) {
      throw AppError.notFound('Không tìm thấy túi máu / mặt hàng trong kho.');
    }

    await item.destroy();
    return { id, message: 'Đã xuất hủy / xóa lô túi máu khỏi kho thành công.' };
  }

  /**
   * 7. Tắt thẻ / Hủy yêu cầu cấp cứu (Bác sĩ & Admin)
   */
  async tatYeuCauKhanCap(id: number, lyDo?: string) {
    const yeuCau = await YeuCauMauKhanCap.findByPk(id);
    if (!yeuCau) {
      throw AppError.notFound('Không tìm thấy yêu cầu máu cấp cứu.');
    }

    yeuCau.trangThai = 'DaHuy';
    const note = lyDo ? ` [ĐÃ TẮT THẺ: ${lyDo.trim()}]` : ' [ĐÃ TẮT THẺ BỞI BÁC SĨ/ADMIN]';
    if (!yeuCau.lyDo.includes('[ĐÃ TẮT THẺ')) {
      yeuCau.lyDo = `${yeuCau.lyDo}${note}`.slice(0, 500);
    }

    await yeuCau.save();
    return yeuCau;
  }

  /**
   * 8. Khôi phục / Mở lại thẻ cấp cứu (Bác sĩ & Admin)
   */
  async khoiPhucYeuCauKhanCap(id: number) {
    const yeuCau = await YeuCauMauKhanCap.findByPk(id);
    if (!yeuCau) {
      throw AppError.notFound('Không tìm thấy yêu cầu máu cấp cứu.');
    }

    yeuCau.trangThai = 'DangCho';
    yeuCau.lyDo = yeuCau.lyDo.replace(/\s*\[ĐÃ TẮT THẺ[^\]]*\]/g, '').trim();
    await yeuCau.save();
    return yeuCau;
  }

  /**
   * 9. Xóa yêu cầu cấp cứu (Admin)
   */
  async xoaYeuCauKhanCap(id: number) {
    const yeuCau = await YeuCauMauKhanCap.findByPk(id);
    if (!yeuCau) {
      throw AppError.notFound('Không tìm thấy yêu cầu máu cấp cứu.');
    }

    await yeuCau.destroy();
    return { id, message: 'Đã xóa yêu cầu cấp cứu thành công.' };
  }

  /**
   * 10. Lấy danh sách ca cấp cứu công khai đang chờ (Dành cho Trang chủ & Trang cấp cứu)
   */
  async layDanhSachYeuCauKhanCapCongKhai() {
    return YeuCauMauKhanCap.findAll({
      where: {
        trangThai: { [Op.in]: ['DangCho', 'DangDieuPhoi', 'DaHuy', 'DaDapUng'] },
      },
      include: [
        {
          model: NguoiDung,
          as: 'nguoiDaiDien',
          attributes: ['id', 'hoTen', 'soDienThoai'],
        },
      ],
      order: [
        ['mucDoKhanCap', 'DESC'],
        ['ngayCapNhat', 'DESC'],
      ],
    });
  }
}

export const emergencyService = new EmergencyService();
