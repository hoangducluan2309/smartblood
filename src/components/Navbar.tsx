import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Droplet, 
  Bell, 
  Flame, 
  ShieldAlert, 
  Menu, 
  X,
  LogOut,
  LogIn,
  Layers,
  Hospital,
  LayoutDashboard,
  Package,
  Users,
  ChevronDown,
  Ambulance,
  Heart,
  User as UserIcon,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { urgentCount, emergencyList } = useEmergency();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const adminMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target as Node)) {
        setIsAdminMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsAdminMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const baseLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Cấp cứu khẩn', path: '/emergency' },
    { label: 'Bản đồ', path: '/map' },
    { label: 'Sự kiện hiến', path: '/events' },
    { label: 'Quy trình', path: '/process' },
    { label: 'Điều kiện & FAQ', path: '/eligibility' },
  ];

  // Danh mục công cụ Quản trị viên (Phân nhóm trực quan, có icon & mô tả ngắn)
  const adminTools = [
    {
      group: 'CẤP CỨU & ĐIỀU PHỐI',
      items: [
        {
          label: 'Phát lệnh cấp cứu',
          path: '/staff/emergency-request',
          desc: 'Tạo báo động đỏ cần máu hỏa tốc',
          icon: ShieldAlert,
          iconColor: 'text-red-600 bg-red-50 border-red-200',
        },
        {
          label: 'Điều phối xe 115',
          path: '/admin/dispatch',
          desc: 'Giám sát lộ trình giao máu khẩn',
          icon: Ambulance,
          iconColor: 'text-amber-600 bg-amber-50 border-amber-200',
        },
        {
          label: 'Duyệt hiến máu',
          path: '/admin/appointments',
          desc: 'Tiếp nhận & cập nhật kết quả hiến',
          icon: Hospital,
          iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
        },
      ],
    },
    {
      group: 'KHO MÁU & HỆ THỐNG',
      items: [
        {
          label: 'Kho máu FEFO',
          path: '/admin/inventory',
          desc: 'Kiểm soát hạn sử dụng từng túi máu',
          icon: Package,
          iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-200',
        },
        {
          label: 'Dự báo AI 30 ngày',
          path: '/admin/forecast',
          desc: 'Phân tích nguy cơ thâm hụt nhóm máu',
          icon: Layers,
          iconColor: 'text-purple-600 bg-purple-50 border-purple-200',
        },
        {
          label: 'Quản lý tài khoản',
          path: '/admin/users',
          desc: 'Phân quyền người dùng & nhân sự',
          icon: Users,
          iconColor: 'text-slate-600 bg-slate-50 border-slate-200',
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isAdminActive = adminTools.some(group => group.items.some(item => isActive(item.path)));
  const activeEmergencyCases = emergencyList.filter((request) => !request.isDismissed);
  const tickerItems = activeEmergencyCases.length > 0
    ? activeEmergencyCases
    : [{
        id: 'emergency-ready',
        bloodType: 'O-',
        hospital: 'Mạng lưới điều phối máu',
        unitsNeeded: 0,
        deadline: 'Sẵn sàng tiếp nhận yêu cầu 24/7',
      }];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white shadow-sm transition-all">
      <div
        className="w-full border-b border-amber-300 bg-amber-100 text-amber-950 shadow-sm"
        role="region"
        aria-label="Thông báo cấp cứu khẩn"
      >
        <div className="mx-auto flex h-10 max-w-7xl items-center overflow-hidden px-4 sm:px-6 lg:px-8">
          <div className="relative z-10 flex h-full shrink-0 items-center gap-2 border-r border-amber-300 bg-amber-100 pr-3 shadow-[6px_0_12px_rgba(254,243,199,0.95)] sm:pr-4">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-600" />
            </span>
            <Flame className="h-4 w-4 shrink-0 fill-amber-600 text-amber-700" />
            <span className="whitespace-nowrap text-[10px] font-black uppercase tracking-wide text-amber-950 sm:text-xs">
              Báo động đỏ: Cấp cứu khẩn
            </span>
          </div>

          <div className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden pl-3">
            <div className="emergency-alert-track flex w-max items-center">
              {[0, 1].map((group) => (
                <div
                  key={group}
                  aria-hidden={group === 1}
                  className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
                >
                  {tickerItems.map((request) => (
                    <Link
                      key={`${request.id}-${group}`}
                      to="/emergency"
                      tabIndex={group === 1 ? -1 : undefined}
                      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-[11px] text-amber-950 transition hover:bg-white sm:text-xs"
                      title={`Xem yêu cầu cấp cứu tại ${request.hospital}`}
                    >
                      <span className="rounded-full bg-red-700 px-2 py-0.5 font-black text-white">
                        {request.bloodType}
                      </span>
                      <span className="max-w-52 truncate font-semibold sm:max-w-none">
                        {request.hospital}
                      </span>
                      <span className="whitespace-nowrap">
                        {request.unitsNeeded > 0 ? (
                          <>Cần gấp: <strong>{request.unitsNeeded} đơn vị</strong></>
                        ) : (
                          request.deadline
                        )}
                      </span>
                      {request.unitsNeeded > 0 && (
                        <span className="hidden whitespace-nowrap text-amber-800 sm:inline">
                          {request.deadline || 'Đang cần hỗ trợ'}
                        </span>
                      )}
                      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-red-700" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="hidden bg-slate-950 text-slate-300 md:block">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 text-[10px] font-semibold tracking-wide sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Hệ thống điều phối thời gian thực
          </span>
          <a href="tel:19006868" className="flex items-center gap-1.5 transition hover:text-white">
            <span className="text-red-300">Hotline cấp cứu máu 24/7:</span>
            <strong className="text-white">1900 6868</strong>
          </a>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between md:h-[76px]">
          
          {/* 1. BRAND LOGO & TITLE */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group focus:outline-hidden rounded-2xl p-1 shrink-0"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
              <Droplet className="w-6 h-6 fill-white text-white filter drop-shadow-xs animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg md:text-xl tracking-tight text-slate-900 leading-none">
                  BLOOD<span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent font-black">SMART</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 rounded-md border border-red-200/60">
                  24/7
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:inline-block">
                Mạng lưới điều phối máu AI
              </span>
            </div>
          </Link>

          {/* 2. DESKTOP NAVIGATION PILLS (Gọn gàng, chuẩn UI/UX, không bao giờ rớt dòng) */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-0.5 md:flex">
            {baseLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2.5 text-xs font-bold transition-all duration-200 lg:px-3.5 lg:text-[13px] whitespace-nowrap after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
                    active
                      ? 'text-red-700 after:bg-red-600 font-black'
                      : 'text-slate-600 after:bg-transparent hover:text-slate-900 hover:after:bg-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Quyền DONOR: Lối tắt Lịch sử hiến */}
            {user?.role === 'DONOR' && (
              <Link
                to="/my-history"
                className={`px-3.5 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                  isActive('/my-history')
                    ? 'bg-white text-red-600 shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span>Lịch sử hiến</span>
              </Link>
            )}

            {/* Quyền BÁC SĨ (HOSPITAL_STAFF) */}
            {user?.role === 'HOSPITAL_STAFF' && (
              <>
                <Link
                  to="/staff/reception"
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive('/staff/reception')
                      ? 'bg-white text-red-600 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Hospital className="w-3.5 h-3.5" />
                  <span>Tiếp nhận</span>
                </Link>
                <Link
                  to="/staff/emergency-request"
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive('/staff/emergency-request')
                      ? 'bg-white text-red-600 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span>Phát lệnh cấp cứu</span>
                </Link>
                <Link
                  to="/inventory"
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive('/inventory')
                      ? 'bg-white text-red-600 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Package className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tồn kho máu</span>
                </Link>
              </>
            )}

            {/* Quyền ADMIN: Dashboard trực tiếp + Dropdown Menu Quản Trị Hệ Thống */}
            {user?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3.5 py-2 rounded-xl text-xs lg:text-[13px] font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                    isActive('/admin') && !isAdminActive
                      ? 'bg-white text-red-600 shadow-xs font-black'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </Link>

                {/* Dropdown Menu "Quản Trị" phong cách Stripe/Linear */}
                <div className="relative" ref={adminMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                    className={`px-3 py-2 rounded-xl text-xs lg:text-[13px] font-black transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      isAdminActive || isAdminMenuOpen
                        ? 'bg-red-600 text-white shadow-xs shadow-red-500/25'
                        : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Quản trị</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                      isAdminActive || isAdminMenuOpen
                        ? 'bg-white/20 text-white'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      Admin
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAdminMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Flyout Menu Quản Trị Hệ Thống */}
                  {isAdminMenuOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-[520px] p-4 bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-900/15 animate-in fade-in zoom-in-95 duration-150 z-50">
                      <div className="grid grid-cols-2 gap-4">
                        {adminTools.map((group, gIdx) => (
                          <div key={gIdx} className="space-y-2">
                            <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 px-2 block">
                              {group.group}
                            </span>
                            <div className="space-y-1">
                              {group.items.map((item) => {
                                const active = isActive(item.path);
                                const IconComp = item.icon;
                                return (
                                  <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-start gap-2.5 p-2 rounded-2xl transition-all ${
                                      active
                                        ? 'bg-red-50/90 text-red-700'
                                        : 'hover:bg-slate-50 text-slate-800'
                                    }`}
                                  >
                                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${item.iconColor}`}>
                                      <IconComp className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-xs font-black leading-tight flex items-center justify-between">
                                        <span className="truncate">{item.label}</span>
                                      </div>
                                      <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                                        {item.desc}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* 3. RIGHT HEADER ACTIONS (Cấp Cứu SOS & Profile) */}
          <div className="flex items-center gap-2 md:gap-3">
            
            {/* 3D Quick SOS Alert Button */}
            <button
              onClick={() => navigate('/emergency')}
              title="Trung tâm điều phối cấp cứu"
              className="relative px-3 md:px-3.5 py-2 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/25 border border-red-400/40 transition-all duration-200 flex items-center gap-2 active:scale-95 cursor-pointer group whitespace-nowrap shrink-0"
            >
              <div className="relative">
                <Bell className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                  </span>
                )}
              </div>
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Cấp cứu ({urgentCount})
              </span>
            </button>

            {/* User Profile / Login status */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs text-slate-800 text-xs font-bold transition-all cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white flex items-center justify-center font-black text-xs shadow-2xs">
                    {user.role === 'ADMIN' ? 'AD' : user.role === 'HOSPITAL_STAFF' ? 'BS' : (user.bloodType || 'DN')}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="truncate max-w-[110px] leading-tight font-extrabold text-slate-900">
                      {user.fullName || user.phone}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">
                      {user.role === 'ADMIN' ? 'Quản trị viên' : user.role === 'HOSPITAL_STAFF' ? 'Bác sĩ trực' : 'Tình nguyện viên'}
                    </span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 p-2 bg-white/95 backdrop-blur-2xl rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-150 z-50 space-y-1">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-xs font-black text-slate-900 truncate">{user.fullName || user.phone}</div>
                      <div className="text-[11px] text-slate-500 truncate">{user.email || 'Hệ thống BloodSmart'}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-black uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hồ sơ cá nhân</span>
                    </Link>

                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all active:scale-95 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-2xl shadow-md shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button (< 768px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Mở menu"
              className="md:hidden p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. MOBILE DRAWER NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top duration-200">
          {isAuthenticated && user && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {user.role === 'ADMIN' ? 'AD' : user.role === 'HOSPITAL_STAFF' ? 'BS' : (user.bloodType || 'DN')}
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900">{user.fullName || user.phone}</div>
                  <div className="text-xs text-red-600 font-semibold uppercase">{user.role}</div>
                </div>
              </div>
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer bg-red-50 px-2.5 py-1.5 rounded-xl border border-red-200"
              >
                <LogOut className="w-3.5 h-3.5" /> Thoát
              </button>
            </div>
          )}

          {/* Menu chính */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Chức năng chính
            </span>
            {baseLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold ${
                  isActive(item.path)
                    ? 'bg-red-50 text-red-700 font-black'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Quyền DONOR trên Mobile */}
          {user?.role === 'DONOR' && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 px-3 flex items-center gap-1">
                <Heart className="w-3 h-3 text-red-500 fill-red-500" />
                Dành cho người hiến máu
              </span>
              <Link
                to="/my-history"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 shrink-0" />
                <span>Lịch sử hiến máu cá nhân</span>
              </Link>
            </div>
          )}

          {/* Quyền BÁC SĨ (HOSPITAL_STAFF) trên Mobile */}
          {user?.role === 'HOSPITAL_STAFF' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 px-3 flex items-center gap-1">
                <Hospital className="w-3 h-3" />
                Bác sĩ & Nhân viên Y tế
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/staff/reception"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                >
                  <Hospital className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Tiếp nhận</span>
                </Link>
                <Link
                  to="/staff/emergency-request"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600 shrink-0" />
                  <span>Phát lệnh SOS</span>
                </Link>
                <Link
                  to="/inventory"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                >
                  <Package className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Tồn kho máu (Khoa Điều phối)</span>
                </Link>
              </div>
            </div>
          )}

          {/* Công cụ Admin trên Mobile */}
          {user?.role === 'ADMIN' && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-black uppercase tracking-wider text-red-600 px-3 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Công cụ Quản trị viên
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-slate-600" />
                  <span>Dashboard</span>
                </Link>
                {adminTools.flatMap(g => g.items).map((item) => {
                  const IconComp = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-2 truncate"
                    >
                      <IconComp className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-slate-100 text-slate-800 font-bold rounded-xl text-xs"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
