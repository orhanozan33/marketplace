import React, { useState, useEffect } from 'react';
import { Search, Trash2, MessageSquare, User, Calendar, Eye, Mail } from 'lucide-react';
import { getAllMessagesAdmin, deleteMessageAdmin } from '@/services/api';
import { useToast, useConfirm } from '@/context/ToastContext';

const AdminMessages = () => {
  const { success, error } = useToast();
  const confirm = useConfirm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const data = await getAllMessagesAdmin();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (messageId) => {
    const confirmed = await confirm(
      'Mesajı Sil',
      'Bu mesajı silmek istediğinize emin misiniz?',
      'Sil',
      'İptal',
      'warning'
    );
    if (!confirmed) return;
    
    try {
      await deleteMessageAdmin(messageId);
      await loadMessages();
      success('Mesaj silindi!');
    } catch (err) {
      error(`Mesaj silinirken bir hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const filteredMessages = messages.filter((message) => {
    return message.message?.toLowerCase().includes(searchTerm.toLowerCase());
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
      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Mesaj ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gönderen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alıcı</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mesaj</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İlan ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tarih</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                    Mesaj bulunamadı
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700 font-mono text-xs">
                          {message.senderId?.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700 font-mono text-xs">
                          {message.receiverId?.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-800 line-clamp-2">{message.message}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{message.listing?.title || 'İlan bulunamadı'}</p>
                        <p className="text-xs text-gray-500 font-mono">{message.listingId?.substring(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-gray-400" />
                        {message.createdAt ? new Date(message.createdAt).toLocaleString('tr-TR') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          message.read
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {message.read ? 'Okundu' : 'Okunmadı'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedMessage(message)}
                          className="p-2 hover:bg-blue-50 rounded transition-colors"
                          title="Detayları Gör"
                        >
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(message.id)}
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

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedMessage(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Mesaj Detayları</h3>
              <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-gray-700">
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Gönderen ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedMessage.senderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Alıcı ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedMessage.receiverId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">İlan ID</label>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedMessage.listingId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Mesaj</label>
                <p className="text-sm bg-gray-50 p-3 rounded">{selectedMessage.message}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Tarih</label>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedMessage.createdAt?.toDate?.().toLocaleString('tr-TR') || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Durum</label>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedMessage.read ? 'Okundu' : 'Okunmadı'}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Sil
              </button>
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination Info */}
      <div className="text-sm text-gray-600 text-center">
        Toplam {filteredMessages.length} mesaj gösteriliyor
      </div>
    </div>
  );
};

export default AdminMessages;

