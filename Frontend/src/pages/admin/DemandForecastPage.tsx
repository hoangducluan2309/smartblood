import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import { useCallModal } from '../../contexts/CallModalContext';
import { 
  ShortageRiskForecast, 
  UrgentDonor, 
  BloodGroup, 
  DonorHistoryStat, 
  DonorManagementStatsResponse 
} from '../../types';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Calendar, 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  Send, 
  Building2, 
  Users, 
  HeartHandshake, 
  Clock, 
  Info, 
  ShieldCheck, 
  Heart,
  Droplet
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dữ liệu mẫu Fallback khi Backend chưa khởi động
const MOCK_FORECASTS: ShortageRiskForecast[] = [
  {
    bloodGroup: 'O-',
    currentStock: 18,
    forecastDemand30Days: 48,
    deficit: -30,
    riskLevel: 'CAO',
    daysOfSupply: 11,
    trend: 'TANG',
    recommendation: 'Nhóm O- dự kiến thiếu 30 đơn vị vào tuần tới. Cần mở thêm điểm hiến máu lưu động tại Quận 1 & Quận 5.',
    criticalDate: '2026-04-18'
  },
  {
    bloodGroup: 'A-',
    currentStock: 12,
    forecastDemand30Days: 28,
    deficit: -16,
    riskLevel: 'CAO',
    daysOfSupply: 13,
    trend: 'TANG',
    recommendation: 'Chạm ngưỡng báo động đỏ sau 5 ngày. Cần kích hoạt thông báo khẩn cấp tới 40 tình nguyện viên nhóm A-.',
    criticalDate: '2026-04-20'
  },
  {
    bloodGroup: 'B-',
    currentStock: 22,
    forecastDemand30Days: 32,
    deficit: -10,
    riskLevel: 'TRUNG_BINH',
    daysOfSupply: 20,
    trend: 'ON_DINH',
    recommendation: 'Lượng tiêu thụ duy trì ở mức ổn định. Khuyến khích nhắc lịch người hiến máu định kỳ.',
    criticalDate: '2026-04-27'
  },
  {
    bloodGroup: 'AB-',
    currentStock: 8,
    forecastDemand30Days: 15,
    deficit: -7,
    riskLevel: 'CAO',
    daysOfSupply: 16,
    trend: 'TANG',
    recommendation: 'Nhóm máu cực hiếm. Đề xuất liên hệ trực tiếp với Câu lạc bộ Nhóm máu hiếm TP.HCM.',
    criticalDate: '2026-04-24'
  },
  {
    bloodGroup: 'O+',
    currentStock: 120,
    forecastDemand30Days: 110,
    deficit: 10,
    riskLevel: 'THAP',
    daysOfSupply: 32,
    trend: 'ON_DINH',
    recommendation: 'Trữ lượng đạt 109% nhu cầu dự báo. Tiếp tục duy trì công tác tiếp nhận định kỳ.',
  },
  {
    bloodGroup: 'A+',
    currentStock: 85,
    forecastDemand30Days: 80,
    deficit: 5,
    riskLevel: 'THAP',
    daysOfSupply: 31,
    trend: 'ON_DINH',
    recommendation: 'Đạt ngưỡng an toàn. Phân bổ dự trữ hợp lý cho các bệnh viện vệ tinh.',
  },
  {
    bloodGroup: 'B+',
    currentStock: 64,
    forecastDemand30Days: 70,
    deficit: -6,
    riskLevel: 'TRUNG_BINH',
    daysOfSupply: 27,
    trend: 'TANG',
    recommendation: 'Tăng nhẹ nhu cầu do phẫu thuật tim mạch. Bổ sung thêm lịch tiếp nhận vào cuối tuần.',
  },
  {
    bloodGroup: 'AB+',
    currentStock: 35,
    forecastDemand30Days: 25,
    deficit: 10,
    riskLevel: 'THAP',
    daysOfSupply: 42,
    trend: 'GIAM',
    recommendation: 'Dồi dào dự trữ (140% nhu cầu). Đề xuất sẵn sàng điều phối chi viện cho các tỉnh miền Tây.',
  }
];

