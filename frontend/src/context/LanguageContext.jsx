import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  tr: {
    // General
    appName: 'Canada Marketplace',
    tagline: 'Yakınınızdaki her şeyi bulun',
    changeLocation: 'Konumu Değiştir',
    searchRadius: 'Arama Yarıçapı',
    selectCategory: 'Kategori Seç',
    createListing: 'İlan Ver',
    clearFilters: 'Filtreleri Temizle',
    km: 'km',
    
    // Categories
    housing: 'Konut',
    vehicle: 'Araç',
    buysell: 'Al & Sat',
    
    // Housing
    listingType: 'İlan Tipi',
    rent: 'Kiralık',
    sale: 'Satılık',
    propertyType: 'Emlak Tipi',
    bedrooms: 'Yatak Sayısı',
    bathrooms: 'Banyo Sayısı',
    priceRange: 'Fiyat Aralığı (CAD)',
    features: 'Özellikler',
    petFriendly: 'Pet Friendly',
    furnished: 'Eşyalı',
    utilitiesIncluded: 'Utilities Dahil',
    parkingIncluded: 'Parking Dahil',
    laundryInUnit: 'In-Unit Laundry',
    availableDate: 'Müsait Tarih',
    
    // Vehicle
    vehicleType: 'Araç Tipi',
    make: 'Marka',
    model: 'Model',
    year: 'Yıl',
    mileage: 'Kilometre',
    transmission: 'Vites',
    fuelType: 'Yakıt',
    winterTires: 'Kış Lastiği Dahil',
    blockHeater: 'Block Heater',
    remoteStart: 'Remote Start',
    awd: 'AWD / 4WD',
    accidentFree: 'Kazasız',
    
    // BuySell
    itemCategory: 'Kategori',
    condition: 'Durum',
    brand: 'Marka',
    deliveryAvailable: 'Teslimat Var',
    pickupOnly: 'Sadece Elden Teslim',
    
    // Map
    yourLocation: 'Konumunuz',
    listingsInArea: 'Bu alanda',
    listings: 'ilan',
    viewListing: 'İlanı Gör',
    
    // Forms
    title: 'İlan Başlığı',
    description: 'Açıklama',
    price: 'Fiyat (CAD)',
    priceType: 'Fiyat Tipi',
    fixed: 'Sabit Fiyat',
    negotiable: 'Pazarlık Payı Var',
    monthly: 'Aylık Kira',
    location: 'Konum',
    uploadPhotos: 'Fotoğraf Yükle',
    maxPhotos: 'Maksimum 10 fotoğraf',
    cover: 'Kapak',
    step: 'Adım',
    basicInfo: 'Temel Bilgiler',
    details: 'Detaylar',
    photos: 'Fotoğraflar',
    back: 'Geri',
    continue: 'Devam Et',
    publish: 'İlanı Yayınla',
    
    // Housing Form
    createHousingListing: 'Konut İlanı Ver',
    sqft: 'Alan (sqft)',
    
    // Vehicle Form
    createVehicleListing: 'Araç İlanı Ver',
    
    // BuySell Form
    createBuySellListing: 'Al & Sat İlanı Ver',
    
    // Dashboard
    dashboard: 'Dashboard',
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    register: 'Kayıt Ol',
    welcome: 'Hoş Geldiniz',
    loginToContinue: 'Devam etmek için giriş yapın',
    loginToMessage: 'Mesajlaşmak için giriş yapın',
    conversation: 'Konuşma',
    conversations: 'Konuşmalar',
    noMessages: 'Henüz mesaj yok',
    noConversations: 'Henüz konuşma yok',
    typeMessage: 'Mesaj yazın...',
    email: 'E-posta',
    password: 'Şifre',
    displayName: 'Ad Soyad',
    loading: 'Yükleniyor...',
    alreadyHaveAccount: 'Zaten hesabınız var mı? Giriş yapın',
    noAccount: 'Hesabınız yok mu? Kayıt olun',
  },
  en: {
    appName: 'Canada Marketplace',
    tagline: 'Find everything near you',
    changeLocation: 'Change Location',
    searchRadius: 'Search Radius',
    selectCategory: 'Select Category',
    createListing: 'Create Listing',
    clearFilters: 'Clear Filters',
    km: 'km',
    housing: 'Housing',
    vehicle: 'Vehicle',
    buysell: 'Buy & Sell',
    listingType: 'Listing Type',
    rent: 'Rent',
    sale: 'Sale',
    propertyType: 'Property Type',
    bedrooms: 'Bedrooms',
    bathrooms: 'Bathrooms',
    priceRange: 'Price Range (CAD)',
    features: 'Features',
    petFriendly: 'Pet Friendly',
    furnished: 'Furnished',
    utilitiesIncluded: 'Utilities Included',
    parkingIncluded: 'Parking Included',
    laundryInUnit: 'In-Unit Laundry',
    availableDate: 'Available Date',
    vehicleType: 'Vehicle Type',
    make: 'Make',
    model: 'Model',
    year: 'Year',
    mileage: 'Mileage',
    transmission: 'Transmission',
    fuelType: 'Fuel Type',
    winterTires: 'Winter Tires Included',
    blockHeater: 'Block Heater',
    remoteStart: 'Remote Start',
    awd: 'AWD / 4WD',
    accidentFree: 'Accident Free',
    itemCategory: 'Category',
    condition: 'Condition',
    brand: 'Brand',
    deliveryAvailable: 'Delivery Available',
    pickupOnly: 'Pickup Only',
    yourLocation: 'Your Location',
    listingsInArea: 'Listings in this area',
    listings: 'listings',
    viewListing: 'View Listing',
    title: 'Listing Title',
    description: 'Description',
    price: 'Price (CAD)',
    priceType: 'Price Type',
    fixed: 'Fixed Price',
    negotiable: 'Negotiable',
    monthly: 'Monthly Rent',
    location: 'Location',
    uploadPhotos: 'Upload Photos',
    maxPhotos: 'Maximum 10 photos',
    cover: 'Cover',
    step: 'Step',
    basicInfo: 'Basic Info',
    details: 'Details',
    photos: 'Photos',
    back: 'Back',
    continue: 'Continue',
    publish: 'Publish Listing',
    createHousingListing: 'Create Housing Listing',
    sqft: 'Area (sqft)',
    createVehicleListing: 'Create Vehicle Listing',
    createBuySellListing: 'Create Buy & Sell Listing',
  },
  fr: {
    appName: 'Marché du Canada',
    tagline: 'Trouvez tout près de chez vous',
    changeLocation: 'Changer de lieu',
    searchRadius: 'Rayon de recherche',
    selectCategory: 'Sélectionner une catégorie',
    createListing: 'Créer une annonce',
    clearFilters: 'Effacer les filtres',
    km: 'km',
    housing: 'Logement',
    vehicle: 'Véhicule',
    buysell: 'Acheter & Vendre',
    listingType: 'Type d\'annonce',
    rent: 'Location',
    sale: 'Vente',
    propertyType: 'Type de propriété',
    bedrooms: 'Chambres',
    bathrooms: 'Salles de bain',
    priceRange: 'Gamme de prix (CAD)',
    features: 'Caractéristiques',
    petFriendly: 'Animaux acceptés',
    furnished: 'Meublé',
    utilitiesIncluded: 'Services publics inclus',
    parkingIncluded: 'Stationnement inclus',
    laundryInUnit: 'Laveuse dans l\'unité',
    availableDate: 'Date disponible',
    vehicleType: 'Type de véhicule',
    make: 'Marque',
    model: 'Modèle',
    year: 'Année',
    mileage: 'Kilométrage',
    transmission: 'Transmission',
    fuelType: 'Type de carburant',
    winterTires: 'Pneus d\'hiver inclus',
    blockHeater: 'Chauffe-moteur',
    remoteStart: 'Démarrage à distance',
    awd: '4 roues motrices',
    accidentFree: 'Sans accident',
    itemCategory: 'Catégorie',
    condition: 'État',
    brand: 'Marque',
    deliveryAvailable: 'Livraison disponible',
    pickupOnly: 'Ramassage uniquement',
    yourLocation: 'Votre emplacement',
    listingsInArea: 'Annonces dans cette zone',
    listings: 'annonces',
    viewListing: 'Voir l\'annonce',
    title: 'Titre de l\'annonce',
    description: 'Description',
    price: 'Prix (CAD)',
    priceType: 'Type de prix',
    fixed: 'Prix fixe',
    negotiable: 'Négociable',
    monthly: 'Loyer mensuel',
    location: 'Emplacement',
    uploadPhotos: 'Télécharger des photos',
    maxPhotos: 'Maximum 10 photos',
    cover: 'Couverture',
    step: 'Étape',
    basicInfo: 'Informations de base',
    details: 'Détails',
    photos: 'Photos',
    back: 'Retour',
    continue: 'Continuer',
    publish: 'Publier l\'annonce',
    createHousingListing: 'Créer une annonce de logement',
    sqft: 'Superficie (pi²)',
    createVehicleListing: 'Créer une annonce de véhicule',
    createBuySellListing: 'Créer une annonce d\'achat/vente',
    
    // Dashboard
    dashboard: 'Dashboard',
    login: 'Log In',
    logout: 'Log Out',
    register: 'Sign Up',
    welcome: 'Welcome',
    loginToContinue: 'Please log in to continue',
    loginToMessage: 'Log in to send messages',
    conversation: 'Conversation',
    conversations: 'Conversations',
    noMessages: 'No messages yet',
    noConversations: 'No conversations yet',
    typeMessage: 'Type a message...',
    email: 'Email',
    password: 'Password',
    displayName: 'Display Name',
    loading: 'Loading...',
    alreadyHaveAccount: 'Already have an account? Log in',
    noAccount: 'Don\'t have an account? Sign up',
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'tr';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || key;
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};


