import React from 'react';
import { 
  Heart, 
  Phone, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock 
} from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-8 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Cột 1: Thông tin thương hiệu */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Smart<span className="text-brand-500">Blood</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Nền tảng công nghệ số điều phối máu nhân đạo, kết nối người hiến máu, bệnh viện và ngân hàng máu thời gian thực.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>Bảo mật dữ liệu định danh y tế theo tiêu chuẩn Bộ Y Tế.</span>
            </div>
          </div>

          {/* Cột 2: Hotline khẩn cấp & Điều phối */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Cấp cứu khẩn cấp 24/7
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="text-white block font-mono text-base">1900 6868</strong>
                  <span className="text-xs text-slate-400">Tổng đài điều phối máu toàn quốc</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">dieuphoi@smartblood.vn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">Hà Nội - Đà Nẵng - TP. Hồ Chí Minh</span>
              </li>
            </ul>
          </div>

          {/* Cột 3: Nghiệp vụ hệ thống */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Nghiệp vụ hệ thống
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Phát lệnh kêu gọi máu khẩn cấp
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Theo dõi kho dự trữ máu 8 nhóm
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Định danh mã QR & Cấp chứng nhận
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Tiêu chuẩn sức khỏe người hiến
                </span>
              </li>
            </ul>
          </div>

          {/* Cột 4: MẠNG LƯỚI TIẾP NHẬN & ĐIỀU PHỐI (Thay thế hoàn toàn thông tin dự án cũ) */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-400" />
              <span>Thời Gian Tiếp Nhận & Cấp Cứu</span>
            </h4>

            <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 text-xs space-y-2.5">
              <div className="space-y-1 pb-2 border-b border-slate-800/80">
                <div className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Điểm hiến máu cố định:</span>
                  <span className="text-emerald-400 font-bold">07:30 - 17:00</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Mở cửa tất cả các ngày trong tuần (T2 - CN)
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-slate-300 font-semibold flex items-center justify-between">
                  <span>Tiếp nhận máu cấp cứu:</span>
                  <span className="text-brand-400 font-bold">Trực 24/7</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Sẵn sàng điều phối các ca mổ khẩn & nhóm máu hiếm
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SmartBlood Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white cursor-pointer transition-colors">Chính sách bảo mật y tế</span>
            <span className="hover:text-white cursor-pointer transition-colors">Quy chế điều phối</span>
            <span className="hover:text-white cursor-pointer transition-colors">Tiêu chuẩn quốc gia</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
