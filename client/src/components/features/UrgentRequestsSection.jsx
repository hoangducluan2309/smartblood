import React, { useState } from 'react';
import { Siren, Clock, Radio, Sparkles } from 'lucide-react';
import { UrgentRequestCard } from './UrgentRequestCard';

/**
 * UrgentRequestsSection Component
 * Danh sách các ca cấp cứu thiếu máu khẩn cấp thời gian thực
 */
export const UrgentRequestsSection = ({ requests = [], onRespond }) => {
  const [filterBlood, setFilterBlood] = useState('ALL');

  // Lọc theo nhóm máu
  const filteredRequests = requests.filter((req) => {
    if (filterBlood === 'ALL') return true;
    if (filterBlood === 'RARE') return req.isRareBlood;
    return req.bloodType === filterBlood;
  });

  return (
    <section id="urgent-requests" className="py-16 sm:py-20 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Tiêu đề Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-red-600 font-bold text-xs uppercase tracking-wider bg-red-50 border border-red-200 px-3 py-1 rounded-full">
              <Siren className="w-3.5 h-3.5 animate-bounce" />
              <span>Cảnh báo thời gian thực (Socket.io Real-time)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Yêu Cầu Máu Cấp Cứu Khẩn Cấp
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Các ca phẫu thuật, tai nạn và cấp cứu sản khoa đang cần tiếp máu tức thì. 
              Nếu bạn ở gần hoặc mang nhóm máu tương thích, xin hãy phản hồi để hỗ trợ ngay!
            </p>
          </div>

          {/* Bộ lọc nhanh */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Lọc theo:</span>
            <select
              value={filterBlood}
              onChange={(e) => setFilterBlood(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="ALL">Tất cả ca cấp cứu ({requests.length})</option>
              <option value="RARE">Chỉ ca nhóm hiếm Rh-</option>
              <option value="O-">Nhóm O-</option>
              <option value="AB-">Nhóm AB-</option>
              <option value="A-">Nhóm A-</option>
              <option value="B-">Nhóm B-</option>
            </select>
          </div>
        </div>

        {/* Lưới các UrgentRequestCard */}
        {filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <UrgentRequestCard
                key={request.id}
                request={request}
                onRespond={onRespond}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-sm">Không có ca khẩn cấp nào phù hợp bộ lọc.</p>
          </div>
        )}
      </div>
    </section>
  );
};
