import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/ProtectedRoute';

// Public & Auth Pages
import { HomePage } from '../pages/public/HomePage';
import { ProcessPage } from '../pages/public/ProcessPage';
import { EligibilityFaqPage } from '../pages/public/EligibilityFaqPage';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { EmergencyPage } from '../pages/EmergencyPage';
import { DonatePage } from '../pages/DonatePage';
import { MapPage } from '../pages/MapPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProfilePage } from '../pages/ProfilePage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

// Donor Pages
import { EventsPage } from '../pages/donor/EventsPage';
import { BookAppointmentPage } from '../pages/donor/BookAppointmentPage';
import { MyDonationsPage } from '../pages/donor/MyDonationsPage';

// Hospital Staff Pages
import { ReceptionPage } from '../pages/staff/ReceptionPage';
import { EmergencyRequestPage } from '../pages/staff/EmergencyRequestPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { BloodInventoryPage } from '../pages/admin/BloodInventoryPage';
import { DispatchPage } from '../pages/admin/DispatchPage';
import { DemandForecastPage } from '../pages/admin/DemandForecastPage';
import { UserManagementPage } from '../pages/admin/UserManagementPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Auth Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Main Layout Routes */}
      <Route path="/" element={<MainLayout />}>
        {/* 1. Tuyến đường công khai (Public Routes) */}
        <Route index element={<HomePage />} />
        <Route path="emergency" element={<EmergencyPage />} />
        <Route path="process" element={<ProcessPage />} />
        <Route path="eligibility" element={<EligibilityFaqPage />} />
        <Route path="donate" element={<DonatePage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="unauthorized" element={<UnauthorizedPage />} />

        {/* Tuyến đường xem tồn kho máu (Bảo mật: Chỉ BÁC SĨ & ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['HOSPITAL_STAFF', 'ADMIN']} />}>
          <Route path="inventory" element={<InventoryPage />} />
        </Route>

        {/* 2. Tuyến đường cho Người hiến máu (DONOR & ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['DONOR', 'ADMIN']} />}>
          <Route path="book-appointment" element={<BookAppointmentPage />} />
          <Route path="my-history" element={<MyDonationsPage />} />
          <Route path="my-donations" element={<MyDonationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* 3. Tuyến đường cho Nhân viên Bệnh viện (HOSPITAL_STAFF & ADMIN) */}
        <Route path="staff" element={<ProtectedRoute allowedRoles={['HOSPITAL_STAFF', 'ADMIN']} />}>
          <Route path="reception" element={<ReceptionPage />} />
          <Route path="emergency-request" element={<EmergencyRequestPage />} />
        </Route>

        {/* 4. Tuyến đường Quản trị tối cao (ADMIN) */}
        <Route path="admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="inventory" element={<BloodInventoryPage />} />
          <Route path="dispatch" element={<DispatchPage />} />
          <Route path="forecast" element={<DemandForecastPage />} />
          <Route path="appointments" element={<ReceptionPage />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
