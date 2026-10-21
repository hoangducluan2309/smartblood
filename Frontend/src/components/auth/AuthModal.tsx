import React, { useState, useEffect } from 'react';
import {
  X,
  Heart,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { getPasswordPolicyError } from '../../utils/passwordPolicy.js';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
}) => {
  const { login, register } = useAuth();

  // Tab chuyển đổi: 'login' | 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Hiển thị mật khẩu
  const [showPassword, setShowPassword] = useState(false);

  // Trạng thái Loading và Thông báo
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form State Đăng nhập
  const [loginForm, setLoginForm] = useState({
    email: '',
    matKhau: '',
  });

  // Form State Đăng ký Người hiến máu
  const [registerForm, setRegisterForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    matKhau: '',
    cccd: '',
    diaChi: '',
    bloodAbo: 'O', // A, B, AB, O
    bloodRh: '+',  // +, -
  });

  // Đồng bộ tab khi prop initialTab thay đổi
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setErrorMessage(null);
      setSuccessToast(null);
    }
  }, [isOpen, initialTab]);

  // Đóng modal khi bấm phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Xử lý chuyển tab
  const handleTabChange = (tab: 'login' | 'register') => {
    setActiveTab(tab);
    setErrorMessage(null);
    setSuccessToast(null);
  };

  // 1. Submit Đăng nhập
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!loginForm.email || !loginForm.matKhau) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login({
        email: loginForm.email.trim(),
        matKhau: loginForm.matKhau,
        password: loginForm.matKhau,
      });
      if (result.success || result.user || result.token) {
        setSuccessToast(`Đăng nhập thành công! Chào mừng ${result.user?.hoTen || 'bạn'}.`);
        setTimeout(() => {
          onClose();
          setSuccessToast(null);
        }, 1200);
      } else {
        setErrorMessage(result.message || 'Email hoặc mật khẩu không chính xác.');
      }
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Submit Đăng ký Người hiến máu
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Kiểm tra dữ liệu đầu vào cơ bản phía client
    if (!registerForm.hoTen.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!registerForm.email.trim()) {
      setErrorMessage('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!registerForm.soDienThoai.trim()) {
      setErrorMessage('Vui lòng cung cấp số điện thoại liên hệ.');
      return;
    }
    const passwordPolicyError = getPasswordPolicyError(registerForm.matKhau);
    if (passwordPolicyError) {
      setErrorMessage(passwordPolicyError);
      return;
    }

    // Kết hợp nhóm máu ABO và Rh
    const fullBloodType = `${registerForm.bloodAbo}${registerForm.bloodRh}`;
    const yeuToRhText = registerForm.bloodRh === '+' ? 'Duong' : 'Am';

    setIsSubmitting(true);
    try {
      const result = await register({
        hoTen: registerForm.hoTen.trim(),
        email: registerForm.email.trim(),
        soDienThoai: registerForm.soDienThoai.trim(),
        matKhau: registerForm.matKhau,
        cccd: registerForm.cccd.trim() || undefined,
        diaChi: registerForm.diaChi.trim() || undefined,
        nhomMau: fullBloodType,
        yeuToRh: yeuToRhText,
        vaiTro: 'DONOR',
      });

      if (result.success) {
        setSuccessToast('Đăng ký tài khoản tình nguyện viên hiến máu thành công!');
        setTimeout(() => {
          onClose();
          setSuccessToast(null);
        }, 1200);
      } else {
        setErrorMessage(result.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại thông tin.');
      }
    } catch {
      setErrorMessage('Lỗi hệ thống khi đăng ký. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in zoom-in-95 duration-200">
        {/* Header với thương hiệu SmartBlood - Màu đỏ #D32F2F */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-r from-[#B71C1C] via-[#D32F2F] to-[#EF5350] text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 transition-colors focus:outline-none"
            aria-label="Đóng modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white border border-white/30 shadow-inner">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                Smart<span className="text-rose-200">Blood</span> Portal
              </h2>
              <p className="text-xs text-white/85 font-medium">
                Cổng xác thực & Điều phối hiến máu nhân đạo
              </p>
            </div>
          </div>

          {/* 2 Tab chuyển đổi mượt mà */}
          <div className="flex bg-black/20 p-1 rounded-xl backdrop-blur-xs border border-white/10 mt-3">
            <button
              type="button"
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-[#D32F2F] shadow-md'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('register')}
              className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                activeTab === 'register'
                  ? 'bg-white text-[#D32F2F] shadow-md'
                  : 'text-white/85 hover:text-white hover:bg-white/10'
              }`}
            >
              <Droplet className="w-4 h-4 fill-current" />
              <span>Đăng ký Người hiến máu</span>
            </button>
          </div>
        </div>

        {/* Thân Modal */}
        <div className="p-6">
          {/* Toast thông báo thành công */}
          {successToast && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2.5 text-sm font-medium animate-in slide-in-from-top-2 duration-200 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Alert thông báo lỗi chi tiết */}
          {errorMessage && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm animate-in shake duration-200 shadow-xs">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* =======================================================
              TAB 1: FORM ĐĂNG NHẬP
             ======================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Địa chỉ Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="vidu@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginForm.matKhau}
                    onChange={(e) => setLoginForm({ ...loginForm, matKhau: e.target.value })}
                    placeholder="Nhập mật khẩu..."
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500">
                  Chưa có tài khoản tình nguyện viên?
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-[#D32F2F] hover:underline"
                >
                  Đăng ký ngay
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Gợi ý tài khoản demo kiểm thử */}
              <div className="mt-4 pt-3 border-t border-slate-100 bg-slate-50/80 -mx-6 -mb-6 p-4 rounded-b-2xl">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D32F2F]" />
                  Tài khoản kiểm thử mẫu (Database Seed):
                </p>
                <div className="grid grid-cols-3 gap-1.5 text-[10px] text-slate-600">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'admin@hienmau.vn', matKhau: 'Password@123' })}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-left hover:border-purple-300 hover:bg-purple-50/30 transition-colors"
                  >
                    <span className="font-bold text-purple-600 block">Quản trị viên</span>
                    admin@hienmau.vn
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'staff.choray@hienmau.vn', matKhau: 'Password@123' })}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-left hover:border-emerald-300 hover:bg-emerald-50/30 transition-colors"
                  >
                    <span className="font-bold text-emerald-600 block">Bác sĩ / Y tế</span>
                    staff.choray@...
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginForm({ email: 'nguyenvanan.donor@gmail.com', matKhau: 'Password@123' })}
                    className="p-1.5 bg-white border border-slate-200 rounded-lg text-left hover:border-red-300 hover:bg-red-50/30 transition-colors"
                  >
                    <span className="font-bold text-[#D32F2F] block">Người hiến máu</span>
                    nguyenvanan...
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* =======================================================
              TAB 2: FORM ĐĂNG KÝ NGƯỜI HIẾN MÁU
             ======================================================= */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Họ tên */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Họ và Tên <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={registerForm.hoTen}
                    onChange={(e) => setRegisterForm({ ...registerForm, hoTen: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                  />
                </div>
              </div>

              {/* Email & Số điện thoại */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      placeholder="nguyenvana@gmail.com"
                      className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Số Điện Thoại <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      required
                      value={registerForm.soDienThoai}
                      onChange={(e) => setRegisterForm({ ...registerForm, soDienThoai: e.target.value })}
                      placeholder="0912345678"
                      className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Mật khẩu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mật Khẩu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    maxLength={64}
                    value={registerForm.matKhau}
                    onChange={(e) => setRegisterForm({ ...registerForm, matKhau: e.target.value })}
                    placeholder="Mật khẩu bảo mật..."
                    className="w-full pl-10 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-1 text-[10px] font-medium text-slate-500">
                  8–64 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>

              {/* Chọn Nhóm máu (ABO) & Yếu tố Rh (+/-) */}
              <div className="p-3 bg-rose-50/60 border border-rose-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-[#D32F2F] fill-[#D32F2F]" />
                    Nhóm máu của bạn:
                  </label>
                  <span className="px-2.5 py-0.5 bg-[#D32F2F] text-white font-extrabold text-xs rounded-full shadow-xs">
                    {registerForm.bloodAbo}{registerForm.bloodRh} (Rh{registerForm.bloodRh === '+' ? ' Dương' : ' Âm'})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Nhóm ABO */}
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">Hệ ABO:</span>
                    <div className="grid grid-cols-4 gap-1">
                      {['A', 'B', 'AB', 'O'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, bloodAbo: type })}
                          className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                            registerForm.bloodAbo === type
                              ? 'bg-[#D32F2F] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-red-300'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Yếu tố Rh */}
                  <div>
                    <span className="text-[11px] text-slate-500 font-semibold block mb-1">Yếu tố Rh:</span>
                    <div className="grid grid-cols-2 gap-1">
                      {[
                        { label: 'Rh (+) Dương', val: '+' },
                        { label: 'Rh (-) Âm', val: '-' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setRegisterForm({ ...registerForm, bloodRh: item.val })}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            registerForm.bloodRh === item.val
                              ? 'bg-[#8E0000] text-white shadow-xs'
                              : 'bg-white border border-slate-200 text-slate-700 hover:border-red-300'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CCCD & Địa chỉ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Số CCCD / CMND <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={registerForm.cccd}
                      onChange={(e) => setRegisterForm({ ...registerForm, cccd: e.target.value })}
                      placeholder="00120000xxxx"
                      maxLength={12}
                      className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Địa Chỉ Cư Trú <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={registerForm.diaChi}
                      onChange={(e) => setRegisterForm({ ...registerForm, diaChi: e.target.value })}
                      placeholder="Quận/Huyện, TP.HCM"
                      className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F] transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-bold text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D32F2F] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Xác Nhận Đăng Ký Tình Nguyện Viên</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-center text-xs text-slate-500 pt-1">
                Đã có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-bold text-[#D32F2F] hover:underline"
                >
                  Đăng nhập tại đây
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
