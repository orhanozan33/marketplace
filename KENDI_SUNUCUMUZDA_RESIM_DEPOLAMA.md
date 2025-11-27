# Kendi Sunucumuzda Resim Depolama - Kurulum Rehberi

## 🎯 Özellikler

- ✅ Resimler kendi sunucunuzda depolanır
- ✅ Tam kontrol (veri güvenliği)
- ✅ Ücretsiz (sadece sunucu maliyeti)
- ✅ Sınırsız depolama (sunucu kapasitesine göre)
- ✅ Otomatik fallback (kendi sunucu → Firebase → ImgBB)

## 🚀 Hızlı Kurulum (5 Dakika)

### Adım 1: Backend Bağımlılıklarını Yükleyin

```bash
cd server
npm install
```

Veya ana dizinden:
```bash
npm run server:install
```

### Adım 2: Backend Sunucusunu Başlatın

Yeni bir terminal penceresi açın ve:

```bash
cd server
npm start
```

Veya ana dizinden:
```bash
npm run server
```

**Geliştirme modu (otomatik yeniden başlatma):**
```bash
npm run server:dev
```

Sunucu `http://localhost:3000` adresinde çalışacak.

### Adım 3: Frontend'i Başlatın

Ana dizinde (başka bir terminal):
```bash
npm run dev
```

### Adım 4: Test Edin

1. Tarayıcıda http://localhost:5173 adresine gidin
2. Bir ilan oluşturmayı deneyin
3. Resim yüklemeyi test edin

## 📁 Klasör Yapısı

```
server/
  ├── index.js          # Express API server
  ├── package.json      # Backend bağımlılıkları
  └── uploads/          # Yüklenen resimler (otomatik oluşur)
      └── listings/     # İlan resimleri
```

## 🔧 Yapılandırma

### Port Değiştirme

Backend portunu değiştirmek için `.env` dosyası oluşturun:

```env
PORT=3000
FRONTEND_URL=http://localhost:5173
```

### Frontend API URL

Frontend'de API URL'ini değiştirmek için `.env` dosyasına ekleyin:

```env
VITE_API_URL=http://localhost:3000
```

## 📤 API Endpoints

### 1. Tek Resim Yükleme
```
POST /api/upload
Content-Type: multipart/form-data

Body:
- image: File
- folder: string (opsiyonel, varsayılan: 'listings')
```

**Örnek Response:**
```json
{
  "success": true,
  "url": "/uploads/listings/1234567890_image.jpg",
  "fullUrl": "http://localhost:3000/uploads/listings/1234567890_image.jpg",
  "filename": "1234567890_image.jpg",
  "size": 245678,
  "mimetype": "image/jpeg"
}
```

### 2. Çoklu Resim Yükleme
```
POST /api/upload/multiple
Content-Type: multipart/form-data

Body:
- images: File[] (maksimum 10 dosya)
- folder: string (opsiyonel)
```

### 3. Resim Silme
```
DELETE /api/upload/:folder/:filename
```

### 4. Health Check
```
GET /api/health
```

## 🔄 Otomatik Fallback Sistemi

Uygulama resim yüklerken şu sırayı takip eder:

1. **Kendi Sunucumuz** (önerilen) ✅
   - Başarısız olursa →
2. **Firebase Storage**
   - Başarısız olursa →
3. **ImgBB** (eğer API key varsa)
   - Başarısız olursa →
4. **Base64 Encoding** (geçici)

## 🛡️ Güvenlik

### Dosya Tipi Kontrolü
- Sadece resim dosyaları kabul edilir: JPEG, PNG, GIF, WEBP
- Diğer dosya tipleri reddedilir

### Dosya Boyutu Limiti
- Maksimum: 10MB/dosya
- Daha büyük dosyalar reddedilir

### CORS Ayarları
- Sadece belirtilen frontend URL'den istekler kabul edilir
- `.env` dosyasında `FRONTEND_URL` ile ayarlanır

## 📦 Production Deployment

### 1. PM2 ile Çalıştırma (Önerilen)

```bash
npm install -g pm2
cd server
pm2 start index.js --name image-upload-server
pm2 save
pm2 startup
```

### 2. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads klasörü
    location /uploads {
        proxy_pass http://localhost:3000;
    }
}
```

### 3. Environment Variables

Production için `.env` dosyası:

```env
PORT=3000
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

## 💾 Yedekleme

Resimleri yedeklemek için:

```bash
# Tüm uploads klasörünü yedekle
tar -czf uploads-backup-$(date +%Y%m%d).tar.gz server/uploads/

# Sadece listings klasörünü yedekle
tar -czf listings-backup-$(date +%Y%m%d).tar.gz server/uploads/listings/
```

## 🔍 Sorun Giderme

### "Cannot find module" hatası
```bash
cd server
npm install
```

### Port zaten kullanılıyor
`.env` dosyasında `PORT` değişkenini değiştirin veya başka bir port kullanın.

### CORS hatası
`.env` dosyasında `FRONTEND_URL` değişkenini doğru ayarlayın.

### Resimler görünmüyor
- Backend sunucusunun çalıştığından emin olun
- `server/uploads` klasörünün var olduğunu kontrol edin
- Tarayıcı konsolunda hata mesajlarını kontrol edin

## 📊 Performans

- **Yükleme hızı:** Sunucu bant genişliğine bağlı
- **Depolama:** Sunucu disk kapasitesine bağlı
- **Erişim:** Sunucu hızına bağlı

## 🎉 Başarılı!

Artık resimler kendi sunucunuzda depolanıyor! 🚀

## 📝 Notlar

- `server/uploads` klasörü git'e eklenmemeli (`.gitignore`)
- Production'da düzenli yedekleme yapın
- Disk alanını düzenli kontrol edin
- Gereksiz resimleri temizleyin

