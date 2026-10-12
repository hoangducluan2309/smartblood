import axios, {
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
  AxiosError,
} from 'axios';

/**
 * 1. Cấu hình Axios instance giao tiếp Backend SmartBlood
 * Tương thích cả Vite (import.meta.env) và Node/Next/Webpack (process.env)
 * Base URL mặc định: http://localhost:5000/api
 */
const getBaseUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) {
      return (import.meta as any).env.VITE_API_BASE_URL;
    }
  } catch {}

  try {
    if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
      return process.env.VITE_API_BASE_URL;
    }
  } catch {}

  return 'http://localhost:5000/api';
};

export const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 2. Request Interceptor: Tự động đính kèm Bearer token từ localStorage
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      const token =
        localStorage.getItem('smartblood_token') || localStorage.getItem('token');

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

/**
 * 3. Response Interceptor: Bắt lỗi 401 (token hết hạn hoặc không hợp lệ)
 * Tự động xóa token, phát sự kiện để AuthContext reset về trạng thái chưa đăng nhập
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('smartblood_token');
        localStorage.removeItem('token');
        localStorage.removeItem('smartblood_user');

        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * 4. Helper API chuyên biệt cho Phân hệ Xác thực (Authentication)
 */
export interface LoginPayload {
  email: string;
  matKhau: string;
}

export interface RegisterDonorPayload {
  hoTen: string;
  email: string;
  matKhau: string;
  soDienThoai: string;
  nhomMau?: string;
  yeuToRh?: string;
  diaChi?: string;
  cccd?: string;
  vaiTro?: 'DONOR' | 'HOSPITAL_STAFF' | 'ADMIN';
}

export const authApi = {
  // Đăng nhập hệ thống (POST /api/auth/login)
  login: async (credentials: LoginPayload) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  // Đăng ký tài khoản người hiến máu (POST /api/auth/register)
  register: async (donorData: RegisterDonorPayload) => {
    const res = await api.post('/auth/register', donorData);
    return res.data;
  },

  // Lấy thông tin cá nhân hiện tại (GET /api/auth/profile)
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

export default api;
