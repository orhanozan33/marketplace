import express from 'express';
import { registerUser, loginUser, authenticateToken, getUserById } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';

const router = express.Router();

// Kullanıcı kayıt
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName, phone, postalCode } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    if (!phone || !postalCode) {
      return res.status(400).json({ error: 'Telefon ve posta kodu zorunludur' });
    }

    const result = await registerUser(email, password, displayName, phone, postalCode);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Kullanıcı giriş
router.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login isteği alındı:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log('❌ Email veya şifre eksik');
      return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    console.log('✅ Login fonksiyonu çağrılıyor...');
    const result = await loginUser(email, password);
    console.log('✅ Login başarılı:', result.user?.email);
    res.json(result);
  } catch (error) {
    console.error('❌ Login hatası:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// Kullanıcı bilgilerini al
router.get('/me', authenticateToken, (req, res) => {
  const user = dbQuery.getUserById(req.userId);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    console.log('📤 /api/auth/me - Kullanıcı bilgileri:', {
      id: userWithoutPassword.id,
      photoURL: userWithoutPassword.photoURL,
      displayName: userWithoutPassword.displayName
    });
    res.json({ user: userWithoutPassword });
  } else {
    res.status(404).json({ error: 'Kullanıcı bulunamadı' });
  }
});

export default router;


