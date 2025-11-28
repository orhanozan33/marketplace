import React from 'react';
import { motion } from 'framer-motion';
import { Home, Car, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { CATEGORIES } from '@/utils/constants';

const iconMap = {
  Home,
  Car,
  ShoppingBag,
};

const TopBar = ({ selectedCategory, setSelectedCategory, radius, setRadius, userLocation, onLocationChange }) => {
  const { language, t } = useLanguage();

  return (
    <div className="bg-white border-b shadow-sm flex-shrink-0">
      <div className="flex items-center gap-3 p-2">
        {/* Canada Marketplace Logo */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <span className="text-lg filter brightness-0 invert">🍁</span>
            <div>
              <h1 className="text-sm font-bold leading-tight">{t('appName')}</h1>
              <p className="text-[9px] text-red-100 leading-tight">{t('tagline')}</p>
            </div>
          </div>
        </div>

        {/* Kategori Butonları */}
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = iconMap[cat.icon];
            const isSelected = selectedCategory === cat.id;
            
            return (
              <motion.button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  isSelected
                    ? `${cat.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} className={isSelected ? 'text-white' : 'text-gray-600'} />
                <span className="font-semibold text-sm">
                  {language === 'tr' ? cat.label : language === 'fr' ? (cat.labelFr || cat.labelEn) : cat.labelEn}
                </span>
              </motion.button>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TopBar;

