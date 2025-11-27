import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dbQuery from './database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// JWT token oluştur
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// JWT token doğrula
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Kullanıcı kayıt
export const registerUser = async (email, password, displayName, phone, postalCode) => {
  // Email kontrolü
  const existingUser = dbQuery.getUserByEmail(email);
  if (existingUser) {
    throw new Error('Bu email zaten kullanılıyor');
  }

  // Zorunlu alan kontrolü
  if (!phone || !postalCode) {
    throw new Error('Telefon ve posta kodu zorunludur');
  }

  // Şifreyi hashle
  const hashedPassword = await bcrypt.hash(password, 10);

  // Kullanıcıyı kaydet
  const user = dbQuery.createUser({
    email,
    password: hashedPassword,
    displayName: displayName || email.split('@')[0],
    phone: phone || '',
    postalCode: postalCode || '',
    role: 'user',
    photoURL: null,
    isBanned: false
  });

  const { password: _, ...userWithoutPassword } = user;
  const token = generateToken(user.id);

  return { user: userWithoutPassword, token };
};

// Kullanıcı giriş
export const loginUser = async (email, password) => {
  const user = dbQuery.getUserByEmail(email);
  
  if (!user) {
    throw new Error('Email veya şifre hatalı');
  }

  if (user.isBanned) {
    throw new Error('Hesabınız engellenmiş');
  }

  // Şifre kontrolü
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Email veya şifre hatalı');
  }

  // Token oluştur
  const token = generateToken(user.id);

  // Şifreyi response'dan çıkar
  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

// Kullanıcı bilgilerini al
export const getUserById = (userId) => {
  const user = dbQuery.getUserById(userId);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  return null;
};

// Auth middleware
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token bulunamadı' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Geçersiz token' });
  }

  req.userId = decoded.userId;
  next();
};

// Admin kontrolü
export const isAdmin = (userId) => {
  const user = getUserById(userId);
  return user && (user.role === 'admin' || user.role === 'superadmin');
};

// Admin middleware
export const requireAdmin = (req, res, next) => {
  if (!isAdmin(req.userId)) {
    return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
  next();
};

