import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EmergencyAlertPayload, EmergencyCardItem, BloodGroup } from '../types';
import { useSocket } from '../hooks/useSocket';
import { axiosClient } from '../api/axiosClient';
import toast from 'react-hot-toast';

interface TriggerEmergencyOptions {
  message?: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: string;
  urgencyLevel?: 'RAT_KHAN' | 'KHAN_CAP';
  notes?: string;
  patientName?: string;
}

interface EmergencyContextType {
  emergencyList: EmergencyCardItem[];
  urgentCount: number;
  activeAlert: EmergencyAlertPayload | null;
  isSocketConnected: boolean;
  dismissedRequestIds: string[];
  triggerEmergency: (options: TriggerEmergencyOptions) => void;
  triggerEmergencyAlert: (msg: string) => void;
  clearEmergencyAlert: () => void;
  dismissActiveAlert: () => void;
  dismissEmergencyCard: (id: string, reason?: string) => Promise<void>;
  restoreEmergencyCard: (id: string) => Promise<void>;
  addNewEmergencyCard: (card: Partial<EmergencyCardItem>) => void;
  refreshEmergencies: () => Promise<void>;
}

// Danh sách dự phòng ban đầu đồng bộ 100% với 8 ca trong SQL Server dbo.YeuCauMauKhanCap
const INITIAL_EMERGENCY_LIST: EmergencyCardItem[] = [
  {
    id: 'REQ-1',
    patient: 'Bệnh nhân Nguyễn Văn A (45 tuổi) - Tai nạn giao thông gãy xương đùi hở mất máu cấp',
    bloodType: 'A+',
    units: '2 Đơn vị (Khẩn cấp)',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Chợ Rẫy (Khoa Cấp Cứu)',
    department: 'Khoa Cấp Cứu',
    address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM',
    contact: '0908123456',
    coordinator: 'BS. Lê Minh',
    deadline: 'Trong vòng 2 giờ tới',
    urgencyBadge: 'BÁO ĐỘNG ĐỎ',
    isAlertActive: false,
    isDismissed: false,
  },
  {
    id: 'REQ-2',
    patient: 'Bệnh nhân Lê Văn T. (32 tuổi) - Sốc mất máu nặng đa chấn thương lồng ngực',
    bloodType: 'O-',
    units: '3 Đơn vị (Khẩn cấp)',
    unitsNeeded: 3,
    hospital: 'Bệnh viện Chợ Rẫy (Khoa Hồi Sức Cấp Cứu / ICU)',
    department: 'Khoa Hồi Sức Cấp Cứu (ICU)',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
    contact: '0908123456',
    coordinator: 'BS. Trực Cấp Cứu Chợ Rẫy',
    deadline: 'Trong 45 phút tới (Khẩn cấp)',
    urgencyBadge: 'BÁO ĐỘNG ĐỎ',
    isAlertActive: false,
    isDismissed: true,
    dismissReason: 'Đã tiếp nhận đủ máu & hoàn tất truyền máu thành công',
  },
  {
    id: 'REQ-3',
    patient: 'Bệnh nhân Vũ Đức H. (50 tuổi) - Xuất huyết tiêu hóa ồ ạt do giãn vỡ tĩnh mạch thực quản',
    bloodType: 'O+',
    units: '3 Đơn vị (Khẩn cấp)',
    unitsNeeded: 3,
    hospital: 'Bệnh viện Chợ Rẫy (Khoa Ngoại Tiêu Hóa)',
    department: 'Khoa Ngoại Tiêu Hóa',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
    contact: '0903112233',
    coordinator: 'BS. Trần Hoàng',
    deadline: 'Trong vòng 2 giờ tới',
    urgencyBadge: 'BÁO ĐỘNG ĐỎ',
    isAlertActive: true,
    isDismissed: false,
  },
  {
    id: 'REQ-4',
    patient: 'Bệnh nhân Trần Thị B (58 tuổi) - Phẫu thuật tim hở thay van 2 lá khẩn cấp',
    bloodType: 'AB-',
    units: '2 Đơn vị',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Đại học Y Dược TP.HCM (Khoa Ngoại Lồng Ngực)',
    department: 'Khoa Ngoại Lồng Ngực',
    address: '215 Hồng Bàng, Quận 5, TP.HCM',
    contact: '0912987654',
    coordinator: 'BS. Phạm Hương',
    deadline: 'Trong vòng 3 giờ tới',
    urgencyBadge: 'KHẨN CẤP',
    isAlertActive: false,
    isDismissed: false,
  },
  {
    id: 'REQ-5',
    patient: 'Bệnh nhân Hoàng C (62 tuổi) - Xuất huyết nội sau chấn thương vùng bụng kín',
    bloodType: 'A-',
    units: '2 Đơn vị',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Nhân dân 115 (Khoa Cấp Cứu)',
    department: 'Khoa Cấp Cứu',
    address: '527 Sư Vạn Hạnh, Quận 10, TP.HCM',
    contact: '0988776655',
    coordinator: 'Điều phối viên Trực ban',
    deadline: 'Trong vòng 4 giờ tới',
    urgencyBadge: 'ƯU TIÊN CAO',
    isAlertActive: false,
    isDismissed: false,
  },
  {
    id: 'REQ-6',
    patient: 'Bệnh nhân Đỗ Văn M (28 tuổi) - Thiếu máu tán huyết cấp tính cần truyền hồng cầu khẩn',
    bloodType: 'B+',
    units: '2 Đơn vị',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Truyền Máu Huyết Học TP.HCM',
    department: 'Khoa Cấp Cứu',
    address: '118 Hồng Bàng, Phường 12, Quận 5, TP.HCM',
    contact: '0909556677',
    coordinator: 'BS. Kim Oanh',
    deadline: 'Trong vòng 5 giờ tới',
    urgencyBadge: 'KHẨN CẤP',
    isAlertActive: false,
    isDismissed: false,
  },
  {
    id: 'REQ-8',
    patient: 'Bệnh nhi sơ sinh Nguyễn Tuấn K. (3 ngày tuổi) - Vàng da tán huyết bất đồng nhóm máu mẹ con',
    bloodType: 'B-',
    units: '2 Đơn vị (Khẩn cấp)',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Nhi Đồng 1 (Khoa Cấp Cứu Sơ Sinh)',
    department: 'Khoa Cấp Cứu Sơ Sinh',
    address: '341 Sư Vạn Hạnh, Phường 10, Quận 10, TP.HCM',
    contact: '0908889900',
    coordinator: 'BS. Trực Sơ Sinh',
    deadline: 'Trong vòng 2 giờ tới',
    urgencyBadge: 'BÁO ĐỘNG ĐỎ',
    isAlertActive: false,
    isDismissed: true,
    dismissReason: 'Đã tiếp nhận đủ máu & hoàn tất truyền máu thành công',
  },
  {
    id: 'REQ-9',
    patient: 'Bệnh nhân Phan Thanh D. (39 tuổi) - Phẫu thuật cấp cứu vỡ phình động mạch chủ bụng',
    bloodType: 'AB+',
    units: '2 Đơn vị',
    unitsNeeded: 2,
    hospital: 'Bệnh viện Nhân dân Gia Định (Khoa Cấp Cứu)',
    department: 'Khoa Cấp Cứu',
    address: '01 Nơ Trang Long, Phường 7, Quận Bình Thạnh, TP.HCM',
    contact: '0913445566',
    coordinator: 'BS. Quang Tuấn',
    deadline: 'Trong vòng 6 giờ tới',
    urgencyBadge: 'KHẨN CẤP',
    isAlertActive: false,
    isDismissed: false,
  },
];

