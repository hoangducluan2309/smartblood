import React, { useState } from 'react';
import { 
  X, 
  QrCode, 
  UserCheck, 
  History, 
  PlusCircle, 
  CheckCircle2, 
  Award, 
  Calendar, 
  Building2,
  AlertTriangle 
} from 'lucide-react';
import { Button } from '../common/Button';
import { BloodTypeBadge } from '../common/BloodTypeBadge';
import { bloodService } from '../../services/bloodService';

/**
 * StaffQrScannerModal Component
 * Giả lập nghiệp vụ của Nhân viên Y tế / Bệnh viện:
 * 1. Quét mã QR xem người này đã hiến máu bao nhiêu lần
 * 2. Hiến xong nhập đơn vị máu (250/350/450ml) và cấp chứng nhận
 */
export const StaffQrScannerModal = ({ isOpen, onClose, onDonationRecorded }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [donorData, setDonorData] = useState(null);
  const [volumeMl, setVolumeMl] = useState(350);
  const [staffNote, setStaffNote] = useState('Sức khỏe tốt, huyết áp 120/80, hiến an toàn');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedResult, setSubmittedResult] = useState(null);

  if (!isOpen) return null;

  // Giả lập quét mã QR thành công
  const handleSimulateScan = async () => {
    setIsScanning(true);
    try {
      const res = await bloodService.scanDonorQr('QR-TOKEN-DEMO-88992');
      if (res.success) {
        setDonorData(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi quét QR:', err);
    } finally {
      setIsScanning(false);
    }
  };

  // Xác nhận nhập thông tin đơn vị máu
  const handleConfirmDonation = async (e) => {
    e.preventDefault();
    if (!donorData) return;
    setIsSubmitting(true);

    try {
      const payload = {
        donorId: donorData.id,
        bloodType: `${donorData.bloodType}${donorData.rh}`,
        volumeMl: Number(volumeMl),
        staffNote,
        date: new Date().toLocaleDateString('vi-VN'),
      };

      const res = await bloodService.submitDonationRecord(payload);
      if (res.success) {
        setSubmittedResult({
          ...res,
          newTotalDonations: donorData.totalDonations + 1,
          volumeMl,
        });

        if (onDonationRecorded) {
          onDonationRecorded(payload);
        }
      }
    } catch (err) {
      console.error('Lỗi lưu đơn vị máu:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    setDonorData(null);
    setSubmittedResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-brand-400" />
            <h3 className="font-bold text-lg">
              Cổng Quét QR & Nhập Đơn Vị Máu (Dành Cho Nhân Viên Y Tế)
            </h3>
          </div>
          <button
            onClick={handleResetModal}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thân Modal cuộn được */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TRƯỜNG HỢP 1: Đã nhập thông tin thành công */}
          {submittedResult ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-slate-900">
                  Nhập Dữ Liệu Thành Công!
                </h4>
                <p className="text-xs text-slate-500">
                  Hệ thống đã tự động cập nhật số lần hiến và kho dự trữ máu.
                </p>
              </div>

              {/* Thẻ chứng nhận điện tử */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 max-w-md mx-auto">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs text-slate-500">Mã chứng nhận hiến máu:</span>
                  <strong className="text-brand-600 font-mono text-sm">{submittedResult.certificateCode}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Người hiến:</span>
                  <strong className="text-slate-900">{donorData.fullName}</strong>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Tổng số lần đã hiến:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {submittedResult.newTotalDonations} lần
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Đơn vị máu tiếp nhận:</span>
                  <strong className="text-slate-900">{submittedResult.volumeMl} ml</strong>
                </div>
              </div>

              <Button variant="primary" fullWidth onClick={handleResetModal}>
                Hoàn tất & Tiếp tục ca tiếp theo
              </Button>
            </div>
          ) : !donorData ? (
            /* TRƯỜNG HỢP 2: Chưa quét -> Hiển thị khung quét QR */
            <div className="text-center space-y-4 py-6">
              <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto text-slate-400">
                <QrCode className="w-12 h-12 text-slate-600 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-800">
                  Sẵn sàng quét mã QR trên điện thoại người hiến
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Sử dụng camera hoặc bấm nút dưới đây để giả lập quét mã QR của tình nguyện viên đã đăng ký.
                </p>
              </div>

              <Button
                variant="primary"
                size="lg"
                isLoading={isScanning}
                leftIcon={<QrCode className="w-5 h-5" />}
                onClick={handleSimulateScan}
              >
                Mô Phỏng Quét QR Người Hiến
              </Button>
            </div>
          ) : (
            /* TRƯỜNG HỢP 3: Đã quét -> Hiển thị lịch sử hiến bao nhiêu lần & Form nhập đơn vị máu */
            <div className="space-y-5">
              {/* Thẻ thông tin người hiến */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base">
                        {donorData.fullName}
                      </h4>
                      <BloodTypeBadge
                        bloodType={`${donorData.bloodType}${donorData.rh}`}
                        isRare={donorData.isRare}
                        size="sm"
                      />
                    </div>
                    <p className="text-xs text-slate-500 pt-0.5">
                      CCCD: {donorData.citizenId} • SĐT: {donorData.phone}
                    </p>
                  </div>

                  {/* Số lần đã hiến máu */}
                  <div className="text-right">
                    <span className="text-[11px] text-slate-500 uppercase font-semibold block">Đã hiến</span>
                    <span className="text-xl font-black text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-lg inline-block">
                      {donorData.totalDonations} LẦN
                    </span>
                  </div>
                </div>

                {/* Kiểm tra điều kiện hôm nay */}
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>
                    <strong>Đủ điều kiện hiến:</strong> Lần hiến gần nhất ngày {donorData.lastDonationDate} (đã cách &gt;84 ngày).
                  </span>
                </div>

                {/* Lịch sử 3 lần hiến gần nhất */}
                <div className="pt-2 border-t border-slate-200/80">
                  <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1 mb-2">
                    <History className="w-3.5 h-3.5" />
                    Lịch sử các lần hiến trước
                  </span>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                    {donorData.history.map((his) => (
                      <div
                        key={his.id}
                        className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-100"
                      >
                        <span className="font-medium text-slate-700">{his.date} - {his.hospital}</span>
                        <span className="font-bold text-slate-900">{his.volumeMl} ml</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form nhập đơn vị máu sau khi hiến xong */}
              <form onSubmit={handleConfirmDonation} className="space-y-4 pt-1 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-brand-500" />
                  <h4 className="text-sm font-bold text-slate-900 uppercase">
                    Nhập Thông Tin Đợt Hiến Hôm Nay
                  </h4>
                </div>

                {/* Chọn thể tích máu */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                    Đơn vị máu tiếp nhận (Thể tích) *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[250, 350, 450].map((vol) => (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => setVolumeMl(vol)}
                        className={`py-2.5 px-3 rounded-xl text-center border font-bold text-sm transition-all ${
                          volumeMl === vol
                            ? 'bg-brand-500 text-white border-brand-500 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {vol} ml
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ghi chú nhân viên y tế */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Ghi chú lâm sàng của nhân viên y tế
                  </label>
                  <input
                    type="text"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Tình trạng sức khỏe, số đo huyết áp..."
                  />
                </div>

                {/* Nút lưu */}
                <div className="pt-2 flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setDonorData(null)}
                    className="w-1/3"
                  >
                    Quét Lại
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={isSubmitting}
                    className="w-2/3"
                  >
                    Xác Nhận & Cấp Giấy Chứng Nhận
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
