import type { Request, Response, NextFunction } from 'express';
import { forecastService } from '../services/forecast.service.js';

export class ForecastController {
  /**
   * GET /api/v1/forecasts/shortage-risk
   * Admin & Hospital Staff: Báo cáo phân tích nguy cơ thiếu hụt máu
   */
  async getShortageRisk(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const report = await forecastService.tinhToanNguyCoThieuHut();
      res.status(200).json({
        success: true,
        message: 'Phân tích và dự báo nguy cơ thiếu hụt máu thành công.',
        data: report,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/forecasts/urgent-donors
   * Admin & Hospital Staff: Danh sách tình nguyện viên sẵn sàng hiến máu khẩn cấp
   * Query params: ?nhomMau=A+ (hoặc mặc định O+)
   */
  async getUrgentDonors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let nhomMau = (req.query.nhomMau || req.query.bloodType) as string | undefined;
      if (nhomMau) {
        nhomMau = nhomMau.trim().replace(/\s+/g, '+');
      }
      const result = await forecastService.timKiemNguoiHienMauKhanCap(nhomMau);
      res.status(200).json({
        success: true,
        message: `Tìm thấy ${result.tongSoLuongKhaDung} tình nguyện viên đủ điều kiện hiến máu cho nhóm ${result.nhomMauCanTim}.`,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const forecastController = new ForecastController();
