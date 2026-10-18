import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarClock, CheckCircle2, ClipboardList, HeartHandshake } from 'lucide-react';
import { useEscapeToHome } from '../hooks/useEscapeToHome';

export const DonatePage: React.FC = () => {
  useEscapeToHome();

  return (
    <div className="mx-auto max-w-3xl space-y-7 py-4 animate-in fade-in duration-300">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700">
          <HeartHandshake className="h-4 w-4" />
          Đăng ký hiến máu tình nguyện
        </span>
        <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Đăng ký tài khoản là bước đầu tiên
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Để bệnh viện nhận được yêu cầu và duyệt lịch hiến máu, bạn cần chọn ngày, khung giờ
          và gửi một lịch hẹn. Trang này không tạo lịch hẹn chỉ bằng thông tin đăng ký tình nguyện.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            icon: ClipboardList,
            title: 'Tạo tài khoản',
            description: 'Đăng ký thông tin cá nhân và đăng nhập với vai trò người hiến máu.',
          },
          {
            icon: CalendarClock,
            title: 'Chọn lịch hiến',
            description: 'Chọn ngày, khung giờ, điểm tiếp nhận và lượng máu dự kiến.',
          },
          {
            icon: CheckCircle2,
            title: 'Chờ bệnh viện duyệt',
            description: 'Lịch hẹn sẽ xuất hiện trong mục Duyệt hiến máu của nhân viên y tế.',
          },
        ].map(({ icon: Icon, title, description }, index) => (
          <article
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600">
              Bước {index + 1}
            </p>
            <h2 className="mt-1 text-sm font-extrabold text-slate-900">{title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{description}</p>
          </article>
        ))}
      </div>

      <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-white via-rose-50 to-orange-50 p-6 text-center shadow-sm sm:p-8">
        <h2 className="text-lg font-black text-slate-900">Sẵn sàng đăng ký lịch hiến máu?</h2>
        <p className="mt-2 text-sm text-slate-600">
          Tạo tài khoản người hiến hoặc đăng nhập, sau đó bạn sẽ được chuyển đến biểu mẫu đặt lịch.
        </p>
        <Link
          to="/register"
          className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
        >
          Đặt lịch hiến máu
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
};
