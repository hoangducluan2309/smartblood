import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, PhoneCall } from 'lucide-react';
import toast from 'react-hot-toast';

export interface CallContactInfo {
  title?: string;
  name?: string;
  phone: string;
}

interface CallModalContextType {
  openCallModal: (info: CallContactInfo) => void;
  closeCallModal: () => void;
}

const CallModalContext = createContext<CallModalContextType | undefined>(undefined);

export const CallModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contact, setContact] = useState<CallContactInfo | null>(null);

  const openCallModal = useCallback((info: CallContactInfo) => {
    setContact(info);
  }, []);

  const closeCallModal = useCallback(() => {
    setContact(null);
  }, []);

  const handleCopy = async () => {
    if (!contact) return;
    const cleanPhone = contact.phone.replace(/\s+/g, '');
    try {
      await navigator.clipboard.writeText(cleanPhone);
      toast.success(`Đã sao chép số: ${contact.phone}`);
    } catch {
      toast.error('Không thể sao chép số.');
    }
  };

  const title = contact?.title || 'Thông tin liên hệ';
  const name = contact?.name;
  const phone = contact?.phone || '';
  const cleanPhone = phone.replace(/\s+/g, '');

  return (
    <CallModalContext.Provider value={{ openCallModal, closeCallModal }}>
      {children}
      {contact &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="fixed inset-0"
              onClick={closeCallModal}
              aria-hidden="true"
            />
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="call-modal-title"
              className="relative z-10 w-full max-w-sm space-y-4 rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 id="call-modal-title" className="text-lg font-black text-slate-900 truncate">
                    {title}
                  </h2>
                  {name && (
                    <p className="mt-1 text-sm font-medium text-slate-500 truncate">
                      {name}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeCallModal}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
                  aria-label="Đóng hộp thoại"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3.5 text-center font-mono text-2xl font-black tracking-wider text-slate-900 select-all shadow-inner">
                {phone}
              </p>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all shadow-2xs cursor-pointer"
                >
                  <Copy className="h-4 w-4" /> Sao chép số
                </button>
                <a
                  href={`tel:${cleanPhone}`}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-2.5 text-sm font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <PhoneCall className="h-4 w-4" /> Gọi ngay
                </a>
              </div>

              <p className="text-center text-xs text-slate-500 leading-relaxed">
                Trên máy tính, trình duyệt có thể yêu cầu chọn ứng dụng gọi điện.
              </p>
            </section>
          </div>,
          document.body
        )}
    </CallModalContext.Provider>
  );
};

export const useCallModal = (): CallModalContextType => {
  const context = useContext(CallModalContext);
  if (!context) {
    throw new Error('useCallModal must be used within a CallModalProvider');
  }
  return context;
};
