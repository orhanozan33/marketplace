import express from 'express';
import { authenticateToken } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';

const router = express.Router();

// Mesaj gönder
router.post('/', authenticateToken, (req, res) => {
  try {
    const { listingId, receiverId, message } = req.body;
    
    if (!listingId || !receiverId || !message) {
      return res.status(400).json({ error: 'listingId, receiverId ve message gerekli' });
    }
    
    const newMessage = dbQuery.createMessage({
      listingId,
      senderId: req.userId,
      receiverId,
      message,
      read: false
    });
    
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mesajları getir
router.get('/', authenticateToken, (req, res) => {
  try {
    const { listingId, otherUserId } = req.query;
    
    const messages = dbQuery.getMessages({
      userId: req.userId,
      listingId,
      otherUserId
    });
    
    if (!Array.isArray(messages)) {
      return res.status(500).json({ error: 'Mesajlar yüklenemedi' });
    }
    
    const allUsers = dbQuery.getUsers();
    
    if (!Array.isArray(allUsers)) {
      return res.status(500).json({ error: 'Kullanıcılar yüklenemedi' });
    }
    
    const messagesWithSenders = messages.map(msg => {
      try {
        if (!msg || !msg.senderId) {
          return {
            ...msg,
            senderName: 'Kullanıcı',
            senderPhotoURL: null
          };
        }
        
        const sender = allUsers.find(u => u && u.id === msg.senderId);
        const senderName = sender?.displayName?.trim() 
          ? sender.displayName.trim() 
          : (sender?.email || 'Kullanıcı');
        return {
          ...msg,
          senderName: senderName,
          senderPhotoURL: sender?.photoURL || null
        };
      } catch (mapError) {
        return {
          ...msg,
          senderName: 'Kullanıcı',
          senderPhotoURL: null
        };
      }
    });
    
    res.json(messagesWithSenders);
  } catch (error) {
    console.error('❌ Messages endpoint hatası:', error);
    res.status(500).json({ error: error.message || 'Mesajlar yüklenirken hata oluştu' });
  }
});

// Mesaj sil
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const message = dbQuery.getMessageById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
    
    if (message.senderId !== req.userId && message.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Bu mesajı silme yetkiniz yok' });
    }
    
    const deleted = dbQuery.deleteMessage(req.params.id, req.userId);
    if (deleted) {
      res.json({ success: true, message: 'Mesaj silindi' });
    } else {
      res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mesajı okundu olarak işaretle
router.put('/:id/read', authenticateToken, (req, res) => {
  try {
    const message = dbQuery.getMessageById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
    
    if (message.receiverId !== req.userId) {
      return res.status(403).json({ error: 'Bu mesajı okundu olarak işaretleme yetkiniz yok' });
    }
    
    const updated = dbQuery.updateMessage(req.params.id, { read: true });
    if (updated) {
      res.json(updated);
    } else {
      res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


