import React, { useState } from 'react';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldAlert, 
  Copy, 
  Search, 
  Droplet, 
  Siren,
  PowerOff,
  CheckCircle2,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useEmergency } from '../contexts/EmergencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useCallModal } from '../contexts/CallModalContext';
import { DismissEmergencyModal } from '../components/emergency/DismissEmergencyModal';
import { EmergencyCardItem } from '../types';

export const EmergencyPage: React.FC = () => {
  const { emergencyList, dismissEmergencyCard, restoreEmergencyCard } = useEmergency();
  const { user } = useAuth();
  const { openCallModal } = useCallModal();
  const [statusTab, setStatusTab] = useState<'ACTIVE' | 'DISMISSED' | 'ALL'>('ACTIVE');
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dismissTarget, setDismissTarget] = useState<EmergencyCardItem | null>(null);
  const hotlineNumber = '1900 6868';

  // Quyền hạn: Chỉ Bác sĩ (HOSPITAL_STAFF) và Admin có quyền tắt thẻ cấp cứu
  const canDismiss = user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF';

  const activeCount = emergencyList.filter((r) => !r.isDismissed).length;
  const dismissedCount = emergencyList.filter((r) => r.isDismissed).length;

  // Lọc theo trạng thái tab: Đang khẩn cấp (mặc định), Đã tắt, hoặc Tất cả
  const currentRequests = emergencyList.filter((r) => {
    if (statusTab === 'ACTIVE') return !r.isDismissed;
    if (statusTab === 'DISMISSED') return r.isDismissed;
    return true; // 'ALL'
  });

  const bloodGroups = ['ALL', 'O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const filteredRequests = currentRequests.filter((r) => {
    const matchGroup = selectedGroup === 'ALL' || r.bloodType === selectedGroup;
    const matchSearch =
      searchTerm === '' ||
      r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.bloodType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchGroup && matchSearch;
  });

  const handleConfirmDismiss = async (reason: string) => {
    if (!dismissTarget) return;
    await dismissEmergencyCard(dismissTarget.id, reason);
    toast.success(`Đã tắt thành công thẻ cấp cứu ${dismissTarget.id} cho ${dismissTarget.patient}!`);
    setDismissTarget(null);
  };

  const handleConfirmRestore = async (card: EmergencyCardItem) => {
    await restoreEmergencyCard(card.id);
    toast.success(`Đã khôi phục và mở lại thẻ cấp cứu ${card.id}!`);
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. ENVATO 3D HERO ALERT BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-6 sm:p-8 shadow-xl shadow-red-500/20 border border-white/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-7 h-7 text-white animate-pulse" />
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-black uppercase tracking-wider text-rose-100">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                Trung Tâm Điều Phối Cấp Cứu 24/7 &bull; Đồng Bộ SQL Server
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">
                Danh Sách Ca Bệnh Cần Máu Hỏa Tốc
              </h1>
              <p className="text-xs sm:text-sm text-red-100 max-w-xl font-medium">
                Mỗi phút trôi qua đều quý giá đối với sinh mạng người bệnh. Nếu bạn có nhóm máu tương thích, vui lòng nhấn gọi trực tiếp điều phối viên!
              </p>
            </div>
          </div>
          
          {/* Số lượng ca cấp cứu đồng bộ 100% với Navbar */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start w-full md:w-auto pt-3 md:pt-0 border-t border-white/20 md:border-t-0 shrink-0">
            <div className="text-left md:text-right">
              <span className="text-3xl md:text-4xl font-black text-amber-200">
                {statusTab === 'DISMISSED' ? dismissedCount : activeCount}
              </span>
              <span className="block text-[11px] md:text-xs uppercase font-extrabold text-white/95 tracking-wide">
                {statusTab === 'DISMISSED' ? 'Ca Đã Kết Thúc / Đã Tắt' : 'Ca Đang Cần Máu Khẩn Cấp'}
              </span>
            </div>
            <span className="text-[11px] text-amber-100/90 font-semibold md:mt-0.5 text-right">
              {statusTab === 'DISMISSED' 
                ? `(Còn ${activeCount} ca khẩn cấp / Tổng ${emergencyList.length} ca)`
                : `(Đã tắt ${dismissedCount} / Tổng ${emergencyList.length} ca trong CSDL)`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. CHỌN TAB TRẠNG THÁI (ĐANG KHẨN CẤP / ĐÃ TẮT / TẤT CẢ) */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        
        {/* Tab status switcher - Mặc định là Đang Khẩn Cấp khớp 100% với Navbar */}
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
            Đang Khẩn Cấp ({activeCount})
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
            Đã Tắt / Xong ({dismissedCount})
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
            Tất Cả ({emergencyList.length})
          </button>
        </div>

        {/* Thông tin hỗ trợ */}
        <span className="text-xs text-slate-500 font-medium">
          Dữ liệu trực tiếp từ bảng <strong className="text-slate-700">dbo.YeuCauMauKhanCap</strong>
        </span>
      </div>

      {/* 3. FILTER & SEARCH CONTROLS (ENVATO PILLS) */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-3xl border border-slate-200/80 shadow-2xs">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên bệnh viện, bệnh nhân, nhóm máu..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100/80 focus:bg-white border border-transparent focus:border-red-400 text-xs sm:text-sm font-semibold outline-hidden transition"
          />
        </div>

        {/* Blood Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {bloodGroups.map((grp) => (
            <button
              key={grp}
              onClick={() => setSelectedGroup(grp)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                selectedGroup === grp
                  ? 'bg-red-600 text-white shadow-md shadow-red-500/30 scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp === 'ALL' ? 'Tất cả' : grp}
            </button>
          ))}
        </div>

      </div>

      {/* 3.5. BANNER ĐẶC QUYỀN BÁC SĨ & ADMIN: QUẢN LÝ / TẮT THẺ CẤP CỨU */}
      {canDismiss && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-red-50 via-rose-50 to-amber-50 border border-red-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-red-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-900 text-xs sm:text-sm">
                  Chế Độ Kiểm Soát Thẻ Cấp Cứu ({user?.role === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Bác Sĩ / Y Tế'})
                </span>
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 rounded-md font-bold">
                  Toàn Quyền
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Bác sĩ và Admin có quyền bấm <strong>Tắt Thẻ</strong> khi ca bệnh đã tiếp nhận đủ máu, hoặc <strong>Bật Lại Thẻ</strong> để tiếp tục kêu gọi.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. 3D EMERGENCY CARD GRID */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800">Không tìm thấy ca bệnh nào phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchTerm || selectedGroup !== 'ALL' 
              ? 'Thử đổi nhóm máu hoặc từ khóa tìm kiếm khác.'
              : 'Hiện không có ca cấp cứu nào trong danh mục này.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {filteredRequests.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-3xl p-5 sm:p-6 transition-all duration-300 relative overflow-hidden group ${
                item.isDismissed
                  ? 'border border-slate-300/80 bg-slate-50/70 opacity-80'
                  : item.isAlertActive 
                    ? 'border-2 border-red-500 shadow-xl shadow-red-500/20 ring-2 ring-red-400/30' 
                    : 'border border-red-200/90 hover:border-red-500 shadow-sm hover:shadow-2xl'
              }`}
            >
              <div className="space-y-4">
                
                {/* Card Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-xl font-black text-xs ${
                      item.isDismissed
                        ? 'bg-slate-200 text-slate-700'
                        : item.isAlertActive 
                          ? 'bg-red-600 text-white shadow-xs' 
                          : 'bg-red-50 border border-red-200 text-red-600'
                    }`}>
                      {item.id}
                    </span>
                    {!item.isDismissed && item.isAlertActive && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-lg shadow-xs animate-pulse">
                        <Siren className="w-3 h-3 text-white" /> BÁO ĐỘNG ĐỎ
                      </span>
                    )}
                    {item.isDismissed && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-slate-600 bg-slate-200 px-2 py-0.5 rounded-lg">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ĐÃ TẮT THẺ
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-100/80 px-2.5 py-1 rounded-full border border-red-200 whitespace-nowrap">
                      <Clock className="w-3 h-3 shrink-0" /> {item.deadline}
                    </span>
                    {canDismiss && !item.isDismissed && (
                      <button
                        type="button"
                        onClick={() => setDismissTarget(item)}
                        title="Bác sĩ / Admin tắt thẻ cấp cứu này"
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Main Blood Badge & Title */}
                <div className="flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/30">
                    {item.bloodType}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h3 className="font-black text-slate-900 text-base sm:text-lg leading-tight truncate">
                      {item.patient}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-extrabold text-red-600">
                      <Droplet className="w-3.5 h-3.5 fill-red-600 shrink-0" />
                      <span>Cần gấp: {item.units}</span>
                    </div>
                  </div>
                </div>

                {/* Hospital Information */}
                <div className="p-3.5 rounded-2xl bg-red-50/50 border border-red-100/80 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <MapPin className="w-3.5 h-3.5 text-red-600 shrink-0" />
                    <span className="truncate">{item.hospital}</span>
                  </div>
                  <div className="text-slate-600 pl-5.5 text-[11px] font-medium">
                    {item.department} &bull; {item.address}
                  </div>
                  <div className="text-slate-600 pl-5.5 text-[11px] font-medium flex items-center gap-1.5">
                    <span>Điều phối:</span>
                    <strong className="text-slate-800">{item.coordinator}</strong>
                  </div>
                  {item.dismissReason && (
                    <div className="text-amber-800 bg-amber-50 p-2 rounded-xl border border-amber-200 text-[11px] font-semibold mt-1">
                      Lý do tắt thẻ: {item.dismissReason}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openCallModal({
                        title: 'Liên hệ điều phối cấp cứu',
                        name: `${item.hospital} • Bệnh nhân: ${item.patientName || 'Khẩn cấp'}`,
                        phone: item.contact || '1900 6868',
                      })}
                      className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-500/25 transition-all active:scale-98 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 fill-white" />
                      <span>Gọi Cứu Trợ Ngay</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(item.contact);
                        toast.success(`Đã sao chép SĐT: ${item.contact}`);
                      }}
                      title="Sao chép SĐT"
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition-colors cursor-pointer"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* BÁC SĨ VÀ ADMIN CÓ QUYỀN TẮT CÁC THẺ CẤP CỨU */}
                  {canDismiss && !item.isDismissed && (
                    <button
                      type="button"
                      onClick={() => setDismissTarget(item)}
                      className="w-full py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200/90 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-2xs group"
                    >
                      <PowerOff className="w-3.5 h-3.5 text-red-600 group-hover:scale-110 transition-transform" />
                      <span>Tắt Thẻ Cấp Cứu ({user?.role === 'ADMIN' ? 'Admin' : 'Bác Sĩ'})</span>
                    </button>
                  )}

                  {canDismiss && item.isDismissed && (
                    <button
                      type="button"
                      onClick={() => handleConfirmRestore(item)}
                      className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 hover:text-emerald-800 border border-emerald-200/90 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Khôi Phục / Bật Lại Thẻ Cấp Cứu</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. MODAL XÁC NHẬN TẮT THẺ CẤP CỨU */}
      <DismissEmergencyModal
        isOpen={!!dismissTarget}
        onClose={() => setDismissTarget(null)}
        onConfirm={handleConfirmDismiss}
        request={dismissTarget}
        actorRole={user?.role || 'HOSPITAL_STAFF'}
      />
    </div>
  );
};

export default EmergencyPage;
