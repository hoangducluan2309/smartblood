import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Hospital, 
  Droplet, 
  Heart, 
  Phone, 
  ExternalLink, 
  Search, 
  Compass, 
  Clock, 
  Layers,
  Crosshair
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import toast from 'react-hot-toast';

// ==============================================================================
// 1. TÍNH TOÁN KHOẢNG CÁCH HAVERSINE (KM) THEO GPS
// ==============================================================================
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Bán kính Trái Đất (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// ==============================================================================
// 2. TẠO CUSTOM SVG MARKERS (TRÁNH LỖI ĐƯỜNG DẪN ẢNH LEAFLET TRONG VITE)
// ==============================================================================
const createHospitalMarkerIcon = (isCritical: boolean, isSelected: boolean) => {
  const size = isSelected ? 46 : isCritical ? 42 : 36;
  const bgColor = isCritical ? '#DC2626' : '#2563EB';

  return L.divIcon({
    className: 'custom-hospital-marker',
    html: `
      <div style="position: relative; width: ${size}px; height: ${size}px;">
        ${isCritical ? `<div style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(220, 38, 38, 0.45); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${bgColor};
          border: 3px solid #FFFFFF;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          <svg style="transform: rotate(45deg); width: ${size * 0.52}px; height: ${size * 0.52}px; fill: white;" viewBox="0 0 24 24">
            <path d="M19 10.5V9a1 1 0 0 0-1-1h-4V4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v4H6a1 1 0 0 0-1 1v1.5a1 1 0 0 0 1 1h4V16a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4.5h4a1 1 0 0 0 1-1z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const createDonationMarkerIcon = (isSelected: boolean) => {
  const size = isSelected ? 44 : 36;
  return L.divIcon({
    className: 'custom-donation-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: #059669;
        border: 3px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(5, 150, 105, 0.4);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg style="transform: rotate(45deg); width: ${size * 0.52}px; height: ${size * 0.52}px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

const createUserLocationMarkerIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 26px; height: 26px;">
        <div style="position: absolute; inset: -8px; border-radius: 50%; background: rgba(59, 130, 246, 0.45); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #2563EB;
          border: 3.5px solid #FFFFFF;
          box-shadow: 0 2px 10px rgba(37, 99, 235, 0.6);
        "></div>
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -13],
  });
};

// ==============================================================================
// 3. ĐIỀU HƯỚNG GÓC NHÌN BẢN ĐỒ (FLY TO LOCATION)
// ==============================================================================
const MapController: React.FC<{ 
  target: [number, number] | null; 
  zoom?: number;
}> = ({ target, zoom = 15 }) => {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo(target, zoom, { duration: 1.2 });
    }
  }, [target, zoom, map]);

  return null;
};

// ==============================================================================
// 4. DỮ LIỆU ĐỊA CHỈ & TỌA ĐỘ BỆNH VIỆN / ĐIỂM HIẾN MÁU TP.HCM
// ==============================================================================
interface MedicalLocation {
  id: string;
  name: string;
  type: 'HOSPITAL' | 'DONATION_POINT';
  address: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  defaultNeed: string;
  isEmergencyActive?: boolean;
  emergencyDetail?: string;
  activeBloodGroup?: string;
  operatingHours?: string;
}

