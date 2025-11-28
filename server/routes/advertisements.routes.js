import express from 'express';
import { getActiveAds } from '../advertisements/advertisements.js';

const router = express.Router();

// Aktif reklamları getir (Public - rotasyon için)
router.get('/', (req, res) => {
  try {
    console.log('📥 GET /api/advertisements - İstek alındı');
    let ads;
    try {
      ads = getActiveAds();
      console.log('📥 GET /api/advertisements - getActiveAds sonucu:', Array.isArray(ads) ? `${ads.length} adet` : typeof ads);
    } catch (getError) {
      console.error('❌ getActiveAds çağrısında hata:', getError);
      return res.json([]);
    }
    
    if (Array.isArray(ads)) {
      return res.json(ads);
    }
    console.warn('⚠️ getActiveAds returned non-array:', ads);
    return res.json([]);
  } catch (error) {
    console.error('❌ /api/advertisements error:', error);
    return res.json([]);
  }
});

export default router;
