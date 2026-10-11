import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Heart,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Scale,
  Calendar,
  Activity,
  ArrowRight,
} from 'lucide-react';

export interface FaqTabProps {
  onSelectTab?: (tabId: string) => void;
  onOpenAuthModal?: (tab?: 'login' | 'register') => void;
}

interface FaqItem {
  id: number;
  category: 'DIEU_KIEN' | 'TRUOC_KHI_HIEN' | 'SAU_KHI_HIEN' | 'QUYEN_LOI';
  categoryLabel: string;
  question: string;
  answer: string;
  tips?: string;
}

const FAQ_DATA: FaqItem[] = [
  // 1. Điều kiện sức khỏe
  {
    id: 1,
    category: 'DIEU_KIEN',
    categoryLabel: 'Điều kiện sức khỏe',
    question: 'Ai là người đủ tiêu chuẩn tham gia hiến máu tình nguyện?',
    answer:
      'Người từ 18 đến 60 tuổi; Cân nặng tối thiểu ≥ 45 kg đối với nam và ≥ 42 kg đối với nữ; Chỉ số huyết sắc tố (Hb) ≥ 120 g/l; Không mắc các bệnh lây truyền qua đường máu (HIV, Viêm gan B, Viêm gan C, Giang mai) và không mắc các bệnh mãn tính về tim mạch, huyết áp, gan, thận.',
    tips: 'Người hiến máu cần mang theo CCCD gắn chip hoặc tài khoản VNeID mức độ 2 khi đi hiến.',
  },
  {
    id: 2,
    category: 'DIEU_KIEN',
    categoryLabel: 'Điều kiện sức khỏe',
    question: 'Người bị cận thị có được hiến máu không?',
    answer:
      'Được phép hiến máu bình thường nếu độ cận dưới 6 đi-ốp và mắt không bị tổn thương đáy mắt hay thoái hóa võng mạc. Nếu cận thị nặng từ 6 đi-ốp trở lên hoặc có bệnh lý đáy mắt thì không nên hiến máu để tránh nguy cơ xuất huyết võng mạc.',
  },
  {
    id: 3,
    category: 'DIEU_KIEN',
    categoryLabel: 'Điều kiện sức khỏe',
    question: 'Xăm hình, xỏ khuyên sau bao lâu thì được hiến máu?',
    answer:
      'Theo quy định y tế, bạn cần chờ đủ 06 tháng kể từ ngày xăm hình, xỏ lỗ khuyên hoặc can thiệp thẩm mỹ có xâm lấn da để đảm bảo vượt qua "giai đoạn cửa sổ" tầm soát các bệnh lây nhiễm qua đường máu.',
    tips: 'Nếu xăm tại cơ sở y tế đạt chuẩn vô trùng có kiểm định, thời gian hoãn vẫn được áp dụng 6 tháng theo chuẩn Thông tư Bộ Y tế.',
  },
  {
    id: 4,
    category: 'DIEU_KIEN',
    categoryLabel: 'Điều kiện sức khỏe',
    question: 'Phụ nữ trong kỳ kinh nguyệt có hiến máu được không?',
    answer:
      'Không nên hiến máu trong những ngày đang có kinh nguyệt để tránh mệt mỏi và tụt huyết áp. Bạn nên đợi sau khi sạch kinh từ 3 - 5 ngày khi cơ thể đã hồi phục thể trạng bình thường.',
  },

  // 2. Trước khi đi hiến máu
  {
    id: 5,
    category: 'TRUOC_KHI_HIEN',
    categoryLabel: 'Trước khi hiến máu',
    question: 'Có cần phải nhịn ăn sáng trước khi đi hiến máu không?',
    answer:
      'KHÔNG ĐƯỢC NHỊN ĐÓI. Bạn NÊN ăn nhẹ trước khi hiến máu (bánh mì, xôi, cháo, phở...), nhưng TUYỆT ĐỐI tránh các đồ ăn nhiều dầu mỡ, sữa, trứng hoặc phô mai vì sẽ làm huyết tương bị đục (nhiễm mỡ), không thể sử dụng để truyền cho bệnh nhân.',
    tips: 'Hãy uống thêm 1 cốc nước lọc hoặc trà đường ấm (khoảng 300 - 500ml) trước khi lấy máu.',
  },
  {
    id: 6,
    category: 'TRUOC_KHI_HIEN',
    categoryLabel: 'Trước khi hiến máu',
    question: 'Trước ngày đi hiến máu có được uống bia, rượu không?',
    answer:
      'Tuyệt đối không uống bia, rượu hay thức uống có cồn trong vòng ít nhất 24 giờ trước khi hiến máu vì cồn trong máu sẽ làm giảm chất lượng túi máu và gây chóng mặt, tụt huyết áp cho người hiến.',
  },
  {
    id: 7,
    category: 'TRUOC_KHI_HIEN',
    categoryLabel: 'Trước khi hiến máu',
    question: 'Đang uống thuốc cảm cúm hoặc kháng sinh có hiến máu được không?',
    answer:
      'Bạn cần tạm hoãn hiến máu cho đến khi khỏi hẳn bệnh và ngưng dùng thuốc kháng sinh ít nhất 07 ngày để cơ thể đào thải hết dư lượng dược chất.',
  },

  // 3. Sau khi hiến máu
  {
    id: 8,
    category: 'SAU_KHI_HIEN',
    categoryLabel: 'Sau khi hiến máu',
    question: 'Hiến máu xong có bị tăng cân hoặc béo phì không?',
    answer:
      'Hiến máu không trực tiếp làm tăng cân. Tuy nhiên, sau khi hiến máu, tủy xương được kích thích tăng sinh hồng cầu mới làm tăng cảm giác thèm ăn và ngủ ngon hơn. Nếu bạn duy trì chế độ dinh dưỡng cân bằng và tập luyện thể dục đều đặn thì cân nặng sẽ giữ nguyên hoàn toàn bình thường.',
  },
  {
    id: 9,
    category: 'SAU_KHI_HIEN',
    categoryLabel: 'Sau khi hiến máu',
    question: 'Khoảng cách giữa hai lần hiến máu liên tiếp là bao lâu?',
    answer:
      'Khoảng cách an toàn tối thiểu giữa 2 lần hiến Máu toàn phần là 84 ngày (khoảng 12 tuần hay gần 3 tháng). Đối với hiến gạn tiểu cầu, khoảng cách tối thiểu giữa 2 lần là 14 ngày (2 tuần) hoặc 21 ngày.',
    tips: 'Nam giới có thể hiến tối đa 4 lần/năm, nữ giới tối đa 3 lần/năm đối với máu toàn phần.',
  },
  {
    id: 10,
    category: 'SAU_KHI_HIEN',
    categoryLabel: 'Sau khi hiến máu',
    question: 'Nếu vết lấy máu bị bầm tím thì phải xử lý thế nào?',
    answer:
      'Vết bầm tím (tụ máu dưới da) thường do máu thấm ra mô mềm xung quanh tĩnh mạch, lành tính và sẽ tự tan sau 7 - 10 ngày. Trong 24 giờ đầu, hãy chườm lạnh (đá bọc khăn). Từ ngày thứ hai trở đi, chườm ấm để tan máu bầm.',
  },

  // 4. Quyền lợi
  {
    id: 11,
    category: 'QUYEN_LOI',
    categoryLabel: 'Quyền lợi người hiến máu',
    question: 'Giấy chứng nhận hiến máu tình nguyện có giá trị như thế nào?',
    answer:
      'Giấy chứng nhận có giá trị bồi hoàn lượng máu đã hiến hoàn toàn miễn phí tại tất cả bệnh viện công lập trên toàn quốc trong suốt cuộc đời của bạn. Ngoài ra, giấy chứng nhận là căn cứ để khen thưởng danh hiệu Tôn vinh Người hiến máu tiêu biểu.',
    tips: 'Hiện nay hệ thống SmartBlood đã liên thông thẻ hiến máu điện tử giúp bạn không lo bị thất lạc giấy chứng nhận bản cứng.',
  },
  {
    id: 12,
    category: 'QUYEN_LOI',
    categoryLabel: 'Quyền lợi người hiến máu',
    question: 'Máu của tôi được xét nghiệm những chỉ số gì và có được giữ bí mật không?',
    answer:
      'Mỗi đơn vị máu đều được xét nghiệm xác định Nhóm máu (Hệ ABO và Rh) và sàng lọc 5 bệnh truyền nhiễm: HIV, Viêm gan B, Viêm gan C, Giang mai và Sốt rét. Toàn bộ thông tin sức khỏe và kết quả xét nghiệm được bảo mật y tế tuyệt đối theo quy định pháp luật.',
  },
];

