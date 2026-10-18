import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Ambulance,
  BarChart3,
  CalendarCheck,
  CircleUserRound,
  ClipboardCheck,
  Droplet,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { getRoleDefaultPath } from '../utils/roleNavigation';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Quản trị hệ thống',
  HOSPITAL_STAFF: 'Nhân viên y tế',
  DONOR: 'Người hiến máu',
};

const roleItems: Record<UserRole, SidebarItem[]> = {
  DONOR: [
    { label: 'Đặt lịch hiến máu', path: '/book-appointment', icon: CalendarCheck },
    { label: 'Lịch sử hiến máu', path: '/my-history', icon: Heart },
    { label: 'Hồ sơ cá nhân', path: '/profile', icon: CircleUserRound },
  ],
  HOSPITAL_STAFF: [
    { label: 'Tiếp nhận & duyệt lịch', path: '/staff/reception', icon: ClipboardCheck },
    { label: 'Phát lệnh cấp cứu', path: '/staff/emergency-request', icon: ShieldAlert },
    { label: 'Kho dự trữ máu', path: '/inventory', icon: Package },
    { label: 'Hồ sơ cá nhân', path: '/profile', icon: CircleUserRound },
  ],
  ADMIN: [
    { label: 'Tổng quan hệ thống', path: '/admin', icon: LayoutDashboard },
    { label: 'Duyệt lịch hiến máu', path: '/admin/appointments', icon: ClipboardCheck },
    { label: 'Yêu cầu cấp cứu', path: '/staff/emergency-request', icon: ShieldAlert },
    { label: 'Điều phối xe 115', path: '/admin/dispatch', icon: Ambulance },
    { label: 'Quản lý kho máu', path: '/admin/inventory', icon: Package },
    { label: 'Quản lý hiến máu', path: '/admin/forecast', icon: BarChart3 },
    { label: 'Quản lý tài khoản', path: '/admin/users', icon: Users },
    { label: 'Hồ sơ cá nhân', path: '/profile', icon: CircleUserRound },
  ],
};

export const RoleSidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const role = user.role;
  const items = roleItems[role];
  const isActive = (path: string) =>
    path === '/admin'
      ? location.pathname === path || location.pathname === '/admin/dashboard'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const sidebarContent = (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <Link to={role === 'DONOR' ? '/' : getRoleDefaultPath(role)} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-700 shadow-lg shadow-red-950/30">
            <Droplet className="h-6 w-6 fill-white text-white" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-black tracking-wide text-white">BLOODSMART</span>
            <span className="mt-1 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.13em] text-rose-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              {role === 'ADMIN' ? 'Điều phối hệ thống' : role === 'HOSPITAL_STAFF' ? 'Tiếp nhận hiến máu' : 'Cộng đồng hiến máu'}
            </span>
          </span>
        </Link>
      </div>

      <nav aria-label="Chức năng theo vai trò" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        <p className="px-3 pb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">
          Chức năng
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition ${
                active
                  ? 'bg-red-600 text-white shadow-lg shadow-red-950/25'
                  : 'text-slate-300 hover:bg-white/[0.08] hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-slate-400 group-hover:text-red-300'}`} />
              <span className="flex-1">{item.label}</span>
              {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/[0.07] p-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-black text-white ring-1 ring-white/10">
            {role === 'ADMIN' ? 'AD' : role === 'HOSPITAL_STAFF' ? 'BS' : (user.bloodType || 'DN')}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-extrabold text-white">
              {user.fullName || user.hoTen || user.email}
            </span>
            <span className="mt-1 block truncate text-[10px] font-semibold text-slate-400">
              {roleLabels[role]}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-screen w-64 shrink-0 flex-col overflow-hidden bg-slate-950 shadow-xl shadow-slate-900/10 lg:flex">
        {sidebarContent}
      </aside>

      <div className="mb-4 lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-slate-700 shadow-sm transition hover:border-red-200 hover:text-red-700"
          aria-expanded={isMobileOpen}
          aria-controls="role-sidebar-mobile"
        >
          <Menu className="h-4 w-4" />
          {roleLabels[role]}: chức năng
        </button>
      </div>

      {isMobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Đóng menu chức năng"
          />
          <aside
            id="role-sidebar-mobile"
            className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col overflow-hidden bg-slate-950 shadow-2xl animate-in slide-in-from-left duration-200"
          >
            <div className="absolute right-3 top-3 z-10">
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Đóng menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};