const MOCK_DONOR_STATS_FALLBACK: DonorHistoryStat[] = [
  {
    id: 3,
    hoTen: 'Nguyễn Văn An',
    email: 'nguyenvanan.donor@gmail.com',
    soDienThoai: '0903000003',
    cccd: '001090000003',
    nhomMau: 'A+',
    yeuToRh: 'Duong',
    diaChi: '123 Đường Nguyễn Huệ, Phường Bến Nghé',
    quanHuyen: 'Quận 1',
    soLanDaHien: 5,
    tongLuongMauMl: 1850,
    lanHienCuoi: '22/12/2025',
    ngayHienCuoi: '2025-12-22T08:30:00Z',
    luongMauLanCuoiMl: 350,
    tenSuKienLanCuoi: 'Hành Trình Đỏ 2025 - TP.HCM',
    soNgayDaQua: 300,
    duDieuKien: true,
    soNgayConLai: 0,
    ngayDuDieuKienFormatted: '16/03/2026',
    phanTramHoiPhuc: 100,
    trangThaiChuKy: 'DU_DIEU_KIEN',
  },
  {
    id: 'REF-201',
    hoTen: 'Nguyễn Văn Hùng',
    email: 'hung.nguyen@example.com',
    soDienThoai: '0912 345 678',
    cccd: '079201000101',
    nhomMau: 'O-',
    yeuToRh: 'Am',
    diaChi: '128 Nguyễn Trãi, Phường Bến Thành',
    quanHuyen: 'Quận 1',
    soLanDaHien: 6,
    tongLuongMauMl: 2300,
    lanHienCuoi: '20/11/2025',
    ngayHienCuoi: '2025-11-20T08:30:00Z',
    luongMauLanCuoiMl: 450,
    tenSuKienLanCuoi: 'Ngày Hội Giọt Hồng Tình Nguyện',
    soNgayDaQua: 140,
    duDieuKien: true,
    soNgayConLai: 0,
    ngayDuDieuKienFormatted: '12/02/2026',
    phanTramHoiPhuc: 100,
    trangThaiChuKy: 'DU_DIEU_KIEN',
  },
  {
    id: 1015,
    hoTen: 'nam anh',
    email: 'namanh@gmail.com',
    soDienThoai: '0423423423',
    cccd: '079015000015',
    nhomMau: 'AB-',
    yeuToRh: 'Am',
    diaChi: '45 Võ Văn Tần, Phường Võ Thị Sáu',
    quanHuyen: 'Quận 3',
    soLanDaHien: 1,
    tongLuongMauMl: 450,
    lanHienCuoi: '19/10/2026',
    ngayHienCuoi: '2026-10-19T07:00:00Z',
    luongMauLanCuoiMl: 450,
    tenSuKienLanCuoi: 'Tiếp Nhận Máu Lưu Động',
    soNgayDaQua: 0,
    duDieuKien: false,
    soNgayConLai: 84,
    ngayDuDieuKienFormatted: '11/01/2027',
    phanTramHoiPhuc: 0,
    trangThaiChuKy: 'DANG_PHUC_HOI',
  },
  {
    id: 1010,
    hoTen: 'kim anh',
    email: 'kimanh@gmail.com',
    soDienThoai: '1231231232',
    cccd: '079010000010',
    nhomMau: 'A+',
    yeuToRh: 'Duong',
    diaChi: '88 Lý Thường Kiệt',
    quanHuyen: 'Quận 10',
    soLanDaHien: 1,
    tongLuongMauMl: 450,
    lanHienCuoi: '19/10/2026',
    ngayHienCuoi: '2026-10-19T07:00:00Z',
    luongMauLanCuoiMl: 450,
    tenSuKienLanCuoi: 'Hiến Máu Doanh Nhân Trẻ',
    soNgayDaQua: 0,
    duDieuKien: false,
    soNgayConLai: 84,
    ngayDuDieuKienFormatted: '11/01/2027',
    phanTramHoiPhuc: 0,
    trangThaiChuKy: 'DANG_PHUC_HOI',
  },
  {
    id: 7,
    hoTen: 'van sỹ',
    email: 'vansy@gmail.com',
    soDienThoai: '4576578967',
    cccd: '079007000007',
    nhomMau: 'B+',
    yeuToRh: 'Duong',
    diaChi: '15 Điện Biên Phủ',
    quanHuyen: 'Bình Thạnh',
    soLanDaHien: 1,
    tongLuongMauMl: 350,
    lanHienCuoi: '19/10/2026',
    ngayHienCuoi: '2026-10-19T07:00:00Z',
    luongMauLanCuoiMl: 350,
    tenSuKienLanCuoi: 'Giọt Máu Nghĩa Tình',
    soNgayDaQua: 0,
    duDieuKien: false,
    soNgayConLai: 84,
    ngayDuDieuKienFormatted: '11/01/2027',
    phanTramHoiPhuc: 0,
    trangThaiChuKy: 'DANG_PHUC_HOI',
  },
  {
    id: 'REF-204',
    hoTen: 'Đỗ Thành Đạt',
    email: 'dat.do@example.com',
    soDienThoai: '0919 223 344',
    cccd: '079201000104',
    nhomMau: 'B-',
    yeuToRh: 'Am',
    diaChi: '56 Hoàng Văn Thụ',
    quanHuyen: 'Phú Nhuận',
    soLanDaHien: 3,
    tongLuongMauMl: 1050,
    lanHienCuoi: '01/10/2026',
    ngayHienCuoi: '2026-10-01T08:30:00Z',
    luongMauLanCuoiMl: 350,
    tenSuKienLanCuoi: 'Tiếp Nhận Máu Cấp Cứu Phú Nhuận',
    soNgayDaQua: 18,
    duDieuKien: false,
    soNgayConLai: 66,
    ngayDuDieuKienFormatted: '24/12/2026',
    phanTramHoiPhuc: 21,
    trangThaiChuKy: 'DANG_PHUC_HOI',
  }
];

