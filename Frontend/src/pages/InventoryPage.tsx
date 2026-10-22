import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingDown, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  RefreshCw, 
  Droplet, 
  Package, 
  Ambulance, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { axiosClient } from '../api/axiosClient';
import { BloodStockSummary } from '../types';

// Danh sách mặc định dự phòng khi chưa tải được từ API
const FALLBACK_STOCK: BloodStockSummary[] = [
  { nhomMau: 'O-', soLuongTui: 14, nguongAnToan: 50, mucDo: 'CRITICAL', phanTram: 28, tuiSapHetHan: 4 },
  { nhomMau: 'O+', soLuongTui: 120, nguongAnToan: 150, mucDo: 'WARNING', phanTram: 80, tuiSapHetHan: 8 },
  { nhomMau: 'A-', soLuongTui: 18, nguongAnToan: 40, mucDo: 'CRITICAL', phanTram: 45, tuiSapHetHan: 3 },
  { nhomMau: 'A+', soLuongTui: 210, nguongAnToan: 180, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 5 },
  { nhomMau: 'B-', soLuongTui: 24, nguongAnToan: 35, mucDo: 'WARNING', phanTram: 68, tuiSapHetHan: 1 },
  { nhomMau: 'B+', soLuongTui: 260, nguongAnToan: 200, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 6 },
  { nhomMau: 'AB-', soLuongTui: 8, nguongAnToan: 25, mucDo: 'CRITICAL', phanTram: 32, tuiSapHetHan: 2 },
  { nhomMau: 'AB+', soLuongTui: 95, nguongAnToan: 80, mucDo: 'SAFE', phanTram: 100, tuiSapHetHan: 3 },
];

