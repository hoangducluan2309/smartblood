import React, { useState, useEffect } from 'react';
import {
  Heart,
  Menu,
  X,
  PhoneCall,
  User,
  LogOut,
  Droplet,
  Shield,
  Building2,
  Flame,
  QrCode,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';

export interface NavbarProps {
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  onOpenRegisterModal: () => void;
  onOpenLoginModal: () => void;
}

interface EmergencyAlertItem {
  id: number;
  bloodType: string;
  hospital: string;
  amountNeeded: number;
  unit: string;
  timeRemaining: string;
}

// Danh sách ca cấp cứu hiển thị trên ticker (Khớp y hệt hình ảnh đính kèm)
const DEFAULT_EMERGENCY_ALERTS: EmergencyAlertItem[] = [
  {
    id: 1,
    bloodType: 'B-',
    hospital: 'Bệnh viện Đa khoa Đà Nẵng',
    amountNeeded: 2,
    unit: 'đơn vị',
    timeRemaining: '1 giờ 45 phút',
  },
  {
    id: 2,
    bloodType: 'AB-',
    hospital: 'Bệnh viện Huyết học - Truyền máu TW',
    amountNeeded: 3,
    unit: 'đơn vị',
    timeRemaining: '3 giờ 15 phút',
  },
  {
    id: 3,
    bloodType: 'O-',
    hospital: 'Bệnh viện Chợ Rẫy TP.HCM',
    amountNeeded: 4,
    unit: 'đơn vị',
    timeRemaining: '45 phút',
  },
  {
    id: 4,
    bloodType: 'A-',
    hospital: 'Bệnh viện Bạch Mai Hà Nội',
    amountNeeded: 2,
    unit: 'đơn vị',
    timeRemaining: '2 giờ 30 phút',
  },
  {
    id: 5,
    bloodType: 'B+',
    hospital: 'Bệnh viện Quân y 103',
    amountNeeded: 5,
    unit: 'đơn vị',
    timeRemaining: '5 giờ',
  },
  {
    id: 6,
    bloodType: 'AB-',
    hospital: 'Bệnh viện Phụ sản Trung ương',
    amountNeeded: 2,
    unit: 'đơn vị',
    timeRemaining: '1 giờ 05 phút',
  },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenRegisterModal,
  onOpenLoginModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  // Danh sách thông báo khẩn cấp chạy ngang
  const [alerts, setAlerts] = useState<EmergencyAlertItem[]>(DEFAULT_EMERGENCY_ALERTS);

  // Nạp thêm từ API /emergency-requests nếu backend có dữ liệu thực tế
  useEffect(() => {
    const fetchRealAlerts = async () => {
      try {
        const res = await api.get('/emergency-requests?limit=6');
        if (res.data?.success && Array.isArray(res.data?.data) && res.data.data.length > 0) {
          const apiAlerts: EmergencyAlertItem[] = res.data.data.map((item: any, idx: number) => {
            let timeRem = '1 giờ 30 phút';
            if (item.hanChot) {
              const diffMs = new Date(item.hanChot).getTime() - Date.now();
              if (diffMs > 0) {
                const h = Math.floor(diffMs / 3600000);
                const m = Math.floor((diffMs % 3600000) / 60000);
                timeRem = h > 0 ? `${h} giờ ${m} phút` : `${m} phút`;
              } else {
                timeRem = 'Gấp';
              }
            }
            return {
              id: item.id || idx + 10,
              bloodType: item.nhomMauCan || 'O-',
              hospital: item.benhVienYeuCau || 'Bệnh viện Đa khoa',
              amountNeeded: item.soLuongTui || 2,
              unit: 'đơn vị',
              timeRemaining: timeRem,
            };
          });
          setAlerts(apiAlerts);
        }
      } catch {
        // Giữ nguyên DEFAULT_EMERGENCY_ALERTS
      }
    };
    fetchRealAlerts();
  }, []);

  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'emergency', label: 'Cấp cứu khẩn', badge: 'Mới' },
    { id: 'inventory', label: 'Kho dự trữ máu' },
    { id: 'process', label: 'Quy trình' },
    { id: 'faq', label: 'Điều kiện & FAQ' },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const roleBadgeMap: Record<string, { text: string; bg: string }> = {
    ADMIN: { text: 'Quản trị viên', bg: 'bg-purple-100 text-purple-700' },
    HOSPITAL: { text: 'Bệnh viện', bg: 'bg-blue-100 text-blue-700' },
    DONOR: { text: 'Người hiến', bg: 'bg-rose-100 text-[#D32F2F]' },
  };

  const userRole = user?.role ? roleBadgeMap[user.role] : roleBadgeMap.DONOR;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* ========================================================================= */}
      {/* 1. EMERGENCY ALERT BANNER: Nền đỏ full giao diện, chữ chạy trong khung body */}
      {/* ========================================================================= */}
      <div className="bg-[#B71C1C] text-white text-xs h-9 sm:h-10 border-b border-red-950/40 select-none shadow-xs w-full">
        {/* Giới hạn chữ chạy trong đúng khung body max-w-7xl, không tràn ra viền */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center overflow-hidden relative">
          {/* Pinned Title on Left - Căn thẳng hàng lề trái với khung body */}
          <div className="z-20 bg-[#B71C1C] h-full flex items-center pr-3 sm:pr-4 border-r border-red-400/30 shadow-[6px_0_15px_rgba(183,28,28,0.95)] shrink-0">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-80" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 shadow-sm shadow-amber-300" />
              </span>
              <Flame className="w-4 h-4 text-amber-300 fill-amber-300 shrink-0" />
              <span className="text-xs sm:text-[13px] font-black tracking-wider uppercase whitespace-nowrap text-white">
                BÁO ĐỘNG ĐỎ: KHẨN CẤP REALTIME
              </span>
              <span className="text-white/40 font-light ml-1">|</span>
            </div>
          </div>

          {/* Ticker / News Ticker: Chạy bên trong khung body thôi */}
          <div className="flex-1 overflow-hidden relative h-full flex items-center">
            <div className="animate-marquee flex items-center gap-3 sm:gap-4 pl-3">
              {[...alerts, ...alerts].map((item, idx) => (
                <button
                  key={`${item.id}-${idx}`}
                  type="button"
                  onClick={() => onSelectTab('emergency')}
                  className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-black/25 hover:bg-black/40 transition-all text-white text-xs border border-white/20 whitespace-nowrap group cursor-pointer shrink-0"
                  title={`Nhấn để mở danh sách cấp cứu khẩn: ${item.hospital}`}
                >
                  {/* Badge nhóm máu */}
                  <span className="px-2 py-0.5 rounded-full bg-white text-purple-800 font-black text-xs shadow-xs">
                    {item.bloodType}
                  </span>

                  {/* Tên Bệnh viện & Cần gấp */}
                  <span className="font-semibold text-white/95">
                    {item.hospital}
                  </span>
                  <span className="text-white/40">-</span>
                  <span className="text-white/90">
                    Cần gấp:{' '}
                    <strong className="text-amber-300 font-black">
                      {item.amountNeeded} {item.unit}
                    </strong>
                  </span>

                  {/* Badge thời gian đếm ngược */}
                  <span className="px-2 py-0.5 rounded bg-black/45 text-white/95 text-[11px] font-mono border border-white/10 font-medium">
                    {item.timeRemaining}
                  </span>

                  {/* Mũi tên */}
                  <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REAL-TIME NOTIFICATION BAR: Thanh đen dài ra hết bằng giao diện (w-full) */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1325] text-slate-300 text-xs py-1.5 px-4 sm:px-6 border-b border-slate-800 w-full">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Bên trái: Trạng thái Realtime & Hotline */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-200 font-medium text-xs">
              Hệ thống Điều Phối Thời Gian Thực
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="hidden sm:flex items-center gap-1.5 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Hotline Cấp cứu máu 24/7:</span>
              <strong className="text-white font-bold">1900 6868</strong>
            </span>
          </div>

          {/* Bên phải: Nút Đăng nhập đưa lên chỗ Quản trị (Bỏ Chế độ xem) */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span className="font-bold text-white text-xs max-w-[130px] truncate">{user.hoTen}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${userRole.bg}`}>
                    {userRole.text}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-rose-400 rounded transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold shadow-sm shadow-[#D32F2F]/20 transition-all cursor-pointer border border-red-500/30"
              >
                <User className="w-3.5 h-3.5 text-white/90" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#D32F2F] flex items-center justify-center text-white shadow-md shadow-[#D32F2F]/30 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Smart<span className="text-[#D32F2F]">Blood</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-rose-50 text-[#D32F2F] rounded">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block -mt-1 font-medium">
                Điều phối máu nhân đạo & Dự báo khẩn cấp
              </p>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 focus:outline-none ${
                    isActive
                      ? 'text-[#D32F2F] bg-rose-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-[#D32F2F] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#D32F2F] rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Nút Quét QR Y Tế */}
            <button
              type="button"
              onClick={() => handleNavClick('qr-scan')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                activeTab === 'qr-scan'
                  ? 'bg-rose-50 text-[#D32F2F] border-[#D32F2F] shadow-xs ring-1 ring-[#D32F2F]/20'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-[#D32F2F]'
              }`}
              title="Quét mã QR y tế tra cứu hồ sơ người hiến máu"
            >
              <QrCode className="w-4 h-4 text-[#D32F2F]" />
              <span>Quét QR Y Tế</span>
            </button>
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#D32F2F] flex items-center justify-center font-bold text-xs border border-rose-200">
                    {user.nhomMau ? (
                      <span className="text-[11px] font-black">{user.nhomMau}</span>
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                      {user.hoTen}
                    </div>
                    <span className={`inline-block text-[10px] font-semibold px-1.5 py-0.2 rounded mt-0.5 ${userRole.bg}`}>
                      {userRole.text}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenRegisterModal}
                  className="px-3.5 py-2 text-xs font-bold bg-[#D32F2F] hover:bg-[#B71C1C] text-white rounded-xl shadow-md shadow-[#D32F2F]/20 flex items-center gap-1.5 transition-all"
                >
                  <Heart className="w-3.5 h-3.5 fill-white" />
                  <span>Đăng ký hiến máu</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#D32F2F] rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          {isAuthenticated && user && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-bold text-slate-800">{user.hoTen}</div>
                <div className="text-xs text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}

          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-base font-semibold rounded-xl text-left transition-colors ${
                    isActive ? 'bg-rose-50 text-[#D32F2F]' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-[#D32F2F] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => handleNavClick('qr-scan')}
              className={`w-full flex items-center gap-2 px-3.5 py-2.5 text-base font-semibold rounded-xl text-left transition-colors ${
                activeTab === 'qr-scan' ? 'bg-rose-50 text-[#D32F2F]' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5 text-[#D32F2F]" />
              <span>Quét QR Y Tế</span>
            </button>
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full py-2.5 bg-[#D32F2F] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2"
              >
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
