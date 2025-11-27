# ImgBB ile Ücretsiz Resim Yükleme - Hızlı Başlangıç

## 🚀 5 Dakikada Kurulum

### Adım 1: ImgBB API Key Alın (2 Dakika)

1. **https://api.imgbb.com/** adresine gidin
2. **"Get API Key"** butonuna tıklayın
3. Email adresinizi girin ve **"Get API Key"** butonuna tıklayın
4. Email'inize gelen linke tıklayın
5. API key'inizi kopyalayın (örnek: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)

### Adım 2: .env Dosyasını Güncelleyin (1 Dakika)

Proje kök dizinindeki `.env` dosyasını açın ve şunu ekleyin:

```env
VITE_IMGBB_API_KEY=your-api-key-here
```

**Örnek:**
```env
VITE_IMGBB_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### Adım 3: Uygulamayı Yeniden Başlatın (1 Dakika)

1. Terminal'de uygulamayı durdurun (Ctrl+C)
2. Yeniden başlatın:
   ```bash
   npm run dev
   ```

### Adım 4: Test Edin (1 Dakika)

1. Tarayıcıda uygulamaya gidin: http://localhost:5173
2. Bir ilan oluşturmayı deneyin
3. Resim yüklemeyi test edin

## ✅ Nasıl Çalışır?

1. **Önce Firebase Storage denenir** (eğer aktifse)
2. **Firebase başarısız olursa** otomatik olarak **ImgBB kullanılır**
3. Resimler ImgBB'ye yüklenir ve URL'ler alınır
4. Bu URL'ler ilanla birlikte Firestore'da saklanır

## 🎯 Avantajlar

- ✅ **Tamamen ücretsiz**
- ✅ **Sınırsız yükleme** (32MB/dosya limiti)
- ✅ **Kalıcı URL'ler**
- ✅ **CDN desteği**
- ✅ **Hızlı yükleme**

## 📝 Notlar

- ImgBB API key tamamen ücretsizdir
- Email doğrulaması gerekmez
- API key'i istediğiniz zaman yenileyebilirsiniz
- Resimler ImgBB sunucularında saklanır

## 🔧 Sorun Giderme

### "ImgBB API Key bulunamadı" hatası:
- `.env` dosyasında `VITE_IMGBB_API_KEY` değişkeninin doğru yazıldığından emin olun
- Uygulamayı yeniden başlatın
- `.env` dosyasının proje kök dizininde olduğundan emin olun

### Resim yüklenmiyor:
- İnternet bağlantınızı kontrol edin
- Tarayıcı konsolunu açın (F12) ve hata mesajlarını kontrol edin
- API key'in doğru olduğundan emin olun

## 🎉 Başarılı!

Artık Firebase Storage olmadan da resim yükleyebilirsiniz! 🚀

