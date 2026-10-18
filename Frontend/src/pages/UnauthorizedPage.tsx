import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-red-100 shadow-sm">
        <div className="w-20 h-20 bg-red-100 text-red-600 rounded-3xl flex items-center justify-center mx-auto">
          <ShieldX className="w-10 h-10" />
        </div>
        
        <div className="space-y-2">
          <span className="text-xs font-black uppercase text-red-700 tracking-wider bg-red-100 px-3 py-1 rounded-full">
            Lỗi 403 - Giới Hạn Quyền
          </span>
          <h1 className="text-2xl font-black text-slate-900">Không Có Quyền Truy Cập</h1>
          <p className="text-sm text-slate-500">
            Tài khoản hiện tại ({user?.email || 'Khách'} - Vai trò: <strong className="text-slate-700">{user?.role || 'Chưa đăng nhập'}</strong>) không có đặc quyền truy cập vào phân hệ này.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => window.history.back()}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại</span>
          </button>
          <Link
            to="/"
            className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-md shadow-red-200 transition flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