export const FaqTab: React.FC<FaqTabProps> = ({
  onSelectTab,
  onOpenAuthModal,
}) => {
  // State Accordion
  const [openIds, setOpenIds] = useState<number[]>([1, 5]); // Mở sẵn câu 1 và 5
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State Mini-tool: Trắc nghiệm điều kiện hiến máu 4 câu Có/Không
  const [quizAnswers, setQuizAnswers] = useState<{
    age: boolean | null;
    weight: boolean | null;
    interval: boolean | null;
    healthy: boolean | null;
  }>({
    age: null,
    weight: null,
    interval: null,
    healthy: null,
  });

  const [hasCheckedQuiz, setHasCheckedQuiz] = useState<boolean>(false);

  // Toggle mở/đóng accordion
  const toggleAccordion = (id: number) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Lọc câu hỏi FAQ
  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchQ = item.question.toLowerCase().includes(q);
        const matchA = item.answer.toLowerCase().includes(q);
        if (!matchQ && !matchA) return false;
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  // Đánh giá kết quả Mini-tool trắc nghiệm
  const isQuizComplete =
    quizAnswers.age !== null &&
    quizAnswers.weight !== null &&
    quizAnswers.interval !== null &&
    quizAnswers.healthy !== null;

  const isEligible =
    quizAnswers.age === true &&
    quizAnswers.weight === true &&
    quizAnswers.interval === true &&
    quizAnswers.healthy === true;

  const handleResetQuiz = () => {
    setQuizAnswers({
      age: null,
      weight: null,
      interval: null,
      healthy: null,
    });
    setHasCheckedQuiz(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. MINI-TOOL TƯƠNG TÁC: KIỂM TRA NHANH ĐIỀU KIỆN HIẾN MÁU */}
      <section className="bg-gradient-to-br from-white via-rose-50/40 to-white p-6 sm:p-8 rounded-[12px] border border-rose-200 shadow-sm relative overflow-hidden">
        <div className="max-w-3xl space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D32F2F] text-white text-xs font-black uppercase tracking-wider shadow-xs">
            <Activity className="w-3.5 h-3.5" />
            <span>Mini-Tool Y Khoa Tương Tác</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kiểm Tra Nhanh Điều Kiện Hiến Máu (Trong 30 Giây)
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Hãy trả lời 4 câu hỏi trắc nghiệm khách quan bên dưới để hệ thống đối soát theo tiêu chuẩn Thông tư Bộ Y Tế.
          </p>
        </div>

        {/* 4 Câu Hỏi Trắc Nghiệm Có / Không */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Câu 1: Độ tuổi */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#D32F2F] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                1
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug">
                Bạn có nằm trong độ tuổi từ <span className="text-[#D32F2F]">18 đến 60 tuổi</span> không?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, age: true });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.age === true
                    ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✓ Có (Đủ tuổi)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, age: false });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.age === false
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕ Không
              </button>
            </div>
          </div>

          {/* Câu 2: Cân nặng */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#D32F2F] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                2
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug">
                Cân nặng của bạn có đạt từ <span className="text-[#D32F2F]">≥ 45 kg</span> (nam) hoặc <span className="text-[#D32F2F]">≥ 42 kg</span> (nữ)?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, weight: true });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.weight === true
                    ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✓ Có (Đủ cân nặng)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, weight: false });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.weight === false
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕ Dưới mức chuẩn
              </button>
            </div>
          </div>

          {/* Câu 3: Khoảng cách giữa 2 lần hiến */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#D32F2F] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                3
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug">
                Lần hiến máu gần nhất cách đây <span className="text-[#D32F2F]">≥ 84 ngày</span> (12 tuần) hoặc bạn chưa từng hiến máu?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, interval: true });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.interval === true
                    ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✓ Có (Đã đủ 84 ngày / Chưa hiến)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, interval: false });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.interval === false
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕ Chưa đủ khoảng cách
              </button>
            </div>
          </div>

          {/* Câu 4: Sức khỏe & Bệnh truyền nhiễm */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-rose-100 text-[#D32F2F] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                4
              </div>
              <div className="text-xs font-bold text-slate-800 leading-snug">
                Bạn hoàn toàn khỏe mạnh, không mắc bệnh lây truyền qua máu và không uống kháng sinh trong 7 ngày qua?
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, healthy: true });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.healthy === true
                    ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✓ Có (Khỏe mạnh)
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuizAnswers({ ...quizAnswers, healthy: false });
                  setHasCheckedQuiz(true);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                  quizAnswers.healthy === false
                    ? 'bg-slate-800 text-white border-slate-800 shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                ✕ Đang ốm / Dùng thuốc
              </button>
            </div>
          </div>
        </div>

        {/* Khối Hiển Thị Kết Quả Đánh Giá Tức Thì */}
        {hasCheckedQuiz && isQuizComplete && (
          <div className="mt-6 pt-6 border-t border-rose-200/70 animate-in fade-in duration-300">
            {isEligible ? (
              /* KẾT QUẢ: ĐỦ ĐIỀU KIỆN */
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full mb-1">
                      <Sparkles className="w-3 h-3" />
                      Chúc mừng bạn!
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-emerald-900">
                      BẠN ĐỦ ĐIỀU KIỆN THAM GIA HIẾN MÁU NHÂN ĐẠO!
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Thể trạng của bạn hoàn toàn sẵn sàng để trao tặng sự sống cho các ca cấp cứu.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetQuiz}
                    className="p-2.5 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-semibold"
                    title="Làm lại trắc nghiệm"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenAuthModal && onOpenAuthModal('register')}
                    className="px-5 py-3 bg-[#D32F2F] hover:bg-[#B71C1C] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Đăng ký hiến máu ngay</span>
                  </button>
                </div>
              </div>
            ) : (
              /* KẾT QUẢ: CHƯA ĐỦ ĐIỀU KIỆN */
              <div className="bg-amber-50 border-2 border-amber-400 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full mb-1">
                      Cần tạm hoãn
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-amber-950">
                      BẠN CHƯA ĐỦ ĐIỀU KIỆN HIẾN MÁU TẠI THỜI ĐIỂM NÀY
                    </h3>
                    <p className="text-xs text-amber-800 mt-0.5 max-w-xl">
                      {!quizAnswers.age && '• Độ tuổi chưa đạt chuẩn 18 - 60 tuổi. '}
                      {!quizAnswers.weight && '• Cân nặng chưa đạt mức an toàn tối thiểu (≥ 42-45kg). '}
                      {!quizAnswers.interval && '• Cần đợi đủ tối thiểu 84 ngày tính từ lần hiến gần nhất. '}
                      {!quizAnswers.healthy && '• Cần nghỉ ngơi phục hồi sức khỏe hoặc ngưng kháng sinh ít nhất 7 ngày.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetQuiz}
                  className="px-4 py-2.5 bg-white border border-amber-300 text-amber-900 font-bold text-xs rounded-xl hover:bg-amber-100/70 transition-all shrink-0 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Kiểm tra lại</span>
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. KHỐI CÂU HỎI THƯỜNG GẶP (ACCORDION FAQ) */}
      <section className="bg-white p-6 sm:p-8 rounded-[12px] border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#D32F2F]" />
              <span>Câu Hỏi Thường Gặp (FAQ)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Giải đáp tất cả thắc mắc phổ biến về sức khỏe, quy chế bồi hoàn và an toàn truyền máu
            </p>
          </div>

          {/* Ô Tìm Kiếm Câu Hỏi */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm câu hỏi thắc mắc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D32F2F]/20 focus:border-[#D32F2F]"
            />
          </div>
        </div>

        {/* Thanh Chọn Danh Mục FAQ */}
        <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-100">
          {[
            { id: 'ALL', label: 'Tất cả câu hỏi' },
            { id: 'DIEU_KIEN', label: 'Điều kiện sức khỏe' },
            { id: 'TRUOC_KHI_HIEN', label: 'Trước khi hiến máu' },
            { id: 'SAU_KHI_HIEN', label: 'Sau khi hiến máu' },
            { id: 'QUYEN_LOI', label: 'Quyền lợi & Bồi hoàn' },
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-[#D32F2F] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Danh Sách Accordions */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Không tìm thấy câu hỏi phù hợp với từ khóa &quot;{searchQuery}&quot;.
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openIds.includes(faq.id);

              return (
                <div
                  key={faq.id}
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isOpen ? 'border-rose-200 bg-rose-50/20 shadow-2xs' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Accordion Header */}
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 focus:outline-none"
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#D32F2F] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                        {faq.categoryLabel}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {faq.question}
                      </h3>
                    </div>

                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-1">
                      {isOpen ? <ChevronUp className="w-4 h-4 text-[#D32F2F]" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {/* Accordion Body */}
                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 text-xs text-slate-700 leading-relaxed border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200">
                      <p>{faq.answer}</p>
                      {faq.tips && (
                        <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <span>
                            <strong>Lời khuyên y tế:</strong> {faq.tips}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default FaqTab;
