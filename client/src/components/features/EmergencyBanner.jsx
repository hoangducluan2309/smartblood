import React from 'react';
import { AlertCircle, Flame, ArrowRight } from 'lucide-react';
import { BloodTypeBadge } from '../common/BloodTypeBadge';

/**
 * EmergencyBanner Component
 * Banner KHẨN CẤP realtime cuộn ngang (Marquee ticker)
 * Cảnh báo tức thì các ca thiếu máu cấp cứu, đặc biệt là nhóm máu hiếm Rh-
 */
export const EmergencyBanner = ({ requests = [], onSelectRequest }) => {
  if (!requests || requests.length === 0) return null;

  // Lặp lại danh sách để hiệu ứng cuộn vô tận mượt mà
  const tickerItems = [...requests, ...requests];

  return (
    <div className="bg-gradient-to-r from-red-700 via-brand-600 to-red-800 text-white overflow-hidden py-2.5 relative shadow-inner z-20">
      <div className="max-w-7xl mx-auto px-4 flex items-center">
        {/* Label cố định bên trái trên desktop */}
        <div className="flex-shrink-0 flex items-center gap-2 pr-4 bg-inherit z-10 shadow-sm border-r border-red-500/50">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-400"></span>
          </span>
          <div className="flex items-center gap-1 font-bold text-xs sm:text-sm tracking-wide uppercase">
            <Flame className="w-4 h-4 text-yellow-300 animate-bounce" />
            <span className="hidden sm:inline">Báo động đỏ:</span>
            <span>Khẩn cấp realtime</span>
          </div>
        </div>

        {/* Khu vực cuộn ngang vô tận (Ticker) */}
        <div className="overflow-hidden flex-1 relative ml-3">
          <div className="animate-ticker flex items-center gap-6 whitespace-nowrap">
            {tickerItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                onClick={() => onSelectRequest && onSelectRequest(item)}
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm bg-black/20 hover:bg-black/35 px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-white/10"
              >
                <BloodTypeBadge
                  bloodType={item.bloodType}
                  isRare={item.isRareBlood}
                  size="sm"
                  showRareTag={false}
                />
                <span className="font-semibold text-white">
                  {item.hospitalName}
                </span>
                <span className="text-red-200">
                  - Cần gấp: <strong className="text-yellow-300">{item.requiredUnits} đơn vị</strong>
                </span>
                <span className="text-[11px] bg-red-950/60 px-2 py-0.5 rounded text-white/90 font-medium">
                  {item.timeRemaining}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-yellow-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
