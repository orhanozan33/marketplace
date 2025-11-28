# 🎯 Geliştirme Prensipleri

## 📋 ÖNCELİKLİ KURAL

### ✅ Dosya Sistemi Organizasyonu - HER ZAMAN ÖNCELİK

**Kural:** Sistem geliştirirken her zaman **gruplara göre** çalışmalı ve dosya sistemini **düzenli, işlevsel** halde tutmalıyız.

**Neden?**
- ❌ Karmaşık dosya sisteminde dosya aramak zaman kaybıdır
- ❌ Dağınık dosyalar bakımı zorlaştırır
- ❌ Düzensiz yapı hata yapma riskini artırır
- ✅ Düzenli yapı hızlı geliştirme sağlar
- ✅ Organize yapı bakımı kolaylaştırır
- ✅ Gruplu yapı ölçeklenebilirlik sağlar

## 📁 Dosya Sistemi Yapısı

### Server Klasörü Yapısı

```
server/
├── users/                    # Kullanıcı işlemleri
│   ├── users.controller.js
│   ├── users.service.js
│   ├── users.routes.js
│   └── scripts/             # Kullanıcı script'leri
│       ├── addUsers.js
│       └── restoreUsers.js
│
├── listings/                 # İlan işlemleri
│   ├── listings.controller.js
│   ├── listings.service.js
│   ├── listings.routes.js
│   └── utils/
│
├── messages/                 # Mesaj işlemleri
│   ├── messages.controller.js
│   ├── messages.service.js
│   └── messages.routes.js
│
├── auth/                     # Kimlik doğrulama
│   ├── auth.controller.js
│   ├── auth.service.js
│   ├── auth.routes.js
│   └── middleware/
│
├── advertisements/           # Reklamlar
│   ├── advertisements.controller.js
│   ├── advertisements.service.js
│   └── data/
│
├── database/                 # Veritabanı
│   ├── database.js
│   ├── database.json
│   └── migrations/
│
├── notifications/            # Bildirimler
│   ├── notifications.controller.js
│   └── notifications.service.js
│
├── scripts/                  # Genel script'ler
│   └── initTestData.js
│
└── uploads/                  # Yüklenen dosyalar
    ├── advertisements/
    ├── listings/
    └── profiles/
```

### Frontend Klasörü Yapısı

```
frontend/src/
├── users/                    # Kullanıcı bileşenleri
│   ├── components/
│   ├── services/
│   ├── hooks/
│   └── utils/
│
├── listings/                 # İlan bileşenleri
│   ├── components/
│   ├── services/
│   ├── filters/
│   └── utils/
│
├── messages/                 # Mesaj bileşenleri
│   ├── components/
│   └── services/
│
├── auth/                     # Kimlik doğrulama
│   ├── components/
│   ├── context/
│   └── services/
│
├── admin/                    # Admin bileşenleri
│   └── components/
│
├── common/                   # Ortak bileşenler
│   └── components/
│
├── layout/                   # Layout bileşenleri
│   └── components/
│
└── shared/                   # Paylaşılan dosyalar
    ├── services/
    ├── utils/
    └── styles/
```

## 🔄 Geliştirme Süreci

### Yeni Özellik Eklerken

1. **Hangi gruba ait?** → İlgili klasöre ekle
2. **Dosya isimlendirme** → `grupaAdi.dosyaTipi.js` formatı
3. **Import path'leri** → Relative path kullan
4. **Dokümantasyon** → Gerekirse README ekle

### Dosya İsimlendirme Kuralları

```
✅ users.controller.js        # Controller dosyası
✅ users.service.js           # Service dosyası
✅ users.routes.js            # Route dosyası
✅ users.utils.js             # Utility dosyası
✅ users.types.js             # Type definitions
✅ users.validations.js       # Validation dosyası
```

### Import Path Kuralları

```javascript
// ✅ DOĞRU - Relative path
import { dbQuery } from '../database/database.js';
import { authenticateToken } from '../auth/auth.js';

// ❌ YANLIŞ - Mutlak path veya karmaşık
import { dbQuery } from '../../server/database/database.js';
```

## 📝 Checklist

Yeni dosya eklerken:

- [ ] Dosya doğru gruba mı eklendi?
- [ ] Dosya ismi standart formatta mı?
- [ ] Import path'leri relative mi?
- [ ] İlgili grup klasöründe README var mı?
- [ ] Kod mantıklı gruplarda mı?

## 🚫 YAPMA

- ❌ Dosyaları root'a ekleme
- ❌ Karmaşık import path'leri kullanma
- ❌ Düzensiz dosya isimleri kullanma
- ❌ İlgisiz dosyaları bir araya koyma
- ❌ Daha sonra organize ederim deme

## ✅ YAP

- ✅ Her zaman gruplara göre çalış
- ✅ Dosya isimlendirme standartlarını takip et
- ✅ Import path'lerini relative tut
- ✅ Her grup için README ekle
- ✅ Düzenli yapıyı koru

## 🎯 Öncelik Sırası

1. **Dosya sistemi organizasyonu** (HER ZAMAN)
2. Kod kalitesi
3. Performans
4. Özellikler

## 📚 Referanslar

- [Dosya Sistemi Reorganizasyonu](./DOSYA-SISTEMI-REORGANIZASYONU.md)
- [Proje Yapısı](./PROJECT-STRUCTURE-FINAL.md)

