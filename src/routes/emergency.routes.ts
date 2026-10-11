import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';
import { validateBody, Validators } from '../middlewares/validate.middleware.js';

const inventoryRouter: Router = Router();
const emergencyRouter: Router = Router();

// ==============================================================================
// 1. TỒN KHO MÁU (/api/v1/blood-inventories)
// ==============================================================================
// Xem tồn kho máu (FEFO, Phân trang, Tìm kiếm, Lọc)
inventoryRouter.get(
  '/',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => emergencyController.getInventories(req, res, next)
);

// ==============================================================================
// 2. YÊU CẦU MÁU KHẨN CẤP (/api/v1/emergency-requests)
// ==============================================================================

// Xem danh sách yêu cầu máu khẩn cấp (Admin & Hospital Staff - Hỗ trợ Tìm kiếm, Lọc, Phân trang)
emergencyRouter.get(
  '/',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => emergencyController.getRequests(req, res, next)
);

// Bệnh viện tạo yêu cầu máu (Hospital Staff / Admin - Có validation dữ liệu đầu vào)
emergencyRouter.post(
  '/',
  xacThucToken,
  phanQuyen('HOSPITAL_STAFF', 'ADMIN'),
  validateBody([
    Validators.required('benhVienYeuCau', 'Tên bệnh viện'),
    Validators.required('nhomMauCan', 'Nhóm máu cần'),
    Validators.required('lyDo', 'Lý do yêu cầu'),
    Validators.required('hanChot', 'Hạn chót tiếp nhận'),
  ]),
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
