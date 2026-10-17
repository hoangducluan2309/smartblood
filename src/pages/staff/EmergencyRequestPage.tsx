import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useEmergency } from '../../contexts/EmergencyContext';
import { useAuth } from '../../contexts/AuthContext';
import { axiosClient } from '../../api/axiosClient';
import { BloodGroup, EmergencyBloodRequest } from '../../types';
import { isValidPhoneNumber, sanitizeDigits } from '../../utils/inputValidation';
import { 
  AlertOctagon, 
  Send, 
  Truck, 
  PhoneCall, 
  Clock, 
  Droplet, 
  CheckCircle2, 
  Radio, 
  Siren,
  Building2,
  ShieldAlert,
  PowerOff,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

// Dữ liệu mẫu ban đầu cho bảng theo dõi xe cấp cứu thời gian thực
const INITIAL_REQUESTS: EmergencyBloodRequest[] = [
  {
    id: 'EMG-901',
    hospitalName: 'Bệnh viện Chợ Rẫy',
    department: 'Khoa Hồi Sức Cấp Cứu (ICU)',
    patientName: 'Bệnh nhân Lê Văn T. (Tai nạn giao thông)',
    patientCode: 'BN-88219',
    bloodType: 'O-',
    unitsNeeded: 3,
    urgency: 'RAT_KHAN',
    contactDoctor: 'BS. CKII Nguyễn Minh',
    contactPhone: '0908123456',
    status: 'DANG_GIAO_XE_CAP_CUU',
    createdAt: '2026-10-09 21:10',
    deadline: 'Trong 45 phút tới',
    note: 'Bệnh nhân sốc mất máu cấp, cần truyền ngay khi xe tới.',
    dispatchInfo: {
      ambulanceCode: '51B-992.12 (Đội Cấp Cứu 115)',
      driverName: 'Tài xế Phan Hoàng',
      driverPhone: '0933888999',
      etaMinutes: 12,
      dispatchedAt: '21:15',
      selectedLots: ['LOT-O-NEG-001', 'LOT-O-NEG-002', 'LOT-O-NEG-003'],
    },
  },
  {
    id: 'EMG-902',
    hospitalName: 'Bệnh viện Chợ Rẫy',
    department: 'Khoa Ngoại Lồng Ngực',
    patientName: 'Bệnh nhân Trần Thị B. (Phẫu thuật tim hở)',
    patientCode: 'BN-88220',
    bloodType: 'AB-',
    unitsNeeded: 2,
    urgency: 'KHAN_CAP',
    contactDoctor: 'BS. Lê Thị Mai',
    contactPhone: '0912345678',
    status: 'CHO_DUYET',
    createdAt: '2026-10-09 21:25',
    deadline: 'Trước 23:00',
    note: 'Ca mổ dự kiến bắt đầu lúc 22:30.',
  },
];

export const EmergencyRequestPage: React.FC = () => {
  const { addNewEmergencyCard, triggerEmergencyAlert, dismissEmergencyCard, restoreEmergencyCard } = useEmergency();
  const { user } = useAuth();

  const [requests, setRequests] = useState<EmergencyBloodRequest[]>(INITIAL_REQUESTS);
  const [urgency, setUrgency] = useState<'RAT_KHAN' | 'KHAN_CAP'>('RAT_KHAN');
  const [bloodType, setBloodType] = useState<BloodGroup>('O-');
  const [unitsNeeded, setUnitsNeeded] = useState<number>(2);
  const [patientName, setPatientName] = useState('');
  const [patientCode, setPatientCode] = useState('');
  const [department, setDepartment] = useState('Khoa Hồi Sức Cấp Cứu');
  const [contactDoctor, setContactDoctor] = useState('BS. Trực Cấp Cứu');
  const [contactPhone, setContactPhone] = useState('0909123456');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Hỗ trợ chọn hoặc chỉ định Bệnh viện yêu cầu (Dành cho Admin và Nhân viên Bệnh viện)
  const [selectedHospital, setSelectedHospital] = useState<string>(
    user?.hospitalName || (user?.role === 'ADMIN' ? 'Bệnh viện Chợ Rẫy (TP.HCM)' : 'Bệnh viện Chợ Rẫy')
  );
  const [customHospital, setCustomHospital] = useState('');

  const bloodGroups: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

  const finalHospitalName = selectedHospital === 'KHAC' 
    ? (customHospital.trim() || 'Bệnh viện Chỉ Định') 
    : selectedHospital;

  // Tải danh sách yêu cầu thực tế từ SQL Server
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axiosClient.get('/emergency-requests/public');
        const dbItems = res.data?.data;
        if (Array.isArray(dbItems) && dbItems.length > 0) {
          const mapped: EmergencyBloodRequest[] = dbItems.map((item: any) => {
            const units = Math.max(1, Math.round((item.soLuongCanMl || 700) / 350));
            return {
              id: `REQ-${item.id}`,
              hospitalName: item.benhVienYeuCau,
              department: 'Khoa Cấp Cứu / Hồi Sức',
              patientName: item.lyDo?.replace(/\[ĐÃ TẮT[^\]]*\]/g, '').trim() || 'Bệnh nhân cấp cứu',
              patientCode: `BN-100${item.id}`,
              bloodType: item.nhomMauCan,
              unitsNeeded: units,
              urgency: item.mucDoKhanCap === 'NGUY_CAP' ? 'RAT_KHAN' : 'KHAN_CAP',
              contactDoctor: item.nguoiDaiDien?.hoTen || 'BS. Trực Cấp Cứu',
              contactPhone: item.nguoiDaiDien?.soDienThoai || '0908123456',
              status: item.trangThai === 'DaHuy' ? 'DA_HUY' : item.trangThai === 'DaDapUng' ? 'DA_GIAO_THANH_CONG' : 'CHO_DUYET',
              createdAt: item.ngayTao ? new Date(item.ngayTao).toLocaleDateString('vi-VN') : '',
              deadline: item.hanChot ? new Date(item.hanChot).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Trong 45 phút',
              note: item.lyDo,
            };
          });
          setRequests(mapped);
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách yêu cầu cấp cứu từ API:', err);
      }
    };
    fetchRequests();
  }, []);

  // Gửi lệnh yêu cầu cấp cứu đến API POST /emergency-requests
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientName.trim()) {
      toast.error('Vui lòng nhập Tên bệnh nhân hoặc Mã bệnh án!');
      return;
    }
    if (!isValidPhoneNumber(contactPhone)) {
      toast.error('Số điện thoại liên hệ phải gồm đúng 10 chữ số.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newRequestPayload = {
        hospitalName: finalHospitalName,
        department,
        patientName,
        patientCode: patientCode || `BN-${Math.floor(10000 + Math.random() * 90000)}`,
        bloodType,
        unitsNeeded: Number(unitsNeeded),
        urgency,
        contactDoctor,
        contactPhone,
        note,
      };

      // Payload đồng bộ với API Backend SQL Server (YeuCauMauKhanCap)
      const backendPayload = {
        benhVienYeuCau: finalHospitalName,
        nhomMauCan: bloodType,
        soLuongTui: Number(unitsNeeded),
        soLuongCanMl: Number(unitsNeeded) * 350,
        mucDoKhanCap: urgency,
        lyDo: `Bệnh nhân: ${patientName} (${department}) - ${note || 'Yêu cầu cấp cứu khẩn'}. BS: ${contactDoctor} (${contactPhone})`,
        hanChot: new Date(Date.now() + (urgency === 'RAT_KHAN' ? 45 : 120) * 60 * 1000).toISOString(),
      };

      // Gửi lên Backend
      let createdId = `REQ-${Math.floor(900 + Math.random() * 100)}`;
      try {
        const res = await axiosClient.post('/emergency-requests', backendPayload);
        if (res.data?.data?.id) createdId = `REQ-${res.data.data.id}`;
        else if (res.data?.id) createdId = `REQ-${res.data.id}`;
      } catch (backendErr) {
        console.warn('Backend API notification:', backendErr);
      }

      const newRecord: EmergencyBloodRequest = {
        id: createdId,
        ...newRequestPayload,
        status: 'CHO_DUYET',
        createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };

      setRequests(prev => [newRecord, ...prev]);

      // Đồng bộ trực tiếp thẻ cấp cứu vào EmergencyContext (Navbar, Banner, EmergencyPage, HomePage)
      addNewEmergencyCard({
        id: createdId,
        patient: patientName,
        bloodType: bloodType,
        units: `${unitsNeeded} Đơn vị (${urgency === 'RAT_KHAN' ? 'Khẩn cấp' : 'Ưu tiên'})`,
        unitsNeeded: Number(unitsNeeded),
        hospital: finalHospitalName,
        department: department,
        contact: contactPhone,
        coordinator: contactDoctor,
        deadline: urgency === 'RAT_KHAN' ? 'Trong 45 phút tới' : 'Trong vòng 2 giờ tới',
        urgencyBadge: urgency === 'RAT_KHAN' ? 'BÁO ĐỘNG ĐỎ' : 'KHẨN CẤP',
        isAlertActive: urgency === 'RAT_KHAN',
      });

      // Kích hoạt chuông báo động toàn hệ thống
      if (urgency === 'RAT_KHAN') {
        triggerEmergencyAlert(`BÁO ĐỘNG ĐỎ: ${newRequestPayload.hospitalName} cần gấp ${unitsNeeded} túi máu ${bloodType} cho ${patientName}!`);
      } else {
        toast.success(`Đã phát lệnh yêu cầu ${unitsNeeded} đơn vị máu ${bloodType} lên trung tâm điều phối.`);
      }

      // Reset form
      setPatientName('');
      setPatientCode('');
      setNote('');
    } catch (err) {
      toast.error('Có lỗi xảy ra khi phát lệnh yêu cầu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quyền Bác sĩ & Admin tắt thẻ cấp cứu / đóng ca bệnh
  const handleCloseEmergencyCase = (reqId: string, pName: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'DA_HUY' } : r));
    dismissEmergencyCard(reqId, 'Đã đóng ca bệnh từ Cổng phát lệnh Bệnh viện');
    toast.success(`Đã tắt thẻ cấp cứu ${reqId} cho ${pName}!`);
  };

  // Quyền Bác sĩ & Admin khôi phục / mở lại thẻ cấp cứu
  const handleRestoreEmergencyCase = (reqId: string, pName: string) => {
    setRequests(prev => prev.map(r => r.id === reqId ? { ...r, status: 'CHO_DUYET' } : r));
    restoreEmergencyCard(reqId);
    toast.success(`Đã mở lại thẻ cấp cứu ${reqId} cho ${pName}!`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header Bệnh Viện */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-blood-dark text-xs font-black mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-blood-primary" />
            Cổng Tiếp Nhận & Phát Lệnh Khẩn Cấp Bệnh Viện
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Yêu Cầu Máu Cấp Cứu & Điều Phối Xe Giao
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Đơn vị trực thuộc: <strong className="text-slate-800">{user?.hospitalName || 'Bệnh viện Chợ Rẫy (TP.HCM)'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blood-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-blood-primary"></span>
          </span>
          <span className="text-xs font-bold text-blood-primary">Kênh ưu tiên 115 trực tuyến</span>
        </div>
      </div>

      {/* 2. FORM TẠO YÊU CẦU MÁU CẤP CỨU */}
      <div className="bg-white rounded-3xl border-2 border-red-200/80 shadow-xl shadow-red-500/5 p-6 sm:p-8 space-y-6">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blood-primary text-white flex items-center justify-center shadow-md shadow-blood-primary/25">
              <Siren className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                Phát Lệnh Yêu Cầu Cung Cấp Máu Cấp Cứu
              </h2>
              <p className="text-xs text-slate-500">
                Lệnh sẽ gửi tức thì đến Trung tâm Điều Phối và Đội Xe Vận Chuyển 115
              </p>
            </div>
          </div>
        </div>

        {/* Banner xác nhận đặc quyền Admin phát lệnh cấp cứu */}
        {user?.role === 'ADMIN' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/10 via-indigo-900/5 to-purple-900/10 border border-purple-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-purple-950">Quyền Hạn Quản Trị Viên (ADMIN)</h4>
                  <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-purple-200 text-purple-900 rounded">
                    Toàn Hệ Thống
                  </span>
                </div>
                <p className="text-xs text-purple-800/80 mt-0.5">
                  Bạn có toàn quyền phát lệnh điều động khẩn cấp cho bất kỳ bệnh viện hoặc cơ sở y tế nào trong mạng lưới.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-extrabold text-purple-700 bg-white px-3 py-1.5 rounded-xl border border-purple-200 shadow-2xs self-start sm:self-auto">
              Ưu tiên điều xe 115 cao nhất
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Lựa chọn Cơ sở / Bệnh viện phát lệnh (Đặc biệt hữu ích cho Admin) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              1. Bệnh Viện / Cơ Sở Y Tế Yêu Cầu <span className="text-blood-primary">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30 cursor-pointer"
                >
                  <option value="Bệnh viện Chợ Rẫy (TP.HCM)">Bệnh viện Chợ Rẫy (TP.HCM)</option>
                  <option value="Bệnh viện Truyền Máu Huyết Học TP.HCM">Bệnh viện Truyền Máu Huyết Học TP.HCM</option>
                  <option value="Bệnh viện Thống Nhất">Bệnh viện Thống Nhất</option>
                  <option value="Bệnh viện Cấp Cứu 115">Bệnh viện Cấp Cứu 115</option>
                  <option value="Bệnh viện Đại Học Y Dược TP.HCM">Bệnh viện Đại Học Y Dược TP.HCM</option>
                  <option value="Bệnh viện Chấn Thương Chỉnh Hình">Bệnh viện Chấn Thương Chỉnh Hình</option>
                  <option value="Bệnh viện Nhi Đồng 1">Bệnh viện Nhi Đồng 1</option>
                  <option value="Bệnh viện Từ Dũ">Bệnh viện Từ Dũ</option>
                  <option value="Trung Tâm Điều Phối Máu Quốc Gia (Lệnh Khẩn)">Trung Tâm Điều Phối Máu Quốc Gia (Lệnh Khẩn)</option>
                  <option value="KHAC">-- Cơ sở / Bệnh viện khác (Nhập tên) --</option>
                </select>
              </div>

              {selectedHospital === 'KHAC' && (
                <input
                  type="text"
                  required
                  placeholder="Nhập tên bệnh viện hoặc trung tâm y tế..."
                  value={customHospital}
                  onChange={(e) => setCustomHospital(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
                />
              )}
            </div>
          </div>

          {/* Chọn Mức Độ Khẩn Cấp: RẤT KHẨN (Báo động đỏ) vs KHẨN CẤP */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              2. Chọn Mức Độ Báo Động Cấp Cứu <span className="text-blood-primary">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Nút RẤT KHẨN - BÁO ĐỘNG ĐỎ */}
              <button
                type="button"
                onClick={() => setUrgency('RAT_KHAN')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 text-left cursor-pointer ${
                  urgency === 'RAT_KHAN'
                    ? 'bg-red-50 border-blood-primary text-blood-dark shadow-md shadow-blood-primary/20 ring-2 ring-blood-primary/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  urgency === 'RAT_KHAN' ? 'bg-blood-primary text-white animate-pulse' : 'bg-red-100 text-blood-primary'
                }`}>
                  <AlertOctagon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-blood-primary flex items-center gap-1.5">
                    <span>RẤT KHẨN (BÁO ĐỘNG ĐỎ)</span>
                    <span className="w-2 h-2 rounded-full bg-blood-primary animate-ping"></span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ca nguy kịch tính mạng, cần máu trong vòng 15 - 30 phút.
                  </p>
                </div>
              </button>

              {/* Nút KHẨN CẤP */}
              <button
                type="button"
                onClick={() => setUrgency('KHAN_CAP')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-3.5 text-left cursor-pointer ${
                  urgency === 'KHAN_CAP'
                    ? 'bg-amber-50 border-warning text-amber-900 shadow-md ring-2 ring-warning/30'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  urgency === 'KHAN_CAP' ? 'bg-warning text-white' : 'bg-amber-100 text-warning'
                }`}>
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-black text-sm text-warning">
                    KHẨN CẤP (ƯU TIÊN 2)
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Ca phẫu thuật dự phòng hoặc điều chuyển máu trong 1 - 2 giờ.
                  </p>
                </div>
              </button>

            </div>
          </div>

          {/* Chọn Nhóm Máu Cần & Số lượng Túi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                3. Chọn Nhóm Máu Cần Cấp <span className="text-blood-primary">*</span>
              </label>
              <span className="text-xs font-bold text-blood-primary">
                Đang chọn: Nhóm {bloodType}
              </span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {bloodGroups.map((grp) => {
                const isSelected = bloodType === grp;
                const isRare = grp.includes('-');
                return (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setBloodType(grp)}
                    className={`py-3 rounded-2xl font-black text-sm sm:text-base border-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-blood-primary text-white border-blood-primary shadow-md shadow-blood-primary/30 scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-red-300 hover:bg-red-50/50'
                    }`}
                  >
                    <span>{grp}</span>
                    <span className={`text-[9px] font-semibold ${isSelected ? 'text-red-100' : isRare ? 'text-blood-primary' : 'text-slate-400'}`}>
                      {isRare ? 'Hiếm' : 'Thường'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Thông tin chi tiết: Bệnh nhân, Số túi, Khoa phòng, Bác sĩ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Số túi cần (Đơn vị máu) <span className="text-blood-primary">*</span>
              </label>
              <div className="relative">
                <Droplet className="w-5 h-5 text-blood-primary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  value={unitsNeeded}
                  onChange={(e) => setUnitsNeeded(Math.max(1, Number(e.target.value)))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Tên bệnh nhân <span className="text-blood-primary">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: BN. Lê Văn A"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Khoa / Phòng yêu cầu
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Khoa Cấp Cứu / ICU"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Bác sĩ phụ trách / Trực ban
              </label>
              <input
                type="text"
                value={contactDoctor}
                onChange={(e) => setContactDoctor(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Hotline liên hệ khẩn cấp <span className="text-blood-primary">*</span>
              </label>
              <div className="relative">
                <PhoneCall className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                  value={contactPhone}
                  onChange={(e) => setContactPhone(sanitizeDigits(e.target.value, 10))}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Ghi chú tình trạng lâm sàng & Chỉ dẫn cấp cứu
            </label>
            <textarea
              rows={2}
              placeholder="Mô tả tóm tắt: Sốc mất máu cấp, đa chấn thương gãy xương đùi, cần chuẩn bị sẵn sàng tiếp nhận..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/30"
            />
          </div>

          {/* Nút Kích Hoạt Lệnh Cấp Cứu */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 text-white font-black rounded-2xl shadow-xl flex items-center justify-center gap-2.5 text-base sm:text-lg transition-all active:scale-98 cursor-pointer ${
              urgency === 'RAT_KHAN'
                ? 'bg-gradient-to-r from-blood-dark via-blood-primary to-red-600 shadow-blood-primary/40 hover:brightness-110'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/30'
            }`}
          >
            {isSubmitting ? (
              <span>Đang kết nối trung tâm điều phối...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>PHÁT LỆNH YÊU CẦU MÁU NGAY LẬP TỨC</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 3. BẢNG THEO DÕI TIẾN ĐỘ XE GIAO MÁU THEO THỜI GIAN THỰC */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-blood-primary" />
              Tiến Độ Xe Giao Máu & Ca Cấp Cứu Thời Gian Thực
            </h2>
            <p className="text-xs text-slate-500">Giám sát lộ trình xe cấp cứu liên viện và thời gian dự kiến tới viện (ETA)</p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
            {requests.length} Ca đang theo dõi
          </span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`bg-white rounded-3xl border-2 p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-md space-y-4 ${
                req.urgency === 'RAT_KHAN' && req.status === 'DANG_GIAO_XE_CAP_CUU'
                  ? 'border-blood-primary ring-2 ring-blood-primary/20 animate-in'
                  : 'border-slate-200'
              }`}
            >
              
              {/* Header ca bệnh */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blood-primary text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md shadow-blood-primary/25">
                    {req.bloodType}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-base">{req.patientName}</span>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                        {req.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {req.department} &bull; Số lượng: <strong className="text-blood-primary">{req.unitsNeeded} Túi máu</strong>
                    </p>
                  </div>
                </div>

                {/* Badge trạng thái vận chuyển & Nút Tắt Thẻ */}
                <div className="flex flex-wrap items-center gap-2">
                  {req.status === 'DANG_GIAO_XE_CAP_CUU' ? (
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold animate-pulse">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Xe Cấp Cứu Đang Giao (ETA: {req.dispatchInfo?.etaMinutes || 10} phút)</span>
                    </div>
                  ) : req.status === 'CHO_DUYET' ? (
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                        <Clock className="w-4 h-4 text-warning" />
                        <span>Đang Chờ Kho Xuất Máu</span>
                      </div>
                      {(user?.role === 'ADMIN' || user?.role === 'HOSPITAL_STAFF') && (
                        <Link
                          to="/admin/dispatch"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black shadow-md shadow-red-500/25 active:scale-95 transition cursor-pointer"
                          title="Chuyển đến trang điều phối xe 115 và xuất kho"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Điều Phối Xe 115</span>
                        </Link>
                      )}
                    </div>
                  ) : req.status === 'DA_HUY' ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                      <PowerOff className="w-4 h-4 text-slate-500" />
                      <span>Đã Tắt Thẻ</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-success border border-emerald-200 text-xs font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Đã Giao / Hoàn Tất</span>
                    </div>
                  )}

                  {req.status !== 'DA_GIAO_THANH_CONG' && req.status !== 'DA_HUY' ? (
                    <button
                      type="button"
                      onClick={() => handleCloseEmergencyCase(req.id, req.patientName)}
                      className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                      title="Bác sĩ / Admin tắt thẻ cấp cứu"
                    >
                      <PowerOff className="w-3.5 h-3.5 text-red-600" />
                      <span>Tắt Thẻ Cấp Cứu</span>
                    </button>
                  ) : req.status === 'DA_HUY' ? (
                    <button
                      type="button"
                      onClick={() => handleRestoreEmergencyCase(req.id, req.patientName)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
                      title="Bác sĩ / Admin mở lại thẻ cấp cứu"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mở Lại Thẻ</span>
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Thông tin xe cấp cứu & Lô máu nếu đang trên đường giao */}
              {req.dispatchInfo && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs">
                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Phương tiện vận chuyển</span>
                    <strong className="text-slate-800 text-sm">{req.dispatchInfo.ambulanceCode}</strong>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Tài xế & Hotline</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-slate-800">{req.dispatchInfo.driverName}</strong>
                      <a
                        href={`tel:${req.dispatchInfo.driverPhone}`}
                        className="text-blood-primary hover:underline font-bold flex items-center gap-1"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> {req.dispatchInfo.driverPhone}
                      </a>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 uppercase font-bold text-[10px] block">Lô máu đã xuất kho</span>
                    <div className="flex items-center gap-1 flex-wrap mt-0.5">
                      {req.dispatchInfo.selectedLots?.map((lot) => (
                        <span key={lot} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded-md font-mono text-[10px] font-bold text-slate-700">
                          {lot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Ghi chú lâm sàng */}
              {req.note && (
                <div className="text-xs text-slate-600 bg-red-50/50 p-2.5 rounded-xl border border-red-100 flex items-center justify-between">
                  <span><strong>Chỉ dẫn:</strong> {req.note}</span>
                  <span className="text-[11px] text-slate-400">Yêu cầu lúc: {req.createdAt}</span>
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default EmergencyRequestPage;
