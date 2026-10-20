import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  FileText, 
  X, 
  Edit3, 
  AlertCircle,
  Activity
} from 'lucide-react';
import { DonationEvent } from '../../types';
import { axiosClient } from '../../api/axiosClient';
import toast from 'react-hot-toast';

interface EditEventModalProps {
  isOpen: boolean;
  event: DonationEvent | null;
  onClose: () => void;
  onSuccess: (updatedEvent: any) => void;
}

export const EditEventModal: React.FC<EditEventModalProps> = ({
  isOpen,
  event,
  onClose,
  onSuccess,
}) => {
  const [form, setForm] = useState({
    tenSuKien: '',
    diaDiem: '',
    thoiGianBatDau: '',
    thoiGianKetThuc: '',
    soLuongDuKien: 100,
    trangThai: 'SapDienRa',
    moTa: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (event) {
      // Chuẩn hóa ngày giờ từ event (ngayToChuc, gioBatDau, gioKetThuc)
      let startStr = '';
      let endStr = '';

      if (event.ngayToChuc && event.gioBatDau) {
        const timePart = event.gioBatDau.length === 5 ? event.gioBatDau : '07:30';
        startStr = `${event.ngayToChuc}T${timePart}`;
      } else {
        const now = new Date();
        startStr = `${now.toISOString().split('T')[0]}T07:30`;
      }

      if (event.ngayToChuc && event.gioKetThuc) {
        const timePart = event.gioKetThuc.length === 5 ? event.gioKetThuc : '11:30';
        endStr = `${event.ngayToChuc}T${timePart}`;
      } else {
        const now = new Date();
        endStr = `${now.toISOString().split('T')[0]}T11:30`;
      }

      setForm({
        tenSuKien: event.tenSuKien || '',
        diaDiem: event.diaDiem || event.diaChi || '',
        thoiGianBatDau: startStr,
        thoiGianKetThuc: endStr,
        soLuongDuKien: event.chiTieu || 100,
        trangThai: event.trangThai || 'SapDienRa',
        moTa: event.ghiChu || '',
      });
      setErrorMsg(null);
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
        trangThai: form.trangThai,
        moTa: form.moTa.trim() || undefined,
      };

      const res = await axiosClient.put(`/donation-events/${event.id}`, payload);
      const updatedData = res.data?.data || res.data;

      toast.success('🎉 Cập nhật sự kiện hiến máu thành công!');
      onSuccess(updatedData);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật sự kiện. Vui lòng kiểm tra quyền Admin / Bác sĩ.';
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
        {/* Header với gradient phong cách y tế cao cấp */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-rose-600 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight">Chỉnh Sửa Sự Kiện Hiến Máu</h3>
                  <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-white/20 text-white rounded-md border border-white/30 backdrop-blur-sm">
                    Admin & Bác Sĩ
                  </span>
                </div>
                <p className="text-xs text-blue-100 mt-0.5">
                  Cập nhật thông tin chi tiết sự kiện và trạng thái tiếp nhận
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
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
              <input
                type="text"
                name="tenSuKien"
                required
                value={form.tenSuKien}
                onChange={handleChange}
                placeholder="Ví dụ: Hành Trình Đỏ - Giọt Hồng Tình Nguyện 2026"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
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
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Chỉ tiêu & Trạng thái sự kiện */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Chỉ Tiêu Dự Kiến (Người hiến)
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  name="soLuongDuKien"
                  min="1"
                  max="10000"
                  value={form.soLuongDuKien}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Trạng Thái Sự Kiện
              </label>
              <div className="relative">
                <Activity className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  name="trangThai"
                  value={form.trangThai}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
                >
                  <option value="SapDienRa">Sắp Diễn Ra (Đang mở nhận đăng ký)</option>
                  <option value="DangDienRa">Đang Diễn Ra (Tiếp nhận hiến máu)</option>
                  <option value="KetThuc">Kết Thúc (Hoàn tất chiến dịch)</option>
                  <option value="DaHuy">Đã Hủy / Tắt Thẻ</option>
                </select>
              </div>
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
                placeholder="Thông tin tuyên truyền, lưu ý sức khỏe..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 hover:from-blue-800 hover:to-indigo-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Lưu...</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  <span>Lưu Thay Đổi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
