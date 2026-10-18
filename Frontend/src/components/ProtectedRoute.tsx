import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { Droplet, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Đang nạp phiên đăng nhập từ LocalStorage & API profile khi F5
  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-red-100 border-t-blood-primary animate-spin" />
          <Droplet className="w-6 h-6 text-blood-primary fill-blood-primary animate-pulse" />
        </div>
        <p className="text-sm font-semibold text-slate-500 animate-pulse">
          Đang xác thực bảo mật tài khoản...
        </p>
      </div>
    );
  }

  // 2. Chưa đăng nhập -> Chuyển hướng về Trang chủ nếu vừa bấm Đăng xuất, ngược lại về /login kèm vị trí trang trước đó
  if (!isAuthenticated || !user) {
    const loggedOutAt = typeof window !== 'undefined' ? Number(sessionStorage.getItem('bloodsmart_just_logged_out') || 0) : 0;
    const isRecentlyLoggedOut = loggedOutAt > 0 && Date.now() - loggedOutAt < 10000;
    if (isRecentlyLoggedOut) {
      return <Navigate to="/" replace />;
    }
    const authPath = location.pathname === '/book-appointment' ? '/register' : '/login';
    return <Navigate to={authPath} state={{ from: location }} replace />;
  }

  // 3. Phân quyền theo Role (DONOR, HOSPITAL_STAFF, ADMIN)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-red-100 text-blood-primary rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Từ Chối Truy Cập</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Tài khoản của bạn với vai trò <span className="font-bold text-blood-primary">[{user.role}]</span> không có quyền truy cập khu vực này.
        </p>
        <div className="pt-2">
          <a
            href="/"
            className="inline-block px-6 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-bold rounded-xl text-sm transition-all"
          >
            Trở về Trang chủ
          </a>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
