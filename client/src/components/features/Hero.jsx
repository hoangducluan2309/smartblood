import React from 'react';
import { Heart, AlertCircle, ShieldCheck, QrCode, Navigation, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

/**
 * Hero Component
 * 2 nút CTA chuẩn: "Đăng ký hiến máu ngay" & "Yêu cầu máu khẩn cấp"
 */
export const Hero = ({ onRegisterClick, onRequestClick }) => {
  return (
    <section id="hero" className="relative pt-8 pb-16 md:pt-16 md:pb-24 overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-surface-light">
      {/* Decorative blurred background shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-300 filter blur-3xl opacity-30" />
        <div className="absolute top-10 -right-20 w-96 h-96 rounded-full bg-rose-200 filter blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Cột trái: Tiêu đề, thông điệp & 2 CTA */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tag nhỏ trên cùng */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-100/70 border border-brand-200 text-brand-700 text-xs sm:text-sm font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Hệ thống Điều Phối Hiến Máu 4.0 & Báo Động Khẩn</span>
            </div>

            {/* Tiêu đề chính */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Một Giọt Máu Cho Đi, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-red-600 to-rose-600">
                Một Cuộc Đời Ở Lại
              </span>
            </h1>

            {/* Đoạn mô tả */}
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Kết nối trực tiếp người hiến máu tình nguyện với các bệnh viện và ngân hàng máu. 
              Ứng dụng công nghệ quét mã QR định danh, định vị GPS bán kính gần nhất và cảnh báo tức thì 
              khi thiếu hụt các <strong>nhóm máu hiếm (Rh-)</strong> trong các ca cấp cứu sinh tử.
            </p>

            {/* 2 NÚT CTA CHUẨN THEO YÊU CẦU */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
              {/* CTA 1: Đăng ký hiến máu ngay */}
              <Button
                size="lg"
                variant="primary"
                leftIcon={<Heart className="w-5 h-5 fill-white" />}
                onClick={onRegisterClick}
                className="w-full sm:w-auto shadow-md hover:shadow-glow text-base px-7"
              >
                Đăng ký hiến máu ngay
              </Button>

              {/* CTA 2: Yêu cầu máu khẩn cấp */}
              <Button
                size="lg"
                variant="outline"
                leftIcon={<AlertCircle className="w-5 h-5" />}
                onClick={onRequestClick}
                className="w-full sm:w-auto text-base px-7 bg-white/80 hover:bg-brand-50/50"
              >
                Yêu cầu máu khẩn cấp
              </Button>
            </div>

            {/* 3 tính năng nhanh minh họa độ tin cậy */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/80 max-w-lg mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Mã QR y tế</h4>
                  <p className="text-[11px] text-slate-500">Tra cứu tức thì</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 flex-shrink-0">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">GPS Realtime</h4>
                  <p className="text-[11px] text-slate-500">Điều phối gần nhất</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 flex-shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Bảo mật y khoa</h4>
                  <p className="text-[11px] text-slate-500">Chuẩn Bộ Y Tế</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Card đồ họa trực quan tương tác (Card cấp cứu mô phỏng + Thẻ QR định danh) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              {/* Thẻ chính: Bảng điều phối khẩn cấp trực quan */}
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-5 space-y-4 relative z-10">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Cảnh báo điều phối khẩn cấp
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                    Thời gian thực
                  </span>
                </div>

                {/* Thông tin ca mô phỏng */}
                <div className="p-3.5 bg-red-50/60 rounded-xl border border-red-100 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-600">Bệnh viện Chợ Rẫy TP.HCM</span>
                    <span className="text-xs font-bold px-2 py-0.5 bg-red-600 text-white rounded-md">
                      AB- (Rh âm)
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium line-clamp-1">
                    Ca mổ tim cấp cứu cần 2 đơn vị máu nhóm hiếm
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Đã tìm thấy 3 tình nguyện viên cách 3.2km</span>
                    <span className="text-brand-600 font-semibold">18 phút phản hồi</span>
                  </div>
                </div>

                {/* Thẻ QR Code Demo cho nhân viên quét */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Thẻ hiến máu điện tử</span>
                    <h4 className="text-sm font-bold text-slate-900">Nguyễn Văn An (O-)</h4>
                    <p className="text-xs text-emerald-600 font-medium">Đã hiến 6 lần • Đủ điều kiện</p>
                  </div>
                  <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-xs flex items-center justify-center">
                    {/* SVG biểu tượng QR Code chân thực */}
                    <svg viewBox="0 0 24 24" className="w-full h-full text-slate-800" fill="currentColor">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm-2 10h8v8H2v-8zm2 2v4h4v-4H4zm10-14h8v8h-8V2zm2 2v4h4V4h-4zm0 10h2v2h-2v-2zm4 0h2v4h-2v-4zm-4 4h2v2h-2v-2zm4 2h2v2h-2v-2zm-2-2h2v2h-2v-2z" />
                    </svg>
                  </div>
                </div>

                {/* Thông báo tiến độ */}
                <div className="pt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Trạng thái máy chủ: <strong className="text-emerald-600">Đang hoạt động</strong></span>
                  <span>Đồng bộ SQL Server & Redis</span>
                </div>
              </div>

              {/* Thẻ trôi nổi bổ trợ */}
              <div className="absolute -bottom-5 -left-4 bg-white p-3 rounded-xl shadow-lg border border-slate-200 hidden sm:flex items-center gap-3 z-20 animate-bounce">
                <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-800">+1 Đơn vị vừa hiến</div>
                  <div className="text-[10px] text-slate-500">Viện Huyết học TW • 2 phút trước</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
