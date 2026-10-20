import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Droplet, 
  Bell, 
  Flame, 
  Menu, 
  X,
  LogIn,
  ArrowRight,
  ChevronRight,
  CalendarCheck,
  Clock3,
  HeartPulse,
  Siren,
  Home,
  MapPin,
} from 'lucide-react';
import { useEmergency } from '../contexts/EmergencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useCallModal } from '../contexts/CallModalContext';
import { axiosClient } from '../api/axiosClient';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: 'red' | 'amber' | 'blue' | 'emerald';
  createdAt?: string;
}

interface EmergencyNotificationRecord {
  id: string | number;
  trangThai: string;
  nhomMauCan?: string;
  benhVienYeuCau?: string;
  soLuongCanMl?: number;
  mucDoKhanCap?: string;
  ngayTao?: string;
}

interface AppointmentNotificationRecord {
  id: string | number;
  trangThai?: string;
  ngayHen?: string;
  khungGio?: string;
  ngayTao?: string;
  ngayCapNhat?: string;
  nguoiHien?: { hoTen?: string };
}

interface DonationAppointmentCreatedEvent {
  id: number;
  donorName: string;
  appointmentDate: string;
  timeSlot: string;
  createdAt: string;
}

const RECENT_APPOINTMENT_NOTIFICATION_WINDOW_MS = 30 * 60 * 1000;

