import type { Request, Response, NextFunction } from 'express';
import { emergencyService } from '../services/emergency.service.js';
import { AppError } from '../utils/AppError.js';

export class EmergencyController {
  /**
   * GET /api/v1/blood-inventories
   * Admin & Hospital Staff: Xem tồn kho máu theo FEFO
   */
  async getInventories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const inventories = await emergencyService.layTonKhoMauFEFO();
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
