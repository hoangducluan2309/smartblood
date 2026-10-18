import { Router } from 'express';
import { donationController } from '../controllers/donation.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';

import { validateBody, Validators } from '../middlewares/validate.middleware.js';

const eventRouter: Router = Router();
const appointmentRouter: Router = Router();

// ==============================================================================
// 1. SỰ KIỆN HIẾN MÁU (/api/v1/donation-events)
// ==============================================================================

// Xem danh sách sự kiện (Public / Tình nguyện viên - Hỗ trợ Tìm kiếm, Lọc, Phân trang)
eventRouter.get('/', (req, res, next) => donationController.getEvents(req, res, next));

// Tạo sự kiện mới (Chỉ ADMIN - Có validation dữ liệu đầu vào)
eventRouter.post(
  '/',
  xacThucToken,
  phanQuyen('ADMIN'),
  validateBody([
    Validators.required('tenSuKien', 'Tên sự kiện'),
    Validators.required('diaDiem', 'Địa điểm'),
    Validators.required('thoiGianBatDau', 'Thời gian bắt đầu'),
    Validators.required('thoiGianKetThuc', 'Thời gian kết thúc'),
  ]),
  (req, res, next) => donationController.createEvent(req, res, next)
);

// Cập nhật sự kiện (Chỉ ADMIN)
eventRouter.put(
  '/:id',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => donationController.updateEvent(req, res, next)
);

// Cập nhật trạng thái sự kiện: Tắt / Mở lại (Chỉ ADMIN)
eventRouter.put(
  '/:id/status',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => donationController.updateEventStatus(req, res, next)
);

eventRouter.patch(
  '/:id/status',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => donationController.updateEventStatus(req, res, next)
);

// Xóa sự kiện (Chỉ ADMIN)
eventRouter.delete(
  '/:id',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => donationController.deleteEvent(req, res, next)
);

// ==============================================================================
// 2. LỊCH HẸN HIẾN MÁU (/api/v1/donation-appointments)
// ==============================================================================

// Xem lịch sử hiến máu của chính mình (DONOR)
appointmentRouter.get(
  '/my-history',
  xacThucToken,
  phanQuyen('DONOR'),
  (req, res, next) => donationController.getMyHistory(req, res, next)
);

// Lấy danh sách lịch hẹn (DONOR xem của mình; ADMIN/HOSPITAL_STAFF xem tất cả để duyệt)
appointmentRouter.get(
  '/',
  xacThucToken,
  phanQuyen('DONOR', 'ADMIN', 'HOSPITAL_STAFF'),
  (req, res, next) => donationController.getAppointments(req, res, next)
);

// Chỉ người hiến máu mới được đặt lịch cho tài khoản của mình
appointmentRouter.post(
  '/',
  xacThucToken,
  phanQuyen('DONOR'),
  validateBody([
    Validators.required('ngayHen', 'Ngày hẹn'),
    Validators.required('khungGio', 'Khung giờ'),
  ]),
  (req, res, next) => donationController.createAppointment(req, res, next)
);

// Cập nhật kết quả hiến máu & cộng kho máu (Hospital Staff / Admin)
appointmentRouter.put(
  '/:id/status',
  xacThucToken,
  phanQuyen('HOSPITAL_STAFF', 'ADMIN'),
  validateBody([
    Validators.required('trangThai', 'Trạng thái kết quả'),
  ]),
  (req, res, next) => donationController.updateAppointmentStatus(req, res, next)
);

// Hủy / Xóa lịch hẹn hiến máu (Donor / Staff / Admin)
appointmentRouter.delete(
  '/:id',
  xacThucToken,
  (req, res, next) => donationController.deleteAppointment(req, res, next)
);

export { eventRouter as donationEventRoutes, appointmentRouter as donationAppointmentRoutes };
