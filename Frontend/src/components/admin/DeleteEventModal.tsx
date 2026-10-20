import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  X, 
  Calendar, 
  MapPin, 
  Users 
} from 'lucide-react';
import { DonationEvent } from '../../types';

interface DeleteEventModalProps {
  isOpen: boolean;
  event: DonationEvent | null;
  onClose: () => void;
  onConfirm: (event: DonationEvent) => Promise<void>;
}

export const DeleteEventModal: React.FC<DeleteEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onConfirm,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !event) return null;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onConfirm(event);
      onClose();
    } catch {
      // Error handled in parent
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-red-200/80 overflow-hidden my-8 transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với tông màu đỏ cảnh báo */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">Xóa Sự Kiện Hiến Máu</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-white rounded-md border border-white/30 backdrop-blur-sm">
                    Admin & Bác Sĩ
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Xác nhận gỡ bỏ chiến dịch khỏi hệ thống
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isDeleting}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nội dung xác nhận */}
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50/80 border border-red-200 text-red-800">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
            <div className="text-xs sm:text-sm font-medium leading-relaxed">
              Bạn có chắc chắn muốn xóa sự kiện này không? Hành động này sẽ xóa vĩnh viễn dữ liệu sự kiện khỏi hệ thống CSDL và gỡ liên kết các lịch hẹn liên quan.
            </div>
          </div>

          {/* Chi tiết sự kiện cần xóa */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
            <h4 className="text-sm font-black text-slate-900 leading-snug">
              {event.tenSuKien}
            </h4>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="truncate">{event.diaDiem}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>{event.ngayToChuc} &bull; {event.gioBatDau} - {event.gioKetThuc}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span>Chỉ tiêu: {event.chiTieu} người &bull; Đã đăng ký: {event.daDangKy}</span>
              </div>
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-md shadow-red-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Xóa...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Xác Nhận Xóa</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
