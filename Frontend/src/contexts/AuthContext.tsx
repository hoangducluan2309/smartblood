import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosClient } from '../api/axiosClient';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../types';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (data: RegisterData) => Promise<AuthResponse>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục phiên đăng nhập khi F5 từ Token
  const fetchUserProfile = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await axiosClient.get<any>('/auth/profile');
      const rawUser = response.data?.data?.user || response.data?.user || response.data?.data || response.data;
      let calculatedBloodType = rawUser?.bloodType;
      if (!calculatedBloodType && rawUser?.nhomMau) {
        if (rawUser.nhomMau.includes('+') || rawUser.nhomMau.includes('-')) {
          calculatedBloodType = rawUser.nhomMau;
        } else {
          const rh = rawUser.yeuToRh || '';
          const sign = rh.includes('-') || rh.toLowerCase().includes('am') ? '-' : '+';
          calculatedBloodType = `${rawUser.nhomMau}${sign}`;
        }
      }

      const normalizedUser: User = {
        ...rawUser,
        role: rawUser?.vaiTro || rawUser?.role || 'DONOR',
        fullName: rawUser?.hoTen || rawUser?.fullName || rawUser?.email,
        hoTen: rawUser?.hoTen || rawUser?.fullName,
        phone: rawUser?.soDienThoai || rawUser?.phone || '',
        soDienThoai: rawUser?.soDienThoai || rawUser?.phone,
        bloodType: calculatedBloodType,
      };
      try {
        localStorage.setItem('user', JSON.stringify(normalizedUser));
      } catch {
        // Bỏ qua lỗi quota
      }
      setUser(normalizedUser);
      setToken(savedToken);
    } catch (error) {
      console.error('Không thể khôi phục phiên đăng nhập:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  // Hàm đăng nhập
  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await axiosClient.post<any>('/auth/login', credentials);
      const resData = response.data;
      
      const receivedToken: string = 
        resData.token || 
        resData.accessToken || 
        resData.data?.accessToken || 
        resData.data?.token;

      const rawUser = resData.user || resData.data?.user || resData.data;
      let calculatedBloodType = rawUser?.bloodType;
      if (!calculatedBloodType && rawUser?.nhomMau) {
        if (rawUser.nhomMau.includes('+') || rawUser.nhomMau.includes('-')) {
          calculatedBloodType = rawUser.nhomMau;
        } else {
          const rh = rawUser.yeuToRh || '';
          const sign = rh.includes('-') || rh.toLowerCase().includes('am') ? '-' : '+';
          calculatedBloodType = `${rawUser.nhomMau}${sign}`;
        }
      }

      const receivedUser: User = {
        ...rawUser,
        role: rawUser?.vaiTro || rawUser?.role || 'DONOR',
        fullName: rawUser?.hoTen || rawUser?.fullName || rawUser?.email,
        hoTen: rawUser?.hoTen || rawUser?.fullName,
        phone: rawUser?.soDienThoai || rawUser?.phone || '',
        soDienThoai: rawUser?.soDienThoai || rawUser?.phone,
        bloodType: calculatedBloodType,
      };

      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
      }
      
      if (receivedUser) {
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setUser(receivedUser);
      }

      toast.success(`Chào mừng trở lại, ${receivedUser.fullName || 'bạn'}!`);
      return { token: receivedToken, user: receivedUser };
    } catch (error: any) {
      let errorMsg = error.response?.data?.message;
      if (!errorMsg) {
        if (error.code === 'ERR_NETWORK' || !error.response) {
          errorMsg = 'Không thể kết nối đến máy chủ Backend (Port 5000). Vui lòng kiểm tra lại dịch vụ Backend!';
        } else {
          errorMsg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
        }
      }
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng ký
  const register = async (data: RegisterData): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const response = await axiosClient.post<any>('/auth/register', data);
      const resData = response.data;

      const receivedToken: string = 
        resData.token || 
        resData.accessToken || 
        resData.data?.accessToken || 
        resData.data?.token;

      const rawUser = resData.user || resData.data?.user || resData.data;
      const receivedUser: User = {
        ...rawUser,
        role: rawUser?.vaiTro || rawUser?.role || 'DONOR',
        fullName: rawUser?.hoTen || rawUser?.fullName || rawUser?.email,
        hoTen: rawUser?.hoTen || rawUser?.fullName,
        phone: rawUser?.soDienThoai || rawUser?.phone || '',
        soDienThoai: rawUser?.soDienThoai || rawUser?.phone,
      };

      if (receivedToken) {
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
      }
      if (receivedUser) {
        localStorage.setItem('user', JSON.stringify(receivedUser));
        setUser(receivedUser);
      }

      toast.success('Đăng ký tài khoản thành công!');
      return { token: receivedToken, user: receivedUser };
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Đăng ký không thành công. Vui lòng thử lại!';
      toast.error(errorMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm đăng xuất
  const logout = () => {
    try {
      sessionStorage.setItem('bloodsmart_just_logged_out', Date.now().toString());
    } catch {
      // Bỏ qua lỗi sessionStorage nếu bị chặn
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('smartblood_token');
    localStorage.removeItem('smartblood_user');
    setUser(null);
    setToken(null);
    toast.success('Đã đăng xuất tài khoản an toàn.');
    navigate('/', { replace: true });

    // Fallback bảo đảm trình duyệt chắc chắn chuyển về Trang Chủ
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      setTimeout(() => {
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/#')) {
          window.location.href = '/';
        }
      }, 150);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        refreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
