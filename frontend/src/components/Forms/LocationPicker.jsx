import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const LocationPicker = ({ isOpen, onClose, onLocationSelect, currentLocation }) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const popularCities = [
    { name: 'Vancouver, BC', lat: 49.2827, lng: -123.1207 },
    { name: 'Toronto, ON', lat: 43.6532, lng: -79.3832 },
    { name: 'Montreal, QC', lat: 45.5017, lng: -73.5673 },
    { name: 'Calgary, AB', lat: 51.0447, lng: -114.0719 },
    { name: 'Edmonton, AB', lat: 53.5461, lng: -113.4938 },
    { name: 'Ottawa, ON', lat: 45.4215, lng: -75.6972 },
  ];

  const handleGetCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSelect({
            lat: latitude,
            lng: longitude,
            name: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          });
          setIsGettingLocation(false);
          onClose();
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
    }
  };

  const handleCitySelect = (city) => {
    onLocationSelect(city);
    onClose();
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
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 bg-red-500 text-white flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <MapPin size={24} />
              {t('changeLocation')}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            {/* Current Location */}
            {currentLocation && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Current Location</p>
                <p className="font-semibold">{currentLocation.name}</p>
              </div>
            )}

            {/* Get Current Location Button */}
            <button
              onClick={handleGetCurrentLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center justify-center gap-2 p-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {isGettingLocation ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Getting location...
                </>
              ) : (
                <>
                  <MapPin size={20} />
                  Use My Current Location
                </>
              )}
            </button>

            {/* Popular Cities */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Popular Cities</h3>
              <div className="space-y-2">
                {popularCities.map((city) => (
                  <button
                    key={city.name}
                    onClick={() => handleCitySelect(city)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-3"
                  >
                    <MapPin size={18} className="text-red-500" />
                    <span className="font-medium">{city.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default LocationPicker;


