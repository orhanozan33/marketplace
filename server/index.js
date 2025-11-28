import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/database.js';
import { requestLogger } from './middleware/request.logger.js';
import { jsonHandler } from './middleware/json.middleware.js';
import { errorHandler } from './middleware/error.handler.js';
import { uploadsDir } from './middleware/multer.config.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import listingsRoutes from './routes/listings.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import conversationsRoutes from './routes/conversations.routes.js';
import usersRoutes from './routes/users.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import adminRoutes from './routes/admin.routes.js';
import advertisementsRoutes from './routes/advertisements.routes.js';
import adminAdvertisementsRoutes from './routes/admin-advertisements.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Veritabanını başlat
initDatabase();

// CORS ayarları
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Request logger middleware
app.use(requestLogger);

// JSON ve form data desteği
app.use(jsonHandler);

// Statik dosya servisi (yüklenen resimleri göster)
app.use('/uploads', express.static(uploadsDir));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// ==================== ROUTES ====================

// Auth routes
app.use('/api/auth', authRoutes);

// Listings routes
app.use('/api/listings', listingsRoutes);

// Messages routes
app.use('/api/messages', messagesRoutes);

// Conversations routes
app.use('/api/conversations', conversationsRoutes);

// Users routes
app.use('/api/users', usersRoutes);

// Notifications routes
app.use('/api/notifications', notificationsRoutes);

// Upload routes
app.use('/api/upload', uploadRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Advertisements routes (public)
app.use('/api/advertisements', advertisementsRoutes);

// Admin advertisements routes
app.use('/api/admin/advertisements', adminAdvertisementsRoutes);

// Error handler middleware (en son)
app.use(errorHandler);

// Server başlat
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${uploadsDir}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`✅ Backend hazır ve istekleri bekliyor!`);
  console.log(`📋 Route'lar modüler yapıda organize edildi!`);
});

