import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { EmergencyBanner } from '../components/features/EmergencyBanner';
import { QuickRegisterModal } from '../components/features/QuickRegisterModal';
import { StaffQrScannerModal } from '../components/features/StaffQrScannerModal';
import { bloodService } from '../services/bloodService';

/**
 * HomePage Component
 * - Header & Navbar hỗ trợ chuyển đổi Tab
 * - Body: ĐỂ TRỐNG để bạn tự code nội dung theo từng tab
 * - Footer: Chân trang đầy đủ thông tin chuẩn hóa
 */
export const HomePage = () => {
  // Tab hiện tại đang chọn từ Navbar: 'home' | 'urgent' | 'inventory' | 'process' | 'eligibility'
  const [activeTab, setActiveTab] = useState('home');

  // Quản lý dữ liệu banner khẩn cấp
  const [urgentRequests, setUrgentRequests] = useState([]);

  // Quản lý vai trò (donor | hospital | admin)
  const [currentRole, setCurrentRole] = useState('donor');

  // Quản lý modal từ các nút trên Navbar
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Tên hiển thị tương ứng của từng tab
  const tabTitles = {
    home: 'Trang Chủ',
    urgent: 'Cấp Cứu Khẩn Realtime',
    inventory: 'Kho Dự Trữ Máu (8 Nhóm Máu)',
    process: 'Quy Trình 3 Bước',
    eligibility: 'Tiêu Chuẩn Điều Kiện & FAQ',
  };

  useEffect(() => {
    const fetchBannerData = async () => {
      try {
        const reqData = await bloodService.getUrgentRequests();
        setUrgentRequests(reqData);
      } catch (err) {
        console.error('Lỗi nạp dữ liệu banner:', err);
      }
    };

    fetchBannerData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-surface-light">
      {/* ========================================================
          1. HEADER & THANH MENU (Đầy đủ banner realtime + Navbar)
         ======================================================== */}
      <header className="sticky top-0 z-50">
        <EmergencyBanner
          requests={urgentRequests}
          onSelectRequest={() => {
            setActiveTab('urgent');
            setIsRegisterModalOpen(true);
          }}
        />

        <Navbar
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          activeTab={activeTab}
          onSelectTab={(tabId) => setActiveTab(tabId)}
          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
          onOpenQrModal={() => setIsQrModalOpen(true)}
        />
      </header>

      {/* ========================================================
          2. PHẦN THÂN (BODY) - ĐỂ TRỐNG ĐỂ BẠN TỰ CODE NỘI DUNG VÀO ĐÂY
          Bấm vào Menu nào sẽ hiện khung làm việc của Menu đó
         ======================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Khung placeholder trống chuẩn mực theo từng Tab bạn chọn trên Menu */}
        <div className="border-2 border-dashed border-slate-300 rounded-2xl min-h-[460px] flex flex-col items-center justify-center p-8 text-center bg-white/70 shadow-xs transition-all duration-200">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4 border border-brand-100 shadow-xs">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>

          {/* Tiêu đề hiển thị trực tiếp theo Tab đang chọn trên Menu */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200 text-brand-600 text-xs font-bold uppercase mb-2">
            <span>Mục đang chọn: {tabTitles[activeTab]}</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2">
            Vùng Nội Dung [{tabTitles[activeTab]}] (Đang Để Trống)
          </h3>

          <p className="text-sm text-slate-500 max-w-lg mb-6 leading-relaxed">
            Bạn có thể bắt đầu code các Form, Component, hoặc Bảng dữ liệu của mục{' '}
            <strong className="text-slate-800 font-semibold">{tabTitles[activeTab]}</strong> tại đây.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg text-slate-600 font-mono">
              activeTab = "{activeTab}"
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">Bấm các mục khác trên Menu để chuyển qua lại</span>
          </div>
        </div>
      </main>

      {/* ========================================================
          3. FOOTER (Chân trang bám đáy màn hình)
         ======================================================== */}
      <Footer />

      {/* Các Modal hỗ trợ khi click nút trên Navbar */}
      <QuickRegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      <StaffQrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />
    </div>
  );
};
