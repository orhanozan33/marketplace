import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Shield, Ban, CheckCircle, Mail, Calendar, UserPlus, X, Lock, FileText, MessageSquare, Eye, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAllUsers, deleteUser, toggleUserStatus, updateUserRole, createUserAdmin, fetchListings, getUserMessages } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useToast, useConfirm } from '@/context/ToastContext';

const AdminUsers = ({ onRefresh }) => {
  const { user: currentUser } = useAuth();
  const { success, error } = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    displayName: '',
    role: 'user'
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const [userMessages, setUserMessages] = useState([]);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showListingDetailModal, setShowListingDetailModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [enlargedProfileImage, setEnlargedProfileImage] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    const confirmed = await confirm(
      'Kullanıcıyı Sil',
      'Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      'Sil',
      'İptal',
      'danger'
    );
    if (!confirmed) return;
    
    try {
      await deleteUser(userId);
      await loadUsers();
      if (onRefresh) onRefresh();
      success('Kullanıcı silindi!');
    } catch (err) {
      error('Kullanıcı silinirken bir hata oluştu');
    }
  };

  const handleToggleBan = async (userId, isBanned) => {
    try {
      await toggleUserStatus(userId, !isBanned);
      await loadUsers();
      if (onRefresh) onRefresh();
      success(`Kullanıcı ${!isBanned ? 'yasaklandı' : 'yasak kaldırıldı'}!`);
    } catch (err) {
      error('Kullanıcı durumu değiştirilirken bir hata oluştu');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      await loadUsers();
      if (onRefresh) onRefresh();
      success(`Kullanıcı rolü ${newRole} olarak güncellendi!`);
    } catch (err) {
      error('Kullanıcı rolü değiştirilirken bir hata oluştu');
    }
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setShowUserDetailModal(true);
    setLoadingUserDetails(true);
    setUserListings([]);
    setUserMessages([]);
    
    try {
      // Kullanıcının tüm ilanlarını getir
      const allListings = await fetchListings();
      console.log('All listings:', allListings);
      const userListingsData = allListings.filter(listing => listing.userId === user.id);
      console.log('User listings:', userListingsData);
      setUserListings(userListingsData || []);
      
      // Kullanıcının tüm mesajlarını getir (gönderdiği ve aldığı)
      try {
        const messages = await getUserMessages(user.id);
        console.log('User messages:', messages);
        setUserMessages(messages || []);
      } catch (msgError) {
        console.error('Error loading messages:', msgError);
        setUserMessages([]);
      }
    } catch (error) {
      console.error('Error loading user details:', error);
      setUserListings([]);
      setUserMessages([]);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreating(true);

    if (!newUser.email || !newUser.password || !newUser.displayName) {
      setCreateError('Lütfen tüm alanları doldurun');
      setCreating(false);
      return;
    }

    try {
      // Admin API ile kullanıcı oluştur (oturum kapanmaz)
      await createUserAdmin(newUser.email, newUser.password, newUser.displayName, newUser.role);

      // Başarılı - modal'ı kapat
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', displayName: '', role: 'user' });
      
      // Kullanıcı listesini yenile
      await loadUsers();
      if (onRefresh) onRefresh();
      
      success(`Kullanıcı başarıyla oluşturuldu! Email: ${newUser.email}, Rol: ${newUser.role}`);
    } catch (err) {
      console.error('Error creating user:', err);
      setCreateError(err.message || 'Kullanıcı oluşturulurken bir hata oluştu');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.displayName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
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
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Kullanıcı Yönetimi</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          <UserPlus size={18} />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Tüm Roller</option>
            <option value="admin">Admin</option>
            <option value="superadmin">Super Admin</option>
            <option value="user">Kullanıcı</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kullanıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-posta</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kayıt Tarihi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    Kullanıcı bulunamadı
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleUserClick(user)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 font-semibold">
                            {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{user.displayName || 'İsimsiz'}</p>
                          <p className="text-xs text-gray-500">ID: {user.id.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className="px-2 py-1 border rounded text-xs font-medium focus:ring-2 focus:ring-red-500"
                      >
                        <option value="user">Kullanıcı</option>
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          user.isBanned
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.isBanned ? (
                          <>
                            <Ban size={12} />
                            Yasaklı
                          </>
                        ) : (
                          <>
                            <CheckCircle size={12} />
                            Aktif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleToggleBan(user.id, user.isBanned)}
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          title={user.isBanned ? 'Yasağı Kaldır' : 'Yasakla'}
                        >
                          {user.isBanned ? (
                            <CheckCircle size={18} className="text-green-600" />
                          ) : (
                            <Ban size={18} className="text-red-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors"
                          title="Sil"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Info */}
      <div className="text-sm text-gray-600 text-center">
        Toplam {filteredUsers.length} kullanıcı gösteriliyor
      </div>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Yeni Kullanıcı Oluştur</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Mail size={14} />
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="kullanici@example.com"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Lock size={14} />
                    Şifre
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder="En az 6 karakter"
                    required
                    minLength={6}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <Shield size={14} />
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={newUser.displayName}
                    onChange={(e) => setNewUser({ ...newUser, displayName: e.target.value })}
                    placeholder="Kullanıcı Adı"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  >
                    <option value="user">Kullanıcı</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {createError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {createError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {creating ? 'Oluşturuluyor...' : 'Oluştur'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Kullanıcı Detay Modal */}
      <AnimatePresence>
        {showUserDetailModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowUserDetailModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedUser.photoURL ? (
                    <img
                      src={selectedUser.photoURL}
                      alt={selectedUser.displayName || 'Kullanıcı'}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedProfileImage(selectedUser.photoURL)}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-16 h-16 bg-red-100 rounded-full flex items-center justify-center ${selectedUser.photoURL ? 'hidden' : ''}`}
                  >
                    <span className="text-red-600 font-bold text-xl">
                      {selectedUser.displayName?.[0]?.toUpperCase() || selectedUser.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedUser.displayName || 'İsimsiz'}</h2>
                    <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Mail size={14} />
                      {selectedUser.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserDetailModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingUserDetails ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                    <p className="text-gray-500">Yükleniyor...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Kullanıcı Bilgileri */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} />
                        Kullanıcı Bilgileri
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Rol:</span>
                          <span className="ml-2 font-medium capitalize">
                            {selectedUser.role === 'admin' ? 'Admin' : 
                             selectedUser.role === 'superadmin' ? 'Süper Admin' : 'Kullanıcı'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Durum:</span>
                          <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                            selectedUser.isBanned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {selectedUser.isBanned ? 'Yasaklı' : 'Aktif'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">E-posta:</span>
                          <span className="ml-2 font-medium">{selectedUser.email || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Telefon:</span>
                          <span className="ml-2 font-medium">{selectedUser.phone || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Posta Kodu:</span>
                          <span className="ml-2 font-medium">{selectedUser.postalCode || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Adres:</span>
                          <span className="ml-2 font-medium">{selectedUser.address || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Kayıt Tarihi:</span>
                          <span className="ml-2 font-medium">
                            {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Son Güncelleme:</span>
                          <span className="ml-2 font-medium">
                            {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-gray-500">Kullanıcı ID:</span>
                          <span className="ml-2 font-mono text-xs text-gray-600">{selectedUser.id}</span>
                        </div>
                        {selectedUser.photoURL && (
                          <div className="col-span-2">
                            <span className="text-gray-500 block mb-2">Profil Resmi:</span>
                            <img
                              src={selectedUser.photoURL}
                              alt="Profil"
                              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* İlanlar */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <FileText size={20} />
                        İlanlar ({userListings.length})
                      </h3>
                      {userListings.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <FileText size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">Bu kullanıcının henüz ilanı yok</p>
                        </div>
                      ) : (
                      <div className="space-y-3">
                        {userListings.map((listing) => (
                          <div 
                            key={listing.id} 
                            className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                            onClick={() => {
                              setSelectedListing(listing);
                              setSelectedImageIndex(0);
                              setShowListingDetailModal(true);
                            }}
                          >
                            <div className="flex items-start gap-4">
                              {listing.image && (
                                <img
                                  src={listing.image}
                                  alt={listing.title}
                                  className="w-20 h-20 object-cover rounded"
                                  onError={(e) => {
                                    e.target.src = `https://placehold.co/80x80/3B82F6/white?text=${listing.category?.[0]?.toUpperCase() || 'L'}`;
                                  }}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-gray-800">{listing.title}</h4>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {listing.status === 'active' ? 'Aktif' : 'Pasif'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{listing.description || 'Açıklama yok'}</p>
                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                  <span className="capitalize">{listing.category}</span>
                                  <span>${listing.price?.toLocaleString() || '0'}</span>
                                  <span>{new Date(listing.createdAt).toLocaleDateString('tr-TR')}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      )}
                    </div>

                    {/* Mesajlar */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <MessageSquare size={20} />
                        Mesajlar ({userMessages.length})
                      </h3>
                      {userMessages.length === 0 ? (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <MessageSquare size={48} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-gray-500">Bu kullanıcının henüz mesajı yok</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {userMessages.map((msg) => (
                            <div key={msg.id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {msg.listing?.title || 'İlan bulunamadı'}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {msg.sender?.id === selectedUser.id ? (
                                      <span className="text-blue-600">Gönderen: {msg.sender?.displayName || msg.sender?.email} → {msg.receiver?.displayName || msg.receiver?.email}</span>
                                    ) : (
                                      <span className="text-green-600">Gönderen: {msg.sender?.displayName || msg.sender?.email} → {msg.receiver?.displayName || msg.receiver?.email}</span>
                                    )}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(msg.createdAt).toLocaleString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-gray-700">{msg.message}</p>
                              {msg.listing && (
                                <div className="mt-2 text-xs text-gray-500">
                                  <span className="capitalize">{msg.listing.category}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* İlan Detay Modal */}
      {showListingDetailModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowListingDetailModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">İlan Detayları</h2>
                <button
                  onClick={() => setShowListingDetailModal(false)}
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
                                onClick={() => setSelectedImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-2 rounded-full transition-all"
                                title="Önceki resim"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={() => setSelectedImageIndex((prev) => (prev + 1) % images.length)}
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
            </div>
          </div>
        </div>
      )}

      {/* Büyütülmüş Profil Resmi Modal */}
      {enlargedProfileImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]" 
          onClick={() => setEnlargedProfileImage(null)}
        >
          <button
            onClick={() => setEnlargedProfileImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={32} />
          </button>
          <img
            src={enlargedProfileImage}
            alt="Büyütülmüş profil resmi"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// İlan resimlerini getir
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

export default AdminUsers;

