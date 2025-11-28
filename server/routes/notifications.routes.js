import express from 'express';
import { authenticateToken } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';

const router = express.Router();

// Kullanıcının bildirimlerini getir
router.get('/', authenticateToken, (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    const notifications = dbQuery.getUserNotifications(req.userId);
    res.json(notifications);
  } catch (error) {
    console.error('❌ Bildirimler alınamadı:', error);
    res.status(500).json({ error: error.message || 'Bildirimler alınamadı' });
  }
});

// Bildirimi okundu olarak işaretle
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    const notification = dbQuery.markNotificationAsRead(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Bildirim bulunamadı' });
    }
    
    if (notification.userId !== req.userId) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('❌ Bildirim okundu olarak işaretlenemedi:', error);
    res.status(500).json({ error: error.message || 'Bildirim okundu olarak işaretlenemedi' });
  }
});

export default router;


