import React, { useState, useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getCategoryColor, getCategoryEmoji, calculateDistance } from '@/utils/helpers';
import { getListingReservation } from '@/services/api';

// Kategori bazlı marker ikonları
const createPulsingIcon = (category, isSelected = false, isReserved = false) => {
  const color = isReserved ? '#FCD34D' : getCategoryColor(category); // Rezerve edilmişse sarı
  const emoji = getCategoryEmoji(category);
  const borderColor = isSelected ? '#FFD700' : isReserved ? '#F59E0B' : 'white';
  const borderWidth = isSelected ? 4 : isReserved ? 4 : 3;
  const scale = isSelected ? 1.2 : isReserved ? 1.1 : 1;
  
  return L.divIcon({
    className: `custom-pulsing-marker ${isSelected ? 'selected-marker' : ''}`,
    html: `
      <div class="marker-container" style="position: relative; transform: scale(${scale});">
        <div class="pulse-ring" style="
          position: absolute;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: ${color};
          opacity: 0.3;
          animation: pulse 2s infinite;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        "></div>
        <div class="marker-pin" style="
          position: relative;
          width: 40px;
          height: 40px;
          background: ${color};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          border: ${borderWidth}px solid ${borderColor};
        ">
          <span style="
            transform: rotate(45deg);
            font-size: 18px;
          ">${emoji}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Kullanıcı konum marker'ı
const userLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #EF4444;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      position: relative;
    ">
      <div style="
        position: absolute;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.2);
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        animation: pulse 2s infinite;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Haritayı kullanıcı konumuna zoom yapan component
const LocationHandler = ({ position, radiusKm, selectedListing }) => {
  const map = useMap();
  
  useEffect(() => {
    // Eğer bir ilan seçildiyse, o ilana zoom yap
    if (selectedListing && selectedListing.position) {
      map.flyTo(selectedListing.position, 16, { duration: 1 });
      return;
    }
    
    // Değilse kullanıcı konumuna zoom yap
    if (position && Array.isArray(position) && position.length === 2) {
      // Radius'a göre zoom seviyesi ayarla
      const zoomLevel = radiusKm <= 2 ? 14 : radiusKm <= 5 ? 13 : radiusKm <= 10 ? 12 : 11;
      // Kullanıcı konumuna kesinlikle git
      map.flyTo(position, zoomLevel, { duration: 1.5 });
    }
  }, [position, map, radiusKm, selectedListing]);
  
  return null;
};

// Haritada tıklama yakalayan component
const MapClickHandler = ({ isSelectingLocation, onLocationSelect, onCancel }) => {
  useMapEvents({
    click: (e) => {
      if (isSelectingLocation) {
        const { lat, lng } = e.latlng;
        onLocationSelect({
          lat,
          lng,
          name: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
        onCancel();
      }
    },
  });
  return null;
};

const MapContainerComponent = ({ listings, selectedCategory, selectedListing, setSelectedListing, filters, radius: radiusKm, userLocation, onLocationChange, onListingsChange, onViewListing }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSelectingLocation, setIsSelectingLocation] = useState(false);
  const [forceLocationUpdate, setForceLocationUpdate] = useState(0);
  const [reservations, setReservations] = useState({});
  const { t } = useLanguage();

  // Radius'u km'den metreye çevir
  const radius = (radiusKm || 2) * 1000; // km to meters

  // Kullanıcı konumunu güncelle
  useEffect(() => {
    if (userLocation) {
      setUserPosition([userLocation.lat, userLocation.lng]);
      setLoading(false);
    } else {
      // Varsayılan: Vancouver, BC
      setUserPosition([49.2827, -123.1207]);
      setLoading(false);
    }
  }, [userLocation]);

  // Konum seçim handler'ı
  const handleLocationSelect = (newLocation) => {
    if (onLocationChange) {
      onLocationChange(newLocation);
    }
  };

  // Örnek ilanlar (her zaman gösterilecek)
  const sampleListings = [
    {
      id: 1,
      category: 'housing',
      title: '2 Bed / 1 Bath Apartment in Downtown',
      price: 2200,
      position: [49.2850, -123.1180],
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
      position: [49.2800, -123.1250],
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
      position: [49.2870, -123.1150],
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
      position: [49.2790, -123.1300],
      image: 'https://placehold.co/300x200/F97316/white?text=Sofa',
      address: '321 Elm Rd, Vancouver, BC',
    },
  ];

  // Kategoriye göre filtrele ve yarıçap kontrolü
  const filteredListings = React.useMemo(() => {
    console.log('🗺️ MapContainer: listings prop:', listings?.length || 0, 'ilan');
    console.log('🗺️ MapContainer: selectedCategory:', selectedCategory);
    console.log('🗺️ MapContainer: userPosition:', userPosition);
    console.log('🗺️ MapContainer: radiusKm:', radiusKm);
    
    // listings prop'u varsa ve boş değilse onu kullan, yoksa sampleListings kullan
    // İlk yüklemede listings boş array olabilir, o zaman sampleListings kullan
    // Ama eğer listings varsa (boş array bile olsa), sampleListings ile birleştir
    let allListings = sampleListings;
    if (listings !== undefined && listings !== null && listings.length > 0) {
      console.log('🗺️ MapContainer: Gerçek ilanlar var, sampleListings ile birleştiriliyor...');
      // Kullanıcının eklediği ilanları sampleListings ile birleştir
      // Aynı ID'ye sahip ilanları önle (kullanıcı ilanları öncelikli)
      const sampleIds = new Set(sampleListings.map(l => l.id));
      const userListings = listings.filter(l => !sampleIds.has(l.id));
      allListings = [...sampleListings, ...userListings];
      console.log('🗺️ MapContainer: Birleştirilmiş ilan sayısı:', allListings.length);
    } else {
      console.log('🗺️ MapContainer: Gerçek ilan yok, sadece sampleListings kullanılıyor');
    }
    
    // Önce kategoriye göre filtrele
    let categoryFiltered = allListings.filter(
      (listing) => listing.category === selectedCategory
    );
    console.log('🗺️ MapContainer: Kategori filtresi sonrası:', categoryFiltered.length, 'ilan');

    // Yarıçap içinde olan ilanları filtrele
    // userPosition ve radiusKm varsa mutlaka filtrele
    if (userPosition && Array.isArray(userPosition) && userPosition.length === 2 && radiusKm) {
      console.log('🗺️ MapContainer: Yarıçap filtresi uygulanıyor - userPosition:', userPosition, 'radiusKm:', radiusKm);
      const radiusFiltered = categoryFiltered.filter((listing) => {
        if (!listing.position || !Array.isArray(listing.position) || listing.position.length !== 2) {
          console.log('🗺️ MapContainer: İlan position eksik:', listing.id, listing.title);
          return false;
        }
        const distance = calculateDistance(
          userPosition[0],
          userPosition[1],
          listing.position[0],
          listing.position[1]
        );
        // Metreyi km'ye çevir ve yarıçap ile karşılaştır
        const distanceKm = distance / 1000;
        const isWithinRadius = distanceKm <= radiusKm;
        if (!isWithinRadius) {
          console.log('🗺️ MapContainer: İlan yarıçap dışında:', listing.id, listing.title, 'mesafe:', distanceKm.toFixed(2), 'km');
        }
        return isWithinRadius;
      });
      
      console.log('🗺️ MapContainer: Yarıçap filtresi sonrası:', radiusFiltered.length, 'ilan');
      console.log('🗺️ MapContainer: Yarıçap içindeki ilanlar:', radiusFiltered.map(l => ({ id: l.id, title: l.title, position: l.position })));
      // Yarıçap filtresini her zaman uygula - boş sonuç olsa bile
      return radiusFiltered;
    }
    
    // Eğer userPosition veya radiusKm yoksa, kategori filtrelenmiş ilanları göster
    console.log('🗺️ MapContainer: Yarıçap filtresi yok, kategori filtrelenmiş ilanlar döndürülüyor');
    return categoryFiltered;
  }, [selectedCategory, userPosition, radiusKm, listings]);

  // Rezervasyon bilgilerini yükle
  useEffect(() => {
    const loadReservations = async () => {
      const reservationMap = {};
      for (const listing of filteredListings) {
        try {
          const reservation = await getListingReservation(listing.id);
          if (reservation && reservation.isReserved) {
            reservationMap[listing.id] = reservation;
          }
        } catch (err) {
          console.error(`Rezervasyon bilgisi yüklenemedi (${listing.id}):`, err);
        }
      }
      setReservations(reservationMap);
    };
    
    if (filteredListings.length > 0) {
      loadReservations();
    }
  }, [filteredListings]);

  // Filtrelenmiş ilanları parent component'e bildir
  // Sadece gerçekten değiştiğinde güncelle
  const prevFilteredListingsRef = React.useRef();
  const onListingsChangeRef = React.useRef(onListingsChange);
  
  // Callback ref'i güncelle
  React.useEffect(() => {
    onListingsChangeRef.current = onListingsChange;
  }, [onListingsChange]);
  
  React.useEffect(() => {
    // Önceki değerle karşılaştır (sadece gerçekten değiştiyse güncelle)
    const prevIds = prevFilteredListingsRef.current?.map(l => l.id).join(',') || '';
    const currentIds = filteredListings.map(l => l.id).join(',');
    
    if (prevIds !== currentIds && onListingsChangeRef.current) {
      prevFilteredListingsRef.current = filteredListings;
      onListingsChangeRef.current([...filteredListings]);
    }
  }, [filteredListings]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Konum Seçim Modu İndikatörü */}
      {isSelectingLocation && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <span>📍</span>
          <span className="font-semibold">Haritada bir nokta seçin</span>
          <button
            onClick={() => setIsSelectingLocation(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}

      <LeafletMap
        center={userPosition || [49.2827, -123.1207]}
        zoom={14}
        className="w-full h-full z-0"
        style={{ cursor: isSelectingLocation ? 'crosshair' : 'default' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LocationHandler 
          position={userPosition} 
          radiusKm={radiusKm || 2} 
          selectedListing={selectedListing}
          key={userPosition ? `${userPosition[0]}-${userPosition[1]}-${forceLocationUpdate}` : 'default'}
        />

        <MapClickHandler
          isSelectingLocation={isSelectingLocation}
          onLocationSelect={handleLocationSelect}
          onCancel={() => setIsSelectingLocation(false)}
        />
        
        {/* Kullanıcı Konumu */}
        {userPosition && (
          <>
            <Marker position={userPosition} icon={userLocationIcon}>
              <Popup>
                <div className="text-center">
                  <p className="font-semibold">📍 {t('yourLocation')}</p>
                </div>
              </Popup>
            </Marker>
            
            {/* Yarıçap Dairesi */}
            <Circle
              center={userPosition}
              radius={radius}
              pathOptions={{
                color: '#EF4444',
                fillColor: '#EF4444',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '10, 5',
              }}
            />
          </>
        )}
        
        {/* İlan Markerları */}
        {filteredListings.map((listing) => {
          const isSelected = selectedListing?.id === listing.id;
          const reservation = reservations[listing.id];
          const isReserved = reservation && reservation.isReserved;
          return (
            <Marker
              key={listing.id}
              position={listing.position}
              icon={createPulsingIcon(listing.category, isSelected, isReserved)}
              eventHandlers={{
                click: () => setSelectedListing(listing),
              }}
            >
            <Popup>
              <div className="w-32">
                {isReserved && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded p-1 mb-1 text-[10px] text-yellow-800">
                    <p className="font-semibold mb-0.5">
                      ⚠️ {(() => {
                        const text = 'Rezerve Edildi';
                        return text.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                      })()}
                    </p>
                    <p className="text-[9px]">
                      {(() => {
                        const name = reservation.reservedByName || 'Kullanıcı';
                        return name.split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                        ).join(' ');
                      })()} İçin Rezerve Edildi
                    </p>
                    {reservation.endTime && (
                      <p className="text-[9px] mt-0.5">
                        Bitiş: {new Date(reservation.endTime).toLocaleString('tr-TR', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    )}
                  </div>
                )}
                <img
                  src={listing.image}
                  alt={listing.title}
                  className="w-full h-16 object-cover rounded-t-lg"
                />
                <div className="p-1.5">
                  <h3 className="font-semibold text-gray-800 mb-0.5 text-xs line-clamp-1">{listing.title}</h3>
                  <p className="text-sm font-bold text-red-600">
                    ${listing.price.toLocaleString()}
                    {listing.category === 'housing' && <span className="text-xs font-normal">/mo</span>}
                  </p>
                  
                  {listing.category === 'housing' && (
                    <div className="flex gap-1 mt-1 text-[10px] text-gray-600">
                      <span>🛏️ {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}B`}</span>
                      <span>🚿 {listing.bathrooms}B</span>
                      <span>📐 {listing.sqft}</span>
                    </div>
                  )}
                  
                  {listing.category === 'vehicle' && (
                    <div className="flex gap-1 mt-1 text-[10px] text-gray-600">
                      <span>📅 {listing.year}</span>
                      <span>🛣️ {listing.mileage ? (listing.mileage/1000).toFixed(0) + 'k' : ''}</span>
                    </div>
                  )}
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewListing) {
                        onViewListing(listing);
                      }
                    }}
                    className="w-full mt-1.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 transition-colors"
                  >
                    {t('viewListing')}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
          );
        })}
      </LeafletMap>
      

      {/* Konum Seç ve Konum Bulma Butonları */}
      <div className="absolute top-2 right-5 z-[100] flex flex-col gap-2 items-center">
        <button
          onClick={() => setIsSelectingLocation(!isSelectingLocation)}
          className={`px-3 py-1.5 rounded-lg shadow-lg text-sm font-semibold transition-all ${
            isSelectingLocation
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          {isSelectingLocation ? '✕ İptal' : '📍 Konum Seç'}
        </button>
        
        <button
          onClick={() => {
            if (navigator.geolocation) {
              // Önce selectedListing'i temizle ki LocationHandler kullanıcı konumuna gitsin
              if (setSelectedListing) {
                setSelectedListing(null);
              }
              
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    name: 'My Location',
                  };
                  // Önce userPosition'ı güncelle (harita hemen güncellenecek)
                  const newPosition = [newLocation.lat, newLocation.lng];
                  setUserPosition(newPosition);
                  
                  // Force update için state'i değiştir
                  setForceLocationUpdate(prev => prev + 1);
                  
                  // Sonra parent component'e bildir
                  if (onLocationChange) {
                    onLocationChange(newLocation);
                  }
                },
                (error) => {
                  console.error('Konum alınamadı:', error);
                  // Toast notification will be handled by the component that uses this
                },
                {
                  enableHighAccuracy: true,
                  timeout: 10000,
                  maximumAge: 0
                }
              );
            } else {
              // Toast notification will be handled by the component that uses this
            }
          }}
          className="py-1 px-0.5 rounded-lg shadow-lg transition-all bg-white text-red-600 hover:bg-red-50 border border-red-200 flex items-center justify-center"
          title="Konum Bul"
        >
          <MapPin size={14} className="text-red-600 fill-red-600" />
        </button>
      </div>
    </div>
  );
};

export default MapContainerComponent;

