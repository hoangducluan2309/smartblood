import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authApi, type RegisterDonorPayload } from '../services/api.js';

export type UserRole = 'DONOR' | 'HOSPITAL' | 'ADMIN';

export interface AuthUser {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai: string;
  role: UserRole;
  vaiTro?: string;
  nhomMau?: string | null;
  yeuToRh?: string | null;
  diaChi?: string | null;
  cccd?: string | null;
  trangThai?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, matKhau: string) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  register: (donorData: RegisterDonorPayload) => Promise<{ success: boolean; message?: string; user?: AuthUser }>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Chuẩn hóa vai trò từ backend (HOSPITAL_STAFF -> HOSPITAL)
function normalizeRole(backendRole?: string): UserRole {
  if (backendRole === 'ADMIN') return 'ADMIN';
  if (backendRole === 'HOSPITAL_STAFF' || backendRole === 'HOSPITAL') return 'HOSPITAL';
  return 'DONOR';
}

function formatUserData(rawUser: any): AuthUser {
  return {
    id: rawUser.id,
    hoTen: rawUser.hoTen,
    email: rawUser.email,
    soDienThoai: rawUser.soDienThoai,
    role: normalizeRole(rawUser.vaiTro || rawUser.role),
    vaiTro: rawUser.vaiTro || rawUser.role,
    nhomMau: rawUser.nhomMau || null,
    yeuToRh: rawUser.yeuToRh || null,
    diaChi: rawUser.diaChi || null,
    cccd: rawUser.cccd || null,
    trangThai: rawUser.trangThai || 'HoatDong',
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('smartblood_token') || localStorage.getItem('token');
    }
    return null;
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof localStorage !== 'undefined') {
      const savedUser = localStorage.getItem('smartblood_user');
      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch {
          return null;
        }
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Đăng xuất: Xóa sạch dữ liệu trong Storage và Reset State
  const logout = useCallback(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('smartblood_token');
      localStorage.removeItem('token');
      localStorage.removeItem('smartblood_user');
    }
    setToken(null);
    setUser(null);
  }, []);

  // Lấy lại thông tin hồ sơ người dùng mới nhất từ server
  const refreshProfile = useCallback(async () => {
    if (typeof localStorage === 'undefined') return;

    const activeToken = localStorage.getItem('smartblood_token') || localStorage.getItem('token');
    if (!activeToken) {
      setUser(null);
      return;
    }

    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        const formatted = formatUserData(res.data);
        setUser(formatted);
        localStorage.setItem('smartblood_user', JSON.stringify(formatted));
      }
    } catch (err: any) {
      if (err?.response?.status === 401) {
        logout();
      }
    }
  }, [logout]);

  // Khởi tạo: kiểm tra token khi tải lại trang
  useEffect(() => {
    const initAuth = async () => {
      if (typeof localStorage !== 'undefined') {
        const activeToken = localStorage.getItem('smartblood_token') || localStorage.getItem('token');
        if (activeToken) {
          try {
            await refreshProfile();
          } catch {
            // Giữ lại state cache tạm thời nếu gặp lỗi mạng
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();

    // Lắng nghe sự kiện 401 từ interceptor
    const handleUnauthorized = () => {
      logout();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:unauthorized', handleUnauthorized);
      return () => {
        window.removeEventListener('auth:unauthorized', handleUnauthorized);
      };
    }
  }, [refreshProfile, logout]);

  // Đăng nhập
  const login = async (email: string, matKhau: string) => {
    try {
      const res = await authApi.login({ email, matKhau });
      if (res.success && res.data) {
        const { accessToken, user: rawUser } = res.data;
        const formattedUser = formatUserData(rawUser);

        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('smartblood_token', accessToken);
          localStorage.setItem('token', accessToken);
          localStorage.setItem('smartblood_user', JSON.stringify(formattedUser));
        }

        setToken(accessToken);
        setUser(formattedUser);

        return {
          success: true,
          message: res.message || 'Đăng nhập thành công',
          user: formattedUser,
        };
      }
      return {
        success: false,
        message: res.message || 'Đăng nhập không thành công',
      };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? 'Email hoặc mật khẩu không chính xác.'
          : 'Đăng nhập thất bại. Vui lòng kiểm tra lại kết nối máy chủ.');
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Đăng ký người hiến máu
  const register = async (donorData: RegisterDonorPayload) => {
    try {
      const payload: RegisterDonorPayload = {
        ...donorData,
        vaiTro: donorData.vaiTro || 'DONOR',
      };

      const res = await authApi.register(payload);
      if (res.success && res.data) {
        // Sau khi đăng ký thành công, tự động đăng nhập luôn để lấy JWT token
        const loginRes = await login(donorData.email, donorData.matKhau);
        if (loginRes.success) {
          return {
            success: true,
            message: 'Đăng ký tài khoản và tự động đăng nhập thành công!',
            user: loginRes.user,
          };
        }

        return {
          success: true,
          message: res.message || 'Đăng ký tài khoản thành công. Vui lòng đăng nhập.',
        };
      }

      return {
        success: false,
        message: res.message || 'Đăng ký không thành công',
      };
    } catch (error: any) {
      let errorMessage = error.response?.data?.message;

      if (!errorMessage) {
        if (error.response?.status === 409) {
          errorMessage = 'Email, Số điện thoại hoặc CCCD này đã tồn tại trong hệ thống.';
        } else if (error.response?.status === 400) {
          errorMessage = 'Dữ liệu đăng ký không hợp lệ. Vui lòng kiểm tra lại các trường bắt buộc.';
        } else {
          errorMessage = 'Đăng ký thất bại. Vui lòng thử lại sau.';
        }
      }

      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth() phải được sử dụng bên trong <AuthProvider>');
  }
  return context;
};

export default AuthContext;
