import React from 'react';
import { Bed, Bath, DollarSign, Home, Dog, Sofa, Thermometer } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PROPERTY_TYPES, BEDROOM_OPTIONS, BATHROOM_OPTIONS } from '@/utils/constants';

const HousingFilters = ({ filters, setFilters }) => {
  const { language, t } = useLanguage();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key, value) => {
    setFilters(prev => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const getLabel = (item) => {
    if (language === 'tr') return item.labelTr || item.label;
    if (language === 'fr') return item.labelFr || item.label;
    return item.label;
  };

  return (
    <div className="space-y-2.5">
      {/* Kira / Satılık / Oda Kiralama */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Home size={12} />
          <span>{t('listingType')}</span>
        </h3>
        <div className="grid grid-cols-2 gap-1">
          {[
            { value: 'rent', label: t('rent'), emoji: '🔑' },
            { value: 'sale', label: t('sale'), emoji: '🏷️' },
            { value: 'room-rent', label: 'Oda Kiralama', emoji: '🚪' },
            { value: 'roommate', label: 'Oda Arkadaşı', emoji: '👥' },
          ].map((type) => (
            <button
              key={type.value}
              onClick={() => updateFilter('listingType', type.value)}
              className={`py-1 px-1.5 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 ${
                filters.listingType === type.value
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="text-xs">{type.emoji}</span> <span className="truncate">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Emlak Tipi */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1">{t('propertyType')}</h3>
        <div className="grid grid-cols-2 gap-1">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => toggleArrayFilter('propertyType', type.value)}
              className={`p-1 rounded-md text-[10px] font-medium transition-all flex items-center justify-center gap-1 ${
                (filters.propertyType || []).includes(type.value)
                  ? 'bg-red-100 text-red-700 border border-red-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <span className="text-sm">{type.emoji}</span>
              <span className="truncate">{getLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Yatak Sayısı */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Bed size={12} />
          <span>{t('bedrooms')}</span>
        </h3>
        <div className="flex flex-wrap gap-1">
          {BEDROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleArrayFilter('bedrooms', opt.value)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${
                (filters.bedrooms || []).includes(opt.value)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Banyo Sayısı */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <Bath size={12} />
          <span>{t('bathrooms')}</span>
        </h3>
        <div className="flex flex-wrap gap-1">
          {BATHROOM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => toggleArrayFilter('bathrooms', opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                (filters.bathrooms || []).includes(opt.value)
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Fiyat Aralığı */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <DollarSign size={12} />
          <span>{t('priceRange')} (CAD)</span>
        </h3>
        <div className="flex gap-1 items-center">
          <div className="w-[46%]">
            <input
              type="number"
              placeholder="Min"
              value={filters.priceMin || ''}
              onChange={(e) => updateFilter('priceMin', e.target.value)}
              className="w-full p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <span className="text-gray-400 text-xs">—</span>
          <div className="w-[46%]">
            <input
              type="number"
              placeholder="Max"
              value={filters.priceMax || ''}
              onChange={(e) => updateFilter('priceMax', e.target.value)}
              className="w-full p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
        </div>
        {/* Quick Select */}
        <div className="flex flex-wrap gap-0.5 mt-0.5">
          {['$1000', '$1500', '$2000', '$2500', '$3000+'].map((price) => (
            <button
              key={price}
              onClick={() => updateFilter('priceMax', parseInt(price.replace(/\D/g, '')))}
              className="px-1.5 py-0.5 text-[9px] bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              {price}/mo
            </button>
          ))}
        </div>
      </div>

      {/* Özellikler Toggle */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1">{t('features')}</h3>
        <div className="space-y-0.5">
          {[
            { key: 'petFriendly', label: t('petFriendly'), emoji: '🐕', icon: Dog },
            { key: 'noSmoking', label: 'Sigara İçilmez', emoji: '🚭' },
            { key: 'furnished', label: t('furnished'), emoji: '🛋️', icon: Sofa },
            { key: 'parkingIncluded', label: t('parkingIncluded'), emoji: '🅿️' },
          ].map((feature) => (
            <label
              key={feature.key}
              className="flex items-center gap-1.5 p-1 rounded-md hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters[feature.key] || false}
                onChange={(e) => updateFilter(feature.key, e.target.checked)}
                className="w-3 h-3 text-red-500 rounded focus:ring-1 focus:ring-red-500"
              />
              <span className="text-[10px]">{feature.emoji}</span>
              <span className="text-[10px] text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Beyaz Eşya */}
      <div>
        <h3 className="text-[11px] font-semibold text-gray-700 mb-1 flex items-center gap-1">
          <span className="text-xs">🏠</span>
          <span>Beyaz Eşya</span>
        </h3>
        <div className="grid grid-cols-2 gap-1">
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
              className="flex items-center gap-1 p-1 rounded-md hover:bg-gray-50 cursor-pointer border border-gray-200"
            >
              <input
                type="checkbox"
                checked={filters[appliance.key] || false}
                onChange={(e) => updateFilter(appliance.key, e.target.checked)}
                className="w-3 h-3 text-red-500 rounded focus:ring-1 focus:ring-red-500"
              />
              <span className="text-[10px]">{appliance.emoji}</span>
              <span className="text-[10px] text-gray-700 truncate">{appliance.label}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HousingFilters;