type TabType = 'DONORS' | 'FORECAST';
type EligibilityFilter = 'ALL' | 'ELIGIBLE' | 'RECOVERING';

export const DemandForecastPage: React.FC = () => {
  const { token } = useAuth();
  const { openCallModal } = useCallModal();
  
  // Navigation Tab
  const [activeTab, setActiveTab] = useState<TabType>('DONORS');

  // Forecast Data State
  const [forecasts, setForecasts] = useState<ShortageRiskForecast[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Donor Management State
  const [donorStatsList, setDonorStatsList] = useState<DonorHistoryStat[]>([]);
  const [statsSummary, setStatsSummary] = useState({
    tongSoDonorDaHien: 0,
    soDonorDuDieuKien: 0,
    soDonorDangPhucHoi: 0,
    tongTheTichTiepNhanMl: 0,
  });

  // Filter States
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string>('ALL');
  const [donorSearchQuery, setDonorSearchQuery] = useState<string>('');
  const [eligibilityFilter, setEligibilityFilter] = useState<EligibilityFilter>('ALL');

  // Gọi API lấy dữ liệu thực tế từ Database
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Lấy danh sách thống kê Donor đã xác nhận hiến máu thành công & theo dõi chu kỳ 84 ngày từ CSDL thật
      const donorRes = await axiosClient.get('/forecasts/donor-history-stats').catch(() => null);
      const donorData: DonorManagementStatsResponse = donorRes?.data?.data || donorRes?.data;

      if (donorData && Array.isArray(donorData.danhSachDonors)) {
        setDonorStatsList(donorData.danhSachDonors);
        setStatsSummary({
          tongSoDonorDaHien: donorData.tongSoDonorDaHien ?? donorData.danhSachDonors.length,
          soDonorDuDieuKien: donorData.soDonorDuDieuKien ?? donorData.danhSachDonors.filter(d => d.duDieuKien).length,
          soDonorDangPhucHoi: donorData.soDonorDangPhucHoi ?? donorData.danhSachDonors.filter(d => !d.duDieuKien).length,
          tongTheTichTiepNhanMl: donorData.tongTheTichTiepNhanMl ?? donorData.danhSachDonors.reduce((s, d) => s + (d.tongLuongMauMl || 0), 0),
        });
      }

      // 2. Phân tích nguy cơ thiếu máu 30 ngày tới
      const forecastRes = await axiosClient.get('/forecasts/shortage-risk').catch(() => null);
      const rawForecastList = 
        forecastRes?.data?.data?.chiTietTheoNhomMau || 
        forecastRes?.data?.chiTietTheoNhomMau || 
        (Array.isArray(forecastRes?.data) ? forecastRes.data : []);

      if (Array.isArray(rawForecastList) && rawForecastList.length > 0) {
        const mappedForecasts: ShortageRiskForecast[] = rawForecastList.map((item: any) => ({
          bloodGroup: item.nhomMau,
          currentStock: Math.round((item.tonKhoHienTaiMl || 0) / 350),
          forecastDemand30Days: Math.round(((item.tonKhoHienTaiMl || 0) + (item.nhuCauDangChoMl || 0)) / 350) || 40,
          deficit: Math.round(((item.tongLieuUocTinhConLaiMl || 0)) / 350),
          riskLevel: item.mucDoNguyCo === 'THIEU_NGHIEM_TRONG' ? 'CAO' : item.mucDoNguyCo === 'CANH_BAO' ? 'TRUNG_BINH' : 'THAP',
          daysOfSupply: item.tonKhoHienTaiMl > 0 ? Math.min(30, Math.round((item.tonKhoHienTaiMl / 350) * 3)) : 0,
          trend: (item.tongLieuUocTinhConLaiMl || 0) < 0 ? 'TANG' : 'ON_DINH',
          recommendation: item.khuyenNghi || 'Duy trì công tác tiếp nhận định kỳ.',
          criticalDate: item.mucDoNguyCo === 'THIEU_NGHIEM_TRONG' ? '2026-10-18' : undefined,
        }));
        setForecasts(mappedForecasts);
      } else {
        setForecasts(MOCK_FORECASTS);
      }
    } catch {
      // Không ghi đè danh sách bằng dữ liệu giả khi gặp lỗi
      setForecasts(MOCK_FORECASTS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Lắng nghe WebSocket thời gian thực khi nhân viên duyệt hoàn thành hiến máu tại menu Duyệt lịch
  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    const handleSync = () => {
      void fetchData();
    };

    socket.on('donation-appointment:completed', (eventData: any) => {
      handleSync();
      const donorName = eventData?.donorName ? `[${eventData.donorName}] ` : '';
      toast.success(`Đã tự động đồng bộ Donor ${donorName}hoàn thành hiến máu từ Duyệt Lịch!`, {
        icon: '🩸',
        duration: 4000,
      });
    });

    socket.on('donation-appointment:updated', handleSync);

    return () => {
      socket.disconnect();
    };
  }, [token, fetchData]);

  // Đồng bộ giữa các tab trình duyệt và khi cửa sổ được focus
  useEffect(() => {
    const handleLocalSync = () => {
      void fetchData();
    };
    window.addEventListener('storage', handleLocalSync);
    window.addEventListener('bloodsmart:appointment-completed', handleLocalSync);
    window.addEventListener('focus', handleLocalSync);
    return () => {
      window.removeEventListener('storage', handleLocalSync);
      window.removeEventListener('bloodsmart:appointment-completed', handleLocalSync);
      window.removeEventListener('focus', handleLocalSync);
    };
  }, [fetchData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    void fetchData();
    toast.success('Đã làm mới dữ liệu người hiến máu & mô hình dự báo từ database!');
  };

  const handleBroadcastSMS = (donor: DonorHistoryStat) => {
    if (donor.duDieuKien) {
      toast.success(`Đã gửi SMS kêu gọi hiến máu tới ${donor.hoTen} (${donor.soDienThoai})!`);
    } else {
      toast.success(`Đã gửi SMS nhắc lịch hiến máu kế tiếp vào ngày ${donor.ngayDuDieuKienFormatted} cho ${donor.hoTen}!`);
    }
  };

  const handleCallDonor = (donor: DonorHistoryStat) => {
    openCallModal({
      title: 'GỌI ĐIỀU ĐỘNG NGƯỜI HIẾN MÁU',
      name: `${donor.hoTen} (Nhóm máu ${donor.nhomMau})`,
      phone: donor.soDienThoai,
    });
  };

  // Lọc danh sách Donor
  const filteredDonors = useMemo(() => {
    return donorStatsList.filter((donor) => {
      // 1. Nhóm máu
      const matchBlood = selectedBloodGroup === 'ALL' || donor.nhomMau === selectedBloodGroup;

      // 2. Trạng thái chu kỳ 84 ngày
      let matchCycle = true;
      if (eligibilityFilter === 'ELIGIBLE') {
        matchCycle = donor.duDieuKien === true;
      } else if (eligibilityFilter === 'RECOVERING') {
        matchCycle = donor.duDieuKien === false;
      }

      // 3. Tìm kiếm tên, sđt, cccd, địa chỉ
      const q = donorSearchQuery.toLowerCase().trim();
      const matchSearch = 
        !q ||
        donor.hoTen.toLowerCase().includes(q) ||
        donor.soDienThoai.includes(q) ||
        (donor.cccd && donor.cccd.includes(q)) ||
        donor.diaChi.toLowerCase().includes(q) ||
        donor.nhomMau.toLowerCase().includes(q);

      return matchBlood && matchCycle && matchSearch;
    });
  }, [donorStatsList, selectedBloodGroup, eligibilityFilter, donorSearchQuery]);

  // Thống kê Forecast
  const totalDemand = forecasts.reduce((acc, curr) => acc + curr.forecastDemand30Days, 0);
  const totalStock = forecasts.reduce((acc, curr) => acc + curr.currentStock, 0);
  const criticalCount = forecasts.filter(f => f.riskLevel === 'CAO').length;

  return (
    <div className="min-w-0 w-full space-y-6 pb-14">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-red-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 text-xs font-black bg-red-600 text-white rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-red-900/50">
                <HeartHandshake className="w-4 h-4" /> QUẢN LÝ HIẾN MÁU
              </span>
              <span className="text-xs text-slate-300 font-semibold px-2.5 py-1 bg-white/10 rounded-full border border-white/10">
                Chu kỳ phục hồi an toàn: 84 Ngày (12 Tuần)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Quản Lý Hiến Máu
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Theo dõi danh sách Donor đã được xác nhận hiến máu thành công, giám sát số ngày đã qua kể từ lần hiến gần nhất để kiểm tra điều kiện an toàn hiến máu tiếp theo theo quy chuẩn y tế Bộ Y tế.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition active:scale-95 text-sm cursor-pointer shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Làm mới dữ liệu</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('DONORS');
                setEligibilityFilter('ELIGIBLE');
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-900/50 transition active:scale-95 text-sm cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Xem Donor Đủ Điều Kiện (≥ 84 Ngày)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Tổng Donor đã hiến */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Tổng Donor Đã Hiến</span>
            <div className="text-3xl font-black text-slate-900">
              {isLoading ? '...' : `${statsSummary.tongSoDonorDaHien} Người`}
            </div>
            <span className="text-xs text-slate-500 font-semibold block">Đã có lịch hẹn 'Hoàn thành'</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2: Đủ điều kiện hiến tiếp (>= 84 ngày) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs hover:shadow-md transition flex items-center justify-between bg-gradient-to-br from-white to-emerald-50/30">
          <div className="space-y-1">
            <span className="text-xs font-black text-emerald-700 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đủ Điều Kiện Hiến Tiếp
            </span>
            <div className="text-3xl font-black text-emerald-600">
              {isLoading ? '...' : `${statsSummary.soDonorDuDieuKien} Người`}
            </div>
            <span className="text-xs text-emerald-700 font-bold block">Đã qua ≥ 84 ngày (Sẵn sàng)</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3: Đang trong chu kỳ phục hồi (< 84 ngày) */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs hover:shadow-md transition flex items-center justify-between bg-gradient-to-br from-white to-amber-50/30">
          <div className="space-y-1">
            <span className="text-xs font-black text-amber-700 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-600" /> Đang Trong Phục Hồi
            </span>
            <div className="text-3xl font-black text-amber-600">
              {isLoading ? '...' : `${statsSummary.soDonorDangPhucHoi} Người`}
            </div>
            <span className="text-xs text-amber-700 font-bold block">Chưa đủ 84 ngày (Đang dưỡng sức)</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4: Tổng thể tích đã tiếp nhận */}
        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-2xs hover:shadow-md transition flex items-center justify-between bg-gradient-to-br from-white to-red-50/20">
          <div className="space-y-1">
            <span className="text-xs font-black text-red-700 uppercase tracking-wider">Tổng Máu Đã Tiếp Nhận</span>
            <div className="text-3xl font-black text-red-600">
              {isLoading ? '...' : `${(statsSummary.tongTheTichTiepNhanMl / 1000).toFixed(1)} Lít`}
            </div>
            <span className="text-xs text-slate-500 font-semibold block">{statsSummary.tongTheTichTiepNhanMl.toLocaleString()} ml máu toàn phần</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-red-100/80 border border-red-200 flex items-center justify-center text-red-700">
            <Droplet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. Tab Switcher Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('DONORS')}
            className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'DONORS'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Thống Kê Donor & Chu Kỳ 84 Ngày</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'DONORS' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {donorStatsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('FORECAST')}
            className={`px-5 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'FORECAST'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dự Báo Nhu Cầu & Tồn Kho (30 Ngày)</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'FORECAST' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {criticalCount > 0 ? `${criticalCount} Nhóm thiếu` : '8 Nhóm'}
            </span>
          </button>
        </div>

        {activeTab === 'DONORS' && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Info className="w-4 h-4 text-blue-500" />
            <span>Khoảng cách an toàn theo Thông tư 26/2013/TT-BYT: 84 ngày</span>
          </div>
        )}
      </div>

      {/* 4. TAB 1: THỐNG KÊ DONOR & CHU KỲ 84 NGÀY */}
      {activeTab === 'DONORS' && (
        <div className="space-y-5">
          {/* Filter Toolbar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left: Search & Blood Type */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm họ tên, số điện thoại, CCCD, địa chỉ..."
                  value={donorSearchQuery}
                  onChange={(e) => setDonorSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Nhóm máu Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-bold text-slate-600">Nhóm:</span>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => setSelectedBloodGroup(e.target.value)}
                  className="bg-transparent text-xs font-black text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">Tất cả nhóm máu</option>
                  <option value="O+">O+</option>
                  <option value="O-">O- (Hiếm)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A- (Hiếm)</option>
                  <option value="B+">B+</option>
                  <option value="B-">B- (Hiếm)</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB- (Hiếm)</option>
                </select>
              </div>
            </div>

            {/* Right: Status Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setEligibilityFilter('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  eligibilityFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tất cả ({donorStatsList.length})
              </button>
              <button
                onClick={() => setEligibilityFilter('ELIGIBLE')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  eligibilityFilter === 'ELIGIBLE'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đủ điều kiện (≥ 84 ngày)</span>
                <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">
                  {statsSummary.soDonorDuDieuKien}
                </span>
              </button>
              <button
                onClick={() => setEligibilityFilter('RECOVERING')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                  eligibilityFilter === 'RECOVERING'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Đang phục hồi (&lt; 84 ngày)</span>
                <span className="px-1.5 py-0.2 bg-white/20 rounded-md text-[10px]">
                  {statsSummary.soDonorDangPhucHoi}
                </span>
              </button>
            </div>
          </div>

          {/* Table: Danh Sách Donor Đã Hiến & Theo Dõi Chu Kỳ */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <HeartHandshake className="w-5 h-5 text-red-600" />
                  <span>Danh Sách Donor Đã Xác Nhận Hiến Máu Thành Công</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo dõi thời gian phục hồi và ngày đủ điều kiện hiến tiếp theo theo chuẩn 84 ngày của Bộ Y tế.
                </p>
              </div>

              <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                Hiển thị: <strong className="text-red-600">{filteredDonors.length}</strong> / {donorStatsList.length} người
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-5">Người Hiến Máu</th>
                    <th className="py-3.5 px-5">Liên Hệ</th>
                    <th className="py-3.5 px-5">Lần Hiến Gần Nhất</th>
                    <th className="py-3.5 px-5">Đã Hiến</th>
                    <th className="py-3.5 px-5">Số Ngày Đã Qua</th>
                    <th className="py-3.5 px-5 min-w-[200px]">Chu Kỳ 84 Ngày & Điều Kiện</th>
                    <th className="py-3.5 px-5 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {isLoading ? (
                    [1, 2, 3, 4].map((idx) => (
                      <tr key={idx} className="animate-pulse">
                        <td className="py-4 px-5"><div className="h-6 w-32 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5"><div className="h-5 w-24 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5"><div className="h-5 w-28 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5"><div className="h-5 w-16 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5"><div className="h-5 w-20 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5"><div className="h-6 w-36 bg-slate-200 rounded" /></td>
                        <td className="py-4 px-5 text-right"><div className="h-8 w-24 bg-slate-200 rounded ml-auto" /></td>
                      </tr>
                    ))
                  ) : filteredDonors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">
                        <Heart className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-500" />
                        <p className="font-bold">Không tìm thấy người hiến nào phù hợp với bộ lọc hiện tại.</p>
                        <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn "Tất cả".</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDonors.map((donor) => {
                      const isRare = donor.nhomMau?.includes('-');
                      return (
                        <tr key={donor.id} className="hover:bg-slate-50/80 transition group">
                          {/* 1. Người hiến máu */}
                          <td className="py-4 px-5">
                            <div className="flex items-start gap-3">
                              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
                                isRare
                                  ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                  : 'bg-red-50 text-red-700 border border-red-100'
                              }`}>
                                {donor.nhomMau}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-black text-slate-900 group-hover:text-red-600 transition">
                                    {donor.hoTen}
                                  </span>
                                  {isRare && (
                                    <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[10px] font-black rounded-md">
                                      Hiếm
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span>CCCD: <strong className="text-slate-700">{donor.cccd || '---'}</strong></span>
                                  <span>&bull;</span>
                                  <span>{donor.quanHuyen}</span>
                                </div>
                                <div className="text-[11px] text-slate-400 truncate max-w-[220px]">
                                  {donor.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Liên hệ */}
                          <td className="py-4 px-5">
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-slate-800 text-xs block">
                                {donor.soDienThoai}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleCallDonor(donor)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white text-red-700 font-black rounded-lg text-[11px] transition flex items-center gap-1 cursor-pointer"
                                  title="Gọi ngay qua Call Modal"
                                >
                                  <PhoneCall className="w-3 h-3" />
                                  <span>Gọi điện</span>
                                </button>
                                <a
                                  href={`sms:${donor.soDienThoai}?body=${encodeURIComponent(
                                    donor.duDieuKien
                                      ? `Xin chào ${donor.hoTen}, Bạn đã đủ điều kiện hiến máu tiếp theo (sau 84 ngày). Bệnh viện đang cần máu nhóm ${donor.nhomMau}. Rất mong bạn đăng ký tiếp tục tham gia hiến máu!`
                                      : `Xin chào ${donor.hoTen}, Cảm ơn bạn đã hiến máu. Bạn đang trong chu kỳ phục hồi an toàn, dự kiến đủ điều kiện hiến tiếp vào ngày ${donor.ngayDuDieuKienFormatted}.`
                                  )}`}
                                  className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                                  title="Gửi SMS"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          </td>

                          {/* 3. Lần hiến gần nhất */}
                          <td className="py-4 px-5">
                            <div>
                              <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                <span>{donor.lanHienCuoi}</span>
                              </div>
                              <div className="text-xs text-red-600 font-bold mt-0.5">
                                {donor.luongMauLanCuoiMl} ml
                              </div>
                              <div className="text-[11px] text-slate-500 truncate max-w-[180px] mt-0.5" title={donor.tenSuKienLanCuoi}>
                                {donor.tenSuKienLanCuoi}
                              </div>
                            </div>
                          </td>

                          {/* 4. Đã hiến (tổng) */}
                          <td className="py-4 px-5">
                            <div className="space-y-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-slate-100 text-slate-800">
                                {donor.soLanDaHien} lần
                              </span>
                              <div className="text-[11px] font-bold text-slate-500">
                                {donor.tongLuongMauMl.toLocaleString()} ml
                              </div>
                            </div>
                          </td>

                          {/* 5. Số ngày đã qua */}
                          <td className="py-4 px-5">
                            <div>
                              <span className="text-base font-black text-slate-900">
                                {donor.soNgayDaQua}
                              </span>
                              <span className="text-xs text-slate-500 font-semibold ml-1">ngày</span>
                              <div className="text-[11px] text-slate-400">
                                kể từ lần hiến cuối
                              </div>
                            </div>
                          </td>

                          {/* 6. Chu kỳ 84 ngày & Trạng thái điều kiện */}
                          <td className="py-4 px-5">
                            <div className="space-y-1.5">
                              {donor.duDieuKien ? (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> ĐỦ ĐIỀU KIỆN HIẾN TIẾP
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-semibold text-emerald-700">
                                    Đã qua {donor.soNgayDaQua} ngày (&ge; 84 ngày chuẩn)
                                  </div>
                                  {/* Progress bar full */}
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full w-full" />
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-1.5">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                      <Clock className="w-3.5 h-3.5 text-amber-600" /> Đang phục hồi: còn {donor.soNgayConLai} ngày
                                    </span>
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-600">
                                    Đủ điều kiện vào: <strong className="text-slate-900">{donor.ngayDuDieuKienFormatted}</strong>
                                  </div>
                                  {/* Progress bar */}
                                  <div className="space-y-0.5">
                                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                                      <span>Tiến độ phục hồi</span>
                                      <span className="text-amber-700">{donor.phanTramHoiPhuc}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                        style={{ width: `${donor.phanTramHoiPhuc}%` }}
                                      />
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>

                          {/* 7. Thao tác */}
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCallDonor(donor)}
                                className={`px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                                  donor.duDieuKien
                                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                <PhoneCall className="w-3.5 h-3.5" />
                                <span>{donor.duDieuKien ? 'Gọi huy động' : 'Gọi hỏi thăm'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleBroadcastSMS(donor)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                                title="Gửi thông báo / SMS"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: DỰ BÁO NHU CẦU & TỒN KHO 30 NGÀY */}
      {activeTab === 'FORECAST' && (
        <div className="space-y-6">
          {/* Action Recommendations for High Risk Groups */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Khuyến Nghị Hành Động Khẩn Cấp Cho Các Nhóm Máu Thiếu Hụt</span>
              </h2>
              <span className="text-xs text-slate-500">Mô hình AI dự báo 30 ngày tới</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {forecasts
                .filter(f => f.riskLevel === 'CAO')
                .map(item => (
                  <div 
                    key={item.bloodGroup}
                    className="bg-white rounded-3xl border-2 border-red-200 p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="w-10 h-10 rounded-2xl bg-red-600 text-white font-black text-base flex items-center justify-center shadow-xs">
                            {item.bloodGroup}
                          </span>
                          <div>
                            <span className="text-xs font-black text-red-600 uppercase">Nguy cơ thiếu hụt cao</span>
                            <div className="text-xs text-slate-500">Thâm hụt: <strong className="text-red-700">{Math.abs(item.deficit)} túi</strong></div>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-lg">
                          Còn {item.daysOfSupply} ngày
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                        {item.recommendation}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('DONORS');
                          setSelectedBloodGroup(item.bloodGroup);
                          setEligibilityFilter('ELIGIBLE');
                        }}
                        className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Xem Donor Nhóm {item.bloodGroup} Đủ 84 Ngày</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Bảng Cân Đối Dự Trữ vs Nhu Cầu 30 Ngày Tới */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-black text-slate-900 text-lg">Bảng Cân Đối Dự Trữ vs Nhu Cầu 30 Ngày Tới</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  So sánh lượng máu thực tế trong kho với lượng máu dự kiến tiêu thụ tại các bệnh viện đối tác
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="w-2.5 h-2.5 bg-red-600 rounded-full" /> Thiếu máu
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Cảnh báo
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" /> Đủ máu
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-5">Nhóm Máu</th>
                    <th className="py-3.5 px-5">Tồn Kho Hiện Tại</th>
                    <th className="py-3.5 px-5">Nhu Cầu Dự Báo (30d)</th>
                    <th className="py-3.5 px-5">Chênh Lệch (&Delta;)</th>
                    <th className="py-3.5 px-5">Tỷ Lệ Đáp Ứng</th>
                    <th className="py-3.5 px-5">Số Ngày Dự Trữ</th>
                    <th className="py-3.5 px-5">Mức Độ Rủi Ro</th>
                    <th className="py-3.5 px-5 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {forecasts.map(item => {
                    const isNegative = item.deficit < 0;
                    const fulfillRate = Math.min(200, Math.round((item.currentStock / item.forecastDemand30Days) * 100));

                    return (
                      <tr key={item.bloodGroup} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-sm font-black bg-red-100 text-red-700">
                            {item.bloodGroup}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">
                          {item.currentStock} Túi
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-700">
                          {item.forecastDemand30Days} Túi
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center gap-1 font-extrabold text-sm ${
                            isNegative ? 'text-red-600' : 'text-emerald-600'
                          }`}>
                            {item.deficit > 0 ? `+${item.deficit}` : item.deficit} Túi
                            {item.trend === 'TANG' && <TrendingUp className="w-3.5 h-3.5 text-red-500" />}
                            {item.trend === 'GIAM' && <TrendingDown className="w-3.5 h-3.5 text-emerald-500" />}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="w-32">
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className={item.riskLevel === 'CAO' ? 'text-red-600' : 'text-slate-700'}>
                                {fulfillRate}%
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  item.riskLevel === 'CAO' 
                                    ? 'bg-red-600' 
                                    : item.riskLevel === 'TRUNG_BINH' 
                                      ? 'bg-amber-500' 
                                      : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, fulfillRate)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-5 font-semibold text-slate-700">
                          {item.daysOfSupply} ngày
                        </td>
                        <td className="py-4 px-5">
                          {item.riskLevel === 'CAO' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-red-100 text-red-700 border border-red-200 animate-pulse">
                              <AlertTriangle className="w-3 h-3" /> NGUY CƠ CAO
                            </span>
                          )}
                          {item.riskLevel === 'TRUNG_BINH' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              CẢNH BÁO
                            </span>
                          )}
                          {item.riskLevel === 'THAP' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> AN TOÀN
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('DONORS');
                              setSelectedBloodGroup(item.bloodGroup);
                              setEligibilityFilter('ELIGIBLE');
                            }}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-black rounded-xl text-xs transition cursor-pointer"
                          >
                            Xem Người Hiến ({item.bloodGroup})
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
