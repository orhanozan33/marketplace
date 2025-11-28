import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, Users, FileText, MessageSquare, Settings, LogOut, Shield, TrendingUp, Mail, Lock, LogIn, Megaphone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getCurrentUserProfile, getAdminStatistics } from '@/services/api';
import AdminStatistics from './AdminStatistics';
import AdminListings from './AdminListings';
import AdminUsers from './AdminUsers';
import AdminMessages from './AdminMessages';
import AdminAdvertisements from './AdminAdvertisements';

const AdminDashboard = () => {
  const { user, userProfile, logout, login } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('statistics');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user) {
        // Kullanıcı profilini kontrol et
        const profile = userProfile || await getCurrentUserProfile();
        const isAdmin = profile && (profile.role === 'admin' || profile.role === 'superadmin');
        setIsAdminUser(isAdmin);
        if (isAdmin) {
          loadStatistics();
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [user, userProfile]);

  const loadStatistics = async () => {
    try {
      const stats = await getAdminStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
      // Hata durumunda boş istatistikler
      setStatistics({
        totalUsers: 0,
        adminUsers: 0,
        regularUsers: 0,
        totalListings: 0,
        activeListings: 0,
        inactiveListings: 0,
        totalMessages: 0,
        recentListings: 0,
        categoryCounts: {}
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    // Hash'i kaldır, ana sayfaya dön
    window.location.hash = '';
    window.location.reload();
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    console.log('Giriş denemesi:', { email, password, loginFunction: !!login });

    if (!login) {
      setLoginError('Giriş fonksiyonu yüklenemedi. Lütfen sayfayı yenileyin.');
      setIsLoggingIn(false);
      return;
    }

    if (!email || !password) {
      setLoginError('Lütfen email ve şifre girin.');
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log('Login fonksiyonu çağrılıyor...');
      const result = await login(email, password);
      console.log('Login sonucu:', result);
      
      if (result) {
        // Giriş başarılı, useEffect admin kontrolünü yapacak
        // Kısa bir gecikme ekleyerek state güncellemesini bekleyelim
        setTimeout(() => {
          console.log('Giriş başarılı, admin kontrolü yapılıyor...');
        }, 500);
      }
    } catch (error) {
      console.error('Login hatası:', error);
      const errorMessage = error.message || error.code || 'Giriş yapılamadı. Email ve şifrenizi kontrol edin.';
      setLoginError(errorMessage);
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamışsa giriş formu göster
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-red-50 to-gray-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Girişi</h2>
            <p className="text-gray-600">Admin paneline erişmek için giriş yapın</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Mail size={14} />
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setLoginError('');
                }}
                placeholder="orhanozan33@gmail.com"
                required
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Lock size={14} />
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLoginError('');
                }}
                placeholder="Şifrenizi girin"
                required
                autoComplete="current-password"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isLoggingIn && email && password) {
                    handleLogin(e);
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn || !email || !password}
              onClick={(e) => {
                e.preventDefault();
                if (!isLoggingIn && email && password) {
                  handleLogin(e);
                }
              }}
              className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Giriş yapılıyor...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Giriş Yap</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
            >
              ← Ana Sayfaya Dön
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Kullanıcı giriş yapmış ama admin değilse
  if (!isAdminUser) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <Shield size={64} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Yetkisiz Erişim</h2>
          <p className="text-gray-600 mb-6">Bu sayfaya erişim yetkiniz bulunmamaktadır.</p>
          <div className="space-y-2">
            <button
              onClick={handleLogout}
              className="w-full px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Çıkış Yap
            </button>
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.reload();
              }}
              className="w-full px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'statistics', label: 'İstatistikler', icon: BarChart3 },
    { id: 'listings', label: 'İlanlar', icon: FileText },
    { id: 'users', label: 'Kullanıcılar', icon: Users },
    { id: 'messages', label: 'Mesajlar', icon: MessageSquare },
    { id: 'advertisements', label: 'Reklamlar', icon: Megaphone },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-red-600 to-red-700 text-white flex flex-col shadow-xl">
        {/* Header */}
        <div className="p-6 border-b border-red-500">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Panel</h1>
              <p className="text-xs text-red-100">Tam Yetki</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white/20 text-white shadow-lg'
                    : 'text-red-100 hover:bg-white/10'
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-red-500">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">
              {tabs.find(t => t.id === activeTab)?.label || 'Admin Panel'}
            </h2>
            {statistics && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Users size={16} />
                  <span>{statistics.totalUsers} Kullanıcı</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FileText size={16} />
                  <span>{statistics.totalListings} İlan</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <MessageSquare size={16} />
                  <span>{statistics.totalMessages} Mesaj</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'statistics' && (
              <motion.div
                key="statistics"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminStatistics statistics={statistics} onRefresh={loadStatistics} />
              </motion.div>
            )}

            {activeTab === 'listings' && (
              <motion.div
                key="listings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminListings onRefresh={loadStatistics} />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminUsers onRefresh={loadStatistics} />
              </motion.div>
            )}

            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminMessages />
              </motion.div>
            )}

            {activeTab === 'advertisements' && (
              <motion.div
                key="advertisements"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <AdminAdvertisements onRefresh={loadStatistics} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

