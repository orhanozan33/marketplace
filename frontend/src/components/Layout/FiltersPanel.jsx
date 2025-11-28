import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import HousingFilters from '@/components/Listings/Housing/HousingFilters';
import VehicleFilters from '@/components/Listings/Vehicle/VehicleFilters';
import BuySellFilters from '@/components/Listings/BuySell/BuySellFilters';
import ListingModal from '@/components/Forms/ListingModal';
import { CANADIAN_PROVINCES, CANADIAN_CITIES, getProvinceCoordinates, getCityCoordinates } from '@/utils/constants';

const FiltersPanel = ({ selectedCategory, filters, setFilters, userLocation, onListingCreated, onSearch, radius, setRadius, onLocationChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, t } = useLanguage();

  // Seçili eyalete göre şehirleri al
  const selectedProvince = filters.province || 'all';
  const availableCities = selectedProvince !== 'all' ? (CANADIAN_CITIES[selectedProvince] || []) : [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Dinamik Filtreler - Kaydırılabilir */}
      <div className="flex-1 min-h-0 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
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

      {/* Alt Butonlar - Eyalet, Yarıçap, Ara, İlan Ver */}
      <div className="border-t bg-white flex-shrink-0">
        {/* Eyalet Seçimi ve Yarıçap */}
        <div className="p-1.5 space-y-1 border-b">
          {/* Eyalet ve Şehir Seçimi */}
          <div className="grid grid-cols-2 gap-1">
            {/* Eyalet Seçimi */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">Eyalet / Province</label>
              <select
                value={filters.province || 'all'}
                onChange={(e) => {
                  const selectedProvince = e.target.value;
                  setFilters(prev => ({ ...prev, province: selectedProvince, city: '' })); // Şehir seçimini sıfırla
                  
                  // Eyalet seçildiğinde haritayı o bölgeye götür
                  if (selectedProvince && onLocationChange) {
                    const coords = getProvinceCoordinates(selectedProvince);
                    if (coords) {
                      onLocationChange({
                        lat: coords.lat,
                        lng: coords.lng,
                        name: coords.name,
                      });
                    }
                  }
                }}
                className="w-full p-1 border rounded-md text-[10px] focus:ring-2 focus:ring-blue-500"
              >
                {CANADIAN_PROVINCES.map((province) => {
                  let label = province.labelEn;
                  if (language === 'tr') label = province.label;
                  else if (language === 'fr') label = province.labelFr;
                  return (
                    <option key={province.value} value={province.value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
            
            {/* Şehir Seçimi */}
            <div>
              <label className="block text-[10px] font-semibold text-gray-700 mb-0.5">Şehir / City</label>
              <select
                value={filters.city || ''}
                onChange={(e) => {
                  const selectedCity = e.target.value;
                  setFilters(prev => ({ ...prev, city: selectedCity }));
                  
                  // Şehir seçildiğinde haritayı o şehre götür
                  if (selectedCity && selectedProvince !== 'all' && onLocationChange) {
                    const coords = getCityCoordinates(selectedProvince, selectedCity);
                    if (coords) {
                      onLocationChange({
                        lat: coords.lat,
                        lng: coords.lng,
                        name: coords.name,
                      });
                    }
                  }
                }}
                disabled={selectedProvince === 'all' || availableCities.length === 0}
                className="w-full p-1 border rounded-md text-[10px] focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Tümü / All</option>
                {availableCities.map((city) => {
                  let label = city.labelEn;
                  if (language === 'tr') label = city.labelTr;
                  else if (language === 'fr') label = city.labelFr;
                  return (
                    <option key={city.value} value={city.value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          {/* KM Yarıçap */}
          <div>
            <label className="block text-[10px] font-semibold text-gray-700 mb-0.5 flex items-center gap-1">
              <MapPin size={10} />
              Yarıçap / Radius: {radius} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={radius || 2}
              onChange={(e) => setRadius && setRadius(Number(e.target.value))}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
              <span>1 km</span>
              <span>50 km</span>
            </div>
          </div>
        </div>
        
        {/* Ara ve İlan Ver Butonları - Optimize edilmiş */}
        <div className="p-1.5 flex gap-1">
          <button
            onClick={() => {
              if (onSearch) {
                onSearch(filters);
              }
            }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-blue-500 text-white rounded-md font-semibold text-[10px] hover:bg-blue-600 transition-colors"
          >
            <Search size={10} />
            <span>Ara</span>
          </button>
          
          <motion.button
            onClick={() => setIsModalOpen(true)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-md font-semibold text-[10px] shadow-md hover:shadow-lg transition-shadow"
          >
            <Plus size={10} />
            <span>İlan Ver</span>
          </motion.button>
        </div>
      </div>

      {/* İlan Ekleme Modal */}
      <ListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        userLocation={userLocation}
        onListingCreated={onListingCreated}
      />
    </div>
  );
};

export default FiltersPanel;

