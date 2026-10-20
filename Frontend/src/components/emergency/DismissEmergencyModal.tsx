import React, { useState } from 'react';
import { 
  X, 
  PowerOff, 
  ShieldCheck, 
  Droplet, 
  Building2 
} from 'lucide-react';

interface DismissEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  request: {
    id: string;
    patient: string;
    bloodType: string;
    units: string;
    hospital: string;
  } | null;
  actorRole: string;
}

const DEFAULT_REASONS = [
  'Đã tiếp nhận đủ máu & hoàn tất truyền máu thành công',
  'Bệnh nhân đã qua cơn nguy kịch',
  'Đã điều phối xe cấp cứu 115 giao máu đến viện',
  'Chuyển viện / Hủy yêu cầu cấp cứu',
  'Khác (nhập ghi chú bên dưới)',
];

export const DismissEmergencyModal: React.FC<DismissEmergencyModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  request,
  actorRole,
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(DEFAULT_REASONS[0]);
  const [customNote, setCustomNote] = useState<string>('');

  if (!isOpen || !request) return null;

  const handleConfirm = () => {
    const finalReason = selectedReason === DEFAULT_REASONS[4]
      ? (customNote.trim() || 'Đã đóng ca cấp cứu')
      : selectedReason;
    onConfirm(finalReason);
    onClose();
  };

  const roleLabel = actorRole === 'ADMIN' ? 'Quản Trị Viên (Admin)' : 'Bác Sĩ / Nhân Viên Y Tế';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với hiệu ứng gradient 3D Envato */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <PowerOff className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black tracking-tight">Xác Nhận Tắt Thẻ Cấp Cứu</h3>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-white/20 text-white rounded-md border border-white/30 backdrop-blur-sm">
                    {actorRole}
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Xác nhận bởi: <strong className="text-white underline">{roleLabel}</strong>
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
          {/* Tóm tắt thông tin ca cấp cứu đang tắt */}
          <div className="p-4 rounded-2xl bg-red-50/80 border border-red-200/80 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black text-lg flex items-center justify-center shrink-0 shadow-sm">
              {request.bloodType}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm truncate">{request.patient}</h4>
                <span className="font-mono text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                  {request.id}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{request.hospital}</span>
              </p>
              <p className="text-xs text-red-700 mt-0.5 font-bold flex items-center gap-1">
                <Droplet className="w-3 h-3 fill-red-700" />
                {request.units}
              </p>
            </div>
          </div>

          {/* Chọn Lý Do Tắt Thẻ */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
              Chọn lý do đóng / tắt thẻ báo động cấp cứu:
            </label>
            <div className="space-y-2">
              {DEFAULT_REASONS.map((reason) => (
                <label 
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                    selectedReason === reason 
                      ? 'bg-red-50 border-red-400 text-red-900 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="dismissReason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="text-red-600 focus:ring-red-500 h-4 w-4"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === DEFAULT_REASONS[4] && (
              <textarea
                rows={2}
                placeholder="Nhập lý do chi tiết..."
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-400/20"
              />
            )}
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thẻ sẽ được gỡ khỏi danh sách trực tuyến và số lượng ca khẩn cấp sẽ tự động giảm đi 1.</span>
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
            >
              Hủy / Giữ Thẻ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md shadow-red-500/25 active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
            >
              <PowerOff className="w-3.5 h-3.5" />
              <span>Xác Nhận Tắt Thẻ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
