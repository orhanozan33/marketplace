import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GripVertical, GripHorizontal, Save } from 'lucide-react';
import ListingList from '@/components/Listings/ListingList';

const ResizableListingList = ({ selectedCategory, onListingClick, listings, onViewListing }) => {
  // LocalStorage'dan kaydedilmiş genişlik ve yüksekliği al
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem('listing_list_width');
    return saved ? parseInt(saved) : 320; // Varsayılan genişlik artırıldı
  });
  const [height, setHeight] = useState(() => {
    const saved = localStorage.getItem('listing_list_height');
    return saved ? parseInt(saved) : null; // null = otomatik yükseklik
  });
  const [isResizingWidth, setIsResizingWidth] = useState(false);
  const [isResizingHeight, setIsResizingHeight] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const containerRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const handleWidthMouseDown = (e) => {
    setIsResizingWidth(true);
    e.preventDefault();
  };

  const handleHeightMouseDown = (e) => {
    setIsResizingHeight(true);
    e.preventDefault();
    e.stopPropagation();
  };

  // Genişlik resize
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingWidth) return;
      
      const newWidth = e.clientX;
      // Genişletilmiş aralık: 250px - 500px
      if (newWidth >= 250 && newWidth <= 500) {
        setWidth(newWidth);
        setHasChanges(true);
      }
    };

    const handleMouseUp = () => {
      setIsResizingWidth(false);
    };

    if (isResizingWidth) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingWidth]);

  // Yükseklik resize
  useEffect(() => {
    let startY = 0;
    let startHeight = 0;

    const handleMouseMove = (e) => {
      if (!isResizingHeight) return;
      
      if (startY === 0) {
        const containerRect = containerRef.current?.getBoundingClientRect();
        if (!containerRect) return;
        startY = e.clientY;
        startHeight = height !== null ? height : containerRect.height;
      }
      
      const deltaY = e.clientY - startY;
      const newHeight = startHeight + deltaY;
      
      // Minimum 200px, maksimum ekran yüksekliğinin %80'i
      const minHeight = 200;
      const maxHeight = window.innerHeight * 0.8;
      
      if (newHeight >= minHeight && newHeight <= maxHeight) {
        setHeight(newHeight);
        setHasChanges(true);
      }
    };

    const handleMouseUp = () => {
      setIsResizingHeight(false);
      startY = 0;
      startHeight = 0;
    };

    if (isResizingHeight) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizingHeight, height]);

  // Otomatik kaydetme - 2 saniye sonra
  useEffect(() => {
    if (hasChanges) {
      // Önceki timeout'u temizle
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // 2 saniye sonra otomatik kaydet
      saveTimeoutRef.current = setTimeout(() => {
        localStorage.setItem('listing_list_width', width.toString());
        if (height !== null) {
          localStorage.setItem('listing_list_height', height.toString());
        } else {
          localStorage.removeItem('listing_list_height');
        }
        setHasChanges(false);
        console.log('✅ Boyutlandırma otomatik kaydedildi');
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, width, height]);

  // Manuel kaydet butonu
  const handleSave = () => {
    // Timeout'u iptal et
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    localStorage.setItem('listing_list_width', width.toString());
    if (height !== null) {
      localStorage.setItem('listing_list_height', height.toString());
    } else {
      localStorage.removeItem('listing_list_height');
    }
    setHasChanges(false);
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white shadow-lg flex flex-col"
      style={{ 
        width: `${width}px`, 
        minWidth: '250px', 
        maxWidth: '500px',
        ...(height !== null && {
          height: `${height}px`,
          minHeight: '200px',
          maxHeight: `${window.innerHeight * 0.8}px`
        })
      }}
    >
      {/* Kaydet Butonu - Değişiklik varsa göster */}
      {hasChanges && (
        <button
          onClick={handleSave}
          className="absolute top-2 right-2 z-20 flex items-center gap-1.5 px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors shadow-md"
        >
          <Save size={14} />
          Kaydet
        </button>
      )}

      {/* Resize Handle - Sol tarafta (Genişlik) */}
      <div
        onMouseDown={handleWidthMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-blue-400 transition-colors z-10 flex items-center justify-center ${
          isResizingWidth ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
        }`}
      >
        <GripVertical size={16} className="text-gray-600" />
      </div>

      {/* Resize Handle - Alt tarafta (Yükseklik) */}
      <div
        onMouseDown={handleHeightMouseDown}
        className={`absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-400 transition-colors z-10 flex items-center justify-center ${
          isResizingHeight ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
        }`}
      >
        <GripHorizontal size={16} className="text-gray-600" />
      </div>

      {/* İlan Listesi */}
      <div className="h-full overflow-hidden">
        <ListingList
          listings={listings}
          selectedCategory={selectedCategory}
          onListingClick={onListingClick}
          onViewListing={onViewListing}
        />
      </div>
    </div>
  );
};

export default ResizableListingList;

