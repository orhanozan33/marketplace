import React, { useState } from 'react';
import FiltersPanel from './FiltersPanel';

const ResizableFiltersPanel = ({ selectedCategory, filters, setFilters, userLocation, onListingCreated, onSearch, radius, setRadius, onLocationChange }) => {
  // LocalStorage'dan kaydedilmiş genişliği al (sabit)
  const [width] = useState(() => {
    const saved = localStorage.getItem('filters_panel_width');
    return saved ? parseInt(saved) : 284; // Varsayılan genişlik
  });

  return (
    <div
      className="relative bg-white shadow-lg flex flex-col border-r"
      style={{ 
        width: `${width}px`
      }}
    >

      {/* Filtreler Paneli */}
      <div className="h-full overflow-hidden">
        <FiltersPanel
          selectedCategory={selectedCategory}
          filters={filters}
          setFilters={setFilters}
          userLocation={userLocation}
          onListingCreated={onListingCreated}
          onSearch={onSearch}
          radius={radius}
          setRadius={setRadius}
          onLocationChange={onLocationChange}
        />
      </div>
    </div>
  );
};

export default ResizableFiltersPanel;

