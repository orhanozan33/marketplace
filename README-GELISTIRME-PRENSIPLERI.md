# 🎯 Geliştirme Prensipleri - Hızlı Rehber

## ⚠️ ÖNCE BUNU OKU!

### ✅ HER ZAMAN ÖNCELİK: Dosya Sistemi Organizasyonu

**Kural:** Yeni dosya/özellik eklerken **HER ZAMAN** hangi gruba ait olduğunu düşün ve doğru klasöre ekle!

## 📁 Grup Yapısı

```
✅ users/          → Kullanıcı işlemleri
✅ listings/       → İlan işlemleri  
✅ messages/       → Mesaj işlemleri
✅ auth/           → Kimlik doğrulama
✅ advertisements/ → Reklamlar
✅ database/       → Veritabanı
✅ notifications/  → Bildirimler
✅ scripts/        → Script'ler
```

## 🚀 Yeni Dosya Eklerken

### 1. Hangi gruba ait?
```
Listings ile ilgili → server/listings/
Messages ile ilgili → server/messages/
Users ile ilgili → server/users/
```

### 2. Dosya İsmi
```
✅ listings.routes.js
✅ listings.controller.js
✅ listings.service.js
❌ listingRoute.js
❌ listing_routes.js
```

### 3. Import Path
```javascript
// ✅ DOĞRU
import { dbQuery } from '../database/database.js';

// ❌ YANLIŞ
import { dbQuery } from '../../server/database/database.js';
```

## 📋 Checklist

- [ ] Dosya doğru gruba mı eklendi?
- [ ] İsim standart formatta mı? (grupaAdi.dosyaTipi.js)
- [ ] Import path'leri relative mi?
- [ ] İlgili grup klasöründe mi?

## 🚫 ASLA YAPMA

- ❌ Root'a dosya ekleme
- ❌ Dağınık klasörler oluşturma
- ❌ "Sonra düzenlerim" deme

## ✅ HER ZAMAN YAP

- ✅ Gruplara göre organize et
- ✅ Standart isimlendirme kullan
- ✅ Düzenli yapıyı koru

---

**Detaylı bilgi:** [GELISTIRME-PRENSIPLERI.md](./GELISTIRME-PRENSIPLERI.md)

