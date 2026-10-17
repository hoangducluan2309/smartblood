import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Coffee,
  FileText,
  Heart,
  ShieldCheck,
  Stethoscope,
} from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Đăng ký & khai báo',
    duration: '5 - 10 phút',
    description:
      'Đăng ký thông tin cá nhân, xuất trình giấy tờ tùy thân và trả lời trung thực các câu hỏi về sức khỏe.',
    icon: FileText,
    color: 'rose',
  },
  {
    number: '02',
    title: 'Khám sàng lọc',
    duration: '10 - 15 phút',
    description:
      'Nhân viên y tế trao đổi về tiền sử sức khỏe, kiểm tra các chỉ số cần thiết và tư vấn trước khi hiến.',
    icon: Stethoscope,
    color: 'blue',
  },
  {
    number: '03',
    title: 'Hiến máu',
    duration: 'Khoảng 5 - 10 phút',
    description:
      'Máu được tiếp nhận bởi nhân viên y tế với bộ dụng cụ vô khuẩn dùng một lần. Hãy báo ngay nếu thấy không khỏe.',
    icon: Heart,
    color: 'red',
  },
  {
    number: '04',
    title: 'Nghỉ ngơi & hồi phục',
    duration: 'Ít nhất 10 - 15 phút',
    description:
      'Nghỉ tại điểm hiến, uống nước và dùng đồ ăn nhẹ theo hướng dẫn trước khi ra về.',
    icon: Coffee,
    color: 'amber',
  },
  {
    number: '05',
    title: 'Nhận hướng dẫn sau hiến',
    duration: 'Theo dõi trong ngày',
    description:
      'Nhận hướng dẫn chăm sóc sau hiến và thông tin liên hệ nếu cần tư vấn thêm.',
    icon: CheckCircle2,
    color: 'emerald',
  },
];

const colorClasses = {
  rose: 'bg-rose-50 text-rose-600 border-rose-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

export const ProcessPage: React.FC = () => (
  <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-in fade-in duration-300">
    <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 px-6 py-9 text-white shadow-xl sm:px-10 sm:py-12">
      <span className="inline-flex items-center gap-2 rounded-full border border-rose-300/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-rose-100">
        <ShieldCheck className="h-4 w-4 text-emerald-300" />
        An toàn, có nhân viên y tế hướng dẫn
      </span>
      <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
        Quy trình hiến máu
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
        Từ lúc đăng ký đến khi nghỉ ngơi sau hiến, đội ngũ tại điểm tiếp nhận sẽ
        hướng dẫn bạn từng bước. Thời gian thực tế có thể thay đổi tùy tình
        trạng sức khỏe và lượng người đăng ký.
      </p>
      <div className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-slate-300">
        <Clock className="h-4 w-4 text-amber-300" />
        Hãy dành đủ thời gian cho khâu khám sàng lọc và nghỉ ngơi sau hiến.
      </div>
    </header>

    <section className="grid gap-4 md:grid-cols-2">
      {steps.map(({ number, title, duration, description, icon: Icon, color }) => (
        <article
          key={number}
          className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
        >
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${colorClasses[color]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-red-600">
                BƯỚC {number}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                {duration}
              </span>
            </div>
            <h2 className="mt-1 text-base font-extrabold text-slate-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {description}
            </p>
          </div>
        </article>
      ))}
    </section>

    <aside className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-relaxed text-amber-950">
      <p className="font-extrabold">Lưu ý</p>
      <p className="mt-1">
        Việc hiến máu chỉ được thực hiện khi nhân viên y tế xác nhận bạn đủ
        điều kiện tại thời điểm khám. Luôn làm theo hướng dẫn của điểm tiếp
        nhận.
      </p>
    </aside>

    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-rose-50 p-5 sm:flex-row">
      <p className="text-sm font-semibold text-slate-700">
        Sẵn sàng sẻ chia? Tìm hiểu điều kiện trước khi đăng ký.
      </p>
      <Link
        to="/eligibility"
        className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-rose-100"
      >
        Xem điều kiện hiến máu
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
);

export default ProcessPage;
