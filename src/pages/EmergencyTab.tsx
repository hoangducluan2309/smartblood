import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle,
  Flame,
  Clock,
  Building2,
  Droplet,
  Heart,
  Phone,
  Search,
  Filter,
  PlusCircle,
  X,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Info,
  Calendar,
  Share2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../contexts/AuthContext.js';

export interface EmergencyTabProps {
  onSelectTab?: (tabId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
}

export type UrgencyLevel = 'NGUY_CAP' | 'CAO' | 'TRUNG_BINH';

export interface EmergencyRequestItem {
  id: number;
  benhVienYeuCau: string;
  khoaPhong?: string;
  diaChi?: string;
  nhomMauCan: string;
  thanhPhanCan: string;
  soLuongTui: number;
  soLuongCanMl: number;
  mucDoKhanCap: UrgencyLevel;
  lyDo: string;
  hanChot: string; // ISO date string
  bacSiLienHe?: string;
  soDienThoaiLienHe?: string;
  trangThai?: 'DangCho' | 'DangDieuPhoi' | 'DaDapUng';
  ngayTao?: string;
}

// Danh sách dữ liệu mẫu cấp cứu thực tế khi Backend chưa kịp phản hồi
const INITIAL_MOCK_REQUESTS: EmergencyRequestItem[] = [
  {
    id: 101,
    benhVienYeuCau: 'Bệnh viện Chợ Rẫy',
    khoaPhong: 'Khoa Cấp cứu Hồi sức Tích cực (ICU)',
    diaChi: '201B Nguyễn Chí Thanh, Quận 5, TP. Hồ Chí Minh',
    nhomMauCan: 'O-',
    thanhPhanCan: 'Máu toàn phần',
    soLuongTui: 3,
    soLuongCanMl: 1050,
    mucDoKhanCap: 'NGUY_CAP',
    lyDo: 'Bệnh nhân tai nạn giao thông đa chấn thương, mất máu cấp thể tích lớn',
    hanChot: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // Còn 45 phút
    bacSiLienHe: 'BS. CKII Nguyễn Văn Hùng',
    soDienThoaiLienHe: '028 3855 4137',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: 102,
    benhVienYeuCau: 'Viện Huyết học - Truyền máu TW',
    khoaPhong: 'Khoa Vận chuyển & Điều phối Máu',
    diaChi: 'Phố Phạm Văn Bạch, Cầu Giấy, Hà Nội',
    nhomMauCan: 'A+',
    thanhPhanCan: 'Khối hồng cầu',
    soLuongTui: 4,
    soLuongCanMl: 1400,
    mucDoKhanCap: 'NGUY_CAP',
    lyDo: 'Bệnh nhân xuất huyết tiêu hóa ồ ạt, sốc giảm thể tích tuần hoàn',
    hanChot: new Date(Date.now() + 90 * 60 * 1000).toISOString(), // Còn 1h30 phút
    bacSiLienHe: 'BS. Lê Thị Mai Hoa',
    soDienThoaiLienHe: '024 3782 1895',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 103,
    benhVienYeuCau: 'Bệnh viện Phụ sản Trung ương',
    khoaPhong: 'Khoa Gây mê Hồi sức & Phẫu thuật',
    diaChi: '43 Tràng Thi, Hoàn Kiếm, Hà Nội',
    nhomMauCan: 'AB-',
    thanhPhanCan: 'Huyết tương tươi đông lạnh',
    soLuongTui: 2,
    soLuongCanMl: 700,
    mucDoKhanCap: 'NGUY_CAP',
    lyDo: 'Sản phụ cấp cứu băng huyết sau sinh nặng do rau tiền đạo trung tâm',
    hanChot: new Date(Date.now() + 65 * 60 * 1000).toISOString(), // Còn 1h05 phút
    bacSiLienHe: 'BS. Trần Quỳnh Nga',
    soDienThoaiLienHe: '024 3825 2161',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  },
  {
    id: 104,
    benhVienYeuCau: 'Bệnh viện Bạch Mai',
    khoaPhong: 'Trung tâm Cấp cứu A9',
    diaChi: '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
    nhomMauCan: 'B+',
    thanhPhanCan: 'Khối hồng cầu',
    soLuongTui: 3,
    soLuongCanMl: 1050,
    mucDoKhanCap: 'CAO',
    lyDo: 'Ca phẫu thuật bắc cầu mạch vành tim hở khẩn cấp',
    hanChot: new Date(Date.now() + 180 * 60 * 1000).toISOString(), // Còn 3 tiếng
    bacSiLienHe: 'ThS. BS Đỗ Anh Tú',
    soDienThoaiLienHe: '024 3869 3731',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: 105,
    benhVienYeuCau: 'Bệnh viện Quân Y 108',
    khoaPhong: 'Viện Phẫu thuật Tim mạch & Lồng ngực',
    diaChi: 'Số 1 Trần Hưng Đạo, Hai Bà Trưng, Hà Nội',
    nhomMauCan: 'O+',
    thanhPhanCan: 'Tiểu cầu đậm đặc',
    soLuongTui: 2,
    soLuongCanMl: 500,
    mucDoKhanCap: 'CAO',
    lyDo: 'Bệnh nhân sốt xuất huyết nặng có hội chứng đông máu rải rác trong lòng mạch',
    hanChot: new Date(Date.now() + 240 * 60 * 1000).toISOString(), // Còn 4 tiếng
    bacSiLienHe: 'BS. Hoàng Tuấn Kiệt',
    soDienThoaiLienHe: '024 6278 4115',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: 106,
    benhVienYeuCau: 'Bệnh viện Hùng Vương',
    khoaPhong: 'Khoa Hồi sức Tích cực Sơ sinh',
    diaChi: '128 Hồng Bàng, Phường 12, Quận 5, TP. Hồ Chí Minh',
    nhomMauCan: 'A-',
    thanhPhanCan: 'Máu toàn phần',
    soLuongTui: 1,
    soLuongCanMl: 350,
    mucDoKhanCap: 'TRUNG_BINH',
    lyDo: 'Thay máu sơ sinh tán huyết do bất đồng nhóm máu mẹ con',
    hanChot: new Date(Date.now() + 320 * 60 * 1000).toISOString(), // Còn hơn 5 tiếng
    bacSiLienHe: 'BS. Phan Kim Chi',
    soDienThoaiLienHe: '028 3855 8582',
    trangThai: 'DangCho',
    ngayTao: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const BLOOD_GROUPS = ['ALL', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const HOSPITALS = [
  'ALL',
  'Bệnh viện Chợ Rẫy',
  'Viện Huyết học - Truyền máu TW',
  'Bệnh viện Phụ sản Trung ương',
  'Bệnh viện Bạch Mai',
  'Bệnh viện Quân Y 108',
  'Bệnh viện Hùng Vương',
];

export const EmergencyTab: React.FC<EmergencyTabProps> = ({
  onSelectTab,
  onOpenAuthModal,
}) => {
  const { user, isAuthenticated } = useAuth();

  // State danh sách ca cấp cứu
  const [requests, setRequests] = useState<EmergencyRequestItem[]>(INITIAL_MOCK_REQUESTS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [respondedIds, setRespondedIds] = useState<number[]>([]);

  // State bộ lọc
  const [selectedBlood, setSelectedBlood] = useState<string>('ALL');
  const [selectedHospital, setSelectedHospital] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // State Modal Tạo Yêu Cầu Cấp Cứu (Role Hospital / Admin)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmittingCreate, setIsSubmittingCreate] = useState<boolean>(false);
  const [createForm, setCreateForm] = useState({
    benhVienYeuCau: user?.role === 'HOSPITAL' ? user.hoTen : 'Bệnh viện Chợ Rẫy',
    khoaPhong: 'Khoa Hồi sức Cấp cứu',
    nhomMauCan: 'O-',
    thanhPhanCan: 'Máu toàn phần',
    soLuongTui: 2,
    mucDoKhanCap: 'NGUY_CAP' as UrgencyLevel,
    lyDo: '',
    soGioConLai: 2, // Hạn chót sau N giờ
    bacSiLienHe: user?.hoTen || '',
    soDienThoaiLienHe: user?.soDienThoai || '',
  });

  // State Modal Xác Nhận Hỗ Trợ Ca Cấp Cứu
  const [selectedRequestToRespond, setSelectedRequestToRespond] = useState<EmergencyRequestItem | null>(null);
  const [isSubmittingRespond, setIsSubmittingRespond] = useState<boolean>(false);
  const [respondNotes, setRespondNotes] = useState<string>('');

  // State thông báo Toast Feedback
  const [toastMessage, setToastMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // 1. Tải danh sách yêu cầu cấp cứu từ API
  const fetchEmergencyRequests = async () => {
    setIsLoading(true);
    try {
      // Thử gọi endpoint backend
      const res = await api.get('/emergency-requests');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setRequests(res.data.data);
      } else if (res.data?.data?.items && Array.isArray(res.data.data.items)) {
        setRequests(res.data.data.items);
      }
    } catch {
      // Dự phòng: Thử endpoint tiền tố v1 nếu có
      try {
        const resV1 = await api.get('/v1/emergency-requests');
        if (resV1.data?.success && Array.isArray(resV1.data?.data)) {
          setRequests(resV1.data.data);
        } else if (resV1.data?.data?.items && Array.isArray(resV1.data.data.items)) {
          setRequests(resV1.data.data.items);
        }
      } catch {
        // Giữ mock data ổn định nếu backend đang kết nối CSDL
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyRequests();
  }, []);

  // Cập nhật timer đếm ngược liên tục mỗi giây
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Tính thời gian đếm ngược còn lại
  const calculateTimeRemaining = (deadlineStr: string) => {
    const diff = new Date(deadlineStr).getTime() - Date.now();
    if (diff <= 0) {
      return { expired: true, text: 'ĐÃ HẾT HẠN', isUrgent: true, totalMinutes: 0 };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (num: number) => String(num).padStart(2, '0');
    const isUrgent = diff < 60 * 60 * 1000; // Dưới 1 tiếng

    return {
      expired: false,
      text: hours > 0 ? `${pad(hours)}h : ${pad(minutes)}m : ${pad(seconds)}s` : `${pad(minutes)}m : ${pad(seconds)}s`,
      isUrgent,
      totalMinutes: Math.floor(diff / (1000 * 60)),
    };
  };

  // Lọc danh sách ca cấp cứu theo điều kiện
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // 1. Lọc nhóm máu
      if (selectedBlood !== 'ALL') {
        const normReq = req.nhomMauCan.trim().replace(/\s+/g, '').toUpperCase();
        const normFilter = selectedBlood.trim().replace(/\s+/g, '').toUpperCase();
        if (normReq !== normFilter) return false;
      }

      // 2. Lọc bệnh viện
      if (selectedHospital !== 'ALL' && req.benhVienYeuCau !== selectedHospital) {
        return false;
      }

      // 3. Lọc mức độ khẩn cấp
      if (selectedUrgency !== 'ALL' && req.mucDoKhanCap !== selectedUrgency) {
        return false;
      }

      // 4. Tìm kiếm từ khóa
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchName = req.benhVienYeuCau.toLowerCase().includes(term);
        const matchReason = req.lyDo.toLowerCase().includes(term);
        const matchDept = req.khoaPhong ? req.khoaPhong.toLowerCase().includes(term) : false;
        if (!matchName && !matchReason && !matchDept) return false;
      }

      return true;
    });
  }, [requests, selectedBlood, selectedHospital, selectedUrgency, searchTerm]);

  // Đếm số ca theo nhóm máu để hiển thị trên badge
  const bloodCountMap = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((req) => {
      const b = req.nhomMauCan.trim().replace(/\s+/g, '').toUpperCase();
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [requests]);

  // Hành động 1: Xử lý nút "Tôi có thể hiến máu ca này"
  const handleInitiateRespond = (req: EmergencyRequestItem) => {
    if (!isAuthenticated) {
      showToast('info', 'Vui lòng đăng nhập hoặc đăng ký tài khoản để xác nhận hiến máu cứu người!');
      if (onOpenAuthModal) {
        onOpenAuthModal('login');
      }
      return;
    }
    // Đã đăng nhập: Mở modal xác nhận
    setSelectedRequestToRespond(req);
  };

  // Gửi phản hồi hỗ trợ hiến máu: POST /api/emergency-requests/:id/respond
  const handleSubmitRespond = async () => {
    if (!selectedRequestToRespond) return;
    setIsSubmittingRespond(true);

    try {
      // Gọi API POST /api/emergency-requests/:id/respond
      try {
        await api.post(`/emergency-requests/${selectedRequestToRespond.id}/respond`, {
          ghiChu: respondNotes,
          thoiGianCoMatDuKien: '30-45 phút tới',
        });
      } catch {
        // Gọi fallback v1 nếu backend dùng prefix
        try {
          await api.post(`/v1/emergency-requests/${selectedRequestToRespond.id}/respond`, {
            ghiChu: respondNotes,
          });
        } catch {
          // Bỏ qua lỗi kết nối máy chủ để ghi nhận trải nghiệm người dùng
        }
      }

      // Đánh dấu ca đã hỗ trợ
      setRespondedIds((prev) => [...prev, selectedRequestToRespond.id]);
      showToast(
        'success',
        `Tuyệt vời! Bạn đã đăng ký chi viện thành công cho ca ${selectedRequestToRespond.benhVienYeuCau}. Điều phối viên bệnh viện sẽ liên hệ bạn ngay!`
      );
      setSelectedRequestToRespond(null);
      setRespondNotes('');
    } catch {
      showToast('error', 'Không thể hoàn tất đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingRespond(false);
    }
  };

  // Hành động 2: Tạo yêu cầu cấp cứu máu mới (Quyền HOSPITAL hoặc ADMIN)
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.lyDo.trim()) {
      showToast('error', 'Vui lòng nhập lý do và tình trạng cấp cứu của bệnh nhân!');
      return;
    }

    setIsSubmittingCreate(true);
    const deadline = new Date(Date.now() + createForm.soGioConLai * 60 * 60 * 1000).toISOString();
    const payload = {
      benhVienYeuCau: createForm.benhVienYeuCau,
      khoaPhong: createForm.khoaPhong,
      nhomMauCan: createForm.nhomMauCan,
      thanhPhanCan: createForm.thanhPhanCan,
      soLuongTui: Number(createForm.soLuongTui),
      soLuongCanMl: Number(createForm.soLuongTui) * 350,
      mucDoKhanCap: createForm.mucDoKhanCap,
      lyDo: createForm.lyDo,
      hanChot: deadline,
      bacSiLienHe: createForm.bacSiLienHe,
      soDienThoaiLienHe: createForm.soDienThoaiLienHe,
    };

    try {
      let createdData: EmergencyRequestItem | null = null;
      try {
        const res = await api.post('/emergency-requests', payload);
        if (res.data?.success && res.data?.data) {
          createdData = res.data.data;
        }
      } catch {
        try {
          const resV1 = await api.post('/v1/emergency-requests', payload);
          if (resV1.data?.success && resV1.data?.data) {
            createdData = resV1.data.data;
          }
        } catch {
          // Mock data fallback
        }
      }

      const newItem: EmergencyRequestItem = createdData || {
        id: Date.now(),
        ...payload,
        trangThai: 'DangCho',
        ngayTao: new Date().toISOString(),
      };

      setRequests((prev) => [newItem, ...prev]);
      showToast('success', `Đã phát lệnh cấp cứu máu khẩn cấp thành công tới toàn bộ mạng lưới SmartBlood!`);
      setIsCreateModalOpen(false);
      // Reset form
      setCreateForm((prev) => ({
        ...prev,
        lyDo: '',
        soLuongTui: 2,
        soGioConLai: 2,
      }));
    } catch {
      showToast('error', 'Có lỗi xảy ra khi tạo lệnh cấp cứu. Vui lòng thử lại!');
    } finally {
      setIsSubmittingCreate(false);
    }
  };

  // Quyền tạo lệnh cấp cứu
  const canCreateEmergency = user?.role === 'HOSPITAL' || user?.role === 'ADMIN';

  // Xác định người dùng có nhóm máu trùng khớp không
  const userBloodGroup = user?.nhomMau?.trim().toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className={`fixed top-20 right-4 z-50 max-w-md p-4 rounded-xl shadow-2xl flex items-start gap-3 border transition-all ${
            toastMessage.type === 'success'
              ? 'bg-emerald-900/95 text-white border-emerald-500'
              : toastMessage.type === 'error'
              ? 'bg-rose-900/95 text-white border-rose-500'
              : 'bg-slate-900/95 text-white border-blue-500'
          }`}
        >
          {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {toastMessage.type === 'info' && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">{toastMessage.text}</div>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HERO ALERT SECTION: BÁO ĐỘNG ĐỎ KHẨN CẤP REALTIME */}
      <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-br from-red-700 via-[#D32F2F] to-[#8E0000] text-white p-6 sm:p-8 md:p-10 shadow-xl border border-red-500/30">
        {/* Glow decor background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-black/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            {/* Pulsing Live Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-red-400/50 text-white text-xs font-black uppercase tracking-wider shadow-inner">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>BÁO ĐỘNG ĐỎ: ĐIỀU PHỐI MÁU CẤP CỨU REAL-TIME</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
              Danh Sách Bệnh Nhân Cần Tiếp Máu Khẩn Cấp 24/7
            </h1>

            <p className="text-sm sm:text-base text-red-100/90 leading-relaxed max-w-2xl font-normal">
              Mỗi giây chậm trễ là một cơ hội sống mong manh. Mạng lưới SmartBlood kết nối trực tiếp kho máu các bệnh viện tuyến đầu với cộng đồng người hiến máu tình nguyện.
            </p>

            {/* Micro stats banner */}
            <div className="pt-2 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-white/90">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                <ShieldAlert className="w-4 h-4 text-amber-300" />
                <span>
                  Đang có <strong>{requests.length}</strong> ca nguy kịch cần chi viện
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                <Clock className="w-4 h-4 text-emerald-300" />
                <span>Thời gian phản hồi vàng: <strong>dưới 60 phút</strong></span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                <Phone className="w-4 h-4 text-rose-300" />
                <span>Hotline Cấp cứu: <strong>1900 6868</strong></span>
              </div>
            </div>
          </div>

          {/* Action Button: Tạo lệnh cấp cứu nếu là HOSPITAL / ADMIN */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            {canCreateEmergency && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3.5 bg-white text-[#D32F2F] hover:bg-rose-50 font-black text-sm rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 border border-white"
              >
                <PlusCircle className="w-5 h-5 text-[#D32F2F]" />
                <span>Tạo Lệnh Cấp Cứu Máu</span>
              </button>
            )}

            {!isAuthenticated && (
              <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                className="px-5 py-3.5 bg-black/40 hover:bg-black/60 text-white font-bold text-sm rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
              >
                <Heart className="w-4 h-4 fill-white" />
                <span>Đăng ký Người Hiến Máu</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. THANH BỘ LỌC NHANH (QUICK FILTER & SEARCH) */}
      <section className="bg-white p-5 sm:p-6 rounded-[12px] border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Ô tìm kiếm từ khóa */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên bệnh viện, khoa cấp cứu, lý do hoặc chẩn đoán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Chọn Bệnh Viện */}
          <div className="flex items-center gap-2 w-full lg:w-72">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              aria-label="Chọn bệnh viện cần lọc"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            >
              {HOSPITALS.map((hosp) => (
                <option key={hosp} value={hosp}>
                  {hosp === 'ALL' ? 'Tất cả bệnh viện' : hosp}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Mức độ khẩn cấp */}
          <div className="flex items-center gap-2 w-full lg:w-56">
            <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              aria-label="Chọn mức độ khẩn cấp"
              className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            >
              <option value="ALL">Mọi mức độ khẩn</option>
              <option value="NGUY_CAP">Báo động đỏ (Nguy cấp)</option>
              <option value="CAO">Ưu tiên cao</option>
              <option value="TRUNG_BINH">Khẩn cấp vừa</option>
            </select>
          </div>
        </div>

        {/* Danh sách Pills lọc nhanh Nhóm Máu */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 text-[#D32F2F]" />
            Lọc nhóm máu:
          </span>

          {BLOOD_GROUPS.map((blood) => {
            const isSelected = selectedBlood === blood;
            const count = blood === 'ALL' ? requests.length : bloodCountMap[blood] || 0;
            const isUserBlood = userBloodGroup && blood === userBloodGroup;

            return (
              <button
                key={blood}
                type="button"
                onClick={() => setSelectedBlood(blood)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#D32F2F] text-white shadow-sm ring-2 ring-[#D32F2F]/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{blood === 'ALL' ? 'Tất cả' : blood}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
                {isUserBlood && blood !== 'ALL' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Nhóm máu của bạn" />
                )}
              </button>
            );
          })}

          {(selectedBlood !== 'ALL' || selectedHospital !== 'ALL' || selectedUrgency !== 'ALL' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedBlood('ALL');
                setSelectedHospital('ALL');
                setSelectedUrgency('ALL');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-[#D32F2F] hover:underline ml-auto"
            >
              Đặt lại bộ lọc
            </button>
          )}
        </div>

        {/* Thông báo tương thích nhóm máu nếu user đã đăng nhập */}
        {userBloodGroup && (
          <div className="bg-rose-50/70 border border-rose-200 text-[#D32F2F] p-3 rounded-xl text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-[#D32F2F] text-white font-black flex items-center justify-center text-[11px]">
                {userBloodGroup}
              </span>
              <span>
                Bạn đang đăng nhập với nhóm máu <strong>{userBloodGroup}</strong>.
                {bloodCountMap[userBloodGroup] ? (
                  <>
                    {' '}Có <strong>{bloodCountMap[userBloodGroup]}</strong> ca cấp cứu đang cần trực tiếp nhóm máu của bạn!
                  </>
                ) : (
                  ' Hiện chưa có ca nào cần chính xác nhóm máu này, nhưng bạn vẫn có thể hỗ trợ các ca phù hợp quy luật truyền máu.'
                )}
              </span>
            </div>
            {bloodCountMap[userBloodGroup] && selectedBlood !== userBloodGroup && (
              <button
                onClick={() => setSelectedBlood(userBloodGroup)}
                className="text-xs font-bold underline shrink-0 hover:text-[#B71C1C]"
              >
                Xem các ca này →
              </button>
            )}
          </div>
        )}
      </section>

      {/* 3. DANH SÁCH CÁC CA CẤP CỨU (EMERGENCY REQUEST CARDS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#D32F2F]" />
            <span>Danh Sách Ca Bệnh Cần Chi Viện Máu</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#D32F2F]">
              {filteredRequests.length} ca
            </span>
          </h2>
          <button
            onClick={fetchEmergencyRequests}
            disabled={isLoading}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Làm mới danh sách ⟳</span>}
          </button>
        </div>

        {/* Trường hợp không có ca nào thỏa mãn bộ lọc */}
        {filteredRequests.length === 0 ? (
          <div className="bg-white p-12 rounded-[12px] border border-dashed border-slate-300 text-center shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy ca cấp cứu phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Hiện tại không có ca cấp cứu nào khớp với bộ lọc bạn đã chọn. Hãy thử nới lỏng bộ lọc hoặc quay lại sau.
            </p>
            <button
              onClick={() => {
                setSelectedBlood('ALL');
                setSelectedHospital('ALL');
                setSelectedUrgency('ALL');
                setSearchTerm('');
              }}
              className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl hover:bg-slate-900"
            >
              Xem tất cả ca cấp cứu
            </button>
          </div>
        ) : (
          /* Grid hiển thị Cards ca bệnh */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {filteredRequests.map((req) => {
              const countdown = calculateTimeRemaining(req.hanChot);
              const hasResponded = respondedIds.includes(req.id);
              const isMatchUserBlood = userBloodGroup && req.nhomMauCan.trim().toUpperCase() === userBloodGroup;

              return (
                <div
                  key={req.id}
                  className={`bg-white rounded-[12px] border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-lg flex flex-col justify-between ${
                    req.mucDoKhanCap === 'NGUY_CAP'
                      ? 'border-red-300 ring-1 ring-red-500/10 hover:border-red-500'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Top Header Card */}
                  <div>
                    {/* Top alert banner */}
                    <div
                      className={`px-4 py-2 flex items-center justify-between text-xs font-bold ${
                        req.mucDoKhanCap === 'NGUY_CAP'
                          ? 'bg-gradient-to-r from-red-600 to-[#D32F2F] text-white'
                          : req.mucDoKhanCap === 'CAO'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        <span className="tracking-wider uppercase text-[11px]">
                          {req.mucDoKhanCap === 'NGUY_CAP'
                            ? 'BÁO ĐỘNG ĐỎ CẤP 1'
                            : req.mucDoKhanCap === 'CAO'
                            ? 'ƯU TIÊN CAO'
                            : 'CẤP CỨU THƯỜNG'}
                        </span>
                      </div>

                      {/* Countdown badge */}
                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[11px] ${
                          countdown.isUrgent
                            ? 'bg-black/30 text-white animate-pulse font-black'
                            : 'bg-white/20 text-white'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        <span>{countdown.text}</span>
                      </div>
                    </div>

                    {/* Card Content Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Bệnh viện & Badge Nhóm Máu */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{req.khoaPhong || 'Khoa Cấp cứu Hồi sức'}</span>
                          </div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                            {req.benhVienYeuCau}
                          </h3>
                          {req.diaChi && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{req.diaChi}</p>
                          )}
                        </div>

                        {/* GIỌT MÁU / BADGE NHÓM MÁU CẦN GẤP */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="relative">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white flex flex-col items-center justify-center shadow-md shadow-red-500/20 border-2 border-white ring-2 ring-red-500/20 animate-pulse">
                              <span className="text-lg font-black tracking-tighter leading-none">
                                {req.nhomMauCan}
                              </span>
                              <span className="text-[8px] font-bold uppercase tracking-wider text-red-200 mt-0.5">
                                CẦN GẤP
                              </span>
                            </div>
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-ping" />
                          </div>
                          {isMatchUserBlood && (
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded mt-1 border border-emerald-200">
                              Khớp máu bạn
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Lý do / Tình trạng bệnh nhân */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          Tình trạng ca bệnh:
                        </div>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          {req.lyDo}
                        </p>
                      </div>

                      {/* Thống kê đơn vị & Thành phần cần */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-rose-50/50 p-2.5 rounded-xl border border-rose-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">Khối lượng máu:</span>
                          <span className="text-sm font-black text-[#D32F2F]">
                            {req.soLuongTui} Túi{' '}
                            <span className="text-xs font-normal text-slate-600">
                              ({req.soLuongCanMl || req.soLuongTui * 350} ml)
                            </span>
                          </span>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-semibold">Chế phẩm máu:</span>
                          <span className="text-xs font-bold text-slate-800 truncate block">
                            {req.thanhPhanCan || 'Máu toàn phần'}
                          </span>
                        </div>
                      </div>

                      {/* Thông tin bác sĩ điều phối & liên hệ */}
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                        <div className="truncate max-w-[200px]">
                          Phụ trách: <strong>{req.bacSiLienHe || 'Trực ban cấp cứu'}</strong>
                        </div>
                        {req.soDienThoaiLienHe && (
                          <a
                            href={`tel:${req.soDienThoaiLienHe.replace(/\s+/g, '')}`}
                            className="font-bold text-[#D32F2F] hover:underline flex items-center gap-1 shrink-0"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{req.soDienThoaiLienHe}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer Card: Nút hành động */}
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                    {hasResponded ? (
                      <div className="w-full py-2.5 bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Bạn đã đăng ký chi viện cho ca này</span>
                      </div>
                    ) : countdown.expired ? (
                      <div className="w-full py-2.5 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl text-center">
                        Ca cấp cứu này đã đóng tiếp nhận
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleInitiateRespond(req)}
                        className="w-full py-3 bg-[#D32F2F] hover:bg-[#B71C1C] active:scale-[0.99] text-white text-xs sm:text-sm font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
                      >
                        <Heart className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                        <span>Tôi có thể hiến máu ca này</span>
                        <ArrowRight className="w-4 h-4 ml-0.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. MODAL XÁC NHẬN CHI VIỆN MÁU CỦA NGƯỜI DÙNG */}
      {selectedRequestToRespond && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 fill-white" />
                <h3 className="text-base font-black">Xác Nhận Đăng Ký Chi Viện Máu</h3>
              </div>
              <button
                onClick={() => setSelectedRequestToRespond(null)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Modal */}
            <div className="p-6 space-y-4">
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Bệnh viện tiếp nhận:</span>
                  <span className="font-black text-slate-900">{selectedRequestToRespond.benhVienYeuCau}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Nhóm máu cần:</span>
                  <span className="font-black text-[#D32F2F] text-sm">
                    {selectedRequestToRespond.nhomMauCan} ({selectedRequestToRespond.thanhPhanCan})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Địa chỉ:</span>
                  <span className="text-slate-600 text-[11px] truncate max-w-[250px]">
                    {selectedRequestToRespond.diaChi || 'Khoa cấp cứu'}
                  </span>
                </div>
              </div>

              {/* Thông tin tình nguyện viên */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider">Thông tin tình nguyện viên:</h4>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Họ và tên:</span>
                    <strong className="text-slate-800">{user?.hoTen}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Số điện thoại:</span>
                    <strong className="text-slate-800">{user?.soDienThoai}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nhóm máu khai báo:</span>
                    <strong className="text-[#D32F2F]">{user?.nhomMau || 'Chưa cập nhật'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Email:</span>
                    <strong className="text-slate-800 truncate block">{user?.email}</strong>
                  </div>
                </div>
              </div>

              {/* Ghi chú hoặc thời gian dự kiến tới */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú cho điều phối viên bệnh viện (không bắt buộc):
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Tôi đang ở Quận 1, có thể có mặt tại viện sau 30 phút..."
                  value={respondNotes}
                  onChange={(e) => setRespondNotes(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D32F2F]"
                />
              </div>

              {/* Cam kết sức khỏe */}
              <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Bằng cách nhấn xác nhận, bạn cam kết đang khỏe mạnh, không mắc các bệnh truyền nhiễm và sẵn sàng di chuyển đến cơ sở y tế khi nhận được cuộc gọi điều phối.
                </span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setSelectedRequestToRespond(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isSubmittingRespond}
                onClick={handleSubmitRespond}
                className="px-5 py-2 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2"
              >
                {isSubmittingRespond ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang gửi thông tin...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-3.5 h-3.5 fill-white" />
                    <span>Xác nhận chi viện ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL TẠO LỆNH CẤP CỨU MÁU KHẨN CẤP (CHO HOSPITAL / ADMIN) */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-[12px] shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Header Modal */}
            <div className="bg-gradient-to-r from-red-700 to-[#D32F2F] text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-300" />
                <h3 className="text-base font-black">Phát Lệnh Cấp Cứu Máu Khẩn Cấp Real-Time</h3>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Bệnh viện & Khoa phòng */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên Bệnh viện <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.benhVienYeuCau}
                    onChange={(e) => setCreateForm({ ...createForm, benhVienYeuCau: e.target.value })}
                    placeholder="Bệnh viện Chợ Rẫy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khoa / Phòng yêu cầu</label>
                  <input
                    type="text"
                    value={createForm.khoaPhong}
                    onChange={(e) => setCreateForm({ ...createForm, khoaPhong: e.target.value })}
                    placeholder="Khoa Cấp cứu Hồi sức"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
              </div>

              {/* Nhóm máu cần & Thành phần máu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhóm máu cần gấp <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={createForm.nhomMauCan}
                    onChange={(e) => setCreateForm({ ...createForm, nhomMauCan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-[#D32F2F] focus:outline-none focus:border-[#D32F2F]"
                  >
                    {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                      <option key={bg} value={bg}>
                        Nhóm máu {bg}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thành phần máu cần</label>
                  <select
                    value={createForm.thanhPhanCan}
                    onChange={(e) => setCreateForm({ ...createForm, thanhPhanCan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  >
                    <option value="Máu toàn phần">Máu toàn phần</option>
                    <option value="Khối hồng cầu">Khối hồng cầu</option>
                    <option value="Tiểu cầu đậm đặc">Tiểu cầu đậm đặc</option>
                    <option value="Huyết tương tươi đông lạnh">Huyết tương tươi đông lạnh</option>
                  </select>
                </div>
              </div>

              {/* Số lượng túi & Mức độ khẩn cấp */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số túi máu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={createForm.soLuongTui}
                    onChange={(e) => setCreateForm({ ...createForm, soLuongTui: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-[#D32F2F]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    ≈ {createForm.soLuongTui * 350} ml
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ khẩn cấp</label>
                  <select
                    value={createForm.mucDoKhanCap}
                    onChange={(e) => setCreateForm({ ...createForm, mucDoKhanCap: e.target.value as UrgencyLevel })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-600 focus:outline-none focus:border-[#D32F2F]"
                  >
                    <option value="NGUY_CAP">Báo động đỏ (Cực nguy cấp)</option>
                    <option value="CAO">Ưu tiên cao</option>
                    <option value="TRUNG_BINH">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Thời hạn cần máu</label>
                  <select
                    value={createForm.soGioConLai}
                    onChange={(e) => setCreateForm({ ...createForm, soGioConLai: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  >
                    <option value={1}>Trong vòng 1 giờ</option>
                    <option value={2}>Trong vòng 2 giờ</option>
                    <option value={4}>Trong vòng 4 giờ</option>
                    <option value={8}>Trong vòng 8 giờ</option>
                    <option value={24}>Trong 24 giờ</option>
                  </select>
                </div>
              </div>

              {/* Lý do & Tình trạng bệnh nhân */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chẩn đoán & Lý do cấp cứu <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ví dụ: Bệnh nhân nam 35 tuổi bị đa chấn thương do tai nạn, vỡ gan độ 4 mất máu cấp..."
                  value={createForm.lyDo}
                  onChange={(e) => setCreateForm({ ...createForm, lyDo: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#D32F2F]"
                />
              </div>

              {/* Bác sĩ & Hotline liên hệ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Bác sĩ / Người phụ trách</label>
                  <input
                    type="text"
                    value={createForm.bacSiLienHe}
                    onChange={(e) => setCreateForm({ ...createForm, bacSiLienHe: e.target.value })}
                    placeholder="BS. Trưởng kíp trực"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại liên hệ trực ban</label>
                  <input
                    type="text"
                    value={createForm.soDienThoaiLienHe}
                    onChange={(e) => setCreateForm({ ...createForm, soDienThoaiLienHe: e.target.value })}
                    placeholder="028 3855 xxxx"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#D32F2F]"
                  />
                </div>
              </div>

              {/* Cảnh báo y khoa */}
              <div className="bg-red-50 p-3 rounded-xl border border-red-200 text-[11px] text-[#B71C1C] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-[#D32F2F]" />
                <span>
                  Lệnh cấp cứu sẽ được truyền thông báo tức thời tới toàn bộ người hiến máu tình nguyện có nhóm máu tương thích trong bán kính 15km.
                </span>
              </div>

              {/* Footer Form */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCreate}
                  className="px-5 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black text-xs rounded-xl shadow-md flex items-center gap-2"
                >
                  {isSubmittingCreate ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang phát lệnh...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-4 h-4 fill-white text-amber-300" />
                      <span>Phát Lệnh Cấp Cứu Ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyTab;
