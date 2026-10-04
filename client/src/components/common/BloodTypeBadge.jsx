import React from 'react';

/**
 * Reusable BloodTypeBadge Component
 * Hiển thị nhóm máu A, B, AB, O và Rh (+/-), làm nổi bật nhóm máu hiếm
 */
export const BloodTypeBadge = ({
  bloodType = 'O+',
  isRare = false,
  status = null, // SAFE | WARNING | CRITICAL | null
  size = 'md', // sm | md | lg
  showRareTag = true,
  className = '',
}) => {
  // Tự động nhận diện nhóm máu hiếm nếu có dấu '-' (Rh âm)
  const isActuallyRare = isRare || bloodType.includes('-');

  // Kích thước huy hiệu
  const sizeMap = {
    sm: {
      badge: 'px-2 py-0.5 text-xs font-bold rounded-lg',
      rareTag: 'text-[9px] px-1 py-0.2',
    },
    md: {
      badge: 'px-3 py-1 text-sm font-bold rounded-xl',
      rareTag: 'text-[10px] px-1.5 py-0.5',
    },
    lg: {
      badge: 'px-4 py-2 text-xl font-extrabold rounded-xl',
      rareTag: 'text-xs px-2 py-0.5',
    },
  };

  // Trạng thái tồn kho (nếu được truyền vào)
  const statusColors = {
    CRITICAL: 'bg-red-100 text-red-700 border-red-300 ring-1 ring-red-400',
    WARNING: 'bg-amber-100 text-amber-800 border-amber-300 ring-1 ring-amber-300',
    SAFE: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-300',
  };

  // Màu mặc định khi không truyền status
  const defaultColors = isActuallyRare
    ? 'bg-purple-100 text-purple-900 border-purple-300'
    : 'bg-brand-50 text-brand-700 border-brand-200';

  const currentStatusClass = status ? statusColors[status] : defaultColors;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span
        className={`inline-flex items-center justify-center tracking-wide border shadow-xs ${currentStatusClass} ${sizeMap[size].badge}`}
      >
        <span>{bloodType}</span>
      </span>

      {isActuallyRare && showRareTag && (
        <span
          className={`inline-flex items-center uppercase font-semibold tracking-wider bg-rose-600 text-white rounded-md animate-pulse-subtle shadow-xs ${sizeMap[size].rareTag}`}
        >
          Nhóm hiếm
        </span>
      )}
    </div>
  );
};
