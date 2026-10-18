import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Check, 
  X, 
  Search, 
  Droplet, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RefreshCw, 
  Heart,
  Hospital,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentItem {
  id: number;
  nguoiHienId: number;
  suKienId?: number;
  ngayTao?: string;
  ngayHen: string;
  khungGio: string;
  luongMauHienMl?: number;
  tinhTrangSucKhoe?: string;
  trangThai: 'ChoXacNhan' | 'DaXacNhan' | 'HoanThanh' | 'DaHuy' | 'KhongDen' | string;
  ghiChu?: string;
  nguoiHien?: {
    id: number;
    hoTen: string;
    email: string;
    soDienThoai: string;
    nhomMau?: string;
    yeuToRh?: string;
    cccd?: string;
  };
  suKien?: {
    id: number;
    tenSuKien: string;
    diaDiem: string;
    thoiGianBatDau?: string;
  };
}

export const ReceptionPage: React.FC = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Modal Xác nhận hoàn thành & cộng kho
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentItem | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [actualVolume, setActualVolume] = useState<number>(350);
  const [selectedBloodType, setSelectedBloodType] = useState<string>('O');
  const [selectedRh, setSelectedRh] = useState<string>('+');
  const [storageFacility, setStorageFacility] = useState<string>('Kho Lưu Trữ Trung Tâm - TP.HCM');
  const [completionNotes, setCompletionNotes] = useState<string>('Hiến máu thành công, sức khỏe người hiến ổn định.');

  // Tải danh sách lịch hẹn từ Backend API
  const fetchAppointments = useCallback(async (showErrorToast = true) => {
    try {
      setIsLoading(true);
      const pageSize = 100;
      const firstResponse = await axiosClient.get('/donation-appointments', {
        params: { page: 1, limit: pageSize },
      });
      const firstPage = firstResponse.data?.data;
      const firstItems = firstPage?.items ?? firstPage ?? firstResponse.data?.items ?? firstResponse.data;

      if (!Array.isArray(firstItems)) {
        throw new Error('Định dạng danh sách lịch hẹn không hợp lệ.');
      }

      const allAppointments: AppointmentItem[] = [...firstItems];
      const totalPages = Number(firstPage?.pagination?.totalPages);
      for (let page = 2; Number.isFinite(totalPages) && page <= totalPages; page += 1) {
        const pageResponse = await axiosClient.get('/donation-appointments', {
          params: { page, limit: pageSize },
        });
        const pageData = pageResponse.data?.data;
        const pageItems = pageData?.items ?? pageData ?? pageResponse.data?.items ?? pageResponse.data;
        if (!Array.isArray(pageItems)) {
          throw new Error(`Định dạng lịch hẹn tại trang ${page} không hợp lệ.`);
        }
        allAppointments.push(...pageItems);
      }

      setAppointments(allAppointments);
      return true;
    } catch (error) {
      console.error('Không thể tải danh sách lịch hẹn:', error);
      if (showErrorToast) {
        toast.error('Không thể tải danh sách lịch hẹn từ máy chủ. Vui lòng thử làm mới.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAppointments();
    const intervalId = window.setInterval(() => {
      void fetchAppointments(false);
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [fetchAppointments]);

  useEffect(() => {
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('donation-appointment:created', () => {
      void fetchAppointments(false);
      toast('Có lịch hiến máu mới cần duyệt.', { icon: '🩸' });
    });

    socket.on('connect_error', (error) => {
      console.error('Không thể kết nối cập nhật lịch hẹn thời gian thực:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token, fetchAppointments]);

  // 1. Duyệt lịch hẹn: ChoXacNhan -> DaXacNhan
  const handleApproveAppointment = async (id: number, donorName: string) => {
    try {
      setIsUpdating(true);
      await axiosClient.put(`/donation-appointments/${id}/status`, {
        trangThai: 'DaXacNhan',
      });
      toast.success(`Đã duyệt lịch hẹn của [${donorName}] thành công!`);
      await fetchAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể duyệt lịch hẹn.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 2. Từ chối / Hủy lịch hẹn: -> DaHuy
  const handleRejectAppointment = async (id: number, donorName: string) => {
    try {
      setIsUpdating(true);
      await axiosClient.put(`/donation-appointments/${id}/status`, {
        trangThai: 'DaHuy',
      });
      toast.error(`Đã từ chối lịch hẹn của [${donorName}].`);
      await fetchAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể hủy lịch hẹn.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Mở modal hoàn thành & cộng kho
  const handleOpenCompleteModal = (item: AppointmentItem) => {
    setSelectedAppointment(item);
    setActualVolume(item.luongMauHienMl || 350);
    setStorageFacility('Kho Lưu Trữ Trung Tâm - TP.HCM');

    // Parse nhóm máu người hiến nếu đã có trước đó
    const existingBlood = item.nguoiHien?.nhomMau?.trim().toUpperCase();
    if (existingBlood) {
      if (existingBlood.startsWith('AB')) {
        setSelectedBloodType('AB');
      } else if (existingBlood.startsWith('A')) {
        setSelectedBloodType('A');
      } else if (existingBlood.startsWith('B')) {
        setSelectedBloodType('B');
      } else {
        setSelectedBloodType('O');
      }
      setSelectedRh(existingBlood.endsWith('-') ? '-' : '+');
    } else {
      setSelectedBloodType('O');
      setSelectedRh('+');
    }

    const currentType = existingBlood || 'O+';
    setCompletionNotes(`Đã tiếp nhận ${item.luongMauHienMl || 350}ml máu ${currentType} an toàn.`);
    setIsCompleteModalOpen(true);
  };

  // 4. Xác nhận hoàn thành: DaXacNhan -> HoanThanh (Kích hoạt Transaction tự động cộng kho)
  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setIsUpdating(true);
      const confirmedBlood = `${selectedBloodType}${selectedRh}`;
      await axiosClient.put(`/donation-appointments/${selectedAppointment.id}/status`, {
        trangThai: 'HoanThanh',
        luongMauThucTeMl: Number(actualVolume),
        donViLuuTru: storageFacility.trim(),
        ghiChu: completionNotes.trim(),
        nhomMau: confirmedBlood,
        yeuToRh: selectedRh === '-' ? 'Rh-' : 'Rh+',
      });

      toast.success(
        `Xác nhận hiến máu thành công! Đã cập nhật nhóm máu [${confirmedBlood}] cho người hiến và cộng +${actualVolume}ml vào Kho Máu!`,
        { icon: '🩸', duration: 4000 }
      );

      setIsCompleteModalOpen(false);
      setSelectedAppointment(null);
      await fetchAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi khi cập nhật kết quả hiến máu.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // 5. Đánh dấu người hiến vắng mặt (KhongDen)
  const handleMarkAbsent = async (id: number, donorName: string) => {
    try {
      setIsUpdating(true);
      await axiosClient.put(`/donation-appointments/${id}/status`, {
        trangThai: 'KhongDen',
      });
      toast(`Đã ghi nhận người hiến [${donorName}] vắng mặt.`, { icon: '⚠️' });
      await fetchAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi thao tác.';
      toast.error(msg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Thống kê số liệu
  const totalCount = appointments.length;
  const pendingCount = appointments.filter((a) => a.trangThai === 'ChoXacNhan').length;
  const approvedCount = appointments.filter((a) => a.trangThai === 'DaXacNhan').length;
  const completedCount = appointments.filter((a) => a.trangThai === 'HoanThanh').length;

  // Tổng lượng máu theo từng trạng thái (ml) để admin biết bao nhiêu máu còn duyệt
  const totalVolume = appointments.reduce((sum, a) => sum + (Number(a.luongMauHienMl) || 350), 0);
  const pendingVolume = appointments
    .filter((a) => a.trangThai === 'ChoXacNhan')
    .reduce((sum, a) => sum + (Number(a.luongMauHienMl) || 350), 0);
  const approvedVolume = appointments
    .filter((a) => a.trangThai === 'DaXacNhan')
    .reduce((sum, a) => sum + (Number(a.luongMauHienMl) || 350), 0);
  const completedVolume = appointments
    .filter((a) => a.trangThai === 'HoanThanh')
    .reduce((sum, a) => sum + (Number(a.luongMauHienMl) || 350), 0);

  // Lọc danh sách
  const orderedAppointments = [...appointments].sort((first, second) => {
    const firstCreatedAt = first.ngayTao ? new Date(first.ngayTao).getTime() : Number.NaN;
    const secondCreatedAt = second.ngayTao ? new Date(second.ngayTao).getTime() : Number.NaN;
    if (Number.isFinite(firstCreatedAt) && Number.isFinite(secondCreatedAt) && firstCreatedAt !== secondCreatedAt) {
      return secondCreatedAt - firstCreatedAt;
    }
    return second.id - first.id;
  });

  const filteredAppointments = orderedAppointments.filter((item) => {
    const matchStatus = statusFilter === 'ALL' || item.trangThai === statusFilter;
    const name = item.nguoiHien?.hoTen || '';
    const phone = item.nguoiHien?.soDienThoai || '';
    const email = item.nguoiHien?.email || '';
    const blood = item.nguoiHien?.nhomMau || '';
    const idStr = item.id.toString();

    const matchSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blood.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idStr.includes(searchTerm);

    return matchStatus && matchSearch;
  });

  // Tự động quay về trang 1 khi thay đổi bộ lọc tìm kiếm hoặc trạng thái
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  // Phân trang
  const totalFiltered = filteredAppointments.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalFiltered);
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-black mb-1">
            <Hospital className="w-3.5 h-3.5 text-blood-primary" />
            Bàn Tiếp Nhận & Duyệt Lịch Hẹn Hiến Máu
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Duyệt Lịch Hẹn & Tiếp Nhận Cộng Kho
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Xác nhận duyệt lịch hẹn, tiếp nhận người hiến và tự động kích hoạt Transaction cộng dồn vào Kho máu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              if (await fetchAppointments()) toast.success('Đã cập nhật danh sách lịch hẹn!');
            }}
            className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Làm mới"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </div>

      {/* 2. Bốn thẻ tóm tắt nhanh số liệu (Vivid 3D KPI Cards with Icons & Gradients) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng Lịch Hẹn */}
        <div className="p-5 bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Tổng Lịch Hẹn
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tracking-tight">{totalCount}</span>
              <span className="text-xs font-black text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-lg shadow-2xs">
                {totalVolume.toLocaleString('vi-VN')} ml
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">Toàn hệ thống (~{(totalVolume / 1000).toFixed(1)} lít máu)</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Chờ Duyệt (Pending) */}
        <div className="p-5 bg-gradient-to-br from-amber-50/90 via-amber-50/40 to-white backdrop-blur-md rounded-3xl border border-amber-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" /> Chờ Duyệt
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-950 tracking-tight">{pendingCount}</span>
              <span className="text-xs font-black text-amber-900 bg-amber-200/90 border border-amber-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                {pendingVolume.toLocaleString('vi-VN')} ml
              </span>
            </div>
            <span className="text-[11px] text-amber-700 font-bold block">Còn {pendingVolume.toLocaleString('vi-VN')} ml máu chờ duyệt</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform relative z-10">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Đã Duyệt Hẹn (Approved) */}
        <div className="p-5 bg-gradient-to-br from-sky-50/90 via-sky-50/40 to-white backdrop-blur-md rounded-3xl border border-sky-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" /> Đã Duyệt Hẹn
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-sky-950 tracking-tight">{approvedCount}</span>
              <span className="text-xs font-black text-sky-900 bg-sky-200/90 border border-sky-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                {approvedVolume.toLocaleString('vi-VN')} ml
              </span>
            </div>
            <span className="text-[11px] text-sky-700 font-bold block">Chờ tiếp nhận {approvedVolume.toLocaleString('vi-VN')} ml</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/25 shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Đã Cộng Kho (Completed) */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/90 via-emerald-50/40 to-white backdrop-blur-md rounded-3xl border border-emerald-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group flex items-center justify-between">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/15 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="space-y-1.5 relative z-10">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Droplet className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" /> Đã Cộng Kho
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-950 tracking-tight">{completedCount}</span>
              <span className="text-xs font-black text-emerald-900 bg-emerald-200/90 border border-emerald-300 px-2.5 py-0.5 rounded-lg shadow-2xs">
                +{completedVolume.toLocaleString('vi-VN')} ml
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-bold block">Đã nhập kho máu thực tế</span>
          </div>
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-transform relative z-10">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
        </div>
      </div>

      {/* 3. Thanh tìm kiếm & Tabs lọc trạng thái */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo Tên người hiến, Số điện thoại, Email, Nhóm máu, Mã #ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:bg-white focus:ring-2 focus:ring-blood-primary/20"
          />
        </div>

        {/* Tabs Trạng thái */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl overflow-x-auto shrink-0">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ChoXacNhan', label: 'Chờ duyệt', count: pendingCount, volume: pendingVolume },
            { id: 'DaXacNhan', label: 'Đã duyệt' },
            { id: 'HoanThanh', label: 'Hoàn thành' },
            { id: 'DaHuy', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-white text-blood-primary shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              {tab.id === 'ChoXacNhan' && pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                  statusFilter === tab.id ? 'bg-amber-100 text-amber-800' : 'bg-amber-200 text-amber-900'
                }`}>
                  {pendingCount} • {pendingVolume.toLocaleString('vi-VN')}ml
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Danh sách các Lịch Hẹn */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs">
            <Heart className="w-12 h-12 text-slate-300 mx-auto animate-pulse" />
            <h3 className="text-base font-bold text-slate-800">Không tìm thấy lịch hẹn nào phù hợp</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Chưa có lịch hẹn nào thỏa mãn bộ lọc hiện tại.
            </p>
          </div>
        ) : (
          paginatedAppointments.map((apt) => {
            const donor = apt.nguoiHien;
            const event = apt.suKien;
            const blood = donor?.nhomMau || 'Chưa rõ';
            const dateStr = apt.ngayHen ? new Date(apt.ngayHen).toLocaleDateString('vi-VN') : 'Không xác định';

            return (
              <div 
                key={apt.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Thông tin người hiến & Nhóm máu */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-14 h-14 border-2 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 shadow-2xs ${
                    donor?.nhomMau 
                      ? 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-blood-primary'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}>
                    <span className="text-base leading-none font-black">{donor?.nhomMau || '?'}</span>
                    <span className="text-[9px] uppercase font-bold mt-0.5">
                      {donor?.nhomMau ? 'Nhóm' : 'Chưa rõ'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#APT-{apt.id}</span>
                      <h3 className="font-black text-slate-900 text-base">
                        {donor?.hoTen || 'Người hiến ẩn danh'}
                      </h3>

                      {!donor?.nhomMau && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                          Chờ XN nhóm máu
                        </span>
                      )}
                      
                      {/* Badge trạng thái */}
                      {apt.trangThai === 'ChoXacNhan' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black animate-pulse">
                          Chờ Duyệt
                        </span>
                      )}
                      {apt.trangThai === 'DaXacNhan' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                          Đã Duyệt Hẹn
                        </span>
                      )}
                      {apt.trangThai === 'HoanThanh' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đã Hiến & Cộng Kho
                        </span>
                      )}
                      {apt.trangThai === 'DaHuy' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-blood-primary text-[10px] font-bold">
                          Đã Hủy
                        </span>
                      )}
                      {apt.trangThai === 'KhongDen' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          Vắng Mặt
                        </span>
                      )}

                      {/* Badge số lượng máu đăng ký hiến */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-red-700 border border-red-200 text-[11px] font-black shadow-2xs">
                        <Droplet className="w-3 h-3 fill-red-600 text-red-600" />
                        Đăng ký hiến: {apt.luongMauHienMl || 350} ml
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 font-medium">
                      {donor?.soDienThoai && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {donor.soDienThoai}
                        </span>
                      )}
                      {donor?.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {donor.email}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-slate-700 font-bold">
                        <Calendar className="w-3.5 h-3.5 text-blood-primary" /> {dateStr} ({apt.khungGio})
                      </span>
                    </div>

                    {event && (
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <strong className="text-slate-800">{event.tenSuKien}</strong> - {event.diaDiem}
                      </p>
                    )}

                    {apt.ghiChu && (
                      <p className="text-[11px] text-slate-500 italic bg-slate-50 px-2 py-0.5 rounded-md inline-block">
                        Ghi chú: {apt.ghiChu}
                      </p>
                    )}
                  </div>
                </div>

                {/* Các nút hành động quy trình */}
                <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  
                  {/* TRƯỜNG HỢP 1: Chờ xác nhận -> Có nút Duyệt hoặc Từ chối */}
                  {apt.trangThai === 'ChoXacNhan' && (
                    <>
                      <button
                        onClick={() => handleApproveAppointment(apt.id, donor?.hoTen || 'Người hiến')}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Duyệt Lịch Hẹn
                      </button>

                      <button
                        onClick={() => handleRejectAppointment(apt.id, donor?.hoTen || 'Người hiến')}
                        disabled={isUpdating}
                        className="px-3 py-2 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-blood-primary font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Từ chối
                      </button>
                    </>
                  )}

                  {/* TRƯỜNG HỢP 2: Đã duyệt -> Người hiến đến điểm hiến -> Xác nhận thành công & Tự động cộng kho */}
                  {apt.trangThai === 'DaXacNhan' && (
                    <>
                      <button
                        onClick={() => handleOpenCompleteModal(apt)}
                        disabled={isUpdating}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 animate-pulse"
                      >
                        <Droplet className="w-4 h-4 fill-white" />
                        Xác Nhận Đã Hiến & Cộng Kho
                      </button>

                      <button
                        onClick={() => handleMarkAbsent(apt.id, donor?.hoTen || 'Người hiến')}
                        disabled={isUpdating}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                      >
                        Vắng mặt
                      </button>
                    </>
                  )}

                  {/* TRƯỜNG HỢP 3: Hoàn thành -> Hiển thị thông báo đã nhập kho */}
                  {apt.trangThai === 'HoanThanh' && (
                    <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <Droplet className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      Đã nhập kho +{apt.luongMauHienMl || 350}ml ({blood})
                    </div>
                  )}
                </div>

              </div>
            );
          })
        )}

        {/* Thanh Phân Trang Hiện Đại Chuẩn Envato 3D */}
        {totalFiltered > 0 && (
          <div className="p-4 sm:px-6 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-slate-600">
            
            {/* Thông tin số lượng hiển thị */}
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span>
                Hiển thị <span className="text-slate-900 font-black">{totalFiltered > 0 ? startIndex + 1 : 0}</span> - <span className="text-slate-900 font-black">{endIndex}</span> trong tổng số <span className="text-blood-primary font-black">{totalFiltered}</span> lịch hẹn
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
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 text-xs focus:outline-hidden cursor-pointer shadow-2xs hover:border-slate-300 transition-colors"
                >
                  <option value={5}>5 lịch hẹn</option>
                  <option value={10}>10 lịch hẹn</option>
                  <option value={20}>20 lịch hẹn</option>
                  <option value={50}>50 lịch hẹn</option>
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
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-500/30 scale-105'
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
        )}
      </div>

      {/* ============================================================================== */}
      {/* 5. MODAL XÁC NHẬN HIẾN MÁU THÀNH CÔNG & TỰ ĐỘNG CỘNG KHO */}
      {/* ============================================================================== */}
      {isCompleteModalOpen && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <Droplet className="w-6 h-6 fill-emerald-700" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Tiếp Nhận & Cộng Kho Máu</h3>
                  <p className="text-xs text-slate-500">Kích hoạt Transaction cập nhật lịch hẹn và cộng kho</p>
                </div>
              </div>
              <button 
                onClick={() => { setIsCompleteModalOpen(false); setSelectedAppointment(null); }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
              <p><strong className="text-slate-700">Người hiến:</strong> {selectedAppointment.nguoiHien?.hoTen} ({selectedAppointment.nguoiHien?.soDienThoai})</p>
              <p><strong className="text-slate-700">Điểm tiếp nhận:</strong> {selectedAppointment.suKien?.tenSuKien || 'Điểm hiến máu trung tâm'}</p>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              
              {/* Chọn / Xác nhận nhóm máu thu nhận */}
              <div className="p-3.5 bg-gradient-to-br from-red-50/80 via-white to-rose-50/60 rounded-2xl border border-red-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
                    Xác nhận nhóm máu thực tế <span className="text-red-600">*</span>
                  </label>
                  <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black shadow-xs">
                    Đã chọn: {selectedBloodType}{selectedRh}
                  </span>
                </div>

                {selectedAppointment.nguoiHien?.nhomMau ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Người hiến cũ: Đã có nhóm máu <strong>{selectedAppointment.nguoiHien.nhomMau}</strong> (Bác sĩ có thể chọn lại nếu cần)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Người hiến lần đầu (chưa rõ nhóm máu). Bác sĩ thực hiện định nhóm máu và chọn bên dưới:</span>
                  </div>
                )}

                {/* Các nút bấm chọn A, B, AB, O */}
                <div className="grid grid-cols-4 gap-2">
                  {['A', 'B', 'AB', 'O'].map((type) => {
                    const isSelected = selectedBloodType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setSelectedBloodType(type);
                          setCompletionNotes(`Đã tiếp nhận ${actualVolume}ml máu ${type}${selectedRh} an toàn.`);
                        }}
                        className={`py-2 rounded-xl font-black text-sm border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-xs scale-105'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                        }`}
                      >
                        Nhóm {type}
                      </button>
                    );
                  })}
                </div>

                {/* Toggle Rh+ / Rh- */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-bold text-slate-600">Hệ Rhesus (Rh):</span>
                  <div className="inline-flex p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRh('+');
                        setCompletionNotes(`Đã tiếp nhận ${actualVolume}ml máu ${selectedBloodType}+ an toàn.`);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        selectedRh === '+'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Rh Dương (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRh('-');
                        setCompletionNotes(`Đã tiếp nhận ${actualVolume}ml máu ${selectedBloodType}- an toàn.`);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                        selectedRh === '-'
                          ? 'bg-rose-900 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Rh Âm (-) Máu Hiếm
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Thể tích máu thực tế */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Thể tích máu thực tế lấy được (ml) <span className="text-blood-primary">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[250, 350, 450].map((vol) => (
                    <button
                      key={vol}
                      type="button"
                      onClick={() => setActualVolume(vol)}
                      className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                        actualVolume === vol
                          ? 'bg-blood-primary text-white border-blood-primary shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-red-50'
                      }`}
                    >
                      {vol} ml
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={100}
                  step={50}
                  value={actualVolume}
                  onChange={(e) => setActualVolume(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  required
                />
              </div>

              {/* Đơn vị lưu trữ nhập kho */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Đơn vị / Kho lưu trữ nhập túi máu <span className="text-blood-primary">*</span>
                </label>
                <input
                  type="text"
                  value={storageFacility}
                  onChange={(e) => setStorageFacility(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-hidden focus:bg-white"
                  placeholder="Ví dụ: Kho Lưu Trữ Trung Tâm - TP.HCM"
                  required
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Ghi chú kết quả hiến máu
                </label>
                <textarea
                  rows={2}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setIsCompleteModalOpen(false); setSelectedAppointment(null); }}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Droplet className="w-4 h-4 fill-white" />
                  {isUpdating ? 'Đang xử lý Transaction...' : 'Xác Nhận & Tự Động Cộng Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ReceptionPage;
