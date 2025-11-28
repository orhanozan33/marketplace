import express from 'express';
import { authenticateToken, getUserById } from '../auth/auth.js';
import { dbQuery, loadDatabase, saveDatabase } from '../database/database.js';

const router = express.Router();

// Admin kontrol middleware
const requireAdmin = (req, res, next) => {
  const user = getUserById(req.userId);
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
  next();
};

// Admin istatistikleri
router.get('/statistics', authenticateToken, requireAdmin, (req, res) => {
  try {
    const allUsers = dbQuery.getUsers();
    const adminUsers = allUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length;
    const regularUsers = allUsers.filter(u => u.role === 'user').length;

    const allListings = dbQuery.getListings();
    const activeListings = allListings.filter(l => l.status === 'active').length;
    const inactiveListings = allListings.filter(l => l.status !== 'active').length;

    const allMessages = dbQuery.getMessages();
    const totalMessages = allMessages.length;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentListings = allListings.filter(l => {
      const createdAt = new Date(l.createdAt);
      return createdAt >= sevenDaysAgo;
    }).length;

    const categoryCounts = {};
    allListings.forEach(listing => {
      categoryCounts[listing.category] = (categoryCounts[listing.category] || 0) + 1;
    });

    res.json({
      totalUsers: allUsers.length,
      adminUsers,
      regularUsers,
      totalListings: allListings.length,
      activeListings,
      inactiveListings,
      totalMessages,
      recentListings,
      categoryCounts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tüm mesajları getir (Admin)
router.get('/messages', authenticateToken, requireAdmin, (req, res) => {
  try {
    const allMessages = dbQuery.getAllMessages();
    const allUsers = dbQuery.getUsers();
    const allListings = dbQuery.getListings();
    
    const messagesWithDetails = allMessages.map(msg => {
      const sender = allUsers.find(u => u.id === msg.senderId);
      const receiver = allUsers.find(u => u.id === msg.receiverId);
      const listing = allListings.find(l => l.id === msg.listingId);
      
      return {
        ...msg,
        sender: sender ? {
          id: sender.id,
          displayName: sender.displayName,
          email: sender.email
        } : null,
        receiver: receiver ? {
          id: receiver.id,
          displayName: receiver.displayName,
          email: receiver.email
        } : null,
        listing: listing ? {
          id: listing.id,
          title: listing.title,
          category: listing.category
        } : null
      };
    });
    
    res.json(messagesWithDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mesaj sil (Admin)
router.delete('/messages/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const message = dbQuery.getMessageById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
    
    const db = loadDatabase();
    if (!db.messages) {
      db.messages = [];
    }
    const index = db.messages.findIndex(m => m.id === req.params.id);
    if (index !== -1) {
      db.messages.splice(index, 1);
      saveDatabase(db);
      res.json({ success: true, message: 'Mesaj silindi' });
    } else {
      res.status(404).json({ error: 'Mesaj bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcının tüm mesajlarını getir (Admin)
router.get('/user/:userId/messages', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { userId } = req.params;
    const allMessages = dbQuery.getAllMessages();
    
    const userMessages = allMessages.filter(msg => 
      msg.senderId === userId || msg.receiverId === userId
    );
    
    const messagesWithListing = userMessages.map(msg => {
      const listing = dbQuery.getListingById(msg.listingId);
      const sender = dbQuery.getUserById(msg.senderId);
      const receiver = dbQuery.getUserById(msg.receiverId);
      
      return {
        ...msg,
        listing: listing ? {
          id: listing.id,
          title: listing.title,
          category: listing.category
        } : null,
        sender: sender ? {
          id: sender.id,
          displayName: sender.displayName,
          email: sender.email
        } : null,
        receiver: receiver ? {
          id: receiver.id,
          displayName: receiver.displayName,
          email: receiver.email
        } : null
      };
    });
    
    res.json(messagesWithListing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;


