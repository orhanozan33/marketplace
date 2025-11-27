import React, { createContext, useContext, useState, useEffect } from 'react';
import { register as apiRegister, login as apiLogin, logout as apiLogout, getCurrentUser, getCurrentUserProfile } from '@/services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yüklendiğinde localStorage'dan kullanıcıyı kontrol et
  useEffect(() => {
    const loadUser = async () => {
      try {
        const savedUser = getCurrentUser();
        if (savedUser) {
          setUser(savedUser);
          // Profil bilgilerini API'den al
          const profile = await getCurrentUserProfile();
          if (profile) {
            setUserProfile(profile);
            setUser({ ...savedUser, ...profile });
          } else {
            setUserProfile(savedUser);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        // Token geçersizse temizle
        apiLogout();
        setUser(null);
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (email, password, displayName, phone, postalCode) => {
    try {
      const result = await apiRegister(email, password, displayName, phone, postalCode);
      if (result.user) {
        setUser(result.user);
        setUserProfile(result.user);
      }
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      console.log('🔐 Login denemesi:', email);
      const result = await apiLogin(email, password);
      console.log('✅ Login sonucu:', result);
      if (result.user) {
        setUser(result.user);
        setUserProfile(result.user);
      }
      return result.user;
    } catch (error) {
      console.error('❌ Login hatası:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      apiLogout();
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    setUser,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


