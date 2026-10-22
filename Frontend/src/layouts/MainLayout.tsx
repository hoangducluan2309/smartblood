import { Link, Outlet } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { RoleSidebar } from '../components/RoleSidebar';
import { useAuth } from '../contexts/AuthContext';
import { useCallModal } from '../contexts/CallModalContext';

export const MainLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { openCallModal } = useCallModal();

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
      {isAuthenticated && user ? (
        <div className="flex min-w-0 flex-1 flex-col px-4 py-5 sm:px-6 lg:ml-64 lg:px-8 lg:py-8">
          <RoleSidebar />
          <main className="min-w-0 flex-1 pb-8 md:pb-16">
            <Outlet />
          </main>
        </div>
      ) : (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-4 pb-8 sm:px-6 md:py-6 md:pb-8 lg:px-8">
          <Outlet />
        </main>
      )}

      {/* 4. Desktop & Tablet Envato-Grade High-End Dark Footer */}
      {!isAuthenticated && (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800/90 mt-auto pt-14 pb-24 md:pb-10 shadow-2xl relative overflow-hidden">
          {/* Subtle ambient red/glow lights in footer background */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 left-10 w-72 h-72 bg-rose-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
              {/* Col 1: Brand & Mission */}
              <div className="space-y-3.5">
                <Link to="/" className="inline-flex items-center gap-2.5 group">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
                    <span className="font-black text-base">🩸</span>
                  </div>
                  <span className="font-black text-lg tracking-tight text-white group-hover:text-rose-200 transition-colors">
                    SMART<span className="text-red-500">BLOOD</span>
                  </span>
                </Link>
                <p className="text-xs text-slate-400 leading-relaxed font-normal">
                  Nền tảng số kết nối bệnh viện, ngân hàng máu và tình nguyện viên hiến máu bằng thuật toán dự báo AI thời gian thực.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-[11px] font-bold text-emerald-300 shadow-inner">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Hệ thống trực tuyến 24/7</span>
                </div>
              </div>

              {/* Col 2: Truy Cập Nhanh */}
              <div className="space-y-3 text-xs">
                <span className="font-black uppercase tracking-wider text-white text-[11px] block">
                  Dành Cho Tình Nguyện Viên
                </span>
                <ul className="space-y-2 text-slate-400 font-medium">
                  <li>
                    <a href="/events" className="hover:text-white transition-colors flex items-center gap-1.5">
                      <span className="text-red-500">&bull;</span> Điểm hiến máu lưu động
                    </a>
                  </li>
                  <li>
                    <a href="/donate" className="hover:text-white transition-colors flex items-center gap-1.5">
                      <span className="text-red-500">&bull;</span> Đăng ký người hiến định kỳ
                    </a>
                  </li>
                  <li>
                    <a href="/map" className="hover:text-white transition-colors flex items-center gap-1.5">
                      <span className="text-red-500">&bull;</span> Bản đồ GIS ngân hàng máu
                    </a>
                  </li>
                  <li>
                    <a href="/eligibility" className="hover:text-white transition-colors flex items-center gap-1.5">
                      <span className="text-red-500">&bull;</span> Tiêu chuẩn & Câu hỏi thường gặp
                    </a>
                  </li>
                </ul>
              </div>

              {/* Col 3: Dành Cho Bệnh Viện */}
              <div className="space-y-3 text-xs">
                <span className="font-black uppercase tracking-wider text-white text-[11px] block">
                  Dành Cho Cơ Sở Y Tế
                </span>
                <p className="text-slate-400 font-normal leading-relaxed text-xs">
                  Bác sĩ và chuyên viên điều phối có thể truy cập hệ thống quản trị kho máu FEFO, tiếp nhận yêu cầu và điều xe cứu thương 115 sau khi đăng nhập.
                </p>
                <div className="pt-1">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    <span>Cổng đăng nhập nội bộ</span> &rarr;
                  </a>
                </div>
              </div>

              {/* Col 4: Hỗ Trợ Khẩn Cấp */}
              <div className="space-y-3 text-xs">
                <span className="font-black uppercase tracking-wider text-white text-[11px] block">
                  Đường Dây Nóng Khẩn Cấp
                </span>
                <button
                  type="button"
                  onClick={() => openCallModal({
                    title: 'Tổng đài cấp cứu máu',
                    name: 'Tổng đài cấp cứu máu quốc gia (24/7)',
                    phone: '1900 6868',
                  })}
                  className="w-full text-left p-3.5 bg-red-950/40 hover:bg-red-900/50 rounded-2xl border border-red-800/80 space-y-1.5 backdrop-blur-sm shadow-inner group transition-all cursor-pointer active:scale-98"
                  title="Bấm để gọi Tổng đài cấp cứu 1900 6868"
                >
                  <span className="text-[10px] uppercase font-bold text-red-400 block tracking-wider group-hover:text-red-300">
                    Tổng Đài Cấp Cứu Máu Quốc Gia
                  </span>
                  <span className="text-xl font-black text-white group-hover:text-rose-200 transition-colors tracking-tight block">
                    1900 6868
                  </span>
                </button>
                <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                  Tuân thủ quy chuẩn an toàn truyền máu của Bộ Y Tế và bảo mật hồ sơ người hiến theo Luật Dữ liệu Y tế.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
              <div>
                &copy; 2026 SmartBlood Platform &bull; Bản quyền thuộc Dự án Điều phối Máu Quốc gia.
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                <span className="hover:text-slate-300 cursor-pointer transition-colors">Chính sách bảo mật</span>
                <span>&bull;</span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors">Quy trình cấp cứu</span>
                <span>&bull;</span>
                <span className="hover:text-slate-300 cursor-pointer transition-colors">Điều khoản dịch vụ</span>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* 5. Mobile Fixed Bottom Navigation (< 768px) */}
      {!isAuthenticated && <BottomNav />}
    </div>
  );
};
