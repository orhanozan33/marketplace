# 🍁 Canada Marketplace

Kanada için coğrafi konum tabanlı marketplace uygulaması. Konut, araç ve al-sat ilanları için harita tabanlı arama.

## ✨ Özellikler

- 🗺️ **Harita Tabanlı Arama**: Leaflet ile interaktif harita
- 🏠 **3 Ana Kategori**: Konut, Araç, Al & Sat
- 🌍 **Çok Dilli Destek**: Türkçe, İngilizce, Fransızca
- 📍 **Konum Bazlı Filtreleme**: Yarıçap bazlı arama
- ✨ **Animasyonlar**: Framer Motion ile yanıp sönen markerlar
- 📱 **Responsive Tasarım**: Tailwind CSS ile modern UI
- 🔐 **Supabase Entegrasyonu**: Backend ve authentication

## 🚀 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Environment Variables

`.env` dosyası oluşturun:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Supabase Kurulumu

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni proje oluşturun
3. `supabase-schema.sql` dosyasını Supabase SQL Editor'de çalıştırın
4. Storage bucket oluşturun: `listing-images` (public)

### 4. Geliştirme Sunucusunu Başlat

```bash
npm run dev
```

Tarayıcıda [http://localhost:5173](http://localhost:5173) adresini açın.

## 📁 Proje Yapısı

```
src/
├── components/
│   ├── Layout/          # Ana layout bileşenleri
│   ├── Map/             # Harita bileşenleri
│   ├── Listings/        # Kategori filtreleri
│   └── Forms/           # Form bileşenleri
├── context/             # React Context (Language)
├── services/            # API ve Supabase servisleri
├── utils/              # Yardımcı fonksiyonlar ve sabitler
└── styles/              # Global CSS
```

## 🛠️ Teknolojiler

- **React 18** - UI Framework
- **Vite** - Build Tool
- **Tailwind CSS** - Styling
- **Leaflet + React-Leaflet** - Harita
- **Framer Motion** - Animasyonlar
- **Supabase** - Backend & Database
- **Lucide React** - İkonlar

## 📝 Kullanım

1. **Kategori Seç**: Sol sidebar'dan Konut, Araç veya Al & Sat seçin
2. **Filtrele**: Kategoriye özel filtreleri kullanın
3. **Haritada Keşfet**: Yanıp sönen markerlara tıklayarak ilanları görün
4. **İlan Ver**: "İlan Ver" butonuna tıklayarak yeni ilan oluşturun

## 🌐 Dil Değiştirme

Header'daki dil butonlarından (TR/EN/FR) dil değiştirebilirsiniz.

## 📄 Lisans

MIT
