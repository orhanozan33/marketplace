import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Save, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast, useConfirm } from '@/context/ToastContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminAdvertisements = () => {
  const { success, error } = useToast();
  const confirm = useConfirm();
  const [ads, setAds] = useState({
    ad1: { fileUrl: '', url: '', active: false },
    ad2: { fileUrl: '', url: '', active: false },
    ad3: { fileUrl: '', url: '', active: false },
    ad4: { fileUrl: '', url: '', active: false },
    ad5: { fileUrl: '', url: '', active: false },
    ad6: { fileUrl: '', url: '', active: false }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/advertisements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Güvenli kontrol: data bir obje olmalı
        if (data && typeof data === 'object') {
          setAds(data);
        } else {
          console.warn('Reklamlar geçersiz formatta, varsayılan değerler kullanılıyor');
          setAds({
            ad1: { fileUrl: '', url: '', active: false },
            ad2: { fileUrl: '', url: '', active: false },
            ad3: { fileUrl: '', url: '', active: false },
            ad4: { fileUrl: '', url: '', active: false },
            ad5: { fileUrl: '', url: '', active: false },
            ad6: { fileUrl: '', url: '', active: false }
          });
        }
      } else {
        console.error('Reklamlar yüklenemedi:', response.status, response.statusText);
        // Hata durumunda varsayılan değerleri kullan
        setAds({
          ad1: { fileUrl: '', url: '', active: false },
          ad2: { fileUrl: '', url: '', active: false },
          ad3: { fileUrl: '', url: '', active: false },
          ad4: { fileUrl: '', url: '', active: false },
          ad5: { fileUrl: '', url: '', active: false },
          ad6: { fileUrl: '', url: '', active: false }
        });
      }
    } catch (error) {
      console.error('Error loading ads:', error);
      // Hata durumunda varsayılan değerleri kullan
      setAds({
        ad1: { fileUrl: '', url: '', active: false },
        ad2: { fileUrl: '', url: '', active: false },
        ad3: { fileUrl: '', url: '', active: false },
        ad4: { fileUrl: '', url: '', active: false },
        ad5: { fileUrl: '', url: '', active: false },
        ad6: { fileUrl: '', url: '', active: false }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e, slot) => {
    const file = e.target.files[0];
    if (file) {
      setAds(prev => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          file: file
        }
      }));
    }
  };

  const handleSave = async (slot) => {
    const ad = ads[slot];
    if (!ad) {
      error('Reklam verisi bulunamadı');
      return;
    }

    if (!ad.file && !ad.fileUrl) {
      error('Lütfen bir dosya yükleyin veya dosya URL\'si girin');
      return;
    }

    setSaving(prev => ({ ...prev, [slot]: true }));

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        error('Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.');
        return;
      }

      const formData = new FormData();
      
      console.log('💾 Reklam kaydediliyor:', slot);
      console.log('   Dosya var mı?', !!ad.file);
      console.log('   fileUrl var mı?', !!ad.fileUrl);
      
      if (ad.file) {
        console.log('   📎 Dosya adı:', ad.file.name);
        console.log('   📎 Dosya boyutu:', ad.file.size, 'bytes');
        console.log('   📎 Dosya tipi:', ad.file.type);
        formData.append('file', ad.file);
        // folder artık backend'de sabit, ama yine de gönderelim
        formData.append('folder', 'advertisements');
      }
      if (ad.fileUrl && !ad.file) {
        console.log('   🔗 fileUrl kullanılıyor:', ad.fileUrl);
        formData.append('fileUrl', ad.fileUrl);
      }
      formData.append('url', ad.url || '');
      formData.append('active', ad.active ? 'true' : 'false');
      
      console.log('   📤 FormData gönderiliyor...');

      const response = await fetch(`${API_URL}/api/admin/advertisements/${slot}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const updated = await response.json();
        if (updated && typeof updated === 'object') {
          setAds(prev => ({
            ...prev,
            [slot]: {
              ...updated,
              file: undefined // Dosya referansını temizle
            }
          }));
          success('Reklam kaydedildi!');
          // Reklamları yeniden yükle
          await loadAds();
        } else {
          console.error('Geçersiz yanıt:', updated);
          error('Reklam kaydedildi ancak yanıt geçersiz. Sayfayı yenileyin.');
        }
      } else {
        let errorMessage = 'Bilinmeyen hata';
        try {
          const err = await response.json();
          errorMessage = err.error || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || `HTTP ${response.status}`;
        }
        console.error('Reklam kaydedilemedi:', response.status, errorMessage);
        error(`Hata: ${errorMessage}`);
      }
    } catch (err) {
      console.error('Error saving ad:', err);
      error(`Reklam kaydedilirken hata oluştu: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setSaving(prev => ({ ...prev, [slot]: false }));
    }
  };

  const handleDelete = async (slot) => {
    const confirmed = await confirm(
      'Reklamı Sil',
      'Bu reklamı silmek istediğinizden emin misiniz?',
      'Sil',
      'İptal',
      'warning'
    );
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/admin/advertisements/${slot}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAds(prev => ({
          ...prev,
          [slot]: { fileUrl: '', url: '', active: false }
        }));
        success('Reklam silindi!');
      } else {
        error('Reklam silinirken hata oluştu');
      }
    } catch (err) {
      console.error('Error deleting ad:', err);
      error('Reklam silinirken hata oluştu');
    }
  };

  const updateAdField = (slot, field, value) => {
    setAds(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Reklam Yönetimi (6 Slot)</h2>
      
      <div className="space-y-6">
        {[1, 2, 3, 4, 5, 6].map((num) => {
          const slot = `ad${num}`;
          const ad = ads[slot] || { fileUrl: '', url: '', active: false };
          
          return (
            <motion.div
              key={slot}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-4 bg-gray-50"
            >
              <div className="flex items-start gap-4">
                {/* Sol: Dosya Yükleme */}
                <div className="flex-shrink-0">
                  <label className="block w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-red-500 transition-colors flex items-center justify-center bg-white">
                    {ad.fileUrl || ad.file ? (
                      <div className="relative w-full h-full">
                        <img
                          src={ad.fileUrl || URL.createObjectURL(ad.file)}
                          alt={`Reklam ${num}`}
                          className="w-full h-full object-cover rounded"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/128x128/3B82F6/white?text=Ad';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                        <span className="text-xs text-gray-500">Dosya Seç</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, slot)}
                    />
                  </label>
                </div>

                {/* Orta: Form Alanları */}
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Reklam {num}
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">URL (Tıklanınca gidecek)</label>
                    <input
                      type="url"
                      value={ad.url || ''}
                      onChange={(e) => updateAdField(slot, 'url', e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Veya Dosya URL'si</label>
                    <input
                      type="url"
                      value={ad.fileUrl || ''}
                      onChange={(e) => updateAdField(slot, 'fileUrl', e.target.value)}
                      placeholder="https://example.com/ad.jpg"
                      className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`active-${slot}`}
                      checked={ad.active || false}
                      onChange={(e) => updateAdField(slot, 'active', e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor={`active-${slot}`} className="text-sm text-gray-700">
                      Aktif
                    </label>
                  </div>
                </div>

                {/* Sağ: İşlemler */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => handleSave(slot)}
                    disabled={saving[slot]}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Save size={16} />
                    {saving[slot] ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <button
                    onClick={() => handleDelete(slot)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm"
                  >
                    <Trash2 size={16} />
                    Sil
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAdvertisements;
