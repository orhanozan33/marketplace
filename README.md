# Marketplace System

Marketplace sistemi - İlan yönetimi, mesajlaşma, rezervasyon ve satış özellikleri ile tam kapsamlı bir platform.

## Özellikler

- 🏠 Konut, Araç ve Al-Sat ilanları
- 💬 Gerçek zamanlı mesajlaşma
- 📍 Google Maps entegrasyonu
- ⭐ Kullanıcı değerlendirme sistemi
- 🔒 Rezervasyon ve satış yönetimi
- 👤 Kullanıcı profil yönetimi
- 📸 Resim ve video yükleme

## Kurulum

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
```bash
npm install
npm run dev
```

## GitHub Yedekleme

Proje otomatik olarak GitHub'a yedeklenir. Manuel yedekleme için:

### PowerShell Script ile:
```powershell
.\backup-to-github.ps1
```

### Batch Script ile:
```cmd
backup-to-github.bat
```

### Manuel Yedekleme:
```bash
git add .
git commit -m "Backup - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin main
```

## Yedekleme Konumları

- **GitHub**: https://github.com/orhanozan33/marketplace.git
- **Yerel Yedek**: `C:\Users\orhan\OneDrive\Masaüstü\yedek`

## Teknolojiler

- **Backend**: Node.js, Express
- **Frontend**: React, Vite
- **Database**: JSON file-based
- **Maps**: Google Maps API
- **Styling**: Tailwind CSS

## Lisans

Bu proje özel bir projedir.