export const InventoryPage: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [stock, setStock] = useState<BloodStockSummary[]>(FALLBACK_STOCK);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Tải dữ liệu tồn kho từ Backend API
  const fetchStockSummary = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/blood-inventories/summary');
      const data = res.data?.data || res.data;
      if (Array.isArray(data) && data.length > 0) {
        setStock(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu tồn kho máu từ backend, sử dụng dữ liệu dự phòng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF')) {
      fetchStockSummary();
    }
  }, [isAuthenticated, user?.role]);

  // 1. Kiểm tra trạng thái đang tải Auth
  if (isAuthLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="relative w-12 h-12 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-blood-primary animate-spin" />
          <Droplet className="w-5 h-5 text-blood-primary fill-blood-primary animate-pulse" />
        </div>
        <p className="text-xs font-semibold text-slate-500">Đang kiểm tra phân quyền truy cập...</p>
      </div>
    );
  }

  // 2. Chặn hoàn toàn: Nếu chưa đăng nhập hoặc là DONOR / Khách
  const isAuthorized = isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF');
  if (!isAuthorized) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white rounded-3xl border border-red-200 text-center space-y-5 shadow-lg shadow-red-500/5 animate-in fade-in duration-300">
        <div className="w-16 h-16 bg-red-100 text-blood-primary rounded-2xl flex items-center justify-center mx-auto shadow-inner">
          <ShieldAlert className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-700">
            Khu vực bảo mật y tế
          </span>
          <h2 className="text-2xl font-black text-slate-900">Từ Chối Truy Cập</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Dữ liệu tồn kho máu quốc gia được bảo mật và chỉ cấp quyền truy cập cho{' '}
            <span className="font-bold text-slate-900">Bác sĩ / Nhân viên Bệnh viện</span> và{' '}
            <span className="font-bold text-slate-900">Quản trị viên Hệ thống</span>.
          </p>
          {user?.role && (
            <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-slate-600">
              Vai trò hiện tại của bạn: <span className="font-bold text-red-600">[{user.role}]</span>
            </div>
          )}
        </div>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm transition-all"
          >
            Trở về Trang chủ
          </Link>
          <Link
            to="/emergency"
            className="w-full sm:w-auto px-6 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-red-500/20"
          >
            Xem Ca Cấp Cứu Máu
          </Link>
        </div>
      </div>
    );
  }

  // 3. Người dùng hợp lệ (ADMIN hoặc HOSPITAL_STAFF): Hiển thị bảng điều khiển tồn kho
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Tiêu đề & Công cụ điều phối */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Đã xác thực: {user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Bác Sĩ / Y Tế'}
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Cập nhật: {lastUpdated.toLocaleTimeString('vi-VN')}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">
            Giám Sát & Dự Báo Tồn Kho Máu
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Dữ liệu thời gian thực hỗ trợ điều phối cấp cứu và cân bằng trữ lượng máu giữa các bệnh viện
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <button
            onClick={fetchStockSummary}
            disabled={isLoading}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
            title="Làm mới dữ liệu từ máy chủ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blood-primary' : ''}`} />
            <span>Làm mới</span>
          </button>

          {(user.role === 'ADMIN' || user.role === 'HOSPITAL_STAFF') ? (
            <Link
              to="/admin/inventory"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all shrink-0"
            >
              <Package className="w-4 h-4" />
              <span>Quản trị kho FEFO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/staff/emergency-request"
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-red-500/20 transition-all shrink-0"
            >
              <Ambulance className="w-4 h-4" />
              <span>Phát lệnh cần máu</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Grid 8 Nhóm Máu */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stock.map((item) => {
          const isCritical = item.mucDo === 'CRITICAL';
          const isWarning = item.mucDo === 'WARNING';
          const bloodType = item.nhomMau;

          return (
            <div 
              key={bloodType}
              className={`p-5 rounded-3xl border-2 bg-white flex flex-col justify-between space-y-4 transition-all hover:shadow-md ${
                isCritical 
                  ? 'border-red-200 bg-red-50/20 shadow-xs' 
                  : isWarning 
                  ? 'border-amber-200 bg-amber-50/20 shadow-xs' 
                  : 'border-slate-200/90 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm border ${
                    isCritical 
                      ? 'bg-red-600 text-white border-red-500' 
                      : isWarning
                      ? 'bg-amber-500 text-white border-amber-400'
                      : 'bg-emerald-600 text-white border-emerald-500'
                  }`}>
                    {bloodType}
                  </div>
                  <span className="text-lg font-black text-slate-900">Nhóm {bloodType}</span>
                </div>

                {isCritical ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-blood-primary flex items-center gap-1 border border-red-200">
                    <AlertTriangle className="w-3 h-3" /> Cấp Báo
                  </span>
                ) : isWarning ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-warning flex items-center gap-1 border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> Cảnh báo
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-success flex items-center gap-1 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" /> An Toàn
                  </span>
                )}
              </div>

              {/* Số lượng túi & Thể tích */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900">{item.soLuongTui}</span>
                  <span className="text-xs text-slate-500 font-semibold">
                    / {item.nguongAnToan} túi chuẩn
                  </span>
                </div>
                {item.tongMl !== undefined && (
                  <div className="text-[11px] text-slate-400 font-medium">
                    Tổng thể tích: <span className="font-bold text-slate-700">{(item.tongMl / 1000).toFixed(1)} L</span> ({item.tongMl.toLocaleString()} ml)
                  </div>
                )}
              </div>

              {/* Thanh tiến trình trữ lượng */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-500">Mức đáp ứng:</span>
                  <span className={isCritical ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-emerald-600'}>
                    {item.phanTram}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCritical ? 'bg-red-600' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.phanTram ?? 0)}%` }}
                  />
                </div>
              </div>

              {/* Thông tin hạn dùng & xu hướng */}
              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500">
                <span className="text-[11px]">
                  {(item.tuiSapHetHan ?? 0) > 0 ? (
                    <span className="text-amber-700 font-bold">
                      {item.tuiSapHetHan} túi sắp hết hạn
                    </span>
                  ) : (
                    <span>Hạn dùng ổn định</span>
                  )}
                </span>
                <span className={`font-bold text-[11px] flex items-center gap-0.5 ${isCritical ? 'text-blood-primary' : 'text-emerald-600'}`}>
                  {isCritical ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  {isCritical ? 'Cần bổ sung' : 'Đảm bảo'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InventoryPage;
