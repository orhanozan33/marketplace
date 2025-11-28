# Marketplace Backend API

NestJS tabanlı backend API servisi.

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Environment Dosyasını Oluşturun

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve gerekli ayarları yapın.

### 3. Veritabanını Oluşturun

PostgreSQL'de `marketplace` veritabanını oluşturun:

```sql
CREATE DATABASE marketplace;
```

veya

```powershell
.\create-database.ps1
```

### 4. Uygulamayı Başlatın

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📁 Proje Yapısı

```
backend/
├── src/
│   ├── entities/          # TypeORM entity dosyaları
│   ├── modules/           # NestJS modüller
│   │   ├── auth/          # Authentication modülü
│   │   ├── admin/         # Admin modülü
│   ├── common/            # Ortak decorator'lar, filter'lar
│   ├── app.module.ts      # Ana modül
│   └── main.ts            # Uygulama giriş noktası
├── .env.example           # Örnek environment dosyası
├── package.json           # NPM bağımlılıkları
├── tsconfig.json          # TypeScript yapılandırması
└── nest-cli.json          # NestJS CLI yapılandırması
```

## 🔧 Environment Variables

- `DB_HOST` - PostgreSQL host (default: localhost)
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USERNAME` - PostgreSQL kullanıcı adı (default: postgres)
- `DB_PASSWORD` - PostgreSQL şifresi
- `DB_DATABASE` - Veritabanı adı (default: marketplace)
- `PORT` - API port (default: 3000)
- `JWT_SECRET` - JWT secret key

## 📚 API Endpoints

- `/api/auth/login` - Kullanıcı girişi
- `/api/auth/register` - Kullanıcı kaydı
- `/api/admin/*` - Admin endpoints

## 🧪 Test

```bash
# Unit testler
npm run test

# E2E testler
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Lisans

Private

