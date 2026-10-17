import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { EmergencyProvider } from './contexts/EmergencyContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <EmergencyProvider>
        <BrowserRouter>
          {/* Global Toast Notification System */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            toastOptions={{
              duration: 4500,
              style: {
                background: '#FFFFFF',
                color: '#0F172A',
                fontWeight: 600,
                fontSize: '13px',
                borderRadius: '16px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                border: '1px solid #E2E8F0',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#16A34A',
                  secondary: '#FFFFFF',
                },
              },
              error: {
                iconTheme: {
                  primary: '#DC2626',
                  secondary: '#FFFFFF',
                },
                style: {
                  border: '1px solid #FECACA',
                  background: '#FEF2F2',
                  color: '#991B1B',
                },
              },
            }}
          />

          {/* Main Application Routing with Role-Based Protection */}
          <AppRoutes />
        </BrowserRouter>
      </EmergencyProvider>
    </AuthProvider>
  );
};

export default App;
