import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { 
  Truck, 
  AlertOctagon, 
  Siren, 
  Sparkles, 
  X, 
  ArrowRight,
  Package,
  Droplet,
  RefreshCw,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  Navigation,
  PhoneCall,
  Copy
} from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosClient } from '../../api/axiosClient';
import { useEmergency } from '../../contexts/EmergencyContext';
import { useCallModal } from '../../contexts/CallModalContext';
import { BloodGroup, DispatchRecordItem, BloodStockSummary } from '../../types';
import { isValidPhoneNumber, sanitizeDigits } from '../../utils/inputValidation';

// Ma trận tương thích truyền máu y khoa
const BLOOD_COMPATIBILITY_MAP: Record<BloodGroup, BloodGroup[]> = {
  'O-': ['O-'],
  'O+': ['O+', 'O-'],
  'A-': ['A-', 'O-'],
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
};

const ALL_BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

const POPULAR_HOSPITALS = [
  'Bệnh viện Chợ Rẫy (Khoa Cấp Cứu)',
  'Bệnh viện Từ Dũ (Khoa Cấp Cứu Sản)',
  'Bệnh viện Thống Nhất (Khoa Cấp Cứu)',
  'Viện Tim TP.HCM (Khoa Ngoại Tim)',
  'Bệnh viện Nhân Dân 115 (Khoa Đột Quỵ)',
  'Bệnh viện Hùng Vương (Cấp Cứu Sản)',
  'Bệnh viện Nhi Đồng 1 (Khoa Hồi Sức Tích Cực)',
];

