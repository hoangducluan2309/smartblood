import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  CircleHelp,
  Heart,
  ShieldCheck,
  TriangleAlert,
  X,
} from 'lucide-react';

const questions = [
  {
    question: 'Ai có thể đăng ký hiến máu?',
    answer:
      'Người có sức khỏe phù hợp có thể đăng ký để được tư vấn và khám sàng lọc. Nhân viên y tế sẽ xác nhận bạn có đủ điều kiện hiến máu tại thời điểm tiếp nhận.',
  },
  {
    question: 'Tôi có cần biết nhóm máu của mình trước không?',
    answer:
      'Không bắt buộc. Điểm tiếp nhận sẽ hướng dẫn các bước cần thiết và thông tin nhóm máu được xác định theo quy trình xét nghiệm.',
  },
  {
    question: 'Tôi nên chuẩn bị gì trước khi đến hiến?',
    answer:
      'Nghỉ ngơi đầy đủ, ăn uống bình thường, uống đủ nước và mang theo giấy tờ tùy thân. Nếu đang dùng thuốc hoặc có vấn đề sức khỏe, hãy thông báo với nhân viên y tế.',
  },
  {
    question: 'Sau khi hiến máu cần lưu ý gì?',
    answer:
      'Nghỉ tại điểm tiếp nhận theo hướng dẫn, uống nước và tránh hoạt động gắng sức ngay sau hiến. Nếu có biểu hiện bất thường, hãy liên hệ cơ sở y tế.',
  },
  {
    question: 'Bao lâu tôi có thể hiến máu lại?',
    answer:
      'Khoảng cách giữa các lần hiến phụ thuộc vào loại hiến máu, tình trạng sức khỏe và hướng dẫn chuyên môn. Hãy hỏi nhân viên y tế để được xác nhận thời điểm phù hợp.',
  },
];

export const EligibilityFaqPage: React.FC = () => (
  <div className="mx-auto max-w-5xl space-y-8 pb-12 animate-in fade-in duration-300">
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
        <CircleHelp className="h-4 w-4" />
        Thông tin dành cho người hiến
      </span>
      <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
        Điều kiện hiến máu & FAQ
      </h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
        Một số hướng dẫn chung giúp bạn chuẩn bị trước khi đăng ký. Việc đủ
        điều kiện hiến máu cần được nhân viên y tế đánh giá trực tiếp.
      </p>
    </header>

    <section className="grid gap-5 md:grid-cols-2">
      <article className="rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Check className="h-5 w-5" />
          </span>
          Trước khi đăng ký
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          <li className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Cảm thấy khỏe mạnh và sẵn sàng tham gia khám sàng lọc.
          </li>
          <li className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Nghỉ ngơi, ăn uống bình thường và uống đủ nước trước khi đến.
          </li>
          <li className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Mang giấy tờ tùy thân; khai báo trung thực về sức khỏe, thuốc đang
            sử dụng và các lần hiến trước.
          </li>
          <li className="flex gap-2.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            Làm theo hướng dẫn và quyết định chuyên môn của nhân viên y tế.
          </li>
        </ul>
      </article>

      <article className="rounded-2xl border border-rose-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
            <TriangleAlert className="h-5 w-5" />
          </span>
          Hãy báo với nhân viên y tế
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
          <li className="flex gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            Bạn đang không khỏe, đang điều trị bệnh hoặc vừa có thay đổi về sức
            khỏe.
          </li>
          <li className="flex gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            Bạn đang dùng thuốc, vừa tiêm chủng, phẫu thuật hoặc thực hiện thủ
            thuật gần đây.
          </li>
          <li className="flex gap-2.5">
            <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
            Bạn có tiền sử bệnh, dị ứng hoặc các thông tin khác có thể ảnh
            hưởng đến việc hiến máu.
          </li>
          <li className="flex gap-2.5">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            Nếu chưa chắc chắn, hãy hỏi cơ sở tiếp nhận trước khi đến.
          </li>
        </ul>
      </article>
    </section>

    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
          Câu hỏi thường gặp
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Thông tin tham khảo nhanh cho người lần đầu hiến máu.
        </p>
      </div>
      <div className="space-y-3">
        {questions.map(({ question, answer }) => (
          <details
            key={question}
            className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm open:border-rose-200 sm:p-5"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-800 marker:content-none">
              {question}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-rose-100 group-open:text-rose-700">
                <span className="text-lg leading-none">+</span>
              </span>
            </summary>
            <p className="mt-3 max-w-4xl border-t border-slate-100 pt-3 text-sm leading-relaxed text-slate-600">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>

    <aside className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-sm leading-relaxed text-blue-950">
      <p className="font-extrabold">Lưu ý quan trọng</p>
      <p className="mt-1">
        Nội dung trên không thay thế tư vấn y tế. Điều kiện cụ thể có thể khác
        theo quy định hiện hành và đánh giá của nhân viên y tế tại điểm hiến.
      </p>
    </aside>

    <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-rose-50 p-5 sm:flex-row">
      <div className="flex items-center gap-3">
        <Heart className="h-5 w-5 shrink-0 fill-rose-600 text-rose-600" />
        <p className="text-sm font-semibold text-slate-700">
          Có câu hỏi riêng về sức khỏe? Hãy trao đổi với nhân viên y tế trước
          khi hiến.
        </p>
      </div>
      <Link
        to="/donate"
        className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700"
      >
        Đăng ký người hiến
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </div>
);

export default EligibilityFaqPage;
