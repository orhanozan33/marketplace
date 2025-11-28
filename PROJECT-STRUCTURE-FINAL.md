# Proje Yapısı - Final Düzenleme

## 📁 Klasör Yapısı

```
yeni-proje/
│
├── 📂 src/                          # Frontend kaynak kodları
│   ├── components/                  # React component'leri
│   ├── context/                     # Context API
│   ├── services/                    # API servisleri
│   ├── styles/                      # CSS dosyaları
│   ├── utils/                       # Yardımcı fonksiyonlar
│   ├── App.jsx                      # Ana component
│   └── main.jsx                     # Entry point
│
├── 📂 backend/                      # NestJS Backend (YENİ)
│   ├── src/
│   │   ├── entities/                # TypeORM entities
│   │   ├── modules/                 # NestJS modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── admin/               # Admin panel
│   │   ├── common/                  # Ortak dosyalar
│   │   ├── app.module.ts            # Ana modül
│   │   └── main.ts                  # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env                         # Environment variables
│
├── 📂 server/                       # Express Backend (ESKİ - Geçiş için)
│   ├── index.js                     # Ana server dosyası
│   ├── database.js                  # Database işlemleri
│   ├── auth.js                      # Authentication
│   ├── uploads/                     # Yüklenen dosyalar
│   └── package.json
│
├── 📂 dist/                         # Frontend build çıktısı
│
├── 📂 scripts/                      # Yardımcı scriptler
│   ├── createAdminUser.js
│   └── ...
│
├── 📄 package.json                  # Frontend package.json
├── 📄 vite.config.js                # Vite konfigürasyonu
├── 📄 .env.example                  # Örnek environment dosyası
├── 📄 .gitignore                    # Git ignore
├── 📄 README.md                     # Ana README
└── 📄 SETUP.md                      # Kurulum rehberi
```

## 🔄 İki Backend Sistemi

### Eski Sistem (server/)
- Express.js tabanlı
- JSON database (database.json)
- Şu anda kullanılıyor
- Port: 3000

### Yeni Sistem (backend/)
- NestJS tabanlı
- PostgreSQL database
- Gelecekte kullanılacak
- TypeScript
- Port: 3000 (farklı bir port'a taşınabilir)

## 📦 Build Sistemi

### Frontend Build
```bash
npm run build          # Production build
npm run preview        # Build'i test et
npm run start          # Build'i çalıştır
```

Çıktı: `dist/` klasörü

### Backend Build (NestJS)
```bash
cd backend
npm run build          # TypeScript compile
npm run start:prod     # Production mode
```

Çıktı: `backend/dist/` klasörü

## 🔌 API Endpoints

### Eski Server (server/)
- Base URL: `http://localhost:3000`
- Endpoints: `/api/*`

### Yeni Backend (backend/)
- Base URL: `http://localhost:3000/api`
- Endpoints: `/api/auth/*`, `/api/admin/*`, vb.

## 🔐 Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL'i

### Backend
- `DB_*` - Database ayarları
- `JWT_SECRET` - JWT secret key
- `PORT` - Server portu
- `FRONTEND_URL` - Frontend URL'i (CORS için)

## 📝 Notlar

- Eski server şu anda aktif kullanılıyor
- Yeni backend hazırlanıyor (migration için)
- Frontend her ikisiyle de çalışabilir (API_URL değiştirerek)