export const DispatchPage: React.FC = () => {
  // Tabs: 'QUEUE' (Ca cấp cứu chờ xuất kho) | 'DISPATCHES' (Đội xe 115 đang vận chuyển)
  const [activeTab, setActiveTab] = useState<'QUEUE' | 'DISPATCHES'>('QUEUE');

  // Database Data States
  const [requests, setRequests] = useState<any[]>([]);
  const [inventories, setInventories] = useState<any[]>([]);
  const [stockSummaries, setStockSummaries] = useState<BloodStockSummary[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { openCallModal } = useCallModal();

  // Modal 1: Điều phối theo ca cấp cứu có sẵn
  const [selectedEmergency, setSelectedEmergency] = useState<any | null>(null);
  const [chosenBloodType, setChosenBloodType] = useState<BloodGroup>('O+');
  const [selectedLotIds, setSelectedLotIds] = useState<number[]>([]);
  const [dispatchVolumeMl, setDispatchVolumeMl] = useState<number>(700);
  const [ambulanceCode, setAmbulanceCode] = useState('51B-115.89 (Đội Cấp Cứu 115 Chợ Rẫy)');
  const [driverName, setDriverName] = useState('Tài xế Phan Quốc Hoàng');
  const [driverPhone, setDriverPhone] = useState('0933888999');
  const [etaMinutes, setEtaMinutes] = useState<number>(20);
  const [dispatchNote, setDispatchNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal 2: Tạo lệnh điều phối xe cứu trợ & xuất kho trực tiếp (Direct Dispatch)
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [directHospital, setDirectHospital] = useState(POPULAR_HOSPITALS[0]);
  const [directBloodGroup, setDirectBloodGroup] = useState<BloodGroup>('O+');
  const [directComponent, setDirectComponent] = useState('ToanPhan');
  const [directVolumeMl, setDirectVolumeMl] = useState<number>(700);
  const [directLotId, setDirectLotId] = useState<number | undefined>(undefined);
  const [directAmbulance, setDirectAmbulance] = useState('51B-115.22 (Trung Tâm Điều Phối Khẩn Cấp)');
  const [directDriver, setDirectDriver] = useState('Tài xế Lê Minh Trí');
  const [directDriverPhone, setDirectDriverPhone] = useState('0909115115');
  const [directEta, setDirectEta] = useState<number>(15);
  const [directNote, setDirectNote] = useState('Lệnh xuất kho chi viện máu hỏa tốc');

  const { emergencyList } = useEmergency();

  // Tải toàn bộ dữ liệu thực tế từ Database thông qua Backend API
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      const [reqRes, invRes, sumRes, dispRes] = await Promise.allSettled([
        axiosClient.get('/emergency-requests', { params: { limit: 50 } }),
        axiosClient.get('/blood-inventories', { params: { limit: 100 } }),
        axiosClient.get('/blood-inventories/summary'),
        axiosClient.get('/emergency-requests/dispatches', { params: { limit: 50 } }),
      ]);

      if (reqRes.status === 'fulfilled' && reqRes.value.data) {
        const rawReqs = reqRes.value.data?.data?.items || reqRes.value.data?.data || reqRes.value.data?.items || [];
        if (Array.isArray(rawReqs) && rawReqs.length > 0) {
          setRequests(rawReqs);
        } else {
          try {
            const pubRes = await axiosClient.get('/emergency-requests/public');
            if (Array.isArray(pubRes.data?.data)) {
              setRequests(pubRes.data.data);
            }
          } catch {}
        }
      } else {
        try {
          const pubRes = await axiosClient.get('/emergency-requests/public');
          if (Array.isArray(pubRes.data?.data)) {
            setRequests(pubRes.data.data);
          }
        } catch {}
      }

      if (invRes.status === 'fulfilled' && invRes.value.data) {
        const rawInvs = invRes.value.data?.data?.items || invRes.value.data?.items || (Array.isArray(invRes.value.data) ? invRes.value.data : []);
        setInventories(rawInvs);
      }

      if (sumRes.status === 'fulfilled' && sumRes.value.data) {
        const rawSum = sumRes.value.data?.data || sumRes.value.data || [];
        setStockSummaries(Array.isArray(rawSum) ? rawSum : []);
      }

      if (dispRes.status === 'fulfilled' && dispRes.value.data) {
        const rawDisp = dispRes.value.data?.data?.items || dispRes.value.data?.items || (Array.isArray(dispRes.value.data) ? dispRes.value.data : []);
        setDispatches(rawDisp);
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu điều phối từ backend.');
    } finally {
      setIsLoading(false);
    }
  };

  // Tự động tải dữ liệu ban đầu và thăm dò định kỳ mỗi 5 giây để luôn cập nhật tức thì
  useEffect(() => {
    fetchAllData();
    const interval = setInterval(() => {
      fetchAllData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cập nhật ngay khi danh sách ca cấp cứu trong Context có sự kiện mới
  useEffect(() => {
    fetchAllData();
  }, [emergencyList]);

  // Danh sách các ca chờ xuất kho
  const pendingRequests = useMemo(() => {
    return requests.filter((r) => r.trangThai === 'DangCho' || r.trangThai === 'DangDieuPhoi');
  }, [requests]);

  const criticalPendingCount = useMemo(() => {
    return pendingRequests.filter((r) => r.mucDoKhanCap === 'NGUY_CAP' || r.mucDoKhanCap === 'RAT_KHAN').length;
  }, [pendingRequests]);

  // Tra cứu lượng tồn kho hiện tại theo từng nhóm máu
  const getAvailableStockMl = (bloodType: string): number => {
    const summary = stockSummaries.find((s) => (s.nhomMau || s.bloodGroup) === bloodType);
    if (summary && summary.tongMl !== undefined) return summary.tongMl;
    const items = inventories.filter((i) => i.nhomMau === bloodType);
    return items.reduce((sum, item) => sum + (Number(item.soLuongConLaiMl) || 0), 0);
  };

  // Mở modal điều phối xuất kho cho ca cụ thể
  const handleOpenDispatch = (item: any) => {
    setSelectedEmergency(item);
    const reqBlood = (item.nhomMauCan || item.bloodType || 'O+') as BloodGroup;
    setChosenBloodType(reqBlood);
    
    // Đặt số lượng xuất mặc định bằng đúng số lượng yêu cầu của ca bệnh
    const neededMl = Number(item.soLuongCanMl) || (item.unitsNeeded ? item.unitsNeeded * 350 : 700);
    setDispatchVolumeMl(neededMl);

    // Tìm các lô kho máu của nhóm máu này hoặc tương thích
    const matchingLots = inventories.filter((i) => i.nhomMau === reqBlood && i.soLuongConLaiMl > 0);
    if (matchingLots.length > 0) {
      setSelectedLotIds([matchingLots[0].id]);
    } else {
      setSelectedLotIds([]);
    }

    setDispatchNote(`Xuất máu chi viện khẩn cấp cho ${item.benhVienYeuCau || 'bệnh viện'}`);
  };

  // Xử lý xác nhận xuất kho ca cấp cứu
  const handleConfirmDispatch = async () => {
    if (!selectedEmergency) return;

    if (!isValidPhoneNumber(driverPhone)) {
      toast.error('Số điện thoại tài xế phải gồm đúng 10 chữ số.');
      return;
    }

    if (dispatchVolumeMl <= 0) {
      toast.error('Vui lòng chọn số lượng máu cần chuyển đi lớn hơn 0ml!');
      return;
    }

    const availableStock = getAvailableStockMl(chosenBloodType);
    if (dispatchVolumeMl > availableStock) {
      toast.error(
        `Số lượng cần chuyển (${dispatchVolumeMl}ml) vượt quá lượng máu nhóm ${chosenBloodType} hiện có trong kho (${availableStock}ml)!`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        nhomMauXuat: chosenBloodType,
        khoMauIds: selectedLotIds.length > 0 ? selectedLotIds : undefined,
        soLuongXuatMl: Number(dispatchVolumeMl),
        soLuongTui: Math.round(Number(dispatchVolumeMl) / 350),
        donViVanChuyen: ambulanceCode,
        bienSoXe: ambulanceCode.includes('[BS:') ? undefined : ambulanceCode.split(' ')[0],
        taiXe: driverName,
        soDienThoaiTaiXe: driverPhone,
        thoiGianNhanDuKien: new Date(Date.now() + Number(etaMinutes) * 60 * 1000).toISOString(),
        ghiChu: dispatchNote,
      };

      await axiosClient.post(`/emergency-requests/${selectedEmergency.id}/dispatch`, payload);

      toast.success(
        `ĐÃ XUẤT KHO VÀ ĐIỀU PHỐI XE 115 THÀNH CÔNG cho ca #${selectedEmergency.id}!`,
        { icon: '🚑', duration: 5000 }
      );

      setSelectedEmergency(null);
      await fetchAllData();
      setActiveTab('DISPATCHES');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi thực hiện điều phối xuất kho.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý tạo lệnh xuất máu điều phối trực tiếp (Direct Dispatch)
  const handleDirectDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directHospital.trim()) {
      toast.error('Vui lòng nhập tên bệnh viện tiếp nhận!');
      return;
    }
    if (!isValidPhoneNumber(directDriverPhone)) {
      toast.error('Số điện thoại tài xế phải gồm đúng 10 chữ số.');
      return;
    }
    if (directVolumeMl <= 0) {
      toast.error('Thể tích máu xuất kho phải lớn hơn 0ml!');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        benhVienNhan: directHospital.trim(),
        nhomMau: directBloodGroup,
        thanhPhan: directComponent,
        soLuongXuatMl: Number(directVolumeMl),
        khoMauId: directLotId,
        donViVanChuyen: directAmbulance,
        taiXe: directDriver,
        soDienThoaiTaiXe: directDriverPhone,
        thoiGianNhanDuKien: new Date(Date.now() + Number(directEta) * 60 * 1000).toISOString(),
        ghiChu: directNote,
      };

      await axiosClient.post('/emergency-requests/direct-dispatch', payload);

      toast.success(
        `ĐÃ TẠO LỆNH XUẤT KHO & PHÁT XE 115 CHI VIỆN trực tiếp cho ${directHospital}!`,
        { icon: '🚑', duration: 5000 }
      );

      setIsDirectModalOpen(false);
      await fetchAllData();
      setActiveTab('DISPATCHES');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi khi tạo lệnh điều phối trực tiếp.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cập nhật trạng thái chuyến xe (Đang giao -> Đã nhận thành công)
  const handleUpdateTripStatus = async (dispatchId: number, nextStatus: 'DaNhan' | 'DangGiao') => {
    try {
      await axiosClient.patch(`/emergency-requests/dispatches/${dispatchId}/status`, {
        trangThaiVanChuyen: nextStatus,
        ghiChu: nextStatus === 'DaNhan' ? 'Đã giao máu tận tay bác sĩ phụ trách tiếp nhận' : undefined,
      });

      toast.success(
        nextStatus === 'DaNhan' ? 'Đã xác nhận bàn giao máu thành công tại bệnh viện!' : 'Đã cập nhật trạng thái xe 115.'
      );
      await fetchAllData();
    } catch (err: any) {
      toast.error('Không thể cập nhật trạng thái chuyến xe.');
    }
  };

  // Lọc các lô máu có sẵn theo nhóm máu được chọn trong Modal
  const availableLotsForSelectedBlood = useMemo(() => {
    return inventories.filter((i) => i.nhomMau === chosenBloodType && i.soLuongConLaiMl > 0);
  }, [inventories, chosenBloodType]);

  // Danh sách nhóm máu tương thích cho ca bệnh đang chọn
  const compatibleBloodOptions = useMemo(() => {
    if (!selectedEmergency) return ALL_BLOOD_GROUPS;
    const reqBlood = (selectedEmergency.nhomMauCan || selectedEmergency.bloodType || 'O+') as BloodGroup;
    return BLOOD_COMPATIBILITY_MAP[reqBlood] || [reqBlood];
  }, [selectedEmergency]);

  const renderNoteWithClickablePhone = (note: string, defaultName: string) => {
    const phoneRegex = /(\(?\b(?:0\d{9}|1900\s*\d{4})\b\)?)/g;
    const parts = note.split(phoneRegex);
    if (parts.length === 1) return note;

    return parts.map((part, index) => {
      const rawNumber = part.replace(/[()]/g, '').trim();
      if (/^(0\d{9}|1900\s*\d{4})$/.test(rawNumber)) {
        return (
          <button
            key={index}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCallModal({
                title: rawNumber.startsWith('1900') ? 'Tổng đài cấp cứu' : 'Thông tin tài xế',
                name: rawNumber.startsWith('1900') ? 'Tổng đài cấp cứu máu quốc gia' : defaultName,
                phone: rawNumber,
              });
            }}
            className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 rounded-md mx-0.5 cursor-pointer transition-colors"
            title={`Bấm để gọi ${rawNumber}`}
          >
            <PhoneCall className="w-3 h-3" />
            <span>{part}</span>
          </button>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      
      {/* 1. HEADER TRUNG TÂM TÁC CHIẾN ĐIỀU PHỐI MÁU 115 */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blood-primary text-white text-xs font-black mb-2 shadow-xs shadow-red-500/20">
            <Siren className="w-4 h-4 animate-bounce" />
            Trung Tâm Tác Chiến Điều Phối Máu Khẩn Cấp 115
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Xử Lý & Điều Phối Xuất Máu Cứu Trợ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Kết nối trực tiếp CSDL Kho Máu FEFO &bull; Kiểm tra ma trận tương thích y khoa &bull; Lệnh điều phối xe 115 tức thì
          </p>
        </div>

        {/* Nút Liên Kết Kho Máu & Nút Tạo Lệnh Nhanh */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Nút link qua Quản Trị Kho Máu FEFO */}
          <Link
            to="/admin/inventory"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs group shrink-0"
            title="Đến trang quản lý chi tiết kho máu FEFO"
          >
            <Package className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            <span>Kho Máu FEFO</span>
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-black">
              {inventories.length} Lô
            </span>
          </Link>

          {/* Nút link qua Trang Dự Báo & Giám Sát Kho */}
          <Link
            to="/inventory"
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs group shrink-0"
            title="Xem biểu đồ trữ lượng 8 nhóm máu"
          >
            <Droplet className="w-4 h-4 text-blood-primary group-hover:scale-110 transition-transform" />
            <span>Giám Sát Kho</span>
          </Link>

          {/* Nút Tải lại dữ liệu */}
          <button
            type="button"
            onClick={fetchAllData}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
            title="Làm mới dữ liệu từ Database"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blood-primary' : ''}`} />
          </button>

          {/* Nút Xuất Máu Cứu Trợ Trực Tiếp */}
          <button
            type="button"
            onClick={() => setIsDirectModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md shadow-red-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Xuất Máu Trực Tiếp</span>
          </button>
        </div>
      </div>

      {/* 2. THANH ĐIỀU HƯỚNG TÁC CHIẾN (TABS) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        {/* Khung chứa 2 Tab với Background Đậm (Dark Segmented Bar) */}
        <div className="p-1.5 bg-slate-900 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-lg shadow-slate-950/20 inline-flex items-center gap-1.5 sm:gap-2">
          {/* Tab 1: Ca Cấp Cứu Cần Xuất Kho */}
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'QUEUE'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-md shadow-red-600/30 ring-1 ring-red-400'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
            }`}
          >
            <AlertOctagon className={`w-4 h-4 ${activeTab === 'QUEUE' ? 'text-white' : 'text-red-400'}`} />
            <span>Ca Cấp Cứu Cần Xuất Kho</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black flex items-center gap-1.5 ${
              activeTab === 'QUEUE'
                ? 'bg-white text-red-600 shadow-xs'
                : pendingRequests.length > 0
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                  : 'bg-slate-700 text-slate-300'
            }`}>
              {pendingRequests.length > 0 && (
                <span className={`w-2 h-2 rounded-full ${activeTab === 'QUEUE' ? 'bg-red-600' : 'bg-red-400'} animate-ping`} />
              )}
              {pendingRequests.length}
            </span>
          </button>

          {/* Tab 2: Đội Xe 115 Đang Vận Chuyển */}
          <button
            type="button"
            onClick={() => setActiveTab('DISPATCHES')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTab === 'DISPATCHES'
                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80'
            }`}
          >
            <Truck className={`w-4 h-4 ${activeTab === 'DISPATCHES' ? 'text-white' : 'text-emerald-400'}`} />
            <span>Đội Xe 115 Đang Vận Chuyển</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
              activeTab === 'DISPATCHES'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'bg-slate-700 text-slate-300'
            }`}>
              {dispatches.length}
            </span>
          </button>
        </div>

        {criticalPendingCount > 0 && activeTab === 'QUEUE' && (
          <div className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-100 border border-red-300 text-red-700 font-black text-xs animate-pulse shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span>{criticalPendingCount} CA BÁO ĐỘNG ĐỎ CẦN MÁU GẤP</span>
          </div>
        )}
      </div>

      {/* 3. TAB 1: DANH SÁCH CA CẤP CỨU CHỜ ĐIỀU PHỐI (QUEUE) */}
      {activeTab === 'QUEUE' && (
        <section className="space-y-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Không Có Ca Cấp Cứu Nào Đang Chờ</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Toàn bộ các yêu cầu chi viện máu khẩn cấp đã được xử lý và xuất kho an toàn.
              </p>
              <button
                type="button"
                onClick={() => setIsDirectModalOpen(true)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-blood-primary text-white rounded-xl text-xs font-bold hover:bg-blood-dark transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Tạo lệnh điều phối xe trực tiếp</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingRequests.map((req) => {
                const reqBlood = (req.nhomMauCan || req.bloodType || 'O+') as BloodGroup;
                const neededVolume = req.soLuongCanMl || (req.unitsNeeded ? req.unitsNeeded * 350 : 350);
                const isCritical = req.mucDoKhanCap === 'NGUY_CAP' || req.mucDoKhanCap === 'RAT_KHAN';
                const availableStock = getAvailableStockMl(reqBlood);
                const isStockSufficient = availableStock >= neededVolume;

                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition-all shadow-sm space-y-4 ${
                      isCritical
                        ? 'border-red-300 ring-4 ring-red-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-red-600 via-rose-600 to-red-700 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-500/25">
                          {reqBlood}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-extrabold text-slate-900 text-base sm:text-lg">
                              {req.benhVienYeuCau || req.hospitalName}
                            </span>
                            {isCritical ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-blood-primary font-black text-[10px] uppercase tracking-wider flex items-center gap-1 animate-pulse border border-red-200">
                                <Siren className="w-3 h-3" /> RẤT KHẨN - BÁO ĐỘNG ĐỎ
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black text-[10px] uppercase border border-amber-200">
                                KHẨN CẤP
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Mã ca: <span className="font-mono font-bold text-slate-800">#{req.id}</span> &bull; 
                            Thành phần: <span className="font-bold text-slate-700">{req.thanhPhanCan || 'Máu Toàn Phần'}</span>
                          </p>
                        </div>
                      </div>

                      {/* Nút hành động */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenDispatch(req)}
                          className="w-full sm:w-auto px-5 py-3 bg-blood-primary hover:bg-blood-dark text-white font-black rounded-2xl shadow-lg shadow-red-500/30 text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                        >
                          <Truck className="w-4 h-4" />
                          <span>ĐIỀU PHỐI XE 115 & XUẤT KHO</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Chi tiết ca bệnh & Tình trạng kho */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      {/* Cột 1: Nhu cầu máu */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-slate-400 uppercase font-black text-[10px] block">
                          Số lượng cần tiếp tế
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <strong className="text-blood-primary text-base font-black">
                            {neededVolume.toLocaleString()} ml
                          </strong>
                          <span className="text-slate-500 font-semibold">
                            (~{Math.round(neededVolume / 350)} túi máu chuẩn)
                          </span>
                        </div>
                      </div>

                      {/* Cột 2: Đối chiếu CSDL Kho Máu */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 uppercase font-black text-[10px] block">
                            Tồn kho máu thực tế ({reqBlood})
                          </span>
                          <Link 
                            to="/admin/inventory" 
                            className="text-[11px] font-bold text-blood-primary hover:underline flex items-center gap-0.5"
                            title="Mở kho máu FEFO để đối chiếu"
                          >
                            <span>Kho FEFO</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                        <div className="flex items-center gap-2">
                          <strong className="text-slate-900 text-base font-black">
                            {availableStock.toLocaleString()} ml
                          </strong>
                          {isStockSufficient ? (
                            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Đủ xuất viện
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Thiếu {neededVolume - availableStock}ml
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cột 3: Người liên hệ & Hạn chót */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                        <span className="text-slate-400 uppercase font-black text-[10px] block">
                          Người đại diện & Hạn chót
                        </span>
                        <div className="flex items-center gap-1 text-slate-800 font-bold">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.nguoiDaiDien?.hoTen || 'Bác sĩ trực cấp cứu'}</span>
                          {req.nguoiDaiDien?.soDienThoai && (
                            <button
                              type="button"
                              onClick={() => openCallModal({
                                title: 'Thông tin liên hệ',
                                name: req.nguoiDaiDien?.hoTen || 'Bác sĩ trực cấp cứu',
                                phone: req.nguoiDaiDien.soDienThoai,
                              })}
                              className="inline-flex items-center gap-0.5 text-blue-700 hover:text-blue-900 font-bold hover:underline cursor-pointer transition-colors"
                              title={`Gọi cho ${req.nguoiDaiDien?.hoTen || 'Bác sĩ'}`}
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>({req.nguoiDaiDien.soDienThoai})</span>
                            </button>
                          )}
                        </div>
                        <div className="text-red-600 font-bold text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Hạn chót: {new Date(req.hanChot || Date.now()).toLocaleTimeString('vi-VN')} ({new Date(req.hanChot || Date.now()).toLocaleDateString('vi-VN')})</span>
                        </div>
                      </div>
                    </div>

                    {/* Chỉ dẫn lâm sàng / Lý do */}
                    {req.lyDo && (
                      <div className="text-xs text-slate-700 bg-red-50/60 p-3 rounded-2xl border border-red-200/70">
                        <strong className="text-red-700 font-bold">Chỉ dẫn lâm sàng & Lý do:</strong> {req.lyDo}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 4. TAB 2: ĐỘI XE 115 ĐANG VẬN CHUYỂN & LỊCH SỬ ĐIỀU PHỐI (DISPATCHES) */}
      {activeTab === 'DISPATCHES' && (
        <section className="space-y-4">
          {/* Cảnh báo nổi bật nếu có ca cấp cứu đang chờ xuất kho ở Tab 1 */}
          {pendingRequests.length > 0 && (
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-red-500/20 border border-white/20 animate-in fade-in">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
                  <Siren className="w-6 h-6 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-white text-red-700 text-[10px] font-black uppercase tracking-wider">
                      Cần Điều Xe 115
                    </span>
                    <strong className="text-sm sm:text-base font-black text-white">
                      Đang có {pendingRequests.length} ca cấp cứu chờ xuất kho & phát lệnh xe!
                    </strong>
                  </div>
                  <p className="text-xs text-red-100 mt-0.5">
                    {pendingRequests[0]?.benhVienYeuCau || 'Bệnh viện'} &bull; Cần máu: <span className="font-black bg-white/20 px-1.5 py-0.5 rounded text-amber-200">{pendingRequests[0]?.nhomMauCan || pendingRequests[0]?.bloodType}</span> ({pendingRequests[0]?.soLuongCanMl}ml)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('QUEUE')}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-red-700 font-black text-xs rounded-xl hover:bg-red-50 transition active:scale-95 cursor-pointer shadow-md flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Chuyển Sang Điều Xe Ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          {dispatches.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-slate-900">Chưa Có Chuyến Xe Điều Phối Nào</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Lịch sử các đợt xuất kho và hành trình giao máu khẩn cấp của đội xe 115 sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dispatches.map((disp) => {
                const isDelivering = disp.trangThaiVanChuyen === 'DangGiao';
                const isReceived = disp.trangThaiVanChuyen === 'DaNhan';

                return (
                  <div
                    key={disp.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-3.5 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 text-white flex items-center justify-center shadow-xs">
                          <Truck className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-black text-slate-900 block truncate max-w-[200px]">
                            {disp.donViVanChuyen || 'Xe Cấp Cứu 115'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Lệnh điều phối #{disp.id} &bull; Xuất lúc: {new Date(disp.thoiGianXuat || disp.ngayTao || Date.now()).toLocaleTimeString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      {/* Trạng thái vận chuyển */}
                      {isDelivering ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse border border-blue-200">
                          <Navigation className="w-3 h-3 animate-spin" /> Đang giao máu
                        </span>
                      ) : isReceived ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Đã nhận tại viện
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black">
                          {disp.trangThaiVanChuyen}
                        </span>
                      )}
                    </div>

                    {/* Chi tiết điểm đến & Lô máu xuất */}
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 text-slate-800">
                        <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900">
                            {disp.yeuCau?.benhVienYeuCau || 'Bệnh viện tiếp nhận cấp cứu'}
                          </strong>
                          <span className="text-slate-500 text-[11px]">
                            Dự kiến giao: {disp.thoiGianNhanDuKien ? new Date(disp.thoiGianNhanDuKien).toLocaleTimeString('vi-VN') : 'Trong 30 phút'}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block font-bold">Lượng Máu Đã Xuất</span>
                          <span className="font-black text-blood-primary text-xs">
                            {disp.soLuongXuatMl.toLocaleString()} ml
                          </span>
                          <span className="text-slate-500 ml-1">
                            (Nhóm {disp.khoMau?.nhomMau || disp.yeuCau?.nhomMauCan || 'Máu'})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block font-bold">Kho Lưu Trữ Xuất</span>
                          <span className="font-bold text-slate-700 truncate block">
                            {disp.khoMau?.donViLuuTru || 'Kho Lưu Trữ Trung Tâm'}
                          </span>
                        </div>
                      </div>

                      {(disp.taiXe || disp.soDienThoaiTaiXe) && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/70 px-3 py-2">
                          <span className="text-xs font-semibold text-slate-700">
                            Tài xế: {disp.taiXe || 'Chưa cập nhật'}
                          </span>
                          {disp.soDienThoaiTaiXe && (
                            <button
                              type="button"
                              onClick={() => openCallModal({
                                title: 'Thông tin tài xế',
                                name: disp.taiXe || 'Tài xế Phan Quốc Hoàng',
                                phone: disp.soDienThoaiTaiXe || '',
                              })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-bold text-blue-700 shadow-sm hover:bg-blue-100 cursor-pointer active:scale-95 transition-all"
                            >
                              <PhoneCall className="h-3.5 w-3.5" />
                              Gọi tài xế · {disp.soDienThoaiTaiXe}
                            </button>
                          )}
                        </div>
                      )}

                      {disp.ghiChu && (
                        <div className="text-[11px] text-slate-600 bg-amber-50/50 p-2 rounded-xl border border-amber-200/60 leading-relaxed">
                          <strong>Ghi chú:</strong> {renderNoteWithClickablePhone(disp.ghiChu, disp.taiXe || 'Tài xế')}
                        </div>
                      )}
                    </div>

                    {/* Nút hoàn tất giao hàng */}
                    {isDelivering && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleUpdateTripStatus(disp.id, 'DaNhan')}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Xác Nhận Đã Nhận Máu Tại Bệnh Viện</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ============================================================================== */}
      {/* 5. MODAL ĐIỀU PHỐI XUẤT KHO CHO CA CẤP CỨU CỤ THỂ                             */}
      {/* ============================================================================== */}
      {selectedEmergency && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-red-50 via-slate-50 to-red-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blood-primary text-white flex items-center justify-center shadow-md">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">
                    Xác Nhận Xuất Kho & Lệnh Điều Phối Xe 115
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Đến: <strong>{selectedEmergency.benhVienYeuCau}</strong> &bull; Yêu cầu:{' '}
                    <strong className="text-blood-primary">
                      {selectedEmergency.soLuongCanMl}ml nhóm {selectedEmergency.nhomMauCan}
                    </strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmergency(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {/* BƯỚC 1: CHỌN LỰA NHÓM MÁU ĐỂ XUẤT VIỆN */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    1. Lựa Chọn Nhóm Máu Xuất Kho (Theo Ma Trận Tương Thích Y Khoa):
                  </span>
                  <Link
                    to="/admin/inventory"
                    target="_blank"
                    className="text-blood-primary font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Xem kho FEFO</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {compatibleBloodOptions.map((bg) => {
                    const isSelected = chosenBloodType === bg;
                    const stockMl = getAvailableStockMl(bg);
                    const isOriginal = bg === selectedEmergency.nhomMauCan;

                    return (
                      <button
                        key={bg}
                        type="button"
                        onClick={() => {
                          setChosenBloodType(bg);
                          const matching = inventories.filter((i) => i.nhomMau === bg && i.soLuongConLaiMl > 0);
                          if (matching.length > 0) setSelectedLotIds([matching[0].id]);
                          else setSelectedLotIds([]);
                        }}
                        className={`p-2 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-500/25'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className="text-sm font-black">{bg}</span>
                        <span className={`text-[10px] font-bold block ${isSelected ? 'text-white/90' : 'text-slate-500'}`}>
                          {stockMl}ml
                        </span>
                        {isOriginal && (
                          <span className={`text-[8px] font-black uppercase px-1 rounded-sm mt-0.5 ${isSelected ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                            Chuẩn
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BƯỚC 2: CHỌN LÔ MÁU THỰC TẾ TRONG KHO (KHOMAU DATABASE) */}
              <div className="space-y-2">
                <span className="font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  2. Chọn Lô Máu Cụ Thể Trong CSDL Kho ({chosenBloodType}):
                </span>

                {availableLotsForSelectedBlood.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-center space-y-1">
                    <p className="font-bold">Nhóm máu {chosenBloodType} hiện đã hết sạch trong kho!</p>
                    <p className="text-[11px]">Vui lòng chọn nhóm máu tương thích khác bên trên để thay thế.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {availableLotsForSelectedBlood.map((lot) => {
                      const isChecked = selectedLotIds.includes(lot.id);
                      return (
                        <div
                          key={lot.id}
                          onClick={() => {
                            if (isChecked) {
                              setSelectedLotIds(selectedLotIds.filter((id) => id !== lot.id));
                            } else {
                              setSelectedLotIds([...selectedLotIds, lot.id]);
                            }
                          }}
                          className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                            isChecked
                              ? 'bg-red-50 border-blood-primary text-blood-dark shadow-xs'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 rounded-md text-blood-primary accent-blood-primary"
                            />
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2">
                                <span>Lô #{lot.id} - Nhóm {lot.nhomMau} ({lot.thanhPhan})</span>
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                                  Còn {lot.soLuongConLaiMl}ml
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500">
                                Vị trí: <strong>{lot.donViLuuTru}</strong> &bull; Cập nhật: {new Date(lot.ngayCapNhat || Date.now()).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* BƯỚC 3: LỰA CHỌN SỐ LƯỢNG MÁU CẦN CHUYỂN ĐI TRONG KHO (LINK CSDL BACKEND) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50/70 via-slate-50 to-red-50/40 border-2 border-red-200 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black shadow-xs">
                      <Droplet className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-black text-xs uppercase tracking-wider text-slate-900 block">
                        3. Lựa Chọn Số Lượng Máu Cần Chuyển Đi (Trừ CSDL Kho Máu):
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Dữ liệu sẽ tự động trừ trực tiếp vào số ml trong bảng KhoMau và ghi vào bảng DieuPhoiMau
                      </span>
                    </div>
                  </div>

                  {/* Thông tin đối chiếu */}
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                      Viện Yêu Cầu: <span className="text-blood-primary font-black">{selectedEmergency.soLuongCanMl}ml</span>
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold text-[11px]">
                      Kho ({chosenBloodType}): <span className="text-emerald-700 font-black">{getAvailableStockMl(chosenBloodType)}ml</span>
                    </span>
                  </div>
                </div>

                {/* Input nhập số lượng & Nút tăng giảm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px] block">
                      Thể Tích Máu Xuất Đi (ml):
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={50}
                        step={50}
                        max={getAvailableStockMl(chosenBloodType)}
                        value={dispatchVolumeMl}
                        onChange={(e) => setDispatchVolumeMl(Number(e.target.value))}
                        className="w-full pl-3 pr-14 py-2.5 rounded-xl border-2 border-red-300 focus:outline-hidden focus:border-blood-primary bg-white font-black text-slate-900 text-sm shadow-inner"
                      />
                      <span className="absolute right-3 text-xs font-black text-slate-400 uppercase pointer-events-none">
                        ml
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 text-[11px] block">
                      Quy Đổi Số Túi Chuẩn (1 túi = 350ml):
                    </label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 rounded-xl bg-white border border-slate-200 font-black text-slate-800 text-sm flex items-center justify-between">
                        <span>~ {(dispatchVolumeMl / 350).toFixed(1)} túi</span>
                        <span className="text-[11px] font-bold text-slate-400">({dispatchVolumeMl} ml)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDispatchVolumeMl(Math.max(50, dispatchVolumeMl - 350))}
                          className="px-2.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-black text-xs text-slate-700 cursor-pointer active:scale-95 transition-all"
                          title="Giảm 1 túi (350ml)"
                        >
                          - 1 túi
                        </button>
                        <button
                          type="button"
                          onClick={() => setDispatchVolumeMl(Math.min(getAvailableStockMl(chosenBloodType), dispatchVolumeMl + 350))}
                          className="px-2.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-black text-xs text-slate-700 cursor-pointer active:scale-95 transition-all"
                          title="Tăng 1 túi (350ml)"
                        >
                          + 1 túi
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Các nút chọn nhanh (Quick Presets) */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chọn nhanh:</span>
                  {[
                    { label: '250ml', value: 250 },
                    { label: '350ml (1 túi)', value: 350 },
                    { label: '700ml (2 túi)', value: 700 },
                    { label: '1,050ml (3 túi)', value: 1050 },
                    { label: '1,400ml (4 túi)', value: 1400 },
                    { label: `Xuất đủ theo yêu cầu (${selectedEmergency.soLuongCanMl}ml)`, value: selectedEmergency.soLuongCanMl },
                  ].map((preset) => {
                    const isCurrent = dispatchVolumeMl === preset.value;
                    const isExceed = preset.value > getAvailableStockMl(chosenBloodType);
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        disabled={isExceed}
                        onClick={() => setDispatchVolumeMl(preset.value)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-red-600 text-white shadow-2xs font-black'
                            : isExceed
                            ? 'bg-slate-100 text-slate-300 cursor-not-allowed line-through'
                            : 'bg-white hover:bg-red-50 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tính toán tồn kho thời gian thực */}
                <div className="pt-2 border-t border-red-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">
                    Dự kiến sau khi trừ kho: <strong className="text-slate-900">{getAvailableStockMl(chosenBloodType)}ml - {dispatchVolumeMl}ml = <span className="text-emerald-700 font-black">{Math.max(0, getAvailableStockMl(chosenBloodType) - dispatchVolumeMl)}ml</span> còn lại</strong>
                  </span>
                  {dispatchVolumeMl > getAvailableStockMl(chosenBloodType) ? (
                    <span className="text-red-600 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Vượt quá tồn kho có sẵn!
                    </span>
                  ) : dispatchVolumeMl < selectedEmergency.soLuongCanMl ? (
                    <span className="text-amber-700 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Xuất 1 phần (còn thiếu {selectedEmergency.soLuongCanMl - dispatchVolumeMl}ml)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Đủ đáp ứng toàn bộ yêu cầu
                    </span>
                  )}
                </div>
              </div>

              {/* BƯỚC 4: THÔNG TIN XE CẤP CỨU & TÀI XẾ 115 */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-600" />
                  4. Thông Tin Đội Xe 115 Điều Phối:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Đơn Vị & Biển Số Xe 115</label>
                    <input
                      type="text"
                      value={ambulanceCode}
                      onChange={(e) => setAmbulanceCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                      placeholder="VD: 51B-115.89 (Đội Cấp Cứu 115)"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Thời Gian Nhận Dự Kiến (ETA Phút)</label>
                    <input
                      type="number"
                      value={etaMinutes}
                      onChange={(e) => setEtaMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                      min={5}
                      max={180}
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Họ Tên Tài Xế</label>
                    <input
                      type="text"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                      placeholder="Tên tài xế phụ trách"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Số Điện Thoại Tài Xế</label>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      maxLength={10}
                      required
                      value={driverPhone}
                      onChange={(e) => setDriverPhone(sanitizeDigits(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                      placeholder="SĐT liên hệ"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ghi Chú Điều Phối / Chỉ Dẫn Lộ Trình</label>
                  <textarea
                    rows={2}
                    value={dispatchNote}
                    onChange={(e) => setDispatchNote(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                    placeholder="Ghi chú thêm cho tài xế hoặc bệnh viện..."
                  />
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmergency(null)}
                className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 font-bold transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleConfirmDispatch}
                disabled={isSubmitting || dispatchVolumeMl <= 0 || dispatchVolumeMl > getAvailableStockMl(chosenBloodType)}
                className="px-6 py-2.5 bg-blood-primary hover:bg-blood-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Đang xuất kho...'
                    : `Xác Nhận Xuất ${dispatchVolumeMl > 0 ? dispatchVolumeMl.toLocaleString() + 'ml' : ''} & Phát Lệnh Xe 115`}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 6. MODAL XUẤT MÁU CỨU TRỢ TRỰC TIẾP (DIRECT DISPATCH)                          */}
      {/* ============================================================================== */}
      {isDirectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
            
            <div className="p-5 sm:p-6 bg-gradient-to-r from-red-600 to-rose-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-white text-lg leading-tight">
                    Tạo Lệnh Xuất Máu Cứu Trợ Trực Tiếp
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Xuất kho & gửi xe cấp cứu chi viện khẩn cấp cho bất kỳ bệnh viện nào
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDirectModalOpen(false)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDirectDispatchSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              
              {/* Bệnh viện nhận */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Bệnh Viện Tiếp Nhận Cấp Cứu</label>
                <input
                  type="text"
                  required
                  value={directHospital}
                  onChange={(e) => setDirectHospital(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                  placeholder="Nhập tên bệnh viện..."
                />
                <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold">Gợi ý nhanh:</span>
                  {POPULAR_HOSPITALS.slice(0, 3).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setDirectHospital(h)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold transition-all cursor-pointer"
                    >
                      {h.split(' (')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nhóm máu, Thành phần & Thể tích */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Chọn Nhóm Máu</label>
                  <select
                    value={directBloodGroup}
                    onChange={(e) => setDirectBloodGroup(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary font-black"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        Nhóm {bg} (Kho có {getAvailableStockMl(bg)}ml)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Thành Phần Máu</label>
                  <select
                    value={directComponent}
                    onChange={(e) => setDirectComponent(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary font-bold"
                  >
                    <option value="ToanPhan">Máu Toàn Phần</option>
                    <option value="HongCau">Khối Hồng Cầu</option>
                    <option value="TieuCau">Khối Tiểu Cầu</option>
                    <option value="HuyetTuong">Huyết Tương Đông Lạnh</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Thể Tích Xuất (ml)</label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={50}
                    value={directVolumeMl}
                    onChange={(e) => setDirectVolumeMl(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary font-black"
                  />
                </div>
              </div>

              {/* Tùy chọn chỉ định Lô kho máu cụ thể */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Chỉ Định Lô Kho Máu (Tùy chọn - Mặc định tự động trừ theo FEFO)
                </label>
                <select
                  value={directLotId || ''}
                  onChange={(e) => setDirectLotId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                >
                  <option value="">-- Tự động trừ lô có hạn sử dụng gần nhất (FEFO) --</option>
                  {inventories
                    .filter((i) => i.nhomMau === directBloodGroup && i.soLuongConLaiMl > 0)
                    .map((lot) => (
                      <option key={lot.id} value={lot.id}>
                        Lô #{lot.id} ({lot.nhomMau} - {lot.thanhPhan}) - Còn {lot.soLuongConLaiMl}ml tại {lot.donViLuuTru}
                      </option>
                    ))}
                </select>
              </div>

              {/* Thông tin xe & tài xế */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Xe Cấp Cứu 115</label>
                  <input
                    type="text"
                    value={directAmbulance}
                    onChange={(e) => setDirectAmbulance(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Thời Gian Đến (Phút)</label>
                  <input
                    type="number"
                    value={directEta}
                    onChange={(e) => setDirectEta(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                    min={5}
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Tài Xế Phụ Trách</label>
                  <input
                    type="text"
                    value={directDriver}
                    onChange={(e) => setDirectDriver(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Số Điện Thoại</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                    value={directDriverPhone}
                    onChange={(e) => setDirectDriverPhone(sanitizeDigits(e.target.value, 10))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                  />
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">Lý Do / Ghi Chú Xuất Máu</label>
                <textarea
                  rows={2}
                  value={directNote}
                  onChange={(e) => setDirectNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:border-blood-primary"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDirectModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blood-primary hover:bg-blood-dark text-white font-black rounded-xl shadow-lg shadow-red-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang trừ kho...' : 'Xuất Kho & Phát Xe 115'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DispatchPage;