const INITIAL_LOCATIONS: MedicalLocation[] = [
  {
    id: 'HOSP-1',
    name: 'Bệnh viện Chợ Rẫy (Khoa Cấp Cứu)',
    type: 'HOSPITAL',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5',
    district: 'Quận 5',
    lat: 10.7578,
    lng: 106.6595,
    phone: '028 3855 4137',
    defaultNeed: 'O-, A+, O+',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-2',
    name: 'Bệnh viện Từ Dũ (Khoa Cấp Cứu Sản)',
    type: 'HOSPITAL',
    address: '284 Cống Quỳnh, Phường Phạm Ngũ Lão, Quận 1',
    district: 'Quận 1',
    lat: 10.7681,
    lng: 106.6873,
    phone: '028 5404 2829',
    defaultNeed: 'O- (RẤT KHẨN)',
    isEmergencyActive: true,
    emergencyDetail: 'Ca cấp cứu hôn mê cần gấp 350ml máu O-',
    activeBloodGroup: 'O-',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-3',
    name: 'Bệnh viện Truyền Máu Huyết Học TP.HCM',
    type: 'HOSPITAL',
    address: '118 Hồng Bàng, Phường 12, Quận 5',
    district: 'Quận 5',
    lat: 10.7538,
    lng: 106.6628,
    phone: '028 3855 2404',
    defaultNeed: 'Tất cả các nhóm (B+, O+, A+)',
    operatingHours: '07:00 - 17:00',
  },
  {
    id: 'HOSP-4',
    name: 'Bệnh viện Đại Học Y Dược TP.HCM',
    type: 'HOSPITAL',
    address: '215 Hồng Bàng, Phường 11, Quận 5',
    district: 'Quận 5',
    lat: 10.7552,
    lng: 106.6601,
    phone: '028 3855 4269',
    defaultNeed: 'AB-, A-, O-',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-5',
    name: 'Bệnh viện Nhân Dân 115 (Khoa Cấp Cứu)',
    type: 'HOSPITAL',
    address: '527 Sư Vạn Hạnh, Phường 12, Quận 10',
    district: 'Quận 10',
    lat: 10.7725,
    lng: 106.6644,
    phone: '028 3865 2368',
    defaultNeed: 'A-, O+',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-6',
    name: 'Bệnh viện Thống Nhất (Khoa Cấp Cứu)',
    type: 'HOSPITAL',
    address: '01 Lý Thường Kiệt, Phường 7, Quận Tân Bình',
    district: 'Tân Bình',
    lat: 10.7938,
    lng: 106.6545,
    phone: '028 3864 2142',
    defaultNeed: 'O+, B-',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-7',
    name: 'Bệnh viện Nhi Đồng 1 (Khoa Hồi Sức Tích Cực)',
    type: 'HOSPITAL',
    address: '341 Sư Vạn Hạnh, Phường 10, Quận 10',
    district: 'Quận 10',
    lat: 10.7685,
    lng: 106.6685,
    phone: '028 3927 1119',
    defaultNeed: 'B-, A+',
    operatingHours: 'Cấp cứu 24/7',
  },
  {
    id: 'HOSP-8',
    name: 'Bệnh viện Nhân Dân Gia Định (Khoa Cấp Cứu)',
    type: 'HOSPITAL',
    address: '01 Nơ Trang Long, Phường 7, Quận Bình Thạnh',
    district: 'Bình Thạnh',
    lat: 10.8038,
    lng: 106.6946,
    phone: '028 3841 2692',
    defaultNeed: 'AB+, O+',
    operatingHours: 'Cấp cứu 24/7',
  },

  // Điểm tiếp nhận hiến máu cố định & sự kiện
  {
    id: 'DONATE-1',
    name: 'Nhà Văn Hóa Thanh Niên TP.HCM (Điểm Hiến Máu)',
    type: 'DONATION_POINT',
    address: 'Số 04 Phạm Ngọc Thạch, Phường Bến Nghé, Quận 1',
    district: 'Quận 1',
    lat: 10.7818,
    lng: 106.6985,
    phone: '028 3822 5146',
    defaultNeed: 'Tiếp nhận tất cả nhóm máu',
    operatingHours: '07:30 - 11:30 (Thứ 2 - Thứ 7)',
  },
  {
    id: 'DONATE-2',
    name: 'Trung Tâm Hiến Máu Nhân Đạo TP.HCM',
    type: 'DONATION_POINT',
    address: '106 Thiên Phước, Phường 9, Quận Tân Bình',
    district: 'Tân Bình',
    lat: 10.7785,
    lng: 106.6582,
    phone: '028 3868 5507',
    defaultNeed: 'Tiếp nhận tiểu cầu & máu toàn phần',
    operatingHours: '07:00 - 16:30 (Hàng ngày)',
  },
  {
    id: 'DONATE-3',
    name: 'Đại Học Khoa Học Tự Nhiên TP.HCM (Điểm Tiếp Nhận)',
    type: 'DONATION_POINT',
    address: '227 Nguyễn Văn Cừ, Phường 4, Quận 5',
    district: 'Quận 5',
    lat: 10.7628,
    lng: 106.6825,
    phone: '028 6288 4499',
    defaultNeed: 'Hành trình đỏ sinh viên',
    operatingHours: '08:00 - 12:00',
  },
];

