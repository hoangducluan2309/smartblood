import React from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminForecastPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Predictive Engine v2.4
          </div>
          <h1 className="text-2xl font-black text-slate-900">Dự Báo Nhu Cầu & Nguy Cơ Thiếu Hụt Máu</h1>
          <p className="text-xs text-slate-500">Mô hình học máy dự báo nhu cầu máu trong 7 ngày tới dựa trên dữ liệu lịch sử và mùa dịch</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border-2 border-red-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-blood-primary font-bold text-xs">
            <span>DỰ BÁO BÁO ĐỘNG ĐỎ</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">Nhóm Máu O- & AB-</div>
          <p className="text-xs text-slate-600">
            Dự báo thiếu hụt khoảng <strong>35 đơn vị</strong> vào cuối tuần do trùng với các ca mổ tim lớn.
          </p>
          <div className="text-xs text-blood-primary font-bold">Khuyến nghị: Tổ chức ngày hội hiến máu cấp tốc.</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-warning font-bold text-xs">
            <span>DỰ BÁO CẦN BỔ SUNG</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">Nhóm Máu A+ & B+</div>
          <p className="text-xs text-slate-600">
            Nhu cầu tiêu thụ dự kiến tăng <strong>15%</strong> trong tuần sau. Kho hiện tại đáp ứng được 5 ngày.
          </p>
          <div className="text-xs text-warning font-bold">Khuyến nghị: Gửi SMS nhắc người hiến đến hạn.</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-success font-bold text-xs">
            <span>DỰ BÁO AN TOÀN</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-slate-900">Nhóm Máu O+</div>
          <p className="text-xs text-slate-600">
            Lượng dữ trữ hiện tại đạt <strong>110%</strong> so với ngưỡng an toàn quy định.
          </p>
          <div className="text-xs text-success font-bold">Trạng thái: Ổn định và sẵn sàng chi viện.</div>
        </div>
      </div>
    </div>
  );
};
