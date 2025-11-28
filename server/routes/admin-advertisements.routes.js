import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken, getUserById } from '../auth/auth.js';
import { getAllAds, updateAd, deleteAd } from '../advertisements/advertisements.js';
import { uploadAd, handleMulterError } from '../middleware/multer.config.js';

const router = express.Router();

// Admin kontrol middleware
const requireAdmin = (req, res, next) => {
  const user = getUserById(req.userId);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
  next();
};

// Tüm reklamları getir (Admin)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    console.log('📥 GET /api/admin/advertisements - İstek alındı');
    
    let ads;
    try {
      ads = getAllAds();
      console.log('📥 GET /api/admin/advertisements - getAllAds sonucu:', typeof ads);
    } catch (getError) {
      console.error('❌ getAllAds çağrısında hata:', getError);
      return res.json({
        ad1: { fileUrl: '', url: '', active: false },
        ad2: { fileUrl: '', url: '', active: false },
        ad3: { fileUrl: '', url: '', active: false },
        ad4: { fileUrl: '', url: '', active: false },
        ad5: { fileUrl: '', url: '', active: false },
        ad6: { fileUrl: '', url: '', active: false }
      });
    }
    
    if (ads && typeof ads === 'object') {
      return res.json(ads);
    }
    console.warn('⚠️ getAllAds returned invalid data:', ads);
    return res.json({
      ad1: { fileUrl: '', url: '', active: false },
      ad2: { fileUrl: '', url: '', active: false },
      ad3: { fileUrl: '', url: '', active: false },
      ad4: { fileUrl: '', url: '', active: false },
      ad5: { fileUrl: '', url: '', active: false },
      ad6: { fileUrl: '', url: '', active: false }
    });
  } catch (error) {
    console.error('❌ /api/admin/advertisements GET error:', error);
    return res.json({
      ad1: { fileUrl: '', url: '', active: false },
      ad2: { fileUrl: '', url: '', active: false },
      ad3: { fileUrl: '', url: '', active: false },
      ad4: { fileUrl: '', url: '', active: false },
      ad5: { fileUrl: '', url: '', active: false },
      ad6: { fileUrl: '', url: '', active: false }
    });
  }
});

// Reklam güncelle (Admin) - Slot bazlı
router.put('/:slot', authenticateToken, uploadAd.single('file'), handleMulterError, requireAdmin, (req, res) => {
  try {
    console.log('📥 PUT /api/admin/advertisements/:slot - İstek alındı');
    
    const { slot } = req.params;
    if (!slot || !slot.match(/^ad[1-6]$/)) {
      return res.status(400).json({ error: 'Geçersiz slot. ad1-ad6 arası olmalı.' });
    }

    const { url, active } = req.body;
    
    let fileUrl = '';
    if (req.file) {
      const filePath = req.file.path;
      if (fs.existsSync(filePath)) {
        const folder = 'advertisements';
        fileUrl = `/uploads/${folder}/${req.file.filename}`;
        fileUrl = `${req.protocol}://${req.get('host')}${fileUrl}`;
        console.log('✅ Dosya yüklendi ve kaydedildi!');
      } else {
        console.error('❌ Dosya kaydedilmedi! Yol:', filePath);
        return res.status(500).json({ error: 'Dosya kaydedilemedi' });
      }
    } else if (req.body.fileUrl) {
      fileUrl = req.body.fileUrl;
    }

    const updateData = {
      url: url || '',
      active: active !== undefined ? (active === 'true' || active === true) : undefined
    };
    
    if (fileUrl) {
      updateData.fileUrl = fileUrl;
    }
    
    const updated = updateAd(slot, updateData);

    if (updated) {
      console.log('✅ Reklam güncellendi:', slot);
      return res.json(updated);
    } else {
      return res.status(500).json({ error: 'Reklam güncellenemedi' });
    }
  } catch (error) {
    console.error('❌ PUT /api/admin/advertisements/:slot error:', error);
    return res.status(500).json({ error: error.message || 'Sunucu hatası' });
  }
});

// Reklam sil (Admin) - Slot'u temizle
router.delete('/:slot', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { slot } = req.params;
    if (!slot || !slot.match(/^ad[1-6]$/)) {
      return res.status(400).json({ error: 'Geçersiz slot. ad1-ad6 arası olmalı.' });
    }

    const deleted = deleteAd(slot);
    if (deleted) {
      res.json({ message: 'Reklam silindi' });
    } else {
      res.status(404).json({ error: 'Reklam bulunamadı' });
    }
  } catch (error) {
    console.error('❌ DELETE /api/admin/advertisements/:slot error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


