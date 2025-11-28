# 🏪 Marketplace System

Modern, tam özellikli marketplace platformu - İlan yönetimi, mesajlaşma ve rezervasyon sistemi.

## 🎯 Geliştirme Prensipleri

**⚠️ ÖNEMLİ:** Dosya sistemi organizasyonu her zaman önceliktir! Tüm dosyalar gruplara göre organize edilmelidir.

- 📁 **Gruplu Yapı** - Her özellik kendi klasöründe
- 📝 **Standart İsimlendirme** - `grupaAdi.dosyaTipi.js` formatı
- 🔗 **Relative Path'ler** - Import'lar relative olmalı
- ✅ **Düzenli Yapı** - Karmaşık yapılar oluşturulmamalı

**Detaylı bilgi:** [GELISTIRME-PRENSIPLERI.md](./GELISTIRME-PRENSIPLERI.md)

## ✨ Özellikler

- 🏠 **Konut, Araç ve Al-Sat İlanları** - Çoklu kategori desteği
- 💬 **Gerçek Zamanlı Mesajlaşma** - Kullanıcılar arası iletişim
- 📍 **Google Maps Entegrasyonu** - Harita üzerinde ilan görüntüleme
- ⭐ **Kullanıcı Değerlendirme Sistemi** - Güven skoru ve yorumlar
- 🔒 **Rezervasyon ve Satış Yönetimi** - İlan rezervasyonu ve satış takibi
- 👤 **Kullanıcı Profil Yönetimi** - Detaylı profil ve ayarlar
- 📸 **Resim Yükleme** - Çoklu resim yükleme desteği
- 🔔 **Bildirim Sistemi** - Gerçek zamanlı bildirimler

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- PostgreSQL 12+ (yeni backend için)
- npm veya yarn

### Kurulum

```bash
# Tüm bağımlılıkları yükle (Frontend + Backend)
npm run setup

# veya manuel:
npm install
cd server && npm install
cd ../backend && npm install
```

### Çalıştırma

```bash
# 1. Frontend (http://localhost:5173)
npm run dev

# 2. Backend Server - Express (http://localhost:3000)
npm run server

# 3. Backend - NestJS (http://localhost:3000) - Opsiyonel
npm run backend
```

**💡 İpucu:** Server ve Frontend'i ayrı terminal pencerelerinde başlatın!

**Detaylı kurulum için:** [SETUP.md](./SETUP.md)

## 📁 Proje Yapısı

```
marketplace/
├── frontend/            # Frontend (React + Vite)
│   ├── src/            # Kaynak kodlar
│   ├── index.html      # Ana HTML
│   └── package.json    # Frontend bağımlılıkları
│
├── server/              # Backend - Express Server
│   ├── routes/         # API route'ları (modüler yapı)
│   ├── middleware/     # Middleware dosyaları
│   ├── auth/           # Kimlik doğrulama
│   ├── database/       # Veritabanı
│   ├── advertisements/ # Reklam yönetimi
│   └── index.js        # Ana server dosyası
│
├── backend/             # Backend - NestJS (Yeni)
│   └── src/            # NestJS modülleri
│
└── scripts/             # Yardımcı scriptler
```

**Detaylı yapı için:** [PROJECT-STRUCTURE-FINAL.md](./PROJECT-STRUCTURE-FINAL.md)

**Geliştirme prensipleri:** [GELISTIRME-PRENSIPLERI.md](./GELISTIRME-PRENSIPLERI.md)

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

JWT_SECRET=your-secret-key
PORT=3000
FRONTEND_URL=http://localhost:5173
```

## 📦 Build ve Deployment

### Development Build

```bash
npm run dev              # Frontend dev
npm run server:dev       # Backend dev (eski)
npm run backend          # Backend dev (yeni)
```

### Production Build

```bash
# Frontend
npm run build

# Backend (NestJS)
cd backend
npm run build
npm run start:prod
```

**Production build için:** Frontend ve Backend'i build edip deploy edebilirsiniz.

## 🛠️ Script Komutları

### Frontend
- `npm run dev` - Geliştirme sunucusu (http://localhost:5173)
- `npm run build` - Production build
- `npm run preview` - Build'i test et
- `npm run start` - Build'i çalıştır
- `npm run lint` - Kod kalitesi kontrolü

### Backend
- `npm run server` - Express server (http://localhost:3000)
- `npm run server:dev` - Express server (dev mode)
- `npm run backend` - NestJS backend (http://localhost:3000)
- `npm run server:check` - Server kontrolü
- `npm run server:start` - Server'ı başlat

### Utility
- `npm run setup` - Tüm bağımlılıkları yükle
- `npm run build:all` - Her şeyi build et
- `npm run install:all` - Tüm bağımlılıkları yükle
- `npm run frontend:install` - Sadece frontend bağımlılıkları
- `npm run backend:install` - Sadece backend bağımlılıkları

## 🗄️ Veritabanı

### PostgreSQL Kurulumu

```bash
cd backend
.\create-database.ps1
```

veya manuel:

```sql
CREATE DATABASE marketplace;
```

## 📚 Dokümantasyon

- [SETUP.md](./SETUP.md) - Detaylı kurulum rehberi
- [PROJECT-STRUCTURE-FINAL.md](./PROJECT-STRUCTURE-FINAL.md) - Proje yapısı
- [GELISTIRME-PRENSIPLERI.md](./GELISTIRME-PRENSIPLERI.md) - Geliştirme prensipleri
- [README-GELISTIRME-PRENSIPLERI.md](./README-GELISTIRME-PRENSIPLERI.md) - Hızlı referans
- [backend/README.md](./backend/README.md) - Backend dokümantasyonu

## 🔐 Güvenlik

- JWT token authentication
- bcrypt password hashing
- CORS yapılandırması
- Input validation
- SQL injection koruması (TypeORM)

## 🧪 Test

```bash
# Frontend lint
npm run lint

# Backend test (NestJS)
cd backend
npm run test
```

## 📝 Lisans

Bu proje özel bir projedir.

## 🤝 Katkıda Bulunma

Proje aktif geliştirme aşamasındadır.

## 📞 Destek

Sorunlar için issue açabilirsiniz.

---

## 🔄 Son Güncellemeler

- ✅ Dosya sistemi gruplar halinde organize edildi
- ✅ Frontend klasörü oluşturuldu
- ✅ Server klasörü modüler yapıya geçirildi (route'lar ayrıldı)
- ✅ Geliştirme prensipleri dokümante edildi
- ✅ VS Code ayarları yapılandırıldı
- ✅ Ödeme/Iyzipay sistemi kaldırıldı
- ✅ Gereksiz modüller temizlendi

---

**Geliştirici:** Marketplace Team  
**Versiyon:** 1.0.0  
**Son Güncelleme:** 2024
