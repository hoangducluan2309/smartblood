import type { Request, Response, NextFunction } from 'express';
import { emergencyService } from '../services/emergency.service.js';
import { AppError } from '../utils/AppError.js';

export class EmergencyController {
  /**
   * GET /api/v1/blood-inventories
   * Admin & Hospital Staff: Xem tồn kho máu theo FEFO (Tìm kiếm, Lọc, Phân trang)
   */
  async getInventories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventories = await emergencyService.layTonKhoMauFEFO(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy dữ liệu tồn kho máu thành công (sắp xếp FEFO).',
        data: inventories,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/blood-inventories/summary
   * Tổng hợp trữ lượng 8 nhóm máu
   */
  async getInventorySummary(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summary = await emergencyService.layTongHopTonKho();
      res.status(200).json({
        success: true,
        message: 'Lấy dữ liệu tổng hợp tồn kho máu thành công.',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/blood-inventories
   * Admin: Thêm mới hoặc cộng thêm túi máu vào kho
   */
  async createInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emergencyService.themMoiTonKho(req.body);
      res.status(201).json({
        success: true,
        message: 'Thêm túi máu vào kho thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/blood-inventories/:id
   * Admin: Cập nhật thể tích hoặc thông tin lưu trữ túi máu
   */
  async updateInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID túi máu không hợp lệ.');
      const result = await emergencyService.capNhatTonKho(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật thông tin túi máu thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/blood-inventories/:id
   * Admin: Xóa hoặc xuất hủy túi máu khỏi kho
   */
  async deleteInventory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) throw AppError.badRequest('ID túi máu không hợp lệ.');
      const result = await emergencyService.xoaTonKho(id);
      res.status(200).json({
        success: true,
        message: 'Xuất hủy / xóa túi máu thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/emergency-requests
   * Admin & Hospital Staff: Xem danh sách yêu cầu máu khẩn cấp (Tìm kiếm, Lọc, Phân trang)
   */
  async getRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await emergencyService.layDanhSachYeuCauKhanCap(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách yêu cầu máu khẩn cấp thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/emergency-requests
   * Hospital Staff: Tạo yêu cầu máu khẩn cấp
   */
  async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const newRequest = await emergencyService.taoYeuCauKhanCap(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo yêu cầu máu khẩn cấp thành công.',
        data: newRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/emergency-requests/:id/dispatch
   * Admin: Điều phối xuất kho chi viện máu
   */
  async dispatchRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const yeuCauId = parseInt(req.params.id as string, 10);
      if (isNaN(yeuCauId)) {
        throw AppError.badRequest('ID yêu cầu không hợp lệ.');
      }

      const result = await emergencyService.dieuPhoiXuatKho(yeuCauId, req.user.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Điều phối xuất kho và tạo lệnh vận chuyển thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const emergencyController = new EmergencyController();
