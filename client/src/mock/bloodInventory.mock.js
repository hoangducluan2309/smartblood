/**
 * Mock data: Tình trạng kho máu dự trữ theo nhóm máu (8 nhóm)
 * Đạt chuẩn: A+, A-, B+, B-, AB+, AB-, O+, O-
 * Bao gồm các nhóm máu hiếm (Rh- chiếm < 0.1% dân số Việt Nam)
 */
export const MOCK_BLOOD_INVENTORY = [
  {
    id: 1,
    bloodType: 'O+',
    group: 'O',
    rh: '+',
    unitsInStock: 420,
    safeThreshold: 500,
    capacity: 600,
    percentage: 70,
    status: 'WARNING', // SAFE | WARNING | CRITICAL
    isRare: false,
    description: 'Nhóm máu phổ biến nhất, dùng truyền cấp cứu khi chưa rõ nhóm máu Rh+'
  },
  {
    id: 2,
    bloodType: 'O-',
    group: 'O',
    rh: '-',
    unitsInStock: 8,
    safeThreshold: 40,
    capacity: 100,
    percentage: 12,
    status: 'CRITICAL',
    isRare: true,
    description: 'Nhóm máu hiếm cực kỳ quý giá, có thể truyền cho mọi người trong trường hợp tối khẩn'
  },
  {
    id: 3,
    bloodType: 'A+',
    group: 'A',
    rh: '+',
    unitsInStock: 310,
    safeThreshold: 350,
    capacity: 500,
    percentage: 62,
    status: 'WARNING',
    isRare: false,
    description: 'Nhóm máu A dương tính, nhu cầu cao cho các phẫu thuật tim mạch và chấn thương'
  },
  {
    id: 4,
    bloodType: 'A-',
    group: 'A',
    rh: '-',
    unitsInStock: 5,
    safeThreshold: 30,
    capacity: 80,
    percentage: 8,
    status: 'CRITICAL',
    isRare: true,
    description: 'Nhóm máu hiếm A âm tính, hiện kho dự trữ đang ở mức báo động đỏ'
  },
  {
    id: 5,
    bloodType: 'B+',
    group: 'B',
    rh: '+',
    unitsInStock: 390,
    safeThreshold: 400,
    capacity: 500,
    percentage: 78,
    status: 'SAFE',
    isRare: false,
    description: 'Nhóm máu B dương tính, lượng tồn kho tạm thời ổn định'
  },
  {
    id: 6,
    bloodType: 'B-',
    group: 'B',
    rh: '-',
    unitsInStock: 12,
    safeThreshold: 30,
    capacity: 80,
    percentage: 20,
    status: 'CRITICAL',
    isRare: true,
    description: 'Nhóm máu hiếm B âm tính, cần người tình nguyện hiến nhắc lại'
  },
  {
    id: 7,
    bloodType: 'AB+',
    group: 'AB',
    rh: '+',
    unitsInStock: 180,
    safeThreshold: 150,
    capacity: 250,
    percentage: 72,
    status: 'SAFE',
    isRare: false,
    description: 'Người mang nhóm máu AB+ có thể nhận máu từ mọi nhóm máu khác'
  },
  {
    id: 8,
    bloodType: 'AB-',
    group: 'AB',
    rh: '-',
    unitsInStock: 3,
    safeThreshold: 20,
    capacity: 50,
    percentage: 6,
    status: 'CRITICAL',
    isRare: true,
    description: 'Nhóm máu hiếm nhất tại Việt Nam (dưới 0.05% dân số), cần dự trữ khẩn cấp'
  }
];
