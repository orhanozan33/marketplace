import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, Marker, Circle, useLoadScript } from '@react-google-maps/api';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getCategoryColor, getCategoryEmoji, calculateDistance } from '@/utils/helpers';
import StreetViewModal from './StreetViewModal';

const libraries = ['places', 'streetview'];

const mapContainerStyle = {
  width: '100%',
  height: '100%'
};

const GoogleMapContainerComponent = ({ 
  listings, 
  selectedCategory, 
  selectedListing, 
  setSelectedListing, 
  filters, 
  radius: radiusKm, 
  userLocation, 
  onLocationChange, 
  onListingsChange, 
  onViewListing 
}) => {
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [map, setMap] = useState(null);
  const [streetViewOpen, setStreetViewOpen] = useState(false);
  const [streetViewPosition, setStreetViewPosition] = useState(null);
  const [streetViewTitle, setStreetViewTitle] = useState('');
  const { t } = useLanguage();

  // Marker ikonları için custom icon oluştur
  const createMarkerIcon = React.useCallback((category, isSelected = false) => {
    if (!isLoaded || !window.google || !window.google.maps) {
      console.warn('⚠️ Google Maps yüklenmedi, marker icon oluşturulamıyor');
      return null;
    }
    
    const color = getCategoryColor(category);
    const emoji = getCategoryEmoji(category);
    
    try {
      const icon = {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: color,
        fillOpacity: 1,
        strokeColor: isSelected ? '#FFD700' : 'white',
        strokeWeight: isSelected ? 4 : 3,
        scale: isSelected ? 12 : 10,
        label: {
          text: emoji,
          fontSize: '14px',
          fontWeight: 'bold',
          color: 'white'
        }
      };
      console.log('✅ Marker icon oluşturuldu:', { category, emoji, color, isSelected });
      return icon;
    } catch (error) {
      console.error('❌ Marker icon oluşturma hatası:', error);
      return null;
    }
  }, [isLoaded]);

  // Google Maps API key
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCOlPV2RkJUBb3iaJSooYybPv0lbMwcF8w';
  
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: googleMapsApiKey,
    libraries
  });

  // Kullanıcı konumunu güncelle
  useEffect(() => {
    if (userLocation) {
      setUserPosition({ lat: userLocation.lat, lng: userLocation.lng });
      setLoading(false);
    } else {
      // Varsayılan: Vancouver, BC
      setUserPosition({ lat: 49.2827, lng: -123.1207 });
      setLoading(false);
    }
  }, [userLocation]);

  // Seçili ilana zoom yap
  useEffect(() => {
    if (map && selectedListing && selectedListing.position) {
      const position = Array.isArray(selectedListing.position) 
        ? { lat: selectedListing.position[0], lng: selectedListing.position[1] }
        : selectedListing.position;
      
      map.panTo(position);
      map.setZoom(16);
    }
  }, [map, selectedListing]);

  // Örnek ilanlar
  const sampleListings = [
    {
      id: 1,
      category: 'housing',
      title: '2 Bed / 1 Bath Apartment in Downtown',
      price: 2200,
      position: { lat: 49.2850, lng: -123.1180 },
      image: 'https://placehold.co/300x200/3B82F6/white?text=Apartment',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      address: '123 Main St, Vancouver, BC',
    },
    {
      id: 2,
      category: 'housing',
      title: 'Cozy Studio near Skytrain',
      price: 1500,
      position: { lat: 49.2800, lng: -123.1250 },
      image: 'https://placehold.co/300x200/3B82F6/white?text=Studio',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 450,
      address: '456 Oak Ave, Vancouver, BC',
    },
    {
      id: 3,
      category: 'vehicle',
      title: '2020 Honda Civic - Low KM',
      price: 24500,
      position: { lat: 49.2870, lng: -123.1150 },
      image: 'https://placehold.co/300x200/22C55E/white?text=Honda',
      mileage: 35000,
      year: 2020,
      address: '789 Pine St, Vancouver, BC',
    },
    {
      id: 4,
      category: 'buysell',
      title: 'IKEA Sectional Sofa - Like New',
      price: 450,
      position: { lat: 49.2790, lng: -123.1300 },
      image: 'https://placehold.co/300x200/F97316/white?text=Sofa',
      address: '321 Elm Rd, Vancouver, BC',
    },
  ];

  // Filtrelenmiş ilanlar
  const filteredListings = React.useMemo(() => {
    let allListings = sampleListings;
    if (listings !== undefined && listings !== null && listings.length > 0) {
      const sampleIds = new Set(sampleListings.map(l => l.id));
      const userListings = listings
        .filter(l => !sampleIds.has(l.id))
        .map(l => ({
          ...l,
          position: Array.isArray(l.position) 
            ? { lat: l.position[0], lng: l.position[1] }
            : (l.latitude && l.longitude 
              ? { lat: l.latitude, lng: l.longitude }
              : null)
        }))
        .filter(l => l.position);
      allListings = [...sampleListings, ...userListings];
    }
    
    // Kategori filtresi
    let categoryFiltered = allListings.filter(
      (listing) => listing.category === selectedCategory
    );

    // Yarıçap filtresi
    if (userPosition && radiusKm) {
      const radiusFiltered = categoryFiltered.filter((listing) => {
        if (!listing.position) return false;
        const distance = calculateDistance(
          userPosition.lat,
          userPosition.lng,
          listing.position.lat,
          listing.position.lng
        );
        return (distance / 1000) <= radiusKm;
      });
      
      if (radiusFiltered.length === 0 && categoryFiltered.length > 0) {
        const userListings = categoryFiltered.filter(l => !sampleListings.some(s => s.id === l.id));
        if (userListings.length > 0) {
          return userListings;
        }
      }
      
      return radiusFiltered;
    }
    
    console.log('🔍 Filtreleme sonucu:', {
      selectedCategory,
      allListings: allListings.length,
      categoryFiltered: categoryFiltered.length,
      userPosition,
      radiusKm,
      finalCount: categoryFiltered.length
    });
    
    return categoryFiltered;
  }, [selectedCategory, userPosition, radiusKm, listings]);

  // Filtrelenmiş ilanları parent'a bildir
  useEffect(() => {
    console.log('🗺️ Filtered listings:', filteredListings.length, filteredListings);
    if (onListingsChange) {
      onListingsChange([...filteredListings]);
    }
  }, [filteredListings, onListingsChange]);

  // Street View aç
  const handleStreetView = (listing) => {
    if (listing.position) {
      const position = Array.isArray(listing.position) 
        ? listing.position 
        : [listing.position.lat, listing.position.lng];
      setStreetViewPosition(position);
      setStreetViewTitle(listing.title || '');
      setStreetViewOpen(true);
    }
  };

  // Marker tıklama
  const handleMarkerClick = (listing) => {
    setSelectedListing(listing);
    // Street View'ı otomatik aç
    handleStreetView(listing);
  };

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-2">Google Maps yüklenemedi</p>
          <p className="text-sm text-gray-600">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded || loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  const defaultCenter = userPosition || { lat: 49.2827, lng: -123.1207 };
  const defaultZoom = radiusKm && radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11;

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={defaultZoom}
        onLoad={(map) => {
          console.log('🗺️ Google Map yüklendi');
          setMap(map);
        }}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: true,
          mapTypeControl: true,
          fullscreenControl: true,
        }}
      >
        {/* Kullanıcı Konumu */}
        {userPosition && window.google && window.google.maps && (
          <>
            <Marker
              position={userPosition}
              icon={{
                path: window.google.maps.SymbolPath.CIRCLE,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: 'white',
                strokeWeight: 4,
                scale: 8
              }}
              title={t('yourLocation') || 'Your Location'}
            />
            
            {/* Yarıçap Dairesi */}
            <Circle
              center={userPosition}
              radius={(radiusKm || 2) * 1000}
              options={{
                fillColor: '#EF4444',
                fillOpacity: 0.1,
                strokeColor: '#EF4444',
                strokeWeight: 2,
                strokePattern: [10, 5]
              }}
            />
          </>
        )}

        {/* İlan Markerları */}
        {filteredListings.map((listing) => {
          if (!listing.position) {
            console.warn('⚠️ Listing position yok:', listing.id, listing.title);
            return null;
          }
          
          const isSelected = selectedListing?.id === listing.id;
          const position = Array.isArray(listing.position)
            ? { lat: listing.position[0], lng: listing.position[1] }
            : listing.position;

          const markerIcon = createMarkerIcon(listing.category, isSelected);
          console.log('📍 Marker oluşturuluyor:', {
            id: listing.id,
            title: listing.title,
            position,
            category: listing.category,
            icon: markerIcon ? 'VAR' : 'YOK'
          });

          return (
            <Marker
              key={listing.id}
              position={position}
              icon={markerIcon}
              onClick={() => handleMarkerClick(listing)}
              title={listing.title}
            />
          );
        })}
      </GoogleMap>

      {/* Konum Bulma Butonu */}
      <div className="absolute top-2 right-5 z-[100]">
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    name: 'My Location',
                  };
                  setUserPosition({ lat: newLocation.lat, lng: newLocation.lng });
                  if (onLocationChange) {
                    onLocationChange(newLocation);
                  }
                  if (map) {
                    map.panTo({ lat: newLocation.lat, lng: newLocation.lng });
                    map.setZoom(14);
                  }
                },
                (error) => {
                  console.error('Konum alınamadı:', error);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );
            }
          }}
          className="py-2 px-3 rounded-lg shadow-lg transition-all bg-white text-red-600 hover:bg-red-50 border border-red-200 flex items-center gap-2"
          title="Konum Bul"
        >
          <MapPin size={16} className="text-red-600 fill-red-600" />
          <span className="text-sm font-medium">Konum Bul</span>
        </button>
      </div>

      {/* Street View Modal */}
      <StreetViewModal
        isOpen={streetViewOpen}
        onClose={() => setStreetViewOpen(false)}
        position={streetViewPosition}
        listingTitle={streetViewTitle}
      />
    </div>
  );
};

export default GoogleMapContainerComponent;

