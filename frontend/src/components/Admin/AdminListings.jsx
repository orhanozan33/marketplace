import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Eye, CheckCircle, XCircle, Filter, User, X, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchListings, deleteListing, updateListing, getAllUsers } from '@/services/api';
import { useToast, useConfirm } from '@/context/ToastContext';

const AdminListings = ({ onRefresh }) => {
  const { success, error } = useToast();
  const confirm = useConfirm();
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedListing, setSelectedListing] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    loadListings();
    loadUsers();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // Tüm ilanları getir (status filtresi olmadan)
      const data = await fetchListings();
      setListings(data);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId) || null;
  };

  const handleListingClick = (listing) => {
    setSelectedListing(listing);
    setSelectedImageIndex(0);
    setShowUserModal(true);
  };

  const getListingImages = (listing) => {
    if (!listing) return [];
    
    // images array'i varsa onu kullan
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images;
    }
    
    // images string olarak geliyorsa parse et
    if (listing.images && typeof listing.images === 'string') {
      try {
        const parsed = JSON.parse(listing.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // image varsa onu kullan
    if (listing.image) {
      return [listing.image];
    }
    
    return [];
  };

  const nextImage = () => {
    const images = getListingImages(selectedListing);
    setSelectedImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = getListingImages(selectedListing);
    setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDelete = async (listingId) => {
    const confirmed = await confirm(
      'İlanı Sil',
      'Bu ilanı silmek istediğinize emin misiniz?',
      'Sil',
      'İptal',
      'warning'
    );
    if (!confirmed) return;
    
    try {
      await deleteListing(listingId);
      await loadListings();
      if (onRefresh) onRefresh();
      success('İlan silindi!');
    } catch (err) {
      error('İlan silinirken bir hata oluştu');
    }
  };

  const handleToggleStatus = async (listingId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateListing(listingId, { status: newStatus });
      await loadListings();
      if (onRefresh) onRefresh();
      success(`İlan durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi!`);
    } catch (err) {
      error(`İlan durumu değiştirilirken bir hata oluştu: ${err.message}`);
    }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesSearch =
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="İlan ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
          </select>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İlan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredListings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    İlan bulunamadı
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => {
                  const user = getUserInfo(listing.userId);
                  return (
                  <tr key={listing.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleListingClick(listing)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              e.target.src = `https://placehold.co/48x48/3B82F6/white?text=${listing.category?.[0]?.toUpperCase() || 'L'}`;
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-500 text-xs">{listing.category?.[0]?.toUpperCase() || 'L'}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800 line-clamp-1">{listing.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-1">{listing.address || 'Adres belirtilmemiş'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{user.displayName || 'İsimsiz'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">Kullanıcı bulunamadı</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                        {listing.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-gray-800">
                        ${listing.price?.toLocaleString() || '0'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleStatus(listing.id, listing.status)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.status === 'active' ? (
                          <>
                            <CheckCircle size={12} />
                            Aktif
                          </>
                        ) : (
                          <>
                            <XCircle size={12} />
                            Pasif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {listing.createdAt ? new Date(listing.createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleStatus(listing.id, listing.status)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title={listing.status === 'active' ? 'Pasif Yap' : 'Aktif Yap'}
                        >
                          {listing.status === 'active' ? (
                            <XCircle size={18} className="text-gray-600" />
                          ) : (
                            <CheckCircle size={18} className="text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-gray-600 text-center">
        Toplam {filteredListings.length} ilan gösteriliyor
      </div>

      {/* Kullanıcı Detay Modal */}
      {showUserModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowUserModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">İlan Detayları</h2>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* İlan Bilgileri */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">İlan Bilgileri</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  {/* Başlık ve Adres */}
                  <div>
                    <p className="font-semibold text-lg text-gray-800 mb-1">{selectedListing.title}</p>
                    <p className="text-sm text-gray-500">{selectedListing.address || 'Adres belirtilmemiş'}</p>
                  </div>

                  {/* Resim Galerisi */}
                  {(() => {
                    const images = getListingImages(selectedListing);
                    if (images.length === 0) return null;
                    
                    return (
                      <div className="space-y-3">
                        {/* Ana Resim */}
                        <div className="relative bg-black rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                          <img
                            src={images[selectedImageIndex]}
                            alt={`${selectedListing.title} - Resim ${selectedImageIndex + 1}`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.src = `https://placehold.co/800x450/3B82F6/white?text=${selectedListing.category?.[0]?.toUpperCase() || 'L'}`;
                            }}
                          />
                          
                          {/* Önceki/Sonraki Butonları */}
                          {images.length > 1 && (
                            <>
                              <button
                                onClick={prevImage}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                                title="Önceki resim"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={nextImage}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                                title="Sonraki resim"
                              >
                                <ChevronRight size={20} />
                              </button>
                              
                              {/* Resim Sayacı */}
                              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                                {selectedImageIndex + 1} / {images.length}
                              </div>
                            </>
                          )}
                        </div>
                        
                        {/* Thumbnail'lar */}
                        {images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2">
                            {images.map((img, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedImageIndex(index)}
                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                                  selectedImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <img
                                  src={img}
                                  alt={`Thumbnail ${index + 1}`}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = `https://placehold.co/80x80/3B82F6/white?text=${index + 1}`;
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Kategori:</span>
                      <span className="ml-2 font-medium capitalize">{selectedListing.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Fiyat:</span>
                      <span className="ml-2 font-medium">${selectedListing.price?.toLocaleString() || '0'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Durum:</span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                        selectedListing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedListing.status === 'active' ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Oluşturulma:</span>
                      <span className="ml-2 font-medium">
                        {selectedListing.createdAt ? new Date(selectedListing.createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                      </span>
                    </div>
                  </div>
                  {selectedListing.description && (
                    <div>
                      <span className="text-gray-500 text-sm">Açıklama:</span>
                      <p className="mt-1 text-gray-700">{selectedListing.description}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Kullanıcı Bilgileri */}
              {getUserInfo(selectedListing.userId) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">İlan Veren Kullanıcı</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center">
                        <User size={24} className="text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-gray-800">{getUserInfo(selectedListing.userId).displayName || 'İsimsiz'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                          <Mail size={14} />
                          {getUserInfo(selectedListing.userId).email}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-blue-200">
                      <div className="flex items-center gap-2">
                        <Shield size={16} className="text-gray-500" />
                        <span className="text-gray-500">Rol:</span>
                        <span className="ml-2 font-medium capitalize">
                          {getUserInfo(selectedListing.userId).role === 'admin' ? 'Admin' : 
                           getUserInfo(selectedListing.userId).role === 'superadmin' ? 'Süper Admin' : 'Kullanıcı'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-gray-500">Üyelik:</span>
                        <span className="ml-2 font-medium">
                          {getUserInfo(selectedListing.userId).createdAt ? new Date(getUserInfo(selectedListing.userId).createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Durum:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                          getUserInfo(selectedListing.userId).isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {getUserInfo(selectedListing.userId).isBanned ? 'Yasaklı' : 'Aktif'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Kullanıcı ID:</span>
                        <span className="ml-2 font-mono text-xs text-gray-600">{getUserInfo(selectedListing.userId).id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!getUserInfo(selectedListing.userId) && (
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-yellow-800">Kullanıcı bilgisi bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminListings;


