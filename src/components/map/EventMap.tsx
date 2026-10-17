import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DonationEvent } from '../../types';
import { MapPin, Calendar, Clock, Users, ArrowRight, Heart } from 'lucide-react';

// Tạo Custom SVG Red Marker cho Leaflet không bị lỗi đường dẫn ảnh trong Vite
const createBloodMarkerIcon = (isSelected: boolean = false) => {
  const size = isSelected ? 42 : 36;
  return L.divIcon({
    className: 'custom-blood-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${isSelected ? '#991B1B' : '#DC2626'};
        border: 3px solid #FFFFFF;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.45);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg style="transform: rotate(45deg); width: 18px; height: 18px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

// Component tự động căn chỉnh vùng nhìn của bản đồ bao trùm tất cả markers
const ChangeView: React.FC<{ center?: [number, number]; events: DonationEvent[] }> = ({ center, events }) => {
  const map = useMap();

  useEffect(() => {
    if (events && events.length > 0) {
      const bounds = L.latLngBounds(events.map((e) => [e.lat, e.lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (center) {
      map.setView(center, 13);
    }
  }, [events, center, map]);

  return null;
};

interface EventMapProps {
  events: DonationEvent[];
  selectedEventId?: string | number | null;
  onSelectEvent: (event: DonationEvent) => void;
  className?: string;
}

export const EventMap: React.FC<EventMapProps> = ({
  events,
  selectedEventId,
  onSelectEvent,
  className = 'h-[450px] md:h-[550px] w-full rounded-2xl',
}) => {
  // Tọa độ trung tâm mặc định (TP. Hồ Chí Minh)
  const defaultCenter: [number, number] = [10.7769, 106.7009];

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-slate-200/90 shadow-md ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ minHeight: '350px' }}
      >
        <ChangeView events={events} center={defaultCenter} />

        {/* Bản đồ nền OpenStreetMap độ phân giải cao */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Danh sách Markers các điểm hiến máu */}
        {events.map((evt) => {
          const isSelected = selectedEventId === evt.id;
          return (
            <Marker
              key={evt.id}
              position={[evt.lat, evt.lng]}
              icon={createBloodMarkerIcon(isSelected)}
            >
              <Popup className="custom-leaflet-popup" minWidth={260}>
                <div className="p-1 space-y-3">
                  
                  {/* Header Popup */}
                  <div className="border-b border-slate-100 pb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-blood-primary text-[10px] font-black uppercase tracking-wider">
                      <Heart className="w-3 h-3 fill-blood-primary" /> {evt.quanHuyen}
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm mt-1 leading-snug">
                      {evt.tenSuKien}
                    </h4>
                  </div>

                  {/* Chi tiết địa điểm & thời gian */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="leading-tight font-medium">
                        <strong>{evt.diaDiem}</strong> - {evt.diaChi}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-blood-primary shrink-0" />
                      <span>{evt.ngayToChuc}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.gioBatDau} - {evt.gioKetThuc}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-500 font-medium pt-1">
                      <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>Đã đăng ký: <strong className="text-slate-800">{evt.daDangKy}/{evt.chiTieu}</strong> người</span>
                    </div>
                  </div>

                  {/* Nút Đăng ký tại điểm này */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onSelectEvent(evt)}
                      className="w-full py-2.5 px-3 bg-blood-primary hover:bg-blood-dark text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                    >
                      <span>Đăng ký tại điểm này</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default EventMap;
