import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import {
  Activity,
  ArrowRight,
  Award,
  BadgeCheck,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Droplet,
  Droplets,
  HeartPulse,
  FileText,
  Gift,
  Heart,
  HeartHandshake,
  Info,
  MapPin,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from 'lucide-react';

const donationSteps = [
  {
    step: '01',
    title: 'Đăng ký & khai báo',
    time: '5 - 10 phút',
    badge: 'CCCD / VNeID',
    icon: FileText,
    image:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=90',
    description:
      'Xuất trình CCCD hoặc VNeID, hoàn tất bảng câu hỏi tiền sử sức khỏe tại quầy tiếp nhận.',
  },
  {
    step: '02',
    title: 'Khám sàng lọc',
    time: '10 - 15 phút',
    badge: 'Đo huyết áp & sinh hiệu',
    icon: Stethoscope,
    image:
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=90',
    description:
      'Bác sĩ kiểm tra huyết áp, nhịp tim, khám lâm sàng và đánh giá điều kiện sức khỏe.',
  },
  {
    step: '03',
    title: 'Hiến máu an toàn',
    time: '5 - 10 phút',
    badge: 'Dụng cụ vô trùng',
    icon: Heart,
    image:
      'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1000&q=90',
    description:
      'Thư giãn trên ghế y tế chuyên dụng trong quy trình thu nhận máu an toàn.',
  },
  {
    step: '04',
    title: 'Nghỉ ngơi & hồi phục',
    time: '15 - 20 phút',
    badge: 'Trà đường & ăn nhẹ',
    icon: Coffee,
    image:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1000&q=90',
    description:
      'Nghỉ tại chỗ, dùng đồ ăn nhẹ và nước uống để cơ thể hồi phục sau khi hiến.',
  },
  {
    step: '05',
    title: 'Nhận chứng nhận',
    time: '2 - 5 phút',
    badge: 'Ghi nhận đóng góp',
    icon: Award,
    image:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=90',
    description:
      'Nhận giấy chứng nhận hiến máu tình nguyện và thông tin về quyền lợi người hiến.',
  },
];

const compatibility: Record<
  string,
  { gives: string[]; receives: string[]; description: string }
> = {
  'O-': {
    gives: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receives: ['O-'],
    description:
      'Hồng cầu O- có thể được sử dụng cho nhiều nhóm máu trong cấp cứu. Người mang nhóm O- chỉ có thể nhận hồng cầu O-.',
  },
  'O+': {
    gives: ['O+', 'A+', 'B+', 'AB+'],
    receives: ['O+', 'O-'],
    description:
      'O+ là nhóm máu phổ biến và có thể hiến hồng cầu cho các nhóm Rh dương tính phù hợp.',
  },
  'A-': {
    gives: ['A-', 'A+', 'AB-', 'AB+'],
    receives: ['A-', 'O-'],
    description:
      'Người mang nhóm A- có thể hiến hồng cầu cho nhóm A và AB, nhưng chỉ nhận từ A- hoặc O-.',
  },
  'A+': {
    gives: ['A+', 'AB+'],
    receives: ['A+', 'A-', 'O+', 'O-'],
    description:
      'Người mang nhóm A+ có thể nhận hồng cầu từ nhóm A hoặc O với yếu tố Rh phù hợp.',
  },
  'B-': {
    gives: ['B-', 'B+', 'AB-', 'AB+'],
    receives: ['B-', 'O-'],
    description:
      'Người mang nhóm B- có thể hiến hồng cầu cho nhóm B và AB, và nhận từ B- hoặc O-.',
  },
  'B+': {
    gives: ['B+', 'AB+'],
    receives: ['B+', 'B-', 'O+', 'O-'],
    description:
      'Người mang nhóm B+ có thể nhận hồng cầu từ nhóm B hoặc O với yếu tố Rh phù hợp.',
  },
  'AB-': {
    gives: ['AB-', 'AB+'],
    receives: ['AB-', 'A-', 'B-', 'O-'],
    description:
      'AB- là nhóm máu ít gặp; người mang nhóm này có thể nhận hồng cầu từ các nhóm Rh âm phù hợp.',
  },
  'AB+': {
    gives: ['AB+'],
    receives: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    description:
      'Người mang nhóm AB+ có thể nhận hồng cầu từ tất cả các nhóm. Việc truyền máu vẫn cần được nhân viên y tế kiểm tra.',
  },
};

const upcomingEvents = [
  {
    title: 'Ngày Hội Giọt Hồng Tình Nguyện',
    location: 'Nhà Văn hóa Thanh Niên, TP. Hồ Chí Minh',
    daysFromNow: 2,
    startHour: 8,
    endHour: 11,
    registered: 185,
    capacity: 300,
  },
  {
    title: 'Chuyến Xe Hiến Máu Lưu Động',
    location: 'Trung tâm hiến máu nhân đạo',
    daysFromNow: 4,
    startHour: 8,
    endHour: 12,
    registered: 142,
    capacity: 200,
  },
  {
    title: 'Chiến Dịch Tiếp Máu Cứu Người',
    location: 'Bệnh viện Đại học Y Dược',
    daysFromNow: 6,
    startHour: 7,
    endHour: 13,
    registered: 320,
    capacity: 450,
  },
];

const iconColorClasses = {
  rose: 'border-rose-100 bg-rose-50 text-rose-600',
  emerald: 'border-emerald-100 bg-emerald-50 text-emerald-600',
  blue: 'border-blue-100 bg-blue-50 text-blue-600',
  amber: 'border-amber-100 bg-amber-50 text-amber-600',
};

interface LiveHomeStats {
  activeEmergencyCount: number;
  criticalEmergencyCount: number;
  requestedBloodUnits: number;
  upcomingEventCount: number;
}

interface EmergencyStatsItem {
  trangThai?: string;
  mucDoKhanCap?: string;
  soLuongCanMl?: number;
  soLuongTui?: number;
}

interface DonationEventStatsItem {
  thoiGianBatDau?: string;
  trangThai?: string;
}

export const HomePage: React.FC = () => {
  const [selectedBloodType, setSelectedBloodType] = useState('O+');
  const bloodInfo = compatibility[selectedBloodType];
  const [liveStats, setLiveStats] = useState<LiveHomeStats | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState(false);
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;

    const refreshStats = async () => {
      try {
        const [emergencyResponse, eventResponse] = await Promise.all([
          axiosClient.get('/emergency-requests/public'),
          axiosClient.get('/donation-events?limit=100'),
        ]);

        const emergencyItems = emergencyResponse.data?.data;
        const eventItems =
          eventResponse.data?.data?.items ??
          eventResponse.data?.items ??
          eventResponse.data?.data;

        if (
          emergencyResponse.data?.success !== true ||
          !Array.isArray(emergencyItems) ||
          eventResponse.data?.success !== true ||
          !Array.isArray(eventItems)
        ) {
          throw new Error('Dữ liệu thống kê từ máy chủ không hợp lệ.');
        }

        const activeEmergencies = (emergencyItems as EmergencyStatsItem[]).filter(
          (item) => item.trangThai === 'DangCho' || item.trangThai === 'DangDieuPhoi',
        );
        const criticalEmergencies = activeEmergencies.filter(
          (item) =>
            item.mucDoKhanCap === 'NGUY_CAP' ||
            item.mucDoKhanCap === 'RAT_KHAN',
        );
        const requestedBloodUnits = activeEmergencies.reduce((total, item) => {
          const units = Number(item.soLuongTui);
          const milliliters = Number(item.soLuongCanMl);
          return total + (units > 0 ? units : milliliters > 0 ? Math.ceil(milliliters / 350) : 0);
        }, 0);
        const now = Date.now();
        const upcomingEventCount = (eventItems as DonationEventStatsItem[]).filter(
          (item) => {
            const startTime = item.thoiGianBatDau
              ? new Date(item.thoiGianBatDau).getTime()
              : Number.NaN;
            return (
              Number.isFinite(startTime) &&
              startTime >= now &&
              item.trangThai !== 'DaHuy' &&
              item.trangThai !== 'KetThuc'
            );
          },
        ).length;

        if (isMounted) {
          setLiveStats({
            activeEmergencyCount: activeEmergencies.length,
            criticalEmergencyCount: criticalEmergencies.length,
            requestedBloodUnits,
            upcomingEventCount,
          });
          setStatsUpdatedAt(new Date());
          setStatsError(false);
        }
      } catch (error) {
        console.error('Không thể cập nhật thống kê trang chủ:', error);
        if (isMounted) setStatsError(true);
      } finally {
        if (isMounted) setIsStatsLoading(false);
      }
    };

    void refreshStats();
    const intervalId = window.setInterval(() => {
      void refreshStats();
    }, 30_000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-900/30 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 text-white shadow-xl">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(211,47,47,0.25),transparent_60%)]" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
        <div className="relative grid items-center gap-8 px-6 py-8 sm:px-8 sm:py-10 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-12">
          <div className="relative z-10 lg:col-span-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-500/10 px-3.5 py-2 text-[11px] font-extrabold tracking-wide text-rose-100 shadow-sm shadow-rose-950/20">
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>Mỗi giọt máu cho đi, một cuộc đời ở lại</span>
            </div>
            <h1 className="mb-5 max-w-[680px] text-[2.15rem] font-black leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[2.7rem] xl:text-[3.15rem]">
              Kết nối hiến máu,
              <br />
              <span className="text-white">điều phối cấp cứu</span>
              <br />
              <span className="inline-block bg-gradient-to-r from-rose-200 via-rose-300 to-orange-300 bg-clip-text pb-1 text-transparent">
                nhanh chóng, kịp thời
              </span>
            </h1>
            <p className="mb-7 max-w-xl text-sm leading-7 text-rose-100/80 sm:text-base">
              Nền tảng kết nối người hiến máu với bệnh viện, giúp điều phối nguồn máu
              khẩn cấp nhanh hơn và theo dõi nhu cầu trên toàn hệ thống.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-red-950/35 transition duration-200 hover:-translate-y-0.5 hover:from-red-400 hover:to-rose-500"
              >
                <Heart className="h-5 w-5 fill-white" />
                Đăng ký hiến máu ngay
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/emergency"
                className="inline-flex items-center gap-2.5 rounded-xl border border-rose-200/20 bg-white/[0.07] px-5 py-3.5 text-sm font-bold text-rose-50 backdrop-blur transition duration-200 hover:border-rose-200/50 hover:bg-white/[0.13]"
              >
                <Droplet className="h-5 w-5 text-rose-300" />
                Xem yêu cầu cấp cứu
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2 border-t border-white/10 pt-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.07] px-3 py-2 text-[11px] font-semibold text-emerald-50/90">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                An toàn y khoa
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-3 py-2 text-[11px] font-semibold text-amber-50/90">
                <Clock className="h-4 w-4 shrink-0 text-amber-300" />
                Điều phối kịp thời
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/15 bg-rose-300/[0.07] px-3 py-2 text-[11px] font-semibold text-rose-50/90">
                <HeartHandshake className="h-4 w-4 shrink-0 text-rose-300" />
                Cộng đồng sẻ chia
              </div>
            </div>
          </div>

          <div className="relative mx-auto hidden h-[360px] w-full max-w-[420px] items-center justify-center lg:col-span-5 lg:flex">
            <div className="absolute h-[300px] w-[300px] rounded-full border border-white/10" />
            <div className="absolute h-[230px] w-[230px] rounded-full border border-dashed border-rose-300/25" />
            <div className="absolute h-[170px] w-[170px] rounded-full bg-rose-500/10 blur-2xl" />

            <div className="relative flex h-44 w-44 items-center justify-center rounded-full border border-white/15 bg-gradient-to-br from-rose-500/25 via-red-950/80 to-slate-950/90 shadow-[0_0_80px_rgba(244,63,94,0.3)] backdrop-blur-xl">
              <div className="absolute inset-3 rounded-full border border-white/10" />
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-700 shadow-xl shadow-red-950/60">
                <Droplet className="h-16 w-16 fill-white text-white drop-shadow-lg" />
              </div>
              <span className="absolute -right-1 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-rose-300 shadow-lg">
                <Heart className="h-4 w-4 fill-current" />
              </span>
              <span className="absolute -bottom-1 left-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-slate-900 text-emerald-300 shadow-lg">
                <ShieldCheck className="h-4 w-4" />
              </span>
            </div>

            <div className="absolute right-0 top-8 flex items-center gap-2 rounded-full border border-emerald-300/20 bg-slate-950/75 px-3 py-2 text-[11px] font-bold text-emerald-200 shadow-xl backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Mạng lưới đang hoạt động
            </div>

            <div className="absolute bottom-9 left-0 w-56 rounded-2xl border border-white/15 bg-slate-950/75 p-4 shadow-2xl backdrop-blur-xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-300">
                    <Activity className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">ĐIỀU PHỐI</p>
                    <p className="text-xs font-extrabold text-white">Kết nối cứu trợ</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-rose-300" />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-300">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 font-black text-white">
                  O-
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-red-400 via-rose-300 to-emerald-400" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-200">
                  <Heart className="h-3.5 w-3.5 fill-current" />
                </span>
                <span>Bệnh viện</span>
              </div>
            </div>

            <div className="absolute left-2 top-14 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 shadow-xl backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-amber-300" />
                <div>
                  <p className="text-sm font-black text-white">24/7</p>
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-300">
                    Sẵn sàng hỗ trợ
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden rounded-2xl sm:rounded-3xl border border-rose-100/90 bg-gradient-to-br from-white via-rose-50/70 to-orange-50/60 p-4 sm:p-6 shadow-md shadow-rose-100/40">
        <div className="pointer-events-none absolute -right-16 -top-20 -z-10 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 -z-10 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="pointer-events-none absolute right-6 top-8 hidden rotate-12 text-rose-200/40 sm:block">
          <HeartPulse className="h-52 w-52" strokeWidth={1} />
        </div>

        <div className="relative mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-2 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-rose-700 shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Bảng tin điều phối trực tiếp
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
              Tình Hình Điều Phối Hiện Tại
            </h2>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm">
            {statsError
              ? statsUpdatedAt
                ? `Chưa thể đồng bộ mới. Dữ liệu gần nhất lúc ${statsUpdatedAt.toLocaleTimeString('vi-VN')}.`
                : 'Chưa thể tải dữ liệu từ máy chủ. Số liệu sẽ tự thử cập nhật lại.'
              : statsUpdatedAt
                ? `Dữ liệu thật từ hệ thống · Cập nhật lúc ${statsUpdatedAt.toLocaleTimeString('vi-VN')} · Tự làm mới mỗi 30 giây`
                : 'Đang tải dữ liệu điều phối từ hệ thống...'}
            </p>
          </div>
          <div className="flex w-fit items-center gap-2 rounded-xl border border-emerald-200 bg-white/95 px-3 py-1.5 text-xs font-semibold text-emerald-800 shadow-2xs">
            <BadgeCheck className="h-4 w-4 text-emerald-600" />
            Dữ liệu từ hệ thống
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: 'Ca cấp cứu đang mở',
              value: liveStats ? `${liveStats.activeEmergencyCount} ca` : null,
              note: 'Đang chờ hoặc được điều phối',
              icon: HeartHandshake,
              color: 'rose',
            },
            {
              label: 'Ca báo động đỏ',
              value: liveStats ? `${liveStats.criticalEmergencyCount} ca` : null,
              note: 'Trong các ca cấp cứu đang mở',
              icon: Activity,
              color: 'amber',
            },
            {
              label: 'Lượng máu đang cần',
              value: liveStats ? `${liveStats.requestedBloodUnits} đơn vị` : null,
              note: 'Ước tính theo đơn vị 350 ml',
              icon: Droplets,
              color: 'blue',
            },
            {
              label: 'Sự kiện hiến sắp tới',
              value: liveStats ? `${liveStats.upcomingEventCount} sự kiện` : null,
              note: 'Sự kiện chưa hủy, có thời gian trong tương lai',
              icon: Calendar,
              color: 'emerald',
            },
          ].map(({ label, value, note, icon: Icon, color }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl border bg-white/90 p-4 sm:p-5 shadow-2xs transition duration-300 hover:-translate-y-0.5 hover:shadow-md ${color === 'rose' ? 'border-rose-100 hover:shadow-rose-100' : color === 'amber' ? 'border-amber-100 hover:shadow-amber-100' : color === 'blue' ? 'border-sky-100 hover:shadow-sky-100' : 'border-emerald-100 hover:shadow-emerald-100'}`}
            >
              <div className={`absolute -right-5 -top-6 h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-150 ${color === 'rose' ? 'bg-rose-100/70' : color === 'amber' ? 'bg-amber-100/70' : color === 'blue' ? 'bg-sky-100/70' : 'bg-emerald-100/70'}`} />
              <div className="relative mb-3.5 flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-2xs ${color === 'rose' ? 'bg-gradient-to-br from-rose-500 to-red-600 text-white' : color === 'amber' ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' : color === 'blue' ? 'bg-gradient-to-br from-sky-400 to-blue-600 text-white' : 'bg-gradient-to-br from-emerald-400 to-teal-600 text-white'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${color === 'rose' ? 'border-rose-200 bg-rose-50 text-rose-700' : color === 'amber' ? 'border-amber-200 bg-amber-50 text-amber-700' : color === 'blue' ? 'border-sky-200 bg-sky-50 text-sky-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}
                >
                  {color === 'rose' ? 'Cấp cứu' : color === 'amber' ? 'Khẩn cấp' : color === 'blue' ? 'Nhu cầu' : 'Sự kiện'}
                </span>
              </div>
              <div className="relative text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {value ?? (isStatsLoading ? '...' : '—')}
              </div>
              <p className="relative mt-1 text-xs font-medium leading-relaxed text-slate-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 md:p-7 shadow-xs">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
          <div className="space-y-3.5 lg:col-span-7">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-xs font-bold text-red-700">
              <Droplet className="h-3.5 w-3.5 fill-current" />
              Đăng ký đơn giản • Lan tỏa yêu thương
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight tracking-tight text-slate-900">
              Đăng Ký Tham Gia{' '}
              <span className="text-red-600">Hiến Máu Tình Nguyện</span>
            </h2>
            <p className="max-w-xl text-xs sm:text-sm leading-relaxed text-slate-600">
              Mỗi lần hiến máu là một cơ hội giúp đỡ người bệnh. Đăng ký tài
              khoản để đặt lịch, theo dõi lịch sử hiến máu và nhận thông tin từ
              các điểm tiếp nhận.
            </p>
            <ul className="grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Theo dõi lịch sử hiến máu
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Tìm điểm hiến phù hợp
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Nhận thông báo lịch hẹn
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Kết nối khi có nhu cầu khẩn
              </li>
            </ul>
            <div className="pt-1">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:bg-red-700"
              >
                Đăng ký hiến máu
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-rose-100/70 bg-gradient-to-br from-rose-50/70 to-slate-50/70 p-5 sm:p-6 lg:col-span-5">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-red-600 shadow-2xs">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Bạn có thể cứu sống nhiều người
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">
              Một đơn vị máu sau khi được tiếp nhận có thể được điều chế thành
              nhiều chế phẩm, hỗ trợ những bệnh nhân có nhu cầu điều trị khác
              nhau.
            </p>
            <Link
              to="/donate"
              className="mt-3.5 inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-600 hover:text-red-700"
            >
              Tìm hiểu điều kiện hiến máu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3.5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              Các Đợt Hiến Máu Sắp Diễn Ra
            </h2>
            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              Khám phá các điểm hiến máu và ngày hội trong thời gian tới.
            </p>
          </div>
          <Link
            to="/events"
            className="inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
          >
            Xem tất cả sự kiện <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
          {upcomingEvents.map((event) => {
            const eventDate = new Date(
              Date.now() + event.daysFromNow * 24 * 60 * 60 * 1000,
            );
            const progress = Math.round(
              (event.registered / event.capacity) * 100,
            );
            return (
              <article
                key={event.title}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:border-rose-300 hover:shadow-md"
              >
                <div>
                  <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-extrabold text-red-600">
                    Sắp diễn ra
                  </span>
                  <h3 className="mt-2.5 font-extrabold leading-snug text-slate-900">
                    {event.title}
                  </h3>
                  <div className="mt-2.5 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 shrink-0 text-red-600" />
                      {eventDate.toLocaleDateString('vi-VN', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                      {String(event.startHour).padStart(2, '0')}:00 -{' '}
                      {String(event.endHour).padStart(2, '0')}:00
                    </p>
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      {event.location}
                    </p>
                  </div>
                </div>
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>Đã đăng ký</span>
                    <span className="font-bold text-slate-800">
                      {event.registered} / {event.capacity}
                    </span>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-slate-100"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Đã đăng ký ${progress}%`}
                  >
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <Link
                    to="/events"
                    className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-700"
                  >
                    Đăng ký tham gia <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION: QUY TRÌNH 5 BƯỚC HIẾN MÁU (Nền xám nhạt cao cấp làm nổi bật card trắng) */}
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-100/70 p-5 sm:p-6 md:p-7 shadow-xs space-y-4 sm:space-y-5">
        <div className="max-w-3xl">
          <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-black text-red-700 shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5" />
            Tiêu chuẩn y tế an toàn
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Quy Trình 5 Bước Hiến Máu
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Quy trình khép kín được nhân viên y tế hướng dẫn và theo dõi chặt chẽ tại tất cả các điểm tiếp nhận.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
          {donationSteps.map((step) => {
            const Icon = step.icon;
            return (
              <article
                key={step.step}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg"
              >
                <div>
                  <div className="relative h-36 overflow-hidden bg-slate-100 sm:h-38">
                    <img
                      src={step.image}
                      alt={step.title}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/15 to-transparent" />
                    <span className="absolute left-2.5 top-2.5 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white shadow-md">
                      Bước {step.step}
                    </span>
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 text-[10px] font-bold text-white">
                      <span className="inline-flex items-center gap-1 rounded-md bg-black/50 px-1.5 py-0.5 backdrop-blur-xs">
                        <Clock className="h-3 w-3 text-amber-300" />
                        {step.time}
                      </span>
                      <span className="rounded-md bg-red-600/90 px-1.5 py-0.5 font-black">
                        {step.badge}
                      </span>
                    </div>
                  </div>
                  <div className="p-3.5 sm:p-4">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-red-600 shadow-2xs">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <h3 className="text-xs sm:text-sm font-black leading-snug text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-[11px] sm:text-xs leading-relaxed text-slate-600 font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-rose-200/70 bg-white p-3.5 sm:p-4 text-center sm:flex-row sm:text-left shadow-2xs">
          <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Sparkles className="h-4 w-4 shrink-0 text-red-600" />
            Nhân viên y tế sẽ luôn đồng hành, hướng dẫn và kiểm tra sức khỏe của bạn trong suốt quá trình.
          </p>
          <Link
            to="/register"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white shadow-md shadow-red-500/20 transition hover:bg-red-700 active:scale-95"
          >
            <Heart className="h-3.5 w-3.5 fill-white" />
            <span>Đặt lịch hiến máu ngay</span>
          </Link>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white p-5 sm:p-6 md:p-7 shadow-xs">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
            <Droplet className="h-3.5 w-3.5 fill-current" />
            Kiến thức y khoa cộng đồng
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Tra Cứu Khả Năng Tương Thích Nhóm Máu
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Chọn nhóm máu để xem thông tin tham khảo về khả năng hiến và nhận
            hồng cầu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(compatibility).map((type) => (
            <button
              key={type}
              type="button"
              aria-pressed={selectedBloodType === type}
              onClick={() => setSelectedBloodType(type)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-black transition sm:text-sm ${
                selectedBloodType === type
                  ? 'scale-105 bg-red-600 text-white shadow-md shadow-rose-900/20'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Nhóm {type}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="space-y-3 lg:col-span-7">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 sm:p-4">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
                <Check className="h-4 w-4 text-emerald-600" />
                Có thể hiến hồng cầu cho
              </h3>
              <div className="flex flex-wrap gap-2">
                {bloodInfo.gives.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-black text-emerald-800"
                  >
                    <Droplet className="h-3.5 w-3.5 fill-current text-emerald-600" />
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 sm:p-4">
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-blue-800">
                <Droplets className="h-4 w-4 text-blue-600" />
                Có thể nhận hồng cầu từ
              </h3>
              <div className="flex flex-wrap gap-2">
                {bloodInfo.receives.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-white px-3 py-1.5 text-xs font-black text-blue-800"
                  >
                    <Droplet className="h-3.5 w-3.5 fill-current text-blue-600" />
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-between gap-3.5 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5 lg:col-span-5">
            <div>
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-extrabold text-red-700">
                Nhóm máu {selectedBloodType}
              </span>
              <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-slate-600">
                {bloodInfo.description}
              </p>
              <p className="mt-2.5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Thông tin chỉ mang tính tham khảo. Việc truyền máu cần được
                đánh giá và xét nghiệm bởi nhân viên y tế.
              </p>
            </div>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
            >
              <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
              Đăng ký trở thành người hiến
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3.5">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
            <HeartHandshake className="h-3.5 w-3.5" />
            Cùng sẻ chia sự sống
          </span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Quyền Lợi Khi Tham Gia Hiến Máu
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: ShieldCheck,
              title: 'Được chăm sóc y tế',
              description:
                'Được tư vấn và kiểm tra sức khỏe trước khi hiến máu tại điểm tiếp nhận.',
              color: 'emerald',
            },
            {
              icon: Stethoscope,
              title: 'Theo dõi sức khỏe',
              description:
                'Nhân viên y tế hướng dẫn, theo dõi trong và sau quá trình hiến máu.',
              color: 'blue',
            },
            {
              icon: Activity,
              title: 'Lan tỏa điều tích cực',
              description:
                'Đóng góp thiết thực cho nguồn máu phục vụ cấp cứu và điều trị.',
              color: 'rose',
            },
            {
              icon: Gift,
              title: 'Ghi nhận đóng góp',
              description:
                'Nhận thông tin ghi nhận và chứng nhận theo quy định tại điểm hiến.',
              color: 'amber',
            },
          ].map(({ icon: Icon, title, description, color }) => (
            <article
              key={title}
              className="space-y-2.5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs transition hover:shadow-md"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl border ${iconColorClasses[color]}`}
              >
                <Icon className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{title}</h3>
              <p className="text-[11px] sm:text-xs leading-relaxed text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION: LƯU Ý TRƯỚC & SAU HIẾN MÁU (Nền xám nhạt cao cấp làm nổi bật card trắng) */}
      <section className="rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-100/70 p-5 sm:p-6 md:p-7 shadow-xs space-y-4 sm:space-y-5">
        <div>
          <span className="mb-1.5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-black text-slate-800 shadow-2xs">
            <Info className="h-3.5 w-3.5 text-red-600" />
            Hướng dẫn sức khỏe an toàn
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Lưu Ý Trước & Sau Khi Hiến Máu
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
            Tuân thủ đúng các khuyến nghị y khoa giúp cơ thể phục hồi nhanh chóng và tối ưu chất lượng máu hiến tặng.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <article className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="border-b border-slate-100 pb-2.5 font-black text-slate-900 text-sm sm:text-base flex items-center justify-between">
              <span>Trước khi hiến máu</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider">Chuẩn bị</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Ngủ đủ giấc (ít nhất 6 tiếng vào đêm trước) và giữ tinh thần thoải mái.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Ăn nhẹ trước khi hiến máu, tránh thức ăn nhiều dầu mỡ và không uống rượu bia trong 24 giờ.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Uống nhiều nước (300 - 500ml) và mang theo CCCD/VNeID hoặc giấy tờ tùy thân hợp lệ.</span>
              </li>
            </ul>
          </article>
          <article className="space-y-3.5 rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-shadow">
            <h3 className="border-b border-slate-100 pb-2.5 font-black text-slate-900 text-sm sm:text-base flex items-center justify-between">
              <span>Sau khi hiến máu</span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 uppercase tracking-wider">Phục hồi</span>
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm leading-relaxed text-slate-700 font-medium">
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Nghỉ ngơi tại điểm hiến tối thiểu 15 - 20 phút theo hướng dẫn chuyên môn của bác sĩ.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Uống nhiều nước, ăn uống đủ chất và tránh lao động nặng, thể thao cường độ cao trong ngày.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 stroke-[3]" />
                <span>Giữ băng ép vết tiêm sạch sẽ và liên hệ ngay cơ sở y tế nếu có dấu hiệu chóng mặt, mệt mỏi.</span>
              </li>
            </ul>
          </article>
        </div>
      </section>

      {/* SECTION: KHỐI CTA ĐỎ RỰC RỠ NỐI LIỀN DARK FOOTER */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-red-700 via-rose-600 to-red-700 px-6 py-8 sm:px-8 sm:py-10 text-white shadow-xl shadow-red-950/20 border border-red-500/40">
        {/* Ambient glow blobs */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-rose-400/20 blur-3xl" />
        <div className="pointer-events-none absolute right-8 bottom-0 opacity-10 hidden md:block">
          <Heart className="w-64 h-64 fill-white" />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <div className="max-w-2xl space-y-2.5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black uppercase tracking-wider text-rose-100 backdrop-blur-sm border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Chung tay vì sự sống
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Chung tay để không ai phải chờ máu trong cơn nguy kịch
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 leading-relaxed max-w-xl font-medium">
              Đăng ký hiến máu tình nguyện ngay hôm nay hoặc tra cứu mạng lưới điểm tiếp nhận gần bạn nhất trên bản đồ y tế GIS.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-xs sm:text-sm font-black text-red-700 shadow-lg shadow-red-950/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-50 active:scale-95"
            >
              <Heart className="h-4 w-4 fill-red-600 text-red-600" />
              <span>Đăng ký hiến máu ngay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-5 py-3 text-xs sm:text-sm font-black text-white backdrop-blur-md transition-all duration-200 hover:bg-white/20 active:scale-95"
            >
              <MapPin className="h-4 w-4 text-rose-200" />
              <span>Tìm điểm hiến máu</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
