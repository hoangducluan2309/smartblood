import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { EmergencyAlertPayload } from '../types';
import { playEmergencyBeep } from '../utils/soundAlert';
import toast from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  lastAlert: EmergencyAlertPayload | null;
  clearLastAlert: () => void;
  emitEmergencyAlert: (payload: Partial<EmergencyAlertPayload>) => void;
}

export const useSocket = (
  onEmergencyAlert?: (alert: EmergencyAlertPayload) => void
): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastAlert, setLastAlert] = useState<EmergencyAlertPayload | null>(null);

  useEffect(() => {
    // Khởi tạo kết nối Socket.io
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
      withCredentials: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Connected to emergency broadcast room
      socket.emit('join:emergency_channel');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
    });

    // Lắng nghe sự kiện Báo động cấp cứu từ Backend
    socket.on('EMERGENCY_ALERT', (data: EmergencyAlertPayload) => {
      setLastAlert(data);
      
      // 1. Phát âm thanh còi báo động y tế
      playEmergencyBeep();

      // 2. Hiển thị Popup Toast khẩn cấp
      toast.error(
        `🚨 BÁO ĐỘNG ĐỎ: ${data.hospitalName} đang cần gấp ${data.unitsRequired} túi máu ${data.bloodGroup}!`,
        {
          duration: 8000,
          position: 'top-center',
          style: {
            background: '#DC2626',
            color: '#FFFFFF',
            fontWeight: 'bold',
            borderRadius: '12px',
            border: '2px solid #FEF2F2',
          },
          icon: '🩸',
        }
      );

      // 3. Callback tùy chọn
      if (onEmergencyAlert) {
        onEmergencyAlert(data);
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('EMERGENCY_ALERT');
      socket.disconnect();
    };
  }, [onEmergencyAlert]);

  const clearLastAlert = useCallback(() => {
    setLastAlert(null);
  }, []);

  const emitEmergencyAlert = useCallback((payload: Partial<EmergencyAlertPayload>) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('EMERGENCY_ALERT', payload);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    lastAlert,
    clearLastAlert,
    emitEmergencyAlert,
  };
};