const getNotificationTimestamp = (notification: NotificationItem): number => {
  if (!notification.createdAt) return 0;
  const timestamp = new Date(notification.createdAt).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
};

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { urgentCount, emergencyList } = useEmergency();
  const { isAuthenticated, user, token } = useAuth();
  const { openCallModal } = useCallModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationIds, setUnreadNotificationIds] = useState<Set<string>>(new Set());
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [notificationError, setNotificationError] = useState('');
  const notificationCloseTimeout = useRef<number | null>(null);
  const knownNotificationIds = useRef(new Set<string>());
  const readNotificationIds = useRef(new Set<string>());
  const realtimeAppointmentNotifications = useRef(new Map<string, NotificationItem>());
  const hasInitialNotificationSnapshot = useRef(false);
  const initialNotificationSnapshotAt = useRef(0);
  const isLoadingNotificationsRef = useRef(false);
  const currentUserId = user?.id;
  const currentUserRole = user?.role;

  // Đóng menu khi chuyển trang
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationOpen(false);
    if (notificationCloseTimeout.current !== null) {
      window.clearTimeout(notificationCloseTimeout.current);
      notificationCloseTimeout.current = null;
    }
    return () => {
      if (notificationCloseTimeout.current !== null) {
        window.clearTimeout(notificationCloseTimeout.current);
      }
    };
  }, [location.pathname]);

  const loadNotifications = useCallback(async () => {
    if (!currentUserId || !currentUserRole || isLoadingNotificationsRef.current) return;
    isLoadingNotificationsRef.current = true;
    setIsLoadingNotifications(true);
    setNotificationError('');
    const nextNotifications: NotificationItem[] = [];
    const requestStartedAt = Date.now();

    try {
      const emergencyResponse = await axiosClient.get('/emergency-requests/public');
      const emergencyRecords = emergencyResponse.data?.data;
      if (!Array.isArray(emergencyRecords)) {
        throw new Error('Định dạng danh sách cấp cứu không hợp lệ.');
      }
      const activeEmergencies = (emergencyRecords as EmergencyNotificationRecord[])
        .filter((request) => request.trangThai !== 'DaHuy' && request.trangThai !== 'DaDapUng');
      for (const request of activeEmergencies) {
        const units = Math.max(1, Math.round((request.soLuongCanMl || 700) / 350));
        nextNotifications.push({
          id: `emergency-${request.id}`,
          title: 'Ca cấp cứu cần hỗ trợ',
          description: `${request.benhVienYeuCau || 'Cơ sở y tế'} cần ${units} đơn vị nhóm ${request.nhomMauCan || 'máu'}.`,
          path: currentUserRole === 'DONOR'
            ? '/emergency'
            : currentUserRole === 'ADMIN'
              ? '/admin/dispatch'
              : '/staff/emergency-request',
          icon: Siren,
          tone: 'red',
          createdAt: request.ngayTao,
        });
      }

      if (currentUserRole === 'DONOR') {
        const response = await axiosClient.get('/donation-appointments/my-history');
        const history = (Array.isArray(response.data) ? response.data : response.data?.data) as AppointmentNotificationRecord[] | undefined;
        if (!Array.isArray(history)) {
          throw new Error('Định dạng lịch sử lịch hẹn không hợp lệ.');
        }
        if (history.length > 0) {
          const latestAppointment = [...history].sort((first, second) => {
            const firstTimestamp = new Date(first.ngayCapNhat || first.ngayTao || first.ngayHen || 0).getTime();
            const secondTimestamp = new Date(second.ngayCapNhat || second.ngayTao || second.ngayHen || 0).getTime();
            return (Number.isFinite(secondTimestamp) ? secondTimestamp : 0) -
              (Number.isFinite(firstTimestamp) ? firstTimestamp : 0);
          })[0];
          const statusMessages: Record<string, string> = {
            CHO_TIEP_NHAN: 'đang chờ xác nhận',
            DA_TIEP_NHAN: 'đã được xác nhận',
            HOAN_THANH: 'đã hoàn thành',
            DA_HUY: 'đã bị hủy',
          };
          const status = latestAppointment.trangThai
            ? statusMessages[latestAppointment.trangThai] || 'đang được cập nhật'
            : 'đang được cập nhật';
          nextNotifications.push({
            id: `appointment-${latestAppointment.id}-${latestAppointment.trangThai}`,
            title: 'Cập nhật lịch hiến máu gần nhất',
            description: `Lịch hẹn của bạn ${status}. Nhấn để xem chi tiết.`,
            path: '/my-history',
            icon: latestAppointment.trangThai === 'CHO_TIEP_NHAN' ? Clock3 : CalendarCheck,
            tone: latestAppointment.trangThai === 'HOAN_THANH' ? 'emerald' : 'blue',
            createdAt: latestAppointment.ngayCapNhat || latestAppointment.ngayTao || latestAppointment.ngayHen,
          });
        }
      } else {
        const response = await axiosClient.get('/donation-appointments', {
          params: { page: 1, limit: 20, trangThai: 'ChoXacNhan' },
        });
        const pendingAppointments = response.data?.data?.items;
        if (!Array.isArray(pendingAppointments)) {
          throw new Error('Định dạng danh sách lịch chờ duyệt không hợp lệ.');
        }
        for (const appointment of pendingAppointments as AppointmentNotificationRecord[]) {
          nextNotifications.push({
            id: `pending-appointment-${appointment.id}`,
            title: 'Lịch hiến máu mới chờ duyệt',
            description: `${appointment.nguoiHien?.hoTen || 'Người hiến máu'} đăng ký lịch${appointment.ngayHen ? ` ngày ${new Date(appointment.ngayHen).toLocaleDateString('vi-VN')}` : ''}${appointment.khungGio ? `, ${appointment.khungGio}` : ''}.`,
            path: currentUserRole === 'ADMIN' ? '/admin/appointments' : '/staff/reception',
            icon: CalendarCheck,
            tone: 'amber',
            createdAt: appointment.ngayTao,
          });
        }
      }

      const fetchedNotificationIds = new Set(nextNotifications.map((item) => item.id));
      realtimeAppointmentNotifications.current.forEach((item, id) => {
        const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        if (fetchedNotificationIds.has(id)) {
          realtimeAppointmentNotifications.current.delete(id);
        } else if (createdAt >= requestStartedAt) {
          nextNotifications.push(item);
        } else {
          realtimeAppointmentNotifications.current.delete(id);
        }
      });

      const currentIds = new Set(nextNotifications.map((item) => item.id));
      const isInitialSnapshot = !hasInitialNotificationSnapshot.current;
      const newlyObservedNotifications = nextNotifications.filter((item) => {
        if (knownNotificationIds.current.has(item.id)) return false;
        if (!isInitialSnapshot) return true;
        const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        return createdAt > initialNotificationSnapshotAt.current ||
          (item.id.startsWith('pending-appointment-') &&
            createdAt >= Date.now() - RECENT_APPOINTMENT_NOTIFICATION_WINDOW_MS);
      });
      if (newlyObservedNotifications.length > 0 || !isInitialSnapshot) {
        setUnreadNotificationIds((currentUnread) => {
          const nextUnread = new Set([...currentUnread].filter((id) => currentIds.has(id)));
          newlyObservedNotifications.forEach((item) => {
            if (!readNotificationIds.current.has(item.id)) {
              nextUnread.add(item.id);
            }
          });
          return nextUnread;
        });
      }
      nextNotifications.forEach((item) => knownNotificationIds.current.add(item.id));
      if (!hasInitialNotificationSnapshot.current) {
        initialNotificationSnapshotAt.current = Date.now();
      }
      hasInitialNotificationSnapshot.current = true;
      nextNotifications.sort((first, second) =>
        getNotificationTimestamp(second) - getNotificationTimestamp(first)
      );
      setNotifications(nextNotifications);
    } catch (error) {
      console.error('Không thể tải thông báo:', error);
      setNotificationError('Không thể tải đầy đủ thông báo. Vui lòng thử lại.');
    } finally {
      isLoadingNotificationsRef.current = false;
      setIsLoadingNotifications(false);
    }
  }, [currentUserId, currentUserRole]);

  useEffect(() => {
    knownNotificationIds.current.clear();
    realtimeAppointmentNotifications.current.clear();
    readNotificationIds.current.clear();
    hasInitialNotificationSnapshot.current = false;
    initialNotificationSnapshotAt.current = 0;
    setUnreadNotificationIds(new Set());
    setNotifications([]);
    if (!isAuthenticated || !currentUserId || !currentUserRole) return;

    try {
      const savedReadIds = sessionStorage.getItem(`bloodsmart-read-notifications-${currentUserId}`);
      const parsedReadIds: unknown = savedReadIds ? JSON.parse(savedReadIds) : [];
      if (Array.isArray(parsedReadIds) && parsedReadIds.every((id) => typeof id === 'string')) {
        readNotificationIds.current = new Set(parsedReadIds);
      }
    } catch (error) {
      console.error('Không thể khôi phục trạng thái thông báo đã đọc:', error);
    }

    initialNotificationSnapshotAt.current = Date.now();
    void loadNotifications();
    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, 30_000);
    return () => window.clearInterval(intervalId);
  }, [isAuthenticated, currentUserId, currentUserRole, loadNotifications]);

  useEffect(() => {
    if (!isAuthenticated || !token || !['ADMIN', 'HOSPITAL_STAFF'].includes(currentUserRole || '')) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    socket.on('donation-appointment:created', (appointment: DonationAppointmentCreatedEvent) => {
      const notificationId = `pending-appointment-${appointment.id}`;
      knownNotificationIds.current.add(notificationId);
      readNotificationIds.current.delete(notificationId);
      try {
        sessionStorage.setItem(
          `bloodsmart-read-notifications-${currentUserId}`,
          JSON.stringify([...readNotificationIds.current])
        );
      } catch (error) {
        console.error('Không thể lưu trạng thái thông báo:', error);
      }
      setNotifications((current) => {
        const withoutDuplicate = current.filter((item) => item.id !== notificationId);
        const newNotification: NotificationItem = {
          id: notificationId,
          title: 'Lịch hiến máu mới chờ duyệt',
          description: `${appointment.donorName} vừa đăng ký lịch ngày ${new Date(appointment.appointmentDate).toLocaleDateString('vi-VN')}, ${appointment.timeSlot}.`,
          path: currentUserRole === 'ADMIN' ? '/admin/appointments' : '/staff/reception',
          icon: CalendarCheck,
          tone: 'amber',
          createdAt: appointment.createdAt,
        };
        realtimeAppointmentNotifications.current.set(notificationId, newNotification);
        return [
          newNotification,
          ...withoutDuplicate,
        ].sort((first, second) =>
          getNotificationTimestamp(second) - getNotificationTimestamp(first)
        );
      });
      setUnreadNotificationIds((current) => new Set(current).add(notificationId));
    });

    socket.on('connect_error', (error) => {
      console.error('Không thể kết nối thông báo lịch hẹn thời gian thực:', error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, currentUserRole]);

  const openNotifications = () => {
    if (notificationCloseTimeout.current !== null) {
      window.clearTimeout(notificationCloseTimeout.current);
      notificationCloseTimeout.current = null;
    }
    setIsNotificationOpen(true);
    void loadNotifications();
  };

  const scheduleNotificationClose = () => {
    if (notificationCloseTimeout.current !== null) {
      window.clearTimeout(notificationCloseTimeout.current);
    }
    notificationCloseTimeout.current = window.setTimeout(() => {
      setIsNotificationOpen(false);
      notificationCloseTimeout.current = null;
    }, 250);
  };

  const keepNotificationsOpen = () => {
    if (notificationCloseTimeout.current !== null) {
      window.clearTimeout(notificationCloseTimeout.current);
      notificationCloseTimeout.current = null;
    }
    setIsNotificationOpen(true);
  };

  const unreadNotificationCount = unreadNotificationIds.size;

  const baseLinks = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Cấp cứu khẩn', path: '/emergency', icon: Flame },
    { label: 'Bản đồ', path: '/map', icon: MapPin },
    { label: 'Sự kiện hiến', path: '/events', icon: CalendarCheck },
    { label: 'Quy trình', path: '/process', icon: HeartPulse },
    { label: 'Điều kiện & FAQ', path: '/eligibility', icon: Clock3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  const breadcrumbLabels: Record<string, string> = {
    '/admin': 'Quản trị',
    '/staff': 'Bác sĩ',
    '/events': 'Sự kiện hiến máu',
    '/book-appointment': 'Đặt lịch hiến máu',
    '/my-history': 'Lịch sử hiến máu',
    '/my-donations': 'Lịch sử hiến máu',
    '/profile': 'Hồ sơ cá nhân',
    '/staff/reception': 'Tiếp nhận & duyệt lịch',
    '/staff/emergency-request': 'Yêu cầu cấp cứu',
    '/inventory': 'Kho dự trữ máu',
    '/admin/appointments': 'Duyệt lịch hiến máu',
    '/admin/dispatch': 'Điều phối xe 115',
    '/admin/inventory': 'Quản lý kho máu',
    '/admin/forecast': 'Quản lý hiến máu',
    '/admin/users': 'Quản lý tài khoản',
    '/emergency': 'Cấp cứu khẩn',
  };
  const breadcrumbPath = Object.keys(breadcrumbLabels)
    .sort((a, b) => b.length - a.length)
    .find((path) => location.pathname === path || location.pathname.startsWith(`${path}/`));
  const breadcrumbSection = user?.role === 'ADMIN'
    ? 'Quản trị'
    : user?.role === 'HOSPITAL_STAFF'
      ? 'Bác sĩ'
      : 'Người hiến máu';
  const breadcrumbPage = breadcrumbPath
    ? breadcrumbLabels[breadcrumbPath]
    : location.pathname === '/'
      ? 'Tổng quan'
      : breadcrumbSection;
  const breadcrumbItems = breadcrumbPage === breadcrumbSection
    ? [breadcrumbSection]
    : [breadcrumbSection, breadcrumbPage];

  const activeEmergencyCases = emergencyList.filter((request) => !request.isDismissed);
  const tickerItems = activeEmergencyCases.length > 0
    ? activeEmergencyCases
    : [{
        id: 'emergency-ready',
        bloodType: 'O-',
        hospital: 'Mạng lưới điều phối máu',
        unitsNeeded: 0,
        deadline: 'Sẵn sàng tiếp nhận yêu cầu 24/7',
      }];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white shadow-sm transition-all">
      <div
        className="w-full border-b border-amber-300 bg-amber-100 text-amber-950 shadow-sm"
        role="region"
        aria-label="Thông báo cấp cứu khẩn"
      >
        <div className={`flex h-10 min-w-0 items-center overflow-hidden ${
          isAuthenticated ? 'lg:ml-64' : 'mx-auto max-w-7xl'
        }`}>
          <Link
            to="/emergency"
            className="relative z-20 flex h-full shrink-0 items-center gap-1.5 bg-red-700 px-3 text-white shadow-[6px_0_12px_rgba(127,29,29,0.3)] sm:gap-2 sm:px-4 border-r border-red-800"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            <Flame className="h-3.5 w-3.5 shrink-0 fill-amber-300 text-amber-300" />
            <span className="whitespace-nowrap text-[9px] font-black uppercase tracking-wide sm:text-[11px]">
              Báo động đỏ: Cấp cứu khẩn
            </span>
          </Link>

          <div className="relative flex h-full min-w-0 flex-1 items-center overflow-hidden px-3 [mask-image:linear-gradient(to_right,transparent,black_28px,black_calc(100%-28px),transparent)]">
            <div className="emergency-alert-track flex w-max items-center">
              {[0, 1].map((group) => (
                <div
                  key={group}
                  aria-hidden={group === 1}
                  className="flex shrink-0 items-center gap-3 pr-3 sm:gap-4 sm:pr-4"
                >
                  {tickerItems.map((request) => (
                    <Link
                      key={`${request.id}-${group}`}
                      to="/emergency"
                      tabIndex={group === 1 ? -1 : undefined}
                      className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-amber-400 bg-amber-50 px-3 py-1 text-[10px] text-amber-950 transition hover:bg-white sm:text-[11px]"
                      title={`Xem yêu cầu cấp cứu tại ${request.hospital}`}
                    >
                      <span className="rounded-full bg-red-700 px-2 py-0.5 font-black text-white">
                        {request.bloodType}
                      </span>
                      <span className="font-semibold">{request.hospital}</span>
                      <span>
                        {request.unitsNeeded > 0 ? (
                          <>Cần gấp: <strong>{request.unitsNeeded} đơn vị</strong></>
                        ) : (
                          request.deadline
                        )}
                      </span>
                      {request.unitsNeeded > 0 && (
                        <span className="hidden text-amber-800 sm:inline">
                          {request.deadline || 'Đang cần hỗ trợ'}
                        </span>
                      )}
                      <ArrowRight className="h-3 w-3 shrink-0 text-red-700" />
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-20 flex h-full shrink-0 items-center gap-3 bg-amber-100 px-3 text-[9px] font-semibold sm:gap-4 sm:px-4 sm:text-[10px] border-l border-amber-300 shadow-[-8px_0_12px_rgba(251,191,36,0.35)]">
            <span className="hidden items-center gap-1.5 whitespace-nowrap text-slate-700 sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_7px_rgba(16,185,129,0.7)]" />
              Hệ thống trực tuyến
            </span>
            <button
              type="button"
              onClick={() => openCallModal({
                title: 'Tổng đài cấp cứu máu',
                name: 'Tổng đài cấp cứu máu quốc gia (24/7)',
                phone: '1900 6868',
              })}
              className="whitespace-nowrap transition hover:text-red-700 cursor-pointer text-left"
            >
              <span className="hidden text-slate-600 md:inline">Hotline: </span>
              <strong>1900 6868</strong>
            </button>
          </div>
        </div>
      </div>
      <div className={`px-3 sm:px-6 lg:px-8 ${
        isAuthenticated ? 'lg:ml-64' : 'mx-auto w-full max-w-7xl'
      }`}>
        <div className="flex h-16 items-center justify-between gap-2 sm:gap-3 md:h-[76px]">
          
          {/* 1. BRAND LOGO & TITLE */}
          {!isAuthenticated && <Link
            to="/" 
            className="flex items-center gap-2 sm:gap-3 group focus:outline-hidden rounded-2xl p-0.5 sm:p-1 shrink-0"
          >
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-600 via-red-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-red-500/25 transform group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shrink-0">
              <Droplet className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-white filter drop-shadow-xs animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 leading-none">
                  BLOOD<span className="bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent font-black">SMART</span>
                </span>
                <span className="px-1 sm:px-1.5 py-0.5 text-[8px] sm:text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-600 rounded-md border border-red-200/60">
                  24/7
                </span>
              </div>
              <span className="text-[10px] md:text-xs font-semibold text-slate-400 tracking-wider uppercase mt-0.5 hidden sm:inline-block">
                Mạng lưới điều phối máu AI
              </span>
            </div>
          </Link>}

          {/* 2. DESKTOP NAVIGATION PILLS (Hiện trên màn hình Desktop >= 1280px để tránh tràn vỡ trên iPad / Surface Pro / Laptop nhỏ) */}
          {!isAuthenticated && <nav aria-label="Điều hướng chính" className="hidden items-center gap-0.5 xl:flex">
            {baseLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-3 py-2.5 text-xs font-bold transition-all duration-200 lg:px-3.5 lg:text-[13px] whitespace-nowrap after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors ${
                    active
                      ? 'text-red-700 after:bg-red-600 font-black'
                      : 'text-slate-600 after:bg-transparent hover:text-slate-900 hover:after:bg-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

          </nav>}

          {isAuthenticated && (
            <nav aria-label="Đường dẫn hiện tại" className="mr-auto hidden min-w-0 items-center gap-2 text-xs sm:flex">
              {breadcrumbItems.map((item, index) => (
                <React.Fragment key={`${item}-${index}`}>
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
                  <span className={`truncate ${
                    index === breadcrumbItems.length - 1
                      ? 'font-extrabold text-slate-800'
                      : 'font-semibold text-slate-400'
                  }`}>
                    {item}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          )}

          {/* 3. RIGHT HEADER ACTIONS (Cấp Cứu SOS & Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 shrink-0">
            
            {/* 3D Quick SOS Alert Button */}
            {!isAuthenticated && <button
              onClick={() => navigate('/emergency')}
              title="Trung tâm điều phối cấp cứu"
              className="relative px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-700 hover:to-rose-700 text-white shadow-md shadow-red-500/25 border border-red-400/40 transition-all duration-200 flex items-center gap-1.5 sm:gap-2 active:scale-95 cursor-pointer group whitespace-nowrap shrink-0"
            >
              <div className="relative">
                <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white group-hover:rotate-12 transition-transform" />
                {urgentCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                <span className="hidden sm:inline">Cấp cứu </span>
                <span className="sm:hidden">SOS </span>
                ({urgentCount})
              </span>
            </button>}

            {/* User Profile / Login status */}
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => navigate('/emergency')}
                  title="Mở trung tâm cấp cứu khẩn"
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2.5 text-xs font-black text-white shadow-md shadow-red-600/20 transition hover:bg-red-700"
                >
                  <Flame className="h-4 w-4" />
                  <span className="hidden sm:inline">Cấp cứu</span>
                </button>
                <div
                  className="relative"
                  onMouseEnter={keepNotificationsOpen}
                  onMouseLeave={scheduleNotificationClose}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (isNotificationOpen) {
                        setIsNotificationOpen(false);
                      } else {
                        openNotifications();
                      }
                    }}
                    onFocus={openNotifications}
                    title="Xem thông báo"
                    aria-label="Xem thông báo"
                    aria-expanded={isNotificationOpen}
                    aria-haspopup="true"
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-red-200 hover:text-red-600"
                  >
                    <Bell className="h-4 w-4" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-black text-white">
                        {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                  {isNotificationOpen && (
                    <div
                      role="menu"
                      aria-label="Thông báo của bạn"
                      onMouseEnter={openNotifications}
                      onMouseLeave={scheduleNotificationClose}
                      className="absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/15"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                          <h2 className="text-sm font-black text-slate-900">Thông báo</h2>
                          <p className="mt-0.5 text-[10px] font-medium text-slate-500">
                            {user?.role === 'DONOR' ? 'Dành cho người hiến máu' : 'Công việc cần theo dõi'}
                          </p>
                        </div>
                        <Bell className="h-4 w-4 text-red-600" />
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2">
                        {isLoadingNotifications && notifications.length === 0 ? (
                          <p className="px-3 py-6 text-center text-xs font-medium text-slate-500">Đang tải thông báo...</p>
                        ) : (
                          <>
                            {notificationError && (
                              <p role="alert" className="m-2 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                                {notificationError}
                              </p>
                            )}
                            {notifications.map((notification) => {
                              const Icon = notification.icon;
                              const isUnread = unreadNotificationIds.has(notification.id);
                              const tones = {
                                red: 'bg-red-50 text-red-600',
                                amber: 'bg-amber-50 text-amber-700',
                                blue: 'bg-blue-50 text-blue-600',
                                emerald: 'bg-emerald-50 text-emerald-600',
                              };
                              return (
                                <button
                                  key={notification.id}
                                  type="button"
                                  role="menuitem"
                                  onClick={() => {
                                    readNotificationIds.current.add(notification.id);
                                    try {
                                      sessionStorage.setItem(
                                        `bloodsmart-read-notifications-${currentUserId}`,
                                        JSON.stringify([...readNotificationIds.current])
                                      );
                                    } catch (error) {
                                      console.error('Không thể lưu trạng thái thông báo đã đọc:', error);
                                    }
                                    setUnreadNotificationIds((currentUnread) => {
                                      const nextUnread = new Set(currentUnread);
                                      nextUnread.delete(notification.id);
                                      return nextUnread;
                                    });
                                    setIsNotificationOpen(false);
                                    navigate(notification.path);
                                  }}
                                  className={`flex w-full cursor-pointer items-start gap-3 rounded-xl p-3 text-left transition hover:bg-slate-50 ${
                                    isUnread ? 'bg-slate-50/80' : 'opacity-70'
                                  }`}
                                >
                                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tones[notification.tone]}`}>
                                    <Icon className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1">
                                    <span className={`block text-xs ${isUnread ? 'font-black text-slate-900' : 'font-semibold text-slate-600'}`}>
                                      {notification.title}
                                    </span>
                                    <span className={`mt-1 block text-[11px] leading-relaxed ${isUnread ? 'font-semibold text-slate-600' : 'font-normal text-slate-400'}`}>
                                      {notification.description}
                                    </span>
                                  </span>
                                  <ArrowRight className={`mt-1 h-3.5 w-3.5 shrink-0 ${isUnread ? 'text-slate-500' : 'text-slate-300'}`} />
                                </button>
                              );
                            })}
                            {!notificationError && !isLoadingNotifications && notifications.length === 0 && (
                              <div className="px-3 py-7 text-center">
                                <HeartPulse className="mx-auto h-7 w-7 text-slate-300" />
                                <p className="mt-2 text-xs font-bold text-slate-600">Bạn chưa có thông báo mới</p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-2xs transition-all active:scale-95 whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 rounded-2xl shadow-md shadow-red-500/20 transition-all active:scale-95 whitespace-nowrap"
                >
                  <Flame className="w-4 h-4 fill-white" />
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}

            {/* Mobile & Tablet Menu Toggle Button (< 1280px / xl:hidden) */}
            {!isAuthenticated && <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Đóng menu" : "Mở menu"}
              aria-expanded={isMobileMenuOpen}
              className="xl:hidden p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>}
          </div>
        </div>
      </div>

      {/* 4. MOBILE & TABLET DRAWER NAVIGATION */}
      {!isAuthenticated && isMobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-in slide-in-from-top duration-200">
          {/* Menu chính */}
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3">
              Chức năng chính
            </span>
            {baseLinks.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    active
                      ? 'bg-red-50 text-red-700 font-black shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-red-600' : 'text-slate-400'}`} />}
                    <span>{item.label}</span>
                  </div>
                  {item.path === '/emergency' && urgentCount > 0 ? (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-red-600 text-white rounded-full">
                      {urgentCount} ca khẩn
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  )}
                </Link>
              );
            })}
          </div>

          {!isAuthenticated && (
            <div className="pt-2 border-t border-slate-100 sm:hidden grid grid-cols-2 gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-slate-100 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-500" />
                <span>Đăng nhập</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 text-center bg-red-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-red-500/20"
              >
                <Flame className="w-3.5 h-3.5 fill-white" />
                <span>Đăng ký</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
