import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEscapeToHome } from '../../hooks/useEscapeToHome';
import { isValidCitizenId, isValidPhoneNumber, sanitizeDigits } from '../../utils/inputValidation';
import { 
  Droplet, 
  Mail, 
  Phone,
  IdCard,
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Heart, 
  Hospital, 
  ShieldCheck,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

type LoginType = 'EMAIL' | 'PHONE' | 'CCCD';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEscapeToHome();

  // Hình thức đăng nhập: Email / SĐT / CCCD
  const [loginType, setLoginType] = useState<LoginType>('EMAIL');
  const [identifier, setIdentifier] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  // Chuyển đổi loại tài khoản đăng nhập
  const handleChangeLoginType = (type: LoginType) => {
    setLoginType(type);
    setIdentifier('');
  };

  // Xử lý gửi form đăng nhập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!identifier.trim() || !matKhau.trim()) {
      const typeLabel = loginType === 'EMAIL' ? 'Email' : loginType === 'PHONE' ? 'Số điện thoại' : 'Số CCCD';
      toast.error(`Vui lòng nhập đầy đủ ${typeLabel} và Mật khẩu!`);
      return;
    }

    if (loginType === 'PHONE' && !isValidPhoneNumber(identifier.trim())) {
      toast.error('Số điện thoại phải gồm đúng 10 chữ số.');
      return;
    }
    if (loginType === 'CCCD' && !isValidCitizenId(identifier.trim())) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }

    try {
      await login({ 
        email: identifier.trim(),
        taiKhoan: identifier.trim(),
        soDienThoai: identifier.trim(),
        cccd: identifier.trim(),
        phoneOrEmail: identifier.trim(),
        matKhau: matKhau.trim(),
        password: matKhau.trim()
      });
      navigate(from, { replace: true });
    } catch {
      // Thông báo lỗi đã được AuthContext toast
    }
  };

  // Nút điền nhanh dữ liệu mẫu demo chuẩn CSDL Backend
  const handleFastLogin = (demoAccount: string, roleName: string) => {
    setLoginType('EMAIL');
    setIdentifier(demoAccount);
    setMatKhau('Password@123');
    toast.success(`Đã chọn tài khoản mẫu [${roleName}]. Nhấn 'ĐĂNG NHẬP NGAY' để tiếp tục!`, {
      icon: '⚡',
      duration: 3000,
    });
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

        {/* 3 Nút Đăng Nhập Mẫu Nhanh để Demo (Khớp 100% CSDL Backend) */}
        <div className="p-3 bg-slate-100/80 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 px-1">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500" /> Tài khoản mẫu chấm bài:</span>
            <span className="text-[10px] text-red-600 font-bold">1 Click điền</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleFastLogin('nguyenvanan.donor@gmail.com', 'Donor')}
              className="py-2.5 px-1.5 bg-white hover:bg-red-50 hover:border-red-400 text-slate-700 hover:text-red-600 border border-slate-200 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span className="text-[11px]">1. Donor</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin('staff.choray@hienmau.vn', 'Bác sĩ')}
              className="py-2.5 px-1.5 bg-white hover:bg-blue-50 hover:border-blue-400 text-slate-700 hover:text-blue-600 border border-slate-200 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
            >
              <Hospital className="w-4 h-4 text-blue-600" />
              <span className="text-[11px]">2. Bác sĩ</span>
            </button>

            <button
              type="button"
              onClick={() => handleFastLogin('admin@hienmau.vn', 'Admin')}
              className="py-2.5 px-1.5 bg-white hover:bg-purple-50 hover:border-purple-400 text-slate-700 hover:text-purple-600 border border-slate-200 rounded-xl text-xs font-black transition-all flex flex-col items-center gap-1 shadow-2xs active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-[11px]">3. Admin</span>
            </button>
          </div>
        </div>

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
              <a 
                href="#forgot" 
                onClick={(e) => { e.preventDefault(); toast('Vui lòng liên hệ quản trị viên để cấp lại mật khẩu!', { icon: 'ℹ️' }); }}
                className="text-[11px] font-bold text-red-600 hover:underline"
              >
                Quên mật khẩu?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                placeholder="Ví dụ: Password@123"
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
    </div>
  );
};

export default LoginPage;
