import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Cấu hình Socket.io cho cảnh báo thời gian thực (Real-time Blood Alerts)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// =======================================================================
// KHUNG API CHUẨN ĐỂ GHÉP NỐI VỚI FRONTEND (NHÓM 2 NGƯỜI)
// =======================================================================

// 1. Kiểm tra trạng thái máy chủ
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SmartBlood API Server đang hoạt động bình thường' });
});

// 2. Lấy dữ liệu tình trạng kho máu 8 nhóm
app.get('/api/inventory', async (req, res) => {
  // TODO (Bạn làm backend): Truy vấn từ bảng BloodInventories trong SQL Server
  res.json({ message: 'Kết nối SQL Server bảng BloodInventories' });
});

// 3. Lấy danh sách các ca cấp cứu máu khẩn cấp
app.get('/api/urgent-requests', async (req, res) => {
  // TODO (Bạn làm backend): Truy vấn bảng UrgentRequests kết hợp Hospitals
  res.json({ message: 'Danh sách UrgentRequests' });
});

// 4. Lấy số liệu thống kê hệ thống
app.get('/api/stats', async (req, res) => {
  // TODO (Bạn làm backend): Đếm COUNT(*) từ Donors, Hospitals, DonationHistories
  res.json({ message: 'Thống kê tổng hợp' });
});

// 5. Nhân viên y tế quét mã QR kiểm tra người hiến (Bối cảnh 2)
app.post('/api/donors/verify-qr', async (req, res) => {
  const { qrToken } = req.body;
  // TODO (Bạn làm backend): Tìm Donor theo QrCodeToken -> Trả về số lần đã hiến & lịch sử
  res.json({ qrToken, message: 'Xác thực mã QR thành công' });
});

// 6. Nhập đơn vị máu sau khi hiến (Bối cảnh 3)
app.post('/api/donations/record', async (req, res) => {
  const { donorId, bloodType, volumeMl, staffNote } = req.body;
  // TODO (Bạn làm backend): 
  // 1. Insert bảng DonationHistories
  // 2. Update TotalDonations + 1 trong bảng Donors
  // 3. Update UnitsInStock trong bảng BloodInventories
  res.json({ success: true, message: 'Đã lưu đơn vị máu hiến thành công' });
});

// 7. Đăng ký tham gia hiến máu trực tuyến
app.post('/api/donations/register', async (req, res) => {
  const registrationData = req.body;
  // TODO (Bạn làm backend): Lưu vào Users & Donors -> Sinh QrCodeToken
  res.json({ success: true, message: 'Đăng ký thành công', qrToken: 'QR-' + Date.now() });
});

// =======================================================================
// XỬ LÝ SOCKET.IO CHO CẢNH BÁO KHẨN CẤP THỜI GIAN THỰC (BỐI CẢNH 5)
// =======================================================================
io.on('connection', (socket) => {
  console.log(`[Socket.io] Thiết bị kết nối mới: ${socket.id}`);

  // Lắng nghe khi bệnh viện phát lệnh cấp cứu máu khẩn cấp
  socket.on('emergency_blood_alert', (alertData) => {
    console.log('[Socket.io] Phát cảnh báo khẩn cấp:', alertData);
    // Phát quảng bá tới tất cả người hiến máu (đặc biệt nhóm hiếm)
    io.emit('new_urgent_request', alertData);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Thiết bị ngắt kết nối: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 SmartBlood Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`📡 Socket.io sẵn sàng phát tín hiệu thời gian thực`);
  console.log(`=================================================`);
});
