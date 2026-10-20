import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEmergency } from '../../contexts/EmergencyContext';
import { useCallModal } from '../../contexts/CallModalContext';
import { axiosClient } from '../../api/axiosClient';
import { 
  Droplet, 
  Truck, 
  Users, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  Package, 
  PhoneCall, 
  FileText, 
  Activity,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BloodStat {
  group: string;
  units: number;
  safe: number;
  percentage: number;
  status: 'CRITICAL' | 'WARNING' | 'SAFE';
}

interface RecentActivity {
  id: string;
  time: string;
  type: 'EMERGENCY' | 'DISPATCH' | 'DONATION' | 'STOCK';
  title: string;
  description: string;
  badge: string;
  badgeColor: string;
}

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { urgentCount, isSocketConnected } = useEmergency();
  const { openCallModal } = useCallModal();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingAppointmentsCount, setPendingAppointmentsCount] = useState<number | null>(null);
  const [bloodStats, setBloodStats] = useState<BloodStat[]>([
    { group: 'O-', units: 18, safe: 40, percentage: 45, status: 'CRITICAL' },
    { group: 'O+', units: 120, safe: 100, percentage: 120, status: 'SAFE' },
    { group: 'A-', units: 12, safe: 25, percentage: 48, status: 'CRITICAL' },
    { group: 'A+', units: 85, safe: 70, percentage: 121, status: 'SAFE' },
    { group: 'B-', units: 22, safe: 30, percentage: 73, status: 'WARNING' },
    { group: 'B+', units: 64, safe: 60, percentage: 106, status: 'SAFE' },
    { group: 'AB-', units: 8, safe: 20, percentage: 40, status: 'CRITICAL' },
    { group: 'AB+', units: 35, safe: 30, percentage: 116, status: 'SAFE' },
  ]);

  const [kpiData, setKpiData] = useState({
    totalUnits: 364,
    totalVolumeLiters: 127.4,
    activeEmergencies: 3,
    registeredDonors: 1420,
    activeEventsThisMonth: 8,
    completionRateThisWeek: 94.2
  });

  const [activities] = useState<RecentActivity[]>([
    {
      id: 'ACT-01',
      time: '5 phút trước',
      type: 'EMERGENCY',
      title: 'Bệnh viện Chợ Rẫy phát báo động đỏ',
      description: 'Yêu cầu khẩn cấp 3 túi O- cho ca phẫu thuật đa chấn thương.',
      badge: 'RẤT KHẨN',
      badgeColor: 'bg-red-100 text-red-700'
    },
    {
      id: 'ACT-02',
      time: '18 phút trước',
      type: 'DISPATCH',
      title: 'Xuất kho & điều xe CC-01 thành công',
      description: 'Tài xế Nguyễn Văn Hải đang di chuyển đến BV Cấp Cứu 115 (ETA 12p).',
      badge: 'ĐANG GIAO',
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'ACT-03',
      time: '42 phút trước',
      type: 'DONATION',
      title: 'Tiếp nhận 45 túi máu tại Điểm Hiến Quận 1',
      description: 'Sự kiện "Giọt Hồng Nghĩa Tình" đã hoàn thành 85% chỉ tiêu ngày.',
      badge: 'TIẾP NHẬN',
      badgeColor: 'bg-emerald-100 text-emerald-700'
    },
    {
      id: 'ACT-04',
      time: '1 giờ trước',
      type: 'STOCK',
      title: 'Cảnh báo tự động FEFO kho A1',
      description: 'Có 6 túi máu nhóm A- sẽ hết hạn sử dụng trong 4 ngày tới.',
      badge: 'CẬN HẠN',
      badgeColor: 'bg-amber-100 text-amber-700'
    }
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Gọi đồng thời các API CSDL SQL Server để lấy dữ liệu thống kê thực tế
        const [summaryRes, userRes, eventRes] = await Promise.allSettled([
          axiosClient.get('/blood-inventories/summary'),
          axiosClient.get('/users', { params: { limit: 100, vaiTro: 'DONOR' } }),
          axiosClient.get('/donation-events', { params: { limit: 100 } }),
        ]);

        // 1. Thống kê tồn kho máu (Card 1 & Blood stats)
        let calculatedTotalUnits = 40;
        let calculatedTotalVolume = 14;
        if (summaryRes.status === 'fulfilled') {
          const raw = summaryRes.value.data?.data || summaryRes.value.data;
          if (Array.isArray(raw) && raw.length > 0) {
            const mapped: BloodStat[] = raw.map((item: any) => ({
              group: item.nhomMau || item.bloodGroup || 'O+',
              units: item.soLuongTui || item.unitsAvailable || 0,
              safe: item.nguongAnToan || item.safeThreshold || 10,
              percentage: Math.min(150, item.phanTram || Math.round(((item.soLuongTui || 0) / (item.nguongAnToan || 10)) * 100)),
              status: (item.mucDo === 'CRITICAL' || item.status === 'CRITICAL') ? 'CRITICAL' : (item.mucDo === 'WARNING' || item.status === 'WARNING') ? 'WARNING' : 'SAFE'
            }));
            if (isMounted) setBloodStats(mapped);

            calculatedTotalUnits = mapped.reduce((acc, curr) => acc + curr.units, 0);
            calculatedTotalVolume = Math.round(calculatedTotalUnits * 0.35 * 10) / 10;
          }
        }

        // 2. Thống kê số lượng người hiến máu thực tế từ database (Card 3)
        let donorCount = 18;
        if (userRes.status === 'fulfilled') {
          const userData = userRes.value.data?.data;
          const totalDonors = userData?.pagination?.totalItems ?? (Array.isArray(userData?.items) ? userData.items.length : (Array.isArray(userData) ? userData.length : null));
          if (typeof totalDonors === 'number') {
            donorCount = totalDonors;
          }
        }

        // 3. Thống kê số lượng sự kiện hiến máu thực tế từ database (Card 4)
        let eventCount = 3;
        if (eventRes.status === 'fulfilled') {
          const eventData = eventRes.value.data?.data;
          const eventItems = eventData?.items || (Array.isArray(eventData) ? eventData : []);
          if (Array.isArray(eventItems)) {
            const activeEvents = eventItems.filter((e: any) => e.trangThai !== 'DaHuy');
            eventCount = activeEvents.length;
          }
        }

        if (isMounted) {
          setKpiData(prev => ({
            ...prev,
            totalUnits: calculatedTotalUnits,
            totalVolumeLiters: calculatedTotalVolume,
            registeredDonors: donorCount,
            activeEventsThisMonth: eventCount,
          }));
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu tổng quan admin:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchPendingAppointmentsCount = async () => {
      try {
        const response = await axiosClient.get('/donation-appointments', {
          params: { page: 1, limit: 1, trangThai: 'ChoXacNhan' },
        });
        const data = response.data?.data;
        const count = data?.pagination?.totalItems ?? data?.items?.length;
        if (isMounted && Number.isFinite(Number(count))) {
          setPendingAppointmentsCount(Number(count));
        }
      } catch (error) {
        console.error('Không thể tải số lịch hiến máu đang chờ duyệt:', error);
      }
    };

    void fetchPendingAppointmentsCount();
    const intervalId = window.setInterval(() => {
      void fetchPendingAppointmentsCount();
    }, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleExportFullReport = () => {
    toast.success('Đang tạo báo cáo tổng hợp PDF/Excel toàn hệ thống...');
  };

  const criticalGroups = bloodStats.filter(s => s.status === 'CRITICAL');

  return (
    <div className="min-w-0 w-full space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* 1. TOP WELCOME & SYSTEM HEALTH BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blood-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 text-xs font-black bg-red-600 text-white rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Trung Tâm Điều Hành Quốc Gia
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                {isSocketConnected ? 'Socket Live 24/7' : 'Hệ Thống Trực Tuyến'}
              </span>
              <span className="text-xs text-slate-300">
                Cập nhật: {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Tổng Quan Điều Phối & Giám Sát Cấp Cứu
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Xin chào, <strong className="text-white">{user?.fullName || 'Quản trị viên'}</strong>. Hệ thống đang kết nối trực tiếp với 18 bệnh viện và 12 điểm tiếp nhận hiến máu lưu động.
            </p>
          </div>

          {/* Quick Shortcuts */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/admin/appointments"
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"
            >
              <Calendar className="h-4 w-4 text-rose-200" />
              <span>
                Lịch Hiến Máu Cần Duyệt
                {pendingAppointmentsCount !== null ? ` (${pendingAppointmentsCount})` : ''}
              </span>
            </Link>

            <Link
              to="/staff/emergency-request"
              className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-black text-sm rounded-xl shadow-lg shadow-red-900/40 transition active:scale-95 group"
            >
              <ShieldAlert className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span>Phát Lệnh Cấp Cứu</span>
            </Link>

            <Link
              to="/admin/dispatch"
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition active:scale-95"
            >
              <Truck className="w-4 h-4" />
              <span>Điều Phối Xe ({urgentCount})</span>
            </Link>

            <button
              onClick={handleExportFullReport}
              className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-300" />
              <span>Xuất Báo Cáo</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 4 TOP KPI METRIC CARDS (Envato 3D Cards with Hover Depth) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng máu trong kho */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 card-3d-hover flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Tổng Trữ Lượng Toàn Kho</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {isLoading ? '...' : `${kpiData.totalUnits} Túi`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-extrabold">
              <TrendingUp className="w-4 h-4" />
              <span>~{kpiData.totalVolumeLiters} Lít máu đạt chuẩn</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
            <Droplet className="w-7 h-7 fill-white/30" />
          </div>
        </div>

        {/* Card 2: Ca cấp cứu đang chạy */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-red-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 card-3d-hover flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Ca Cấp Cứu Đang Xử Lý</span>
            <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">
              {urgentCount} Ca
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-extrabold animate-pulse">
              <AlertTriangle className="w-4 h-4" />
              <span>Ưu tiên xuất kho hỏa tốc</span>
            </div>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/25">
            <Truck className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Tình nguyện viên sẵn sàng */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 card-3d-hover flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Người Hiến Đã Đăng Ký</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {kpiData.registeredDonors.toLocaleString()}
            </div>
            <Link to="/admin/users" className="flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Quản lý tài khoản &rarr;</span>
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Sự kiện & Dự báo AI */}
        <div className="bg-white/95 backdrop-blur-md p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl transition-all duration-300 card-3d-hover flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Sự Kiện Hiến Máu Tháng</span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {kpiData.activeEventsThisMonth} Điểm
            </div>
            <Link to="/events" className="flex items-center gap-1.5 text-xs text-purple-700 font-black hover:underline">
              <Calendar className="w-4 h-4 text-purple-600" />
              <span>Quản lý sự kiện hiến máu &rarr;</span>
            </Link>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/25">
            <Calendar className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* 3. PHÂN BỔ 8 NHÓM MÁU & CẢNH BÁO NGUY CƠ THIẾU HỤT */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blood-primary" />
              <h2 className="text-lg font-black text-slate-900">Giám Sát An Toàn 8 Nhóm Máu (FEFO Inventory)</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Định mức an toàn tối thiểu và tình trạng sẵn sàng cấp cứu của từng nhóm máu
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/inventory"
              className="text-xs font-bold text-blood-primary hover:underline flex items-center gap-1"
            >
              Xem chi tiết từng lô máu FEFO &rarr;
            </Link>
          </div>
        </div>

        {/* 8 Thẻ Nhóm Máu Mini */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {bloodStats.map(stat => {
            const isCritical = stat.status === 'CRITICAL';
            const isWarning = stat.status === 'WARNING';

            return (
              <div
                key={stat.group}
                className={`p-4 rounded-2xl border-2 flex flex-col justify-between space-y-3 transition-all ${
                  isCritical 
                    ? 'border-red-300 bg-red-50/40 shadow-xs' 
                    : isWarning 
                      ? 'border-amber-300 bg-amber-50/30' 
                      : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-900">{stat.group}</span>
                  {isCritical ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                  ) : isWarning ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  ) : (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  )}
                </div>

                <div>
                  <div className="text-2xl font-black text-slate-900">{stat.units}</div>
                  <span className="text-[10px] text-slate-400 font-bold">/ {stat.safe} túi chuẩn</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, stat.percentage)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Cảnh Báo Nguy Cơ Cần Can Thiệp Nhanh */}
        {criticalGroups.length > 0 && (
          <div className="p-4 bg-red-50/80 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 text-white rounded-xl shrink-0 animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-red-900">
                  Cảnh Báo Thiếu Hụt Khẩn Cấp: {criticalGroups.map(g => g.group).join(', ')}
                </h4>
                <p className="text-xs text-red-700 mt-0.5">
                  Lượng dự trữ các nhóm máu này đang dưới 50% định mức an toàn cho phẫu thuật cấp cứu.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/admin/forecast"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Gọi Tình Nguyện Viên Khẩn</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 4. HAI CỘT: TIẾN ĐỘ ĐIỀU PHỐI LIVE VÀ NHẬT KÝ HOẠT ĐỘNG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cột Trái (7 cols): Giám Sát Xe Cấp Cứu Live */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-red-600" />
              <h3 className="font-extrabold text-slate-900 text-base">Tiến Độ Điều Phối Xe Cứu Thương</h3>
            </div>
            <Link 
              to="/admin/dispatch"
              className="text-xs font-bold text-slate-600 hover:text-red-600 transition flex items-center gap-1"
            >
              <span>Vào trung tâm điều xe</span>
              <span className="text-xs">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Live Case 1 */}
            <div className="p-4 rounded-2xl border-2 border-red-200 bg-red-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-red-600 text-white font-black text-base flex items-center justify-center shrink-0">
                  O-
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">Bệnh viện Chợ Rẫy</h4>
                    <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded">
                      RẤT KHẨN
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    3 Túi máu 350ml • Tài xế: <strong>Nguyễn Văn Hải (Xe CC-01)</strong>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dự kiến đến nơi trong ~12 phút</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <button 
                  type="button"
                  onClick={() => openCallModal({
                    title: 'Thông tin xe cấp cứu & tài xế',
                    name: 'Tài xế Nguyễn Văn Hải (Xe CC-01)',
                    phone: '0908 112 233',
                  })}
                  className="px-3.5 py-2 bg-white text-red-600 border border-red-200 hover:bg-red-50 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi Xe</span>
                </button>
              </div>
            </div>

            {/* Live Case 2 */}
            <div className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <span className="w-11 h-11 rounded-xl bg-slate-800 text-white font-black text-base flex items-center justify-center shrink-0">
                  B+
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm">Bệnh viện Đại Học Y Dược TP.HCM</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                      KHẨN CẤP
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    2 Túi máu 350ml • Tài xế: <strong>Trần Hoàng Long (Xe CC-04)</strong>
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dự kiến đến nơi trong ~25 phút</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:self-center">
                <button 
                  type="button"
                  onClick={() => openCallModal({
                    title: 'Thông tin xe cấp cứu & tài xế',
                    name: 'Tài xế Trần Hoàng Long (Xe CC-04)',
                    phone: '0912 345 678',
                  })}
                  className="px-3.5 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Gọi Xe</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cột Phải (5 cols): Nhật Ký Hoạt Động Hệ Thống */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-700" />
              <h3 className="font-extrabold text-slate-900 text-base">Nhật Ký Điều Phối Trực Tiếp</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Live Audit Log</span>
          </div>

          <div className="space-y-4">
            {activities.map(act => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-extrabold text-slate-900">{act.title}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${act.badgeColor}`}>
                      {act.badge}
                    </span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">{act.description}</p>
                  <span className="text-[10px] text-slate-400 font-medium block">{act.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. KHỐI TRUY CẬP NHANH CÁC PHÂN HỆ QUẢN TRỊ (Envato 3D Showcase Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
        <Link 
          to="/staff/emergency-request"
          className="p-5 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-red-200/80 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-red-500/20">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Phát Lệnh Cấp Cứu</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Phát báo động đỏ, điều động máu khẩn cấp toàn quốc.</p>
          </div>
        </Link>

        <Link 
          to="/admin/inventory"
          className="p-6 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-red-500/20">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Kho Máu FEFO</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Kiểm kê 8 nhóm máu, lô sắp hết hạn & vị trí tủ đông.</p>
          </div>
        </Link>

        <Link 
          to="/admin/dispatch"
          className="p-6 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Điều Phối Cấp Cứu</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Tương thích nhóm máu, duyệt xuất kho & gán xe 115.</p>
          </div>
        </Link>

        <Link 
          to="/admin/forecast"
          className="p-6 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-purple-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Quản Lý Hiến Máu</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Thống kê Donor đã hiến, theo dõi chu kỳ an toàn 84 ngày & dự báo nhu cầu.</p>
          </div>
        </Link>

        <Link 
          to="/admin/users"
          className="p-6 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-indigo-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Quản Lý Tài Khoản</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Phân quyền Admin/Bệnh viện/Người hiến, thêm, sửa & khóa.</p>
          </div>
        </Link>

        <Link 
          to="/events"
          className="p-6 bg-white/95 backdrop-blur-md hover:bg-slate-50 border border-slate-200/90 rounded-3xl shadow-2xs hover:shadow-xl transition-all duration-300 group space-y-3 block card-3d-hover"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md shadow-emerald-500/20">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-sm">Sự Kiện Hiến Máu</h4>
            <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">Mở thêm chiến dịch, quản lý điểm hiến máu lưu động.</p>
          </div>
        </Link>
      </div>

    </div>
  );
};

export default AdminDashboardPage;
