import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 font-sans selection:bg-red-600 selection:text-white relative overflow-x-hidden">
      {/* Envato Dynamic Ambient Mesh Background Lights */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-red-400/10 rounded-full blur-3xl animate-mesh-glow"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-float-reverse"></div>
      </div>

      {/* Top Navigation Bar (Header) */}
      <Navbar />

      {/* 3. Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-8 pb-28 md:pb-16">
        <Outlet />
      </main>

      {/* 4. Desktop & Tablet Envato-Grade High-End Footer */}
      <footer className="hidden md:block bg-white/90 backdrop-blur-xl border-t border-slate-200/80 mt-auto pt-12 pb-8 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Col 1: Brand & Mission */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/20">
                  <span className="font-black text-sm">🩸</span>
                </div>
                <span className="font-black text-base tracking-tight text-slate-900">
                  BLOOD<span className="text-red-600">SMART</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Nền tảng số kết nối bệnh viện, ngân hàng máu và tình nguyện viên hiến máu bằng thuật toán dự báo AI thời gian thực.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Hệ thống trực tuyến 24/7/365</span>
              </div>
            </div>

            {/* Col 2: Truy Cập Nhanh */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">Dành Cho Tình Nguyện Viên</span>
              <ul className="space-y-1.5 text-slate-500 font-medium">
                <li><a href="/events" className="hover:text-red-600 transition">Điểm hiến máu lưu động</a></li>
                <li><a href="/donate" className="hover:text-red-600 transition">Đăng ký người hiến định kỳ</a></li>
                <li><a href="/inventory" className="hover:text-red-600 transition">Theo dõi nhu cầu các nhóm máu</a></li>
                <li><a href="/map" className="hover:text-red-600 transition">Bản đồ GIS ngân hàng máu</a></li>
              </ul>
            </div>

            {/* Col 3: Dành Cho Bệnh Viện */}
            <div className="space-y-2 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">Dành Cho Cơ Sở Y Tế</span>
              <ul className="space-y-1.5 text-slate-500 font-medium">
                <li><a href="/staff/emergency-request" className="hover:text-red-600 transition">Phát lệnh cấp cứu hỏa tốc</a></li>
                <li><a href="/staff/reception" className="hover:text-red-600 transition">Tiếp nhận & xét nghiệm máu</a></li>
                <li><a href="/admin/dispatch" className="hover:text-red-600 transition">Điều phối xe cấp cứu 115</a></li>
                <li><a href="/admin/forecast" className="hover:text-red-600 transition">Dự báo nhu cầu FEFO bằng AI</a></li>
              </ul>
            </div>

            {/* Col 4: Hỗ Trợ Khẩn Cấp */}
            <div className="space-y-2.5 text-xs">
              <span className="font-extrabold uppercase tracking-wider text-slate-900 text-[11px]">Đường Dây Nóng Khẩn Cấp</span>
              <div className="p-3 bg-red-50/80 rounded-2xl border border-red-200/80 space-y-1">
                <span className="text-[10px] uppercase font-bold text-red-600 block">Tổng Đài Cấp Cứu Máu Quốc Gia</span>
                <span className="text-base font-black text-red-700 block">1900 6868 &bull; (028) 3855 4137</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tuân thủ quy chuẩn an toàn truyền máu của Bộ Y Tế và bảo mật hồ sơ người hiến theo Luật Dữ liệu Y tế.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-medium">
            <div>
              &copy; 2026 BloodSmart Platform &bull; Bản quyền thuộc Dự án Điều phối Máu Quốc gia.
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <span className="hover:text-slate-700 cursor-pointer">Chính sách bảo mật</span>
              <span>&bull;</span>
              <span className="hover:text-slate-700 cursor-pointer">Quy trình cấp cứu</span>
              <span>&bull;</span>
            </div>
          </div>
        </div>
      </footer>

      {/* 5. Mobile Fixed Bottom Navigation (< 768px) */}
      <BottomNav />
    </div>
  );
};
