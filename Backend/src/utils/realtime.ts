import type { Server as HttpServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import type { AuthUserPayload } from '../dtos/auth.dto.js';

const APPOINTMENT_REVIEW_ROOM = 'appointment-reviewers';
let socketServer: Server | null = null;

export interface DonationAppointmentCreatedEvent {
  id: number;
  donorName: string;
  appointmentDate: string;
  timeSlot: string;
  createdAt: string;
}

export function configureRealtime(server: HttpServer): void {
  const allowedOrigin = process.env.CORS_ORIGIN || '*';
  socketServer = new Server(server, {
    cors: {
      origin: allowedOrigin === '*' ? true : allowedOrigin,
      credentials: true,
    },
  });

  socketServer.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (typeof token !== 'string' || !token) {
      socket.data.user = null;
      next();
      return;
    }

    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_hienmau_2026';
      const user = jwt.verify(token, secret) as AuthUserPayload;
      if (!user.id || !['ADMIN', 'HOSPITAL_STAFF', 'DONOR'].includes(user.vaiTro)) {
        next(new Error('Tài khoản Socket.IO không hợp lệ.'));
        return;
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error('Token Socket.IO không hợp lệ hoặc đã hết hạn.'));
    }
  });

  socketServer.on('connection', (socket) => {
    const user = socket.data.user as AuthUserPayload | null;
    if (user && ['ADMIN', 'HOSPITAL_STAFF'].includes(user.vaiTro)) {
      socket.join(APPOINTMENT_REVIEW_ROOM);
    }
    socket.on('join:emergency_channel', () => {
      socket.join('emergency_channel');
    });
    socket.on('EMERGENCY_ALERT', (alert: unknown) => {
      if (!user || !['ADMIN', 'HOSPITAL_STAFF'].includes(user.vaiTro)) return;
      socketServer?.to('emergency_channel').emit('EMERGENCY_ALERT', alert);
    });
  });
}

export function emitDonationAppointmentCreated(
  appointment: DonationAppointmentCreatedEvent
): void {
  if (!socketServer) {
    throw new Error('Socket.IO chưa được khởi tạo.');
  }

  socketServer.to(APPOINTMENT_REVIEW_ROOM).emit('donation-appointment:created', appointment);
}

export interface DonationAppointmentUpdatedEvent {
  id: number;
  nguoiHienId?: number;
  donorName?: string;
  trangThai: string;
  luongMauHienMl?: number;
  nhomMau?: string;
  updatedAt?: string;
}

export function emitDonationAppointmentUpdated(
  eventData: DonationAppointmentUpdatedEvent
): void {
  if (!socketServer) return;
  socketServer.to(APPOINTMENT_REVIEW_ROOM).emit('donation-appointment:updated', eventData);
  if (eventData.trangThai === 'HoanThanh') {
    socketServer.to(APPOINTMENT_REVIEW_ROOM).emit('donation-appointment:completed', eventData);
  }
}