const EmergencyContext = createContext<EmergencyContextType | undefined>(undefined);

export const EmergencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [emergencyList, setEmergencyList] = useState<EmergencyCardItem[]>(INITIAL_EMERGENCY_LIST);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(false);

  // Tải danh sách ca cấp cứu thực tế từ CSDL SQL Server qua API GET /emergency-requests/public
  const fetchBackendEmergencies = useCallback(async () => {
    try {
      const res = await axiosClient.get('/emergency-requests/public');
      const dbItems = res.data?.data;
      if (Array.isArray(dbItems)) {
        const mappedItems: EmergencyCardItem[] = dbItems.map((item: any) => {
          const units = Math.max(1, Math.round((item.soLuongCanMl || 700) / 350));
          const isDismissed = item.trangThai === 'DaHuy' || item.trangThai === 'DaDapUng';
          
          let dismissReason: string | undefined = undefined;
          if (item.lyDo && item.lyDo.includes('[ĐÃ TẮT THẺ:')) {
            dismissReason = item.lyDo.split('[ĐÃ TẮT THẺ:')[1]?.replace(']', '').trim();
          } else if (item.lyDo && item.lyDo.includes('[ĐÃ TẮT THẺ')) {
            dismissReason = 'Đã tắt thẻ bởi Bác sĩ/Admin';
          }

          return {
            id: `REQ-${item.id}`,
            patient: item.lyDo?.replace(/\[ĐÃ TẮT[^\]]*\]/g, '').trim() || 'Bệnh nhân cấp cứu khẩn',
            bloodType: item.nhomMauCan,
            units: `${units} Đơn vị (${item.mucDoKhanCap === 'NGUY_CAP' ? 'Khẩn cấp' : 'Ưu tiên'})`,
            unitsNeeded: units,
            hospital: item.benhVienYeuCau,
            department: 'Khoa Cấp Cứu / Hồi Sức',
            address: 'TP. Hồ Chí Minh',
            contact: item.nguoiDaiDien?.soDienThoai || '0908123456',
            coordinator: item.nguoiDaiDien?.hoTen || 'BS. Trực Cấp Cứu',
            deadline: item.hanChot
              ? new Date(item.hanChot).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
              : 'Trong 45 phút tới (Khẩn cấp)',
            urgencyBadge: item.mucDoKhanCap === 'NGUY_CAP' ? 'BÁO ĐỘNG ĐỎ' : 'KHẨN CẤP',
            isAlertActive: item.mucDoKhanCap === 'NGUY_CAP' && !isDismissed,
            isDismissed,
            dismissReason,
          };
        });

        // Thay thế toàn bộ bằng dữ liệu thực từ database
        setEmergencyList(mappedItems);
      }
    } catch {
      // Fallback nhẹ nhàng sang INITIAL_EMERGENCY_LIST nếu backend ngoại tuyến
    }
  }, []);

  useEffect(() => {
    fetchBackendEmergencies();
  }, [fetchBackendEmergencies]);

  // ĐỒNG BỘ 100%: Số ca khẩn cấp là giá trị tính toán trực tiếp từ danh sách các ca chưa tắt
  const urgentCount = emergencyList.filter((r) => !r.isDismissed).length;

  const dismissedRequestIds = emergencyList
    .filter((r) => r.isDismissed)
    .map((r) => r.id);

  // Ca báo động đỏ hàng đầu đang hoạt động
  const activeAlertItem = emergencyList.find((r) => !r.isDismissed && r.isAlertActive);

  const activeAlert: EmergencyAlertPayload | null = (!isBannerDismissed && activeAlertItem) ? {
    id: activeAlertItem.id,
    hospitalName: activeAlertItem.hospital,
    department: activeAlertItem.department || 'Khoa Hồi Sức Cấp Cứu',
    bloodGroup: activeAlertItem.bloodType,
    unitsRequired: activeAlertItem.unitsNeeded,
    urgencyLevel: 'RAT_KHAN',
    patientName: activeAlertItem.patient,
    timestamp: new Date().toISOString(),
    message: `${activeAlertItem.hospital} cần gấp ${activeAlertItem.units} cho ${activeAlertItem.patient}!`,
  } : null;

  const handleIncomingAlert = useCallback((alert: EmergencyAlertPayload) => {
    const newItem: EmergencyCardItem = {
      id: alert.id || `REQ-${Date.now().toString().slice(-4)}`,
      patient: alert.patientName || 'Bệnh nhân cấp cứu mới',
      bloodType: alert.bloodGroup,
      units: `${alert.unitsRequired} Đơn vị (Khẩn cấp)`,
      unitsNeeded: alert.unitsRequired,
      hospital: alert.hospitalName,
      department: alert.department || 'Khoa Cấp Cứu',
      address: 'TP. Hồ Chí Minh',
      contact: '0908123456',
      coordinator: 'BS. Trực Cấp Cứu',
      deadline: 'Trong 45 phút tới (Khẩn cấp)',
      urgencyBadge: alert.urgencyLevel === 'RAT_KHAN' ? 'BÁO ĐỘNG ĐỎ' : 'KHẨN CẤP',
      isAlertActive: alert.urgencyLevel === 'RAT_KHAN',
      isDismissed: false,
    };
    setEmergencyList((prev) => [newItem, ...prev]);
    setIsBannerDismissed(false);
  }, []);

  const { isConnected, emitEmergencyAlert } = useSocket(handleIncomingAlert);

  const triggerEmergency = useCallback((options: TriggerEmergencyOptions) => {
    const newId = `REQ-${Date.now().toString().slice(-4)}`;
    const newItem: EmergencyCardItem = {
      id: newId,
      patient: options.patientName || `Bệnh nhân cấp cứu mới (${options.hospital})`,
      bloodType: options.bloodGroup,
      units: `${options.unitsNeeded} Đơn vị (Khẩn cấp)`,
      unitsNeeded: options.unitsNeeded,
      hospital: options.hospital,
      department: 'Khoa Cấp Cứu',
      address: 'TP. Hồ Chí Minh',
      contact: '0908123456',
      coordinator: 'BS. Trực Cấp Cứu',
      deadline: 'Trong 45 phút tới (Khẩn cấp)',
      urgencyBadge: options.urgencyLevel === 'KHAN_CAP' ? 'KHẨN CẤP' : 'BÁO ĐỘNG ĐỎ',
      isAlertActive: options.urgencyLevel !== 'KHAN_CAP',
      isDismissed: false,
    };

    setEmergencyList((prev) => [newItem, ...prev]);
    setIsBannerDismissed(false);

    emitEmergencyAlert({
      id: newId,
      hospitalName: options.hospital,
      bloodGroup: options.bloodGroup,
      unitsRequired: options.unitsNeeded,
      urgencyLevel: options.urgencyLevel || 'RAT_KHAN',
      timestamp: new Date().toISOString(),
      message: options.message || `Cần gấp ${options.unitsNeeded} đơn vị máu ${options.bloodGroup} tại ${options.hospital}!`,
      notes: options.notes,
    });
  }, [emitEmergencyAlert]);

  const triggerEmergencyAlert = useCallback((msg: string) => {
    toast.error(`CẢNH BÁO KHẨN CẤP: ${msg}`, {
      duration: 6000,
      position: 'top-center',
      icon: '🩸',
    });
  }, []);

  // Tắt thẻ cấp cứu: cập nhật UI ngay lập tức và gửi lệnh PUT /api/v1/emergency-requests/:id/dismiss lên SQL Server
  const dismissEmergencyCard = useCallback(async (id: string, reason?: string) => {
    setEmergencyList((prev) => prev.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isDismissed: true,
          isAlertActive: false,
          dismissedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          dismissReason: reason || 'Đã tiếp nhận đủ máu & hoàn tất truyền máu',
        };
      }
      return item;
    }));

    // Gửi lệnh đồng bộ sang Backend CSDL SQL Server nếu là ID hợp lệ
    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await axiosClient.put(`/emergency-requests/${numericId}/dismiss`, { lyDo: reason });
      } catch (err) {
        console.warn('Lỗi khi gửi lệnh tắt thẻ cấp cứu lên backend:', err);
      }
    }
  }, []);

  // Khôi phục / mở lại thẻ cấp cứu và đồng bộ lên Backend CSDL
  const restoreEmergencyCard = useCallback(async (id: string) => {
    setEmergencyList((prev) => prev.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          isDismissed: false,
          isAlertActive: item.urgencyBadge === 'BÁO ĐỘNG ĐỎ',
          dismissReason: undefined,
        };
      }
      return item;
    }));

    // Gửi lệnh khôi phục sang Backend CSDL SQL Server nếu là ID hợp lệ
    const numericId = parseInt(id.replace(/\D/g, ''), 10);
    if (!isNaN(numericId)) {
      try {
        await axiosClient.put(`/emergency-requests/${numericId}/restore`);
      } catch (err) {
        console.warn('Lỗi khi gửi lệnh khôi phục thẻ cấp cứu lên backend:', err);
      }
    }
  }, []);

  const clearEmergencyAlert = useCallback(() => {
    setEmergencyList((prev) => prev.map((item) => ({ ...item, isDismissed: true })));
    setIsBannerDismissed(true);
  }, []);

  const dismissActiveAlert = useCallback(() => {
    setIsBannerDismissed(true);
  }, []);

  const addNewEmergencyCard = useCallback((card: Partial<EmergencyCardItem>) => {
    const item: EmergencyCardItem = {
      id: card.id || `REQ-${Math.floor(200 + Math.random() * 800)}`,
      patient: card.patient || 'Bệnh nhân Cấp Cứu Mới',
      bloodType: card.bloodType || 'O-',
      units: card.units || `${card.unitsNeeded || 2} Đơn vị (Khẩn cấp)`,
      unitsNeeded: card.unitsNeeded || 2,
      hospital: card.hospital || 'Bệnh viện Chợ Rẫy',
      department: card.department || 'Khoa Cấp Cứu',
      address: card.address || 'TP. Hồ Chí Minh',
      contact: card.contact || '0908123456',
      coordinator: card.coordinator || 'BS. Trực Cấp Cứu',
      deadline: card.deadline || 'Trong 45 phút tới (Khẩn cấp)',
      urgencyBadge: card.urgencyBadge || 'BÁO ĐỘNG ĐỎ',
      isAlertActive: card.isAlertActive ?? true,
      isDismissed: false,
    };
    setEmergencyList((prev) => [item, ...prev]);
    setIsBannerDismissed(false);
  }, []);

  return (
    <EmergencyContext.Provider
      value={{
        emergencyList,
        urgentCount,
        activeAlert,
        isSocketConnected: isConnected,
        dismissedRequestIds,
        triggerEmergency,
        triggerEmergencyAlert,
        clearEmergencyAlert,
        dismissActiveAlert,
        dismissEmergencyCard,
        restoreEmergencyCard,
        addNewEmergencyCard,
        refreshEmergencies: fetchBackendEmergencies,
      }}
    >
      {children}
    </EmergencyContext.Provider>
  );
};

export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  if (!context) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  return context;
};
