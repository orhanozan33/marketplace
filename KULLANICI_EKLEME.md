# Kullanıcı Ekleme Rehberi

## 📋 Mevcut Kullanıcılar

1. **Admin Kullanıcı**
   - Email: `orhanozan33@gmail.com`
   - Şifre: `33333333`
   - Role: `admin`

2. **Test User 1**
   - Email: `user1@example.com`
   - Şifre: `123456`
   - Role: `user`

3. **Test User 2**
   - Email: `user2@example.com`
   - Şifre: `123456`
   - Role: `user`

## ➕ Yeni Kullanıcı Ekleme

### Yöntem 1: Script ile (Hızlı)

`server/addUsers.js` dosyasını düzenleyin ve yeni kullanıcı ekleyin:

```javascript
const users = [
  {
    email: 'yeni@example.com',
    password: 'sifre123',
    displayName: 'Yeni Kullanıcı',
    role: 'user' // veya 'admin'
  }
];
```

Sonra çalıştırın:
```bash
cd server
node addUsers.js
```

### Yöntem 2: Uygulama Üzerinden

1. Ana sayfada "Giriş Yap" butonuna tıklayın
2. "Kayıt Ol" seçeneğini seçin
3. Email, şifre ve isim girin
4. Kayıt olun

### Yöntem 3: Admin Panelinden

1. Admin paneline giriş yapın
2. "Users" sekmesine gidin
3. "Yeni Kullanıcı" butonuna tıklayın
4. Kullanıcı bilgilerini girin

## 🔐 Şifre Değiştirme

Mevcut bir kullanıcının şifresini değiştirmek için:

1. `server/database.json` dosyasını açın
2. Kullanıcının `password` alanını bulun
3. Yeni şifreyi hash'leyin (script kullanarak)
4. Hash'i güncelleyin

Veya `server/createAdmin.js` script'ini düzenleyip çalıştırın.

## 📝 Notlar

- Şifreler bcrypt ile hash'leniyor (güvenli)
- Email'ler benzersiz olmalı
- Role: `user`, `admin`, veya `superadmin` olabilir
- Veritabanı: `server/database.json`


