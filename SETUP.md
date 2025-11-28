# Kurulum Rehberi

## 📋 Gereksinimler

- Node.js 18+
- PostgreSQL 12+
- npm veya yarn

## 🚀 Hızlı Başlangıç

### 1. Projeyi İndirin

```bash
git clone <repo-url>
cd yeni-proje
```

### 2. Frontend Kurulumu

```bash
# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Geliştirme modunda çalıştır
npm run dev
```

Frontend: http://localhost:5173

### 3. Backend Kurulumu (Eski Server - Express)

```bash
cd server
npm install

# Server'ı başlat
npm start
```

Backend: http://localhost:3000

### 4. Backend Kurulumu (Yeni - NestJS)

```bash
cd backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
# .env dosyasını oluşturun (backend/.env.example'a bakın)

# Database'i oluşturun
.\create-database.ps1

# Geliştirme modunda çalıştır
npm run start:dev
```

## 🔧 Environment Variables

### Frontend (.env)

```env
VITE_API_URL=http://localhost:3000
```

### Backend (backend/.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=marketplace

PORT=3000
FRONTEND_URL=http://localhost:5173

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
```

## 📦 Script'ler

### Frontend
- `npm run dev` - Geliştirme sunucusu
- `npm run build` - Production build
- `npm run preview` - Build'i test et
- `npm run start` - Build'i çalıştır

### Backend (NestJS)
- `npm run start:dev` - Geliştirme (watch mode)
- `npm run build` - Build
- `npm run start:prod` - Production

### Server (Express - Eski)
- `npm start` - Sunucuyu başlat
- `npm run dev` - Watch mode

## 🗄️ Database

### PostgreSQL Kurulumu

1. PostgreSQL'i yükleyin
2. Veritabanını oluşturun:
   ```sql
   CREATE DATABASE marketplace;
   ```
3. veya script kullanın:
   ```bash
   cd backend
   .\create-database.ps1
   ```

## ✅ Kontrol Listesi

- [ ] Node.js kurulu
- [ ] PostgreSQL kurulu ve çalışıyor
- [ ] Frontend bağımlılıkları yüklendi
- [ ] Backend bağımlılıkları yüklendi
- [ ] Environment dosyaları oluşturuldu
- [ ] Database oluşturuldu
- [ ] Server çalışıyor

## 🆘 Sorun Giderme

### Port çakışması
- Frontend: `vite.config.js`'de port değiştirin
- Backend: `.env` dosyasında PORT değiştirin

### Database bağlantı hatası
- PostgreSQL servisinin çalıştığından emin olun
- `.env` dosyasındaki bilgileri kontrol edin
- Firewall ayarlarını kontrol edin

### CORS hatası
- Backend'de CORS ayarlarını kontrol edin
- Frontend URL'sinin doğru olduğundan emin olun

