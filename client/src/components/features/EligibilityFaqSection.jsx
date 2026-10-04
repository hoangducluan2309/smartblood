import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  UserCheck, 
  Scale, 
  Calendar, 
  HeartPulse, 
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import { Card } from '../common/Card';

const criteriaIconMap = {
  UserCheck,
  Scale,
  Calendar,
  HeartPulse,
};

/**
 * EligibilityFaqSection Component
 * Hiển thị tiêu chuẩn điều kiện hiến máu & FAQ Accordion tương tác
 */
export const EligibilityFaqSection = ({ criteria = [], faqs = [] }) => {
  const [openFaqId, setOpenFaqId] = useState(faqs[0]?.id || null);

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <section id="eligibility" className="py-16 sm:py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Phần 1: Tiêu chuẩn & Điều kiện tham gia */}
        <div className="mb-16">
          <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 border border-brand-200 px-3 py-1 rounded-full">
              Quy chuẩn y tế quốc gia
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
              Ai Có Thể Tham Gia Hiến Máu?
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Theo Thông tư của Bộ Y Tế, người tham gia hiến máu tình nguyện cần đáp ứng 
              các tiêu chí sức khỏe cơ bản sau để đảm bảo an toàn cho cả người hiến và người nhận:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {criteria.map((item) => {
              const Icon = criteriaIconMap[item.iconName] || CheckCircle;

              return (
                <Card
                  key={item.id}
                  className="p-5 border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-brand-300 transition-all"
                  hoverEffect={true}
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-100/70 text-brand-600 flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1">{item.title}</h4>
                  <div className="text-xs font-semibold text-brand-600 mb-2">{item.requirement}</div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.detail}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Phần 2: Câu hỏi thường gặp (FAQ Accordion) */}
        <div className="max-w-3xl mx-auto pt-6 border-t border-slate-100">
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
              <HelpCircle className="w-3.5 h-3.5 text-brand-500" />
              <span>Giải đáp thắc mắc</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Câu Hỏi Thường Gặp (FAQ)
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openFaqId === faq.id;

              return (
                <div
                  key={faq.id}
                  className="border border-slate-200 rounded-xl overflow-hidden transition-colors bg-white shadow-xs"
                >
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-800 hover:text-brand-600 transition-colors focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-brand-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
