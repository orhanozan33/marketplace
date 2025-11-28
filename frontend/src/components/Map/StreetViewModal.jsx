import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

const StreetViewModal = ({ isOpen, onClose, position, listingTitle }) => {
  const panoramaRef = useRef(null);
  const streetViewRef = useRef(null);

  useEffect(() => {
    if (isOpen && position && window.google) {
      const panorama = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat: position[0], lng: position[1] },
          pov: {
            heading: 34,
            pitch: 10
          },
          zoom: 1,
          visible: true
        }
      );

      panoramaRef.current = panorama;

      // Street View yüklenemediğinde hata kontrolü
      window.google.maps.event.addListener(panorama, 'status_changed', () => {
        if (panorama.getStatus() !== 'OK') {
          console.warn('Street View bu konum için mevcut değil');
        }
      });
    }

    return () => {
      if (panoramaRef.current) {
        window.google.maps.event.clearInstanceListeners(panoramaRef.current);
      }
    };
  }, [isOpen, position]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10000]" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Street View</h2>
            {listingTitle && (
              <p className="text-sm text-gray-600 mt-1">{listingTitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Street View Container */}
        <div className="relative" style={{ height: '70vh', minHeight: '500px' }}>
          {!window.google ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <p className="text-gray-600 mb-2">Google Maps yükleniyor...</p>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
              </div>
            </div>
          ) : (
            <div
              ref={streetViewRef}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <p className="text-xs text-gray-500">
            Street View görüntüleri Google tarafından sağlanmaktadır
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreetViewModal;

