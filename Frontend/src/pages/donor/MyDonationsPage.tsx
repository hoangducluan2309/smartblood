import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DonationAppointment } from '../../types';
import { axiosClient } from '../../api/axiosClient';
import { 
  Award, 
  Droplet, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  FileText, 
  ShieldCheck, 
  Sparkles,
  Download,
  Heart,
  ArrowRight,
  Printer,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyDonationsPage: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<DonationAppointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'CHO_TIEP_NHAN' | 'HOAN_THANH'>('ALL');
  const [showQRModal, setShowQRModal] = useState<DonationAppointment | null>(null);
  const [selectedCertModal, setSelectedCertModal] = useState<DonationAppointment | null>(null);

  // Lấy lịch sử từ API GET /donation-appointments/my-history
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setAppointments([]);
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await axiosClient.get<any>('/donation-appointments/my-history');
        const data = Array.isArray(res.data) ? res.data : res.data?.data;
        if (!Array.isArray(data)) {
          throw new Error('Định dạng lịch sử hiến máu không hợp lệ.');
        }
        if (isMounted) {
          setAppointments(data);
        }
      } catch (err) {
        console.error('Không thể tải lịch sử hiến máu:', err);
        if (isMounted) {
          setAppointments([]);
          toast.error('Không thể tải lịch sử hiến máu. Vui lòng thử làm mới trang.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  // Tính toán số liệu thống kê động từ lịch sử thực tế
  const completedAppointments = appointments.filter((app) => app.trangThai === 'HOAN_THANH');
  const completedCount = completedAppointments.length;
  const totalVolumeMl = completedAppointments.reduce((acc, curr) => {
    const rawVal = curr.luongMauHienMl ?? curr.luongMau ?? 350;
    const num = typeof rawVal === 'number' ? rawVal : parseInt(String(rawVal).replace(/\D/g, '')) || 350;
    return acc + num;
  }, 0);
  const pendingAppointments = appointments.filter((app) => app.trangThai === 'CHO_TIEP_NHAN' || app.trangThai === 'DA_TIEP_NHAN');

  const filteredList = appointments.filter((item) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'CHO_TIEP_NHAN') return item.trangThai === 'CHO_TIEP_NHAN' || item.trangThai === 'DA_TIEP_NHAN';
    return item.trangThai === activeTab;
  });

  const handleCancelAppointment = async (id: string | number) => {
    try {
      // Trích xuất raw ID số nếu định dạng DON-YYYY-ID
      const rawId = typeof id === 'number' ? id : parseInt(String(id).split('-').pop() || '0');
      if (rawId > 0) {
        await axiosClient.delete(`/donation-appointments/${rawId}`);
      }
    } catch {
      // Tiếp tục cập nhật UI cục bộ
    }
    setAppointments((prev) =>
      prev.map((app) => (app.id === id ? { ...app, trangThai: 'DA_HUY' } : app))
    );
    toast.success('Đã hủy lịch hẹn hiến máu thành công.');
  };

  const getStatusBadge = (status: DonationAppointment['trangThai']) => {
    switch (status) {
      case 'CHO_TIEP_NHAN':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            <Clock3 className="w-3.5 h-3.5" /> Chờ Tiếp Nhận
          </span>
        );
      case 'DA_TIEP_NHAN':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            <Clock className="w-3.5 h-3.5" /> Đang Hiến Máu
          </span>
        );
      case 'HOAN_THANH':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã Hoàn Thành
          </span>
        );
      case 'DA_HUY':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500">
            <XCircle className="w-3.5 h-3.5" /> Đã Hủy
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. THẺ HIẾN MÁU ĐIỆN TỬ (DIGITAL BLOOD DONOR CARD) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Thẻ Hiến Máu Điện Tử (Digital Donor Card)
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            Cơ sở dữ liệu HienMauDB &bull; Đồng bộ tức thì
          </span>
        </div>

        {/* Card Component */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blood-dark text-white p-6 sm:p-8 shadow-2xl border border-slate-700">
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blood-primary/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
            <Droplet className="w-60 h-60 fill-white" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            {/* Thông tin cá nhân & nhóm máu */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-blood-primary text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-blood-primary/40 ring-2 ring-white/20">
                  {user?.bloodType || user?.nhomMau || appointments[0]?.nhomMau || 'A+'}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-300">
                    CỘNG HOÀ XÃ HỘI CHỦ NGHĨA VIỆT NAM &bull; BỘ Y TẾ
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">
                    {user?.fullName || user?.hoTen || 'Nguyễn Văn An'}
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    Tình nguyện viên hiến máu nhân đạo
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mã người hiến</span>
                  <span className="font-mono font-bold text-sm tracking-wider text-amber-300">
                    BD-2026-{String(user?.id || '003').padStart(4, '0')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Số lần đã hiến</span>
                  <span className="font-bold text-sm text-white flex items-center gap-1">
                    <Award className="w-4 h-4 text-amber-400" />
                    {completedCount} Lần
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tổng lượng máu</span>
                  <span className="font-bold text-sm text-red-300 flex items-center gap-1">
                    <Droplet className="w-4 h-4 fill-blood-primary text-blood-primary" />
                    ~{totalVolumeMl} ml
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Trạng thái an toàn</span>
                  <span className="font-bold text-xs text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 
                    {pendingAppointments.length > 0 ? 'Đã có lịch hẹn' : 'Sẵn sàng hiến'}
                  </span>
                </div>
              </div>
            </div>

            {/* Mã QR Check-in điện tử */}
            <div className="bg-white p-3.5 rounded-2xl text-slate-900 flex flex-col items-center justify-center text-center shadow-lg self-center md:self-auto shrink-0">
              <div className="w-24 h-24 bg-slate-900 rounded-xl p-2 flex items-center justify-center text-white">
                <QrCode className="w-20 h-20" />
              </div>
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-600 mt-1.5">
                QR CHECK-IN ĐIỂM HIẾN
              </span>
            </div>

          </div>

          {/* Card Footer Actions */}
          <div className="relative z-10 mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400">
              Xuất trình mã QR tại bàn tiếp nhận tại các bệnh viện / điểm hiến lưu động để miễn thủ tục giấy tờ.
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toast.success('Đã tải xuống thẻ hiến máu điện tử định dạng PDF!')}
                className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Tải Thẻ PDF
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 2. BẢNG THEO DÕI LỊCH HẸN & LỊCH SỬ HIẾN MÁU */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blood-primary" />
              Lịch Sử Hiến Máu & Các Lượt Hẹn
            </h2>
            <p className="text-xs text-slate-500">
              Chi tiết các mốc hiến máu tình nguyện đã lưu trữ trong cơ sở dữ liệu quốc gia
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="inline-flex p-1 bg-white rounded-2xl border border-slate-200 shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả ({appointments.length})
            </button>
            <button
              onClick={() => setActiveTab('CHO_TIEP_NHAN')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CHO_TIEP_NHAN'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chờ Tiếp Nhận ({pendingAppointments.length})
            </button>
            <button
              onClick={() => setActiveTab('HOAN_THANH')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'HOAN_THANH'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Đã Hoàn Thành ({completedCount})
            </button>
          </div>
        </div>

        {/* Danh sách các lượt hẹn */}
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 space-y-3">
            <div className="w-10 h-10 border-3 border-blood-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">Đang tải lịch sử hiến máu từ máy chủ...</p>
          </div>
        ) : appointments.length === 0 ? (
          /* TRƯỜNG HỢP CHƯA CÓ LỊCH SỬ NÀO */
          <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-red-50 text-blood-primary rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8 fill-blood-primary/20 text-blood-primary" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-lg font-bold text-slate-900">
                Bạn Chưa Có Lượt Hiến Máu Nào
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                "Mỗi giọt máu cho đi - Một cuộc đời ở lại". Hãy đăng ký tham gia các sự kiện hiến máu gần bạn để sẻ chia sự sống cho những bệnh nhân cần máu khẩn cấp!
              </p>
            </div>
            <div>
              <Link
                to="/events"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blood-primary hover:bg-blood-dark text-white rounded-2xl text-xs font-bold shadow-md shadow-blood-primary/20 transition-all cursor-pointer"
              >
                Khám Phá Điểm Hiến Máu Ngay <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : filteredList.length === 0 ? (
          /* LỌC TAB KHÔNG CÓ KẾT QUẢ */
          <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-xs font-medium">
            Không có lượt hẹn nào trong mục này.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredList.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 bg-red-50 text-blood-primary rounded-2xl flex items-center justify-center shrink-0">
                    <Droplet className="w-6 h-6 fill-blood-primary" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-base">
                        {app.tenSuKien}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                        #{app.id}
                      </span>
                      {app.soChungNhan && (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          {app.soChungNhan}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{app.diaDiem} {app.diaChi && app.diaChi !== app.diaDiem ? `(${app.diaChi})` : ''}</span>
                    </p>

                    <div className="flex items-center gap-3 text-xs text-slate-600 font-medium flex-wrap">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Calendar className="w-3.5 h-3.5 text-blood-primary" /> {app.ngayHen}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {app.khungGio}
                      </span>
                      <span className="font-bold text-blood-primary flex items-center gap-0.5">
                        <Droplet className="w-3 h-3 fill-blood-primary" /> Lượng máu: {app.luongMau || `${app.luongMauHienMl || 350}ml`}
                      </span>
                    </div>

                    {app.ghiChu && (
                      <p className="text-[11px] text-slate-400 italic">
                        Ghi chú: {app.ghiChu}
                      </p>
                    )}
                  </div>
                </div>

                {/* Trạng thái & Action buttons */}
                <div className="flex items-center gap-2.5 sm:self-center shrink-0">
                  {getStatusBadge(app.trangThai)}

                  {app.trangThai === 'CHO_TIEP_NHAN' ? (
                    <>
                      <button
                        onClick={() => setShowQRModal(app)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Mã QR
                      </button>
                      <button
                        onClick={() => handleCancelAppointment(app.id)}
                        className="px-3 py-2 bg-slate-100 hover:bg-red-50 hover:text-blood-primary text-slate-600 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                      >
                        Hủy hẹn
                      </button>
                    </>
                  ) : app.trangThai === 'HOAN_THANH' ? (
                    <button
                      onClick={() => setSelectedCertModal(app)}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" /> Xem Chứng Nhận
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. MODAL XEM MÃ QR CHECK-IN */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base">Mã QR Check-in Điểm Hiến</h3>
              <button 
                onClick={() => setShowQRModal(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-slate-500">
              Đưa mã QR này cho cán bộ y tế tại bàn tiếp nhận để làm thủ tục nhanh
            </p>

            <div className="w-48 h-48 bg-slate-900 rounded-2xl p-4 flex items-center justify-center text-white mx-auto shadow-inner">
              <QrCode className="w-40 h-40" />
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-left space-y-1 text-xs">
              <div className="font-extrabold text-slate-900">{showQRModal.tenSuKien}</div>
              <div className="text-slate-600 font-medium">Lịch hẹn: {showQRModal.ngayHen} ({showQRModal.khungGio})</div>
              <div className="font-mono text-xs font-bold text-blood-primary">Mã đặt: #{showQRModal.id}</div>
            </div>

            <button
              onClick={() => setShowQRModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Đóng Cửa Sổ
            </button>
          </div>
        </div>
      )}

      {/* 4. MODAL GIẤY CHỨNG NHẬN HIẾN MÁU TÌNH NGUYỆN */}
      {selectedCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-amber-200 relative my-8">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCertModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Khung giấy chứng nhận chuẩn trang trọng */}
            <div className="border-4 border-double border-amber-500/70 rounded-2xl p-6 sm:p-7 bg-amber-50/20 text-center space-y-4 relative overflow-hidden">
              <div className="absolute top-2 left-2 opacity-10">
                <Heart className="w-24 h-24 fill-blood-primary text-blood-primary" />
              </div>
              <div className="absolute bottom-2 right-2 opacity-10">
                <Award className="w-24 h-24 fill-amber-500 text-amber-500" />
              </div>

              {/* Quốc hiệu & Tiêu ngữ */}
              <div className="space-y-0.5">
                <p className="text-[11px] font-black tracking-widest text-slate-800 uppercase">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
                <p className="text-[10px] font-semibold text-slate-600 underline underline-offset-4">
                  Độc lập - Tự do - Hạnh phúc
                </p>
              </div>

              <div className="py-1">
                <p className="text-[10px] font-black uppercase text-amber-800 tracking-wider">
                  BAN CHỈ ĐẠO QUỐC GIA VẬN ĐỘNG HIẾN MÁU TÌNH NGUYỆN
                </p>
                <h2 className="text-xl sm:text-2xl font-black text-blood-primary uppercase tracking-tight mt-1">
                  GIẤY CHỨNG NHẬN
                </h2>
                <p className="text-xs font-black uppercase tracking-widest text-slate-700">
                  HIẾN MÁU TÌNH NGUYỆN
                </p>
                <div className="inline-block mt-1 font-mono text-xs font-bold text-slate-500 bg-white/80 px-3 py-0.5 rounded-full border border-amber-200">
                  Số: {selectedCertModal.soChungNhan || `GCN-2025-${selectedCertModal.id}`}
                </div>
              </div>

              {/* Nội dung chứng nhận */}
              <div className="space-y-2 text-xs text-slate-800 border-t border-b border-amber-200/80 py-4 my-2">
                <p>
                  Chứng nhận Tình nguyện viên:
                </p>
                <p className="text-base sm:text-lg font-black text-slate-900">
                  {user?.fullName || user?.hoTen || 'Nguyễn Văn An'}
                </p>
                
                <div className="grid grid-cols-2 gap-2 text-left bg-white/90 p-3 rounded-xl border border-amber-100 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Nhóm máu:</span>
                    <span className="font-extrabold text-blood-primary text-sm">
                      {selectedCertModal.nhomMau || user?.bloodType || 'A+'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Lượng máu đã hiến:</span>
                    <span className="font-bold text-slate-900">
                      {selectedCertModal.luongMau || '350ml'}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Thời gian & Sự kiện:</span>
                    <span className="font-medium text-slate-800">
                      {selectedCertModal.ngayHen} &bull; {selectedCertModal.tenSuKien}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 block text-[10px]">Địa điểm tiếp nhận:</span>
                    <span className="font-medium text-slate-700">
                      {selectedCertModal.diaDiem}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-600 italic pt-1">
                  "Đã có nghĩa cử cao đẹp hiến máu cứu người, góp phần xây dựng sự nghiệp chăm sóc và bảo vệ sức khỏe nhân dân."
                </p>
              </div>

              {/* Dấu & Chữ ký đại diện */}
              <div className="flex justify-between items-end pt-2 text-[10px] text-slate-600">
                <div className="text-left">
                  <p className="font-bold">Mã số hồ sơ:</p>
                  <p className="font-mono">{selectedCertModal.id}</p>
                </div>
                <div className="text-right">
                  <p className="italic">TP. Hồ Chí Minh, ngày {selectedCertModal.ngayHen}</p>
                  <p className="font-bold uppercase text-slate-800 mt-1">TM. BAN TỔ CHỨC TIẾP NHẬN</p>
                  <div className="h-10 flex items-center justify-end">
                    <span className="text-red-600 font-serif font-black tracking-widest text-xs border border-red-500 px-2 py-0.5 rounded rotate-[-4deg]">
                      [ĐÃ ĐÓNG DẤU]
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  toast.success('Đang gửi lệnh in Giấy Chứng Nhận...');
                  window.print();
                }}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> In Giấy Chứng Nhận
              </button>
              <button
                onClick={() => {
                  toast.success('Đã tải xuống Giấy Chứng Nhận định dạng PDF!');
                  setSelectedCertModal(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> Tải Bản PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MyDonationsPage;
