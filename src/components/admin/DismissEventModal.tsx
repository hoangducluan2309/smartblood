import React, { useState } from 'react';
import { 
  X, 
  PowerOff, 
  Calendar, 
  MapPin, 
  Building2, 
  Users,
  AlertTriangle
} from 'lucide-react';
import { DonationEvent } from '../../types';

interface DismissEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  event: DonationEvent | null;
}

const DEFAULT_EVENT_REASONS = [
  'Đã tiếp nhận đủ chỉ tiêu người đăng ký hiến máu',
  'Kết thúc sớm theo kế hoạch của Ban tổ chức',
  'Tạm hoãn do điều kiện thời tiết / nguyên nhân khách quan',
  'Địa điểm tổ chức có sự thay đổi hoặc bảo trì',
  'Khác (nhập ghi chú bên dưới)',
];

export const DismissEventModal: React.FC<DismissEventModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  event,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(DEFAULT_EVENT_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen || !event) return null;

  const handleConfirm = () => {
    const finalReason = selectedReason === DEFAULT_EVENT_REASONS[4]
      ? (customNote.trim() || 'Tắt sự kiện theo chỉ đạo Quản trị viên')
      : selectedReason;
    onConfirm(finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với hiệu ứng gradient */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <PowerOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight">Xác Nhận Tắt Thẻ Sự Kiện</h3>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 text-white rounded-md border border-white/30 backdrop-blur-sm">
                    ADMIN
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Đồng bộ trạng thái vào bảng <strong className="text-white underline">dbo.SuKienHienMau</strong>
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Tóm tắt thông tin sự kiện đang tắt */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm">{event.tenSuKien}</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">{event.diaDiem}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-600" />
                <span>{event.ngayToChuc}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span className="truncate">{event.donViToChuc}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-600" />
                <span>Đã ĐK: <strong>{event.daDangKy}/{event.chiTieu}</strong></span>
              </div>
            </div>
          </div>

          {/* Cảnh báo tác vụ */}
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Khi tắt sự kiện, người dân sẽ <strong>không thể đăng ký mới</strong> tham gia sự kiện này. Trạng thái trong CSDL sẽ chuyển sang <code>DaHuy</code>. Bạn vẫn có thể mở lại bất cứ lúc nào.
            </span>
          </div>

          {/* Chọn lý do tắt sự kiện */}
          <div className="space-y-2.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Lý do tắt sự kiện:
            </label>
            <div className="space-y-1.5">
              {DEFAULT_EVENT_REASONS.map((reason, idx) => (
                <label 
                  key={idx}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    selectedReason === reason
                      ? 'bg-red-50/70 border-red-300 text-red-950 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="dismissReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-600 w-4 h-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {/* Ô ghi chú tùy chỉnh nếu chọn Khác */}
            {selectedReason === DEFAULT_EVENT_REASONS[4] && (
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Nhập lý do cụ thể..."
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 font-medium"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 sm:p-6 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <PowerOff className="w-4 h-4" />
            <span>Xác Nhận Tắt Sự Kiện</span>
          </button>
        </div>
      </div>
    </div>
  );
};
