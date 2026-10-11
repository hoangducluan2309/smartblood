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

// ==============================================================================
// 2. LỊCH HẸN HIẾN MÁU (/api/v1/donation-appointments)
// ==============================================================================

// Lấy danh sách lịch hẹn (DONOR xem của mình; ADMIN/HOSPITAL_STAFF xem tất cả)
appointmentRouter.get(
  '/',
  xacThucToken,
  (req, res, next) => donationController.getAppointments(req, res, next)
);

// Đặt lịch hẹn hiến máu (Người dùng / Donor - Có validation dữ liệu đầu vào)
appointmentRouter.post(
  '/',
  xacThucToken,
  phanQuyen('DONOR', 'ADMIN'),
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

export { eventRouter as donationEventRoutes, appointmentRouter as donationAppointmentRoutes };
