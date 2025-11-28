# 🗑️ Sistemle Alakalı Olmayan Öğeler Listesi

## ❌ Ödeme/Iyzipay Sistemi

Sisteminizde ödeme özelliği yok ama şu dosyalar/bağımlılıklar mevcut:

### Backend Modülleri

1. **`backend/src/modules/payments/`** - TAM PAYMENTS MODÜLÜ
   - `payments.module.ts`
   - `payments.service.ts` (Iyzipay entegrasyonu ile)
   - `payments.controller.ts` (API endpoints)

2. **`backend/src/modules/orders/`** - ORDERS MODÜLÜ
   - `orders.module.ts`
   - `orders.service.ts`
   - `orders.controller.ts`
   - (Orders genelde payment ile birlikte kullanılır)

3. **`backend/src/entities/payment.entity.ts`** - Payment Entity
   - PaymentMethod enum (CREDIT_CARD, BANK_TRANSFER)
   - PaymentStatus enum
   - Payment modeli

4. **`backend/src/entities/order.entity.ts`** - Order Entity
   - OrderStatus enum (PAYMENT_PENDING, PAYMENT_CONFIRMED)
   - paymentConfirmedAt, paymentReceiptUrl alanları
   - Payment ile ilişkili

5. **`backend/src/app.module.ts`**
   - PaymentsModule import ediliyor
   - OrdersModule import ediliyor

### Package Bağımlılıkları

1. **`backend/package.json`**
   - `"iyzipay": "^2.0.50"` bağımlılığı var

2. **`package-lock.json`** (root)
   - iyzipay bağımlılığı

3. **`backend/package-lock.json`**
   - iyzipay bağımlılığı

### Konfigürasyon Dosyaları

1. **`setup.ps1`**
   - Iyzico environment variables (satır 60-63)

2. **`PROJECT-STRUCTURE-FINAL.md`**
   - `payments/` klasörü referansı (satır 23)

3. **`backend/README.md`**
   - Payments modülü açıklaması (satır 55)
   - Iyzico environment variables (satır 75-76)
   - `/api/payments/*` endpoints (satır 83)

## 📋 Önerilen Temizlik İşlemleri

### 1. Backend Modüllerini Kaldır
- [ ] `backend/src/modules/payments/` klasörünü sil
- [ ] `backend/src/modules/orders/` klasörünü sil (eğer sadece ödeme için kullanılıyorsa)
- [ ] `backend/src/entities/payment.entity.ts` sil
- [ ] `backend/src/entities/order.entity.ts` sil (veya sadece payment alanlarını kaldır)
- [ ] `backend/src/app.module.ts`'den PaymentsModule ve OrdersModule import'larını kaldır

### 2. Package Bağımlılıklarını Kaldır
- [ ] `backend/package.json`'dan `iyzipay` bağımlılığını kaldır
- [ ] `npm install` çalıştır (package-lock.json güncellenecek)

### 3. Konfigürasyon Dosyalarını Temizle
- [ ] `setup.ps1`'den Iyzico config'i kaldır
- [ ] `PROJECT-STRUCTURE-FINAL.md`'den payments referansını kaldır
- [ ] `backend/README.md`'den payments referanslarını kaldır

## ⚠️ Not

Orders modülü sadece ödeme için mi kullanılıyor yoksa başka bir amaç için de var mı kontrol edin.
Eğer marketplace'inizde sipariş takibi yoksa, orders modülünü de kaldırabilirsiniz.


