import React from 'react';
import { HeartHandshake, Building2, Users, Activity, TrendingUp } from 'lucide-react';
import { Card } from '../common/Card';

// Map icon string từ mock sang Lucide Component
const iconMap = {
  HeartHandshake: HeartHandshake,
  Building2: Building2,
  Users: Users,
  Activity: Activity,
};

/**
 * StatsSection Component
 * Hiển thị số liệu thống kê tác động xã hội của hệ thống
 */
export const StatsSection = ({ stats = [] }) => {
  return (
    <section className="py-12 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat) => {
            const IconComponent = iconMap[stat.iconName] || Activity;

            return (
              <Card
                key={stat.id}
                className="p-5 sm:p-6 border border-slate-100 hover:border-brand-200 transition-all group"
                hoverEffect={true}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    Tăng trưởng
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {stat.value}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    {stat.label}
                  </p>
                  <p className="text-[11px] text-slate-500 pt-1 line-clamp-1">
                    {stat.change}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
