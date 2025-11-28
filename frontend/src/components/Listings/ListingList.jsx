import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Bed, Bath, Calendar, GripVertical, Save, Eye, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useToast } from '@/context/ToastContext';
import { getCategoryEmoji, formatPrice } from '@/utils/helpers';
import { getListingReservation } from '@/services/api';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Item Component
const SortableListingItem = ({ listing, onListingClick, isDragging, onViewListing, isReserved }) => {
  const { t } = useLanguage();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: itemIsDragging,
  } = useSortable({ id: listing.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: itemIsDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => onListingClick && onListingClick(listing)}
        className={`hover:bg-blue-50 cursor-pointer transition-colors border-b ${
          isReserved 
            ? 'border-red-200 animate-reserved-blink' 
            : 'border-gray-100'
        } ${isReserved ? 'bg-red-100' : 'bg-white'}`}
        style={{ padding: 'clamp(0.375rem, 0.6vw, 0.5rem)' }}
      >
        <div 
          className="flex"
          style={{ gap: 'clamp(0.375rem, 0.6vw, 0.5rem)' }}
        >
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 flex items-center cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical size={14} style={{ width: 'clamp(0.75rem, 1vw, 0.875rem)', height: 'clamp(0.75rem, 1vw, 0.875rem)' }} />
          </div>

          {/* Image - Responsive boyut */}
          <div className="flex-shrink-0">
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                className="w-[3rem] h-[3rem] min-w-[3rem] min-h-[3rem] max-w-[3rem] max-h-[3rem] object-cover rounded"
                style={{ 
                  width: 'clamp(2.5rem, 4vw, 3rem)',
                  height: 'clamp(2.5rem, 4vw, 3rem)',
                  minWidth: '2.5rem',
                  minHeight: '2.5rem',
                  maxWidth: '3rem',
                  maxHeight: '3rem'
                }}
                onError={(e) => {
                  e.target.src = `https://placehold.co/48x48/3B82F6/white?text=${getCategoryEmoji(listing.category)}`;
                }}
              />
            ) : (
              <div 
                className="bg-gray-200 rounded flex items-center justify-center"
                style={{ 
                  width: 'clamp(2.5rem, 4vw, 3rem)',
                  height: 'clamp(2.5rem, 4vw, 3rem)',
                  minWidth: '2.5rem',
                  minHeight: '2.5rem'
                }}
              >
                <span className="text-base" style={{ fontSize: 'clamp(0.875rem, 1.2vw, 1rem)' }}>{getCategoryEmoji(listing.category)}</span>
              </div>
            )}
          </div>
          
          {/* Content - Responsive, daha okunabilir */}
          <div className="flex-1 min-w-0">
            <h3 
              className="font-semibold text-gray-800 line-clamp-1 mb-1"
              style={{ fontSize: 'clamp(0.625rem, 0.9vw, 0.75rem)' }}
            >
              {getCategoryEmoji(listing.category)} {listing.title}
            </h3>
            
            <div className="flex items-center gap-1 mb-1">
              <div 
                className="flex items-center gap-1 text-red-600 font-bold"
                style={{ fontSize: 'clamp(0.625rem, 0.9vw, 0.75rem)' }}
              >
                <DollarSign size={12} style={{ width: 'clamp(0.625rem, 0.9vw, 0.75rem)', height: 'clamp(0.625rem, 0.9vw, 0.75rem)' }} />
                <span>
                  {formatPrice(listing.price)}
                  {listing.category === 'housing' && <span className="font-normal" style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}>/mo</span>}
                </span>
              </div>
            </div>
            
            {/* Details - Responsive */}
            {listing.category === 'housing' && (
              <div 
                className="flex items-center gap-2 text-gray-600 mt-1"
                style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}
              >
                <span className="flex items-center gap-1">
                  <Bed size={10} style={{ width: 'clamp(0.5rem, 0.7vw, 0.625rem)', height: 'clamp(0.5rem, 0.7vw, 0.625rem)' }} />
                  {listing.bedrooms === 0 ? 'Studio' : `${listing.bedrooms}B`}
                </span>
                <span className="flex items-center gap-1">
                  <Bath size={10} style={{ width: 'clamp(0.5rem, 0.7vw, 0.625rem)', height: 'clamp(0.5rem, 0.7vw, 0.625rem)' }} />
                  {listing.bathrooms}B
                </span>
                <span>📐 {listing.sqft} sqft</span>
              </div>
            )}
            
            {listing.category === 'vehicle' && (
              <div 
                className="flex items-center gap-2 text-gray-600 mt-1"
                style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}
              >
                <span>📅 {listing.year}</span>
                <span>🛣️ {(listing.mileage/1000).toFixed(0)}k km</span>
              </div>
            )}
            
            {/* Address - Responsive */}
            <div 
              className="flex items-center gap-1 text-gray-500 mt-1"
              style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}
            >
              <MapPin size={10} style={{ width: 'clamp(0.5rem, 0.7vw, 0.625rem)', height: 'clamp(0.5rem, 0.7vw, 0.625rem)' }} />
              <span className="truncate">{listing.address}</span>
            </div>
          </div>
          
          {/* İlanı Gör Butonu - Responsive */}
          <div className="flex-shrink-0 flex items-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onViewListing) {
                  onViewListing(listing);
                }
              }}
              className="bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors flex items-center justify-center"
              style={{ 
                padding: 'clamp(0.25rem, 0.4vw, 0.375rem)',
                minWidth: 'clamp(1.75rem, 3vw, 2rem)',
                minHeight: 'clamp(1.75rem, 3vw, 2rem)'
              }}
              title="İlanı Gör"
            >
              <Eye size={12} style={{ width: 'clamp(0.625rem, 0.9vw, 0.75rem)', height: 'clamp(0.625rem, 0.9vw, 0.75rem)' }} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const ListingList = ({ listings, selectedCategory, onListingClick, onListingsChange, onViewListing }) => {
  const { t } = useLanguage();
  const [activeId, setActiveId] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const saveTimeoutRef = useRef(null);
  const [reservations, setReservations] = useState({});

  // Örnek ilanlar (gerçekte API'den gelecek) - Artık kullanılmıyor, listings prop'u kullanılıyor
  const defaultListings = [
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
      created_at: '2024-01-15',
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
      created_at: '2024-01-14',
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
      created_at: '2024-01-13',
    },
    {
      id: 4,
      category: 'buysell',
      title: 'IKEA Sectional Sofa - Like New',
      price: 450,
      position: [49.2790, -123.1300],
      image: 'https://placehold.co/300x200/F97316/white?text=Sofa',
      address: '321 Elm Rd, Vancouver, BC',
      created_at: '2024-01-12',
    },
  ];

  // listings prop'unu direkt kullan, sadece drag & drop için sıralama tut
  const [listingOrder, setListingOrder] = useState(() => {
    const savedOrder = localStorage.getItem('listings_order');
    return savedOrder ? JSON.parse(savedOrder) : null;
  });

  // Rezervasyon bilgilerini yükle
  useEffect(() => {
    const loadReservations = async () => {
      if (!listings || listings.length === 0) return;
      
      const reservationMap = {};
      await Promise.all(
        listings.map(async (listing) => {
          try {
            const reservation = await getListingReservation(listing.id);
            if (reservation && reservation.isReserved) {
              // End time kontrolü - eğer geçmişteyse rezervasyon geçersiz
              if (reservation.endTime) {
                const endTime = new Date(reservation.endTime);
                const now = new Date();
                if (endTime > now) {
                  reservationMap[listing.id] = true;
                }
              }
            }
          } catch (err) {
            // Rezervasyon yoksa hata verme
            console.error(`Rezervasyon kontrolü hatası (${listing.id}):`, err);
          }
        })
      );
      setReservations(reservationMap);
    };

    loadReservations();
    
    // Her 5 saniyede bir rezervasyonları kontrol et
    const interval = setInterval(loadReservations, 5000);
    return () => clearInterval(interval);
  }, [listings]);

  // listings prop'u değiştiğinde sıralamayı sıfırla (yeni ilanlar geldiğinde)
  useEffect(() => {
    if (listings && listings.length > 0) {
      // Sadece ilk yüklemede veya yeni ilanlar geldiğinde sıralamayı sıfırla
      const currentIds = listings.map(l => l.id).join(',');
      const savedIds = listingOrder ? listingOrder.join(',') : '';
      
      // Eğer ID'ler değiştiyse sıralamayı sıfırla
      if (currentIds !== savedIds && listingOrder) {
        setListingOrder(null);
        localStorage.removeItem('listings_order');
      }
    }
  }, [listings?.length]); // Sadece uzunluk değiştiğinde kontrol et

  // Filtrelenmiş ve sıralanmış ilanlar
  // Not: listings prop'u zaten MapContainer'dan filtrelenmiş geliyor (kategori + yarıçap)
  const filteredListings = React.useMemo(() => {
    if (!listings || listings.length === 0) {
      return [];
    }

    // listings zaten filtrelenmiş geliyor, sadece sıralama uygula
    let filtered = listings;

    // Eğer sıralama varsa uygula
    if (listingOrder && listingOrder.length > 0) {
      const ordered = [];
      const unordered = [];

      // Sıralı olanları ekle
      listingOrder.forEach(id => {
        const listing = filtered.find(l => l.id === id);
        if (listing) {
          ordered.push(listing);
        }
      });

      // Sıralanmamış olanları ekle
      filtered.forEach(listing => {
        if (!listingOrder.includes(listing.id)) {
          unordered.push(listing);
        }
      });

      return [...ordered, ...unordered];
    }

    return filtered;
  }, [listings, listingOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && filteredListings.length > 0) {
      const oldIndex = filteredListings.findIndex((item) => item.id === active.id);
      const newIndex = filteredListings.findIndex((item) => item.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(filteredListings, oldIndex, newIndex).map(l => l.id);
        setListingOrder(newOrder);
        setHasChanges(true);
      }
    }

    setActiveId(null);
  };

  // Otomatik kaydetme - 2 saniye sonra
  useEffect(() => {
    if (hasChanges) {
      // Önceki timeout'u temizle
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // 2 saniye sonra otomatik kaydet
      saveTimeoutRef.current = setTimeout(() => {
        // LocalStorage'a kaydet
        if (listingOrder) {
          localStorage.setItem('listings_order', JSON.stringify(listingOrder));
        }
        
        // API'ye kaydet (isteğe bağlı)
        if (onListingsChange && filteredListings.length > 0) {
          // Sıralanmış listeyi gönder
          const orderedListings = listingOrder 
            ? listingOrder.map(id => filteredListings.find(l => l.id === id)).filter(Boolean)
            : filteredListings;
          onListingsChange(orderedListings);
        }
        setHasChanges(false);
        console.log('✅ Sıralama otomatik kaydedildi');
      }, 2000);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasChanges, listingOrder, filteredListings, onListingsChange]);

  // Manuel kaydet butonu
  const handleSave = () => {
    // Timeout'u iptal et
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // LocalStorage'a kaydet
    if (listingOrder) {
      localStorage.setItem('listings_order', JSON.stringify(listingOrder));
    }
    
    // API'ye kaydet (isteğe bağlı)
    if (onListingsChange && filteredListings.length > 0) {
      // Sıralanmış listeyi gönder
      const orderedListings = listingOrder 
        ? listingOrder.map(id => filteredListings.find(l => l.id === id)).filter(Boolean)
        : filteredListings;
      onListingsChange(orderedListings);
    }
    setHasChanges(false);
    
    // Başarı mesajı göster
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-[9999] flex items-center gap-2 animate-slide-in';
    toast.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
      </svg>
      <span class="font-semibold">Değişiklikler kaydedildi!</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  };

  if (filteredListings.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-2">📭</p>
          <p>No listings found</p>
        </div>
      </div>
    );
  }

  const activeListing = filteredListings.find((l) => l.id === activeId);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header with Save Button - Responsive */}
      <div 
        className="border-b bg-gray-50 sticky top-0 z-10 flex items-center justify-between"
        style={{ padding: 'clamp(0.5rem, 0.8vw, 0.625rem)' }}
      >
        <div>
          <h2 
            className="font-bold text-gray-800"
            style={{ fontSize: 'clamp(0.75rem, 1.1vw, 0.875rem)' }}
          >
            {t('listingsInArea')}: {filteredListings.length}
          </h2>
          <p 
            className="text-gray-500"
            style={{ fontSize: 'clamp(0.5rem, 0.7vw, 0.625rem)' }}
          >
            Active listings
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors shadow-md"
            style={{ 
              padding: 'clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)',
              fontSize: 'clamp(0.625rem, 0.9vw, 0.75rem)'
            }}
          >
            <Save size={14} style={{ width: 'clamp(0.75rem, 1vw, 0.875rem)', height: 'clamp(0.75rem, 1vw, 0.875rem)' }} />
            Kaydet
          </button>
        )}
      </div>
      
      {/* Draggable List */}
      <div className="flex-1 overflow-y-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredListings.map((l) => l.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="divide-y">
              {filteredListings.map((listing) => (
                <SortableListingItem
                  key={listing.id}
                  listing={listing}
                  onListingClick={onListingClick}
                  onViewListing={onViewListing}
                  isReserved={reservations[listing.id] || false}
                />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeListing ? (
              <div className="p-2 bg-blue-100 border-2 border-blue-500 rounded-lg shadow-lg opacity-90">
                <div className="flex gap-2">
                  <div className="flex-shrink-0">
                    <img
                      src={activeListing.image}
                      alt={activeListing.title}
                      className="object-cover rounded"
                      style={{ 
                        width: 'clamp(2.5rem, 4vw, 3rem)',
                        height: 'clamp(2.5rem, 4vw, 3rem)'
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="font-semibold text-gray-800"
                      style={{ fontSize: 'clamp(0.625rem, 0.9vw, 0.75rem)' }}
                    >
                      {getCategoryEmoji(activeListing.category)} {activeListing.title}
                    </h3>
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
};

export default ListingList;
