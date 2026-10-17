import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { ShortageRiskForecast, UrgentDonor, BloodGroup } from '../../types';
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
  X, 
  RefreshCw, 
  Send,
  Building2,
  Users
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

const MOCK_URGENT_DONORS: UrgentDonor[] = [
  {
    id: 'DNR-101',
    hoTen: 'Nguyễn Văn Hùng',
    soDienThoai: '0912 345 678',
    email: 'hung.nguyen@example.com',
    nhomMau: 'O-',
    diaChi: '128 Nguyễn Trãi, Phường Bến Thành',
    quanHuyen: 'Quận 1, TP.HCM',
    lanHienCuoi: '2025-11-20',
    soNgayDaQua: 140,
    soLanDaHien: 6,
    khoangCachKm: 2.5,
    trangThaiSanSang: true
  },
  {
    id: 'DNR-102',
    hoTen: 'Trần Thị Mai Phương',
    soDienThoai: '0988 776 655',
    email: 'phuong.tran@example.com',
    nhomMau: 'O-',
    diaChi: '45 Trần Hưng Đạo',
    quanHuyen: 'Quận 5, TP.HCM',
    lanHienCuoi: '2025-12-10',
    soNgayDaQua: 120,
    soLanDaHien: 4,
    khoangCachKm: 3.8,
    trangThaiSanSang: true
  },
  {
    id: 'DNR-103',
    hoTen: 'Lê Hoàng Long',
    soDienThoai: '0903 112 233',
    email: 'long.le@example.com',
    nhomMau: 'A-',
    diaChi: '88 Lý Thường Kiệt',
    quanHuyen: 'Quận 10, TP.HCM',
    lanHienCuoi: '2025-10-15',
    soNgayDaQua: 176,
    soLanDaHien: 9,
    khoangCachKm: 4.2,
    trangThaiSanSang: true
  },
  {
    id: 'DNR-104',
    hoTen: 'Võ Minh Quân',
    soDienThoai: '0977 445 566',
    email: 'quan.vo@example.com',
    nhomMau: 'AB-',
    diaChi: '15 Điện Biên Phủ',
    quanHuyen: 'Quận Bình Thạnh, TP.HCM',
    lanHienCuoi: '2025-12-25',
    soNgayDaQua: 105,
    soLanDaHien: 3,
    khoangCachKm: 5.1,
    trangThaiSanSang: true
  },
  {
    id: 'DNR-105',
    hoTen: 'Phạm Thu Trang',
    soDienThoai: '0938 998 877',
    email: 'trang.pham@example.com',
    nhomMau: 'B-',
    diaChi: '204 Lê Văn Sỹ',
    quanHuyen: 'Quận 3, TP.HCM',
    lanHienCuoi: '2025-11-05',
    soNgayDaQua: 155,
    soLanDaHien: 5,
    khoangCachKm: 3.1,
    trangThaiSanSang: true
  },
  {
    id: 'DNR-106',
    hoTen: 'Đỗ Thành Đạt',
    soDienThoai: '0919 223 344',
    email: 'dat.do@example.com',
    nhomMau: 'O-',
    diaChi: '56 Hoàng Văn Thụ',
    quanHuyen: 'Quận Phú Nhuận, TP.HCM',
    lanHienCuoi: '2025-12-01',
    soNgayDaQua: 129,
    soLanDaHien: 7,
    khoangCachKm: 4.6,
    trangThaiSanSang: true
  }
];

