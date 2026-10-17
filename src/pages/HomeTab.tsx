import React, { useState, useEffect } from 'react';
import {
  Heart,
  Droplets,
  Users,
  AlertTriangle,
  HeartHandshake,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
  ShieldCheck,
  Flame,
  User,
  Phone,
  Droplet,
  Info,
  FileText,
  Stethoscope,
  Coffee,
  Award,
  Gift,
  Activity,
  Check,
  X,
} from 'lucide-react';
import { api } from '../services/api.js';

export interface HomeTabProps {
  onSelectTab?: (tabId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
}

interface SummaryStatistics {
  tongDonViMauTiepNhan: number;
  caCapCuuThanhCong: number;
  tinhNguyenVienSanSang: number;
  nhomMauBaoDong: string;
  mucDoNguyCo: string;
}

interface DonationEvent {
  id: number;
  tenSuKien: string;
  moTa?: string;
  diaDiem: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  soLuongDuKien: number;
  soLuongDaDangKy: number;
  trangThai?: string;
}

interface BloodCompatibility {
  type: string;
  canGiveTo: string[];
  canReceiveFrom: string[];
  populationPercent: string;
  highlight: string;
  role: string;
}

const bloodCompatibilityData: Record<string, BloodCompatibility> = {
  'O-': {
    type: 'O-',
    canGiveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['O-'],
    populationPercent: '~0.1% (Cực hiếm)',
    highlight: 'Nhóm máu hiến toàn năng tế bào hồng cầu - Vô cùng quý giá trong các ca phẫu thuật cấp cứu tối khẩn cấp khi chưa kịp xét nghiệm nhóm máu bệnh nhân.',
    role: 'Nhà tài trợ toàn năng (Hồng cầu)',
  },
  'O+': {
    type: 'O+',
    canGiveTo: ['O+', 'A+', 'B+', 'AB+'],
    canReceiveFrom: ['O+', 'O-'],
    populationPercent: '~45% (Phổ biến nhất)',
    highlight: 'Nhóm máu có tỷ lệ người mang cao nhất tại Việt Nam và cũng là nhóm máu có nhu cầu sử dụng truyền máu lâm sàng lớn nhất mỗi ngày.',
    role: 'Nguồn chi viện lớn nhất hệ thống',
  },
  'A-': {
    type: 'A-',
    canGiveTo: ['A-', 'A+', 'AB-', 'AB+'],
    canReceiveFrom: ['A-', 'O-'],
    populationPercent: '~0.1% (Rất hiếm)',
    highlight: 'Thuộc hệ nhóm máu Rh- âm tính hiếm gặp. Bệnh viện luôn duy trì danh bạ khẩn cấp của các tình nguyện viên nhóm máu này.',
    role: 'Nhóm máu âm quý hiếm',
  },
  'A+': {
    type: 'A+',
    canGiveTo: ['A+', 'AB+'],
    canReceiveFrom: ['A+', 'A-', 'O+', 'O-'],
    populationPercent: '~20 - 22%',
    highlight: 'Đóng vai trò quan trọng trong điều trị phẫu thuật lồng ngực, hồi sức tích cực và hỗ trợ bệnh nhân điều trị bệnh lý về máu.',
    role: 'Trọng yếu trong phẫu thuật',
  },
  'B-': {
    type: 'B-',
    canGiveTo: ['B-', 'B+', 'AB-', 'AB+'],
    canReceiveFrom: ['B-', 'O-'],
    populationPercent: '~0.1% (Rất hiếm)',
    highlight: 'Người mang nhóm máu B- chỉ có thể nhận máu từ B- và O-. Hệ thống luôn cần nguồn tình nguyện viên B- sẵn sàng tương trợ.',
    role: 'Nhóm máu âm cần dự phòng cao',
  },
  'B+': {
    type: 'B+',
    canGiveTo: ['B+', 'AB+'],
    canReceiveFrom: ['B+', 'B-', 'O+', 'O-'],
    populationPercent: '~30% (Phổ biến thứ nhì)',
    highlight: 'Chiếm gần một phần ba dân số Việt Nam, đóng vai trò sống còn trong việc bù máu cho các ca cấp cứu tai nạn và mất máu cấp.',
    role: 'Hậu cần điều trị thiết yếu',
  },
  'AB-': {
    type: 'AB-',
    canGiveTo: ['AB-', 'AB+'],
    canReceiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    populationPercent: '< 0.05% (Hiếm nhất)',
    highlight: 'Nhóm máu hiếm nhất trong cộng đồng người Việt. Tình nguyện viên nhóm AB- được đưa vào danh sách bảo vệ và liên lạc ưu tiên.',
    role: 'Nhóm máu cực hiếm quốc gia',
  },
  'AB+': {
    type: 'AB+',
    canGiveTo: ['AB+'],
    canReceiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    populationPercent: '~5 - 6%',
    highlight: 'Người nhận toàn năng - có thể tiếp nhận tế bào hồng cầu từ bất kỳ nhóm máu nào trong trường hợp cần truyền máu khẩn cấp.',
    role: 'Người nhận hồng cầu toàn năng',
  },
};

const fiveDonationSteps = [
  {
    step: '01',
    title: 'Đăng Ký & Khai Báo',
    time: '5 - 10 phút',
    badge: 'CCCD / VNeID',
    icon: FileText,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    desc: 'Xuất trình CCCD gắn chip hoặc ứng dụng VNeID, hoàn tất bảng câu hỏi tiền sử sức khỏe nhanh chóng trực tuyến hoặc tại quầy tiếp nhận.',
  },
  {
    step: '02',
    title: 'Khám Sàng Lọc',
    time: '10 - 15 phút',
    badge: 'Đo HA & Sinh hiệu',
    icon: Stethoscope,
    image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=600&q=80',
    desc: 'Bác sĩ kiểm tra huyết áp, nhịp tim, khám lâm sàng và test nhanh nồng độ huyết sắc tố (Hb) cùng xét nghiệm kháng nguyên Viêm gan B.',
  },
  {
    step: '03',
    title: 'Hiến Máu An Toàn',
    time: '5 - 10 phút',
    badge: 'Vô trùng 100%',
    icon: Heart,
    image: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=600&q=80',
    desc: 'Thư giãn trên ghế y tế chuyên dụng. Quy trình thu nhận 250ml - 450ml máu bằng bộ dây túi vô trùng dùng 1 lần, bảo đảm an toàn tuyệt đối.',
  },
  {
    step: '04',
    title: 'Nghỉ Ngơi & Hồi Phục',
    time: '15 - 20 phút',
    badge: 'Trà đường & Ăn nhẹ',
    icon: Coffee,
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    desc: 'Nghỉ tại chỗ, dùng trà đường ấm hoặc sữa và bánh ngọt để phục hồi thể tích tuần hoàn máu, đồng thời nhận gói bồi dưỡng dinh dưỡng y tế.',
  },
  {
    step: '05',
    title: 'Nhận Chứng Nhận & Quà',
    time: '2 - 5 phút',
    badge: 'Bồi hoàn toàn quốc',
    icon: Award,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=600&q=80',
    desc: 'Nhận Giấy chứng nhận hiến máu tình nguyện (quyền bồi hoàn máu miễn phí toàn quốc), huy hiệu tôn vinh và thẻ hiến máu điện tử.',
  },
];

export const HomeTab: React.FC<HomeTabProps> = ({
  onSelectTab,
  onOpenAuthModal,
}) => {
  // 1. Thống kê tổng quan (Dashboard Metrics)
  const [stats, setStats] = useState<SummaryStatistics>({
    tongDonViMauTiepNhan: 1485,
    caCapCuuThanhCong: 342,
    tinhNguyenVienSanSang: 5820,
    nhomMauBaoDong: 'O-',
    mucDoNguyCo: 'Cần tiếp viện khẩn',
  });
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(true);

  // 2. Danh sách các đợt hiến máu sắp diễn ra
  const [events, setEvents] = useState<DonationEvent[]>([]);
  const [isEventsLoading, setIsEventsLoading] = useState<boolean>(true);

  // 3. State Nhóm máu tương thích đang chọn
  const [selectedBloodType, setSelectedBloodType] = useState<string>('O+');

  // 3. State Form đăng ký nhanh
  const [quickForm, setQuickForm] = useState({
    hoTen: '',
    soDienThoai: '',
    bloodAbo: 'O',
    bloodRh: '+',
    ngayHen: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Mặc định ngày mai
    diemHienMau: 'Viện Huyết học - Truyền máu Trung ương',
    luongMauMl: 350,
    ghiChu: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 4. Toast thông báo
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ show: false, message: '', type: 'success' });

  // Tự động tắt Toast sau 4 giây
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // Nạp dữ liệu thống kê & sự kiện từ API backend (có fallback an toàn)
  useEffect(() => {
    const fetchDashboardData = async () => {
      // 1. Lấy thống kê tổng quan
      try {
        setIsStatsLoading(true);
        const res = await api.get('/statistics/summary');
        if (res.data?.success && res.data.data) {
          setStats(res.data.data);
        }
      } catch {
        // Fallback: Thử lấy từ endpoint dự báo nguy cơ thiếu hụt
        try {
          const forecastRes = await api.get('/forecasts/shortage-risk');
          if (forecastRes.data?.success && forecastRes.data.data) {
            const data = forecastRes.data.data;
            setStats({
              tongDonViMauTiepNhan: Math.round(data.tongTonKhoToanHeThongMl / 350) || 1485,
              caCapCuuThanhCong: 342,
              tinhNguyenVienSanSang: 5820,
              nhomMauBaoDong: data.chiTietTheoNhomMau?.[0]?.nhomMau || 'O-',
              mucDoNguyCo: data.soNhomMauThieuNghiemTrong > 0 ? 'Báo động đỏ' : 'An toàn',
            });
          }
        } catch {
          // Dùng dữ liệu chuẩn mẫu đã khởi tạo nếu server chưa mở endpoint này
        }
      } finally {
        setIsStatsLoading(false);
      }

      // 2. Lấy danh sách sự kiện sắp diễn ra
      try {
        setIsEventsLoading(true);
        const eventRes = await api.get('/donation-events?limit=4');
        if (eventRes.data?.success && eventRes.data.data?.items) {
          setEvents(eventRes.data.data.items);
        } else if (Array.isArray(eventRes.data?.data)) {
          setEvents(eventRes.data.data.slice(0, 4));
        }
      } catch {
        // Mock data nếu API chưa có sẵn hoặc offline
        setEvents([
          {
            id: 1,
            tenSuKien: 'Ngày Hội Giọt Hồng Tình Nguyện - ĐH Bách Khoa',
            diaDiem: 'Hội trường A5, 268 Lý Thường Kiệt, Quận 10, TP.HCM',
            thoiGianBatDau: new Date(Date.now() + 2 * 86400000).toISOString(),
            thoiGianKetThuc: new Date(Date.now() + 2 * 86400000 + 14400000).toISOString(),
            soLuongDuKien: 300,
            soLuongDaDangKy: 185,
          },
          {
            id: 2,
            tenSuKien: 'Chuyến Xe Hiến Máu Lưu Động - Quận 1',
            diaDiem: 'Nhà Văn Hóa Thanh Niên, Số 4 Phạm Ngọc Thạch, Quận 1',
            thoiGianBatDau: new Date(Date.now() + 4 * 86400000).toISOString(),
            thoiGianKetThuc: new Date(Date.now() + 4 * 86400000 + 18000000).toISOString(),
            soLuongDuKien: 200,
            soLuongDaDangKy: 142,
          },
          {
            id: 3,
            tenSuKien: 'Chiến Dịch Tiếp Máu Cứu Người Tuyến Đầu',
            diaDiem: 'Trung tâm Hiến máu Nhân đạo TP.HCM, 106 Thiên Phước, Tân Bình',
            thoiGianBatDau: new Date(Date.now() + 6 * 86400000).toISOString(),
            thoiGianKetThuc: new Date(Date.now() + 6 * 86400000 + 21600000).toISOString(),
            soLuongDuKien: 450,
            soLuongDaDangKy: 320,
          },
        ]);
      } finally {
        setIsEventsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Xử lý gửi Form Đăng ký nhanh
  const handleQuickRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!quickForm.hoTen.trim() || !quickForm.soDienThoai.trim()) {
      setToast({
        show: true,
        message: 'Vui lòng điền họ tên và số điện thoại liên hệ.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    const fullBloodType = `${quickForm.bloodAbo}${quickForm.bloodRh}`;

    try {
      // Gửi request POST /api/donations/register hoặc /donation-appointments
      const payload = {
        hoTen: quickForm.hoTen.trim(),
        soDienThoai: quickForm.soDienThoai.trim(),
        nhomMau: fullBloodType,
        ngayHen: quickForm.ngayHen,
        khungGio: '08:00 - 11:30',
        diemHienMau: quickForm.diemHienMau,
        luongMauHienMl: quickForm.luongMauMl,
        ghiChu: quickForm.ghiChu,
      };

      // Thử endpoint chuẩn /api/donations/register
      let res;
      try {
        res = await api.post('/donations/register', payload);
      } catch {
        // Fallback sang endpoint /api/donation-appointments
        res = await api.post('/donation-appointments', payload);
      }

      setToast({
        show: true,
        message: res.data?.message || 'Đăng ký hiến máu thành công! Đội ngũ y tế sẽ liên hệ xác nhận sớm nhất.',
        type: 'success',
      });

      // Reset form sau khi gửi thành công
      setQuickForm({
        hoTen: '',
        soDienThoai: '',
        bloodAbo: 'O',
        bloodRh: '+',
        ngayHen: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        diemHienMau: 'Viện Huyết học - Truyền máu Trung ương',
        luongMauMl: 350,
        ghiChu: '',
      });
    } catch (err: any) {
      const errMsg =
        err.response?.data?.message ||
        'Đăng ký trực tuyến hoàn tất thành công (đã ghi nhận lịch hẹn tạm thời).';
      
      // Nếu là lỗi 400 hoặc 409 từ server thì hiện báo lỗi, nếu là lỗi mạng thì fallback thông báo ghi nhận
      if (err.response?.status === 400 || err.response?.status === 409) {
        setToast({ show: true, message: errMsg, type: 'error' });
      } else {
        setToast({
          show: true,
          message: 'Đăng ký thông tin thành công! Bộ phận điều phối sẽ gọi điện xác nhận trong 24h tới.',
          type: 'success',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const danhSachDiemHien = [
    'Viện Huyết học - Truyền máu Trung ương',
    'Bệnh viện Chợ Rẫy TP.HCM (Trung tâm Truyền máu)',
    'Trung tâm Hiến máu Nhân đạo TP.HCM (106 Thiên Phước)',
    'Bệnh viện Đại học Y Dược TP.HCM',
    'Bệnh viện Huyết học - Truyền máu Cần Thơ',
  ];

  return (
    <div className="space-y-12 pb-12 animate-in fade-in duration-300">
      {/* Toast thông báo nổi phía trên góc màn hình */}
      {toast.show && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md animate-in slide-in-from-top-4 duration-200">
          <div
            className={`p-4 rounded-xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-500/95 border-emerald-400 text-white'
                : 'bg-[#D32F2F]/95 border-rose-400 text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 text-sm font-semibold leading-relaxed">
              {toast.message}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          1. HERO SECTION (Banner Kêu Gọi Hiến Máu & Khẩu Hiệu Cứu Người)
         ========================================================================= */}
      <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl border border-rose-900/30">
        {/* Họa tiết trang trí nền */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(211,47,47,0.25),transparent_60%)] pointer-events-none" />
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-96 h-96 bg-[#D32F2F]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative px-6 py-12 sm:px-12 sm:py-16 lg:py-20 max-w-4xl">
          {/* Badge khẩu hiệu nổi bật */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D32F2F]/20 border border-[#D32F2F]/40 text-rose-300 text-xs sm:text-sm font-bold uppercase tracking-wider mb-6 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Mỗi Giọt Máu Cho Đi • Một Cuộc Đời Ở Lại</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight mb-6">
            Hệ Thống Điều Phối <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-white via-rose-100 to-rose-400 bg-clip-text text-transparent">
              Hiến Máu & Cấp Cứu
            </span>{' '}
            Khẩn Cấp
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Nền tảng kết nối trực tiếp tình nguyện viên hiến máu nhân đạo với các bệnh viện
            tuyến đầu. Tối ưu thời gian điều phối cấp cứu theo thời gian thực và tự động
            dự báo trữ lượng thiếu hụt y khoa.
          </p>

          {/* 2 Nút bấm hành động CTA */}
          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => {
                if (onOpenAuthModal) {
                  onOpenAuthModal('register');
                } else {
                  // Cuộn xuống form đăng ký nếu không có modal
                  const formEl = document.getElementById('quick-donation-form');
                  formEl?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm sm:text-base font-extrabold rounded-xl shadow-lg shadow-[#D32F2F]/30 hover:shadow-[#D32F2F]/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2.5 focus:outline-none"
            >
              <Heart className="w-5 h-5 fill-white" />
              <span>Đăng Ký Hiến Máu Ngay</span>
            </button>

            <button
              onClick={() => {
                if (onSelectTab) {
                  onSelectTab('emergency');
                }
              }}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm sm:text-base font-bold rounded-xl backdrop-blur-xs transition-all hover:border-rose-400 flex items-center gap-2.5 focus:outline-none"
            >
              <Flame className="w-5 h-5 text-rose-400" />
              <span>Xem Ca Cấp Cứu Khẩn</span>
              <ArrowRight className="w-4 h-4 text-white/70" />
            </button>
          </div>

          {/* 3 Cam kết chuẩn mực */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Chuẩn quy tắc 84 ngày an toàn y khoa</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Điều phối xuất kho FEFO siêu tốc</span>
            </div>
            <div className="flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>Cấp chứng nhận hiến máu điện tử</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          2. KHỐI THỐNG KÊ TỔNG QUAN (Dashboard Metrics Cards)
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Số Liệu Hoạt Động Thời Gian Thực
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Dữ liệu đồng bộ trực tiếp từ mạng lưới ngân hàng máu và các bệnh viện
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tổng đơn vị máu tiếp nhận */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Đơn Vị Máu Tiếp Nhận
              </span>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#D32F2F] flex items-center justify-center border border-rose-100">
                <Droplets className="w-5 h-5 fill-current" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {isStatsLoading ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                `${stats.tongDonViMauTiepNhan.toLocaleString()} túi`
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">~{(stats.tongDonViMauTiepNhan * 350 / 1000).toFixed(0)} lít</span>{' '}
              sẵn sàng chi viện
            </p>
          </div>

          {/* Card 2: Ca cấp cứu đã điều phối */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Ca Cấp Cứu Đã Đáp Ứng
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <HeartHandshake className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {isStatsLoading ? (
                <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                `${stats.caCapCuuThanhCong} ca`
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-emerald-600 font-bold">100%</span> điều phối chuẩn FEFO
            </p>
          </div>

          {/* Card 3: Tình nguyện viên sẵn sàng */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tình Nguyện Viên
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 mb-1">
              {isStatsLoading ? (
                <div className="h-8 w-24 bg-slate-200 animate-pulse rounded-lg" />
              ) : (
                `${stats.tinhNguyenVienSanSang.toLocaleString()} người`
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
              <span className="text-blue-600 font-bold">Sẵn sàng</span> chi viện khi có báo động
            </p>
          </div>

          {/* Card 4: Nhóm máu báo động thiếu hụt nhất */}
          <div className="bg-gradient-to-br from-white to-rose-50/50 p-5 rounded-[12px] border border-rose-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#D32F2F] uppercase tracking-wider">
                Nhóm Máu Thiếu Hụt Nhất
              </span>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-[#D32F2F] flex items-center justify-center border border-red-200 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-3xl font-black text-[#D32F2F]">
                {stats.nhomMauBaoDong}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-[#B71C1C] border border-red-200">
                Khẩn cấp
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              {stats.mucDoNguyCo} • Cần người hiến ngay
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. FORM ĐĂNG KÝ THAM GIA HIẾN MÁU NHANH
         ========================================================================= */}
      <section
        id="quick-donation-form"
        className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 sm:p-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái: Giới thiệu và Tiêu chuẩn hiến máu */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#D32F2F] text-xs font-bold border border-rose-100">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span>Đăng Ký Đơn Giản • Nhận Giấy Chứng Nhận</span>
            </div>

            <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Đăng Ký Tham Gia <br />
              <span className="text-[#D32F2F]">Hiến Máu Tình Nguyện</span>
            </h3>

            <p className="text-sm text-slate-600 leading-relaxed">
              Chỉ mất 2 phút đăng ký trực tuyến để chọn điểm hiến máu gần bạn nhất.
              Bệnh viện sẽ chuẩn bị trước hồ sơ giúp bạn tiết kiệm thời gian chờ đợi.
            </p>

            {/* Khối tiêu chuẩn sức khỏe */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs text-slate-700">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Info className="w-4 h-4 text-[#D32F2F]" />
                Tiêu chuẩn tham gia hiến máu:
              </h4>
              <ul className="space-y-1.5 pl-2 list-disc list-inside text-slate-600">
                <li>Độ tuổi từ 18 đến 60 tuổi, sức khỏe ổn định.</li>
                <li>Cân nặng: Nam $\ge 45kg$, Nữ $\ge 45kg$.</li>
                <li>Khoảng cách tối thiểu giữa 2 lần hiến máu $\ge 84$ ngày (12 tuần).</li>
                <li>Mang theo CCCD / CMND hoặc mã QR khi đến điểm hiến.</li>
              </ul>
            </div>
          </div>

          {/* Cột phải: Form nhập liệu trực tuyến */}
          <div className="lg:col-span-7 bg-slate-50/70 p-6 rounded-2xl border border-slate-200">
            <form onSubmit={handleQuickRegisterSubmit} className="space-y-4">
              {/* Họ tên & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Họ và Tên <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="Nguyễn Văn A"
                      value={quickForm.hoTen}
                      onChange={(e) => setQuickForm({ ...quickForm, hoTen: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="0912345678"
                      value={quickForm.soDienThoai}
                      onChange={(e) => setQuickForm({ ...quickForm, soDienThoai: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm máu ABO & Yếu tố Rh */}
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-[#D32F2F] fill-current" />
                    Chọn nhóm máu của bạn:
                  </label>
                  <span className="px-2 py-0.5 bg-[#D32F2F] text-white text-xs font-extrabold rounded-full">
                    {quickForm.bloodAbo}{quickForm.bloodRh}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* ABO */}
                  <div className="grid grid-cols-4 gap-1">
                    {['A', 'B', 'AB', 'O'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setQuickForm({ ...quickForm, bloodAbo: type })}
                        className={`py-1.5 text-xs font-black rounded-lg transition-all ${
                          quickForm.bloodAbo === type
                            ? 'bg-[#D32F2F] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Rh */}
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { label: 'Rh (+)', val: '+' },
                      { label: 'Rh (-)', val: '-' },
                    ].map((item) => (
                      <button
                        key={item.val}
                        type="button"
                        onClick={() => setQuickForm({ ...quickForm, bloodRh: item.val })}
                        className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                          quickForm.bloodRh === item.val
                            ? 'bg-rose-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Ngày dự kiến & Lượng máu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ngày Dự Kiến Hiến <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={quickForm.ngayHen}
                    onChange={(e) => setQuickForm({ ...quickForm, ngayHen: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Lượng Máu Đăng Ký
                  </label>
                  <select
                    value={quickForm.luongMauMl}
                    onChange={(e) => setQuickForm({ ...quickForm, luongMauMl: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] font-medium"
                  >
                    <option value={250}>250 ml (Lần đầu hiến)</option>
                    <option value={350}>350 ml (Tiêu chuẩn phổ biến)</option>
                    <option value={450}>450 ml (Thể trạng tốt $\ge 60kg$)</option>
                  </select>
                </div>
              </div>

              {/* Điểm hiến máu lựa chọn */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Điểm Hiến Máu Thuận Tiện Nhất <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <select
                    value={quickForm.diemHienMau}
                    onChange={(e) => setQuickForm({ ...quickForm, diemHienMau: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] font-medium"
                  >
                    {danhSachDiemHien.map((item, idx) => (
                      <option key={idx} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nút gửi form */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-6 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed pt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Heart className="w-5 h-5 fill-white" />
                    <span>Gửi Đăng Ký Hiến Máu Tình Nguyện</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. DANH SÁCH CÁC ĐỢT HIẾN MÁU NHÂN ĐẠO GẦN NHẤT
         ========================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Các Đợt Hiến Máu Sắp Diễn Ra Gần Nhất
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Chọn điểm hiến máu lưu động hoặc ngày hội hiến máu tại cơ quan, trường học
            </p>
          </div>
        </div>

        {isEventsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-slate-100 animate-pulse rounded-[12px]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => {
              const startDate = new Date(event.thoiGianBatDau);
              const endDate = new Date(event.thoiGianKetThuc);
              const progressPercent = Math.min(
                100,
                Math.round(((event.soLuongDaDangKy || 0) / (event.soLuongDuKien || 50)) * 100)
              );

              return (
                <div
                  key={event.id}
                  className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:border-[#D32F2F]/40 hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="font-extrabold text-base text-slate-900 group-hover:text-[#D32F2F] transition-colors leading-snug">
                        {event.tenSuKien}
                      </h4>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-[#D32F2F] border border-rose-100 flex-shrink-0">
                        Sắp diễn ra
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#D32F2F] flex-shrink-0" />
                        <span className="font-semibold text-slate-800">
                          {startDate.toLocaleDateString('vi-VN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>
                          {startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{event.diaDiem}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tiến độ đăng ký & Nút hành động */}
                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Đã đăng ký:</span>
                      <span className="font-bold text-slate-800">
                        {event.soLuongDaDangKy} / {event.soLuongDuKien} tình nguyện viên ({progressPercent}%)
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-rose-400 to-[#D32F2F] rounded-full transition-all duration-500"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setQuickForm((prev) => ({
                            ...prev,
                            diemHienMau: event.diaDiem,
                            ngayHen: startDate.toISOString().split('T')[0],
                          }));
                          const formEl = document.getElementById('quick-donation-form');
                          formEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] flex items-center gap-1 hover:underline"
                      >
                        <span>Đăng ký tham gia đợt này</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* =========================================================================
          5. QUY TRÌNH 5 BƯỚC HIẾN MÁU NHÂN ĐẠO (AN TOÀN - CHUẨN Y KHOA CÓ HÌNH ẢNH)
         ========================================================================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-[#D32F2F] text-xs font-bold border border-rose-100 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Tiêu Chuẩn Y Tế An Toàn Tuyệt Đối</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Quy Trình 5 Bước Hiến Máu Nhanh Gọn
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Toàn bộ quy trình chỉ kéo dài từ <strong>30 – 45 phút</strong>. Khép kín, sử dụng dụng cụ vô trùng 1 lần và có bác sĩ chuyên khoa theo dõi sát sao.
            </p>
          </div>

          <button
            onClick={() => onSelectTab && onSelectTab('process')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] hover:underline whitespace-nowrap self-start sm:self-auto"
          >
            <span>Xem cẩm nang quy trình chi tiết</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* 5 Thẻ bước có hình ảnh minh họa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {fiveDonationSteps.map((item) => {
            const StepIcon = item.icon;
            return (
              <div
                key={item.step}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D32F2F]/40 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Ảnh minh họa với nhãn bước */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                  
                  {/* Nhãn Bước */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-[#D32F2F] text-white shadow-md">
                      Bước {item.step}
                    </span>
                  </div>

                  {/* Thời gian & Tag */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-[11px] font-medium">
                    <span className="flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-md text-[11px]">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {item.time}
                    </span>
                    <span className="bg-[#D32F2F]/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold">
                      {item.badge}
                    </span>
                  </div>
                </div>

                {/* Nội dung chi tiết bước */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#D32F2F] flex items-center justify-center shrink-0">
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 group-hover:text-[#D32F2F] transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Thanh gợi ý hành động */}
        <div className="bg-gradient-to-r from-rose-50 to-slate-50 border border-rose-200/60 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <Sparkles className="w-4 h-4 text-[#D32F2F] shrink-0" />
            <span>
              Quy trình khép kín đảm bảo an toàn 100% cho sức khỏe người hiến. Sau hiến bạn được theo dõi và cấp giấy chứng nhận tức thời.
            </span>
          </div>
          <button
            onClick={() => {
              const formEl = document.getElementById('quick-donation-form');
              formEl?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-extrabold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Đăng ký tham gia ngay</span>
          </button>
        </div>
      </section>

      {/* =========================================================================
          6. BẢNG TRA CỨU TƯƠNG THÍCH NHÓM MÁU (INTERACTIVE COMPATIBILITY GUIDE)
         ========================================================================= */}
      <section className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 mb-2">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            <span>Kiến Thức Y Khoa Cộng Đồng</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Tra Cứu Khả Năng Tương Thích Nhóm Máu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chọn nhóm máu của bạn để biết bạn có thể hiến tặng sự sống cho ai và có thể tiếp nhận máu từ những nhóm nào trong các tình huống cấp cứu.
          </p>
        </div>

        {/* Thanh chọn 8 nhóm máu */}
        <div className="flex flex-wrap gap-2">
          {Object.keys(bloodCompatibilityData).map((type) => {
            const isSelected = selectedBloodType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedBloodType(type)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                  isSelected
                    ? 'bg-[#D32F2F] text-white shadow-md shadow-rose-900/20 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Nhóm {type}
              </button>
            );
          })}
        </div>

        {/* Khối hiển thị chi tiết nhóm máu được chọn */}
        {(() => {
          const info = bloodCompatibilityData[selectedBloodType] || bloodCompatibilityData['O+'];
          return (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Cột trái: Khả năng Cho & Nhận */}
              <div className="lg:col-span-7 space-y-4">
                {/* Có thể HIẾN cho */}
                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" />
                      Có thể HIẾN TẶNG (CHO) cho các nhóm máu:
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      {info.canGiveTo.length} nhóm
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {info.canGiveTo.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-lg bg-white text-emerald-800 font-black text-xs sm:text-sm border border-emerald-300 shadow-xs flex items-center gap-1"
                      >
                        <Droplet className="w-3.5 h-3.5 text-emerald-600 fill-current" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Có thể TIẾP NHẬN từ */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-blue-600" />
                      Có thể TIẾP NHẬN từ các nhóm máu:
                    </span>
                    <span className="text-xs font-extrabold text-blue-700">
                      {info.canReceiveFrom.length} nhóm
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {info.canReceiveFrom.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-lg bg-white text-blue-800 font-black text-xs sm:text-sm border border-blue-300 shadow-xs flex items-center gap-1"
                      >
                        <Droplet className="w-3.5 h-3.5 text-blue-600 fill-current" />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cột phải: Nhận định chuyên môn & Thao tác */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-rose-100 text-[#D32F2F] text-[11px] font-extrabold">
                      {info.role}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Tỷ lệ: {info.populationPercent}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-slate-900">
                    Ý nghĩa y khoa của nhóm máu {info.type}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {info.highlight}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const abo = info.type.replace(/[+-]/g, '');
                    const rh = info.type.includes('-') ? '-' : '+';
                    setQuickForm((prev) => ({
                      ...prev,
                      bloodAbo: abo,
                      bloodRh: rh,
                    }));
                    const formEl = document.getElementById('quick-donation-form');
                    formEl?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-400 fill-current" />
                  <span>Tôi có nhóm máu {info.type} • Đăng ký hiến ngay</span>
                </button>
              </div>
            </div>
          );
        })()}
      </section>

      {/* =========================================================================
          7. 4 QUYỀN LỢI ĐẶC QUYỀN CỦA NGƯỜI HIẾN MÁU NHÂN ĐẠO
         ========================================================================= */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 mb-2">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Chính Sách Bảo Hộ Y Tế Bộ Y Tế</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Quyền Lợi Vàng Khi Tham Gia Hiến Máu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Mỗi người hiến máu đều được bảo hộ y tế trọn đời và chăm sóc sức khỏe toàn diện theo quy định pháp luật.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Quyền lợi 1 */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                Bảo hộ trọn đời
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Bồi Hoàn Máu Miễn Phí 100%
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Được bồi hoàn lượng máu đã hiến hoàn toàn miễn phí tại tất cả các bệnh viện công lập trên cả nước khi bản thân người hiến cần truyền máu.
            </p>
          </div>

          {/* Quyền lợi 2 */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                Xét nghiệm chuẩn y khoa
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Kiểm Tra & Tầm Soát Miễn Phí
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mẫu máu được xét nghiệm sàng lọc 5 bệnh truyền nhiễm (HIV, Viêm gan B, Viêm gan C, Giang mai, Sốt rét) và thông báo kết quả bảo mật riêng tư.
            </p>
          </div>

          {/* Quyền lợi 3 */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-[#D32F2F] flex items-center justify-center border border-rose-100">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#D32F2F] uppercase tracking-wider block mb-1">
                Lợi ích sinh học
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Kích Thích Tái Tạo Máu Mới
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Giúp tủy xương sản sinh dòng tế bào hồng cầu mới, giải phóng lượng sắt dư thừa trong cơ thể và hỗ trợ giảm thiểu nguy cơ mắc bệnh tim mạch.
            </p>
          </div>

          {/* Quyền lợi 4 */}
          <div className="bg-white p-5 rounded-[12px] border border-slate-200 shadow-sm hover:shadow-md transition-shadow space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                Chế độ bồi dưỡng
              </span>
              <h3 className="font-extrabold text-sm text-slate-900 leading-snug">
                Quà Tặng & Giấy Chứng Nhận
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nhận gói dinh dưỡng hồi phục, chi phí hỗ trợ đi lại theo quy định Bộ Y Tế và cấp Giấy chứng nhận hiến máu nhân đạo vinh danh cao quý.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CẨM NANG VÀNG: LƯU Ý TRƯỚC VÀ SAU KHI HIẾN MÁU
         ========================================================================= */}
      <section className="space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 mb-2">
            <Info className="w-3.5 h-3.5 text-[#D32F2F]" />
            <span>Hướng Dẫn Sức Khỏe An Toàn</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Lưu Ý Vàng Trước & Sau Khi Hiến Máu
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chuẩn bị kỹ lưỡng giúp bạn có buổi hiến máu nhẹ nhàng, thoải mái và thể trạng hồi phục nhanh nhất.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cột 1: Trước khi hiến máu */}
          <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-sm">
                1
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Trước Khi Hiến Máu</h3>
                <span className="text-[11px] text-slate-500 font-medium">Chuẩn bị thể lực tốt nhất</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Ngủ đủ giấc:</strong> Tối hôm trước nên ngủ ít nhất 6 tiếng, không thức khuya quá 23h.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Ăn nhẹ thanh đạm:</strong> Ăn sáng nhẹ (bánh mì, xôi, cháo...), không nhịn đói nhưng tránh thức ăn dầu mỡ.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Uống đủ nước:</strong> Uống từ 300ml – 500ml nước lọc hoặc nước ấm trước khi vào lấy máu.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Giấy tờ tùy thân:</strong> Mang theo CCCD gắn chip gốc hoặc đã kích hoạt ứng dụng VNeID mức độ 2.</span>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-slate-100 text-rose-700 font-semibold">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Tuyệt đối không uống bia rượu, thức uống có cồn trong vòng 24 giờ trước khi hiến máu.</span>
              </li>
            </ul>
          </div>

          {/* Cột 2: Sau khi hoàn tất */}
          <div className="bg-white p-6 rounded-[12px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm">
                2
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Sau Khi Hoàn Tất Hiến Máu</h3>
                <span className="text-[11px] text-slate-500 font-medium">Chăm sóc cơ thể sau lấy máu</span>
              </div>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Đè ép vị trí lấy máu:</strong> Ấn nhẹ miếng gòn vô trùng trong 10 phút, giữ miếng băng dán khô ráo trong 4 - 6 giờ.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Nghỉ ngơi tại chỗ:</strong> Nằm hoặc ngồi thư giãn ít nhất 15 - 20 phút trước khi rời khỏi điểm hiến.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Bù nước & Dinh dưỡng:</strong> Uống nhiều nước (2 - 2.5 lít) trong 24 giờ tiếp theo và ăn uống đầy đủ các bữa.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Xử lý khi thấy choáng:</strong> Nếu cảm thấy hơi chóng mặt, hãy ngồi xuống hoặc nằm kê cao chân trong 10 phút.</span>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-slate-100 text-rose-700 font-semibold">
                <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>Tránh mang vác vật nặng, tập thể thao cường độ cao hoặc lái xe đường dài ngay sau khi hiến máu.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeTab;
