import React from 'react';
import { UserCheck, QrCode, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';

/**
 * DonationProcessSection Component
 * Quy trình 3 bước chuẩn hóa theo yêu cầu đề tài
 */
export const DonationProcessSection = ({ onRegisterClick }) => {
  const steps = [
    {
      step: '01',
      title: 'Đăng Ký & Khai Báo Sức Khỏe',
      description: 'Đăng ký thông tin trực tuyến qua website hoặc ứng dụng di động, chọn điểm hiến máu và khung giờ phù hợp.',
      icon: UserCheck,
      details: [
        'Điền thông tin CCCD và tiền sử sức khỏe',
        'Lựa chọn đợt hiến máu gần bạn nhất',
        'Hệ thống tự động cấp Mã QR Định Danh Cá Nhân',
      ],
      color: 'bg-brand-50 text-brand-600 border-brand-200',
      badgeBg: 'bg-brand-500 text-white',
    },
    {
      step: '02',
      title: 'Quét Mã QR & Khám Sàng Lọc',
      description: 'Khi đến điểm tiếp nhận, đưa mã QR trên màn hình điện thoại để nhân viên y tế quét kiểm tra tức thì.',
      icon: QrCode,
      details: [
        'Tra cứu tự động số lần đã hiến máu trước đây',
        'Kiểm tra khoảng cách thời gian (≥ 84 ngày)',
        'Đo huyết áp, xét nghiệm nhanh huyết sắc tố',
      ],
      color: 'bg-blue-50 text-blue-600 border-blue-200',
      badgeBg: 'bg-blue-600 text-white',
    },
    {
      step: '03',
      title: 'Hiến Máu & Nhận Chứng Nhận Điện Tử',
      description: 'Tiến hành hiến máu an toàn. Nhân viên y tế nhập đơn vị máu đã hiến và cập nhật kho dự trữ.',
      icon: Award,
      details: [
        'Hiến 250ml, 350ml hoặc 450ml an toàn tuyệt đối',
        'Nhân viên nhập số lượng túi máu vào hệ thống',
        'Nhận Giấy chứng nhận điện tử có giá trị bồi hoàn',
      ],
      color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      badgeBg: 'bg-emerald-600 text-white',
    },
  ];

  return (
    <section id="process" className="py-16 sm:py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
            Đơn giản • Nhanh chóng • Minh bạch
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
            Quy Trình Hiến Máu 3 Bước Chuẩn Hóa
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Áp dụng chuyển đổi số toàn diện: Không thủ tục giấy tờ rườm rà, quét mã QR định danh y tế 
            và ghi nhận số lần hiến máu tự động trên toàn hệ thống.
          </p>
        </div>

        {/* 3 Bước */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;

            return (
              <div key={item.step} className="relative flex flex-col">
                <Card className="h-full border border-slate-200/80 p-6 flex flex-col justify-between">
                  <div>
                    {/* Top: Step number & Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${item.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-xs font-black px-2.5 py-1 rounded-full ${item.badgeBg}`}>
                        BƯỚC {item.step}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Checklist */}
                    <ul className="space-y-2 pt-2 border-t border-slate-100">
                      {item.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>

                {/* Arrow connector between steps on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-white border border-slate-300 items-center justify-center shadow-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Callout */}
        <div className="mt-12 text-center">
          <button
            onClick={onRegisterClick}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-5 py-2.5 rounded-xl border border-brand-200 transition-colors"
          >
            <span>Bắt đầu Bước 1 ngay bây giờ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
