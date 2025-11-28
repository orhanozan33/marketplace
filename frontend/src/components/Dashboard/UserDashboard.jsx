import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogIn, User } from 'lucide-react';

const UserDashboard = ({ selectedListing }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="h-full flex flex-col bg-white p-4">
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Üye Panel</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <LogIn size={48} className="text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Giriş Yapın
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              İlan detaylarını görmek ve mesaj göndermek için giriş yapmanız gerekiyor.
            </p>
          </div>
        ) : user ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Kullanıcı'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || 'User') + '&background=random';
                  }}
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                  <User size={24} className="text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate">
                  {user.displayName || user.email || 'Kullanıcı'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {selectedListing && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-600 font-medium mb-1">
                  Seçili İlan
                </p>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {selectedListing.title || 'Başlık yok'}
                </p>
                {selectedListing.price && (
                  <p className="text-xs text-gray-600 mt-1">
                    ${selectedListing.price.toLocaleString()}
                  </p>
                )}
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Bilgi</p>
              <p className="text-sm text-gray-700">
                İlanlara tıklayarak detaylarını görüntüleyebilir ve mesaj gönderebilirsiniz.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <User size={48} className="text-gray-400 mb-4" />
            <p className="text-sm text-gray-500">
              Kullanıcı bilgileri yükleniyor...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;

