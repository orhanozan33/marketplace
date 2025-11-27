import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const adsPath = path.join(__dirname, 'advertisements.json');

// Reklam dosyasını yükle veya oluştur
const loadAdvertisements = () => {
  if (fs.existsSync(adsPath)) {
    try {
      const data = fs.readFileSync(adsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Reklam dosyası okunamadı, varsayılan oluşturuluyor:', error);
      return createDefaultAds();
    }
  }
  return createDefaultAds();
};

// Varsayılan reklam yapısı (6 slot)
const createDefaultAds = () => {
  const defaultAds = {
    ad1: { fileUrl: '', url: '', active: false },
    ad2: { fileUrl: '', url: '', active: false },
    ad3: { fileUrl: '', url: '', active: false },
    ad4: { fileUrl: '', url: '', active: false },
    ad5: { fileUrl: '', url: '', active: false },
    ad6: { fileUrl: '', url: '', active: false }
  };
  saveAdvertisements(defaultAds);
  return defaultAds;
};

// Reklamları kaydet
const saveAdvertisements = (ads) => {
  fs.writeFileSync(adsPath, JSON.stringify(ads, null, 2), 'utf8');
};

// Aktif reklamları getir (rotasyon için)
export const getActiveAds = () => {
  try {
    const ads = loadAdvertisements();
    const activeAds = [];
    for (let i = 1; i <= 6; i++) {
      const ad = ads[`ad${i}`];
      if (ad && ad.active && ad.fileUrl) {
        activeAds.push({
          slot: `ad${i}`,
          fileUrl: ad.fileUrl,
          url: ad.url || ''
        });
      }
    }
    return activeAds;
  } catch (error) {
    console.error('getActiveAds error:', error);
    return [];
  }
};

// Tüm reklamları getir (Admin)
export const getAllAds = () => {
  try {
    return loadAdvertisements();
  } catch (error) {
    console.error('getAllAds error:', error);
    return createDefaultAds();
  }
};

// Reklam güncelle (Admin)
export const updateAd = (slot, adData) => {
  try {
    if (!slot || !slot.match(/^ad[1-6]$/)) {
      console.error('❌ updateAd: Geçersiz slot:', slot);
      return null;
    }
    
    if (!adData || typeof adData !== 'object') {
      console.error('❌ updateAd: Geçersiz adData:', adData);
      return null;
    }
    
    const ads = loadAdvertisements();
    if (!ads || typeof ads !== 'object') {
      console.error('❌ updateAd: loadAdvertisements geçersiz döndü:', ads);
      return null;
    }
    
    if (!ads[slot]) {
      // Slot yoksa oluştur
      ads[slot] = { fileUrl: '', url: '', active: false };
    }
    
    // Mevcut değerleri al
    const currentAd = ads[slot] || { fileUrl: '', url: '', active: false };
    
    // fileUrl güncellemesi: eğer adData.fileUrl varsa kullan, yoksa mevcut değeri koru
    const newFileUrl = adData.fileUrl !== undefined ? (adData.fileUrl || '') : currentAd.fileUrl;
    
    // Yeni reklam verisi
    ads[slot] = {
      fileUrl: newFileUrl || '',
      url: adData.url !== undefined ? (adData.url || '') : currentAd.url,
      active: adData.active !== undefined ? Boolean(adData.active) : currentAd.active
    };
    
    saveAdvertisements(ads);
    return ads[slot];
  } catch (error) {
    console.error('❌ updateAd error:', error);
    console.error('❌ updateAd error stack:', error.stack);
    return null;
  }
};

// Reklam sil (slot'u temizle)
export const deleteAd = (slot) => {
  try {
    const ads = loadAdvertisements();
    if (!ads[slot]) {
      return false;
    }
    ads[slot] = { fileUrl: '', url: '', active: false };
    saveAdvertisements(ads);
    return true;
  } catch (error) {
    console.error('deleteAd error:', error);
    return false;
  }
};

