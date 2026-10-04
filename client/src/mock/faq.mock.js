/**
 * Mock data: Điều kiện hiến máu & Câu hỏi thường gặp (FAQ)
 * Theo thông tư quy định của Bộ Y Tế Việt Nam
 */
export const MOCK_ELIGIBILITY_CRITERIA = [
  {
    id: 'crit-1',
    title: 'Độ tuổi quy định',
    requirement: 'Từ 18 đến 60 tuổi',
    detail: 'Người có đầy đủ năng lực hành vi dân sự và sức khỏe bình thường.',
    iconName: 'UserCheck'
  },
  {
    id: 'crit-2',
    title: 'Cân nặng tiêu chuẩn',
    requirement: 'Nam ≥ 45kg, Nữ ≥ 42kg',
    detail: 'Hiến từ 350ml hoặc 450ml cần cân nặng tối thiểu từ 50kg trở lên.',
    iconName: 'Scale'
  },
  {
    id: 'crit-3',
    title: 'Khoảng cách giữa 2 lần hiến',
    requirement: 'Tối thiểu 12 tuần (84 ngày)',
    detail: 'Khoảng cách đối với hiến toàn phần là 84 ngày; hiến gạn tiểu cầu là 3 tuần.',
    iconName: 'Calendar'
  },
  {
    id: 'crit-4',
    title: 'Chỉ số sức khỏe cơ bản',
    requirement: 'Huyết áp ổn định, không sốt',
    detail: 'Hemoglobin ≥ 120g/l. Không mắc các bệnh truyền nhiễm (HIV, Viêm gan B, C, Giang mai).',
    iconName: 'HeartPulse'
  }
];

export const MOCK_FAQS = [
  {
    id: 'faq-1',
    question: 'Hiến máu có ảnh hưởng xấu đến sức khỏe hoặc tăng cân không?',
    answer: 'Hiến máu không gây hại cho sức khỏe. Lượng máu hiến (250-450ml) chỉ chiếm khoảng 1/10 tổng lượng máu cơ thể và tủy xương sẽ tái tạo bù lại hoàn toàn sau vài tuần. Tăng cân sau hiến máu chỉ xảy ra nếu người hiến bồi dưỡng quá mức và ăn uống không kiểm soát.'
  },
  {
    id: 'faq-2',
    question: 'Mã QR trên ứng dụng SmartBlood dùng để làm gì?',
    answer: 'Mã QR cá nhân chứa thông tin định danh y tế điện tử an toàn. Khi đến điểm hiến máu, nhân viên y tế chỉ cần quét mã QR để tra cứu tức thì lịch sử hiến máu, nhóm máu, khoảng cách ngày hiến hợp lệ mà không cần kê khai giấy tờ thủ công.'
  },
  {
    id: 'faq-3',
    question: 'Khi bệnh viện phát tín hiệu thiếu máu khẩn cấp, tôi sẽ nhận thông báo như thế nào?',
    answer: 'Hệ thống SmartBlood kết hợp định vị GPS (Redis GEO) và Socket.io để quét tìm những người hiến máu có nhóm máu tương thích (đặc biệt là nhóm máu hiếm Rh-) đang ở bán kính gần bệnh viện nhất và gửi thông báo khẩn qua chuông cảnh báo trên màn hình hoặc tin nhắn.'
  },
  {
    id: 'faq-4',
    question: 'Tôi có nhóm máu hiếm (Rh-), tôi cần làm gì để tham gia mạng lưới dự phòng khẩn cấp?',
    answer: 'Tại Việt Nam, nhóm máu Rh- chỉ chiếm dưới 0.1% dân số. Khi đăng ký trên SmartBlood và tích chọn "Sẵn sàng hỗ trợ khẩn cấp", thông tin của bạn sẽ được đưa vào danh sách phản ứng nhanh để điều phối trực tiếp cứu người khi có ca cấp cứu hiểm nghèo.'
  },
  {
    id: 'faq-5',
    question: 'Sau khi hiến máu, quyền lợi và chế độ bồi hoàn máu như thế nào?',
    answer: 'Người hiến máu được cấp Giấy chứng nhận hiến máu tình nguyện điện tử có mã tra cứu. Giấy chứng nhận có giá trị bồi hoàn lượng máu đã hiến miễn phí tại tất cả các bệnh viện công lập trên toàn quốc khi bản thân cần truyền máu.'
  }
];
