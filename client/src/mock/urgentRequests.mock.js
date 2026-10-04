/**
 * Mock data: Các yêu cầu cấp cứu và xin máu khẩn cấp từ bệnh viện thời gian thực
 */
export const MOCK_URGENT_REQUESTS = [
  {
    id: 'REQ-001',
    hospitalName: 'Bệnh viện Huyết học - Truyền máu TW',
    address: 'Phố Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    bloodType: 'AB-',
    requiredUnits: 3,
    fulfilledUnits: 1,
    urgencyLevel: 'CRITICAL', // CRITICAL | HIGH | MEDIUM
    patientCondition: 'Bệnh nhân tai nạn giao thông xuất huyết nội tạng nặng, cần phẫu thuật gấp',
    timeRemaining: '2 giờ 15 phút',
    createdAt: '15 phút trước',
    distanceKm: 2.8,
    contactHotline: '024.3782.1898',
    isRareBlood: true
  },
  {
    id: 'REQ-002',
    hospitalName: 'Bệnh viện Chợ Rẫy TP.HCM',
    address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM',
    bloodType: 'O-',
    requiredUnits: 5,
    fulfilledUnits: 2,
    urgencyLevel: 'CRITICAL',
    patientCondition: 'Sản phụ băng huyết sau sinh, thuộc nhóm máu hiếm O Rh-',
    timeRemaining: '3 giờ 40 phút',
    createdAt: '30 phút trước',
    distanceKm: 4.5,
    contactHotline: '028.3855.4137',
    isRareBlood: true
  },
  {
    id: 'REQ-003',
    hospitalName: 'Bệnh viện Bạch Mai',
    address: '78 Giải Phóng, Đống Đa, Hà Nội',
    bloodType: 'A-',
    requiredUnits: 4,
    fulfilledUnits: 2,
    urgencyLevel: 'HIGH',
    patientCondition: 'Ca ghép tế bào gốc cho bệnh nhi suy tủy, cần tiểu cầu nhóm A-',
    timeRemaining: '5 giờ',
    createdAt: '1 giờ trước',
    distanceKm: 6.2,
    contactHotline: '024.3869.3731',
    isRareBlood: true
  },
  {
    id: 'REQ-004',
    hospitalName: 'Bệnh viện Đa khoa Đà Nẵng',
    address: '124 Hải Phòng, Thạch Thang, Hải Châu, Đà Nẵng',
    bloodType: 'B-',
    requiredUnits: 2,
    fulfilledUnits: 0,
    urgencyLevel: 'CRITICAL',
    patientCondition: 'Bệnh nhân chấn thương sọ não vỡ lách cấp cứu',
    timeRemaining: '1 giờ 45 phút',
    createdAt: '20 phút trước',
    distanceKm: 3.1,
    contactHotline: '0236.3821.118',
    isRareBlood: true
  }
];
