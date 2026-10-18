import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import { isValidCitizenId, isValidPhoneNumber, sanitizeDigits } from '../../utils/inputValidation';
import { getPasswordPolicyError } from '../../utils/passwordPolicy';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Hospital, 
  Heart, 
  Search, 
  RefreshCw, 
  Pencil, 
  Trash2, 
  Lock, 
  Unlock, 
  KeyRound,
  X, 
  Save, 
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UserItem {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  cccd?: string | null;
  nhomMau?: string | null;
  yeuToRh?: string | null;
  diaChi?: string | null;
  vaiTro: 'ADMIN' | 'HOSPITAL_STAFF' | 'DONOR';
  trangThai: 'HoatDong' | 'Khoa' | string;
  ngayTao?: string;
  ngayCapNhat?: string;
}

const BLOOD_OPTIONS = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

export const UserManagementPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal Thêm mới
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    soDienThoai: '',
    cccd: '',
    vaiTro: 'DONOR' as 'ADMIN' | 'HOSPITAL_STAFF' | 'DONOR',
    nhomMau: 'O+',
    diaChi: '',
    trangThai: 'HoatDong',
  });

  // Modal Sửa
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [editForm, setEditForm] = useState({
    hoTen: '',
    email: '',
    soDienThoai: '',
    cccd: '',
    vaiTro: 'DONOR' as 'ADMIN' | 'HOSPITAL_STAFF' | 'DONOR',
    nhomMau: 'O+',
    diaChi: '',
    trangThai: 'HoatDong',
  });

  // Modal Xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  const [passwordResetUser, setPasswordResetUser] = useState<UserItem | null>(null);
  const [passwordResetForm, setPasswordResetForm] = useState({ matKhauMoi: '', xacNhanMatKhau: '' });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tải danh sách người dùng từ API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axiosClient.get('/users', {
        params: { limit: 100 },
      });
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data;
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch {
      toast.error('Không thể tải danh sách tài khoản người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý Thêm người dùng (POST /api/v1/users)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.hoTen.trim() || !addForm.email.trim() || !addForm.matKhau.trim() || !addForm.soDienThoai.trim()) {
      toast.error('Vui lòng điền đầy đủ Họ tên, Email, Mật khẩu và Số điện thoại!');
      return;
    }

    const createPasswordError = getPasswordPolicyError(addForm.matKhau);
    if (createPasswordError) {
      toast.error(createPasswordError);
      return;
    }
    if (!isValidPhoneNumber(addForm.soDienThoai)) {
      toast.error('Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.');
      return;
    }
    if (addForm.cccd && !isValidCitizenId(addForm.cccd)) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.post('/users', {
        hoTen: addForm.hoTen.trim(),
        email: addForm.email.trim(),
        matKhau: addForm.matKhau,
        soDienThoai: addForm.soDienThoai.trim(),
        cccd: addForm.cccd.trim() || undefined,
        vaiTro: addForm.vaiTro,
        nhomMau: addForm.nhomMau,
        diaChi: addForm.diaChi.trim() || undefined,
        trangThai: addForm.trangThai,
      });

      toast.success(`Tạo thành công tài khoản [${addForm.hoTen}]!`);
      setIsAddModalOpen(false);
      setAddForm({
        hoTen: '',
        email: '',
        matKhau: '',
        soDienThoai: '',
        cccd: '',
        vaiTro: 'DONOR',
        nhomMau: 'O+',
        diaChi: '',
        trangThai: 'HoatDong',
      });
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi tạo tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal Sửa
  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditForm({
      hoTen: user.hoTen || '',
      email: user.email || '',
      soDienThoai: user.soDienThoai || '',
      cccd: user.cccd || '',
      vaiTro: user.vaiTro || 'DONOR',
      nhomMau: user.nhomMau || 'O+',
      diaChi: user.diaChi || '',
      trangThai: user.trangThai || 'HoatDong',
    });
    setIsEditModalOpen(true);
  };

  // Xử lý Cập nhật (PUT /api/v1/users/:id)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!isValidPhoneNumber(editForm.soDienThoai)) {
      toast.error('Số điện thoại phải bắt đầu bằng số 0 và gồm đúng 10 chữ số.');
      return;
    }
    if (editForm.cccd && !isValidCitizenId(editForm.cccd)) {
      toast.error('Số CCCD phải gồm đúng 12 chữ số.');
      return;
    }
    try {
      setIsSubmitting(true);
      const payload: any = {
        hoTen: editForm.hoTen.trim(),
        email: editForm.email.trim(),
        soDienThoai: editForm.soDienThoai.trim(),
        cccd: editForm.cccd.trim() || null,
        vaiTro: editForm.vaiTro,
        nhomMau: editForm.nhomMau,
        diaChi: editForm.diaChi.trim() || null,
        trangThai: editForm.trangThai,
      };

      await axiosClient.put(`/users/${editingUser.id}`, payload);
      toast.success(`Cập nhật thành công tài khoản [${editForm.hoTen}]!`);
      setIsEditModalOpen(false);
      setEditingUser(null);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordResetUser) return;
    if (passwordResetForm.matKhauMoi !== passwordResetForm.xacNhanMatKhau) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    const passwordPolicyError = getPasswordPolicyError(passwordResetForm.matKhauMoi);
    if (passwordPolicyError) {
      toast.error(passwordPolicyError);
      return;
    }

    try {
      setIsSubmitting(true);
      await axiosClient.put(`/users/${passwordResetUser.id}/password`, {
        matKhauMoi: passwordResetForm.matKhauMoi,
      });
      toast.success(`Đã đổi mật khẩu cho tài khoản [${passwordResetUser.hoTen}].`);
      setPasswordResetUser(null);
      setPasswordResetForm({ matKhauMoi: '', xacNhanMatKhau: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể đổi mật khẩu tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Khóa / Mở khóa nhanh (PUT /api/v1/users/:id/status)
  const handleToggleStatus = async (user: UserItem) => {
    if (currentUser && currentUser.id === user.id.toString()) {
      toast.error('Bạn không thể tự khóa tài khoản của chính mình!');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await axiosClient.put(`/users/${user.id}/status`);
      toast.success(res.data?.message || 'Đã thay đổi trạng thái tài khoản!');
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi thay đổi trạng thái.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mở modal Xóa
  const handleOpenDelete = (user: UserItem) => {
    if (currentUser && currentUser.id === user.id.toString()) {
      toast.error('Bạn không thể xóa tài khoản Quản trị viên đang đăng nhập!');
      return;
    }
    setDeletingUser(user);
    setIsDeleteModalOpen(true);
  };

  // Xóa tài khoản (DELETE /api/v1/users/:id)
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    try {
      setIsSubmitting(true);
      await axiosClient.delete(`/users/${deletingUser.id}`);
      toast.success(`Đã xóa vĩnh viễn tài khoản [${deletingUser.hoTen}]!`);
      setIsDeleteModalOpen(false);
      setDeletingUser(null);
      await fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi xóa tài khoản.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Số liệu thống kê
  const totalCount = users.length;
  const adminCount = users.filter((u) => u.vaiTro === 'ADMIN').length;
  const staffCount = users.filter((u) => u.vaiTro === 'HOSPITAL_STAFF').length;
  const donorCount = users.filter((u) => u.vaiTro === 'DONOR').length;

  // Lọc danh sách
  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.vaiTro === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.trangThai === statusFilter;
    const name = u.hoTen || '';
    const email = u.email || '';
    const phone = u.soDienThoai || '';
    const cccd = u.cccd || '';

    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      cccd.includes(searchTerm) ||
      u.id.toString().includes(searchTerm);

    return matchRole && matchStatus && matchSearch;
  });

  // Tự động quay về trang 1 khi thay đổi điều kiện lọc hoặc số dòng / trang
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, statusFilter, itemsPerPage]);

  // Tính toán phân trang
  const totalFiltered = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 text-white text-xs font-black mb-1.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>Hệ Thống Phân Quyền & Quản Trị CSDL Người Dùng</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            Quản Lý Tài Khoản Người Dùng
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Phân quyền tài khoản Quản trị viên, Bác sĩ/Nhân viên y tế và Tình nguyện viên hiến máu
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { fetchUsers(); toast.success('Đã làm mới danh sách tài khoản!'); }}
            className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 rounded-2xl transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-red-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-red-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" /> Thêm Tài Khoản Mới
          </button>
        </div>
      </div>

      {/* 2. Bốn thẻ tóm tắt số lượng (Vivid 3D Metric Cards with Vibrant Icons & Gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Tổng Tài Khoản */}
        <div className="p-5 sm:p-6 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" /> Tổng Tài Khoản
            </span>
            <div className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{totalCount}</div>
            <span className="text-xs text-slate-500 font-semibold block">Đang hoạt động trong CSDL</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center shadow-lg shadow-slate-900/25 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
            <Users className="w-7 h-7" />
          </div>
        </div>

        {/* Card 2: Quản Trị Viên (Admin) */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white backdrop-blur-md rounded-3xl border border-purple-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Quản Trị Viên (Admin)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-purple-900 tracking-tight">{adminCount}</div>
            <span className="text-xs text-purple-700 font-bold block">Toàn quyền kiểm soát hệ thống</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform relative z-10">
            <ShieldCheck className="w-7 h-7" />
          </div>
        </div>

        {/* Card 3: Bác Sĩ / Y Tế (Staff) */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-blue-50/90 via-sky-50/40 to-white backdrop-blur-md rounded-3xl border border-blue-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
              <Hospital className="w-3.5 h-3.5 text-blue-600" /> Bác Sĩ / Y Tế
            </span>
            <div className="text-3xl sm:text-4xl font-black text-blue-900 tracking-tight">{staffCount}</div>
            <span className="text-xs text-blue-700 font-bold block">Nhân viên bệnh viện tiếp nhận</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
            <Hospital className="w-7 h-7" />
          </div>
        </div>

        {/* Card 4: Donor (Tình Nguyện Viên) */}
        <div className="p-5 sm:p-6 bg-gradient-to-br from-red-50/90 via-rose-50/40 to-white backdrop-blur-md rounded-3xl border border-red-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-red-700 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-red-600 text-red-600" /> Người Hiến (Donor)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight">{donorCount}</div>
            <span className="text-xs text-red-700 font-bold block">Tình nguyện viên hiến máu</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform relative z-10">
            <Heart className="w-7 h-7 fill-white text-white" />
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm & Bộ lọc (Envato Glass Pill Bar) */}
      <div className="bg-white/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Họ tên, Email, Số điện thoại, Số CCCD..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 shadow-inner transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Lọc theo Vai trò */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả vai trò</option>
            <option value="ADMIN">Quản trị viên (ADMIN)</option>
            <option value="HOSPITAL_STAFF">Bác sĩ (HOSPITAL_STAFF)</option>
            <option value="DONOR">Người hiến (DONOR)</option>
          </select>

          {/* Lọc theo Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs font-black text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="HoatDong">Đang hoạt động</option>
            <option value="Khoa">Đã bị khóa</option>
          </select>
        </div>
      </div>

      {/* 4. Bảng danh sách tài khoản */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-700 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Mã #ID</th>
                <th className="py-3 px-4">Họ và Tên</th>
                <th className="py-3 px-4">Email / Tài khoản</th>
                <th className="py-3 px-4">Số Điện Thoại</th>
                <th className="py-3 px-4">Số CCCD</th>
                <th className="py-3 px-4">Vai Trò</th>
                <th className="py-3 px-4">Nhóm Máu</th>
                <th className="py-3 px-4">Trạng Thái</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold">Không tìm thấy tài khoản người dùng nào.</p>
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((item) => {
                  const isCurrent = currentUser && currentUser.id === item.id.toString();
                  const isLocked = item.trangThai === 'Khoa';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-400">
                        #{item.id}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span>{item.hoTen}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[9px] font-black">
                              BẠN
                            </span>
                          )}
                        </div>
                        {item.diaChi && (
                          <span className="text-[10px] text-slate-400 font-normal block truncate max-w-xs">
                            {item.diaChi}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {item.email}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {item.soDienThoai}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {item.cccd || <span className="text-slate-300 italic">Chưa có</span>}
                      </td>

                      {/* Badge Vai trò */}
                      <td className="py-3.5 px-4">
                        {item.vaiTro === 'ADMIN' && (
                          <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-black text-[11px] inline-flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {item.vaiTro === 'HOSPITAL_STAFF' && (
                          <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 font-black text-[11px] inline-flex items-center gap-1">
                            <Hospital className="w-3 h-3" /> Bác Sĩ
                          </span>
                        )}
                        {item.vaiTro === 'DONOR' && (
                          <span className="px-2.5 py-1 rounded-lg bg-red-100 text-blood-dark font-black text-[11px] inline-flex items-center gap-1">
                            <Heart className="w-3 h-3" /> Người Hiến
                          </span>
                        )}
                      </td>

                      {/* Nhóm máu */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {item.nhomMau ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-blood-primary font-black">
                            {item.nhomMau}
                          </span>
                        ) : (
                          <span className="text-slate-300 italic text-[11px]">Chưa xác định</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-blood-primary font-bold text-[10px] inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bị Khóa
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Hoạt Động
                          </span>
                        )}
                      </td>

                      {/* Thao tác CRUD */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Chỉnh sửa tài khoản"
                            className="p-1.5 hover:bg-blue-50 text-slate-500 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setPasswordResetUser(item);
                              setPasswordResetForm({ matKhauMoi: '', xacNhanMatKhau: '' });
                            }}
                            disabled={Boolean(isCurrent)}
                            title={isCurrent ? 'Đổi mật khẩu của bạn trong Hồ sơ cá nhân' : 'Đổi mật khẩu tài khoản'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isCurrent ? 'cursor-not-allowed opacity-30' : 'cursor-pointer text-indigo-600 hover:bg-indigo-50'
                            }`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleToggleStatus(item)}
                            disabled={Boolean(isCurrent)}
                            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent ? 'opacity-30 cursor-not-allowed' : isLocked ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            {isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleOpenDelete(item)}
                            disabled={Boolean(isCurrent)}
                            title="Xóa vĩnh viễn tài khoản"
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isCurrent ? 'opacity-30 cursor-not-allowed' : 'text-slate-400 hover:text-blood-primary hover:bg-red-50'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Thanh Phân Trang Hiện Đại Chuẩn Envato 3D */}
        <div className="p-4 sm:px-6 bg-slate-50/90 border-t border-slate-200/90 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
          
          {/* Thông tin số lượng hiển thị */}
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span>
              Hiển thị <span className="text-slate-900 font-black">{totalFiltered > 0 ? startIndex + 1 : 0}</span> - <span className="text-slate-900 font-black">{endIndex}</span> trong tổng số <span className="text-purple-700 font-black">{totalFiltered}</span> tài khoản
            </span>
          </div>

          {/* Điều khiển phân trang */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            
            {/* Chọn số dòng mỗi trang */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold text-[11px]">Số dòng / trang:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl font-black text-slate-800 text-xs focus:outline-hidden cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </select>
            </div>

            {/* Cụm nút chuyển trang */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                title="Trang đầu"
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Trang trước"
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {/* Các nút số trang */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 5) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="px-1 text-slate-400 font-bold">...</span>}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`min-w-8 h-8 px-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                            currentPage === p
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/30 scale-105'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Trang sau"
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                title="Trang cuối"
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs active:scale-95"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 5. MODAL THÊM TÀI KHOẢN MỚI (POST /api/v1/users) */}
      {/* ============================================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-blood-primary flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Thêm Tài Khoản Mới</h3>
                  <p className="text-xs text-slate-500">Tạo mới tài khoản Admin, Bác sĩ hoặc Người hiến</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Họ và tên đầy đủ <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bác Sĩ Trần Văn A"
                  value={addForm.hoTen}
                  onChange={(e) => setAddForm({ ...addForm, hoTen: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              {/* Email & Mật khẩu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email <span className="text-blood-primary">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="user@example.com"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mật khẩu ban đầu <span className="text-blood-primary">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="8–64 ký tự, có hoa/thường/số/ký tự đặc biệt"
                    value={addForm.matKhau}
                    minLength={8}
                    maxLength={64}
                    onChange={(e) => setAddForm({ ...addForm, matKhau: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Số điện thoại & CCCD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Số điện thoại <span className="text-blood-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    placeholder="Ví dụ: 0901234567"
                    maxLength={10}
                    value={addForm.soDienThoai}
                    onChange={(e) => setAddForm({ ...addForm, soDienThoai: sanitizeDigits(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Số CCCD (12 số)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{12}"
                    placeholder="Ví dụ: 079090001234"
                    maxLength={12}
                    value={addForm.cccd}
                    onChange={(e) => setAddForm({ ...addForm, cccd: sanitizeDigits(e.target.value, 12) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              {/* Vai trò & Nhóm máu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Vai trò người dùng <span className="text-blood-primary">*</span>
                  </label>
                  <select
                    value={addForm.vaiTro}
                    onChange={(e) => setAddForm({ ...addForm, vaiTro: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                  >
                    <option value="DONOR">Người hiến máu (DONOR)</option>
                    <option value="HOSPITAL_STAFF">Bác sĩ / Y tế (HOSPITAL_STAFF)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nhóm Máu
                  </label>
                  <select
                    value={addForm.nhomMau}
                    onChange={(e) => setAddForm({ ...addForm, nhomMau: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                  >
                    {BLOOD_OPTIONS.map((b) => (
                      <option key={b} value={b}>Nhóm {b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bệnh viện Chợ Rẫy, Quận 5, TP.HCM"
                  value={addForm.diaChi}
                  onChange={(e) => setAddForm({ ...addForm, diaChi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blood-primary/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 6. MODAL CHỈNH SỬA TÀI KHOẢN (PUT /api/v1/users/:id) */}
      {/* ============================================================================== */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Sửa Tài Khoản #{editingUser.id}</h3>
                  <p className="text-xs text-slate-500">{editingUser.email}</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Họ và tên đầy đủ <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.hoTen}
                  onChange={(e) => setEditForm({ ...editForm, hoTen: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email <span className="text-blood-primary">*</span>
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                    required
                  />
                </div>
              </div>

              {/* Số điện thoại & CCCD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Số điện thoại <span className="text-blood-primary">*</span>
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={editForm.soDienThoai}
                    onChange={(e) => setEditForm({ ...editForm, soDienThoai: sanitizeDigits(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Số CCCD (12 số)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{12}"
                    maxLength={12}
                    value={editForm.cccd}
                    onChange={(e) => setEditForm({ ...editForm, cccd: sanitizeDigits(e.target.value, 12) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  />
                </div>
              </div>

              {/* Vai trò & Trạng thái */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Vai trò người dùng <span className="text-blood-primary">*</span>
                  </label>
                  <select
                    value={editForm.vaiTro}
                    onChange={(e) => setEditForm({ ...editForm, vaiTro: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                  >
                    <option value="DONOR">Người hiến máu (DONOR)</option>
                    <option value="HOSPITAL_STAFF">Bác sĩ / Y tế (HOSPITAL_STAFF)</option>
                    <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Trạng thái tài khoản
                  </label>
                  <select
                    value={editForm.trangThai}
                    onChange={(e) => setEditForm({ ...editForm, trangThai: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                  >
                    <option value="HoatDong">Hoạt động (Bình thường)</option>
                    <option value="Khoa">Khóa (Chặn đăng nhập)</option>
                  </select>
                </div>
              </div>

              {/* Nhóm máu */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nhóm Máu
                </label>
                <select
                  value={editForm.nhomMau}
                  onChange={(e) => setEditForm({ ...editForm, nhomMau: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:bg-white"
                >
                  {BLOOD_OPTIONS.map((b) => (
                    <option key={b} value={b}>Nhóm {b}</option>
                  ))}
                </select>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={editForm.diaChi}
                  onChange={(e) => setEditForm({ ...editForm, diaChi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsEditModalOpen(false); setEditingUser(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {passwordResetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md space-y-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Đổi mật khẩu tài khoản</h3>
                  <p className="text-xs text-slate-500">{passwordResetUser.hoTen} · {passwordResetUser.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordResetUser(null)}
                disabled={isSubmitting}
                aria-label="Đóng"
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              Nhập mật khẩu mới cho tài khoản này. Hãy thông báo mật khẩu cho người dùng qua kênh riêng tư.
              Mật khẩu cần dài 8–64 ký tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Mật khẩu mới
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={64}
                  required
                  value={passwordResetForm.matKhauMoi}
                  onChange={(event) => setPasswordResetForm({ ...passwordResetForm, matKhauMoi: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  maxLength={64}
                  required
                  value={passwordResetForm.xacNhanMatKhau}
                  onChange={(event) => setPasswordResetForm({ ...passwordResetForm, xacNhanMatKhau: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setPasswordResetUser(null)}
                  disabled={isSubmitting}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 7. MODAL XÁC NHẬN XÓA TÀI KHOẢN (DELETE /api/v1/users/:id) */}
      {/* ============================================================================== */}
      {isDeleteModalOpen && deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-blood-primary flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900">Xác Nhận Xóa Tài Khoản</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản <strong>{deletingUser.hoTen}</strong> ({deletingUser.email}) khỏi hệ thống không? Hành động này không thể hoàn tác!
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setDeletingUser(null); }}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/20 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isSubmitting ? 'Đang xóa...' : 'Đồng ý Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagementPage;
