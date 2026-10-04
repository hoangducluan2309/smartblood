/**
 * Mock data: Các đợt hiến máu nhân đạo đang và sắp diễn ra
 */
export const MOCK_DONATION_EVENTS = [
  {
    id: 'EVT-2026-01',
    title: 'Hành Trình Đỏ - Giọt Hồng Tri Ân 2026',
    hospitalName: 'Viện Huyết học - Truyền máu TW',
    address: 'Sảnh A, Trung tâm Hội nghị Quốc gia, Nam Từ Liêm, Hà Nội',
    date: 'Thứ Bảy, 10/10/2026',
    time: '07:30 - 16:30',
    targetUnits: 500,
    registeredCount: 382,
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&q=80',
    tags: ['Quy mô lớn', 'Hỗ trợ nhóm hiếm', 'Quà tặng lưu niệm']
  },
  {
    id: 'EVT-2026-02',
    title: 'Ngày Hội Hiến Máu Khối Đại Học & Cao Đẳng',
    hospitalName: 'Bệnh viện Chợ Rẫy TP.HCM',
    address: 'Nhà thi đấu ĐHQG, Phường Linh Trung, TP. Thủ Đức, TP.HCM',
    date: 'Chủ Nhật, 18/10/2026',
    time: '08:00 - 15:00',
    targetUnits: 300,
    registeredCount: 245,
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=600&q=80',
    tags: ['Sinh viên', 'Khám sức khỏe miễn phí']
  },
  {
    id: 'EVT-2026-03',
    title: 'Điểm Hiến Máu Cố Định Bệnh Viện Bạch Mai',
    hospitalName: 'Bệnh viện Bạch Mai',
    address: 'Tầng 1 Nhà H, 78 Giải Phóng, Đống Đa, Hà Nội',
    date: 'Mở cửa tất cả các ngày trong tuần',
    time: '08:00 - 17:00',
    targetUnits: 150,
    registeredCount: 112,
    status: 'ONGOING',
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
    tags: ['Cố định', 'Xét nghiệm chuyên sâu']
  }
];

/**
 * Mock data: Hồ sơ người hiến máu mẫu khi nhân viên y tế quét mã QR
 * Phục vụ nghiệp vụ: Quét mã QR -> xem lịch sử hiến bao nhiêu lần -> nhập đơn vị máu đã hiến
 */
export const MOCK_DONOR_PROFILE = {
  id: 'DNR-88992',
  fullName: 'Nguyễn Văn An',
  citizenId: '001201019876',
  dateOfBirth: '15/08/1998',
  gender: 'Nam',
  bloodType: 'O',
  rh: '-',
  isRare: true,
  phone: '0912 345 678',
  email: 'nguyenvanan.donor@gmail.com',
  address: 'Số 45 Hoàng Hoa Thám, Ba Đình, Hà Nội',
  totalDonations: 6, // Đã hiến 6 lần
  lastDonationDate: '10/05/2026',
  nextEligibleDate: '02/08/2026',
  isEligibleNow: true,
  history: [
    {
      id: 'HIS-01',
      date: '10/05/2026',
      hospital: 'Viện Huyết học - Truyền máu TW',
      volumeMl: 350,
      certificateCode: 'GCN-2026-059812',
      staff: 'BS. Lê Minh Tuấn'
    },
    {
      id: 'HIS-02',
      date: '12/01/2026',
      hospital: 'Bệnh viện Bạch Mai',
      volumeMl: 350,
      certificateCode: 'GCN-2026-012944',
      staff: 'ĐD. Trần Thị Hương'
    },
    {
      id: 'HIS-03',
      date: '15/09/2025',
      hospital: 'Bệnh viện Quân Y 108',
      volumeMl: 250,
      certificateCode: 'GCN-2025-983100',
      staff: 'BS. Phạm Hoàng Nam'
    }
  ]
};
