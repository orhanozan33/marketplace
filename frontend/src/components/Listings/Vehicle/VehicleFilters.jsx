import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { VEHICLE_TYPES, VEHICLE_MAKES } from '@/utils/constants';

const VehicleFilters = ({ filters, setFilters }) => {
  const { language, t } = useLanguage();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const years = Array.from({ length: 30 }, (_, i) => 2024 - i);

  const getLabel = (item) => {
    if (language === 'tr') return item.labelTr || item.label;
    if (language === 'fr') return item.labelFr || item.label;
    return item.label;
  };

  return (
    <div className="space-y-4">
      {/* Araç Tipi */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">🚗</span>
          <span>{t('vehicleType')}</span>
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {VEHICLE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => updateFilter('vehicleType', type.value)}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                filters.vehicleType === type.value
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

      {/* Marka */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">{t('make')}</h3>
        <select
          value={filters.make || ''}
          onChange={(e) => updateFilter('make', e.target.value)}
          className="w-full p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
        >
          <option value="">All {t('make')}s</option>
          {VEHICLE_MAKES.map((make) => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>
      </div>

      {/* Yıl Aralığı */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">📅</span>
          <span>{t('year')}</span>
        </h3>
        <div className="flex gap-1.5">
          <select
            value={filters.yearMin || ''}
            onChange={(e) => updateFilter('yearMin', e.target.value)}
            className="flex-1 p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Min</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={filters.yearMax || ''}
            onChange={(e) => updateFilter('yearMax', e.target.value)}
            className="flex-1 p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Max</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kilometre */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">🛣️</span>
          <span>{t('mileage')} (Max)</span>
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {[50000, 100000, 150000, 200000].map((km) => (
            <button
              key={km}
              onClick={() => updateFilter('mileageMax', km)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filters.mileageMax === km
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              &lt;{(km/1000)}k km
            </button>
          ))}
        </div>
      </div>

      {/* Fiyat */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">💰</span>
          <span>{t('priceRange')}</span>
        </h3>
        <div className="flex gap-1.5">
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin || ''}
            onChange={(e) => updateFilter('priceMin', e.target.value)}
            className="w-[46%] p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax || ''}
            onChange={(e) => updateFilter('priceMax', e.target.value)}
            className="w-[46%] p-1.5 border rounded-lg text-xs bg-gray-50 focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Kanada'ya Özel Özellikler */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">❄️</span>
          <span>{t('features')}</span>
        </h3>
        <div className="space-y-1">
          {[
            { key: 'winterTires', label: t('winterTires'), emoji: '🛞' },
            { key: 'blockHeater', label: t('blockHeater'), emoji: '🔌' },
            { key: 'remoteStart', label: t('remoteStart'), emoji: '📡' },
            { key: 'awd', label: t('awd'), emoji: '⛰️' },
            { key: 'accidentFree', label: t('accidentFree'), emoji: '✅' },
          ].map((feature) => (
            <label
              key={feature.key}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={filters[feature.key] || false}
                onChange={(e) => updateFilter(feature.key, e.target.checked)}
                className="w-3.5 h-3.5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
              />
              <span className="text-xs">{feature.emoji}</span>
              <span className="text-xs text-gray-700">{feature.label}</span>
            </label>
          ))}
        </div>
      </div>

    </div>
  );
};

export default VehicleFilters;

