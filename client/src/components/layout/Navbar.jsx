import React, { useState } from 'react';
import { 
  Heart, 
  Menu, 
  X, 
  PhoneCall, 
  QrCode, 
  Flame 
} from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Navbar Component
 * Hỗ trợ chuyển Tab động: Bấm vào menu nào thì view tương ứng sẽ hiển thị
 */
export const Navbar = ({
  currentRole = 'donor',
  onRoleChange,
  activeTab = 'home',
  onSelectTab,
  onOpenRegisterModal,
  onOpenQrModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Danh mục điều hướng với ID tab tương ứng
  const navLinks = [
    { id: 'home', label: 'Trang chủ' },
    { id: 'urgent', label: 'Cấp cứu khẩn', badge: 'Mới' },
    { id: 'inventory', label: 'Kho dự trữ máu' },
    { id: 'process', label: 'Quy trình' },
    { id: 'eligibility', label: 'Điều kiện & FAQ' },
  ];

  const handleNavClick = (tabId) => {
    if (onSelectTab) {
      onSelectTab(tabId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top micro-bar: Hotline khẩn cấp & Demo chuyển vai trò */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-slate-200 font-medium">Hệ thống Điều Phối Thời Gian Thực</span>
            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
              Hotline Cấp cứu máu 24/7: <strong className="text-white">1900 6868</strong>
            </span>
          </div>

          {/* Role Switcher Demo (Phục vụ kiểm thử 3 vai trò: Donor / Hospital / Admin) */}
          <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-700">
            <span className="text-[11px] text-slate-400 hidden sm:inline">Chế độ xem:</span>
            <button
              onClick={() => onRoleChange && onRoleChange('donor')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'donor'
                  ? 'bg-brand-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Người hiến
            </button>
            <button
              onClick={() => onRoleChange && onRoleChange('hospital')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'hospital'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bệnh viện
            </button>
            <button
              onClick={() => onRoleChange && onRoleChange('admin')}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                currentRole === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Quản trị
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 group text-left focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Smart<span className="text-brand-500">Blood</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 bg-brand-50 text-brand-600 rounded">
                  2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block -mt-1 font-medium">
                Điều phối máu nhân đạo & Dự báo khẩn cấp
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-2 sm:gap-4">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 focus:outline-none ${
                    isActive
                      ? 'text-brand-600 bg-brand-50/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                      {link.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-brand-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5">
            {/* Nút giả lập Nhân viên Y tế Quét mã QR */}
            <Button
              variant="outline"
              size="sm"
              leftIcon={<QrCode className="w-4 h-4" />}
              onClick={onOpenQrModal}
              title="Dành cho nhân viên y tế quét QR tra cứu lịch sử & nhập đơn vị máu"
            >
              Quét QR Y Tế
            </Button>

            {/* Nút Đăng ký hiến máu */}
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Heart className="w-4 h-4 fill-white" />}
              onClick={onOpenRegisterModal}
            >
              Đăng ký hiến máu
            </Button>
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={() => onOpenQrModal && onOpenQrModal()}
              className="p-2 text-slate-700 hover:text-brand-500 rounded-lg border border-slate-200"
              title="Quét QR"
            >
              <QrCode className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-brand-500 rounded-lg focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navLinks.map((link) => {
              const isActive = activeTab === link.id;

              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-base font-semibold rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {link.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<Heart className="w-4 h-4 fill-white" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRegisterModal && onOpenRegisterModal();
              }}
            >
              Đăng ký hiến máu ngay
            </Button>

            <Button
              variant="outline"
              fullWidth
              leftIcon={<QrCode className="w-4 h-4" />}
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenQrModal && onOpenQrModal();
              }}
            >
              Quét QR kiểm tra (Nhân viên)
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};
