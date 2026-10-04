import React from 'react';
import { MapPin, Clock, AlertTriangle, PhoneCall, Heart } from 'lucide-react';
import { Card, CardBody, CardFooter } from '../common/Card';
import { BloodTypeBadge } from '../common/BloodTypeBadge';
import { Button } from '../common/Button';

/**
 * Reusable UrgentRequestCard Component
 * Card cảnh báo yêu cầu máu khẩn cấp thời gian thực
 */
export const UrgentRequestCard = ({
  request,
  onRespond,
  className = '',
}) => {
  const {
    id,
    hospitalName,
    address,
    bloodType,
    requiredUnits = 1,
    fulfilledUnits = 0,
    urgencyLevel = 'CRITICAL',
    patientCondition,
    timeRemaining,
    distanceKm,
    contactHotline,
    isRareBlood = false,
  } = request;

  // Tính phần trăm đã đáp ứng
  const progressPercent = Math.min(100, Math.round((fulfilledUnits / requiredUnits) * 100));

  const isCritical = urgencyLevel === 'CRITICAL';

  return (
    <Card
      className={`border-l-4 ${isCritical ? 'border-l-red-600' : 'border-l-amber-500'} ${className}`}
      hoverEffect={true}
    >
      <CardBody className="p-4 sm:p-5">
        {/* Header card: Nhóm máu & Trạng thái khẩn cấp */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <BloodTypeBadge
              bloodType={bloodType}
              isRare={isRareBlood}
              size="lg"
            />
          </div>

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isCritical
                ? 'bg-red-100 text-red-700 animate-pulse'
                : 'bg-amber-100 text-amber-800'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {isCritical ? 'CỰC KỲ KHẨN CẤP' : 'CẦN GẤP'}
          </span>
        </div>

        {/* Thông tin bệnh viện & Địa chỉ */}
        <div className="space-y-1.5 mb-3">
          <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
            {hospitalName}
          </h4>
          <p className="flex items-center gap-1.5 text-xs text-slate-500 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>{address}</span>
            {distanceKm && (
              <span className="font-medium text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                Cách {distanceKm} km
              </span>
            )}
          </p>
        </div>

        {/* Tình trạng bệnh nhân */}
        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-4 line-clamp-2 italic">
          "{patientCondition}"
        </p>

        {/* Tiến độ kêu gọi & Thời gian */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-600">
              Đã tiếp nhận: <strong className="text-slate-900">{fulfilledUnits}/{requiredUnits} đơn vị</strong>
            </span>
            <span className="flex items-center gap-1 text-red-600 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              Còn lại: {timeRemaining}
            </span>
          </div>

          {/* Thanh tiến độ */}
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                progressPercent >= 100 ? 'bg-emerald-500' : 'bg-brand-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardBody>

      {/* Footer: Nút hành động */}
      <CardFooter className="p-3 sm:px-5 sm:py-3 flex items-center justify-between gap-2">
        {contactHotline && (
          <a
            href={`tel:${contactHotline}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-brand-600 px-2 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <PhoneCall className="w-4 h-4 text-brand-500" />
            <span className="hidden sm:inline">Gọi viện:</span>
            <span>{contactHotline}</span>
          </a>
        )}

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Heart className="w-4 h-4 fill-white" />}
          onClick={() => onRespond && onRespond(request)}
          className="ml-auto"
        >
          Tôi có thể hiến
        </Button>
      </CardFooter>
    </Card>
  );
};
