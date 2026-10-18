import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  X, 
  Sparkles, 
  PlusCircle,
  AlertCircle
} from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdEvent: any) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  // Mặc định: ngày mai, từ 07:30 đến 11:30
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [form, setForm] = useState({
    tenSuKien: '',
    diaDiem: '',
    thoiGianBatDau: `${tomorrowStr}T07:30`,
    thoiGianKetThuc: `${tomorrowStr}T11:30`,
    soLuongDuKien: 150,
    moTa: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'soLuongDuKien' ? Math.max(1, Number(value)) : value
    }));
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Kiểm tra tính hợp lệ cơ bản
    if (!form.tenSuKien.trim()) {
      setErrorMsg('Vui lòng nhập tên sự kiện hiến máu.');
      return;
    }
    if (!form.diaDiem.trim()) {
      setErrorMsg('Vui lòng nhập địa điểm tổ chức sự kiện.');
      return;
    }

    const startDate = new Date(form.thoiGianBatDau);
    const endDate = new Date(form.thoiGianKetThuc);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      setErrorMsg('Định dạng thời gian không hợp lệ.');
      return;
    }

    if (endDate <= startDate) {
      setErrorMsg('Thời gian kết thúc phải diễn ra sau thời gian bắt đầu.');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        tenSuKien: form.tenSuKien.trim(),
        diaDiem: form.diaDiem.trim(),
        thoiGianBatDau: startDate.toISOString(),
        thoiGianKetThuc: endDate.toISOString(),
        soLuongDuKien: Number(form.soLuongDuKien) || 100,
        moTa: form.moTa.trim() || undefined,
      };

      const res = await axiosClient.post('/donation-events', payload);
      const createdData = res.data?.data || res.data;

      toast.success('🎉 Tạo sự kiện hiến máu thành công!');
      onSuccess(createdData);
      onClose();

      // Reset form
      setForm({
        tenSuKien: '',
        diaDiem: '',
        thoiGianBatDau: `${tomorrowStr}T07:30`,
        thoiGianKetThuc: `${tomorrowStr}T11:30`,
        soLuongDuKien: 150,
        moTa: '',
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi tạo sự kiện. Vui lòng kiểm tra lại quyền Admin.';
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden my-8 transform transition-all animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header với hiệu ứng gradient 3D Envato */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <PlusCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">Tạo Sự Kiện Hiến Máu Mới</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-white rounded-md border border-white/30 backdrop-blur-sm">
                    Admin Exclusive
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Chỉ Quản trị viên hệ thống có quyền phát động chiến dịch tiếp nhận máu
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Tên sự kiện */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Tên Sự Kiện Hiến Máu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Sparkles className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="tenSuKien"
                required
                value={form.tenSuKien}
                onChange={handleChange}
                placeholder="Ví dụ: Ngày Hội Giọt Hồng Nghĩa Tình 2026 - Quận 1"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Địa điểm tổ chức */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Địa Điểm Tổ Chức & Tiếp Nhận <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="diaDiem"
                required
                value={form.diaDiem}
                onChange={handleChange}
                placeholder="Ví dụ: Nhà Văn Hóa Thanh Niên, Số 04 Phạm Ngọc Thạch, Bến Nghé, Quận 1"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Thời gian bắt đầu & kết thúc */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Thời Gian Bắt Đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="datetime-local"
                  name="thoiGianBatDau"
                  required
                  value={form.thoiGianBatDau}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Thời Gian Kết Thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="datetime-local"
                  name="thoiGianKetThuc"
                  required
                  value={form.thoiGianKetThuc}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Chỉ tiêu dự kiến (người hiến) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Chỉ Tiêu Dự Kiến (Người hiến)
            </label>
            <div className="relative">
              <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                name="soLuongDuKien"
                min="10"
                max="5000"
                value={form.soLuongDuKien}
                onChange={handleChange}
                placeholder="Ví dụ: 150"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          {/* Mô tả / Ghi chú */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Mô Tả & Thông Điệp Chiến Dịch
            </label>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <textarea
                name="moTa"
                rows={3}
                value={form.moTa}
                onChange={handleChange}
                placeholder="Nội dung tuyên truyền, quà tặng, quyền lợi người hiến máu, lưu ý sức khỏe trước khi đến..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-sm transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-extrabold text-sm shadow-lg shadow-red-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Khởi Tạo...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Xác Nhận Tạo Sự Kiện</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
