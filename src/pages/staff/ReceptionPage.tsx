import React, { useState, useEffect } from 'react';
import { axiosClient } from '../../api/axiosClient';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AppointmentItem {
  id: number;
  nguoiHienId: number;
  suKienId?: number;
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
  const [storageFacility, setStorageFacility] = useState<string>('Kho Lưu Trữ Trung Tâm - TP.HCM');
  const [completionNotes, setCompletionNotes] = useState<string>('Hiến máu thành công, sức khỏe người hiến ổn định.');

  // Tải danh sách lịch hẹn từ Backend API
  const fetchAppointments = async (showErrorToast = true) => {
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
  };

  useEffect(() => {
    void fetchAppointments();
    const intervalId = window.setInterval(() => {
      void fetchAppointments(false);
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, []);

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
    setCompletionNotes(`Đã tiếp nhận ${item.luongMauHienMl || 350}ml máu ${item.nguoiHien?.nhomMau || 'O+'} an toàn.`);
    setIsCompleteModalOpen(true);
  };

  // 4. Xác nhận hoàn thành: DaXacNhan -> HoanThanh (Kích hoạt Transaction tự động cộng kho)
  const handleConfirmComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      setIsUpdating(true);
      await axiosClient.put(`/donation-appointments/${selectedAppointment.id}/status`, {
        trangThai: 'HoanThanh',
        luongMauThucTeMl: Number(actualVolume),
        donViLuuTru: storageFacility.trim(),
        ghiChu: completionNotes.trim(),
      });

      toast.success(
        `Xác nhận hiến máu thành công! Đã tự động cộng +${actualVolume}ml máu (${selectedAppointment.nguoiHien?.nhomMau || 'O+'}) vào Kho Máu!`,
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

  // Tạo nhanh 1 lịch hẹn mẫu nếu chưa có lịch hẹn nào
  const handleCreateDemoAppointment = async () => {
    try {
      setIsUpdating(true);
      await axiosClient.post('/donation-appointments', {
        suKienId: 1,
        ngayHen: '2026-10-20',
        khungGio: '08:00 - 09:30',
        luongMauHienMl: 350,
        tinhTrangSucKhoe: 'Tốt, sẵn sàng hiến máu',
        ghiChu: 'Lịch hẹn tạo kiểm thử duyệt hiến máu',
      });
      toast.success('Đã tạo thành công lịch hẹn mẫu! Bạn có thể thử duyệt ngay.');
      await fetchAppointments();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể tạo lịch hẹn.';
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

  // Lọc danh sách
  const filteredAppointments = appointments.filter((item) => {
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

          <button
            onClick={handleCreateDemoAppointment}
            disabled={isUpdating}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-400" /> Tạo Lịch Hẹn Demo
          </button>
        </div>
      </div>

      {/* 2. Bốn thẻ tóm tắt nhanh số liệu */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Lịch Hẹn</span>
          <div className="text-2xl font-black text-slate-900">{totalCount}</div>
          <span className="text-[11px] text-slate-400 font-medium">Toàn hệ thống</span>
        </div>

        <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Chờ Duyệt
          </span>
          <div className="text-2xl font-black text-amber-900">{pendingCount}</div>
          <span className="text-[11px] text-amber-600 font-medium">Cần Admin/Staff duyệt</span>
        </div>

        <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã Duyệt Hẹn
          </span>
          <div className="text-2xl font-black text-blue-900">{approvedCount}</div>
          <span className="text-[11px] text-blue-600 font-medium">Chờ đến điểm hiến</span>
        </div>

        <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <Droplet className="w-3.5 h-3.5 fill-emerald-600" /> Đã Cộng Kho
          </span>
          <div className="text-2xl font-black text-emerald-900">{completedCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Hiến máu thành công</span>
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
            { id: 'ChoXacNhan', label: 'Chờ duyệt' },
            { id: 'DaXacNhan', label: 'Đã duyệt' },
            { id: 'HoanThanh', label: 'Hoàn thành' },
            { id: 'DaHuy', label: 'Đã hủy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-white text-blood-primary shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
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
              Chưa có lịch hẹn nào thỏa mãn bộ lọc hiện tại. Bạn có thể bấm "Tạo Lịch Hẹn Demo" ở trên để thử nghiệm quy trình duyệt.
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
                  <div className="w-14 h-14 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl flex flex-col items-center justify-center text-blood-primary font-black shrink-0 shadow-2xs">
                    <span className="text-base leading-none">{blood}</span>
                    <span className="text-[9px] uppercase font-bold text-blood-dark mt-0.5">Nhóm</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-400">#APT-{apt.id}</span>
                      <h3 className="font-black text-slate-900 text-base">
                        {donor?.hoTen || 'Người hiến ẩn danh'}
                      </h3>
                      
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
              <p><strong className="text-slate-700">Nhóm máu thu nhận:</strong> <span className="font-black text-blood-primary text-sm">{selectedAppointment.nguoiHien?.nhomMau || 'O+'}</span></p>
              <p><strong className="text-slate-700">Điểm tiếp nhận:</strong> {selectedAppointment.suKien?.tenSuKien || 'Điểm hiến máu trung tâm'}</p>
            </div>

            <form onSubmit={handleConfirmComplete} className="space-y-4">
              
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
