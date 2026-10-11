import { Router } from 'express';
import { emergencyController } from '../controllers/emergency.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';
import { validateBody, Validators } from '../middlewares/validate.middleware.js';

const inventoryRouter: Router = Router();
const emergencyRouter: Router = Router();

// ==============================================================================
// 1. TỒN KHO MÁU (/api/v1/blood-inventories)
// ==============================================================================
// Tổng hợp 8 nhóm máu (Summary)
inventoryRouter.get(
  '/summary',
  (req, res, next) => emergencyController.getInventorySummary(req, res, next)
);

// Xem tồn kho máu (FEFO, Phân trang, Tìm kiếm, Lọc)
inventoryRouter.get(
  '/',
  xacThucToken,
  phanQuyen('ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => emergencyController.getInventories(req, res, next)
);

// Thêm mới túi máu vào kho (Admin)
inventoryRouter.post(
  '/',
  xacThucToken,
  phanQuyen('ADMIN'),
  validateBody([
    Validators.required('nhomMau', 'Nhóm máu'),
    Validators.required('donViLuuTru', 'Đơn vị lưu trữ'),
    Validators.required('soLuongConLaiMl', 'Thể tích máu'),
  ]),
  (req, res, next) => emergencyController.createInventory(req, res, next)
);

// Cập nhật số lượng hoặc thông tin lưu trữ túi máu (Admin)
inventoryRouter.put(
  '/:id',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => emergencyController.updateInventory(req, res, next)
);

// Xuất hủy / Xóa túi máu khỏi kho (Admin)
inventoryRouter.delete(
  '/:id',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => emergencyController.deleteInventory(req, res, next)
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