export const MapPage: React.FC = () => {
  const { emergencyList } = useEmergency();

  // Tọa độ trung tâm mặc định (Trung tâm TP.HCM: Nhà thờ Đức Bà / Q1)
  const defaultCenter: [number, number] = [10.7769, 106.7009];

  // States
  const [locations, setLocations] = useState<MedicalLocation[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<MedicalLocation | null>(null);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'ALL' | 'HOSPITAL' | 'DONATION_POINT'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // 1. Đồng bộ ca cấp cứu thời gian thực từ Database vào danh sách bệnh viện
  useEffect(() => {
    if (emergencyList && emergencyList.length > 0) {
      const activeEmergencies = emergencyList.filter((e) => !e.isDismissed);

      setLocations((prev) =>
        prev.map((loc) => {
          // Khớp bệnh viện theo tên
          const matchedEmg = activeEmergencies.find((emg) =>
            loc.name.toLowerCase().includes(emg.hospital.toLowerCase()) ||
            emg.hospital.toLowerCase().includes(loc.name.toLowerCase()) ||
            (emg.hospital.includes('Từ Dũ') && loc.id === 'HOSP-2') ||
            (emg.hospital.includes('Chợ Rẫy') && loc.id === 'HOSP-1')
          );

          if (matchedEmg) {
            return {
              ...loc,
              isEmergencyActive: true,
              emergencyDetail: `${matchedEmg.patient} - Cần ${matchedEmg.units}`,
              activeBloodGroup: matchedEmg.bloodType,
            };
          }
          return loc;
        })
      );
    }
  }, [emergencyList]);

  // 2. Định vị GPS người dùng (Vị trí của tôi)
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error('Trình duyệt của bạn không hỗ trợ định vị GPS.');
      return;
    }

    setIsLocating(true);
    toast.loading('Đang định vị tọa độ GPS của bạn...', { id: 'locating-toast' });

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;
        setUserLocation([userLat, userLng]);
        setFlyTarget([userLat, userLng]);
        setIsLocating(false);
        toast.dismiss('locating-toast');
        toast.success('Đã xác định vị trí của bạn trên bản đồ!', { icon: '📍' });
      },
      (_err) => {
        setIsLocating(false);
        toast.dismiss('locating-toast');
        // Fallback định vị tại trung tâm TP.HCM nếu bị từ chối quyền
        const fallbackPos: [number, number] = [10.7725, 106.6800];
        setUserLocation(fallbackPos);
        setFlyTarget(fallbackPos);
        toast('Mặc định lấy vị trí trung tâm TP. Hồ Chí Minh.', { icon: '🏙️' });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  // 3. Tính toán khoảng cách và sắp xếp theo vị trí gần nhất
  const processedLocations = useMemo(() => {
    return locations.map((loc) => {
      let distanceText = 'Chưa định vị';
      let distanceNum = 999;

      if (userLocation) {
        const km = calculateDistanceKm(userLocation[0], userLocation[1], loc.lat, loc.lng);
        distanceText = `${km} km`;
        distanceNum = km;
      } else {
        // Khoảng cách ước tính tương đối từ trung tâm Quận 1
        const km = calculateDistanceKm(defaultCenter[0], defaultCenter[1], loc.lat, loc.lng);
        distanceText = `~${km} km (từ TT)`;
        distanceNum = km;
      }

      return {
        ...loc,
        distanceText,
        distanceNum,
      };
    });
  }, [locations, userLocation]);

  // 4. Lọc theo danh mục và tìm kiếm
  const filteredLocations = useMemo(() => {
    return processedLocations
      .filter((loc) => {
        if (filterType === 'HOSPITAL') return loc.type === 'HOSPITAL';
        if (filterType === 'DONATION_POINT') return loc.type === 'DONATION_POINT';
        return true;
      })
      .filter((loc) => {
        if (!searchTerm.trim()) return true;
        const q = searchTerm.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.address.toLowerCase().includes(q) ||
          loc.district.toLowerCase().includes(q) ||
          loc.defaultNeed.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Ưu tiên ca đang cấp cứu lên trước, sau đó sắp xếp theo khoảng cách gần nhất
        if (a.isEmergencyActive && !b.isEmergencyActive) return -1;
        if (!a.isEmergencyActive && b.isEmergencyActive) return 1;
        return a.distanceNum - b.distanceNum;
      });
  }, [processedLocations, filterType, searchTerm]);

  // Click vào điểm bệnh viện -> Bay tới tọa độ trên bản đồ
  const handleSelectLocation = (loc: MedicalLocation) => {
    setSelectedLocation(loc);
    setFlyTarget([loc.lat, loc.lng]);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-300">
      
      {/* 1. HEADER SECTION (TIÊU ĐỀ & NÚT VỊ TRÍ CỦA TÔI) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-blood-primary text-xs font-black uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
            Hệ Thống Bản Đồ Số GIS & Định Vị Cứu Trợ 24/7
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Bản Đồ Điều Phối Cứu Trợ
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Định vị các bệnh viện đang báo động đỏ cần máu và các điểm tiếp nhận hiến máu gần bạn nhất
          </p>
        </div>

        {/* Nút Vị Trí Của Tôi (GPS) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <Navigation className={`w-4 h-4 text-amber-300 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Đang định vị...' : 'Vị trí của tôi'}</span>
          </button>
        </div>
      </div>

      {/* 2. THANH LỌC DANH MỤC & TÌM KIẾM NHANH */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
        
        {/* Bộ lọc loại điểm */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            Tất Cả ({processedLocations.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterType('HOSPITAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'HOSPITAL'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/60'
            }`}
          >
            <Hospital className="w-3.5 h-3.5" />
            <span>Bệnh Viện Cần Máu ({processedLocations.filter((l) => l.type === 'HOSPITAL').length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterType('DONATION_POINT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              filterType === 'DONATION_POINT'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>Điểm Hiến Máu ({processedLocations.filter((l) => l.type === 'DONATION_POINT').length})</span>
          </button>
        </div>

        {/* Ô Tìm kiếm */}
        <div className="relative min-w-[220px] sm:min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm tên bệnh viện, quận huyện..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blood-primary/20"
          />
        </div>
      </div>

      {/* 3. BẢN ĐỒ TƯƠNG TÁC LEAFLET GIS MAP CONTAINER */}
      <div className="relative w-full h-[460px] sm:h-[520px] lg:h-[580px] bg-slate-100 rounded-3xl border-2 border-slate-200/90 shadow-xl overflow-hidden z-0">
        
        {/* Bản đồ Leaflet thực tế */}
        <MapContainer
          center={defaultCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
          style={{ minHeight: '100%', height: '100%' }}
        >
          {/* Tile Layer Bản đồ OpenStreetMap độ phân giải cao */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Điều khiển bay tới tọa độ */}
          <MapController target={flyTarget} zoom={15} />

          {/* Vòng tròn bán kính GPS người dùng */}
          {userLocation && (
            <>
              <Circle
                center={userLocation}
                radius={800}
                pathOptions={{
                  fillColor: '#3B82F6',
                  fillOpacity: 0.12,
                  color: '#2563EB',
                  weight: 1.5,
                  dashArray: '4, 4',
                }}
              />
              <Marker position={userLocation} icon={createUserLocationMarkerIcon()}>
                <Popup minWidth={200}>
                  <div className="p-1 space-y-1 text-xs">
                    <span className="font-black text-blue-600 block">📍 VỊ TRÍ HIỆN TẠI CỦA BẠN</span>
                    <p className="text-slate-600 text-[11px]">Đã định vị thành công qua thiết bị của bạn.</p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}

          {/* Markers Bệnh Viện & Điểm Hiến Máu */}
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const isHospital = loc.type === 'HOSPITAL';
            const isCritical = loc.isEmergencyActive || loc.defaultNeed.includes('KHẨN');

            return (
              <Marker
                key={loc.id}
                position={[loc.lat, loc.lng]}
                icon={
                  isHospital
                    ? createHospitalMarkerIcon(Boolean(isCritical), isSelected)
                    : createDonationMarkerIcon(isSelected)
                }
              >
                <Popup className="custom-leaflet-popup" minWidth={270}>
                  <div className="p-1 space-y-2.5 text-xs">
                    
                    {/* Header Popup */}
                    <div className="border-b border-slate-100 pb-2">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {isHospital ? (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                            isCritical ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-blue-100 text-blue-800'
                          }`}>
                            <Hospital className="w-3 h-3" />
                            {isCritical ? '🚨 CẤP CỨU KHẨN' : 'BỆNH VIỆN TIẾP NHẬN'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Heart className="w-3 h-3 fill-emerald-700" />
                            ĐIỂM HIẾN MÁU
                          </span>
                        )}
                        <span className="text-[11px] font-bold text-slate-500">{loc.distanceText}</span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                        {loc.name}
                      </h4>
                    </div>

                    {/* Chi tiết nhu cầu & Địa chỉ */}
                    <div className="space-y-1.5 text-slate-600 text-[11px]">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="leading-tight">{loc.address}</span>
                      </div>

                      {isHospital && (
                        <div className="p-2 rounded-xl bg-red-50 border border-red-200/60 text-red-700 font-bold">
                          <span className="block text-[10px] uppercase tracking-wider text-red-500 font-black">
                            Nhóm máu đang cần gấp:
                          </span>
                          <span className="text-xs font-black text-blood-primary">
                            {loc.activeBloodGroup ? `Nhóm ${loc.activeBloodGroup} (Hỏa tốc)` : loc.defaultNeed}
                          </span>
                        </div>
                      )}

                      {loc.operatingHours && (
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Giờ làm việc: {loc.operatingHours}</span>
                        </div>
                      )}

                      {loc.phone && (
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Đường dây nóng: {loc.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Nút Chỉ đường Google Maps */}
                    <div className="pt-2 flex items-center gap-2">
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-[11px] flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition"
                      >
                        <Compass className="w-3.5 h-3.5 text-amber-300" />
                        <span>Chỉ Đường</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>

                      {loc.phone && (
                        <a
                          href={`tel:${loc.phone.replace(/\s+/g, '')}`}
                          className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-[11px] flex items-center justify-center gap-1 active:scale-95 transition"
                          title="Gọi điện thoại trực tiếp"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Gọi</span>
                        </a>
                      )}
                    </div>

                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Chú giải góc bản đồ (Floating Legend Badge) */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200/90 shadow-lg text-[11px] space-y-1.5 max-w-[260px] pointer-events-auto">
          <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            <span>Chú Giải Ký Hiệu Bản Đồ</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-600 ring-2 ring-red-300 shrink-0 animate-pulse"></span>
            <span className="text-slate-700 font-medium">Bệnh viện báo động đỏ cần máu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 shrink-0"></span>
            <span className="text-slate-700 font-medium">Bệnh viện tiếp nhận chi viện</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600 shrink-0"></span>
            <span className="text-slate-700 font-medium">Điểm tiếp nhận hiến máu tình nguyện</span>
          </div>
        </div>

        {/* Nút reset căn giữa toàn TP.HCM */}
        <button
          type="button"
          onClick={() => setFlyTarget(defaultCenter)}
          className="absolute top-4 right-4 z-20 p-2.5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 shadow-md text-slate-700 hover:text-slate-950 hover:bg-white text-xs font-bold flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
          title="Căn giữa toàn cảnh TP.HCM"
        >
          <Crosshair className="w-4 h-4 text-blood-primary" />
          <span className="hidden sm:inline">Căn giữa TP.HCM</span>
        </button>
      </div>

      {/* 4. DANH SÁCH THẺ BỆNH VIỆN & ĐIỂM TIẾP NHẬN CỨU TRỢ (CARDS LIST) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Hospital className="w-5 h-5 text-blood-primary" />
            <span>Danh Sách Điểm Cứu Trợ & Bệnh Viện ({filteredLocations.length} địa điểm)</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Nhấn vào thẻ để tự động phóng to tọa độ trên bản đồ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation?.id === loc.id;
            const isHospital = loc.type === 'HOSPITAL';
            const isCritical = loc.isEmergencyActive || loc.defaultNeed.includes('KHẨN');

            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocation(loc)}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer space-y-3 ${
                  isSelected
                    ? 'bg-red-50/60 border-blood-primary ring-4 ring-blood-primary/10'
                    : isCritical
                    ? 'bg-white border-red-300 hover:border-red-500'
                    : 'bg-white border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Header Thẻ */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                      isHospital
                        ? isCritical ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {isHospital ? <Hospital className="w-5 h-5" /> : <Heart className="w-5 h-5 fill-current" />}
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1">
                        {loc.name}
                      </h3>
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        {loc.district} &bull; Cách bạn: <strong className="text-slate-800">{loc.distanceText}</strong>
                      </span>
                    </div>
                  </div>

                  {isCritical ? (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase shrink-0 border border-red-200 animate-pulse">
                      BÁO ĐỘNG ĐỎ
                    </span>
                  ) : null}
                </div>

                {/* Địa chỉ */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {loc.address}
                </p>

                {/* Nhu cầu nhóm máu & Nút chỉ đường */}
                <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-100">
                  <div className="flex items-center gap-1 font-bold text-blood-primary truncate max-w-[200px]">
                    <Droplet className="w-3.5 h-3.5 fill-blood-primary shrink-0" />
                    <span className="truncate">
                      Cần: {loc.activeBloodGroup ? `Nhóm ${loc.activeBloodGroup} (Gấp)` : loc.defaultNeed}
                    </span>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition shrink-0"
                    title="Mở chỉ đường Google Maps"
                  >
                    <span>Chỉ đường</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default MapPage;
