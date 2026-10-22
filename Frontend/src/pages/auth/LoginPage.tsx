import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEscapeToHome } from '../../hooks/useEscapeToHome';
import { isValidCitizenId, isValidPhoneNumber, sanitizeDigits } from '../../utils/inputValidation';
import { getRoleDestination } from '../../utils/roleNavigation';
import { 
  Droplet, 
  Mail, 
  Phone,
  IdCard,
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '../../api/client';
import { X, KeyRound, RotateCcw, CheckCircle2, Clock, Sparkles, ShieldCheck } from 'lucide-react';

type LoginType = 'EMAIL' | 'PHONE' | 'CCCD';

export const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEscapeToHome();

  // Hình thức đăng nhập: Email / SĐT / CCCD
  const [loginType, setLoginType] = useState<LoginType>('EMAIL');
  const [identifier, setIdentifier] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Trạng thái modal Quên mật khẩu & Cấp lại qua Gmail OTP
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [otpExpireSeconds, setOtpExpireSeconds] = useState(0);

  // Đếm ngược cooldown gửi lại OTP (60s)
  useEffect(() => {
    let timer: any;
    if (otpCooldown > 0) {
      timer = setTimeout(() => setOtpCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCooldown]);

  // Đếm ngược thời hạn hiệu lực OTP (5 phút = 300s)
  useEffect(() => {
    let timer: any;
    if (forgotStep === 2 && otpExpireSeconds > 0) {
      timer = setTimeout(() => setOtpExpireSeconds((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotStep, otpExpireSeconds]);

  // Khi modal Quên mật khẩu đang mở: Bấm phím ESC sẽ đóng modal và quay về trang Login
  useEffect(() => {
    if (!isForgotOpen) return;

    const handleEscapeModal = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation(); // Chặn không cho hook useEscapeToHome điều hướng về Trang Chủ
        setIsForgotOpen(false);
      }
    };

    // Sử dụng capture phase (true) để chặn sự kiện trước khi lan ra các listener khác
    window.addEventListener('keydown', handleEscapeModal, true);
    return () => window.removeEventListener('keydown', handleEscapeModal, true);
  }, [isForgotOpen]);

  // Mở modal quên mật khẩu
  const handleOpenForgotModal = () => {
    setForgotStep(1);
    setForgotError(null);
    setForgotSuccess(null);
    setForgotOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
    // Nếu đang gõ sẵn email ở ô đăng nhập thì tự động điền vào
    if (loginType === 'EMAIL' && identifier.includes('@')) {
      setForgotEmail(identifier.trim());
    } else {
      setForgotEmail('');
    }
    setIsForgotOpen(true);
  };

  // Bước 1: Yêu cầu gửi mã OTP về Gmail
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const emailTrim = forgotEmail.trim();
    if (!emailTrim) {
      setForgotError('Vui lòng nhập địa chỉ Email của bạn.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setForgotError('Địa chỉ Email không đúng định dạng.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await apiClient.post('/auth/forgot-password', { email: emailTrim });
      toast.success(res.data?.message || 'Mã OTP xác thực đã được gửi về Gmail!');
      setForgotStep(2);
      setOtpCooldown(60);
      setOtpExpireSeconds(300);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng thử lại!';
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (otpCooldown > 0 || forgotLoading) return;
    await handleRequestOtp();
  };

  // Bước 2: Xác nhận OTP & Đặt mật khẩu mới
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const otpTrim = forgotOtp.trim();
    if (!/^[0-9]{6}$/.test(otpTrim)) {
      setForgotError('Mã OTP phải gồm đúng 6 chữ số.');
      return;
    }

    if (forgotNewPassword.length < 8) {
      setForgotError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await apiClient.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: otpTrim,
        matKhauMoi: forgotNewPassword,
      });

      const successMsg = res.data?.message || 'Đặt lại mật khẩu thành công!';
      setForgotSuccess(successMsg);
      toast.success(successMsg);

      // Điền sẵn email vào form đăng nhập chính
      setLoginType('EMAIL');
      setIdentifier(forgotEmail.trim());
      setMatKhau('');
      setLoginError(null);

      // Tự động đóng modal sau 2 giây
      setTimeout(() => {
        setIsForgotOpen(false);
        setForgotSuccess(null);
      }, 2000);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Xác nhận mã OTP không thành công.';
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const from = (location.state as any)?.from?.pathname;

  // Nếu người dùng đã đăng nhập sẵn thì tự động chuyển hướng vào khu vực tương ứng
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDestination(user.role, from), { replace: true });
    }
  }, [isAuthenticated, user, from, navigate]);

  // Chuyển đổi loại tài khoản đăng nhập
  const handleChangeLoginType = (type: LoginType) => {
    setLoginType(type);
    setIdentifier('');
    setLoginError(null);
  };

  // Xử lý gửi form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!identifier.trim() || !matKhau.trim()) {
      const typeLabel = loginType === 'EMAIL' ? 'Email' : loginType === 'PHONE' ? 'Số điện thoại' : 'Số CCCD';
      toast.error(`Vui lòng nhập đầy đủ ${typeLabel} và Mật khẩu!`);
      return;
    }

    if (loginType === 'PHONE' && !isValidPhoneNumber(identifier.trim())) {
      toast.error('Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.');
      return;
    }
    if (loginType === 'CCCD' && !isValidCitizenId(identifier.trim())) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }

    try {
      const res = await login({ 
        email: identifier.trim(),
        taiKhoan: identifier.trim(),
        soDienThoai: identifier.trim(),
        cccd: identifier.trim(),
        phoneOrEmail: identifier.trim(),
        matKhau,
        password: matKhau
      });
      const userRole = res?.user?.role || user?.role;
      const targetPath = getRoleDestination(userRole, from);
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Đăng nhập không thành công.';
      setLoginError(msg);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 py-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Envato Ambient 3D Glowing Blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-blood"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>

      <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl lg:rounded-[32px] border border-white/40 shadow-2xl shadow-black/40 p-6 sm:p-9 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Logo with 3D Gradient Icon */}
        <div className="text-center space-y-2.5">
          <Link to="/" className="inline-block group focus:outline-hidden">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-red-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Droplet className="w-9 h-9 fill-white filter drop-shadow animate-pulse" />
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Đăng Nhập Hệ Thống
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Mạng Lưới Điều Phối Hiến Máu Cấp Cứu 24/7
            </p>
          </div>
        </div>

        {/* Cảnh báo lỗi sai mật khẩu / tạm khóa tài khoản */}
        {loginError && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 ${
            loginError.includes('bị khóa') || loginError.includes('tạm khóa') || loginError.includes('tạm thời bị')
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-extrabold block">
                {loginError.includes('đã bị khóa') || loginError.includes('hiện đang bị khóa')
                  ? 'Tài Khoản Đã Bị Khóa'
                  : loginError.includes('tạm khóa') || loginError.includes('tạm thời bị')
                  ? 'Tài Khoản Tạm Thời Bị Giới Hạn'
                  : 'Thông Báo Đăng Nhập'}
              </span>
              <span className="font-medium leading-relaxed block">{loginError}</span>
            </div>
          </div>
        )}

        {/* Form Đăng Nhập Chính */}
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />

          {/* LỰA CHỌN ĐĂNG NHẬP: EMAIL / SỐ ĐIỆN THOẠI / CCCD */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Đăng nhập bằng:
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => handleChangeLoginType('EMAIL')}
                className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginType === 'EMAIL'
                    ? 'bg-white text-red-600 shadow-sm shadow-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email</span>
              </button>

              <button
                type="button"
                onClick={() => handleChangeLoginType('PHONE')}
                className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginType === 'PHONE'
                    ? 'bg-white text-red-600 shadow-sm shadow-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Số ĐT</span>
              </button>

              <button
                type="button"
                onClick={() => handleChangeLoginType('CCCD')}
                className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  loginType === 'CCCD'
                    ? 'bg-white text-red-600 shadow-sm shadow-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <IdCard className="w-3.5 h-3.5" />
                <span>CCCD</span>
              </button>
            </div>
          </div>
          
          {/* Ô Nhập Tài Khoản Đăng Nhập */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              {loginType === 'EMAIL' && (
                <>Địa chỉ Email <span className="text-red-600">*</span></>
              )}
              {loginType === 'PHONE' && (
                <>Số điện thoại <span className="text-red-600">*</span></>
              )}
              {loginType === 'CCCD' && (
                <>Số CCCD / Mã định danh <span className="text-red-600">*</span></>
              )}
            </label>
            <div className="relative">
              {loginType === 'EMAIL' && (
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              {loginType === 'PHONE' && (
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}
              {loginType === 'CCCD' && (
                <IdCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              )}

              <input
                type={loginType === 'EMAIL' ? 'text' : 'tel'}
                inputMode={loginType === 'EMAIL' ? 'email' : 'numeric'}
                maxLength={loginType === 'EMAIL' ? 100 : loginType === 'PHONE' ? 10 : 12}
                autoComplete="off"
                required
                placeholder={
                  loginType === 'EMAIL'
                    ? 'Ví dụ: name@example.com'
                    : loginType === 'PHONE'
                    ? 'Ví dụ: 0901234567 (10 chữ số)'
                    : 'Ví dụ: 079090001234 (12 chữ số)'
                }
                value={identifier}
                onChange={(e) => {
                  let val = e.target.value;
                  if (loginType === 'PHONE' || loginType === 'CCCD') {
                    val = sanitizeDigits(val, loginType === 'PHONE' ? 10 : 12);
                  }
                  setIdentifier(val);
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Mật Khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <button
                type="button"
                onClick={handleOpenForgotModal}
                className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer focus:outline-hidden"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Nhập mật khẩu"
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ẩn hiện mật khẩu"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Nút Submit 3D */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer text-sm"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xác thực...</span>
              </div>
            ) : (
              <>
                <span>ĐĂNG NHẬP NGAY</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Chuyển hướng sang trang Đăng Ký */}
        <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
          Chưa có tài khoản tình nguyện viên?{' '}
          <Link to="/register" className="text-red-600 font-black hover:underline">
            Đăng ký Donor ngay
          </Link>
        </div>

      </div>

      {/* ============================================================== */}
      {/* MODAL QUÊN MẬT KHẨU & CẤP LẠI QUA MÃ OTP GMAIL (2 BƯỚC)        */}
      {/* ============================================================== */}
      {isForgotOpen && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsForgotOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div 
            className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl shadow-black/50 overflow-hidden relative animate-in zoom-in-95 duration-200"
            role="dialog"
            aria-modal="true"
          >
            {/* Thanh gradient trên cùng */}
            <div className="h-1.5 w-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

            {/* Header Modal */}
            <div className="p-6 pb-4 flex items-start justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Khôi Phục Mật Khẩu
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Xác thực qua mã OTP gửi về hộp thư Gmail
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg shadow-2xs">
                  ESC
                </kbd>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all cursor-pointer"
                  title="Đóng modal (Esc)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bộ chỉ báo bước */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span className={forgotStep === 1 ? 'text-red-600 font-black' : 'text-slate-600'}>
                  1. Nhập Email Gmail
                </span>
                <span className="text-slate-300">───────</span>
                <span className={forgotStep === 2 ? 'text-red-600 font-black' : 'text-slate-400'}>
                  2. Nhập OTP & Mật Khẩu Mới
                </span>
              </div>
            </div>

            {/* Thông báo lỗi trong modal */}
            {forgotError && (
              <div className="mx-6 my-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 flex items-start gap-2 animate-in fade-in">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Thông báo thành công */}
            {forgotSuccess && (
              <div className="mx-6 my-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{forgotSuccess}</span>
              </div>
            )}

            {/* BƯỚC 1: NHẬP EMAIL ĐỂ NHẬN MÃ OTP */}
            {forgotStep === 1 && (
              <form onSubmit={handleRequestOtp} className="p-6 pt-3 space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Email tài khoản của bạn <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="Ví dụ: nguyenvana@gmail.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    Hệ thống sẽ gửi mã số xác thực OTP (6 chữ số) đến hộp thư này.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang gửi mã...</span>
                      </>
                    ) : (
                      <>
                        <span>GỬI MÃ OTP QUA GMAIL</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* BƯỚC 2: NHẬP MÃ OTP & MẬT KHẨU MỚI */}
            {forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="p-6 pt-3 space-y-4">
                {/* Email nhận mã & thời gian đếm ngược */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="truncate pr-2">
                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Email nhận mã:</span>
                    <span className="font-extrabold text-slate-800 truncate block">{forgotEmail}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 font-bold text-amber-600">
                      <Clock className="w-3.5 h-3.5 animate-pulse" />
                      <span>
                        {Math.floor(otpExpireSeconds / 60)}:
                        {(otpExpireSeconds % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="text-[10px] text-red-600 font-bold hover:underline cursor-pointer"
                    >
                      Đổi email
                    </button>
                  </div>
                </div>

                {/* Ô Nhập Mã OTP 6 Số */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                      Mã xác thực OTP (6 số) <span className="text-red-600">*</span>
                    </label>
                    <button
                      type="button"
                      disabled={otpCooldown > 0 || forgotLoading}
                      onClick={handleResendOtp}
                      className="text-[11px] font-bold text-red-600 hover:underline flex items-center gap-1 disabled:text-slate-400 disabled:no-underline cursor-pointer"
                    >
                      <RotateCcw className={`w-3 h-3 ${forgotLoading ? 'animate-spin' : ''}`} />
                      <span>{otpCooldown > 0 ? `Gửi lại sau (${otpCooldown}s)` : 'Gửi lại mã'}</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                    placeholder="• • • • • •"
                    value={forgotOtp}
                    onChange={(e) => {
                      const val = sanitizeDigits(e.target.value, 6);
                      setForgotOtp(val);
                    }}
                    className="w-full text-center tracking-[0.4em] text-2xl font-black py-2.5 bg-slate-50 border-2 border-red-500/30 focus:border-red-500 focus:bg-white rounded-2xl text-slate-900 focus:outline-hidden transition-all shadow-inner"
                    autoFocus
                  />
                </div>

                {/* Ô Nhập Mật Khẩu Mới */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Mật khẩu mới (Tối thiểu 8 ký tự) <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotNewPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Nhập mật khẩu mới"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotNewPassword(!showForgotNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showForgotNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Ô Nhập Lại Mật Khẩu Mới */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                    Xác nhận mật khẩu mới <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <ShieldCheck className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showForgotConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={8}
                      placeholder="Nhập lại mật khẩu mới"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:bg-white transition-all shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showForgotConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Nút Submit cập nhật mật khẩu */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading || otpExpireSeconds <= 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-red-500/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {forgotLoading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Đang cập nhật...</span>
                      </>
                    ) : (
                      <>
                        <span>XÁC NHẬN ĐỔI MẬT KHẨU</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

