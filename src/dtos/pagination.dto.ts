export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
  search?: string;
  sortBy?: string;
  order?: 'ASC' | 'DESC' | 'asc' | 'desc';
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

/**
 * Tiện ích chuẩn hóa tham số phân trang
 */
export function parsePaginationParams(query: PaginationQuery): {
  page: number;
  limit: number;
  offset: number;
  search: string;
  order: 'ASC' | 'DESC';
} {
  const page = Math.max(1, parseInt(String(query.page || 1), 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || 10), 10) || 10));
  const offset = (page - 1) * limit;
  const search = (query.search || '').trim();
  const order = String(query.order || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return { page, limit, offset, search, order };
}

/**
 * Đóng gói kết quả phân trang theo chuẩn
 */
export function buildPaginatedResponse<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    items,
    pagination: {
      totalItems,
      totalPages,
      currentPage: page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
