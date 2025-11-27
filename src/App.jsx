import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import ToastContainer from './components/Common/ToastContainer';
import MainLayout from './components/Layout/MainLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import './styles/globals.css';

function AppContent() {
  const [isAdminPage, setIsAdminPage] = useState(false);
  const { toasts, removeToast } = useToast();

  useEffect(() => {
    // URL hash kontrolü (#admin)
    const checkHash = () => {
      const hash = window.location.hash;
      setIsAdminPage(hash === '#admin' || hash.startsWith('#admin'));
    };

    // İlk yüklemede kontrol et
    checkHash();
    
    // Hash değişikliklerini dinle
    window.addEventListener('hashchange', checkHash);
    
    // Sayfa yüklendiğinde hash'i koru
    if (window.location.hash === '#admin' || window.location.hash.startsWith('#admin')) {
      setIsAdminPage(true);
    }

    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      {isAdminPage ? <AdminDashboard /> : <MainLayout />}
    </>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;

