import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { BUYSELL_CATEGORIES, CONDITION_OPTIONS } from '@/utils/constants';

const BuySellFilters = ({ filters, setFilters }) => {
  const { language, t } = useLanguage();

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getLabel = (item) => {
    if (language === 'tr') return item.labelTr || item.label;
    if (language === 'fr') return item.labelFr || item.label;
    return item.label;
  };

  return (
    <div className="space-y-4">
      {/* Kategori */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">{t('itemCategory')}</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {BUYSELL_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => updateFilter('itemCategory', cat.value)}
              className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                filters.itemCategory === cat.value
                  ? 'bg-red-100 text-red-700 border border-red-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <span className="text-sm">{cat.emoji}</span>
              <span className="truncate">{getLabel(cat)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Durum */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">{t('condition')}</h3>
        <div className="flex flex-wrap gap-1.5">
          {CONDITION_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateFilter('condition', opt.value)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                filters.condition === opt.value
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {getLabel(opt)}
            </button>
          ))}
        </div>
      </div>

      {/* Fiyat */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
          <span className="text-sm">💰</span>
          <span>{t('priceRange')} (CAD)</span>
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

      {/* Özellikler */}
      <div>
        <h3 className="text-xs font-semibold text-gray-700 mb-1.5">{t('features')}</h3>
        <div className="space-y-1">
          {[
            { key: 'deliveryAvailable', label: t('deliveryAvailable'), emoji: '🚚' },
            { key: 'pickupOnly', label: t('pickupOnly'), emoji: '📍' },
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

export default BuySellFilters;

