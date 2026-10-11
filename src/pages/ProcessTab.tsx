import React, { useState } from 'react';
import {
  FileText,
  Stethoscope,
  Heart,
  Coffee,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Droplet,
  Sparkles,
  PhoneCall,
  Flame,
} from 'lucide-react';

export interface ProcessTabProps {
  onSelectTab?: (tabId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
}

interface StepItem {
  id: number;
  title: string;
  subtitle: string;
  duration: string;
  icon: React.ReactNode;
  description: string;
  details: string[];
  tips: string;
  warning?: string;
}

export const ProcessTab: React.FC<ProcessTabProps> = ({
  onSelectTab,
  onOpenAuthModal,
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const steps: StepItem[] = [
    {
      id: 1,
      title: 'Đăng ký & Khai báo Y tế',
      subtitle: 'Xuất trình giấy tờ tùy thân & Điền bảng câu hỏi sức khỏe',
      duration: '5 - 10 phút',
      icon: <FileText className="w-6 h-6" />,
      description:
        'Người hiến máu xuất trình Căn cước công dân gắn chip hoặc tài khoản VNeID mức độ 2, sau đó hoàn tất Phiếu đăng ký hiến máu tình nguyện trực tiếp hoặc trực tuyến qua SmartBlood.',
      details: [
        'Khai báo thông tin cá nhân cơ bản: Họ tên, CCCD, ngày sinh, nơi cư trú, số điện thoại.',
        'Trả lời trung thực bảng câu hỏi tiền sử dịch tễ, bệnh lý nền và các loại thuốc đang sử dụng.',
        'Nhận số thứ tự tự động và được cấp mã hồ sơ hiến máu số hóa.',
      ],
      tips: 'Nên uống trước 300 - 500ml nước lọc và chuẩn bị sẵn CCCD hoặc ứng dụng VNeID trên điện thoại.',
      warning: 'Tuyệt đối không uống bia, rượu hoặc dùng chất kích thích trong vòng 24 giờ trước khi hiến máu.',
    },
    {
      id: 2,
      title: 'Khám Sàng lọc & Xét nghiệm Nhanh',
      subtitle: 'Đo sinh hiệu & Xét nghiệm Hemoglobin, Viêm gan B',
      duration: '10 - 15 phút',
      icon: <Stethoscope className="w-6 h-6" />,
      description:
        'Bác sĩ chuyên khoa tiến hành đo huyết áp, kiểm tra nhịp tim, khám lâm sàng và lấy mẫu máu đầu ngón tay để làm các xét nghiệm sàng lọc nhanh bắt buộc.',
      details: [
        'Đo huyết áp (chỉ số chuẩn 100/60 - 140/90 mmHg), nhịp tim đều (60 - 90 lần/phút).',
        'Xét nghiệm định lượng Huyết sắc tố (Hb): Đạt tối thiểu ≥ 120 g/L (đối với nam) hoặc ≥ 115 g/L (đối với nữ).',
        'Test nhanh kháng nguyên Viêm gan B (HBsAg âm tính).',
        'Bác sĩ tư vấn chỉ định thể tích máu hiến phù hợp: 250ml, 350ml hoặc 450ml.',
      ],
      tips: 'Hít thở sâu, giữ tinh thần thư giãn khi đo huyết áp để chỉ số phản ánh chính xác nhất.',
      warning: 'Nếu bạn đang sốt, cảm cúm, viêm họng hoặc mệt mỏi, bác sĩ sẽ khuyên tạm hoãn để đảm bảo sức khỏe.',
    },
    {
      id: 3,
      title: 'Thực hiện Hiến máu',
      subtitle: 'Lấy máu vào túi vô trùng chuyên dụng một lần',
      duration: '5 - 10 phút',
      icon: <Heart className="w-6 h-6" />,
      description:
        'Điều dưỡng viên sát trùng vùng tĩnh mạch cánh tay và tiến hành lấy máu bằng kim vô trùng dùng 1 lần trong môi trường đảm bảo an toàn tuyệt đối.',
      details: [
        'Người hiến máu nằm trên ghế đệm y tế chuyên dụng, tư thế thoải mái nhất.',
        'Kim tiêm và dây truyền khép kín vô trùng 100%, bảo đảm không có nguy cơ lây nhiễm chéo.',
        'Người hiến máu bóp bóng cao su nhịp nhàng theo hướng dẫn để máu lưu thông đều vào túi máu.',
        'Máy cân lắc máu tự động ngắt khi đã thu đủ thể tích chỉ định (250ml, 350ml hoặc 450ml).',
      ],
      tips: 'Thả lỏng cánh tay, không nhìn vào kim tiêm nếu cảm thấy hồi hộp. Có thể trò chuyện cùng điều dưỡng hoặc nghe nhạc nhẹ.',
      warning: 'Nếu cảm thấy hơi chóng mặt hoặc choáng váng trong lúc lấy máu, hãy báo ngay cho điều dưỡng viên.',
    },
    {
      id: 4,
      title: 'Nghỉ ngơi & Nhận bồi dưỡng',
      subtitle: 'Nghỉ tại chỗ, uống trà đường và nhận gói bồi dưỡng y tế',
      duration: '15 - 20 phút',
      icon: <Coffee className="w-6 h-6" />,
      description:
        'Sau khi rút kim, người hiến máu được băng ép vô khuẩn và di chuyển sang khu vực nghỉ ngơi phục hồi thể lực, dùng thức ăn nhẹ và nhận chế độ bồi dưỡng.',
      details: [
        'Nằm hoặc ngồi nghỉ thư giãn tại chỗ ít nhất 15 phút, đè nhẹ miếng bông gòn vào vết chọc kim trong 10 phút.',
        'Dùng đồ uống ngọt (trà đường, sữa ấm) và ăn nhẹ bánh ngọt để bổ sung lượng đường và thể tích tuần hoàn.',
        'Nhận gói bồi dưỡng dinh dưỡng, tiền hỗ trợ đi lại theo Thông tư quy định của Bộ Y Tế.',
        'Tự do lựa chọn quà lưu niệm hoặc gói xét nghiệm máu chuyên sâu tầm soát sức khỏe.',
      ],
      tips: 'Không đứng dậy đột ngột. Giữ miếng băng dán khô ráo trong ít nhất 4 - 6 giờ sau khi hiến.',
      warning: 'Tránh mang vác vật nặng hoặc tập thể dục gắng sức bằng cánh tay vừa hiến máu trong suốt ngày hôm đó.',
    },
    {
      id: 5,
      title: 'Cấp Giấy chứng nhận & Thẻ điện tử',
      subtitle: 'Chứng nhận nhân đạo & Tích hợp bồi hoàn máu toàn quốc',
      duration: '2 - 5 phút',
      icon: <Award className="w-6 h-6" />,
      description:
        'Ban tổ chức trao tặng Giấy chứng nhận Hiến máu tình nguyện. Toàn bộ dữ liệu hiến máu được đồng bộ tức thời lên hệ thống SmartBlood và ứng dụng VNeID.',
      details: [
        'Nhận Giấy chứng nhận hiến máu tình nguyện do Ban Chỉ đạo Vận động Hiến máu trao tặng.',
        'Giấy chứng nhận có giá trị bồi hoàn lượng máu đã hiến hoàn toàn miễn phí tại tất cả bệnh viện công lập trên toàn quốc.',
        'Mẫu máu của bạn được chuyển về Viện Huyết học để làm 5 xét nghiệm sàng lọc bệnh truyền nhiễm cao cấp (HIV, HBV, HCV, Giang mai, Sốt rét).',
        'Nhận thông báo kết quả nhóm máu và tình trạng kiểm tra máu qua ứng dụng SmartBlood sau 24 - 48 giờ.',
      ],
      tips: 'Lưu giữ cẩn thận Giấy chứng nhận hoặc sử dụng Mã QR thẻ hiến máu điện tử trên SmartBlood khi cần bồi hoàn.',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO BANNER: CẨM NANG QUY TRÌNH Y TẾ */}
      <section className="relative overflow-hidden rounded-[12px] bg-gradient-to-r from-slate-900 via-slate-800 to-rose-950 text-white p-6 sm:p-8 md:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tiêu Chuẩn Y Khoa Quốc Gia</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Quy Trình 5 Bước Hiến Máu An Toàn
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Mỗi lần hiến máu là một hành động trao tặng sự sống. Quy trình hiến máu nhân đạo tại SmartBlood được thiết kế khép kín, an toàn tuyệt đối và chỉ mất khoảng <strong>30 - 45 phút</strong> của bạn.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-amber-300" />
              <span>Tổng thời gian: <strong>~35 phút</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>An toàn vô trùng: <strong>100% kim một lần</strong></span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <Award className="w-4 h-4 text-rose-300" />
              <span>Bồi hoàn máu: <strong>Toàn quốc</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TIMELINE 5 BƯỚC INTERACTIVE */}
      <section className="bg-white p-6 sm:p-8 rounded-[12px] border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Các Giai Đoạn Trong Quy Trình
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Nhấn vào từng bước bên dưới để xem chỉ dẫn chi tiết và lời khuyên từ bác sĩ
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            Bước {activeStepIndex + 1} / 5
          </span>
        </div>

        {/* Thanh Steps Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
          {steps.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = activeStepIndex > idx;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-rose-50/80 border-[#D32F2F] ring-2 ring-[#D32F2F]/20 shadow-xs'
                    : isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black transition-colors ${
                      isActive
                        ? 'bg-[#D32F2F] text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {step.duration.split(' ')[0]}p
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-800 line-clamp-1">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Chi tiết bước đang chọn (Card phóng to) */}
        {(() => {
          const currentStep = steps[activeStepIndex];
          return (
            <div className="bg-slate-50/70 rounded-[12px] border border-slate-200 p-6 sm:p-8 space-y-6">
              {/* Header bước */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D32F2F] to-[#B71C1C] text-white flex items-center justify-center shadow-md shadow-[#D32F2F]/20 shrink-0">
                    {currentStep.icon}
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-[#D32F2F] uppercase tracking-wider">
                      Bước {currentStep.id} / 5
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                      {currentStep.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">{currentStep.subtitle}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-center shrink-0">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>Thời gian: {currentStep.duration}</span>
                </div>
              </div>

              {/* Mô tả tổng quan */}
              <p className="text-sm text-slate-700 leading-relaxed font-normal">
                {currentStep.description}
              </p>

              {/* Danh sách công việc cụ thể */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nội dung chi tiết được thực hiện:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentStep.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{detail}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lời khuyên & Cảnh báo y tế */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Lời khuyên của bác sĩ:</span>
                  </div>
                  <p className="text-emerald-800 leading-relaxed">{currentStep.tips}</p>
                </div>

                {currentStep.warning && (
                  <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 text-xs space-y-1">
                    <div className="font-bold text-[#B71C1C] flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-[#D32F2F]" />
                      <span>Lưu ý quan trọng:</span>
                    </div>
                    <p className="text-[#991B1B] leading-relaxed">{currentStep.warning}</p>
                  </div>
                )}
              </div>

              {/* Nút chuyển bước tiếp theo */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    activeStepIndex === 0
                      ? 'text-slate-300 cursor-not-allowed'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  ← Bước trước đó
                </button>

                {activeStepIndex < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setActiveStepIndex((prev) => Math.min(steps.length - 1, prev + 1))}
                    className="px-5 py-2.5 bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>Xem tiếp Bước {activeStepIndex + 2}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenAuthModal) onOpenAuthModal('register');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Đăng ký tham gia ngay</span>
                  </button>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* 3. BẢNG TỔNG KẾT NÊN & KHÔNG NÊN */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CỘT NÊN LÀM */}
        <div className="bg-white p-6 rounded-[12px] border border-emerald-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center font-bold">
              ✓
            </div>
            <h3 className="text-base font-black">NÊN LÀM Trước & Sau Khi Hiến Máu</h3>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Đêm trước khi hiến máu, hãy ngủ đủ giấc (tối thiểu 6 tiếng).</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Ăn nhẹ trước khi hiến (bánh mì, xôi, cháo, phở), tránh ăn thức ăn nhiều dầu mỡ.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Uống nhiều nước lọc (khoảng 500ml) trước và sau khi lấy máu.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Giữ tinh thần vui vẻ, thoải mái, thả lỏng cánh tay.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>Tăng cường dinh dưỡng giàu chất sắt (thịt bò, rau xanh, đậu) trong 3 - 5 ngày sau đó.</span>
            </li>
          </ul>
        </div>

        {/* CỘT KHÔNG NÊN LÀM */}
        <div className="bg-white p-6 rounded-[12px] border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-[#D32F2F]">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center font-bold">
              ✕
            </div>
            <h3 className="text-base font-black">KHÔNG NÊN LÀM</h3>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-700">
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>KHÔNG nhịn ăn sáng khi đi hiến máu (dễ gây tụt đường huyết).</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>KHÔNG uống rượu, bia, chất có cồn trong vòng 24 giờ trước và sau khi hiến.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>KHÔNG thức khuya vào đêm trước ngày diễn ra hiến máu.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>KHÔNG mang vác vật nặng hoặc chơi các môn thể thao đối kháng trong vòng 24 giờ sau khi lấy máu.</span>
            </li>
            <li className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#D32F2F] shrink-0 mt-0.5" />
              <span>KHÔNG tự ý bóc miếng băng ép quá sớm (nên giữ ít nhất 4 - 6 giờ để chống bầm tím).</span>
            </li>
          </ul>
        </div>
      </section>

      {/* 4. CALL TO ACTION FOOTER */}
      <section className="bg-gradient-to-r from-red-600 to-[#D32F2F] text-white p-6 sm:p-8 rounded-[12px] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">Bạn Đã Sẵn Sàng Trao Đi Giọt Máu Cứu Người?</h3>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl">
            Một lần hiến máu có thể cứu sống tới 3 người bệnh. Hãy cùng SmartBlood lan tỏa yêu thương ngay hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onSelectTab && onSelectTab('emergency')}
            className="px-4 py-2.5 bg-black/30 hover:bg-black/50 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-amber-300" />
            <span>Xem ca cấp cứu khẩn</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (onOpenAuthModal) onOpenAuthModal('register');
            }}
            className="px-5 py-2.5 bg-white text-[#D32F2F] hover:bg-rose-50 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Heart className="w-4 h-4 fill-[#D32F2F]" />
            <span>Đăng ký hiến máu ngay</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default ProcessTab;
