import React from 'react';
import { Users, FileText, MessageSquare, TrendingUp, Home, Car, ShoppingBag, CheckCircle, XCircle } from 'lucide-react';

const AdminStatistics = ({ statistics, onRefresh }) => {
  if (!statistics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">İstatistikler yükleniyor...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Toplam Kullanıcı',
      value: statistics.totalUsers,
      icon: Users,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-500',
      subtitle: `${statistics.adminUsers} Admin, ${statistics.regularUsers} Normal`,
    },
    {
      title: 'Toplam İlan',
      value: statistics.totalListings,
      icon: FileText,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-500',
      subtitle: `${statistics.activeListings} Aktif, ${statistics.inactiveListings} Pasif`,
    },
    {
      title: 'Toplam Mesaj',
      value: statistics.totalMessages,
      icon: MessageSquare,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-500',
      subtitle: 'Tüm konuşmalar',
    },
    {
      title: 'Son 7 Gün',
      value: statistics.recentListings,
      icon: TrendingUp,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-500',
      subtitle: 'Yeni ilan',
    },
  ];

  const categoryIcons = {
    housing: Home,
    vehicle: Car,
    buysell: ShoppingBag,
  };

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                  <Icon className={stat.iconColor} size={24} />
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-2">{stat.subtitle}</p>
            </div>
          );
        })}
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Kategori Dağılımı</h3>
        <div className="space-y-3">
          {Object.entries(statistics.categoryCounts || {}).map(([category, count]) => {
            const Icon = categoryIcons[category] || FileText;
            const total = statistics.totalListings;
            const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            
            return (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-700 capitalize">{category}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Hızlı İşlemler</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={onRefresh}
            className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-600">Yenile</span>
            </div>
            <p className="text-xs text-gray-600">İstatistikleri güncelle</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;

