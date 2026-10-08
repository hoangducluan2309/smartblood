import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';

const inventoryRouter: Router = Router();
const emergencyRouter: Router = Router();

// ==============================================================================
// 1. TỒN KHO MÁU (/api/v1/blood-inventories)
// ==============================================================================
inventoryRouter.get(
  '/',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => emergencyController.getInventories(req, res, next)
);

// ==============================================================================
// 2. YÊU CẦU MÁU KHẨN CẤP (/api/v1/emergency-requests)
// ==============================================================================

// Bệnh viện tạo yêu cầu máu (Hospital Staff / Admin)
emergencyRouter.post(
  '/',
  xacThucToken,
  phanQuyen('HOSPITAL_STAFF', 'ADMIN'),
  (req, res, next) => emergencyController.createRequest(req, res, next)
);

// Quản trị viên điều phối xuất kho chi viện máu (Admin)
emergencyRouter.post(
  '/:id/dispatch',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => emergencyController.dispatchRequest(req, res, next)
);

export { inventoryRouter as bloodInventoryRoutes, emergencyRouter as emergencyRequestRoutes };
