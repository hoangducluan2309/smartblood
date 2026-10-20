import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEscapeToHome } from '../../hooks/useEscapeToHome';
import { isValidCitizenId, isValidPhoneNumber, sanitizeDigits, sanitizeFullName } from '../../utils/inputValidation';
import { getPasswordPolicyError } from '../../utils/passwordPolicy';
import { 
  User, 
  Mail, 
  Phone, 
  IdCard,
  Lock, 
  Eye, 
  EyeOff, 
  Heart, 
  Droplet, 
  ArrowRight, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export const RegisterPage: React.FC = () => {
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  useEscapeToHome();

  // Form states
  const [hoTen, setHoTen] = useState('');
  const [cccd, setCccd] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (isAuthenticated) {
    return <Navigate to="/book-appointment" replace />;
  }

  // Hàm validate phía client
  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!hoTen.trim()) {
      errs.hoTen = 'Họ và tên không được để trống';
    } else if (/\d/.test(hoTen)) {
      errs.hoTen = 'Họ và tên chỉ được chứa chữ cái, không được chứa số';
    } else if (hoTen.trim().split(/\s+/).length < 2) {
      errs.hoTen = 'Vui lòng nhập đầy đủ cả họ và tên (tối thiểu 2 từ)';
    }

    if (!cccd.trim()) {
      errs.cccd = 'Số CCCD/Định danh không được để trống';
    } else if (!isValidCitizenId(cccd.trim())) {
      errs.cccd = 'Số CCCD phải gồm đúng 12 chữ số';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Email không được để trống';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Định dạng email không hợp lệ (ví dụ: user@example.com)';
    }

    if (!soDienThoai.trim()) {
      errs.soDienThoai = 'Số điện thoại không được để trống';
    } else if (!soDienThoai.trim().startsWith('0')) {
      errs.soDienThoai = 'Số điện thoại phải bắt đầu bằng số 0';
    } else if (!isValidPhoneNumber(soDienThoai.trim())) {
      errs.soDienThoai = 'Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số';
    }

    if (!matKhau) {
      errs.matKhau = 'Mật khẩu không được để trống';
    } else {
      const passwordPolicyError = getPasswordPolicyError(matKhau);
      if (passwordPolicyError) errs.matKhau = passwordPolicyError;
    }

    if (matKhau !== xacNhanMatKhau) {
      errs.xacNhanMatKhau = 'Mật khẩu xác nhận không trùng khớp';
    }

    if (!agreedTerms) {
      errs.agreedTerms = 'Bạn cần đồng ý với điều khoản tình nguyện viên';
    }

    setErrors(errs);
    return { isValid: Object.keys(errs).length === 0, errs };
  };

  // Xử lý gửi form đăng ký
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm();
    if (!validation.isValid) {
      const firstError = Object.values(validation.errs)[0] || 'Vui lòng kiểm tra lại thông tin form!';
      toast.error(firstError);
      return;
    }

    try {
      const payload = {
        email: email.trim(),
        matKhau,
        password: matKhau,
        hoTen: hoTen.trim(),
        fullName: hoTen.trim(),
        soDienThoai: soDienThoai.trim(),
        phone: soDienThoai.trim(),
        cccd: cccd.trim(),
        nhomMau: null,
        yeuToRh: null,
        bloodType: null,
        role: 'DONOR' as const,
      };

      await register(payload);
      navigate('/login', {
        replace: true,
        state: { from: { pathname: '/book-appointment' } },
      });
    } catch {
      // Lỗi được thông báo qua AuthContext toast
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 py-12 px-4 sm:px-6 relative overflow-hidden">
      
      {/* Envato Ambient 3D Glowing Blurs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-blood"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-float-slow"></div>

      <div className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl lg:rounded-[36px] border border-white/40 shadow-2xl shadow-black/40 p-6 sm:p-9 space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header Logo */}
        <div className="text-center space-y-2.5">
          <Link to="/" className="inline-block group focus:outline-hidden">
            <div className="w-16 h-16 bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl shadow-red-500/30 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
              <Heart className="w-9 h-9 fill-white filter drop-shadow animate-pulse" />
            </div>
          </Link>
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              Đăng Ký Người Hiến Máu
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Gia nhập cộng đồng tình nguyện viên sẵn sàng hiến máu cứu người
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4 sm:space-y-5">
          <input type="text" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          <input type="password" style={{ display: 'none' }} tabIndex={-1} aria-hidden="true" />
          
          {/* 1. Họ và tên */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Họ và tên đầy đủ <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoComplete="off"
                placeholder="Ví dụ: Nguyễn Văn An"
                value={hoTen}
                onChange={(e) => {
                  const raw = e.target.value;
                  const hadDigit = /\d/.test(raw);
                  const cleanVal = sanitizeFullName(raw);
                  setHoTen(cleanVal);
                  if (hadDigit) {
                    setErrors((prev) => ({ ...prev, hoTen: 'Họ và tên chỉ được chứa chữ cái, không được chứa số' }));
                  } else if (errors.hoTen) {
                    setErrors((prev) => ({ ...prev, hoTen: '' }));
                  }
                }}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                  errors.hoTen ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                }`}
              />
            </div>
            {errors.hoTen && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.hoTen}</p>}
          </div>

          {/* 2. Số CCCD */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Số CCCD / Mã định danh cá nhân <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <IdCard className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{12}"
                required
                maxLength={12}
                autoComplete="off"
                placeholder="Ví dụ: 079090001234 (đúng 12 chữ số)"
                value={cccd}
                onChange={(e) => {
                  const val = sanitizeDigits(e.target.value, 12);
                  setCccd(val);
                  if (errors.cccd) setErrors((prev) => ({ ...prev, cccd: '' }));
                }}
                className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                  errors.cccd ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                }`}
              />
            </div>
            {errors.cccd && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.cccd}</p>}
          </div>

          {/* 3. Email & Số điện thoại */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Địa chỉ Email <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  autoComplete="off"
                  placeholder="Ví dụ: name@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                    errors.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Số điện thoại <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="0[0-9]{9}"
                  required
                  maxLength={10}
                  autoComplete="off"
                  placeholder="Ví dụ: 0901234567 (10 số, bắt đầu bằng số 0)"
                  value={soDienThoai}
                  onChange={(e) => {
                    let raw = e.target.value.replace(/\D/g, '');
                    if (raw.startsWith('84') && raw.length >= 11) {
                      raw = '0' + raw.slice(2);
                    }
                    const val = raw.slice(0, 10);
                    if (val.length > 0 && !val.startsWith('0')) {
                      setErrors((prev) => ({ ...prev, soDienThoai: 'Số điện thoại phải bắt đầu bằng số 0' }));
                      return;
                    }
                    setSoDienThoai(val);
                    if (errors.soDienThoai) setErrors((prev) => ({ ...prev, soDienThoai: '' }));
                  }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                    errors.soDienThoai ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                  }`}
                />
              </div>
              {errors.soDienThoai && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.soDienThoai}</p>}
            </div>
          </div>

          {/* 5. Mật khẩu & Xác nhận mật khẩu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={64}
                  placeholder="Ví dụ: Password@123"
                  value={matKhau}
                  onChange={(e) => { setMatKhau(e.target.value); if (errors.matKhau) setErrors({ ...errors, matKhau: '' }); }}
                  className={`w-full pl-11 pr-11 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                    errors.matKhau ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Ẩn hiện mật khẩu"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.matKhau && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.matKhau}</p>}
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Xác nhận mật khẩu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={64}
                  placeholder="Ví dụ: Password@123"
                  value={xacNhanMatKhau}
                  onChange={(e) => { setXacNhanMatKhau(e.target.value); if (errors.xacNhanMatKhau) setErrors({ ...errors, xacNhanMatKhau: '' }); }}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-50 border rounded-2xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:bg-white transition-all shadow-inner ${
                    errors.xacNhanMatKhau ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-red-500/20 focus:border-red-500'
                  }`}
                />
              </div>
              {errors.xacNhanMatKhau && <p className="text-[11px] text-red-600 font-semibold mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.xacNhanMatKhau}</p>}
            </div>
            <p className="sm:col-span-2 -mt-2 text-[11px] font-medium text-slate-500">
              Yêu cầu: 8–64 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
            </p>
          </div>

          {/* 6. Điều khoản cam kết */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-red-600 rounded cursor-pointer"
              />
              <span className="text-xs text-slate-600 font-medium leading-relaxed">
                Tôi xác nhận thông tin trên là chính xác và sẵn sàng tham gia cộng đồng tình nguyện viên hiến máu cứu người.
              </span>
            </label>
            {errors.agreedTerms && <p className="text-[11px] text-red-600 font-semibold mt-1"><AlertCircle className="w-3 h-3 inline mr-1" />{errors.agreedTerms}</p>}
          </div>

          {/* Nút Submit 3D */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl shadow-xl shadow-red-500/30 flex items-center justify-center gap-2.5 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer text-base"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang xử lý đăng ký...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>HOÀN TẤT ĐĂNG KÝ DONOR</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Chuyển hướng sang Đăng Nhập */}
        <div className="pt-2 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            state={{ from: { pathname: '/book-appointment' } }}
            className="text-red-600 font-black hover:underline"
          >
            Đăng nhập tại đây
          </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
