import express from 'express';
import { authenticateToken } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';

const router = express.Router();

// Kullanıcının konuşmalarını getir
router.get('/', authenticateToken, (req, res) => {
  try {
    const conversations = dbQuery.getConversations(req.userId);
    
    const normalizeImageUrl = (url, req) => {
      if (!url) return null;
      
      url = url.replace('localhost:3001', 'localhost:3000');
      
      if (url.includes('/uploads/listings/')) {
        const parts = url.split('/uploads/listings/');
        if (parts.length > 1) {
          const pathParts = parts[1].split('/');
          if (pathParts.length > 1 && pathParts[0].match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
            const filename = pathParts[pathParts.length - 1];
            url = `${req.protocol}://${req.get('host')}/uploads/listings/${filename}`;
          } else if (!url.startsWith('http')) {
            url = `${req.protocol}://${req.get('host')}/uploads/listings/${pathParts[pathParts.length - 1]}`;
          }
        }
      } else if (url.startsWith('/uploads/')) {
        url = `${req.protocol}://${req.get('host')}${url}`;
      }
      
      return url;
    };
    
    const normalizedConversations = conversations.map(conv => ({
      ...conv,
      listingImage: conv.listingImage ? normalizeImageUrl(conv.listingImage, req) : null
    }));
    
    const allUsers = dbQuery.getUsers();
    
    if (!Array.isArray(normalizedConversations) || !Array.isArray(allUsers)) {
      return res.status(500).json({ error: 'Konuşmalar yüklenemedi' });
    }
    
    const conversationsWithNames = normalizedConversations.map(conv => {
      try {
        if (!conv || !conv.otherUserId) {
          return {
            ...conv,
            otherUserName: 'Kullanıcı',
            listingImage: conv.listingImage || null
          };
        }
        
        const otherUser = allUsers.find(u => u && u.id === conv.otherUserId);
        const otherUserName = otherUser?.displayName?.trim() 
          ? otherUser.displayName.trim() 
          : (otherUser?.email || 'Kullanıcı');
        
        return {
          ...conv,
          otherUserName: otherUserName,
          listingImage: conv.listingImage || null
        };
      } catch (mapError) {
        return {
          ...conv,
          otherUserName: 'Kullanıcı',
          listingImage: conv.listingImage || null
        };
      }
    });
    
    res.json(conversationsWithNames);
  } catch (error) {
    console.error('❌ Conversations endpoint hatası:', error);
    res.status(500).json({ error: error.message || 'Konuşmalar yüklenirken hata oluştu' });
  }
});

// Konuşma sil (tüm mesajları sil)
router.delete('/', authenticateToken, (req, res) => {
  try {
    const { otherUserId, listingId } = req.query;
    
    if (!otherUserId || !listingId) {
      return res.status(400).json({ error: 'otherUserId ve listingId gerekli' });
    }
    
    const deletedCount = dbQuery.deleteConversation(req.userId, otherUserId, listingId);
    res.json({ success: true, deletedCount });
  } catch (error) {
    console.error('❌ Konuşma silme hatası:', error);
    res.status(500).json({ error: error.message || 'Konuşma silinirken hata oluştu' });
  }
});

export default router;


