import express from 'express';
import path from 'path';
import fs from 'fs';
import { authenticateToken, getUserById } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';
import { uploadProfile, uploadsDir } from '../middleware/multer.config.js';

const router = express.Router();

// Kullanıcı profil bilgilerini al (herkes görebilir) - ÖNEMLİ: /:id, /'den ÖNCE olmalı
router.get('/:id', authenticateToken, (req, res) => {
  try {
    console.log('📥 Kullanıcı profil isteği:', req.params.id);
    const user = dbQuery.getUserById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('❌ Kullanıcı profil hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Tüm kullanıcıları getir (Admin)
router.get('/', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const users = dbQuery.getUsers();
    const usersWithoutPasswords = users.map(u => {
      const { password: _, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı sil (Admin)
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Kendi hesabınızı silemezsiniz' });
    }

    const deleted = dbQuery.deleteUser(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Kullanıcı silindi' });
    } else {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı durumunu değiştir (ban/unban)
router.put('/:id/status', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const { isBanned } = req.body;
    const updated = dbQuery.updateUser(req.params.id, { isBanned: !!isBanned });
    
    if (updated) {
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı rolünü güncelle (Admin)
router.put('/:id/role', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const { role } = req.body;
    if (!['user', 'admin', 'superadmin'].includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol' });
    }

    const updated = dbQuery.updateUser(req.params.id, { role });
    
    if (updated) {
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı profil güncelleme (kendi profilini güncelleyebilir)
router.put('/:id/profile', (req, res, next) => {
  console.log('🚨🚨🚨 PROFİL GÜNCELLEME ENDPOINT\'İNE İSTEK GELDİ! 🚨🚨🚨');
  console.log('🚨 Method:', req.method);
  console.log('🚨 URL:', req.url);
  console.log('🚨 Params:', req.params);
  console.log('🚨 Content-Type:', req.get('Content-Type'));
  next();
}, authenticateToken, (req, res, next) => {
  console.log('🔍 Middleware başladı');
  console.log('🔍 Content-Type:', req.get('Content-Type'));
  next();
}, (req, res, next) => {
  uploadProfile.single('photo')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer hatası:', err);
      return res.status(400).json({ error: err.message || 'Dosya yükleme hatası' });
    }
    console.log('✅ Multer middleware tamamlandı');
    next();
  });
}, (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      return res.status(403).json({ error: 'Sadece kendi profilinizi güncelleyebilirsiniz' });
    }

    const body = req.body || {};
    const { displayName, phone, postalCode, email, address, showPhone, showAddress } = body;
    const updates = {};
    
    if (displayName !== undefined) updates.displayName = displayName;
    if (phone !== undefined) updates.phone = phone;
    if (postalCode !== undefined) updates.postalCode = postalCode;
    if (email !== undefined) updates.email = email;
    if (address !== undefined) updates.address = address;
    if (showPhone !== undefined) updates.showPhone = showPhone === 'true' || showPhone === true;
    if (showAddress !== undefined) updates.showAddress = showAddress === 'true' || showAddress === true;
    
    if (req.file) {
      const photoURL = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;
      updates.photoURL = photoURL;
      console.log('✅ Profil resmi yüklendi:', photoURL);
      
      const filePath = path.join(req.file.destination, req.file.filename);
      if (fs.existsSync(req.file.path)) {
        if (!fs.existsSync(filePath) || req.file.path !== filePath) {
          const profileDir = path.join(uploadsDir, 'profiles');
          if (!fs.existsSync(profileDir)) {
            fs.mkdirSync(profileDir, { recursive: true });
          }
          fs.copyFileSync(req.file.path, filePath);
        }
      }
    } else {
      const currentUser = dbQuery.getUserById(req.params.id);
      if (currentUser && currentUser.photoURL && !('photoURL' in updates)) {
        updates.photoURL = currentUser.photoURL;
      }
    }

    const safeUpdates = updates && typeof updates === 'object' ? updates : {};
    const updated = dbQuery.updateUser(req.params.id, safeUpdates);
    if (updated) {
      const { password: _, ...userWithoutPassword } = updated;
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    console.error('❌ Profil güncelleme hatası:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin tarafından kullanıcı oluştur
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }

    const { email, password, displayName, role = 'user' } = req.body;
    
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, şifre ve isim gerekli' });
    }

    const existingUser = dbQuery.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Bu email zaten kullanılıyor' });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = dbQuery.createUser({
      email,
      password: hashedPassword,
      displayName,
      role,
      photoURL: null,
      isBanned: false
    });

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Kullanıcı puanlarını getir
router.get('/:userId/ratings', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const ratings = dbQuery.getUserRatings(userId);
    res.json(ratings);
  } catch (error) {
    console.error('❌ Puanlar getirilemedi:', error);
    res.status(500).json({ error: error.message || 'Puanlar getirilemedi' });
  }
});

// Kullanıcıya puan ver
router.post('/:userId/ratings', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const { rating } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    if (req.userId === userId) {
      return res.status(400).json({ error: 'Kendi kendinize puan veremezsiniz' });
    }
    
    const ratingData = {
      userId: req.userId,
      ratedUserId: userId,
      rating: parseInt(rating)
    };
    const savedRating = dbQuery.createUserRating(ratingData);
    res.json(savedRating);
  } catch (error) {
    if (error.message && error.message.includes('zaten puan verdiniz')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Puan kaydedilemedi' });
  }
});

// Kullanıcı yorumlarını getir
router.get('/:userId/comments', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const comments = dbQuery.getUserComments(userId);
    const commentsWithUsers = comments.map(comment => {
      const user = dbQuery.getUserById(comment.userId);
      return {
        ...comment,
        userName: user?.displayName || 'Kullanıcı'
      };
    });
    res.json(commentsWithUsers);
  } catch (error) {
    console.error('❌ Yorumlar getirilemedi:', error);
    res.status(500).json({ error: error.message || 'Yorumlar getirilemedi' });
  }
});

// Kullanıcıya yorum yap
router.post('/:userId/comments', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const { comment, rating } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    if (req.userId === userId) {
      return res.status(400).json({ error: 'Kendi kendinize yorum yapamazsınız' });
    }
    
    const commentData = {
      userId: req.userId,
      ratedUserId: userId,
      comment: comment || '',
      rating: rating ? parseInt(rating) : 0
    };
    
    const savedComment = dbQuery.createUserComment(commentData);
    const user = dbQuery.getUserById(req.userId);
    
    const response = {
      ...savedComment,
      userName: user?.displayName || 'Kullanıcı'
    };
    
    res.json(response);
  } catch (error) {
    if (error.message && error.message.includes('zaten yorum yaptınız')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Yorum kaydedilemedi' });
  }
});

export default router;


