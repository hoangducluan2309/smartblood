import React, { useState } from 'react';
import { useEmergency } from '../contexts/EmergencyContext';
import { Siren, ArrowRight, Volume2, X, AlertTriangle, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { playEmergencyBeep } from '../utils/soundAlert';

export const EmergencyBanner: React.FC = () => {
  const { activeAlert, emergencyList, dismissActiveAlert } = useEmergency();
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const redAlertCases = emergencyList.filter(
    (request) => !request.isDismissed && request.isAlertActive
  );

  if (!activeAlert || redAlertCases.length === 0) {
    return null;
  }

  const handleReplaySound = () => {
    setIsPlayingSound(true);
    playEmergencyBeep();
    setTimeout(() => setIsPlayingSound(false), 800);
  };

  return (
    <aside
      aria-label="Cảnh báo khẩn cấp hệ thống"
      className="relative z-50 border-b border-red-950 bg-gradient-to-r from-red-700 via-red-700 to-rose-800 text-white shadow-lg shadow-red-950/15"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:px-6 md:min-h-12 md:flex-row md:items-center md:gap-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
            <span className="absolute inset-0 animate-ping rounded-full bg-white/25" />
            <Siren className="relative h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <div className="flex min-w-0 flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wide text-red-700">
              <Radio className="h-3 w-3" />
              Báo Động Đỏ
            </span>
            <span className="text-[11px] font-bold text-red-100 sm:text-xs">
              {redAlertCases.length} yêu cầu máu khẩn cấp đang hoạt động
            </span>
          </div>
        </div>

        <div
          aria-label="Các yêu cầu máu đang báo động đỏ"
          className="flex min-w-0 gap-2 overflow-x-auto pb-0.5 [scrollbar-width:thin] md:flex-1 md:pb-0"
        >
          {redAlertCases.map((request) => (
            <Link
              key={request.id}
              to="/emergency"
              className="inline-flex min-w-0 shrink-0 items-center gap-2 rounded-lg border border-white/15 bg-red-950/25 px-2.5 py-1.5 text-[11px] transition-colors hover:bg-red-950/45 sm:text-xs"
              aria-label={`${request.hospital}, cần ${request.unitsNeeded} đơn vị máu ${request.bloodType}. Xem yêu cầu`}
            >
              <span className="max-w-40 truncate font-bold sm:max-w-56">{request.hospital}</span>
              <span className="shrink-0 text-red-100">·</span>
              <span className="shrink-0 font-black">
                {request.unitsNeeded} túi {request.bloodType}
              </span>
            </Link>
          ))}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-1.5 border-t border-white/15 pt-2 md:border-0 md:pt-0">
          <button
            type="button"
            onClick={handleReplaySound}
            title="Nghe lại chuông cảnh báo"
            aria-label="Nghe lại chuông cảnh báo"
            className={`inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5 text-[11px] font-bold transition hover:bg-white/20 ${
              isPlayingSound ? 'bg-white/25 ring-2 ring-white/50' : ''
            }`}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span>Còi</span>
          </button>
          <Link
            to="/emergency"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-[11px] font-black text-red-700 shadow-sm transition hover:bg-red-50"
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Xử lý yêu cầu</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={dismissActiveAlert}
            title="Ẩn thanh cảnh báo"
            aria-label="Ẩn thanh cảnh báo"
            className="rounded-lg p-1.5 text-red-100 transition hover:bg-white/15 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
