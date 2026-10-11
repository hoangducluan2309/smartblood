import type { Request, Response, NextFunction } from 'express';
import { donationService } from '../services/donation.service.js';
import { AppError } from '../utils/AppError.js';

export class DonationController {
  /**
   * GET /api/v1/donation-events
   * Public / Donor: Lấy danh sách các sự kiện hiến máu (Tìm kiếm, Lọc, Phân trang)
   */
  async getEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await donationService.layDanhSachSuKien(req.query);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách sự kiện hiến máu thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/donation-appointments
   * Donor / Hospital Staff / Admin: Lấy danh sách lịch hẹn (Phân trang, lọc)
   */
  async getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      const result = await donationService.layDanhSachLichHen(req.query, req.user);
      res.status(200).json({
        success: true,
        message: 'Lấy danh sách lịch hẹn hiến máu thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/donation-events
   * Chỉ ADMIN: Tạo sự kiện hiến máu mới
   */
  async createEvent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      const event = await donationService.taoSuKien(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Tạo sự kiện hiến máu thành công.',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/donation-appointments
   * Donor: Đặt lịch hẹn hiến máu
   */
  async createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }
      const appointment = await donationService.datLichHen(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: 'Đăng ký lịch hẹn hiến máu thành công.',
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/donation-appointments/:id/status
   * Hospital Staff / Admin: Cập nhật kết quả hiến máu
   */
  async updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lichHenId = parseInt(req.params.id as string, 10);
      if (isNaN(lichHenId)) {
        throw AppError.badRequest('ID lịch hẹn không hợp lệ.');
      }

      const result = await donationService.capNhatKetQuaLichHen(lichHenId, req.body);
      res.status(200).json({
        success: true,
        message: 'Cập nhật kết quả lịch hẹn và tồn kho thành công.',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const donationController = new DonationController();