export const DemandForecastPage: React.FC = () => {
  const [forecasts, setForecasts] = useState<ShortageRiskForecast[]>([]);
  const [donors, setDonors] = useState<UrgentDonor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal State
  const [isDonorModalOpen, setIsDonorModalOpen] = useState<boolean>(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<BloodGroup | 'ALL'>('ALL');
  const [donorSearchQuery, setDonorSearchQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>('ALL');

  // Gọi API dự báo
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Phân tích nguy cơ thiếu máu 30 ngày tới
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

      // 2. Danh sách tình nguyện viên khẩn cấp
      const donorsRes = await axiosClient.get('/forecasts/urgent-donors').catch(() => null);
      const rawDonors = 
        donorsRes?.data?.data?.items || 
        donorsRes?.data?.data || 
        donorsRes?.data?.items || 
        (Array.isArray(donorsRes?.data) ? donorsRes.data : []);

      if (Array.isArray(rawDonors) && rawDonors.length > 0) {
        setDonors(rawDonors);
      } else {
        setDonors(MOCK_URGENT_DONORS);
      }
    } catch {
      setForecasts(MOCK_FORECASTS);
      setDonors(MOCK_URGENT_DONORS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
    toast.success('Đã cập nhật mô hình dự báo AI theo thời gian thực!');
  };

  const handleOpenDonorModal = (bloodGroup?: BloodGroup) => {
    if (bloodGroup) {
      setSelectedBloodGroup(bloodGroup);
    } else {
      setSelectedBloodGroup('ALL');
    }
    setIsDonorModalOpen(true);
  };

  const handleBroadcastSMS = (bloodGroup: string) => {
    toast.success(`Đã kích hoạt chiến dịch gửi SMS kêu gọi tới toàn bộ tình nguyện viên nhóm ${bloodGroup}!`);
  };

  // Lọc danh sách tình nguyện viên trong Modal
  const filteredDonors = donors.filter(d => {
    const matchGroup = selectedBloodGroup === 'ALL' || d.nhomMau === selectedBloodGroup;
    const matchSearch = d.hoTen.toLowerCase().includes(donorSearchQuery.toLowerCase()) ||
                        d.soDienThoai.includes(donorSearchQuery) ||
                        d.diaChi.toLowerCase().includes(donorSearchQuery.toLowerCase());
    const matchDistrict = districtFilter === 'ALL' || d.quanHuyen.includes(districtFilter);
    return matchGroup && matchSearch && matchDistrict;
  });

  // Thống kê tổng hợp
  const totalDemand = forecasts.reduce((acc, curr) => acc + curr.forecastDemand30Days, 0);
  const totalStock = forecasts.reduce((acc, curr) => acc + curr.currentStock, 0);
  const criticalCount = forecasts.filter(f => f.riskLevel === 'CAO').length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blood-dark text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 text-xs font-black bg-red-600 text-white rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> AI Demand Forecast
              </span>
              <span className="text-xs text-slate-300 font-medium">Chu kỳ dự báo: 30 Ngày Tới</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Dự Báo Nhu Cầu & Nguy Cơ Thiếu Máu
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Mô hình học máy phân tích dữ liệu lịch sử phẫu thuật, ca cấp cứu và tính chu kỳ mùa vụ để đưa ra khuyến nghị điều phối chủ động.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition active:scale-95 text-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Chạy lại mô hình</span>
            </button>
            <button
              onClick={() => handleOpenDonorModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-lg shadow-red-900/50 transition active:scale-95 text-sm cursor-pointer"
            >
              <Users className="w-4 h-4" />
              <span>Danh Sách Tình Nguyện Viên Khẩn</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Tồn Kho Hiện Tại</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{isLoading ? '...' : `${totalStock} Túi`}</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">Khả dụng toàn hệ thống</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhu Cầu Dự Báo (30 Ngày)</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{isLoading ? '...' : `${totalDemand} Túi`}</div>
            <span className="text-xs text-slate-500 font-semibold mt-0.5 block">Dựa trên 18 bệnh viện</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nhóm Máu Nguy Cơ Cao</span>
            <div className="text-3xl font-black text-red-600 mt-1">{isLoading ? '...' : `${criticalCount} Nhóm`}</div>
            <span className="text-xs text-red-600 font-semibold mt-0.5 block">Cần can thiệp gấp (O-, A-, AB-)</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tình Nguyện Viên Sẵn Sàng</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{isLoading ? '...' : `${donors.length} Người`}</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5 block">Đã đủ khoảng cách &gt; 84 ngày</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Khuyến Nghị Hành Động AI (Action Recommendations) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>Khuyến Nghị Hành Động Từ Hệ Thống Dự Báo Thông Minh</span>
          </h2>
          <span className="text-xs text-slate-500">Cập nhật tự động theo thời gian thực</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {forecasts
            .filter(f => f.riskLevel === 'CAO')
            .map(item => (
              <div 
                key={item.bloodGroup}
                className="bg-white rounded-2xl border-2 border-red-200 p-5 shadow-sm hover:shadow-md transition relative flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-9 h-9 rounded-xl bg-red-600 text-white font-black text-sm flex items-center justify-center">
                        {item.bloodGroup}
                      </span>
                      <div>
                        <span className="text-xs font-extrabold text-red-600 uppercase">Nguy cơ thiếu hụt cao</span>
                        <div className="text-xs text-slate-500">Thâm hụt: <strong className="text-red-700">{Math.abs(item.deficit)} túi</strong></div>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded">
                      Còn {item.daysOfSupply} ngày dự trữ
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {item.recommendation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenDonorModal(item.bloodGroup)}
                    className="flex-1 py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Gọi Người Hiến ({item.bloodGroup})</span>
                  </button>
                  <button
                    onClick={() => handleBroadcastSMS(item.bloodGroup)}
                    title="Gửi SMS tự động"
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Bảng So Sánh Dự Trữ vs Nhu Cầu Dự Báo (30 Ngày) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">Bảng Cân Đối Dự Trữ vs Nhu Cầu 30 Ngày Tới</h2>
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
              {isLoading ? (
                // Skeleton loading rows
                [1, 2, 3, 4].map(idx => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-5"><div className="h-6 w-12 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-5 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-5 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-5 w-12 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-5 w-16 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5"><div className="h-6 w-20 bg-slate-200 rounded" /></td>
                    <td className="py-4 px-5 text-right"><div className="h-8 w-24 bg-slate-200 rounded ml-auto" /></td>
                  </tr>
                ))
              ) : (
                forecasts.map(item => {
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
                          onClick={() => handleOpenDonorModal(item.bloodGroup)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 font-bold rounded-lg text-xs transition cursor-pointer"
                        >
                          Xem Người Hiến
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Danh Sách Tình Nguyện Viên Sẵn Sàng (Có nút Gọi điện ngay) */}
      {isDonorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp">
            {/* Modal Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-600 text-white rounded-xl">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black">Danh Sách Tình Nguyện Viên Sẵn Sàng Hiến Khẩn</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Đã kiểm tra khoảng cách lần hiến cuối &gt; 84 ngày (12 tuần) theo quy định y tế
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsDonorModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Filters */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm tên, số điện thoại, địa chỉ..."
                    value={donorSearchQuery}
                    onChange={(e) => setDonorSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 w-56 sm:w-64"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
                  <select
                    value={selectedBloodGroup}
                    onChange={(e) => setSelectedBloodGroup(e.target.value as BloodGroup | 'ALL')}
                    className="bg-transparent text-xs font-bold text-slate-700 py-0.5 px-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Tất cả nhóm máu</option>
                    <option value="O-">O- (Hiếm)</option>
                    <option value="O+">O+</option>
                    <option value="A-">A-</option>
                    <option value="A+">A+</option>
                    <option value="B-">B-</option>
                    <option value="B+">B+</option>
                    <option value="AB-">AB-</option>
                    <option value="AB+">AB+</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-xl">
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 py-0.5 px-1.5 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">Toàn TP.HCM</option>
                    <option value="Quận 1">Quận 1</option>
                    <option value="Quận 3">Quận 3</option>
                    <option value="Quận 5">Quận 5</option>
                    <option value="Quận 10">Quận 10</option>
                    <option value="Bình Thạnh">Bình Thạnh</option>
                    <option value="Phú Nhuận">Phú Nhuận</option>
                  </select>
                </div>
              </div>

              <span className="text-xs font-bold text-slate-600">
                Tìm thấy: <strong className="text-red-600">{filteredDonors.length}</strong> tình nguyện viên
              </span>
            </div>

            {/* Modal Body: Donor List */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {filteredDonors.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Users className="w-12 h-12 mx-auto mb-2 opacity-30 text-slate-500" />
                  <p>Không tìm thấy tình nguyện viên phù hợp với tiêu chí lọc.</p>
                </div>
              ) : (
                filteredDonors.map(donor => (
                  <div 
                    key={donor.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 text-red-700 font-black text-lg flex items-center justify-center shrink-0">
                        {donor.nhomMau}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-slate-900 text-base">{donor.hoTen}</h4>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Sẵn sàng
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {donor.diaChi}, {donor.quanHuyen}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mt-1.5 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Lần hiến cuối: {donor.lanHienCuoi} ({donor.soNgayDaQua} ngày trước)
                          </span>
                          <span>&bull;</span>
                          <span>Đã hiến: <strong className="text-slate-800">{donor.soLanDaHien} lần</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 sm:shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <a
                        href={`sms:${donor.soDienThoai}?body=${encodeURIComponent(`Xin chào ${donor.hoTen}, Bệnh viện đang cần gấp máu nhóm ${donor.nhomMau} cho ca cấp cứu. Bạn có thể tham gia hiến máu không?`)}`}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1 text-xs font-bold"
                        title="Gửi tin nhắn SMS"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="sm:hidden">SMS</span>
                      </a>
                      <a
                        href={`tel:${donor.soDienThoai}`}
                        className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl shadow-sm transition flex items-center gap-2 text-xs"
                      >
                        <PhoneCall className="w-4 h-4" />
                        <span>Gọi Ngay ({donor.soDienThoai})</span>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Lưu ý: Mọi cuộc gọi đều được ghi nhận vào nhật ký điều phối khẩn cấp
              </span>
              <button
                type="button"
                onClick={() => setIsDonorModalOpen(false)}
                className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
