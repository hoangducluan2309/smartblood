import React from 'react';
import { User, Award, Droplet, ShieldCheck, History } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6 text-center">
        <div className="relative inline-block mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mx-auto border-2 border-blood-primary">
            <User className="w-10 h-10" />
          </div>
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-success border-2 border-white flex items-center justify-center text-white text-[10px]">
            ✓
          </span>
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Nguyễn Tình Nguyện Viên</h2>
          <p className="text-xs text-slate-500 font-medium">Tình nguyện viên hiến máu dự bị</p>
          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-red-50 text-blood-primary font-black text-sm">
            <Droplet className="w-4 h-4 fill-blood-primary" /> Nhóm máu O+
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 text-left">
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Số lần đã hiến</div>
            <div className="text-xl font-black text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Award className="w-5 h-5 text-amber-500" /> 04 Lần
            </div>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Trạng thái sẵn sàng</div>
            <div className="text-sm font-bold text-success mt-1 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Đang kích hoạt
            </div>
          </div>
        </div>

        <div className="text-left space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Lịch sử hiến gần nhất</h3>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              <div>
                <strong className="text-slate-800">BV Chợ Rẫy (Hiến cấp cứu)</strong>
                <p className="text-slate-400 text-[11px]">15/12/2025 &bull; 350ml</p>
              </div>
            </div>
            <span className="text-success font-bold">Hoàn thành</span>
          </div>
        </div>
      </div>
    </div>
  );
};
