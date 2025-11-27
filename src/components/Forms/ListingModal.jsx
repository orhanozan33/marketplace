import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, MapPin, DollarSign, Camera, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { PROPERTY_TYPES, BEDROOM_OPTIONS, BATHROOM_OPTIONS, VEHICLE_TYPES, BUYSELL_CATEGORIES, CONDITION_OPTIONS } from '@/utils/constants';
import { uploadImages } from '@/services/api';
import { useToast } from '@/context/ToastContext';

const ListingModal = ({ isOpen, onClose, category, userLocation, onListingCreated }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { error } = useToast();

  const getLabel = (item) => {
    if (language === 'tr') return item.labelTr || item.label;
    if (language === 'fr') return item.labelFr || item.label;
    return item.label;
  };

  const categoryConfig = {
    housing: {
      title: t('createHousingListing'),
      color: 'blue',
      fields: [],
    },
    vehicle: {
      title: t('createVehicleListing'),
      color: 'green',
      fields: [
        { name: 'vehicleType', label: t('vehicleType'), type: 'select', options: VEHICLE_TYPES },
        { name: 'make', label: t('make'), type: 'text' },
        { name: 'model', label: t('model'), type: 'text' },
        { name: 'year', label: t('year'), type: 'number' },
        { name: 'mileage', label: t('mileage'), type: 'number' },
        { name: 'transmission', label: t('transmission'), type: 'select', options: [{ value: 'automatic', label: 'Automatic' }, { value: 'manual', label: 'Manual' }] },
        { name: 'fuelType', label: t('fuelType'), type: 'select', options: [{ value: 'gas', label: 'Gas' }, { value: 'diesel', label: 'Diesel' }, { value: 'electric', label: 'Electric' }, { value: 'hybrid', label: 'Hybrid' }] },
        { name: 'winterTires', label: t('winterTires'), type: 'checkbox' },
        { name: 'accidentFree', label: t('accidentFree'), type: 'checkbox' },
      ],
    },
    buysell: {
      title: t('createBuySellListing'),
      color: 'orange',
      fields: [
        { name: 'itemCategory', label: t('itemCategory'), type: 'select', options: BUYSELL_CATEGORIES },
        { name: 'condition', label: t('condition'), type: 'select', options: CONDITION_OPTIONS },
        { name: 'brand', label: t('brand'), type: 'text' },
        { name: 'deliveryAvailable', label: t('deliveryAvailable'), type: 'checkbox' },
        { name: 'pickupOnly', label: t('pickupOnly'), type: 'checkbox' },
      ],
    },
  };

  const config = categoryConfig[category];

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'image'
    }));
    setImages(prev => [...prev, ...newImages].slice(0, 10));
  };
  
  const handleVideoUpload = (e) => {
    const files = Array.from(e.target.files);
    const newVideos = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      type: 'video'
    }));
    setVideos(prev => [...prev, ...newVideos].slice(0, 5)); // Max 5 video
  };

  // Validasyon fonksiyonu
  const validateForm = () => {
    const errors = [];
    
    if (category === 'housing') {
      // Step 1 validasyonları
      if (!formData.title || formData.title.trim() === '') {
        errors.push('Başlık zorunludur');
      }
      if (!formData.description || formData.description.trim() === '') {
        errors.push('Açıklama zorunludur');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        errors.push('Geçerli bir fiyat giriniz');
      }
      if (!formData.postalCode || formData.postalCode.trim() === '') {
        errors.push('Posta kodu zorunludur');
      }
      
      // Step 2 validasyonları
      if (!formData.listingType) {
        errors.push('İlan tipi seçiniz');
      }
      if (!formData.propertyType) {
        errors.push('Emlak tipi seçiniz');
      }
      
      // Step 3 validasyonları
      if (!formData.bedrooms) {
        errors.push('Yatak sayısı seçiniz');
      }
      if (!formData.bathrooms) {
        errors.push('Banyo sayısı seçiniz');
      }
      if (!formData.sqft || parseFloat(formData.sqft) <= 0) {
        errors.push('Geçerli bir metrekare giriniz');
      }
      
      // Step 4 - Resim zorunlu
      if (images.length === 0) {
        errors.push('En az 1 resim yükleyiniz');
      }
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    if (uploading) return; // Zaten yükleniyorsa tekrar gönderme
    
    // Validasyon kontrolü
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      error(validationErrors.join(', '));
      return;
    }
    
    setUploading(true);
    
    try {
      let imageUrls = [];
      let videoUrls = [];
      
      // Resimleri kendi backend'ine yükle
      if (images.length > 0) {
        const files = images.map(img => img.file).filter(Boolean);
        if (files.length > 0) {
          imageUrls = await uploadImages(files, `listings/${user?.id || 'anonymous'}`);
        } else {
          // Eğer sadece preview varsa (local URL), bunları kullan
          imageUrls = images.map(img => img.preview || img.url).filter(Boolean);
        }
      }
      
      // Videoları kendi backend'ine yükle
      if (videos.length > 0) {
        const files = videos.map(vid => vid.file).filter(Boolean);
        if (files.length > 0) {
          videoUrls = await uploadImages(files, `listings/${user?.id || 'anonymous'}`);
        } else {
          // Eğer sadece preview varsa (local URL), bunları kullan
          videoUrls = videos.map(vid => vid.preview || vid.url).filter(Boolean);
        }
      }
      
      // Yeni ilan oluştur
      const listingPosition = userLocation 
        ? [userLocation.lat, userLocation.lng] 
        : [49.2827, -123.1207]; // Kullanıcı konumu veya varsayılan
      
      // Özellikler ve beyaz eşya bilgilerini details objesine ayır
      const details = {};
      const featureKeys = ['petFriendly', 'petsInHouse', 'noSmoking', 'smokingAllowed', 'furnished', 'utilitiesIncluded', 'parkingIncluded', 'laundryInUnit'];
      const applianceKeys = ['hasRefrigerator', 'hasDishwasher', 'hasWasher', 'hasDryer', 'hasMicrowave', 'hasOven'];
      
      // Tüm özellikleri ekle (false değerleri de dahil)
      featureKeys.forEach(key => {
        details[key] = formData[key] === true || formData[key] === 'true';
      });
      
      // Tüm beyaz eşya özelliklerini ekle (false değerleri de dahil)
      applianceKeys.forEach(key => {
        details[key] = formData[key] === true || formData[key] === 'true';
      });
      
      // FormData'dan details'e ait alanları çıkar
      const { petFriendly, petsInHouse, noSmoking, smokingAllowed, furnished, utilitiesIncluded, parkingIncluded, laundryInUnit, hasRefrigerator, hasDishwasher, hasWasher, hasDryer, hasMicrowave, hasOven, ...listingFields } = formData;
      
      const newListing = {
        // ID backend tarafından oluşturulacak
        category: category,
        title: listingFields.title || `${category} Listing`,
        price: parseFloat(listingFields.price) || 0,
        position: listingPosition,
        latitude: listingPosition[0],
        longitude: listingPosition[1],
        image: imageUrls[0] || videoUrls[0] || `https://placehold.co/300x200/3B82F6/white?text=${category}`,
        images: [...imageUrls, ...videoUrls], // Tüm resimler ve videolar
        videos: videoUrls, // Videolar ayrı
        address: listingFields.address || 'Address not provided',
        bedrooms: listingFields.bedrooms || 0,
        bathrooms: listingFields.bathrooms || 0,
        sqft: listingFields.sqft || 0,
        mileage: listingFields.mileage || 0,
        year: listingFields.year || 0,
        userId: user?.id || null, // Kullanıcı ID'si
        listingType: listingFields.listingType,
        propertyType: listingFields.propertyType,
        postalCode: listingFields.postalCode || user?.postalCode || '',
        showPhone: listingFields.showPhone !== undefined ? listingFields.showPhone : true,
        ...listingFields,
        details: details, // Özellikler ve beyaz eşya details objesinde
        created_at: new Date().toISOString(),
        createdAt: new Date(),
      };
      
      console.log('📤 Yeni ilan gönderiliyor:', newListing);
      console.log('📤 Details:', details);
      console.log('📤 Details keys:', Object.keys(details));
      console.log('📤 Details değerleri:', Object.entries(details));

      // Callback ile parent component'e bildir
      if (onListingCreated) {
        onListingCreated(newListing);
      }
      
      onClose();
      setStep(1);
      setFormData({});
      setImages([]);
      setVideos([]);
    } catch (error) {
      console.error('Error uploading images:', error);
      const errorMessage = error.message || 'Resim yüklenirken bir hata oluştu.';
      
      // Daha detaylı hata mesajı göster
      if (errorMessage.includes('CORS')) {
        error(`${errorMessage} - Lütfen tekrar deneyin.`);
      } else if (errorMessage.includes('zaman aşımı')) {
        error(`${errorMessage} - İnternet bağlantınızı kontrol edin ve tekrar deneyin.`);
      } else {
        error(`${errorMessage} - Lütfen tekrar deneyin.`);
      }
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-white rounded-2xl w-full max-w-[800px] max-h-[90vh] overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-4 bg-${config.color}-500 text-white flex items-center justify-between`}>
            <h2 className="text-xl font-bold">{config.title}</h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Progress */}
          <div className="px-6 py-3 bg-gray-50 border-b">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-2 rounded-full ${
                    step >= s ? `bg-${config.color}-500` : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {t('step')} {step}/5: {
                step === 1 ? 'Temel Bilgiler' : 
                step === 2 ? 'İlan Tipi' : 
                step === 3 ? 'Emlak Detayları' : 
                step === 4 ? 'Özellikler' : 
                'Resimler'
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            {category === 'housing' && step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('title')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="İlan başlığı giriniz"
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('description')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Detaylı açıklama giriniz"
                    rows={4}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign size={16} className="inline" /> {t('price')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="0.00"
                      required
                      min="0"
                      step="0.01"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('priceType')}
                    </label>
                    <select
                      value={formData.priceType || 'fixed'}
                      onChange={(e) => handleInputChange('priceType', e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="fixed">{t('fixed')}</option>
                      <option value="negotiable">{t('negotiable')}</option>
                      <option value="monthly">Aylık</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <MapPin size={16} className="inline" /> Posta Kodu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode || user?.postalCode || ''}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Posta kodu giriniz (örn: A1A 1A1)"
                    required
                    pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      İletişim Numarası
                    </label>
                    <input
                      type="text"
                      value={user?.phone || ''}
                      disabled
                      className="w-full p-3 border rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="showPhoneInListing"
                      checked={formData.showPhone !== undefined ? formData.showPhone : true}
                      onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                      className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <label htmlFor="showPhoneInListing" className="text-sm text-gray-700 cursor-pointer">
                      İlanda göster
                    </label>
                  </div>
                </div>
              </div>
            )}

            {category === 'housing' && step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İlan Tipi <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'rent', label: 'Kiralık', emoji: '🔑' },
                      { value: 'sale', label: 'Satılık', emoji: '🏷️' },
                      { value: 'room-rent', label: 'Oda Kiralama', emoji: '🚪' },
                      { value: 'roommate', label: 'Oda Arkadaşı', emoji: '👥' },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange('listingType', type.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          formData.listingType === type.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{type.emoji}</span>
                        <p className="font-medium mt-1">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
                
                {formData.listingType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Emlak Tipi <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => handleInputChange('propertyType', type.value)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            formData.propertyType === type.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{type.emoji}</span>
                          <p className="font-medium mt-1">{getLabel(type)}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {category === 'housing' && step === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yatak Sayısı <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bedrooms || ''}
                    onChange={(e) => handleInputChange('bedrooms', e.target.value)}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz...</option>
                    {BEDROOM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {getLabel(opt)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banyo Sayısı <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.bathrooms || ''}
                    onChange={(e) => handleInputChange('bathrooms', e.target.value)}
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz...</option>
                    {BATHROOM_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {getLabel(opt)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Metrekare (sqft) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.sqft || ''}
                    onChange={(e) => handleInputChange('sqft', e.target.value)}
                    placeholder="Metrekare giriniz"
                    required
                    min="0"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {category === 'housing' && step === 4 && (
              <div className="space-y-6">
                {/* Özellikler */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Özellikler</h3>
                  <div className="space-y-2">
                    {[
                      { key: 'petFriendly', label: 'Pet Friendly', emoji: '🐕' },
                      { key: 'petsInHouse', label: 'Evde Hayvan Var', emoji: '🐾' },
                      { key: 'noSmoking', label: 'Sigara İçilmez', emoji: '🚭' },
                      { key: 'smokingAllowed', label: 'Sigara İçilebilir', emoji: '🚬' },
                      { key: 'furnished', label: 'Eşyalı', emoji: '🛋️' },
                      { key: 'utilitiesIncluded', label: 'Utilities Dahil', emoji: '💡' },
                      { key: 'parkingIncluded', label: 'Parking Dahil', emoji: '🅿️' },
                      { key: 'laundryInUnit', label: 'In-Unit Laundry', emoji: '🧺' },
                    ].map((feature) => (
                      <label
                        key={feature.key}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      >
                        <input
                          type="checkbox"
                          checked={formData[feature.key] || false}
                          onChange={(e) => handleInputChange(feature.key, e.target.checked)}
                          className="w-5 h-5 text-blue-500 rounded"
                        />
                        <span className="text-lg">{feature.emoji}</span>
                        <span>{feature.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Beyaz Eşya */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>🏠</span>
                    <span>Beyaz Eşya</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'hasRefrigerator', label: 'Buzdolabı', emoji: '🧊' },
                      { key: 'hasDishwasher', label: 'Bulaşık Makinesi', emoji: '🍽️' },
                      { key: 'hasWasher', label: 'Çamaşır Makinesi', emoji: '🌀' },
                      { key: 'hasDryer', label: 'Kurutma Makinesi', emoji: '🌪️' },
                      { key: 'hasMicrowave', label: 'Mikrodalga', emoji: '📻' },
                      { key: 'hasOven', label: 'Fırın', emoji: '🔥' },
                    ].map((appliance) => (
                      <label
                        key={appliance.key}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={formData[appliance.key] || false}
                          onChange={(e) => handleInputChange(appliance.key, e.target.checked)}
                          className="w-4 h-4 text-blue-500 rounded"
                        />
                        <span className="text-lg">{appliance.emoji}</span>
                        <span className="text-sm">{appliance.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {category === 'housing' && step === 5 && (
              <div className="space-y-6">
                {/* Resim Yükleme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resimler <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">Resim Yükle</p>
                      <p className="text-sm text-gray-400">Maksimum 10 resim</p>
                    </label>
                  </div>
                  {images.length > 0 && (
                    <div className="flex gap-4 mt-3">
                      {/* Sol: Küçük Thumbnail'ler - Yukarıdan Aşağıya */}
                      {images.length > 1 && (
                        <div className="flex-shrink-0 flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {images.map((img, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300">
                              <img
                                src={img.preview}
                                alt={`Thumbnail ${index + 1}`}
                                className="w-full h-full object-contain"
                              />
                              {index === 0 && (
                                <span className="absolute top-0 left-0 text-[8px] bg-blue-500 text-white px-1 py-0.5 rounded">
                                  {t('cover')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Sağ: Büyük Önizleme */}
                      <div className={`relative ${images.length > 1 ? 'flex-1' : 'w-full'}`}>
                        <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                          <img
                            src={images[0]?.preview}
                            alt="Preview"
                            className="w-full h-full object-contain"
                          />
                          <button
                            onClick={() => setImages(prev => prev.filter((_, i) => i !== 0))}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            ×
                          </button>
                          {images.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                              1 / {images.length}
                            </div>
                          )}
                        </div>
                        {/* Diğer resimler için silme butonları */}
                        {images.length > 1 && (
                          <div className="mt-2 flex gap-2 overflow-x-auto">
                            {images.slice(1).map((img, index) => (
                              <div key={index + 1} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                                <img
                                  src={img.preview}
                                  alt={`Thumbnail ${index + 2}`}
                                  className="w-full h-full object-contain"
                                />
                                <button
                                  onClick={() => setImages(prev => prev.filter((_, i) => i !== index + 1))}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Video Yükleme */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Videolar (Opsiyonel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Camera size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 font-medium">Video Yükle</p>
                      <p className="text-sm text-gray-400">Maksimum 5 video</p>
                    </label>
                  </div>
                  {videos.length > 0 && (
                    <div className="flex gap-4 mt-3">
                      {/* Sol: Küçük Thumbnail'ler - Yukarıdan Aşağıya */}
                      {videos.length > 1 && (
                        <div className="flex-shrink-0 flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          {videos.map((vid, index) => (
                            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-300">
                              <video
                                src={vid.preview}
                                className="w-full h-full object-contain"
                                muted
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <span className="text-white text-xs">▶</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Sağ: Büyük Önizleme */}
                      <div className={`relative ${videos.length > 1 ? 'flex-1' : 'w-full'}`}>
                        <div className="relative w-full h-[400px] rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-300">
                          <video
                            src={videos[0]?.preview}
                            className="w-full h-full object-contain"
                            controls
                          />
                          <button
                            onClick={() => setVideos(prev => prev.filter((_, i) => i !== 0))}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center"
                          >
                            ×
                          </button>
                          {videos.length > 1 && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                              1 / {videos.length}
                            </div>
                          )}
                        </div>
                        {/* Diğer videolar için silme butonları */}
                        {videos.length > 1 && (
                          <div className="mt-2 flex gap-2 overflow-x-auto">
                            {videos.slice(1).map((vid, index) => (
                              <div key={index + 1} className="relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-300">
                                <video
                                  src={vid.preview}
                                  className="w-full h-full object-contain"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <span className="text-white text-[8px]">▶</span>
                                </div>
                                <button
                                  onClick={() => setVideos(prev => prev.filter((_, i) => i !== index + 1))}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t bg-gray-50 flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-6 py-2 border rounded-lg hover:bg-gray-100"
              >
                {t('back')}
              </button>
            )}
            <button
              onClick={() => {
                const maxStep = category === 'housing' ? 5 : 3;
                
                // Step geçişlerinde validasyon
                if (step < maxStep) {
                  if (category === 'housing') {
                    if (step === 1) {
                      if (!formData.title || !formData.description || !formData.price || !formData.address) {
                        error('Lütfen tüm zorunlu alanları doldurunuz');
                        return;
                      }
                    } else if (step === 2) {
                      if (!formData.listingType) {
                        error('Lütfen ilan tipi seçiniz');
                        return;
                      }
                      if (!formData.propertyType) {
                        error('Lütfen emlak tipi seçiniz');
                        return;
                      }
                    } else if (step === 3) {
                      if (!formData.bedrooms || !formData.bathrooms || !formData.sqft) {
                        error('Lütfen tüm zorunlu alanları doldurunuz');
                        return;
                      }
                    }
                  }
                  setStep(step + 1);
                } else {
                  handleSubmit();
                }
              }}
              disabled={uploading}
              className={`flex-1 py-3 bg-${config.color}-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>{t('uploading') || 'Yükleniyor...'}</span>
                </>
              ) : (
                <>{step < (category === 'housing' ? 5 : 3) ? t('continue') : `🚀 ${t('publish')}`}</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ListingModal;

