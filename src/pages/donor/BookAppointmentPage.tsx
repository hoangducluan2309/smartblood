import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, Heart, ArrowRight, Droplet } from 'lucide-react';
import { axiosClient } from '../../api/axiosClient';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export const BookAppointmentPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Mặc định ngày hẹn là ngày mai
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    hospital: 'Bệnh viện Chợ Rẫy (Trung tâm Truyền máu)',
    date: defaultDateStr,
    timeSlot: '08:00 - 09:30',
    amount: '350ml',
    healthStatus: 'Sức khỏe tốt, không dùng kháng sinh trong 7 ngày qua',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Vui lòng đăng nhập tài khoản trước khi đặt lịch hiến máu!');
      navigate('/login', { state: { from: { pathname: '/book-appointment' } } });
      return;
    }

    if (!formData.date || !formData.timeSlot) {
      toast.error('Vui lòng chọn ngày hẹn và khung giờ!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        ngayHen: formData.date,
        khungGio: formData.timeSlot,
        luongMauHienMl: parseInt(formData.amount.replace(/\D/g, '')) || 350,
        tinhTrangSucKhoe: formData.healthStatus,
        ghiChu: formData.notes ? `${formData.notes} | Địa điểm: ${formData.hospital}` : `Địa điểm tiếp nhận: ${formData.hospital}`,
      };

      const res = await axiosClient.post('/donation-appointments', payload);
      const appt = res.data?.data || res.data;
      setCreatedAppointment(appt);
      toast.success('🎉 Đặt lịch hẹn hiến máu thành công! Lịch hẹn đã được chuyển sang bộ phận duyệt.');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Không thể đăng ký lịch hẹn. Vui lòng kiểm tra lại!';
      toast.error(msg, { duration: 6000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* Header Banner 3D */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-100/80 text-red-600 text-xs font-black border border-red-200">
          <Droplet className="w-4 h-4 fill-red-600 animate-pulse" />
          <span>Đăng Ký Hiến Máu Chủ Động</span>
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
          Đặt Lịch Hẹn Hiến Máu
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto font-medium">
          Chủ động đặt lịch giúp bệnh viện chuẩn bị tiếp đón chu đáo, giảm thời gian chờ đợi và bảo đảm an toàn truyền máu.
        </p>
      </div>

      {createdAppointment ? (
        <div className="bg-white/95 backdrop-blur-md p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Đặt Lịch Hẹn Thành Công!</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Hệ thống đã tạo phiếu tiếp nhận mã <strong className="text-slate-900">#{createdAppointment.id || 'NEW'}</strong> ở trạng thái <span className="text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md">Chờ xác nhận</span>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs sm:text-sm space-y-2 max-w-md mx-auto">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Người đăng ký:</span>
              <strong className="text-slate-900">{user?.fullName || user?.phone}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Ngày hiến:</span>
              <strong className="text-slate-900">{formData.date}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Khung giờ:</span>
              <strong className="text-slate-900">{formData.timeSlot}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Địa điểm:</span>
              <strong className="text-slate-900 truncate max-w-[220px]">{formData.hospital}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Lượng máu dự kiến:</span>
              <strong className="text-red-600 font-bold">{formData.amount}</strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            {/* Nếu là Admin/Staff thì có nút xem ngay trang duyệt lịch */}
            {(user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF') && (
              <Link
                to="/staff/reception"
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-500/20"
              >
                <span>Xem Trên Trang Duyệt Lịch</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/my-history"
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-red-500/20"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>Xem Lịch Sử Của Tôi</span>
            </Link>

            <button
              onClick={() => {
                setCreatedAppointment(null);
              }}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm cursor-pointer"
            >
              Đặt thêm lịch hẹn
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-md p-6 sm:p-9 rounded-3xl border border-slate-200/90 shadow-xl space-y-5">
          
          {/* 1. Điểm tiếp nhận */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Bệnh viện / Điểm tiếp nhận hiến máu <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <select
                value={formData.hospital}
                onChange={(e) => setFormData({ ...formData, hospital: e.target.value })}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition shadow-inner cursor-pointer"
              >
                <option value="Bệnh viện Chợ Rẫy (Trung tâm Truyền máu)">Bệnh viện Chợ Rẫy (Khoa Truyền máu - 201B Nguyễn Chí Thanh, Q.5)</option>
                <option value="Bệnh viện Truyền máu Huyết học TP.HCM">Bệnh viện Truyền máu Huyết học TP.HCM (118 Hồng Bàng, Q.5)</option>
                <option value="Bệnh viện Đại học Y Dược TP.HCM">Bệnh viện Đại học Y Dược TP.HCM (215 Hồng Bàng, Q.5)</option>
                <option value="Bệnh viện Nhân dân 115">Bệnh viện Nhân dân 115 (527 Sư Vạn Hạnh, Q.10)</option>
                <option value="Viện Tim TP.HCM">Viện Tim TP.HCM (Số 04 Dương Quang Trung, Q.10)</option>
                <option value="Trung Tâm Điều Phối Máu Quốc Gia (Điểm lưu động)">Trung Tâm Điều Phối Máu Quốc Gia (Điểm lưu động)</option>
              </select>
            </div>
          </div>

          {/* 2. Ngày hiến & Khung giờ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Ngày hẹn hiến máu <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                Khung giờ hẹn <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <Clock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition shadow-inner cursor-pointer"
                >
                  <option value="07:30 - 08:30">07:30 - 08:30 (Buổi sáng)</option>
                  <option value="08:30 - 09:30">08:30 - 09:30 (Buổi sáng)</option>
                  <option value="09:30 - 10:30">09:30 - 10:30 (Buổi sáng)</option>
                  <option value="10:30 - 11:30">10:30 - 11:30 (Buổi sáng)</option>
                  <option value="13:30 - 14:30">13:30 - 14:30 (Buổi chiều)</option>
                  <option value="14:30 - 15:30">14:30 - 15:30 (Buổi chiều)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Lượng máu dự kiến */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Lượng máu đăng ký hiến
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['250ml', '350ml', '450ml'].map((ml) => (
                <button
                  key={ml}
                  type="button"
                  onClick={() => setFormData({ ...formData, amount: ml })}
                  className={`py-3 rounded-2xl text-xs sm:text-sm font-black border transition-all cursor-pointer ${
                    formData.amount === ml
                      ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/30 scale-102'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {ml} {ml === '350ml' && '(Phổ biến)'}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Tình trạng sức khỏe & Ghi chú */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Tình trạng sức khỏe & Cam kết
            </label>
            <input
              type="text"
              value={formData.healthStatus}
              onChange={(e) => setFormData({ ...formData, healthStatus: e.target.value })}
              placeholder="Ví dụ: Sức khỏe tốt, không uống rượu bia trong 24h qua"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
              Ghi chú thêm (Nếu có)
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ví dụ: Lần đầu đi hiến, cần hỗ trợ tư vấn nhóm máu"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition shadow-inner"
            />
          </div>

          {/* Nút Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-red-500/25 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Đang gửi phiếu hẹn tới bệnh viện...</span>
              </div>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                <span>XÁC NHẬN ĐẶT LỊCH HẸN NGAY</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
};

export default BookAppointmentPage;
