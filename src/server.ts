import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { authenticateDatabase, sequelize } from './config/database.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import { AppError } from './utils/AppError.js';

import { authRoutes } from './routes/auth.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { donationEventRoutes, donationAppointmentRoutes } from './routes/donation.routes.js';
import { bloodInventoryRoutes, emergencyRequestRoutes } from './routes/emergency.routes.js';
import { forecastRoutes } from './routes/forecast.routes.js';
import { setupSwagger } from './config/swagger.config.js';
import './models/index.js'; // Kích hoạt nạp quan hệ Model

// Tải biến môi trường
dotenv.config();

const app: Express = express();
const PORT = parseInt(process.env.PORT || '5000', 10);
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// ==============================================================================
// 1. THIẾT LẬP MIDDLEWARE THEO THỨ TỰ CHUẨN
// ==============================================================================

// (1) Bảo mật HTTP Headers (Tắt CSP mặc định để Swagger UI load asset mượt mà)
app.use(helmet({ contentSecurityPolicy: false }));

// (2) Cấu hình CORS
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// (3) Parser Body dữ liệu (JSON & URL-Encoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// (4) Ghi log request và che giấu thông tin nhạy cảm
app.use(loggerMiddleware);

// (5) Swagger UI Documentation (Khả dụng tại: /api-docs)
setupSwagger(app);

// ==============================================================================
// 2. ROUTES / ENDPOINTS CỦA ỨNG DỤNG
// ==============================================================================

// Health Check Endpoint (Phản hồi định dạng chuẩn: { success: true, message, data })
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Hệ thống Backend đang hoạt động ổn định.',
    data: {
      service: 'Blood Donation Coordination & Emergency Prediction API',
      status: 'UP',
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication & User Management Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);

// Donation Events & Appointments Routes
app.use('/api/v1/donation-events', donationEventRoutes);
app.use('/api/v1/donation-appointments', donationAppointmentRoutes);

// Blood Inventories & Emergency Dispatch Routes
app.use('/api/v1/blood-inventories', bloodInventoryRoutes);
app.use('/api/v1/emergency-requests', emergencyRequestRoutes);

// Forecast & Early Warning Routes
app.use('/api/v1/forecasts', forecastRoutes);

// ==============================================================================
// 3. XỬ LÝ 404 NOT FOUND & ERROR HANDLING MIDDLEWARE
// ==============================================================================

// (5) Middleware bắt tất cả route không tồn tại (404)
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(AppError.notFound(`Không tìm thấy tài nguyên: [${req.method}] ${req.originalUrl}`));
});

// (6) Middleware xử lý lỗi tập trung (Bắt buộc đặt ở cuối cùng)
app.use(errorMiddleware);

// ==============================================================================
// 4. HÀM KHỞI ĐỘNG SERVER
// ==============================================================================
async function startServer(): Promise<void> {
  try {
    // Kết nối CSDL SQL Server trước khi mở cổng nhận request
    await authenticateDatabase();

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
      console.log(`🏥 Endpoint kiểm tra: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    // Graceful Shutdown: Đóng kết nối an toàn khi server dừng
    const handleShutdown = async (signal: string) => {
      console.log(`\n[Server]: Nhận tín hiệu ${signal}. Đang đóng kết nối...`);
      server.close(async () => {
        await sequelize.close();
        console.log('[Server]: Đã đóng kết nối CSDL và HTTP Server an toàn.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error('[Server Error]: Khởi động thất bại do lỗi kết nối CSDL!');
    process.exit(1);
  }
}

// Bắt đầu khởi động
startServer();

export default app;
