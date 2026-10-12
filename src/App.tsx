import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext.js';
import { Navbar } from './components/layout/Navbar.js';
import { HomeTab } from './pages/HomeTab.js';
import { EmergencyTab } from './pages/EmergencyTab.js';
import { BloodInventoryTab } from './pages/BloodInventoryTab.js';
import { ProcessTab } from './pages/ProcessTab.js';
import { FaqTab } from './pages/FaqTab.js';
import { QrScannerTab } from './pages/QrScannerTab.js';
import { AuthModal } from './components/auth/AuthModal.js';
import { Heart, Flame, PhoneCall, ShieldCheck, Mail, MapPin } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  const handleOpenAuth = (tab: 'login' | 'register' = 'login') => {
    setAuthTab(tab);
    setIsAuthOpen(true);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenLoginModal={() => handleOpenAuth('login')}
          onOpenRegisterModal={() => handleOpenAuth('register')}
        />

        {/* Nội dung chính theo từng Tab */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {activeTab === 'home' && (
            <HomeTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab === 'emergency' && (
            <EmergencyTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab === 'inventory' && (
            <BloodInventoryTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab === 'process' && (
            <ProcessTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {(activeTab === 'faq' || activeTab === 'eligibility') && (
            <FaqTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab === 'qr-scan' && (
            <QrScannerTab
              onSelectTab={setActiveTab}
              onOpenAuthModal={handleOpenAuth}
            />
          )}

          {activeTab !== 'home' &&
            activeTab !== 'emergency' &&
            activeTab !== 'inventory' &&
            activeTab !== 'process' &&
            activeTab !== 'faq' &&
            activeTab !== 'eligibility' &&
            activeTab !== 'qr-scan' && (
            <div className="bg-white p-12 rounded-[12px] border border-dashed border-slate-300 text-center shadow-xs">
              <div className="w-14 h-14 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-3 font-bold text-xl">
                #
              </div>
              <h3 className="text-lg font-bold text-slate-800 capitalize">
                Mục đang chọn: {activeTab}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                Module này đang sẵn sàng kết nối API dữ liệu từ hệ thống SmartBlood.
              </p>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs font-bold text-[#D32F2F] hover:underline"
              >
                ← Quay lại Trang chủ
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-white border-t border-slate-800 py-10 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#D32F2F] flex items-center justify-center text-white font-bold">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <span className="text-xl font-black">SmartBlood</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hệ thống điều phối hiến máu nhân đạo và dự báo nhu cầu máu khẩn cấp theo chuẩn y khoa.
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Liên Hệ Khẩn Cấp</h4>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-[#D32F2F]" />
                Hotline cấp cứu: <strong>1900 6868</strong> (24/7)
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                Email: lienhe@smartblood.vn
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-500" />
                Hà Nội & TP. Hồ Chí Minh
              </p>
            </div>

            <div className="space-y-2 text-xs text-slate-400">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D32F2F]" />
                Về Hệ Thống
              </h4>
              <p className="flex items-center gap-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                Số hóa quy trình hiến máu & Điều phối khẩn cấp
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                Tuân thủ tiêu chuẩn an toàn truyền máu Bộ Y Tế
              </p>
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                © 2026 SmartBlood. Nền tảng vì sức khỏe cộng đồng.
              </p>
            </div>
          </div>
        </footer>

        {/* AuthModal: Đăng nhập / Đăng ký */}
        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          initialTab={authTab}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
