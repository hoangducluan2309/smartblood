import React, { useState } from 'react';
import { X, Heart, QrCode, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { bloodService } from '../../services/bloodService';

/**
 * QuickRegisterModal Component
 * Form đăng ký hiến máu trực tuyến và cấp mã QR cá nhân
 */
export const QuickRegisterModal = ({
  isOpen,
  onClose,
  defaultBloodType = 'O+',
  urgentRequest = null,
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    citizenId: '',
    bloodType: defaultBloodType,
    weightKg: 55,
    preferredLocation: 'Viện Huyết học - Truyền máu TW',
    isReadyAlert: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await bloodService.registerDonation(formData);
      if (res.success) {
        setRegisteredData({
          ...res,
          ...formData,
        });
      }
    } catch (error) {
      console.error('Lỗi khi đăng ký:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setRegisteredData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-brand-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-white" />
            <h3 className="font-bold text-lg">
              {urgentRequest ? `Đăng Ký Hỗ Trợ Ca ${urgentRequest.bloodType}` : 'Đăng Ký Hiến Máu Tình Nguyện'}
            </h3>
          </div>
          <button
            onClick={handleReset}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nội dung: Hoặc Form đăng ký, Hoặc Màn hình thành công cấp Mã QR */}
        <div className="p-6">
          {registeredData ? (
            /* Màn hình sau khi đăng ký thành công: Cấp Mã QR */
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold text-slate-900">Đăng Ký Thành Công!</h4>
                <p className="text-xs text-slate-500">
                  Cảm ơn tấm lòng vàng của <strong>{registeredData.fullName}</strong>.
                </p>
              </div>

              {/* Thẻ hiển thị mã QR */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 max-w-xs mx-auto space-y-3">
                <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-300 shadow-xs mx-auto flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-full h-full text-slate-900" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm0 10h2v2h-2v-2zm4 0h2v4h-2v-4zm-4 4h2v2h-2v-2zm4 2h2v2h-2v-2zm-2-2h2v2h-2v-2z" />
                  </svg>
                </div>

                <div className="text-xs font-mono font-bold text-slate-700">
                  Mã thẻ: {registeredData.qrToken}
                </div>
                <div className="text-[11px] text-slate-500">
                  Nhóm máu: <strong className="text-brand-600">{registeredData.bloodType}</strong> • {registeredData.phone}
                </div>
              </div>

              <p className="text-xs text-slate-600 bg-amber-50 p-3 rounded-lg border border-amber-200 text-left">
                💡 <strong>Lưu ý:</strong> Vui lòng chụp màn hình hoặc lưu mã QR này. Khi đến điểm hiến máu, đưa mã QR cho nhân viên y tế quét để xác nhận tức thì.
              </p>

              <Button fullWidth variant="primary" onClick={handleReset}>
                Đã Lưu Mã QR & Đóng
              </Button>
            </div>
          ) : (
            /* Form nhập liệu */
            <form onSubmit={handleSubmit} className="space-y-4">
              {urgentRequest && (
                <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700">
                  Tiếp nhận ca khẩn cấp tại: <strong>{urgentRequest.hospitalName}</strong>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Họ và tên người hiến *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0912..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Số CCCD / Định danh *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0012..."
                    value={formData.citizenId}
                    onChange={(e) => setFormData({ ...formData, citizenId: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Nhóm máu
                  </label>
                  <select
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  >
                    <option value="O+">O+ (Phổ biến)</option>
                    <option value="O-">O- (Nhóm hiếm Rh-)</option>
                    <option value="A+">A+</option>
                    <option value="A-">A- (Nhóm hiếm Rh-)</option>
                    <option value="B+">B+</option>
                    <option value="B-">B- (Nhóm hiếm Rh-)</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB- (Cực hiếm)</option>
                    <option value="CHUA_RO">Chưa rõ nhóm máu</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Cân nặng (kg) *
                  </label>
                  <input
                    type="number"
                    min="42"
                    max="120"
                    required
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: Number(e.target.value) })}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Điểm hiến máu dự kiến
                </label>
                <select
                  value={formData.preferredLocation}
                  onChange={(e) => setFormData({ ...formData, preferredLocation: e.target.value })}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                >
                  <option value="Viện Huyết học - Truyền máu TW">Viện Huyết học - Truyền máu TW (Hà Nội)</option>
                  <option value="Bệnh viện Chợ Rẫy TP.HCM">Bệnh viện Chợ Rẫy (TP. Hồ Chí Minh)</option>
                  <option value="Bệnh viện Bạch Mai">Bệnh viện Bạch Mai (Hà Nội)</option>
                  <option value="Bệnh viện Đa khoa Đà Nẵng">Bệnh viện Đa khoa Đà Nẵng</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="readyAlert"
                  checked={formData.isReadyAlert}
                  onChange={(e) => setFormData({ ...formData, isReadyAlert: e.target.checked })}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                />
                <label htmlFor="readyAlert" className="text-xs text-slate-700 cursor-pointer">
                  Bật nhận cảnh báo khẩn cấp khi bệnh viện gần tôi cần máu hiếm
                </label>
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                  leftIcon={<QrCode className="w-4 h-4" />}
                >
                  Đăng Ký & Nhận Mã QR Y Tế
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
