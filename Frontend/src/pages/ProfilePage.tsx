import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Droplet,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { axiosClient } from '../api/axiosClient';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '../types';
import { getPasswordPolicyError } from '../utils/passwordPolicy';

interface ProfileForm {
  hoTen: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
}

const roleLabels: Record<User['role'], string> = {
  ADMIN: 'Quản trị viên',
  HOSPITAL_STAFF: 'Bác sĩ / Nhân viên y tế',
  DONOR: 'Người hiến máu',
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || fallback;
  }
  return fallback;
};

const formatDate = (value?: string) => {
  if (!value) return 'Chưa có thông tin';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Chưa có thông tin';
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};

export const ProfilePage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState<ProfileForm>({
    hoTen: '',
    email: '',
    soDienThoai: '',
    diaChi: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    matKhauHienTai: '',
    matKhauMoi: '',
    xacNhanMatKhau: '',
  });

  // Tự động tải thông tin hồ sơ mới nhất từ server khi mở trang Profile
  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!user) return;
    setForm({
      hoTen: user.hoTen || user.fullName || '',
      email: user.email || '',
      soDienThoai: user.soDienThoai || user.phone || '',
      diaChi: user.diaChi || '',
    });
    try {
      setAvatarUrl(localStorage.getItem(`bloodsmart_profile_avatar_${user.id}`) || '');
    } catch {
      toast.error('Không thể đọc ảnh đại diện đã lưu trong trình duyệt.');
      setAvatarUrl('');
    }
  }, [user]);

  const displayName = form.hoTen || user?.email || 'Người dùng';
  const roleLabel = user ? roleLabels[user.role] : 'Tài khoản BloodSmart';
  const bloodType = useMemo(() => {
    if (user?.bloodType) return user.bloodType;
    if (!user?.nhomMau) return '';
    if (user.nhomMau.includes('+') || user.nhomMau.includes('-')) return user.nhomMau;
    const rh = user.yeuToRh || '';
    const sign = rh.includes('-') || rh.toLowerCase().includes('am') ? '-' : '+';
    return `${user.nhomMau}${sign}`;
  }, [user?.bloodType, user?.nhomMau, user?.yeuToRh]);

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingProfile(true);
    try {
      const profileEndpoint = user?.role === 'ADMIN' ? `/users/${user.id}` : '/auth/profile';
      await axiosClient.put(profileEndpoint, form);
      await refreshProfile();
      toast.success('Đã lưu thông tin hồ sơ.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể lưu hồ sơ. Vui lòng thử lại.'));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.matKhauMoi !== passwordForm.xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    const passwordPolicyError = getPasswordPolicyError(passwordForm.matKhauMoi);
    if (passwordPolicyError) {
      toast.error(passwordPolicyError);
      return;
    }
    setIsChangingPassword(true);
    try {
      await axiosClient.put('/auth/change-password', passwordForm);
      setPasswordForm({ matKhauHienTai: '', matKhauMoi: '', xacNhanMatKhau: '' });
      setShowPasswordForm(false);
      toast.success('Đã đổi mật khẩu thành công.');
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Không thể đổi mật khẩu. Vui lòng thử lại.'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tệp hình ảnh.');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Ảnh đại diện cần có dung lượng tối đa 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        toast.error('Không thể đọc tệp ảnh đã chọn.');
        return;
      }
      try {
        localStorage.setItem(`bloodsmart_profile_avatar_${user.id}`, reader.result);
        setAvatarUrl(reader.result);
        toast.success('Đã cập nhật ảnh trên trình duyệt này.');
      } catch {
        toast.error('Không thể lưu ảnh trong trình duyệt. Hãy chọn ảnh có dung lượng nhỏ hơn.');
      }
    };
    reader.onerror = () => toast.error('Không thể đọc tệp ảnh đã chọn.');
    reader.readAsDataURL(file);
  };

  const joinedDate = formatDate(user?.ngayTao);
  const statusLabel = user?.trangThai === 'HoatDong'
    ? 'Đang hoạt động'
    : user?.trangThai === 'Khoa'
      ? 'Đã khóa'
      : user?.trangThai === 'ChuaKichHoat'
        ? 'Chưa kích hoạt'
        : 'Chưa xác định';

  return (
    <div className="w-full space-y-6 pb-8 animate-in fade-in duration-300">
      <div>
        <p className="text-sm font-medium text-slate-500">Tài khoản / Hồ sơ cá nhân</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Hồ sơ cá nhân</h1>
        <p className="mt-1 text-sm text-slate-500">Xem và cập nhật thông tin tài khoản của bạn.</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <aside className="space-y-5 xl:col-span-1">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-red-700 via-red-600 to-rose-400" />
            <div className="-mt-12 px-6 pb-6">
              <div className="relative inline-block">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-100 text-slate-500 shadow-md">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={`Ảnh đại diện ${displayName}`} className="h-full w-full object-cover" />
                    : <UserRound className="h-11 w-11" />}
                </div>
                <label className="absolute bottom-0 right-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow transition hover:bg-red-700" title="Đổi ảnh đại diện">
                  <Camera className="h-4 w-4" />
                  <input type="file" accept="image/*" className="sr-only" onChange={handleAvatarChange} />
                </label>
              </div>

              <h2 className="mt-3 break-words text-xl font-extrabold text-slate-900">{displayName}</h2>
              <p className="mt-1 break-all text-sm text-slate-500">{user?.email || 'Chưa cập nhật email'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />{roleLabel}
                </span>
                {bloodType ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700">
                    <Droplet className="h-3.5 w-3.5 fill-current" />Nhóm máu: {bloodType}
                  </span>
                ) : user?.role === 'DONOR' ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500" title="Bác sĩ sẽ kiểm tra và xác nhận nhóm máu khi bạn đi hiến máu lần đầu">
                    <Droplet className="h-3.5 w-3.5 text-slate-400" />Chưa xác định nhóm máu (Chờ hiến lần đầu)
                  </span>
                ) : null}
              </div>

              <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><CalendarDays className="h-4 w-4" /></span>
                  <div>
                    <p className="text-xs text-slate-500">Ngày tham gia</p>
                    <p className="text-sm font-bold text-slate-800">{joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></span>
                  <div>
                    <p className="text-xs text-slate-500">Trạng thái tài khoản</p>
                    <p className="text-sm font-bold text-slate-800">{statusLabel}</p>
                  </div>
                </div>
              </div>
              <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                Ảnh đại diện được lưu trên trình duyệt này và không đồng bộ sang thiết bị khác.
              </p>
            </div>
          </section>
        </aside>

        <div className="xl:col-span-2">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><UserRound className="h-5 w-5" /></span>
              <div>
                <h2 className="font-extrabold text-slate-900">Thông tin cá nhân</h2>
                <p className="mt-1 text-sm text-slate-500">Thông tin cập nhật được áp dụng cho tài khoản của bạn.</p>
              </div>
            </div>
            <form onSubmit={handleProfileSubmit} className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Họ và tên <span className="text-red-600">*</span></span>
                <input required maxLength={100} value={form.hoTen} onChange={(event) => setForm({ ...form, hoTen: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" autoComplete="name" />
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Email <span className="text-red-600">*</span></span>
                <span className="relative block">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input required type="email" maxLength={100} value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" autoComplete="email" />
                </span>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Số điện thoại <span className="text-red-600">*</span></span>
                <span className="relative block">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input required type="tel" maxLength={15} value={form.soDienThoai} onChange={(event) => setForm({ ...form, soDienThoai: event.target.value })} className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" autoComplete="tel" />
                </span>
              </label>
              <label className="space-y-1.5">
                <span className="text-sm font-semibold text-slate-700">Nhóm máu</span>
                <span className="relative block">
                  <Droplet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500" />
                  <input value={bloodType || 'Chưa cập nhật'} readOnly className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm text-slate-600 outline-none" />
                </span>
              </label>
              <label className="space-y-1.5 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Địa chỉ</span>
                <span className="relative block">
                  <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea rows={2} maxLength={255} value={form.diaChi} onChange={(event) => setForm({ ...form, diaChi: event.target.value })} placeholder="Nhập địa chỉ của bạn" className="w-full resize-y rounded-xl border border-slate-200 py-3 pl-10 pr-3.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100" autoComplete="street-address" />
                </span>
              </label>
              <div className="flex flex-wrap justify-end gap-3 pt-1 md:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordForm((visible) => !visible)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  <LockKeyhole className="h-4 w-4" />
                  {showPasswordForm ? 'Đóng đổi mật khẩu' : 'Đổi mật khẩu'}
                </button>
                <button type="submit" disabled={isSavingProfile} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60">
                  <Save className="h-4 w-4" />{isSavingProfile ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>

          {showPasswordForm && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                  <LockKeyhole className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="font-extrabold text-slate-900">Cập nhật mật khẩu</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Mật khẩu mới dài 8–64 ký tự, gồm chữ hoa, chữ thường, chữ số và ký tự đặc biệt như !@#.
                  </p>
                </div>
              </div>
              <form onSubmit={handlePasswordSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="space-y-1.5 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Mật khẩu hiện tại</span>
                  <input
                    required
                    type="password"
                    autoComplete="current-password"
                    value={passwordForm.matKhauHienTai}
                    onChange={(event) => setPasswordForm({ ...passwordForm, matKhauHienTai: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Mật khẩu mới</span>
                  <input
                    required
                    minLength={8}
                    maxLength={64}
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.matKhauMoi}
                    onChange={(event) => setPasswordForm({ ...passwordForm, matKhauMoi: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-sm font-semibold text-slate-700">Xác nhận mật khẩu mới</span>
                  <input
                    required
                    minLength={8}
                    maxLength={64}
                    type="password"
                    autoComplete="new-password"
                    value={passwordForm.xacNhanMatKhau}
                    onChange={(event) => setPasswordForm({ ...passwordForm, xacNhanMatKhau: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
                <div className="flex justify-end pt-1 md:col-span-2">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LockKeyhole className="h-4 w-4" />
                    {isChangingPassword ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
