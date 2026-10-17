import React, { useState } from 'react';
import { DonationEvent } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { axiosClient } from '../../api/axiosClient';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  CheckCircle2, 
  Droplet, 
  Heart, 
  AlertTriangle 
} from 'lucide-react';
import toast from 'react-hot-toast';

interface BookModalProps {
  event: DonationEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookModal: React.FC<BookModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [selectedSlot, setSelectedSlot] = useState('08:00 - 09:00');
  const [luongMau, setLuongMau] = useState('350ml');
  const [ghiChu, setGhiChu] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !event) return null;

  // 1. KIỂM TRA QUY ĐỊNH GIÃN CÁCH 84 NGÀY (12 TUẦN)
  const lastDonationStr = user?.lastDonationDate;
  let isEligible = true;
  let remainingDays = 0;
  let diffDays = 0;
  let lastDonationDate: Date | null = null;
  let eligibleDateFormatted = '';

  if (lastDonationStr) {
    lastDonationDate = new Date(lastDonationStr);
    const eventDate = new Date(event.ngayToChuc || new Date());
    const diffTime = eventDate.getTime() - lastDonationDate.getTime();
    diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const REQUIRED_GAP_DAYS = 84; // 12 tuần
    isEligible = diffDays >= REQUIRED_GAP_DAYS;
    remainingDays = REQUIRED_GAP_DAYS - diffDays;

    const eligibleDate = new Date(lastDonationDate);
    eligibleDate.setDate(eligibleDate.getDate() + REQUIRED_GAP_DAYS);
    eligibleDateFormatted = eligibleDate.toLocaleDateString('vi-VN');
  }

  const timeSlots = [
    '07:30 - 08:30',
    '08:30 - 09:30',
    '09:30 - 10:30',
    '10:30 - 11:30',
    '13:30 - 14:30',
    '14:30 - 15:30',
  ];

  // Xử lý gửi yêu cầu đặt lịch hẹn tới Backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isEligible) {
      toast.error(`Bạn chưa đủ 84 ngày kể từ lần hiến trước! Còn thiếu ${remainingDays} ngày.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const appointmentDateStr = event.ngayToChuc || new Date().toISOString().split('T')[0];
      const payload = {
        suKienId: event.id,
        ngayHen: appointmentDateStr,
        khungGio: selectedSlot,
        luongMauHienMl: parseInt(luongMau.replace(/\D/g, '')) || 350,
        tinhTrangSucKhoe: 'Tốt, sẵn sàng hiến máu',
        ghiChu: ghiChu || `Đăng ký tại sự kiện: ${event.tenSuKien}`,
      };

      await axiosClient.post('/donation-appointments', payload);
      toast.success('🎉 Đặt lịch hẹn hiến máu thành công! Lịch hẹn đã chuyển sang trang Duyệt lịch của bệnh viện.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Không thể đặt lịch. Vui lòng kiểm tra lại điều kiện giãn cách 84 ngày!';
      toast.error(errorMsg, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col"
        role="dialog"
      >
        
        {/* Header Modal */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-50 via-slate-50 to-red-50 border-b border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blood-primary text-white flex items-center justify-center shadow-md shadow-blood-primary/20">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                Đặt Lịch Hẹn Hiến Máu
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Điểm hiến: {event.tenSuKien}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Tóm tắt thông tin sự kiện */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <MapPin className="w-4 h-4 text-blood-primary shrink-0" />
              <span>{event.diaDiem} ({event.diaChi}, {event.quanHuyen})</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Ngày tổ chức: <strong>{event.ngayToChuc}</strong> ({event.gioBatDau} - {event.gioKetThuc})</span>
            </div>
          </div>

          {/* CẢNH BÁO QUY ĐỊNH 84 NGÀY NẾU CHƯA ĐỦ ĐIỀU KIỆN */}
          {!isEligible ? (
            <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-blood-dark space-y-2.5 animate-pulse">
              <div className="flex items-center gap-2 text-blood-primary font-black text-sm">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>CHƯA ĐỦ KHOẢNG CÁCH 84 NGÀY AN TOÀN!</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                Lần hiến máu gần nhất của bạn là ngày <strong>{lastDonationDate?.toLocaleDateString('vi-VN')}</strong> (đã qua {diffDays} ngày). 
                Theo quy định y tế của Bộ Y Tế, khoảng cách giữa 2 lần hiến máu toàn phần tối thiểu là <strong>84 ngày (12 tuần)</strong>.
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-red-200 text-xs font-bold text-blood-primary flex items-center justify-between">
                <span>Số ngày cần chờ thêm:</span>
                <span className="text-sm font-black text-red-600 bg-red-100 px-2.5 py-0.5 rounded-lg">
                  {remainingDays} Ngày nữa (Đến {eligibleDateFormatted})
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              <span>Bạn đã đủ điều kiện giãn cách 84 ngày để tham gia hiến máu!</span>
            </div>
          )}

          {/* Form chọn khung giờ và lượng máu */}
          <form id="book-appointment-form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Chọn khung giờ */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Chọn Khung Giờ Đến Hiến <span className="text-blood-primary">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={!isEligible}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-blood-primary text-white border-blood-primary shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-red-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chọn thể tích hiến */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Thể Tích Máu Đăng Ký Hiến
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['250ml', '350ml', '450ml'].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    disabled={!isEligible}
                    onClick={() => setLuongMau(vol)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-black transition-all border flex items-center justify-center gap-1 cursor-pointer ${
                      luongMau === vol
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed'
                    }`}
                  >
                    <Droplet className="w-3.5 h-3.5" />
                    {vol}
                  </button>
                ))}
              </div>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Ghi chú tình trạng sức khỏe (Nếu có)
              </label>
              <input
                type="text"
                disabled={!isEligible}
                placeholder="Ví dụ: Đã tiêm vaccine, sức khỏe hoàn toàn bình thường..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20 disabled:opacity-40"
              />
            </div>
          </form>

        </div>

        {/* Footer Modal Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <button
            type="submit"
            form="book-appointment-form"
            disabled={!isEligible || isSubmitting}
            className="px-6 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-xl text-xs shadow-md shadow-blood-primary/30 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <span>Đang gửi xác nhận...</span>
            ) : !isEligible ? (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>Chưa đủ 84 ngày</span>
              </>
            ) : (
              <>
                <Heart className="w-4 h-4 fill-white" />
                <span>Xác Nhận Đặt Lịch Hẹn</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default BookModal;
