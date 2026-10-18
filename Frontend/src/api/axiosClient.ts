import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Đọc base URL từ biến môi trường hoặc dùng mặc định
export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000/api/v1';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động gắn Bearer Token vào Header
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Xử lý lỗi 401 và tự động chuyển hướng
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Xóa token khỏi localStorage khi phiên hết hạn
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('smartblood_token');
      localStorage.removeItem('smartblood_user');

      // Nếu vừa mới bấm Đăng xuất, tuyệt đối không ép chuyển hướng về /login
      const loggedOutAt = typeof window !== 'undefined' ? Number(sessionStorage.getItem('bloodsmart_just_logged_out') || 0) : 0;
      const isRecentlyLoggedOut = loggedOutAt > 0 && Date.now() - loggedOutAt < 10000;
      if (isRecentlyLoggedOut) {
        return Promise.reject(error);
      }

      // Tránh lặp vô tận nếu đang ở trang auth
      const currentPath = window.location.pathname;
      if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
