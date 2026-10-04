import React, { useState } from 'react';
import { Database, AlertTriangle, ShieldCheck, Info, Filter, ArrowUpRight } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { BloodTypeBadge } from '../common/BloodTypeBadge';
import { Button } from '../common/Button';

/**
 * BloodInventorySection Component
 * Hiển thị tình trạng kho máu theo 8 nhóm (A, B, AB, O +/-) dạng Progress Bar
 * Nổi bật các nhóm máu hiếm Rh- và cảnh báo thiếu hụt
 */
export const BloodInventorySection = ({ inventory = [], onDonateForGroup }) => {
  const [activeFilter, setActiveFilter] = useState('ALL'); // ALL | RARE | CRITICAL

  // Lọc dữ liệu theo tab
  const filteredInventory = inventory.filter((item) => {
    if (activeFilter === 'RARE') return item.isRare;
    if (activeFilter === 'CRITICAL') return item.status === 'CRITICAL' || item.status === 'WARNING';
    return true;
  });

  // Helper tính màu của progress bar
  const getProgressBarColor = (status) => {
    switch (status) {
      case 'CRITICAL':
        return 'bg-red-600';
      case 'WARNING':
        return 'bg-amber-500';
      case 'SAFE':
      default:
        return 'bg-emerald-500';
    }
  };

  // Helper label trạng thái
  const getStatusBadge = (status) => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
            Thiếu nghiêm trọng
          </span>
        );
      case 'WARNING':
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
            Cần bổ sung
          </span>
        );
      case 'SAFE':
      default:
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            Dự trữ ổn định
          </span>
        );
    }
  };

  return (
    <section id="inventory" className="py-16 sm:py-20 bg-surface-light">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-brand-600 font-bold text-xs uppercase tracking-wider bg-brand-50 px-3 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" />
              <span>Dữ liệu kho máu hợp nhất</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tình Trạng Kho Máu Theo Từng Nhóm Máu
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Hệ thống giám sát định lượng kho máu thời gian thực. Đỏ báo động thiếu hụt trầm trọng 
              (đặc biệt nhóm máu hiếm Rh- dưới 0.1% dân số), vàng cần bổ sung, xanh ở mức dự trữ an toàn.
            </p>
          </div>

          {/* Bộ lọc nhanh */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 p-1 rounded-xl self-start md:self-auto overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveFilter('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả 8 nhóm ({inventory.length})
            </button>
            <button
              onClick={() => setActiveFilter('RARE')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'RARE'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-800 hover:bg-purple-100'
              }`}
            >
              Nhóm hiếm Rh- (4)
            </button>
            <button
              onClick={() => setActiveFilter('CRITICAL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'CRITICAL'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-700 hover:bg-red-100'
              }`}
            >
              Cần tiếp viện gấp
            </button>
          </div>
        </div>

        {/* Lưới 8 Card nhóm máu dạng Progress Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredInventory.map((item) => (
            <Card
              key={item.id}
              className={`border transition-all duration-200 ${
                item.status === 'CRITICAL'
                  ? 'border-red-200 hover:border-red-400 bg-gradient-to-b from-white to-red-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <CardBody className="p-5 flex flex-col justify-between h-full space-y-4">
                {/* Header card: Nhóm máu & Trạng thái */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <BloodTypeBadge
                      bloodType={item.bloodType}
                      isRare={item.isRare}
                      size="lg"
                    />
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2 h-8">
                    {item.description}
                  </p>
                </div>

                {/* Progress Bar & Con số */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-slate-600 font-medium">Hiện có trong kho:</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {item.unitsInStock} <span className="font-normal text-slate-500 text-xs">/ {item.safeThreshold} đơn vị</span>
                    </span>
                  </div>

                  {/* Thanh Progress */}
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(item.status)}`}
                      style={{ width: `${Math.max(5, item.percentage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 pt-0.5">
                    <span>Mức an toàn: {item.safeThreshold} túi</span>
                    <strong className={item.status === 'CRITICAL' ? 'text-red-600 font-bold' : 'text-slate-700'}>
                      {item.percentage}%
                    </strong>
                  </div>
                </div>

                {/* Nút đăng ký hiến nhanh cho nhóm máu này */}
                <Button
                  size="sm"
                  variant={item.status === 'CRITICAL' ? 'danger' : 'outline'}
                  fullWidth
                  rightIcon={<ArrowUpRight className="w-4 h-4" />}
                  onClick={() => onDonateForGroup && onDonateForGroup(item.bloodType)}
                  className="mt-2"
                >
                  Hiến nhóm {item.bloodType} ngay
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>

        {/* Chú thích hướng dẫn đọc kho máu */}
        <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <span>
              <strong>Ghi chú y khoa:</strong> 1 đơn vị máu toàn phần tương đương 250ml hoặc 350ml. 
              Các nhóm máu Rh(-) chỉ tiếp nhận được cùng nhóm Rh(-), do đó cần duy trì nguồn dự trữ tối thiểu.
            </span>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600" /> &lt;25% Báo động
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500" /> 25-65% Cảnh báo
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" /> &gt;65% An toàn
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
