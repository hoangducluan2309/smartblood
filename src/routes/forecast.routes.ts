import { Router } from 'express';
import { forecastController } from '../controllers/forecast.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';

const router: Router = Router();

// 1. Phân tích & cảnh báo sớm nguy cơ thiếu hụt máu (Admin & Hospital Staff)
router.get(
  '/shortage-risk',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => forecastController.getShortageRisk(req, res, next)
);

// 2. Tìm kiếm tình nguyện viên khẩn cấp đủ điều kiện hiến máu (Admin & Hospital Staff)
router.get(
  '/urgent-donors',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => forecastController.getUrgentDonors(req, res, next)
);

export const forecastRoutes: Router = router;
