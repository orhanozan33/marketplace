import React, { useState, useEffect, useCallback, useRef } from 'react';
import TopBar from './TopBar';
import MapContainer from '@/components/Map/MapContainer';
import ResizableListingList from './ResizableListingList';
import ResizableFiltersPanel from './ResizableFiltersPanel';
import UserDashboard from '@/components/Dashboard/UserDashboard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { fetchListings, createListing as createListingAPI, sendMessage, getMessages, deleteMessage, getUserById, getUserRatings, createUserRating, getUserComments, createUserComment, getListingReservation } from '@/services/api';
import { X, MessageSquare, Send, MapPin, DollarSign, ChevronLeft, ChevronRight, Trash2, Star, Map, Navigation, Phone, GripVertical, GripHorizontal } from 'lucide-react';

// Posta kodundan şehir bilgisini çıkar
const getCityFromPostalCode = (postalCode) => {
  if (!postalCode) return null;
  
  // Posta kodunu temizle (sadece rakamları al)
  const code = postalCode.toString().replace(/\D/g, '');
  if (code.length < 2) return null;
  
  // İlk 2 rakamı al
  const firstTwo = parseInt(code.substring(0, 2));
  
  // Türkiye posta kodu şehir mapping (ilk 2 rakam)
  const cityMap = {
    1: 'Adana', 2: 'Adıyaman', 3: 'Afyonkarahisar', 4: 'Ağrı', 5: 'Amasya',
    6: 'Ankara', 7: 'Antalya', 8: 'Artvin', 9: 'Aydın', 10: 'Balıkesir',
    11: 'Bilecik', 12: 'Bingöl', 13: 'Bitlis', 14: 'Bolu', 15: 'Burdur',
    16: 'Bursa', 17: 'Çanakkale', 18: 'Çankırı', 19: 'Çorum', 20: 'Denizli',
    21: 'Diyarbakır', 22: 'Edirne', 23: 'Elazığ', 24: 'Erzincan', 25: 'Erzurum',
    26: 'Eskişehir', 27: 'Gaziantep', 28: 'Giresun', 29: 'Gümüşhane', 30: 'Hakkari',
    31: 'Hatay', 32: 'Isparta', 33: 'Mersin', 34: 'İstanbul', 35: 'İzmir',
    36: 'Kars', 37: 'Kastamonu', 38: 'Kayseri', 39: 'Kırklareli', 40: 'Kırşehir',
    41: 'Kocaeli', 42: 'Konya', 43: 'Kütahya', 44: 'Malatya', 45: 'Manisa',
    46: 'Kahramanmaraş', 47: 'Mardin', 48: 'Muğla', 49: 'Muş', 50: 'Nevşehir',
    51: 'Niğde', 52: 'Ordu', 53: 'Rize', 54: 'Sakarya', 55: 'Samsun',
    56: 'Siirt', 57: 'Sinop', 58: 'Sivas', 59: 'Tekirdağ', 60: 'Tokat',
    61: 'Trabzon', 62: 'Tunceli', 63: 'Şanlıurfa', 64: 'Uşak', 65: 'Van',
    66: 'Yozgat', 67: 'Zonguldak', 68: 'Aksaray', 69: 'Bayburt', 70: 'Karaman',
    71: 'Kırıkkale', 72: 'Batman', 73: 'Şırnak', 74: 'Bartın', 75: 'Ardahan',
    76: 'Iğdır', 77: 'Yalova', 78: 'Karabük', 79: 'Kilis', 80: 'Osmaniye',
    81: 'Düzce'
  };
  
  return cityMap[firstTwo] || null;
};

const MainLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const { success, error: showError } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('housing');
  const [filters, setFilters] = useState({});
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]); // MapContainer'dan gelen filtrelenmiş ilanlar
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewListingDetail, setViewListingDetail] = useState(null);
  const [viewListingMessages, setViewListingMessages] = useState([]);
  const [viewListingMessageText, setViewListingMessageText] = useState('');
  const [viewListingLoading, setViewListingLoading] = useState(false);
  const [viewListingImageIndex, setViewListingImageIndex] = useState(0);
  const [radius, setRadius] = useState(2); // km
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewedUserProfile, setViewedUserProfile] = useState(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState('');
  const [listingUserPostalCode, setListingUserPostalCode] = useState(null);
  const [userComments, setUserComments] = useState([]); // Kullanıcı yorumları
  const [showRatingNotification, setShowRatingNotification] = useState(false); // Puan bildirimi
  const [showProfileImageModal, setShowProfileImageModal] = useState(false); // Profil resmi büyük görünüm
  const [listingReservationStatus, setListingReservationStatus] = useState(null); // İlan rezervasyon durumu
  const [reservationCountdown, setReservationCountdown] = useState(null); // Rezervasyon geri sayım
  
  // Profil alanı boyutlandırma state'leri
  const [contactAreaWidth, setContactAreaWidth] = useState(() => {
    const saved = localStorage.getItem('contact_area_width');
    return saved ? parseInt(saved) : null;
  });
  const [contactAreaHeight, setContactAreaHeight] = useState(() => {
    const saved = localStorage.getItem('contact_area_height');
    return saved ? parseInt(saved) : null;
  });
  const [isResizingContact, setIsResizingContact] = useState(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const contactAreaRef = useRef(null);

  // Durum bilgisi kutusu manuel düzenleme state'leri
  const [isEditingStatusBox, setIsEditingStatusBox] = useState(false);
  const [statusBoxPosition, setStatusBoxPosition] = useState(() => {
    const saved = localStorage.getItem('status_box_position');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { left: 200, top: 50 };
      }
    }
    return { left: 200, top: 50 };
  });
  const [statusBoxSize, setStatusBoxSize] = useState(() => {
    const saved = localStorage.getItem('status_box_size');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return { width: 258.048, height: 64 };
      }
    }
    return { width: 258.048, height: 64 };
  });
  const [isDraggingStatusBox, setIsDraggingStatusBox] = useState(false);
  const [isResizingStatusBox, setIsResizingStatusBox] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartPosStatusBox, setResizeStartPosStatusBox] = useState({ x: 0, y: 0 });
  const [resizeStartSizeStatusBox, setResizeStartSizeStatusBox] = useState({ width: 0, height: 0 });
  const statusBoxRef = useRef(null);

  // LocalStorage'a kaydetme artık gerekli değil - tüm veriler backend'de

  // Backend'den ilanları yükle
  useEffect(() => {
    const loadListings = async () => {
      setLoading(true);
      try {
        console.log('📋 MainLayout: İlanlar yükleniyor...');
        const listings = await fetchListings();
        console.log('📋 MainLayout: Backend\'den gelen ilan sayısı:', listings?.length || 0);
        if (listings && listings.length > 0) {
          console.log('📋 MainLayout: İlk 3 ilan:', listings.slice(0, 3).map(l => ({ id: l.id, title: l.title, category: l.category, position: l.position })));
          console.log('📋 MainLayout: Tüm ilanlar:', listings.map(l => ({ id: l.id, title: l.title, category: l.category, position: l.position })));
        } else {
          console.warn('⚠️ MainLayout: Backend\'den hiç ilan gelmedi!');
        }
        console.log('✅ MainLayout: allListings state güncelleniyor:', (listings || []).length, 'ilan');
        setAllListings(listings || []);
        console.log('✅ MainLayout: setAllListings çağrıldı');
      } catch (error) {
        console.error('❌ MainLayout: İlanlar yüklenirken hata:', error);
        // Hata durumunda boş array
        setAllListings([]);
      } finally {
        setLoading(false);
      }
    };

    loadListings();

    // Her 10 saniyede bir yenile (yeni ilanlar için)
    const interval = setInterval(() => {
      loadListings();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Kullanıcı konumunu al - localStorage'dan oku veya geolocation'dan al
  useEffect(() => {
    // Önce localStorage'dan kontrol et
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        return; // Kaydedilmiş konum varsa geolocation'a gerek yok
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
    
    // localStorage'da yoksa geolocation'dan al
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            name: 'My Location',
          };
          setUserLocation(location);
          // localStorage'a kaydet
          localStorage.setItem('userLocation', JSON.stringify(location));
        },
        (error) => {
          console.error('Konum alınamadı:', error);
          // Varsayılan: Vancouver
          const defaultLocation = {
            lat: 49.2827,
            lng: -123.1207,
            name: 'Vancouver, BC',
          };
          setUserLocation(defaultLocation);
          localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
        }
      );
    } else {
      // Varsayılan: Vancouver
      const defaultLocation = {
        lat: 49.2827,
        lng: -123.1207,
        name: 'Vancouver, BC',
      };
      setUserLocation(defaultLocation);
      localStorage.setItem('userLocation', JSON.stringify(defaultLocation));
    }
  }, []);

  const handleListingClick = (listing) => {
    // İlan seçildiğinde giriş kontrolü yap
    // Mesaj göndermek için giriş yapılması gerekiyor
    setSelectedListing(listing);
    // Haritada ilgili marker'a zoom yapılacak
    // UserDashboard'da giriş kontrolü yapılacak
  };

  const handleLocationChange = (newLocation) => {
    setUserLocation(newLocation);
    // localStorage'a kaydet
    if (newLocation) {
      localStorage.setItem('userLocation', JSON.stringify(newLocation));
    }
  };

  const handleListingCreated = async (newListing) => {
    try {
      // Backend'e kaydet
      const savedListing = await createListingAPI({
        ...newListing,
        city: filters.city || '',
        province: filters.province || '',
      });

      if (savedListing) {
        // Başarılı kayıt sonrası tüm ilanları yeniden yükle
        const listings = await fetchListings();
        setAllListings(listings);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      // Toast notification will be handled by the component that uses this
    }
  };

  const handleFilteredListingsChange = useCallback((listings) => {
    // MapContainer'dan gelen filtrelenmiş ilanları güncelle
    setFilteredListings(listings);
  }, []);

  const handleSearch = (searchFilters) => {
    // Arama işlemi - filtreler zaten state'te, sadece tetikleme için
    // MapContainer otomatik olarak filtreleri kullanıyor
    console.log('Arama yapılıyor:', searchFilters);
  };

  // İletişim alanı resize handler'ları
  const handleContactResizeStart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (contactAreaRef.current) {
      const rect = contactAreaRef.current.getBoundingClientRect();
      setResizeStartPos({ x: e.clientX, y: e.clientY });
      setResizeStartSize({ 
        width: contactAreaWidth || rect.width, 
        height: contactAreaHeight || rect.height 
      });
      setIsResizingContact(true);
    }
  };

  // Resize işlemi
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingContact) return;
      
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      const newWidth = resizeStartSize.width + deltaX;
      const newHeight = resizeStartSize.height + deltaY;
      
      // Minimum ve maksimum boyutlar
      if (newWidth >= 200 && newWidth <= 800) {
        setContactAreaWidth(newWidth);
        localStorage.setItem('contact_area_width', newWidth.toString());
      }
      if (newHeight >= 100 && newHeight <= 600) {
        setContactAreaHeight(newHeight);
        localStorage.setItem('contact_area_height', newHeight.toString());
      }
    };

    const handleMouseUp = () => {
      setIsResizingContact(false);
    };

    if (isResizingContact) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizingContact, resizeStartPos, resizeStartSize]);

  // İlan rezervasyon durumunu kontrol et
  useEffect(() => {
    const checkReservation = async () => {
      if (viewListingDetail?.id) {
        try {
          const reservation = await getListingReservation(viewListingDetail.id);
          if (reservation && reservation.isReserved && new Date(reservation.endTime) > new Date() && !reservation.cancelled) {
            setListingReservationStatus({
              isReserved: true,
              reservedBy: reservation.reservedByName || 'Kullanıcı',
              endTime: reservation.endTime
            });
          } else {
            // Aktif mi kontrol et (satılmamış ve rezerve değilse aktif)
            const isSold = viewListingDetail.isSold === true || viewListingDetail.isSold === 'true' || viewListingDetail.isSold === 1;
            setListingReservationStatus({
              isReserved: false,
              isActive: !isSold
            });
            setReservationCountdown(null);
          }
        } catch (err) {
          // Rezervasyon yoksa aktif olabilir
          const isSold = viewListingDetail.isSold === true || viewListingDetail.isSold === 'true' || viewListingDetail.isSold === 1;
          setListingReservationStatus({
            isReserved: false,
            isActive: !isSold
          });
          setReservationCountdown(null);
        }
      } else {
        setListingReservationStatus(null);
        setReservationCountdown(null);
      }
    };
    checkReservation();
  }, [viewListingDetail]);

  // Rezervasyon geri sayım sayacı
  useEffect(() => {
    if (listingReservationStatus?.isReserved && listingReservationStatus?.endTime) {
      const updateCountdown = () => {
        const now = new Date();
        const endTime = new Date(listingReservationStatus.endTime);
        const diff = endTime - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setReservationCountdown({ hours, minutes, seconds });
        } else {
          // Süre doldu, aktif olarak işaretle
          setListingReservationStatus({
            isReserved: false,
            isActive: true
          });
          setReservationCountdown(null);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    } else {
      setReservationCountdown(null);
    }
  }, [listingReservationStatus]);

  // İlan detayı değiştiğinde mesajları yükle
  useEffect(() => {
    const loadMessages = async () => {
      if (viewListingDetail && isAuthenticated && user && viewListingDetail.userId !== user.id) {
        try {
          console.log('💬 useEffect: Mesajlar yükleniyor...', { 
            listingId: viewListingDetail.id, 
            otherUserId: viewListingDetail.userId 
          });
          const msgs = await getMessages(viewListingDetail.id, viewListingDetail.userId);
          console.log('💬 useEffect: Backend\'den gelen mesajlar:', msgs);
          // Mesajları en eski üstte, en yeni altta sırala (normal chat sırası)
          const sortedMsgs = (msgs || []).sort((a, b) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateA - dateB; // En eski üstte, en yeni altta
          });
          console.log('💬 useEffect: Sıralanmış mesajlar:', sortedMsgs);
          setViewListingMessages(sortedMsgs);
        } catch (err) {
          console.error('❌ useEffect: Mesajlar yüklenemedi:', err);
          setViewListingMessages([]);
        }
      } else if (!viewListingDetail) {
        // İlan detayı kapandığında mesajları temizle
        setViewListingMessages([]);
      }
    };

    loadMessages();
  }, [viewListingDetail?.id, viewListingDetail?.userId, isAuthenticated, user?.id]);

  // Durum bilgisi kutusu drag fonksiyonları
  const handleStatusBoxMouseDown = useCallback((e) => {
    if (!isEditingStatusBox) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingStatusBox(true);
    const rect = statusBoxRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStartPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  }, [isEditingStatusBox]);

  const handleStatusBoxResizeMouseDown = useCallback((e) => {
    if (!isEditingStatusBox) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizingStatusBox(true);
    setResizeStartPosStatusBox({ x: e.clientX, y: e.clientY });
    setResizeStartSizeStatusBox({ width: statusBoxSize.width, height: statusBoxSize.height });
  }, [isEditingStatusBox, statusBoxSize]);

  // Durum bilgisi kutusu mouse move ve up event listener'ları
  useEffect(() => {
    if (!isDraggingStatusBox && !isResizingStatusBox) return;

    const handleMouseMove = (e) => {
      if (isDraggingStatusBox && statusBoxRef.current) {
        const parentRect = statusBoxRef.current.parentElement?.getBoundingClientRect();
        if (parentRect) {
          const newLeft = e.clientX - parentRect.left - dragStartPos.x;
          const newTop = e.clientY - parentRect.top - dragStartPos.y;
          setStatusBoxPosition({ left: newLeft, top: newTop });
        }
      } else if (isResizingStatusBox) {
        const deltaX = e.clientX - resizeStartPosStatusBox.x;
        const deltaY = e.clientY - resizeStartPosStatusBox.y;
        const newWidth = Math.max(100, resizeStartSizeStatusBox.width + deltaX);
        const newHeight = Math.max(40, resizeStartSizeStatusBox.height + deltaY);
        setStatusBoxSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingStatusBox(false);
      setIsResizingStatusBox(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingStatusBox, isResizingStatusBox, dragStartPos, resizeStartPosStatusBox, resizeStartSizeStatusBox]);

  // Durum bilgisi kutusu ayarlarını kaydet
  const saveStatusBoxSettings = useCallback(() => {
    // Tüm drag/resize işlemlerini durdur
    setIsDraggingStatusBox(false);
    setIsResizingStatusBox(false);
    
    // Pozisyon ve boyutu kaydet
    localStorage.setItem('status_box_position', JSON.stringify(statusBoxPosition));
    localStorage.setItem('status_box_size', JSON.stringify(statusBoxSize));
    
    // Düzenleme modunu kapat
    setIsEditingStatusBox(false);
    
    success('Durum bilgisi kutusu ayarları kaydedildi!');
  }, [statusBoxPosition, statusBoxSize, success]);

  // Durum bilgisi kutusu ayarlarını sıfırla
  const resetStatusBoxSettings = useCallback(() => {
    // Tüm drag/resize işlemlerini durdur
    setIsDraggingStatusBox(false);
    setIsResizingStatusBox(false);
    
    setStatusBoxPosition({ left: 200, top: 50 });
    setStatusBoxSize({ width: 258.048, height: 64 });
    localStorage.removeItem('status_box_position');
    localStorage.removeItem('status_box_size');
    success('Durum bilgisi kutusu ayarları sıfırlandı!');
  }, [success]);

  // Düzenleme modunu kapat
  const cancelStatusBoxEditing = useCallback(() => {
    // Tüm drag/resize işlemlerini durdur
    setIsDraggingStatusBox(false);
    setIsResizingStatusBox(false);
    
    // Kaydedilmiş pozisyonu geri yükle
    const savedPosition = localStorage.getItem('status_box_position');
    const savedSize = localStorage.getItem('status_box_size');
    
    if (savedPosition) {
      try {
        setStatusBoxPosition(JSON.parse(savedPosition));
      } catch (e) {
        // Hata durumunda varsayılan değerleri kullan
      }
    }
    
    if (savedSize) {
      try {
        setStatusBoxSize(JSON.parse(savedSize));
      } catch (e) {
        // Hata durumunda varsayılan değerleri kullan
      }
    }
    
    // Düzenleme modunu kapat
    setIsEditingStatusBox(false);
  }, []);

  // İlan resimlerini al
  const getListingImages = (listing) => {
    if (!listing) return [];
    
    const allMedia = [];
    
    // images array'i varsa onu kullan
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      allMedia.push(...listing.images.map(img => ({ url: img, type: 'image' })));
    } else if (listing.images && typeof listing.images === 'string') {
      try {
        const parsed = JSON.parse(listing.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allMedia.push(...parsed.map(img => ({ url: img, type: 'image' })));
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    } else if (listing.image) {
      allMedia.push({ url: listing.image, type: 'image' });
    }
    
    // videos array'i varsa onu ekle
    if (listing.videos && Array.isArray(listing.videos) && listing.videos.length > 0) {
      allMedia.push(...listing.videos.map(vid => ({ url: vid, type: 'video' })));
    } else if (listing.videos && typeof listing.videos === 'string') {
      try {
        const parsed = JSON.parse(listing.videos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          allMedia.push(...parsed.map(vid => ({ url: vid, type: 'video' })));
        }
      } catch (e) {
        console.error('Error parsing videos:', e);
      }
    }
    
    return allMedia;
  };

  const handleViewListing = async (listing) => {
    // Kullanıcı bilgilerini backend'den al (eğer gelmemişse)
    let listingWithUserInfo = { ...listing };
    if (listing.userId && (!listing.userDisplayName || !listing.userPhotoURL)) {
      try {
        const userProfile = await getUserById(listing.userId);
        if (userProfile) {
          listingWithUserInfo.userDisplayName = userProfile.displayName || listing.userDisplayName;
          listingWithUserInfo.userPhotoURL = userProfile.photoURL || listing.userPhotoURL;
          // Kullanıcının posta kodunu da kaydet
          if (userProfile.postalCode) {
            setListingUserPostalCode(userProfile.postalCode);
          }
          console.log('👤 Backend\'den kullanıcı profili yüklendi:', {
            displayName: userProfile.displayName,
            photoURL: userProfile.photoURL,
            postalCode: userProfile.postalCode
          });
        }
      } catch (err) {
        console.error('Kullanıcı profili yüklenemedi:', err);
      }
    }
    
    // Details objesini listing'e merge et
    const listingWithDetails = {
      ...listingWithUserInfo,
      ...(listing.details || {})
    };
    console.log('📋 İlan detayı açılıyor:', listingWithDetails);
    console.log('📋 Details objesi:', listing.details);
    console.log('📋 Merge edilmiş veri:', listingWithDetails);
    console.log('📋 listingType:', listingWithDetails.listingType);
    console.log('📋 propertyType:', listingWithDetails.propertyType);
    console.log('📋 petFriendly değeri:', listingWithDetails.petFriendly);
    console.log('📋 furnished değeri:', listingWithDetails.furnished);
    console.log('👤 Kullanıcı bilgileri (listing objesi):', {
      userId: listing.userId,
      userDisplayName: listing.userDisplayName,
      userPhotoURL: listing.userPhotoURL,
      userPhone: listing.userPhone,
      showPhone: listing.showPhone
    });
    console.log('👤 Kullanıcı bilgileri (listingWithDetails):', {
      userId: listingWithDetails.userId,
      userDisplayName: listingWithDetails.userDisplayName,
      userPhotoURL: listingWithDetails.userPhotoURL,
      userPhone: listingWithDetails.userPhone,
      showPhone: listingWithDetails.showPhone
    });
    console.log('🔐 Giriş durumu:', {
      isAuthenticated,
      currentUserId: user?.id,
      listingUserId: listingWithDetails.userId,
      isOwnListing: user?.id === listingWithDetails.userId
    });
    setViewListingDetail(listingWithDetails);
    setViewListingImageIndex(0);
    // Mesajları yükle
    if (isAuthenticated && user && listing.userId !== user.id) {
      try {
        console.log('💬 Mesajlar yükleniyor...', { listingId: listing.id, otherUserId: listing.userId });
        const msgs = await getMessages(listing.id, listing.userId);
        console.log('💬 Backend\'den gelen mesajlar:', msgs);
        // Mesajları en eski üstte, en yeni altta sırala (normal chat sırası)
        const sortedMsgs = (msgs || []).sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateA - dateB; // En eski üstte, en yeni altta
        });
        console.log('💬 Sıralanmış mesajlar:', sortedMsgs);
        setViewListingMessages(sortedMsgs);
      } catch (err) {
        console.error('❌ Mesajlar yüklenemedi:', err);
        setViewListingMessages([]);
      }
    } else {
      console.log('💬 Mesajlar yüklenmedi - koşul sağlanmadı:', {
        isAuthenticated,
        hasUser: !!user,
        listingUserId: listing.userId,
        currentUserId: user?.id,
        isOwnListing: user?.id === listing.userId
      });
      setViewListingMessages([]);
    }
  };

  const handleSendViewListingMessage = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      showError('Mesaj göndermek için giriş yapmanız gerekiyor.');
      return;
    }
    if (!viewListingMessageText.trim() || !viewListingDetail) {
      return;
    }

    setViewListingLoading(true);
    try {
      await sendMessage(
        viewListingDetail.id,
        viewListingDetail.userId,
        viewListingMessageText.trim()
      );
      // Mesajları yeniden yükle
      const msgs = await getMessages(viewListingDetail.id, viewListingDetail.userId);
      // Mesajları en eski üstte, en yeni altta sırala (normal chat sırası)
      const sortedMsgs = (msgs || []).sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB; // En eski üstte, en yeni altta
      });
      setViewListingMessages(sortedMsgs);
      setViewListingMessageText('');
      success('Mesaj gönderildi!');
    } catch (err) {
      console.error('Mesaj gönderilemedi:', err);
      showError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    } finally {
      setViewListingLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };


  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Üst Bar - Kategori ve Yarıçap */}
      <TopBar
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        radius={radius}
        setRadius={setRadius}
        userLocation={userLocation}
        onLocationChange={handleLocationChange}
      />

      {/* Ana İçerik Alanı */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sol - Filtreler Paneli (Resizable) */}
        <ResizableFiltersPanel
          selectedCategory={selectedCategory}
          filters={filters}
          setFilters={setFilters}
          userLocation={userLocation}
          onListingCreated={handleListingCreated}
          onSearch={handleSearch}
          radius={radius}
          setRadius={setRadius}
          onLocationChange={handleLocationChange}
        />

        {/* Orta - İlan Listesi (Resizable) */}
        <ResizableListingList
          selectedCategory={selectedCategory}
          onListingClick={handleListingClick}
          listings={filteredListings}
          onViewListing={handleViewListing}
        />

        {/* Orta-Sağ - Harita (Kalan alanı kaplar) */}
        <div className="flex-1 relative bg-white shadow-lg border-l border-gray-300 overflow-hidden">
          <MapContainer
            listings={allListings}
            selectedCategory={selectedCategory}
            selectedListing={selectedListing}
            setSelectedListing={setSelectedListing}
            filters={filters}
            radius={radius}
            userLocation={userLocation}
            onLocationChange={handleLocationChange}
            onListingsChange={handleFilteredListingsChange}
            onViewListing={handleViewListing}
          />
        </div>

        {/* Sağ - Üye Dashboard */}
        <div 
          className="bg-white shadow-lg border-l border-gray-200 flex-shrink-0"
          style={{
            width: 'clamp(280px, 20vw, 320px)',
            minWidth: '280px',
            maxWidth: '320px',
            contain: 'layout style paint'
          }}
        >
          <UserDashboard selectedListing={selectedListing} />
        </div>
      </div>

      {/* İlan Detay Popup */}
      {viewListingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setViewListingDetail(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">İlan Detayı</h2>
                <button
                  onClick={() => setViewListingDetail(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* İlan Resimleri ve Videoları - Gallery */}
              {(() => {
                const media = getListingImages(viewListingDetail);
                if (media.length === 0) return null;
                
                return (
                  <div className="mb-4 flex gap-4">
                    {/* Sol: Küçük Thumbnail'ler - Yukarıdan Aşağıya */}
                    {media.length > 1 && (
                      <div className="flex-shrink-0 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {media.map((item, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewListingImageIndex(idx);
                            }}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative ${
                              idx === viewListingImageIndex 
                                ? 'border-red-500 scale-105 shadow-md' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {item.type === 'video' ? (
                              <>
                                <video
                                  src={item.url}
                                  className="w-full h-full object-cover"
                                  muted
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                  <span className="text-white text-xs">▶</span>
                                </div>
                              </>
                            ) : (
                              <img
                                src={item.url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/80x80/cccccc/white?text=No+Image';
                                }}
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Sağ: Büyük Resim/Video */}
                    <div className={`relative ${media.length > 1 ? 'flex-1' : 'w-full'}`}>
                      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        {media[viewListingImageIndex]?.type === 'video' ? (
                          <video
                            src={media[viewListingImageIndex].url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={media[viewListingImageIndex]?.url || 'https://placehold.co/800x500/cccccc/white?text=No+Image'}
                            alt={`${viewListingDetail.title || 'İlan'} - ${media[viewListingImageIndex]?.type === 'video' ? 'Video' : 'Resim'} ${viewListingImageIndex + 1}`}
                            className="max-w-full max-h-full object-contain"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/800x500/cccccc/white?text=No+Image';
                            }}
                          />
                        )}
                        
                        {/* Önceki/Sonraki Butonları */}
                        {media.length > 1 && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewListingImageIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
                              }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            >
                              <ChevronLeft size={18} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewListingImageIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                            >
                              <ChevronRight size={18} />
                            </button>
                            
                            {/* Medya Sayacı */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                              {viewListingImageIndex + 1} / {media.length}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* İlan Bilgileri */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık</label>
                  <p className="text-gray-800 font-semibold">{viewListingDetail.title || 'Başlık yok'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">{viewListingDetail.description || 'Açıklama yok'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                  <p className="text-red-600 font-bold text-lg">${viewListingDetail.price?.toLocaleString() || '0'}</p>
                </div>
                
                {/* İletişim - Kullanıcı Profili - Sadece ilan sahibi dışındaki kullanıcılara göster */}
                {(() => {
                  // İlan sahibi dışındaki kullanıcılara gösterilmeli
                  // Profil resmi ve ad soyad her zaman gösterilmeli, telefon numarası sadece showPhone true ise
                  const shouldShow = viewListingDetail.userId && 
                                    (!isAuthenticated || !user || viewListingDetail.userId !== user.id);
                  
                  console.log('🔍 İletişim gösterimi kontrol:', {
                    showPhone: viewListingDetail.showPhone,
                    showPhoneType: typeof viewListingDetail.showPhone,
                    userPhone: viewListingDetail.userPhone,
                    userId: viewListingDetail.userId,
                    userDisplayName: viewListingDetail.userDisplayName,
                    userPhotoURL: viewListingDetail.userPhotoURL,
                    isAuthenticated,
                    currentUserId: user?.id,
                    listingUserId: viewListingDetail.userId,
                    isOwnListing: user?.id === viewListingDetail.userId,
                    shouldShow
                  });
                  
                  return shouldShow;
                })() && (
                  <div className="pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">İletişim</label>
                    <button
                      onClick={async () => {
                        try {
                          const userProfile = await getUserById(viewListingDetail.userId);
                          setViewedUserProfile(userProfile);
                          // Kullanıcının posta kodunu yükle
                          if (userProfile.postalCode) {
                            setListingUserPostalCode(userProfile.postalCode);
                          } else if (viewListingDetail.postalCode) {
                            setListingUserPostalCode(viewListingDetail.postalCode);
                          }
                          setShowUserProfileModal(true);
                          setUserRating(0);
                          setUserComment('');
                          setShowRatingNotification(false);
                          // Backend'den yorumları ve puanları yükle
                          try {
                            const [comments, ratings] = await Promise.all([
                              getUserComments(userProfile.id),
                              getUserRatings(userProfile.id)
                            ]);
                            setUserComments(comments || []);
                            // Eğer kullanıcı daha önce puan vermişse göster
                            const userRating = ratings?.find(r => r.userId === user?.id);
                            if (userRating) {
                              setUserRating(userRating.rating);
                            }
                          } catch (err) {
                            console.error('Yorumlar ve puanlar yüklenemedi:', err);
                            setUserComments([]);
                          }
                        } catch (err) {
                          console.error('Kullanıcı profili yüklenemedi:', err);
                          showError('Kullanıcı profili yüklenemedi');
                        }
                      }}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left relative"
                      style={{
                        width: contactAreaWidth ? `${contactAreaWidth}px` : 'auto',
                        height: contactAreaHeight ? `${contactAreaHeight}px` : 'auto',
                        minWidth: '200px',
                        minHeight: '100px'
                      }}
                      ref={contactAreaRef}
                    >
                      <img
                        src={viewListingDetail.userPhotoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(viewListingDetail.userDisplayName || 'User') + '&background=random'}
                        alt={viewListingDetail.userDisplayName || 'Kullanıcı'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 flex-shrink-0"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2" style={{ transform: 'translateY(160%)' }}>
                          <p className="font-semibold text-gray-800">
                            {(() => {
                              const name = viewListingDetail.userDisplayName || 'Kullanıcı';
                              return name.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                            })()}
                          </p>
                          {/* Durum Kutusu - İsim soyisim bitiminden %300 sağda */}
                          {listingReservationStatus && (
                            <div className="relative" style={{ position: 'relative' }}>
                              {/* Düzenleme butonları */}
                              {isEditingStatusBox && (
                                <div className="absolute -top-8 left-0 flex gap-2 z-50">
                                  <button
                                    onClick={saveStatusBoxSettings}
                                    className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                  >
                                    Kaydet
                                  </button>
                                  <button
                                    onClick={resetStatusBoxSettings}
                                    className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                  >
                                    Sıfırla
                                  </button>
                                  <button
                                    onClick={cancelStatusBoxEditing}
                                    className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                  >
                                    İptal
                                  </button>
                                </div>
                              )}
                              <div 
                                ref={statusBoxRef}
                                className={`border-2 rounded flex flex-col items-center justify-center flex-shrink-0 ${
                                  listingReservationStatus?.isReserved 
                                    ? 'animate-pulse' 
                                    : listingReservationStatus?.isActive 
                                      ? 'bg-green-300 border-green-500 animate-pulse' 
                                      : ''
                                } ${isEditingStatusBox ? 'cursor-move' : ''}`}
                                style={{ 
                                  width: `${statusBoxSize.width}px`, 
                                  height: `${statusBoxSize.height}px`,
                                  left: `${statusBoxPosition.left}px`,
                                  top: `${statusBoxPosition.top}px`,
                                  ...(listingReservationStatus?.isReserved && {
                                    backgroundColor: '#FF0000',
                                    borderColor: '#CC0000'
                                  }),
                                  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                                  transform: 'perspective(1000px) rotateX(5deg)',
                                  transformStyle: 'preserve-3d',
                                  position: 'absolute'
                                }}
                                onMouseDown={handleStatusBoxMouseDown}
                              >
                                {/* Drag handle */}
                                {isEditingStatusBox && (
                                  <div className="absolute top-1 left-1 cursor-move z-10">
                                    <GripVertical size={16} className="text-gray-600" />
                                  </div>
                                )}
                                {/* Resize handle */}
                                {isEditingStatusBox && (
                                  <div
                                    className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize z-10"
                                    onMouseDown={handleStatusBoxResizeMouseDown}
                                    style={{
                                      clipPath: 'polygon(100% 0, 0 100%, 100% 100%)'
                                    }}
                                  />
                                )}
                              {listingReservationStatus?.isReserved ? (
                                <div className="text-center px-2">
                                  <p className="text-sm font-black mb-1" style={{ color: '#FFFFFF', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Rezerve</p>
                                  {/* Geri sayım sayacı */}
                                  {reservationCountdown && (
                                    <>
                                      <p className="text-xs font-black mb-0.5" style={{ color: '#FFFFFF', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                        {String(reservationCountdown.hours || 0).padStart(2, '0')}:
                                        {String(reservationCountdown.minutes || 0).padStart(2, '0')}:
                                        {String(reservationCountdown.seconds || 0).padStart(2, '0')}
                                      </p>
                                      <p className="text-[9px] font-black mb-1" style={{ color: '#FFFFFF', fontWeight: 900, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>Süre Bitimi Sonrası Aktif Olacak</p>
                                    </>
                                  )}
                                  {/* Yanıp sönen beyaz LED */}
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" style={{
                                    boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)'
                                  }}></div>
                                </div>
                              ) : listingReservationStatus?.isActive ? (
                                <>
                                  <p className="text-sm font-black mb-1" style={{ color: '#000000', fontWeight: 900 }}>Aktif</p>
                                  {/* Yanıp sönen beyaz LED */}
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-lg" style={{
                                    boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.8)'
                                  }}></div>
                                </>
                              ) : null}
                              </div>
                            </div>
                          )}
                        </div>
                        {/* Telefon sembolü her zaman görünür, numara sadece showPhone true ise göster */}
                        <p className="text-sm text-gray-600 mt-1 flex items-center gap-1.5" style={{ transform: 'translateY(160%)' }}>
                          <Phone size={16} className="text-red-600 translate-y-[10%]" />
                          {viewListingDetail.showPhone === true && viewListingDetail.userPhone && (
                            <span>{viewListingDetail.userPhone}</span>
                          )}
                        </p>
                        {/* Konum iğnesi - Açık yeşil kare içinde - Her zaman göster */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const postalCode = viewListingDetail.postalCode || listingUserPostalCode || viewListingDetail.address;
                              if (postalCode) {
                                // Google Maps'te posta koduna veya adrese rota oluştur
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(postalCode)}`, '_blank');
                              }
                            }}
                            className="mt-1 ml-[135%] p-3.5 border-2 border-green-200 bg-green-50 rounded text-red-600 hover:text-red-800 hover:bg-green-100 transition-colors flex items-center justify-center"
                            style={{ transform: 'translateY(3%)' }}
                            title="Haritada göster ve rota oluştur"
                          >
                            <MapPin size={30} />
                          </button>
                      </div>
                    </button>
                  </div>
                )}
                
                {/* İlan Tipi ve Emlak Tipi */}
                {viewListingDetail.category === 'housing' && (
                  <div className="relative grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">İlan Tipi</label>
                      <p className="text-gray-700 font-medium">
                        {viewListingDetail.listingType === 'rent' ? 'Kiralık' :
                         viewListingDetail.listingType === 'sale' ? 'Satılık' :
                         viewListingDetail.listingType === 'room-rent' ? 'Oda Kiralama' :
                         viewListingDetail.listingType === 'roommate' ? 'Oda Arkadaşı' :
                         viewListingDetail.listingType || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Emlak Tipi</label>
                      <p className="text-gray-700 font-medium">
                        {viewListingDetail.propertyType === 'apartment' ? 'Daire' :
                         viewListingDetail.propertyType === 'condo' ? 'Kondo' :
                         viewListingDetail.propertyType === 'house' ? 'Ev' :
                         viewListingDetail.propertyType === 'townhouse' ? 'Müstakil' :
                         viewListingDetail.propertyType === 'basement' ? 'Bodrum Dairesi' :
                         viewListingDetail.propertyType === 'room' ? 'Oda / Paylaşımlı' :
                         viewListingDetail.propertyType || 'Belirtilmemiş'}
                      </p>
                    </div>
                    {/* Durum Bilgisi - Sağ üst köşede */}
                    {listingReservationStatus && (
                      <div className="absolute top-3 right-0">
                        {listingReservationStatus?.isReserved ? (
                          <div className="bg-[#FF0000] border-2 border-[#CC0000] rounded px-2 py-0.5 flex items-center gap-1 shadow-sm">
                            <p className="text-[9px] font-black text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Rezerve</p>
                            {reservationCountdown && (
                              <span className="text-[8px] font-black text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                {String(reservationCountdown.hours || 0).padStart(2, '0')}:
                                {String(reservationCountdown.minutes || 0).padStart(2, '0')}:
                                {String(reservationCountdown.seconds || 0).padStart(2, '0')}
                              </span>
                            )}
                          </div>
                        ) : listingReservationStatus?.isActive ? (
                          <div className="bg-green-300 border-2 border-green-500 rounded px-2 py-0.5 shadow-sm">
                            <p className="text-[9px] font-black text-gray-800">Aktif</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Durum Bilgisi - Al Sat kategorisi için */}
                {viewListingDetail.category === 'buysell' && listingReservationStatus && (
                  <div className="relative pt-3 border-t">
                    <div className="flex justify-end">
                      {listingReservationStatus?.isReserved ? (
                        <div className="bg-[#FF0000] border-2 border-[#CC0000] rounded px-2 py-0.5 flex items-center gap-1 shadow-sm">
                          <p className="text-[9px] font-black text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>Rezerve</p>
                          {reservationCountdown && (
                            <span className="text-[8px] font-black text-white" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                              {String(reservationCountdown.hours || 0).padStart(2, '0')}:
                              {String(reservationCountdown.minutes || 0).padStart(2, '0')}:
                              {String(reservationCountdown.seconds || 0).padStart(2, '0')}
                            </span>
                          )}
                        </div>
                      ) : listingReservationStatus?.isActive ? (
                        <div className="bg-green-300 border-2 border-green-500 rounded px-2 py-0.5 shadow-sm">
                          <p className="text-[9px] font-black text-gray-800">Aktif</p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
                
                {/* Emlak Detayları */}
                {(viewListingDetail.bedrooms || viewListingDetail.bathrooms || viewListingDetail.sqft) && (
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t">
                    {viewListingDetail.bedrooms && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Yatak Sayısı</label>
                        <p className="text-gray-700 font-medium">
                          {viewListingDetail.bedrooms === 'studio' ? 'Stüdyo' : `${viewListingDetail.bedrooms} Yatak`}
                        </p>
                      </div>
                    )}
                    {viewListingDetail.bathrooms && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Banyo Sayısı</label>
                        <p className="text-gray-700 font-medium">{viewListingDetail.bathrooms} Banyo</p>
                      </div>
                    )}
                    {viewListingDetail.sqft && (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Metrekare</label>
                        <p className="text-gray-700 font-medium">{viewListingDetail.sqft} sqft</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Özellikler */}
                {viewListingDetail.category === 'housing' && (
                  <>
                    {(() => {
                      // Hem direkt alanları hem de details objesi içindekileri kontrol et
                      const listingData = { ...viewListingDetail, ...(viewListingDetail.details || {}) };
                      console.log('🔍 İlan verisi:', listingData);
                      console.log('🔍 Details:', viewListingDetail.details);
                      
                      const features = [
                        { key: 'petFriendly', label: 'Pet Friendly', emoji: '🐕' },
                        { key: 'noSmoking', label: 'Sigara İçilmez', emoji: '🚭' },
                        { key: 'furnished', label: 'Eşyalı', emoji: '🛋️' },
                        { key: 'parkingIncluded', label: 'Parking Dahil', emoji: '🅿️' },
                      ];
                      
                      const filteredFeatures = features.filter(f => {
                        const value = listingData[f.key];
                        // Boolean true, string 'true', veya 1 kontrolü
                        const hasFeature = value === true || value === 'true' || value === 1 || value === '1';
                        console.log(`🔍 ${f.key}:`, value, `(type: ${typeof value})`, '→', hasFeature);
                        return hasFeature;
                      });
                      
                      console.log('✅ Filtrelenmiş özellikler:', filteredFeatures.length, filteredFeatures.map(f => f.label));
                      
                      if (filteredFeatures.length > 0) {
                        return (
                          <div className="pt-3 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Özellikler</label>
                            <div className="flex flex-wrap gap-2">
                              {filteredFeatures.map((feature) => (
                                <div
                                  key={feature.key}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200"
                                >
                                  <span className="text-base">{feature.emoji}</span>
                                  <span className="text-sm text-gray-700">{feature.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                    
                    {/* Beyaz Eşya */}
                    {(() => {
                      // Hem direkt alanları hem de details objesi içindekileri kontrol et
                      const listingData = { ...viewListingDetail, ...(viewListingDetail.details || {}) };
                      
                      const appliances = [
                        { key: 'hasRefrigerator', label: 'Buzdolabı', emoji: '🧊' },
                        { key: 'hasDishwasher', label: 'Bulaşık Makinesi', emoji: '🍽️' },
                        { key: 'hasWasher', label: 'Çamaşır Makinesi', emoji: '🌀' },
                        { key: 'hasDryer', label: 'Kurutma Makinesi', emoji: '🌪️' },
                        { key: 'hasMicrowave', label: 'Mikrodalga', emoji: '📻' },
                        { key: 'hasOven', label: 'Fırın', emoji: '🔥' },
                      ];
                      
                      const filteredAppliances = appliances.filter(a => {
                        const value = listingData[a.key];
                        // Boolean true, string 'true', veya 1 kontrolü
                        const hasAppliance = value === true || value === 'true' || value === 1 || value === '1';
                        console.log(`🔍 ${a.key}:`, value, `(type: ${typeof value})`, '→', hasAppliance);
                        return hasAppliance;
                      });
                      
                      console.log('✅ Filtrelenmiş beyaz eşya:', filteredAppliances.length, filteredAppliances.map(a => a.label));
                      
                      if (filteredAppliances.length > 0) {
                        return (
                          <div className="pt-3 border-t">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                              <span>🏠</span>
                              <span>Beyaz Eşya</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {filteredAppliances.map((appliance) => (
                                <div
                                  key={appliance.key}
                                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                  <span className="text-base">{appliance.emoji}</span>
                                  <span className="text-sm text-gray-700">{appliance.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>

              {/* Mesajlaşma Bölümü */}
              {(() => {
                const shouldShowMessages = isAuthenticated && user && viewListingDetail?.userId && viewListingDetail.userId !== user.id;
                console.log('💬 Mesajlaşma bölümü render kontrolü:', {
                  isAuthenticated,
                  hasUser: !!user,
                  viewListingDetailUserId: viewListingDetail?.userId,
                  currentUserId: user?.id,
                  shouldShowMessages,
                  messagesCount: viewListingMessages?.length || 0
                });
                return shouldShowMessages;
              })() && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <MessageSquare size={16} />
                    Mesajlar ({viewListingMessages?.length || 0})
                  </h3>
                  
                  {/* Mesaj Listesi - En yeni altta (normal chat sırası) */}
                  <div className="max-h-64 overflow-y-auto space-y-2 mb-3 p-2 bg-gray-50 rounded-lg">
                    {!viewListingMessages || viewListingMessages.length === 0 ? (
                      <p className="text-center text-gray-400 text-sm py-4">Henüz mesaj yok</p>
                    ) : (
                      <>
                        {viewListingMessages.map((msg, index) => {
                        const isOwn = msg.senderId === user.id;
                        // Önceki mesaj aynı kişiden mi kontrol et
                        const prevMsg = index > 0 ? viewListingMessages[index - 1] : null;
                        const showName = !prevMsg || prevMsg.senderId !== msg.senderId;
                        
                        return (
                          <div
                            key={msg.id}
                            className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                          >
                            {/* İsim - Sadece yeni gönderen değiştiğinde göster */}
                            {showName && (
                              <p className={`text-xs mb-1 px-2 ${isOwn ? 'text-gray-600' : 'text-gray-500'}`}>
                                {isOwn 
                                  ? (user?.displayName?.trim() || user?.email || 'Sen') 
                                  : (msg.senderName?.trim() || (viewListingDetail?.userId && user?.id !== viewListingDetail?.userId ? 'Kullanıcı' : 'Kullanıcı'))}
                              </p>
                            )}
                            <div
                              className={`max-w-[70%] rounded-lg p-2 relative group ${
                                isOwn
                                  ? 'bg-red-100 text-gray-800' // Çok açık kırmızı
                                  : 'bg-green-100 text-gray-800' // Çok açık yeşil
                              }`}
                            >
                              <p className="text-sm pr-6">{msg.message}</p>
                              {/* Sil Butonu - Sadece kendi mesajlarında */}
                              {isOwn && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    try {
                                      await deleteMessage(msg.id);
                                      // Mesajları yeniden yükle
                                      const msgs = await getMessages(viewListingDetail.id, viewListingDetail.userId);
                                      const sortedMsgs = (msgs || []).sort((a, b) => {
                                        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                                        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                                        return dateA - dateB; // En eski üstte, en yeni altta
                                      });
                                      setViewListingMessages(sortedMsgs);
                                      success('Mesaj silindi!');
                                    } catch (err) {
                                      console.error('Mesaj silinemedi:', err);
                                      showError(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                                    }
                                  }}
                                  className="absolute bottom-1 right-1 p-1 rounded hover:bg-black/20 transition-colors opacity-0 group-hover:opacity-100"
                                  title="Mesajı Sil"
                                >
                                  <Trash2 size={12} className={isOwn ? 'text-white' : 'text-gray-600'} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      </>
                    )}
                  </div>

                  {/* Mesaj Gönderme Formu */}
                  <form onSubmit={handleSendViewListingMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={viewListingMessageText}
                      onChange={(e) => setViewListingMessageText(e.target.value)}
                      placeholder="Mesaj yazın..."
                      className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!viewListingMessageText.trim() || viewListingLoading}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send size={18} />
                    </button>
                  </form>
                </div>
              )}

              {(!isAuthenticated || !user || viewListingDetail.userId === user.id) && (
                <div className="border-t pt-4 text-center text-gray-500 text-sm">
                  {!isAuthenticated ? (
                    <p>Mesaj göndermek için giriş yapmanız gerekiyor.</p>
                  ) : (
                    <p>Kendi ilanınıza mesaj gönderemezsiniz.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı Profil Modal */}
      {showUserProfileModal && viewedUserProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]" onClick={() => setShowUserProfileModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-[27px] overflow-y-auto flex-1 scrollbar-thin" style={{ minHeight: 0, scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f1f1' }}>
              <div className="flex items-center justify-between mb-[14px]">
                <h2 className="text-[18px] font-bold text-gray-800">Kullanıcı Profili</h2>
                <button
                  onClick={() => setShowUserProfileModal(false)}
                  className="p-[3px] hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={18} className="text-gray-600" />
                </button>
              </div>

              {/* Profil Bilgileri */}
              <div className="text-center mb-[22px]">
                <img
                  src={viewedUserProfile.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(viewedUserProfile.displayName || 'User') + '&background=random'}
                  alt={viewedUserProfile.displayName || 'Kullanıcı'}
                  className="w-[86px] h-[86px] rounded-full object-cover border-[3.6px] border-gray-300 mx-auto mb-[11px] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setShowProfileImageModal(true)}
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                  }}
                />
                <div className="flex items-center justify-center gap-[7px] mb-[4px]">
                  <h3 className="text-[18px] font-bold text-gray-800">
                    {(() => {
                      const name = viewedUserProfile.displayName || 'Kullanıcı';
                      // İsim soyisim baş harflerini büyük yap
                      return name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()}
                  </h3>
                  {/* Toplam Puan ve Yıldız */}
                  {(() => {
                    // Kullanıcının toplam puanını hesapla (yorumlardan)
                    const totalRating = userComments.length > 0 
                      ? userComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / userComments.length 
                      : 0;
                    const averageRating = totalRating > 0 ? totalRating.toFixed(1) : '0.0';
                    return (
                      <div className="flex items-center gap-[4px]">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[13px] font-semibold text-gray-700">{averageRating}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Konum - Posta Kodundan Şehir */}
              {(() => {
                // Kullanıcının posta kodunu al (listing'den veya profil'den)
                const postalCode = listingUserPostalCode || viewedUserProfile.postalCode;
                const cityName = postalCode ? getCityFromPostalCode(postalCode) : null;
                
                return cityName && (
                  <div className="mb-[22px] flex items-center justify-center gap-[7px]">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="text-[13px] font-medium text-gray-700">{cityName}</span>
                  </div>
                );
              })()}

              {/* Puan Verme */}
              {isAuthenticated && user && viewedUserProfile.id !== user.id && (
                <div className="border-t pt-[22px] mb-[22px] relative" style={{ zIndex: 1 }}>
                  <label className="block text-[13px] font-medium text-gray-700 mb-[11px]">Puan Ver (1-10)</label>
                  {/* Puan Bildirimi - Label'ın üzerinde */}
                  {showRatingNotification && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-[99999]" style={{ position: 'absolute', top: '-6.8px' }}>
                      <div className="bg-green-300 text-gray-800 text-[11px] font-bold px-[11px] py-[5px] rounded-lg shadow-lg rating-notification-3d whitespace-nowrap" style={{
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 16px rgba(134, 239, 172, 0.5)',
                        transform: 'perspective(1000px) rotateX(10deg) rotateY(5deg) rotateZ(3deg)',
                        transformStyle: 'preserve-3d',
                        position: 'relative',
                        zIndex: 99999
                      }}>
                        ✓ Puan Verildi!
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-[7px] relative overflow-x-auto" style={{ zIndex: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <div key={rating} className="relative">
                        <button
                          onClick={async () => {
                            setUserRating(rating);
                            // Puan verilince bildirim göster
                            setShowRatingNotification(true);
                            setTimeout(() => setShowRatingNotification(false), 3000);
                            // Backend'e puan kaydet
                            try {
                              await createUserRating(viewedUserProfile.id, rating);
                            } catch (err) {
                              console.error('Puan kaydedilemedi:', err);
                            }
                          }}
                          className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors ${
                            rating <= userRating
                              ? 'bg-green-400 text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {rating}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Yorum Yazma */}
              {isAuthenticated && user && viewedUserProfile.id !== user.id && (
                <div className="border-t pt-[22px] mb-[22px]">
                  <label className="block text-[13px] font-medium text-gray-700 mb-[7px]">Yorum Yap</label>
                  <textarea
                    value={userComment}
                    onChange={(e) => setUserComment(e.target.value)}
                    className="w-full px-[11px] py-[7px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-[13px]"
                    placeholder="Yorumunuzu yazın..."
                    rows={4}
                  />
                  <button
                    onClick={async () => {
                      if (userRating > 0 || userComment.trim()) {
                        try {
                          console.log('📤 Yorum gönderiliyor:', {
                            userId: viewedUserProfile.id,
                            comment: userComment.trim(),
                            rating: userRating
                          });
                          // Backend'e yorum gönder
                          const savedComment = await createUserComment(
                            viewedUserProfile.id,
                            userComment.trim(),
                            userRating
                          );
                          console.log('✅ Yorum kaydedildi:', savedComment);
                          // Yorumu listeye ekle
                          setUserComments([...userComments, savedComment]);
                          success('Puan ve yorum kaydedildi!');
                          setUserComment('');
                          // Puan sıfırlama - eğer backend'de kaydedildiyse koru
                          // setUserRating(0);
                        } catch (err) {
                          console.error('❌ Yorum kaydedilemedi:', err);
                          const errorMessage = err?.message || 'Yorum kaydedilemedi';
                          console.error('❌ Hata detayı:', errorMessage);
                          showError(errorMessage);
                        }
                      } else {
                        showError('Lütfen puan verin veya yorum yazın');
                      }
                    }}
                    className="mt-[11px] w-full px-[14px] py-[7px] bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-[13px]"
                  >
                    Gönder
                  </button>
                </div>
              )}

              {/* Yorumlar Listesi - Scroll edilebilir */}
              {userComments.length > 0 && (
                <div className="border-t pt-[22px] flex-shrink-0">
                  <label className="block text-[13px] font-medium text-gray-700 mb-[11px]">Yorumlar ({userComments.length})</label>
                  <div className="space-y-[11px] max-h-[216px] overflow-y-scroll scrollbar-thin pr-[7px]" style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f1f1'
                  }}>
                    {userComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-[11px]">
                        <div className="flex items-center justify-between mb-[7px]">
                          <div className="flex items-center gap-[7px]">
                            <span className="font-semibold text-[13px] text-gray-800">
                              {comment.userName.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ')}
                            </span>
                            {comment.rating > 0 && (
                              <div className="flex items-center gap-[4px]">
                                <Star size={13} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-[11px] text-gray-600">{comment.rating}/10</span>
                              </div>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        {comment.comment && (
                          <p className="text-[13px] text-gray-700">{comment.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!isAuthenticated || !user || viewedUserProfile.id === user.id) && (
                <div className="border-t pt-[14px] text-center text-gray-500 text-[13px] flex-shrink-0">
                  {!isAuthenticated ? (
                    <p>Puan vermek ve yorum yapmak için giriş yapmanız gerekiyor.</p>
                  ) : (
                    <p>Kendi profilinize puan veremez ve yorum yapamazsınız.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Profil Resmi Büyük Görünüm Modal */}
      {showProfileImageModal && viewedUserProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[10001]" onClick={() => setShowProfileImageModal(false)}>
          <div className="relative max-w-[calc(56rem*1.05)] max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowProfileImageModal(false)}
              className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full transition-colors z-10"
            >
              <X size={24} className="text-gray-800" />
            </button>
            <img
              src={viewedUserProfile.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(viewedUserProfile.displayName || 'User') + '&background=random'}
              alt={viewedUserProfile.displayName || 'Kullanıcı'}
              className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;

