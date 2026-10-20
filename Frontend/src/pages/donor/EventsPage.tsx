import React, { useState, useEffect } from 'react';
import { DonationEvent } from '../../types';
import { axiosClient } from '../../api/axiosClient';
import { EventMap } from '../../components/map/EventMap';
import { BookModal } from '../../components/donor/BookModal';
import { CreateEventModal } from '../../components/admin/CreateEventModal';
import { EditEventModal } from '../../components/admin/EditEventModal';
import { DeleteEventModal } from '../../components/admin/DeleteEventModal';
import { DismissEventModal } from '../../components/admin/DismissEventModal';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Search, 
  LayoutGrid, 
  Map as MapIcon, 
  Heart, 
  Building2,
  PlusCircle,
  PowerOff,
  RotateCcw,
  Ban,
  CheckCircle2,
  Edit3,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dữ liệu sự kiện mẫu fallback nếu backend chưa chạy hoặc chưa có data
const MOCK_EVENTS: DonationEvent[] = [
  {
    id: 1,
    tenSuKien: 'Hành Trình Đỏ - Giọt Hồng Tình Nguyện 2026',
    diaDiem: 'Nhà Văn Hóa Thanh Niên TP.HCM',
    diaChi: 'Số 04 Phạm Ngọc Thạch, Phường Bến Nghé',
    quanHuyen: 'Quận 1',
    ngayToChuc: '2026-10-27',
    gioBatDau: '07:30',
    gioKetThuc: '11:30',
    lat: 10.7818,
    lng: 106.6985,
    daDangKy: 145,
    chiTieu: 200,
    donViToChuc: 'Ban Chỉ Đạo Quốc Gia & Hội Chữ Thập Đỏ TP.HCM',
    ghiChu: 'Chiến dịch hiến máu tình nguyện quy mô toàn thành phố nhằm bổ sung lượng máu dự trữ trước dịp lễ.',
    trangThai: 'SapDienRa',
    isDismissed: false,
  },
  {
    id: 2,
    tenSuKien: 'Ngày Hội Hiến Máu Khẩn Cấp - Vì Bệnh Nhân Thalassemia',
    diaDiem: 'Hội Trường A - Bệnh Viện Truyền Máu Huyết Học TP.HCM',
    diaChi: '118 Hồng Bàng, Phường 12',
    quanHuyen: 'Quận 5',
    ngayToChuc: '2026-11-03',
    gioBatDau: '08:00',
    gioKetThuc: '12:00',
    lat: 10.7548,
    lng: 106.6612,
    daDangKy: 89,
    chiTieu: 150,
    donViToChuc: 'Bệnh Viện Truyền Máu Huyết Học & Khoa Nhi',
    ghiChu: 'Chương trình tiếp nhận máu khẩn cấp hỗ trợ bệnh nhi tan máu bẩm sinh và phẫu thuật cấp cứu.',
    trangThai: 'SapDienRa',
    isDismissed: false,
  },
  {
    id: 3,
    tenSuKien: 'Điểm Tiếp Nhận Hiến Máu Cố Định - Viện Huyết Học',
    diaDiem: 'Bệnh Viện Truyền Máu Huyết Học TP.HCM',
    diaChi: '118 Hồng Bàng, Phường 12',
    quanHuyen: 'Quận 5',
    ngayToChuc: '2026-10-20',
    gioBatDau: '07:00',
    gioKetThuc: '16:30',
    lat: 10.7548,
    lng: 106.6612,
    daDangKy: 210,
    chiTieu: 300,
    donViToChuc: 'Trung Tâm Truyền Máu TP.HCM',
    ghiChu: 'Mở cửa liên tục các ngày trong tuần.',
    trangThai: 'SapDienRa',
    isDismissed: false,
  },
  {
    id: 4,
    tenSuKien: 'Ngày Hội Giọt Máu Vàng - Khu Công Nghệ Cao TP.HCM',
    diaDiem: 'Trung Tâm Dịch Vụ KCNC (SHTP)',
    diaChi: 'Đường D1, Phường Tân Phú',
    quanHuyen: 'TP. Thủ Đức',
    ngayToChuc: '2026-11-02',
    gioBatDau: '08:30',
    gioKetThuc: '11:30',
    lat: 10.8542,
    lng: 106.7854,
    daDangKy: 62,
    chiTieu: 120,
    donViToChuc: 'Ban Quản Lý Khu Công Nghệ Cao',
    trangThai: 'SapDienRa',
    isDismissed: false,
  },
  {
    id: 5,
    tenSuKien: 'Hiến Máu Tình Nguyện Cứu Người - Quận 10',
    diaDiem: 'Trung Tâm Y Tế Quận 10',
    diaChi: '403 Cách Mạng Tháng 8, Phường 13',
    quanHuyen: 'Quận 10',
    ngayToChuc: '2026-10-30',
    gioBatDau: '07:30',
    gioKetThuc: '11:00',
    lat: 10.7785,
    lng: 106.6748,
    daDangKy: 40,
    chiTieu: 100,
    donViToChuc: 'UBND Quận 10',
    trangThai: 'SapDienRa',
    isDismissed: false,
  },
];

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<DonationEvent[]>(MOCK_EVENTS);
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'DISMISSED' | 'ALL'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'card' | 'map'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<DonationEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<DonationEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DonationEvent | null>(null);
  const [dismissTarget, setDismissTarget] = useState<DonationEvent | null>(null);

  // Quyền hạn: Chỉ Admin và Bác Sĩ (HOSPITAL_STAFF) có quyền tạo, sửa, xóa và bật/tắt thẻ sự kiện
  const canManage = user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF';

  // Số lượng sự kiện theo trạng thái
  const activeCount = events.filter((e) => !e.isDismissed && e.trangThai !== 'DaHuy').length;
  const dismissedCount = events.filter((e) => e.isDismissed || e.trangThai === 'DaHuy').length;

  // Gọi API GET /donation-events kết nối trực tiếp CSDL SQL Server
  const fetchEvents = async () => {
    try {
      const res = await axiosClient.get<any>('/donation-events');
      const rawItems = res.data?.data?.items || res.data?.items || (Array.isArray(res.data) ? res.data : []);
      
      if (Array.isArray(rawItems) && rawItems.length > 0) {
        const mapped: DonationEvent[] = rawItems.map((item: any, idx: number) => {
          const startDate = item.thoiGianBatDau ? new Date(item.thoiGianBatDau) : new Date();
          const endDate = item.thoiGianKetThuc ? new Date(item.thoiGianKetThuc) : new Date();
          
          // Tách quận huyện từ địa chỉ nếu có
          const addr = item.diaDiem || item.diaChi || 'TP.HCM';
          let district = 'Quận 1';
          if (addr.includes('Quận 5') || addr.includes('Q5')) district = 'Quận 5';
          else if (addr.includes('Quận 10') || addr.includes('Q10')) district = 'Quận 10';
          else if (addr.includes('Thủ Đức')) district = 'TP. Thủ Đức';

          const isDismissed = item.trangThai === 'DaHuy' || item.trangThai === 'KetThuc';
          let dismissReason: string | undefined = undefined;
          if (item.moTa && item.moTa.includes('[')) {
            const match = item.moTa.match(/\[(.*?)\]/);
            if (match) dismissReason = match[1];
          }

          return {
            id: item.id || idx + 1,
            tenSuKien: item.tenSuKien,
            diaDiem: item.diaDiem,
            diaChi: item.diaDiem,
            quanHuyen: district,
            ngayToChuc: startDate.toISOString().split('T')[0],
            gioBatDau: startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            gioKetThuc: endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            lat: item.lat || (district === 'Quận 5' ? 10.7554 : 10.7818),
            lng: item.lng || (district === 'Quận 5' ? 106.6579 : 106.6985),
            daDangKy: item.soLuongDaDangKy || 0,
            chiTieu: item.soLuongDuKien || 100,
            donViToChuc: item.nguoiTao?.hoTen || 'Hội Chữ Thập Đỏ TP.HCM',
            ghiChu: item.moTa ? item.moTa.replace(/\[.*?\]/g, '').trim() : 'Tiếp nhận hiến máu tình nguyện cứu người.',
            trangThai: item.trangThai || 'SapDienRa',
            isDismissed,
            dismissReason,
          };
        });

        setEvents(mapped);
      }
    } catch (err) {
      console.warn('Sử dụng danh sách sự kiện mẫu dự phòng (Mock Events).', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Tự động mở modal Đăng ký khi người dùng điều hướng từ Trang Chủ với query ?id=... hoặc ?eventId=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const targetId = params.get('id') || params.get('eventId');
    if (targetId && events.length > 0) {
      const found = events.find((e) => String(e.id) === String(targetId));
      if (found && !found.isDismissed && found.trangThai !== 'DaHuy') {
        setSelectedEvent(found);
        setIsModalOpen(true);
      }
    }
  }, [events]);

  // Xử lý Xóa sự kiện hiến máu (Admin & Bác sĩ)
  const handleConfirmDelete = async (target: DonationEvent) => {
    try {
      // Cập nhật UI ngay lập tức
      setEvents((prev) => prev.filter((e) => e.id !== target.id));

      // Đồng bộ xóa trên SQL Server qua Backend API
      await axiosClient.delete(`/donation-events/${target.id}`);

      toast.success(`Đã xóa vĩnh viễn sự kiện "${target.tenSuKien}" thành công!`);
    } catch (err: any) {
      console.error('Lỗi khi xóa sự kiện:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi xóa sự kiện.');
      fetchEvents();
    } finally {
      setDeleteTarget(null);
    }
  };

  // Xử lý Admin & Bác sĩ tắt thẻ sự kiện (Đồng bộ SQL Server)
  const handleConfirmDismiss = async (reason: string) => {
    if (!dismissTarget) return;
    const target = dismissTarget;
    try {
      // Cập nhật UI ngay lập tức
      setEvents((prev) =>
        prev.map((e) =>
          e.id === target.id
            ? { ...e, trangThai: 'DaHuy', isDismissed: true, dismissReason: reason }
            : e
        )
      );

      // Đồng bộ vào database SQL Server qua backend API
      await axiosClient.put(`/donation-events/${target.id}/status`, {
        trangThai: 'DaHuy',
        lyDo: reason,
      });

      toast.success(`Đã tắt sự kiện "${target.tenSuKien}" và đồng bộ database thành công!`);
    } catch (err: any) {
      console.error('Lỗi khi tắt sự kiện:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi tắt sự kiện.');
      fetchEvents();
    } finally {
      setDismissTarget(null);
    }
  };

  // Xử lý Admin & Bác sĩ khôi phục / mở lại thẻ sự kiện (Đồng bộ SQL Server)
  const handleConfirmRestore = async (evt: DonationEvent) => {
    try {
      // Cập nhật UI ngay lập tức
      setEvents((prev) =>
        prev.map((e) =>
          e.id === evt.id
            ? { ...e, trangThai: 'SapDienRa', isDismissed: false, dismissReason: undefined }
            : e
        )
      );

      // Đồng bộ vào database SQL Server qua backend API
      await axiosClient.put(`/donation-events/${evt.id}/status`, {
        trangThai: 'SapDienRa',
      });

      toast.success(`Đã mở lại sự kiện "${evt.tenSuKien}" và đồng bộ database thành công!`);
    } catch (err: any) {
      console.error('Lỗi khi mở lại sự kiện:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi mở lại sự kiện.');
      fetchEvents();
    }
  };

  // Lọc theo trạng thái tab: Đang mở (mặc định), Đã tắt, hoặc Tất cả
  const currentEvents = events.filter((evt) => {
    const isDismissed = evt.isDismissed || evt.trangThai === 'DaHuy';
    if (statusTab === 'ACTIVE') return !isDismissed;
    if (statusTab === 'DISMISSED') return isDismissed;
    return true;
  });

  // Danh sách các quận huyện có sự kiện
  const districts = ['ALL', ...Array.from(new Set(events.map((e) => e.quanHuyen)))];

  // Lọc dữ liệu theo từ khóa, quận huyện, ngày
  const filteredEvents = currentEvents.filter((evt) => {
    const matchSearch =
      evt.tenSuKien.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.diaDiem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      evt.diaChi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDistrict = selectedDistrict === 'ALL' || evt.quanHuyen === selectedDistrict;
    const matchDate = !selectedDate || evt.ngayToChuc === selectedDate;

    return matchSearch && matchDistrict && matchDate;
  });

  const handleOpenBooking = (evt: DonationEvent) => {
    if (evt.isDismissed || evt.trangThai === 'DaHuy') {
      toast.error('Sự kiện này đã kết thúc hoặc tạm ngừng tiếp nhận đăng ký.');
      return;
    }
    setSelectedEvent(evt);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header & Bộ nút chuyển chế độ xem (Card List vs Map) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lịch & Điểm Tiếp Nhận Hiến Máu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Tìm kiếm các ngày hội và điểm hiến máu cố định gần bạn nhất &bull; Đồng bộ SQL Server
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Nút Tạo Sự Kiện Mới: Chỉ Admin và Bác Sĩ có quyền hiển thị và thao tác */}
          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white text-xs sm:text-sm font-black shadow-md shadow-red-500/25 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tạo Sự Kiện Mới</span>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 text-white rounded">
                {user?.role === 'ADMIN' ? 'Admin' : 'Bác Sĩ'}
              </span>
            </button>
          )}

          {/* Chuyển đổi View Mode: Danh sách thẻ / Bản đồ */}
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('card')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'card'
                  ? 'bg-blood-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Dạng Thẻ</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-blood-primary text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              <span>Bản Đồ (Leaflet)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHỌN TAB TRẠNG THÁI (ĐANG MỞ / ĐÃ TẮT / TẤT CẢ) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div className="inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            type="button"
            onClick={() => setStatusTab('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusTab === 'ACTIVE'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đang Mở ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('DISMISSED')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusTab === 'DISMISSED'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Đã Tắt / Đóng ({dismissedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              statusTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất Cả ({events.length})
          </button>
        </div>

        {canManage && (
          <div className="text-xs text-slate-500 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Quyền {user?.role === 'ADMIN' ? 'Admin' : 'Bác Sĩ'}:{' '}
              <strong className="text-slate-700">Có quyền Tạo, Sửa, Xóa và Bật/Tắt thẻ sự kiện</strong>
            </span>
          </div>
        )}
      </div>

      {/* 3. Thanh lọc tìm kiếm (Search Bar, Filter Quận/Huyện, Ngày) */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          
          {/* Ô tìm kiếm từ khóa */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên ngày hội, địa điểm, bệnh viện..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20"
            />
          </div>

          {/* Chọn Quận / Huyện */}
          <div className="sm:col-span-3 relative">
            <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20 cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'Tất cả Quận / Huyện' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Chọn Ngày tổ chức */}
          <div className="sm:col-span-3 relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20 cursor-pointer"
            />
          </div>

        </div>

        {/* Thống kê kết quả lọc */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>Tìm thấy <strong className="text-slate-800 font-bold">{filteredEvents.length}</strong> điểm tiếp nhận</span>
          {(searchTerm || selectedDistrict !== 'ALL' || selectedDate) && (
            <button
              onClick={() => { setSearchTerm(''); setSelectedDistrict('ALL'); setSelectedDate(''); }}
              className="text-blood-primary font-bold hover:underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* 4. Nội dung hiển thị (Bản đồ hoặc Danh sách Thẻ) */}
      {viewMode === 'map' ? (
        <div className="space-y-4">
          <div className="p-3 bg-red-50 text-blood-dark text-xs rounded-xl border border-red-200 flex items-center justify-between">
            <span className="font-semibold">Bấm vào bất kỳ Marker giọt máu đỏ để xem chi tiết và đặt lịch tại điểm đó.</span>
            <span className="font-bold">{filteredEvents.length} Markers</span>
          </div>
          <EventMap
            events={filteredEvents}
            selectedEventId={selectedEvent?.id}
            onSelectEvent={handleOpenBooking}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((evt) => {
            const isDismissed = evt.isDismissed || evt.trangThai === 'DaHuy';
            const percentRegistered = Math.min(100, Math.round((evt.daDangKy / evt.chiTieu) * 100));

            return (
              <div
                key={evt.id}
                className={`rounded-3xl border-2 transition-all duration-200 p-5 flex flex-col justify-between space-y-4 group ${
                  isDismissed
                    ? 'bg-slate-50/90 border-slate-300/80 shadow-2xs opacity-85'
                    : 'bg-white border-slate-200/80 hover:border-blood-primary shadow-xs hover:shadow-md'
                }`}
              >
                <div className="space-y-3">
                  
                  {/* Tag Quận huyện, Trạng Thái & Nút Tắt Thẻ cho Admin */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-red-50 text-blood-primary text-xs font-black uppercase tracking-wider">
                        {evt.quanHuyen}
                      </span>
                      {isDismissed ? (
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Ban className="w-3 h-3 text-red-600" />
                          Đã Tắt Thẻ
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đang Mở
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Nút thao tác Admin & Bác sĩ: Tắt thẻ hoặc Mở lại */}
                      {canManage && (
                        <div>
                          {!isDismissed ? (
                            <button
                              type="button"
                              onClick={() => setDismissTarget(evt)}
                              title="Tắt thẻ sự kiện này"
                              className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-amber-200 hover:border-amber-600 shadow-2xs group/btn active:scale-95"
                            >
                              <PowerOff className="w-3 h-3 group-hover/btn:rotate-12 transition-transform" />
                              <span>Tắt Thẻ</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleConfirmRestore(evt)}
                              title="Khôi phục và mở lại sự kiện này"
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white transition-all text-[11px] font-black flex items-center gap-1 cursor-pointer border border-emerald-300 hover:border-emerald-600 shadow-2xs active:scale-95"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Mở Lại</span>
                            </button>
                          )}
                        </div>
                      )}

                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-blood-primary" /> {evt.ngayToChuc}
                      </span>
                    </div>
                  </div>

                  {/* Tên sự kiện & Icon */}
                  <div className="flex items-start gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-transform ${
                      isDismissed
                        ? 'bg-slate-400 text-white'
                        : 'bg-gradient-to-br from-blood-primary to-blood-dark text-white shadow-blood-primary/20 group-hover:scale-105'
                    }`}>
                      <Heart className="w-5 h-5 fill-white" />
                    </div>
                    <div>
                      <h3 className={`font-black text-sm sm:text-base leading-snug transition-colors ${
                        isDismissed ? 'text-slate-600 line-through decoration-slate-400' : 'text-slate-900 group-hover:text-blood-primary'
                      }`}>
                        {evt.tenSuKien}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        Đơn vị: {evt.donViToChuc}
                      </p>
                    </div>
                  </div>

                  {/* Ghi chú lý do tắt thẻ nếu có */}
                  {isDismissed && evt.dismissReason && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                      <strong>Lý do tắt:</strong> {evt.dismissReason}
                    </div>
                  )}

                  {/* Địa điểm & Khung giờ */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <span className="font-semibold text-slate-800">
                        {evt.diaDiem}
                        {evt.diaChi && evt.diaChi !== evt.diaDiem ? (
                          <> - <span className="font-normal text-slate-500">{evt.diaChi}</span></>
                        ) : null}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{evt.gioBatDau} - {evt.gioKetThuc}</span>
                    </div>
                  </div>

                  {/* Thanh tiến độ đăng ký */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-600">
                      <span>Đã đăng ký: {evt.daDangKy}/{evt.chiTieu} người</span>
                      <span className={percentRegistered >= 90 ? 'text-blood-primary' : 'text-slate-500'}>
                        {percentRegistered}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isDismissed
                            ? 'bg-slate-400'
                            : percentRegistered >= 90 ? 'bg-blood-primary' : 'bg-success'
                        }`}
                        style={{ width: `${percentRegistered}%` }}
                      />
                    </div>
                  </div>

                </div>

                {/* Nút hành động phía dưới: Sửa và Xóa (Admin & Bác sĩ) */}
                <div className="pt-2 border-t border-slate-100">
                  {canManage ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setEditTarget(evt)}
                        className="py-2.5 px-3 rounded-2xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white font-bold text-xs border border-blue-200/90 hover:border-blue-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(evt)}
                        className="py-2.5 px-3 rounded-2xl bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white font-bold text-xs border border-rose-200/90 hover:border-rose-600 flex items-center justify-center gap-1.5 transition-all shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  ) : !isDismissed ? (
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(evt)}
                      className="w-full py-3 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-2xl shadow-md shadow-blood-primary/20 flex items-center justify-center gap-2 active:scale-98 transition-all text-xs cursor-pointer"
                    >
                      <Heart className="w-4 h-4 fill-white" />
                      <span>Đăng Ký Tham Gia</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 bg-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center gap-2 text-xs cursor-not-allowed"
                    >
                      <Ban className="w-4 h-4 text-slate-400" />
                      <span>Sự Kiện Đã Đóng</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal đặt lịch hẹn (Dành cho Người hiến) */}
      <BookModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Modal tạo sự kiện hiến máu mới (Chỉ dành cho Admin & Bác sĩ) */}
      {canManage && (
        <CreateEventModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchEvents();
          }}
        />
      )}

      {/* Modal chỉnh sửa sự kiện hiến máu (Chỉ dành cho Admin & Bác sĩ) */}
      {canManage && (
        <EditEventModal
          isOpen={Boolean(editTarget)}
          event={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={() => {
            fetchEvents();
          }}
        />
      )}

      {/* Modal xác nhận xóa sự kiện hiến máu (Chỉ dành cho Admin & Bác sĩ) */}
      {canManage && (
        <DeleteEventModal
          isOpen={Boolean(deleteTarget)}
          event={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {/* Modal xác nhận tắt thẻ sự kiện hiến máu (Chỉ dành cho Admin & Bác sĩ) */}
      {canManage && (
        <DismissEventModal
          isOpen={Boolean(dismissTarget)}
          event={dismissTarget}
          onClose={() => setDismissTarget(null)}
          onConfirm={handleConfirmDismiss}
        />
      )}

    </div>
  );
};

export default EventsPage;
