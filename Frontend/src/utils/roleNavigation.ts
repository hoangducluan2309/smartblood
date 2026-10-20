import { UserRole } from '../types';

/**
 * Lấy đường dẫn trang chính theo vai trò của người dùng:
 * - ADMIN: Tổng quan hệ thống (/admin)
 * - HOSPITAL_STAFF: Tiếp nhận & duyệt lịch (/staff/reception)
 * - DONOR: Đặt lịch hiến máu (/book-appointment)
 */
export const getRoleDefaultPath = (role?: UserRole | string | null): string => {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'HOSPITAL_STAFF':
      return '/staff/reception';
    case 'DONOR':
      return '/book-appointment';
    default:
      return '/';
  }
};

/**
 * Kiểm tra xem một đường dẫn cụ thể có hợp lệ và được phép truy cập bởi vai trò đó không.
 * Nếu hợp lệ (và không phải trang chủ / trang đăng nhập), cho phép điều hướng tới trang đó;
 * ngược lại, điều hướng về trang mặc định theo vai trò.
 */
export const getRoleDestination = (
  role?: UserRole | string | null,
  requestedPath?: string | null
): string => {
  const defaultPath = getRoleDefaultPath(role);

  if (
    !requestedPath ||
    requestedPath === '/' ||
    requestedPath === '/login' ||
    requestedPath === '/register'
  ) {
    return defaultPath;
  }

  // Kiểm tra tính tương thích của đường dẫn với vai trò
  if (role === 'ADMIN') {
    if (
      requestedPath.startsWith('/admin') ||
      requestedPath.startsWith('/staff') ||
      requestedPath === '/events' ||
      requestedPath === '/inventory' ||
      requestedPath === '/profile'
    ) {
      return requestedPath;
    }
  } else if (role === 'HOSPITAL_STAFF') {
    if (
      requestedPath.startsWith('/staff') ||
      requestedPath === '/events' ||
      requestedPath === '/inventory' ||
      requestedPath === '/profile'
    ) {
      return requestedPath;
    }
  } else if (role === 'DONOR') {
    if (
      requestedPath === '/book-appointment' ||
      requestedPath === '/events' ||
      requestedPath.startsWith('/my-') ||
      requestedPath === '/profile'
    ) {
      return requestedPath;
    }
  }

  return defaultPath;
};
