# 📋 Server/index.js Reorganizasyon Planı

## 🔍 Mevcut Durum

- **Dosya boyutu:** ~2300 satır
- **Tüm route'lar tek dosyada:** index.js içinde
- **Gruplar:** Oluşturuldu ama boş

## 📊 Route Analizi

- Auth routes: ~3
- Listings routes: ~6
- Messages routes: ~5
- Users routes: ~8
- Notifications routes: ~2
- Admin routes: ~6
- Advertisements routes: ~4

## 🎯 Hedef Yapı

```
server/
├── index.js                    # Ana dosya (sadece import'lar)
│
├── routes/
│   ├── auth.routes.js          # Auth route'ları
│   ├── listings.routes.js      # Listing route'ları
│   ├── messages.routes.js      # Message route'ları
│   ├── users.routes.js         # User route'ları
│   ├── notifications.routes.js # Notification route'ları
│   ├── admin.routes.js         # Admin route'ları
│   └── advertisements.routes.js # Advertisement route'ları
│
└── middleware/
    ├── multer.config.js        # Multer yapılandırması
    ├── error.handler.js        # Error handler
    └── request.logger.js       # Request logger
```

## ✅ Adımlar

1. **routes/** klasörü oluştur
2. **middleware/** klasörü oluştur
3. Route'ları gruplara ayır
4. Middleware'leri ayır
5. index.js'i sadeleştir

## ⚠️ Dikkat

- Bu büyük bir refactoring
- Tüm route'ları test etmek gerekir
- Import path'leri düzeltilmeli


