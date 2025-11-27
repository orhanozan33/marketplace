import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Car, ShoppingBag, Plus, MapPin, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/utils/constants';
import HousingFilters from '@/components/Listings/Housing/HousingFilters';
import VehicleFilters from '@/components/Listings/Vehicle/VehicleFilters';
import BuySellFilters from '@/components/Listings/BuySell/BuySellFilters';
import ListingModal from '@/components/Forms/ListingModal';
import LocationPicker from '@/components/Forms/LocationPicker';

const iconMap = {
  Home,
  Car,
  ShoppingBag,
};

const Sidebar = ({ selectedCategory, setSelectedCategory, filters, setFilters, radius, setRadius, userLocation, onLocationChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const { language, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'tr', label: 'TR', flag: '🇹🇷' },
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header - Sabit - Küçültülmüş */}
      <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">🍁</span>
          <div>
            <h1 className="text-sm font-bold">{t('appName')}</h1>
            <p className="text-[10px] text-red-100">{t('tagline')}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Globe size={14} />
          <div className="flex gap-0.5 bg-white/20 rounded-lg p-0.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-all ${
                  language === lang.code
                    ? 'bg-white text-red-600'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Konum & Radius - Sabit - Kompakt */}
      <div className="p-1.5 border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-1 text-gray-600 mb-1">
          <MapPin size={11} className="text-red-500" />
          <span className="text-[10px] font-medium flex-1 truncate">
            {userLocation?.name || 'Loading...'}
          </span>
          <button 
            onClick={() => setIsLocationPickerOpen(true)}
            className="text-[9px] text-blue-500 hover:underline whitespace-nowrap"
          >
            {t('changeLocation')}
          </button>
        </div>
        
        {/* Radius Slider */}
        <div className="space-y-0.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-gray-600">{t('searchRadius')}</span>
            <span className="font-semibold text-red-600">{radius} {t('km')}</span>
          </div>
          <input
            type="range"
            min="1"
            max="50"
            value={radius}
            onChange={(e) => setRadius && setRadius(Number(e.target.value))}
            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>1 {t('km')}</span>
            <span>50 {t('km')}</span>
          </div>
        </div>
      </div>


      {/* Dinamik Filtreler - Kaydırılabilir */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="pb-2"
          >
            {selectedCategory === 'housing' && (
              <HousingFilters filters={filters} setFilters={setFilters} />
            )}
            {selectedCategory === 'vehicle' && (
              <VehicleFilters filters={filters} setFilters={setFilters} />
            )}
            {selectedCategory === 'buysell' && (
              <BuySellFilters filters={filters} setFilters={setFilters} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* İlan Ver Butonu - Sabit - %40 küçültülmüş */}
      <div className="p-1.5 border-t bg-white flex-shrink-0">
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center gap-1 p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold text-sm shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus size={12} />
          <span>{t('createListing')}</span>
          <span className="text-[10px] bg-white/20 px-1 py-0.5 rounded-full ml-1">
            {CATEGORIES.find(c => c.id === selectedCategory)?.emoji}
          </span>
        </motion.button>
      </div>

      {/* İlan Ekleme Modal */}
      <ListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
      />

      {/* Konum Seçici Modal */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        onLocationSelect={onLocationChange}
        currentLocation={userLocation}
      />
    </div>
  );
};

export default Sidebar;

