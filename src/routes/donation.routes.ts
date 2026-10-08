import { Router } from 'express';
import { donationController } from '../controllers/donation.controller.js';
import { xacThucToken, phanQuyen } from '../middlewares/auth.middleware.js';

const eventRouter: Router = Router();
const appointmentRouter: Router = Router();

// ==============================================================================
// 1. SỰ KIỆN HIẾN MÁU (/api/v1/donation-events)
// ==============================================================================

// Xem danh sách sự kiện (Public / Tình nguyện viên)
eventRouter.get('/', (req, res, next) => donationController.getEvents(req, res, next));

// Tạo sự kiện mới (Chỉ ADMIN)
eventRouter.post(
  '/',
  xacThucToken,
  phanQuyen('ADMIN'),
  (req, res, next) => donationController.createEvent(req, res, next)
);

// ==============================================================================
// 2. LỊCH HẸN HIẾN MÁU (/api/v1/donation-appointments)
// ==============================================================================

// Đặt lịch hẹn hiến máu (Người dùng / Donor)
appointmentRouter.post(
  '/',
  xacThucToken,
  phanQuyen('DONOR', 'ADMIN'),
  (req, res, next) => donationController.createAppointment(req, res, next)
);

// Cập nhật kết quả hiến máu & cộng kho máu (Hospital Staff / Admin)
appointmentRouter.put(
  '/:id/status',
  xacThucToken,
  phanQuyen('HOSPITAL_STAFF', 'ADMIN'),
  (req, res, next) => donationController.updateAppointmentStatus(req, res, next)
);

export { eventRouter as donationEventRoutes, appointmentRouter as donationAppointmentRoutes };
