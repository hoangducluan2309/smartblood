import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  AlertCircle, 
  MapPin, 
  BarChart2, 
  Droplet 
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';

export const BottomNav: React.FC = () => {
  const { urgentCount } = useEmergency();

  return (
    <nav 
      aria-label="Thanh điều hướng đáy điện thoại"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-2xl border-t border-slate-200/80 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] pb-safe"
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        
        {/* 1. Trang chủ */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => `
            flex flex-col items-center justify-center flex-1 h-full py-1 min-w-[56px] transition-all duration-200 active:scale-90
            ${isActive ? 'text-red-600 font-black scale-105' : 'text-slate-400 hover:text-slate-700 font-semibold'}
          `}
        >
          {({ isActive }) => (
            <>
              <Home className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1 tracking-tight">Trang chủ</span>
            </>
          )}
        </NavLink>

        {/* 2. Bản đồ cứu trợ */}
        <NavLink
          to="/map"
          className={({ isActive }) => `
            flex flex-col items-center justify-center flex-1 h-full py-1 min-w-[56px] transition-all duration-200 active:scale-90
            ${isActive ? 'text-red-600 font-black scale-105' : 'text-slate-400 hover:text-slate-700 font-semibold'}
          `}
        >
          {({ isActive }) => (
            <>
              <MapPin className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1 tracking-tight">Bản đồ</span>
            </>
          )}
        </NavLink>

        {/* 3. Hiến máu ngay (Envato Center Floating 3D Action Button) */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <NavLink
            to="/donate"
            aria-label="Đăng ký hiến máu ngay"
            className={({ isActive }) => `
              w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 
              flex items-center justify-center text-white shadow-xl shadow-red-500/40 
              border-4 border-white transition-all duration-300 transform active:scale-95 hover:scale-105
              ${isActive ? 'ring-2 ring-red-500 ring-offset-2 scale-105' : ''}
            `}
          >
            <Droplet className="w-7 h-7 fill-white text-white filter drop-shadow animate-pulse" />
          </NavLink>
        </div>

        {/* 4. Yêu cầu khẩn cấp (Emergency with badge) */}
        <NavLink
          to="/emergency"
          className={({ isActive }) => `
            relative flex flex-col items-center justify-center flex-1 h-full py-1 min-w-[56px] transition-all duration-150 active:scale-90
            ${isActive ? 'text-blood-primary font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'}
          `}
        >
          {({ isActive }) => (
            <>
              <div className="relative">
                <AlertCircle className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-blood-primary' : 'stroke-2'}`} />
                {urgentCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-blood-primary text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {urgentCount > 9 ? '9+' : urgentCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 tracking-tight">Khẩn cấp</span>
            </>
          )}
        </NavLink>

        {/* 5. Dự báo kho máu */}
        <NavLink
          to="/inventory"
          className={({ isActive }) => `
            flex flex-col items-center justify-center flex-1 h-full py-1 min-w-[56px] transition-all duration-150 active:scale-90
            ${isActive ? 'text-blood-primary font-bold' : 'text-slate-500 hover:text-slate-800 font-medium'}
          `}
        >
          {({ isActive }) => (
            <>
              <BarChart2 className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              <span className="text-[11px] mt-1 tracking-tight">Dự báo kho</span>
            </>
          )}
        </NavLink>

      </div>
    </nav>
  );
};
