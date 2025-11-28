import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MessageSquare, Send, LogOut, User, X, LogIn, UserPlus, Mail, Megaphone, Edit2, Save, Trash2, Pause, Play, Upload, Camera, ChevronLeft, ChevronRight, Star, Store, Clock, CheckCircle, MapPin, Bell } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { sendMessage, getMessages, getUserConversations, updateUserProfile, fetchListings, updateListing, deleteListing, uploadImages, deleteMessage, markMessageAsRead, deleteConversation, getUserRatings, getUserComments, createUserRating, createUserComment, reserveListing, getListingReservation, getListingSale, markListingAsSold, cancelReservation, getUserById, getNotifications, markNotificationAsRead as markNotificationAsReadAPI } from '@/services/api';
import { getCategoryEmoji } from '@/utils/helpers';
import { useToast, useConfirm } from '@/context/ToastContext';

const UserDashboard = ({ selectedListing }) => {
  const { user, userProfile, logout, login, register, isAuthenticated, setUser: setAuthUser, setUserProfile: setAuthUserProfile } = useAuth();
  const { language, t } = useLanguage();
  const { success, error } = useToast();
  const { confirm } = useConfirm();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const audioContextRef = useRef(null);
  const previousConversationsRef = useRef([]);
  const lastPlayedMessageIdRef = useRef(null);
  const [advertisements, setAdvertisements] = useState([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const adIntervalRef = useRef(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [userRank, setUserRank] = useState(5);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRatingsList, setUserRatingsList] = useState([]);
  const [userCommentsList, setUserCommentsList] = useState([]);
  const [isRegister, setIsRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerDisplayName, setRegisterDisplayName] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPostalCode, setRegisterPostalCode] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMyListings, setShowMyListings] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [myListingsFilter, setMyListingsFilter] = useState('active'); // 'active' veya 'sold'
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  
  // İlanlarım sekmesi açıldığında ilanları yükle
  useEffect(() => {
    if (showMyListings && user && isAuthenticated) {
      console.log('📋 İlanlarım sekmesi açıldı, ilanlar yükleniyor...', { showMyListings, userId: user.id });
      const loadMyListings = async () => {
        try {
          // Satılan ilanları da dahil et
          const listings = await fetchListings(null, true);
          console.log('📋 Tüm ilanlar (satılanlar dahil):', listings.length);
          console.log('📋 İlanlar (ilk 3):', listings.slice(0, 3).map(l => ({ id: l.id, userId: l.userId, title: l.title })));
          const filtered = listings.filter(l => l.userId === user.id);
          
          // Backend'den gelen ilanların isSold değerlerini kontrol et
          console.log('📋 Backend\'den gelen ilanlar (ilk 3):', filtered.slice(0, 3).map(l => ({ id: l.id, title: l.title, isSold: l.isSold, isSoldType: typeof l.isSold })));
          
          // Her ilan için rezerve durumunu kontrol et (isSold zaten backend'den geliyor)
          const listingsWithStatus = await Promise.all(filtered.map(async (listing) => {
            try {
              // isSold zaten backend'den geliyor (includeSold=true olduğunda)
              // Boolean olarak garanti et (true, 'true', 1 gibi değerleri kontrol et)
              // Önce backend'den gelen değeri kontrol et
              console.log(`📋 İlan ${listing.id} (${listing.title}) - Backend listing objesi:`, {
                id: listing.id,
                title: listing.title,
                isSold: listing.isSold,
                isSoldType: typeof listing.isSold,
                hasIsSold: 'isSold' in listing,
                allKeys: Object.keys(listing).filter(k => k.includes('sold') || k.includes('Sold'))
              });
              const isSold = listing.isSold === true || listing.isSold === 'true' || listing.isSold === 1 || listing.isSold === '1';
              console.log(`📋 İlan ${listing.id} (${listing.title}) - Final isSold:`, isSold);
              
              // Rezerve edildi mi kontrol et
              let isReserved = false;
              try {
                const reservation = await getListingReservation(listing.id);
                isReserved = reservation && new Date(reservation.endTime) > new Date() && !reservation.cancelled;
              } catch (resErr) {
                // Rezervasyon yoksa hata verme
                isReserved = false;
              }
              
              return {
                ...listing,
                isSold,
                isReserved
              };
            } catch (err) {
              console.error(`❌ İlan ${listing.id} durumu kontrol edilemedi:`, err);
              return {
                ...listing,
                isSold: listing.isSold === true || listing.isSold === 'true' || listing.isSold === 1,
                isReserved: false
              };
            }
          }));
          
          console.log('📋 Filtrelenmiş ilanlar (kullanıcı ID:', user.id, '):', listingsWithStatus.length);
          console.log('📋 İlan detayları:', listingsWithStatus.map(l => ({ id: l.id, title: l.title, isSold: l.isSold, isSoldType: typeof l.isSold, isReserved: l.isReserved })));
          console.log('📋 Satılan ilanlar:', listingsWithStatus.filter(l => l.isSold === true).map(l => ({ id: l.id, title: l.title, isSold: l.isSold })));
          console.log('📋 Aktif ilanlar:', listingsWithStatus.filter(l => !l.isSold).map(l => ({ id: l.id, title: l.title, isSold: l.isSold })));
          setMyListings(listingsWithStatus);
        } catch (error) {
          console.error('❌ İlanlar yüklenemedi:', error);
          setMyListings([]);
        }
      };
      loadMyListings();
    } else {
      console.log('📋 İlanlar yüklenmedi:', { showMyListings, user: !!user, isAuthenticated });
    }
  }, [showMyListings, user, isAuthenticated]);
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    showPhone: true,
    showAddress: true
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [selectedListingDetail, setSelectedListingDetail] = useState(null);
  const [listingActionLoading, setListingActionLoading] = useState(false);
  const [viewedUserProfile, setViewedUserProfile] = useState(null);
  const [viewedUserListings, setViewedUserListings] = useState([]);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [viewedUserRating, setViewedUserRating] = useState(0);
  const [viewedUserComment, setViewedUserComment] = useState('');
  const [viewedUserComments, setViewedUserComments] = useState([]);
  const [showViewedRatingNotification, setShowViewedRatingNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [listingImageIndex, setListingImageIndex] = useState(0);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [reserveHours, setReserveHours] = useState(1);
  const [listingReservation, setListingReservation] = useState(null);
  const [reservationCountdown, setReservationCountdown] = useState(null);
  const [currentListingOwnerId, setCurrentListingOwnerId] = useState(null);
  const [listingSale, setListingSale] = useState(null);
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    price: '',
    address: '',
    city: '',
    listingType: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    sqft: '',
    postalCode: '',
    showPhone: true,
    // Özellikler
    petFriendly: false,
    noSmoking: false,
    furnished: false,
    parkingIncluded: false,
    // Beyaz Eşya
    hasRefrigerator: false,
    hasDishwasher: false,
    hasWasher: false,
    hasDryer: false,
    hasMicrowave: false,
    hasOven: false
  });
  const [editImages, setEditImages] = useState([]);
  const [editImageUploading, setEditImageUploading] = useState(false);

  // Islık sesi çal (kısa)
  const playHornSound = () => {
    try {
      // Web Audio API ile ıslık sesi oluştur
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Islık sesi için frekans ve dalga formu (yüksek frekans, kısa süre)
      oscillator.type = 'sine';
      // Hızlı yükselen frekans (ıslık gibi)
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.15);
      
      // Ses seviyesi (hızlı fade out)
      gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2); // Kısa süre (0.2 saniye)
    } catch (error) {
      console.error('Ses çalınamadı:', error);
    }
  };

  // Kullanıcı manuel scroll yaptı mı kontrol et
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);

  // Mesajları scroll et - en yeni mesaj altta olduğu için en alta scroll
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Mesajlar değiştiğinde scroll kontrolü
  useEffect(() => {
    // Yeni mesaj geldi mi kontrol et
    const hasNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    // Eğer kullanıcı manuel scroll yapmadıysa veya yeni mesaj geldiyse, en alta scroll yap
    if (!isUserScrolling || hasNewMessage) {
      setTimeout(() => {
        scrollToBottom();
        setIsUserScrolling(false);
      }, 100);
    }
  }, [messages, isUserScrolling, scrollToBottom]);

  // Kullanıcı scroll yaptığında kontrol et
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      // Kullanıcı en alttan uzaksa, manuel scroll yapıyor demektir
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (!isNearBottom) {
        setIsUserScrolling(true);
      } else {
        setIsUserScrolling(false);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Yeni mesaj geldiğinde ses çal
  useEffect(() => {
    if (messages.length > 0 && isAuthenticated && user) {
      const currentMessageCount = messages.length;
      const previousCount = previousMessageCountRef.current;
      
      // Yeni mesaj geldi mi kontrol et (mesaj sayısı arttı ve kullanıcı mesajı göndermedi)
      if (currentMessageCount > previousCount) {
        const lastMessage = messages[messages.length - 1];
        // Sadece başka kullanıcıdan gelen mesajlar için ses çal
        if (lastMessage && lastMessage.senderId !== user.id) {
          playHornSound();
        }
      }
      
      previousMessageCountRef.current = currentMessageCount;
    }
  }, [messages, isAuthenticated, user]);

  // Kullanıcı giriş yaptığında konuşmaları yükle
  useEffect(() => {
    if (isAuthenticated && user) {
      loadConversations();
    }
  }, [isAuthenticated, user]);

  // Seçili ilan değiştiğinde mesajları yükle (sadece giriş yapmış kullanıcılar için)
  useEffect(() => {
    if (selectedListing && isAuthenticated && user) {
      // İlan sahibi ile konuşmayı başlat
      const listingOwnerId = selectedListing.userId;
      console.log('🔍 İlan seçildi - selectedListing:', selectedListing);
      console.log('🔍 İlan sahibi ID:', listingOwnerId);
      console.log('🔍 Kullanıcı ID:', user.id);
      
      if (listingOwnerId) {
        if (listingOwnerId !== user.id) {
          // Başka birinin ilanı - sohbet panelini aç
          console.log('✅ Başka birinin ilanı, sohbet paneli açılıyor');
        setSelectedConversation({
          otherUserId: listingOwnerId,
          listingId: selectedListing.id,
          listingTitle: selectedListing.title,
        });
        loadMessages(listingOwnerId, selectedListing.id);
        } else {
          // Kendi ilanı - conversations listesini göster, sohbet panelini kapat
          console.log('ℹ️ Kendi ilanı, conversations listesi gösteriliyor');
          setSelectedConversation(null);
          setMessages([]);
          // Conversations'ı yeniden yükle ki kendi ilanına gelen mesajlar görünsün
          loadConversations();
        }
      } else {
        console.warn('⚠️ İlan sahibi ID bulunamadı');
      }
    } else if (selectedListing && !isAuthenticated) {
      // Giriş yapmamışsa konuşmayı temizle
      console.log('ℹ️ Giriş yapılmamış, sohbet paneli kapatılıyor');
      setSelectedConversation(null);
      setMessages([]);
    }
  }, [selectedListing, isAuthenticated, user]);

  // Mesajları periyodik olarak yenile (real-time yerine polling)
  useEffect(() => {
    if (selectedConversation && isAuthenticated && user) {
      const interval = setInterval(() => {
        loadMessages(selectedConversation.otherUserId, selectedConversation.listingId);
      }, 2000); // Her 2 saniyede bir yenile

      return () => clearInterval(interval);
    }
  }, [selectedConversation, isAuthenticated, user]);

  // Konuşmaları periyodik olarak yenile (yeni mesaj bildirimi için)
  useEffect(() => {
    if (isAuthenticated && user) {
      const interval = setInterval(() => {
        loadConversations();
        loadNotifications(); // Bildirimleri de yükle
      }, 3000); // Her 3 saniyede bir konuşmaları kontrol et

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Bildirimleri yükle
  const loadNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      const notifs = await getNotifications();
      setNotifications(notifs || []);
      const unreadCount = (notifs || []).filter(n => !n.read).length;
      setUnreadNotificationCount(unreadCount);
    } catch (err) {
      console.error('Bildirimler yüklenemedi:', err);
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    }
  }, [isAuthenticated, user]);

  // Seçili konuşma değiştiğinde rezervasyon bilgisini yükle ve ilan sahibini kontrol et
  useEffect(() => {
    if (selectedConversation && selectedConversation.listingId) {
      loadListingReservation(selectedConversation.listingId);
      // İlan sahibini kontrol et
      const checkListingOwner = async () => {
        try {
          const listings = await fetchListings();
          const listing = listings.find(l => l.id === selectedConversation.listingId);
          setCurrentListingOwnerId(listing?.userId || null);
        } catch (err) {
          console.error('İlan sahibi kontrol edilemedi:', err);
          setCurrentListingOwnerId(null);
        }
      };
      checkListingOwner();
    } else {
      setCurrentListingOwnerId(null);
    }
  }, [selectedConversation]);

  // Satılan ilan için sale ve alıcı bilgilerini yükle
  useEffect(() => {
    const loadSaleAndBuyer = async () => {
      if (selectedListingDetail && selectedListingDetail.isSold && selectedListingDetail.id) {
        try {
          const sale = await getListingSale(selectedListingDetail.id);
          if (sale && sale.buyerId) {
            setListingSale(sale);
            // Alıcı bilgilerini yükle
            const buyer = await getUserById(sale.buyerId);
            if (buyer) {
              setBuyerInfo(buyer);
            }
          } else {
            setListingSale(null);
            setBuyerInfo(null);
          }
        } catch (err) {
          console.error('Sale ve alıcı bilgileri yüklenemedi:', err);
          setListingSale(null);
          setBuyerInfo(null);
        }
      } else {
        setListingSale(null);
        setBuyerInfo(null);
      }
    };
    loadSaleAndBuyer();
  }, [selectedListingDetail]);

  // Rezervasyon bilgisini yükle
  const loadListingReservation = async (listingId) => {
    try {
      const reservation = await getListingReservation(listingId);
      console.log('📋 Rezervasyon bilgisi yüklendi:', reservation);
      
      // Rezervasyon var mı ve aktif mi kontrol et
      if (reservation && reservation.isReserved) {
        // End time kontrolü - eğer geçmişteyse rezervasyon geçersiz
        if (reservation.endTime) {
          const endTime = new Date(reservation.endTime);
          const now = new Date();
          
          if (endTime > now) {
            // Rezervasyon aktif
            setListingReservation({
              reservedBy: reservation.reservedByName || 'Kullanıcı',
              endTime: reservation.endTime,
              reservedByUserId: reservation.reservedByUserId
            });
          } else {
            // Rezervasyon süresi dolmuş
            console.log('⚠️ Rezervasyon süresi dolmuş:', { endTime, now });
            setListingReservation(null);
          }
        } else {
          setListingReservation(null);
        }
      } else {
        setListingReservation(null);
      }
    } catch (err) {
      console.error('Rezervasyon bilgisi yüklenemedi:', err);
      setListingReservation(null);
    }
  };

  // İlan detay modal açıldığında rezervasyon bilgisini yükle
  useEffect(() => {
    if (selectedListingDetail?.id) {
      loadListingReservation(selectedListingDetail.id);
    } else {
      setListingReservation(null);
      setReservationCountdown(null);
    }
  }, [selectedListingDetail?.id]);

  // Rezervasyon geri sayım sayacı
  useEffect(() => {
    if (listingReservation?.endTime && listingReservation.reservedByUserId) {
      const updateCountdown = () => {
        const now = new Date();
        const endTime = new Date(listingReservation.endTime);
        const diff = endTime - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setReservationCountdown({ hours, minutes, seconds });
        } else {
          setReservationCountdown(null);
          setListingReservation(null);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);

      return () => clearInterval(interval);
    } else {
      setReservationCountdown(null);
    }
  }, [listingReservation]);

  // Kullanıcı puanını yükle
  useEffect(() => {
    const fetchUserRating = async () => {
      if (user?.id) {
        try {
          const ratings = await getUserRatings(user.id);
          if (ratings && ratings.length > 0) {
            const averageRating = ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;
            setUserRating(Math.round(averageRating * 10) / 10); // 1 ondalık basamak
            
            // Rank hesapla (puan bazlı basit rank sistemi)
            // 0-2: Rank 5, 2-4: Rank 4, 4-6: Rank 3, 6-8: Rank 2, 8-10: Rank 1
            let rank = 5;
            if (averageRating >= 8) rank = 1;
            else if (averageRating >= 6) rank = 2;
            else if (averageRating >= 4) rank = 3;
            else if (averageRating >= 2) rank = 4;
            setUserRank(rank);
          }
        } catch (err) {
          console.error('Kullanıcı puanı yüklenemedi:', err);
        }
      }
    };
    fetchUserRating();
  }, [user?.id]);

  // Reklamları yükle - YENİ 6 SLOT SİSTEMİ
  useEffect(() => {
    const loadAds = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/advertisements`);
        if (!response.ok) {
          console.warn('Reklamlar yüklenemedi, boş array döndürülüyor');
          setAdvertisements([]);
          return;
        }
        const ads = await response.json();
        // Yeni sistem: direkt array döndürüyor (aktif reklamlar)
        // Güvenli kontrol
        if (ads && Array.isArray(ads)) {
          setAdvertisements(ads);
        } else {
          console.warn('Reklamlar array değil, boş array ayarlanıyor:', ads);
          setAdvertisements([]);
        }
      } catch (error) {
        console.error('Error loading advertisements:', error);
        setAdvertisements([]);
      }
    };
    loadAds();
    
    // Her 30 saniyede bir yeniden yükle
    const interval = setInterval(loadAds, 30000);
    return () => clearInterval(interval);
  }, []);

  // Reklam rotasyonu (her 5 saniyede bir değiş)
  useEffect(() => {
    if (advertisements && Array.isArray(advertisements) && advertisements.length > 0) {
      // İlk reklamı göster
      setCurrentAdIndex(0);
      
      // Eğer birden fazla reklam varsa rotasyon başlat
      if (advertisements.length > 1) {
        adIntervalRef.current = setInterval(() => {
          setCurrentAdIndex((prev) => {
            const next = (prev + 1) % advertisements.length;
            console.log('Reklam değişti:', next, advertisements[next]?.slot);
            return next;
          });
        }, 5000); // 5 saniye

        return () => {
          if (adIntervalRef.current) {
            clearInterval(adIntervalRef.current);
            adIntervalRef.current = null;
          }
        };
      } else {
        // Tek reklam varsa rotasyon yok
        if (adIntervalRef.current) {
          clearInterval(adIntervalRef.current);
          adIntervalRef.current = null;
        }
      }
    } else {
      // Reklam yoksa interval'i temizle
      if (adIntervalRef.current) {
        clearInterval(adIntervalRef.current);
        adIntervalRef.current = null;
      }
      setCurrentAdIndex(0);
    }
  }, [advertisements]);

  const loadConversations = async () => {
    try {
      const convs = await getUserConversations();
      
      // convs null veya undefined ise boş array kullan
      if (!convs || !Array.isArray(convs)) {
        console.warn('⚠️ Conversations geçersiz:', convs);
        setConversations([]);
        return;
      }
      
      // Debug: Conversations'ları logla
      console.log('📥 Conversations yüklendi:', convs);
      convs.forEach((conv, idx) => {
        console.log(`📥 Conversation ${idx}:`, {
          listingTitle: conv.listingTitle,
          listingImage: conv.listingImage,
          listingId: conv.listingId
        });
      });
      
      // Konuşmaları sırala: önce okunmamış mesajlar, sonra en yeni mesaj üstte
      const sortedConvs = convs.sort((a, b) => {
        // lastMessage string veya obje olabilir (eski veriler için)
        const aLastMsg = typeof a.lastMessage === 'string' ? null : a.lastMessage;
        const bLastMsg = typeof b.lastMessage === 'string' ? null : b.lastMessage;
        
        // Okunmamış mesaj kontrolü
        const aUnread = aLastMsg && aLastMsg.senderId !== user.id && !aLastMsg.read;
        const bUnread = bLastMsg && bLastMsg.senderId !== user.id && !bLastMsg.read;
        
        // Okunmamış mesajlar önce
        if (aUnread && !bUnread) return -1;
        if (!aUnread && bUnread) return 1;
        
        // Aynı durumdaysa tarihe göre sırala (en yeni üstte)
        if (!aLastMsg && !bLastMsg) return 0;
        if (!aLastMsg) return 1;
        if (!bLastMsg) return -1;
        const dateA = aLastMsg.createdAt?.toDate ? aLastMsg.createdAt.toDate() : new Date(aLastMsg.createdAt);
        const dateB = bLastMsg.createdAt?.toDate ? bLastMsg.createdAt.toDate() : new Date(bLastMsg.createdAt);
        return dateB - dateA; // En yeni üstte
      });
      
      // Yeni mesaj var mı kontrol et (tüm konuşmalarda)
      if (sortedConvs && sortedConvs.length > 0 && isAuthenticated && user) {
        const previousConvs = previousConversationsRef.current;
        let newMessageCount = 0;
        let hasNew = false;
        
        // İlk yükleme mi kontrol et
        const isFirstLoad = previousConvs.length === 0;
        
        // Her konuşmayı kontrol et
        sortedConvs.forEach(conv => {
          // lastMessage string veya obje olabilir
          const lastMsg = typeof conv.lastMessage === 'string' ? null : conv.lastMessage;
          if (lastMsg && lastMsg.senderId !== user.id) {
            // Önceki konuşmalarda bu mesaj var mı kontrol et
            const previousConv = previousConvs.find(pc => 
              pc.otherUserId === conv.otherUserId && 
              pc.listingId === conv.listingId
            );
            
            // Yeni mesaj mı? (önceki konuşmada yoksa veya mesaj ID farklıysa)
            // İlk yüklemede tüm mesajları yeni olarak sayma
            const prevLastMsg = previousConv && typeof previousConv.lastMessage === 'object' ? previousConv.lastMessage : null;
            const isNewMessage = !isFirstLoad && (!prevLastMsg || prevLastMsg.id !== lastMsg.id);
            
            if (isNewMessage) {
              newMessageCount++;
              hasNew = true;
              
              if (lastMsg.id !== lastPlayedMessageIdRef.current) {
                // Aktif konuşmada değilse ses çal
                const isActiveConversation = selectedConversation && 
                  conv.otherUserId === selectedConversation.otherUserId &&
                  conv.listingId === selectedConversation.listingId;
                
                if (!isActiveConversation) {
                  playHornSound();
                  lastPlayedMessageIdRef.current = lastMsg.id;
                }
              }
            }
          }
        });
        
        setHasNewMessages(hasNew);
        setUnreadMessageCount(newMessageCount);
        previousConversationsRef.current = sortedConvs;
      } else {
        setHasNewMessages(false);
        setUnreadMessageCount(0);
      }
      
      console.log('✅ Conversations state güncelleniyor:', sortedConvs.length, 'konuşma');
      console.log('✅ Conversations detayları:', sortedConvs.map(c => ({ 
        listingTitle: c.listingTitle, 
        otherUserId: c.otherUserId,
        listingId: c.listingId 
      })));
      setConversations(sortedConvs);
      console.log('✅ setConversations çağrıldı, yeni state:', sortedConvs.length);
    } catch (error) {
      console.error('❌ Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadMessages = async (otherUserId, listingId) => {
    try {
      const msgs = await getMessages(listingId, otherUserId);
      
      // Okunmamış mesajları işaretle (kendi mesajlarımız değilse ve okunmamışsa)
      if (user) {
        let hasUnreadMessages = false;
        for (const msg of msgs) {
          if (msg.receiverId === user.id && !msg.read) {
            try {
              await markMessageAsRead(msg.id);
              hasUnreadMessages = true;
            } catch (err) {
              console.error('Mesaj okundu olarak işaretlenemedi:', err);
            }
          }
        }
        
        // Eğer okunmamış mesajlar işaretlendiyse, konuşmaları yeniden yükle
        if (hasUnreadMessages) {
          setTimeout(() => {
            loadConversations();
          }, 500);
        }
      }
      
      // Mesajları en eski üstte, en yeni altta sırala (normal chat sırası)
      const sortedMsgs = msgs.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return dateA - dateB; // En eski üstte, en yeni altta
      });
      
      const previousCount = messages.length;
      setMessages(sortedMsgs);
      
      // İlk yüklemede ses çalma (previousCount === 0 ise)
      if (previousCount === 0) {
        previousMessageCountRef.current = sortedMsgs.length;
        // İlk yüklemede en alta scroll yap
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Kullanıcı profilini yükle
  const loadUserProfile = async (userId) => {
    if (!userId) {
      console.error('❌ userId boş!');
      error('Kullanıcı ID bulunamadı');
      return;
    }
    
    try {
      console.log('🔍 Kullanıcı profili yükleniyor:', userId);
      // Kullanıcı bilgilerini al
      const token = localStorage.getItem('auth_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const url = `${apiUrl}/api/users/${userId}`;
      
      console.log('🌐 İstek URL:', url);
      console.log('🔑 Token var mı?', !!token);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📥 Response status:', response.status, response.statusText);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Kullanıcı profili alındı:', userData);
        console.log('✅ showPhone:', userData?.showPhone);
        console.log('✅ showAddress:', userData?.showAddress);
        setViewedUserProfile(userData);
        
        // Kullanıcının ilanlarını al
        try {
          const listings = await fetchListings();
          const userListings = listings.filter(l => l.userId === userId);
          console.log('✅ Kullanıcı ilanları:', userListings.length);
          setViewedUserListings(userListings);
        } catch (listingsErr) {
          console.error('❌ İlanlar yüklenemedi:', listingsErr);
          setViewedUserListings([]);
        }
        
        // Kullanıcının yorumlarını ve puanlarını yükle
        try {
          const [comments, ratings] = await Promise.all([
            getUserComments(userId),
            getUserRatings(userId)
          ]);
          setViewedUserComments(comments || []);
          // Eğer kullanıcı daha önce puan vermişse göster
          const userRating = ratings?.find(r => r.userId === user?.id);
          if (userRating) {
            setViewedUserRating(userRating.rating);
          } else {
            setViewedUserRating(0);
          }
        } catch (err) {
          console.error('Yorumlar ve puanlar yüklenemedi:', err);
          setViewedUserComments([]);
          setViewedUserRating(0);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Response hatası:', response.status, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || 'Kullanıcı profili yüklenemedi' };
        }
        error(errorData.error || `Hata: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('❌ Kullanıcı profili yüklenemedi (catch):', err);
      error(`Kullanıcı profili yüklenemedi: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Giriş kontrolü
    if (!isAuthenticated || !user) {
      error('Mesaj göndermek için giriş yapmanız gerekiyor.');
      return;
    }
    
    if (!messageText.trim() || !selectedConversation) {
      return;
    }

    try {
      await sendMessage(
        selectedConversation.listingId,
        selectedConversation.otherUserId,
        messageText.trim()
      );
      
      // Mesajları yeniden yükle
      await loadMessages(selectedConversation.otherUserId, selectedConversation.listingId);
      setMessageText('');
      // Yeni mesaj gönderildi, en alta scroll yap
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
        error('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  // İlan resimlerini al
  const getListingImages = (listing) => {
    if (!listing) return [];
    
    // images array'i varsa onu kullan
    if (listing.images && Array.isArray(listing.images) && listing.images.length > 0) {
      return listing.images;
    }
    
    // images string olarak geliyorsa parse et
    if (listing.images && typeof listing.images === 'string') {
      try {
        const parsed = JSON.parse(listing.images);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error parsing images:', e);
      }
    }
    
    // image varsa onu kullan
    if (listing.image) {
      return [listing.image];
    }
    
    return [];
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-red-600 to-red-700 text-white">
        {isAuthenticated ? (
          <div className="space-y-3">
            {/* Üst kısım: İsim ve Profil */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setProfileForm({
                      displayName: userProfile?.displayName || user?.displayName || '',
                      email: user?.email || '',
                      phone: userProfile?.phone || user?.phone || '',
                      postalCode: userProfile?.postalCode || user?.postalCode || '',
                      address: userProfile?.address || user?.address || '',
                      showPhone: userProfile?.showPhone !== undefined ? userProfile.showPhone : (user?.showPhone !== undefined ? user.showPhone : true),
                      showAddress: userProfile?.showAddress !== undefined ? userProfile.showAddress : (user?.showAddress !== undefined ? user.showAddress : true)
                    });
                    setProfilePhoto(null);
                    setProfilePhotoPreview(user?.photoURL || userProfile?.photoURL || null);
                    setShowProfileModal(true);
                  }}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer overflow-hidden"
                  title="Profili Düzenle"
                >
                  {user?.photoURL || userProfile?.photoURL ? (
                    <img
                      src={user?.photoURL || userProfile?.photoURL}
                      alt={user?.displayName || 'Profil'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <User size={16} className={user?.photoURL || userProfile?.photoURL ? 'hidden' : ''} />
                </button>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">
                    {(() => {
                      const name = userProfile?.displayName || user?.displayName || user?.email || 'Kullanıcı';
                      // İsim soyisim baş harflerini büyük yap
                      return name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()}
                  </p>
                  <div 
                    onClick={async () => {
                      if (user?.id) {
                        try {
                          const ratings = await getUserRatings(user.id);
                          const comments = await getUserComments(user.id);
                          setUserRatingsList(ratings || []);
                          setUserCommentsList(comments || []);
                          setShowRatingModal(true);
                        } catch (err) {
                          console.error('Puan ve yorumlar yüklenemedi:', err);
                          error('Puan ve yorumlar yüklenemedi');
                        }
                      }
                    }}
                    className="w-[46.65px] h-[46.65px] bg-white rounded border-2 border-green-400/70 shadow-lg flex items-center justify-center gap-1 flex-col cursor-pointer hover:bg-gray-50 transition-colors" style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
                      transform: 'perspective(100px) rotateX(2deg)',
                    }}>
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[9px] font-bold text-gray-800">{userRating || 0}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title={t('logout') || 'Çıkış Yap'}
              >
                <LogOut size={18} />
              </button>
            </div>
            {/* Alt kısım: Mesaj ve İlan Yönetimi */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setShowMyListings(false);
                  setSelectedConversation(null);
                  setHasNewMessages(false);
                  setUnreadMessageCount(0);
                }}
                className={`w-[55px] h-[55px] flex flex-col items-center justify-center gap-0.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors relative ${hasNewMessages ? 'animate-led-blink' : ''}`}
                title="Mesajlar"
              >
                <Mail 
                  size={10} 
                  className="text-white"
                />
                <span className="text-[11px] font-medium">Mesajlar</span>
                {unreadMessageCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[5.5px] font-bold rounded-full w-[2.75px] h-[2.75px] flex items-center justify-center">
                    {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                }}
                className="w-[55px] h-[55px] flex flex-col items-center justify-center gap-0.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors relative"
                title="Bildirimler"
              >
                <Bell size={10} className="text-white" />
                <span className="text-[11px] font-medium">Bildirimler</span>
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[5.5px] font-bold rounded-full w-[2.75px] h-[2.75px] flex items-center justify-center">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => {
                  setShowMyListings(true);
                  setSelectedConversation(null);
                  // useEffect ile otomatik yüklenecek
                }}
                className="w-[55px] h-[55px] flex flex-col items-center justify-center gap-0.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="İlanlarım"
              >
                <Megaphone size={10} className="text-white" />
                <span className="text-[11px] font-medium">İlanlarım</span>
              </button>
              <button
                onClick={() => {
                  // İşletmem butonu - gelecekte işletme yönetimi için
                }}
                className="w-[55px] h-[55px] flex flex-col items-center justify-center gap-0.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                title="İşletmem"
              >
                <Store size={10} className="text-white" />
                <span className="text-[11px] font-medium">İşletmem</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div>
              <p className="text-sm font-semibold">{t('welcome') || 'Hoş Geldiniz'}</p>
              <p className="text-xs text-red-100">{t('loginToContinue') || 'Devam etmek için giriş yapın'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsRegister(false);
                  setShowLoginModal(true);
                }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <LogIn size={14} />
                Giriş
              </button>
              <button
                onClick={() => {
                  setIsRegister(true);
                  setShowLoginModal(true);
                }}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <UserPlus size={14} />
                Kayıt
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col">
            {/* Reklam Alanı - Kare ve Ortalanmış */}
            {advertisements && Array.isArray(advertisements) && advertisements.length > 0 ? (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full h-full max-w-lg max-h-[calc(100%-120px)] aspect-square bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-300 relative">
                  <a
                    href={advertisements[currentAdIndex]?.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    <img
                      key={`ad-${currentAdIndex}-${advertisements[currentAdIndex]?.slot}`}
                      src={advertisements[currentAdIndex]?.fileUrl || ''}
                      alt={advertisements[currentAdIndex]?.slot || 'Reklam'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Resim yüklenemedi:', advertisements[currentAdIndex]?.fileUrl);
                        e.target.src = 'https://placehold.co/600x600/3B82F6/white?text=Ad+Not+Found';
                      }}
                      onLoad={() => {
                        console.log('Reklam yüklendi:', advertisements[currentAdIndex]?.slot, advertisements[currentAdIndex]?.fileUrl);
                      }}
                    />
                  </a>
                  {advertisements.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                      {advertisements.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setCurrentAdIndex(index);
                          }}
                          className={`w-2.5 h-2.5 rounded-full transition-all ${
                            index === currentAdIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
                          }`}
                          title={`Reklam ${index + 1}`}
                        ></button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-lg aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">Reklam yükleniyor...</p>
                </div>
              </div>
            )}
            
            {/* Alt kısım - Bilgilendirme */}
            <div className="p-4 border-t bg-gray-50 text-center flex-shrink-0">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">{t('loginToMessage') || 'Mesajlaşmak için giriş yapın'}</p>
              {selectedListing && (
                <p className="text-xs text-gray-400">
                  "{selectedListing.title}" ilanına mesaj göndermek için giriş yapmanız gerekiyor.
                </p>
              )}
            </div>
          </div>
        ) : showMyListings ? (
          <>
            {/* İlanlarım Header */}
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-sm">İlanlarım</p>
                  <p className="text-xs text-gray-500">
                    {myListingsFilter === 'active' 
                      ? myListings.filter(l => !l.isSold).length 
                      : myListings.filter(l => l.isSold).length} ilan
                  </p>
              </div>
              <button
                onClick={() => setShowMyListings(false)}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
              </div>
              {/* Aktif/Satılan Filtre Butonları */}
              <div className="flex gap-2">
                <button
                  onClick={() => setMyListingsFilter('active')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
                    myListingsFilter === 'active'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Aktif
                </button>
                <button
                  onClick={() => setMyListingsFilter('sold')}
                  className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors ${
                    myListingsFilter === 'sold'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Satılan
                </button>
              </div>
            </div>

            {/* İlanlar Grid - 2 Sıra */}
            <div className="flex-1 overflow-y-auto p-4">
              {(() => {
                // Filtreye göre ilanları filtrele
                console.log('🔍 Filtreleme - myListingsFilter:', myListingsFilter);
                console.log('🔍 Filtreleme - myListings:', myListings.map(l => ({ id: l.id, title: l.title, isSold: l.isSold, isSoldType: typeof l.isSold })));
                const filteredListings = myListingsFilter === 'active'
                  ? myListings.filter(l => !l.isSold)
                  : myListings.filter(l => l.isSold === true);
                console.log('🔍 Filtreleme - filteredListings:', filteredListings.map(l => ({ id: l.id, title: l.title, isSold: l.isSold })));
                console.log('🔍 Filtreleme - isSold kontrolü:', myListings.map(l => ({ id: l.id, title: l.title, isSold: l.isSold, check: l.isSold === true })));
                
                if (filteredListings.length === 0) {
                  return (
                <div className="text-center text-gray-400 text-sm py-8">
                      {myListingsFilter === 'active' ? 'Henüz aktif ilanınız yok' : 'Henüz satılan ilanınız yok'}
                </div>
                  );
                }
                
                return (
                <div className="grid grid-cols-2 gap-3">
                    {filteredListings.map((listing) => (
                    <div
                      key={listing.id}
                      className="bg-white border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer aspect-square flex flex-col"
                      onClick={() => {
                        setSelectedListingDetail(listing);
                        setListingImageIndex(0);
                      }}
                    >
                      {/* Resim - Kare */}
                      <div className="w-full aspect-square bg-gray-100 relative">
                        {listing.image ? (
                          <img
                            src={listing.image}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/200x200/cccccc/white?text=No+Image';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                            Resim Yok
                          </div>
                        )}
                        {/* Durum Badge */}
                        <div className="absolute top-2 right-2">
                          {(() => {
                            // Önce satıldı mı kontrol et
                            const isSold = listing.isSold || false;
                            // Sonra rezerve edildi mi kontrol et
                            const isReserved = listing.isReserved || false;
                            
                            if (isSold) {
                              return (
                                <span className="text-xs px-2 py-1 rounded bg-red-500 text-white">
                                  Satıldı
                          </span>
                              );
                            } else if (isReserved) {
                              return (
                                <span className="text-xs px-2 py-1 rounded bg-yellow-500 text-white">
                                  Rezerve
                                </span>
                              );
                            } else {
                              return (
                                <span className="text-xs px-2 py-1 rounded bg-green-500 text-white">
                                  Aktif
                                </span>
                              );
                            }
                          })()}
                        </div>
                      </div>
                      {/* İçerik */}
                      <div className="p-2 flex-1 flex flex-col">
                        <h3 className="font-semibold text-sm text-gray-800 line-clamp-1">{listing.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 flex-1">{listing.description}</p>
                        <div className="mt-2">
                          <span className="text-sm font-bold text-red-600">
                            ${listing.price?.toLocaleString() || '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()}
            </div>
          </>
        ) : selectedConversation ? (
          <>
            {/* Conversation Header */}
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm">
                    {(() => {
                      const title = selectedConversation.listingTitle || '';
                      return title.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()}
                  </p>
                <p className="text-xs text-gray-500">{t('conversation') || 'Konuşma'}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  setMessages([]);
                }}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <X size={16} />
              </button>
              </div>
              {/* Rezerve Et ve Sattım Butonları - Sadece ilan sahibinde */}
              {(selectedConversation.listingOwnerId === user?.id || currentListingOwnerId === user?.id) && (
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={async () => {
                      if (listingReservation && listingReservation.reservedByUserId === user?.id) {
                        // Rezervasyon varsa ve kullanıcı rezerve eden kişiyse iptal et
                        if (await confirm('Rezervasyonu iptal etmek istediğinize emin misiniz?', 'Rezervasyon İptal')) {
                          try {
                            await cancelReservation(selectedConversation.listingId);
                            success('Rezervasyon iptal edildi!');
                            await loadListingReservation(selectedConversation.listingId);
                          } catch (err) {
                            error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                          }
                        }
                      } else {
                        // Rezervasyon yoksa veya kullanıcı rezerve eden değilse modal aç
                        setShowReserveModal(true);
                      }
                    }}
                    className={`flex-1 px-2 py-1 text-white text-[12px] rounded-md transition-colors flex items-center justify-center gap-1 ${
                      listingReservation && listingReservation.reservedByUserId === user?.id
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    <Clock size={9} />
                    {listingReservation && listingReservation.reservedByUserId === user?.id
                      ? 'Rezervasyonu Durdur'
                      : 'Rezerve Et'}
                  </button>
                  <button
                    onClick={async () => {
                      if (await confirm('Bu ilanı satıldı olarak işaretlemek istediğinize emin misiniz?', 'Satış Onayı')) {
                        try {
                          await markListingAsSold(selectedConversation.listingId, selectedConversation.otherUserId);
                          success('İlan satıldı olarak işaretlendi!');
                        } catch (err) {
                          error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                        }
                      }
                    }}
                    className="flex-1 px-2 py-1 bg-green-500 text-white text-[12px] rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle size={9} />
                    Sattım
                  </button>
                </div>
              )}
              {/* Rezervasyon Bilgisi */}
              {listingReservation && (
                <div className="mt-2 p-1.5 bg-yellow-50 border border-yellow-200 rounded text-[10px]">
                  <p className="text-yellow-800 font-semibold mb-0.5">
                    ⚠️ {(() => {
                      const text = 'Rezerve Edildi';
                      return text.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()}
                  </p>
                  <p className="text-yellow-800 text-[9px]">
                    {(() => {
                      const name = listingReservation.reservedBy || 'Kullanıcı';
                      return name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()} İçin Rezerve Edildi
                  </p>
                  {listingReservation.endTime && (
                    <p className="text-yellow-800 text-[9px] mt-0.5">
                      Bitiş: {new Date(listingReservation.endTime).toLocaleString('tr-TR', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Messages - En yeni altta (normal chat sırası) */}
            <div 
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3"
            >
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm py-8">
                  {t('noMessages') || 'Henüz mesaj yok'}
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === user.id;
                  const isReceiver = msg.receiverId === user.id;
                  const canDelete = isOwn || isReceiver; // Hem gönderen hem de alıcı silebilir
                  // Önceki mesaj aynı kişiden mi kontrol et
                  const prevMsg = index > 0 ? messages[index - 1] : null;
                  const showName = !prevMsg || prevMsg.senderId !== msg.senderId;
                  
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      {/* İsim - Sadece yeni gönderen değiştiğinde göster */}
                      {showName && (
                        <div 
                          className={`flex items-center gap-2 mb-1 ${isOwn ? 'justify-end px-2' : 'justify-start'}`}
                          style={!isOwn ? { marginLeft: '0', paddingLeft: '0.25rem', transform: 'translateX(-12%)' } : {}}
                        >
                          {/* Profil Resmi - Sadece karşı kullanıcı için */}
                          {!isOwn && (
                            <div 
                              className="cursor-pointer"
                              onClick={() => {
                                const targetUserId = msg.senderId || selectedConversation?.otherUserId;
                                if (targetUserId) {
                                  loadUserProfile(targetUserId);
                                }
                              }}
                            >
                              {msg.senderPhotoURL ? (
                                <img
                                  src={msg.senderPhotoURL}
                                  alt={msg.senderName || 'Kullanıcı'}
                                  className="w-6 h-6 rounded-full object-cover border border-gray-300"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextElementSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600 ${msg.senderPhotoURL ? 'hidden' : ''}`}>
                                {(msg.senderName?.trim() || selectedConversation?.otherUserName?.trim() || 'K')[0]?.toUpperCase()}
                              </div>
                            </div>
                          )}
                          <p 
                            className={`text-xs ${isOwn ? 'text-gray-600' : 'text-gray-500 cursor-pointer hover:text-blue-600 hover:underline uppercase'}`}
                            onClick={!isOwn ? () => {
                              const targetUserId = msg.senderId || selectedConversation?.otherUserId;
                              console.log('👆 Kullanıcı adına tıklandı:', { 
                                msgSenderId: msg.senderId, 
                                otherUserId: selectedConversation?.otherUserId,
                                targetUserId 
                              });
                              if (targetUserId) {
                                loadUserProfile(targetUserId);
                              } else {
                                console.error('❌ Kullanıcı ID bulunamadı!');
                                error('Kullanıcı ID bulunamadı');
                              }
                            } : undefined}
                          >
                            {(() => {
                              const name = isOwn 
                                ? (userProfile?.displayName?.trim() || user?.displayName?.trim() || user?.email || 'Sen')
                                : (msg.senderName?.trim() || selectedConversation?.otherUserName?.trim() || 'Kullanıcı');
                              // İsim soyisim baş harflerini büyük yap
                              return name.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                            })()}
                          </p>
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] rounded-lg p-2 relative group ${
                          isOwn
                            ? 'bg-red-100 text-gray-800' // Çok açık kırmızı
                            : 'bg-green-100 text-gray-800' // Çok açık yeşil
                        }`}
                      >
                        <p className="text-sm pr-6">
                          {(() => {
                            const message = msg.message || '';
                            // Mesaj başlığının baş harflerini büyük yap
                            return message.split(' ').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            ).join(' ');
                          })()}
                        </p>
                        {/* Satış bildirimi mesajı ise puan verme ve yorum yazma butonları */}
                        {(() => {
                          const message = (msg.message || '').toLowerCase();
                          const isSoldMessage = (message.includes('satıldı') || message.includes('sattı')) && (message.includes('puan') || message.includes('karşılıklı'));
                          const targetUserId = isOwn 
                            ? selectedConversation?.otherUserId 
                            : msg.senderId || selectedConversation?.otherUserId;
                          
                          return isSoldMessage && targetUserId ? (
                            <div className="mt-2 pt-2 border-t border-gray-300 flex gap-2">
                              <button
                                onClick={() => {
                                  if (targetUserId) {
                                    loadUserProfile(targetUserId);
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-1"
                              >
                                <Star size={12} />
                                Puan Ver & Yorum Yap
                              </button>
                            </div>
                          ) : null;
                        })()}
                        {/* Sil Butonu - Hem gönderen hem de alıcı silebilir */}
                        {canDelete && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                console.log('🗑️ Frontend: Mesaj silme isteği:', {
                                  messageId: msg.id,
                                  userId: user.id,
                                  senderId: msg.senderId,
                                  receiverId: msg.receiverId
                                });
                                await deleteMessage(msg.id);
                                // Mesajları yeniden yükle
                                await loadMessages(selectedConversation.otherUserId, selectedConversation.listingId);
                                success('Mesaj silindi!');
                              } catch (err) {
                                console.error('Mesaj silinemedi:', err);
                                error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={t('typeMessage') || 'Mesaj yazın...'}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : selectedListing && !isAuthenticated ? (
          <div className="flex-1 flex flex-col">
            {/* Reklam Alanı */}
            {advertisements && Array.isArray(advertisements) && advertisements.length > 0 ? (
              <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md aspect-square bg-white rounded-lg shadow-lg overflow-hidden border-2 border-gray-200 relative">
                  <a
                    href={advertisements[currentAdIndex]?.url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                  >
                    {advertisements[currentAdIndex]?.type === 'video' ? (
                      <video
                        src={advertisements[currentAdIndex].fileUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        loop
                        muted
                        playsInline
                        onError={(e) => {
                          console.error('Video yüklenemedi:', advertisements[currentAdIndex].fileUrl, e);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : advertisements[currentAdIndex]?.type === 'flash' ? (
                      <embed
                        src={advertisements[currentAdIndex].fileUrl}
                        type="application/x-shockwave-flash"
                        className="w-full h-full"
                      />
                    ) : (
                      <img
                        key={`ad-${currentAdIndex}-${advertisements[currentAdIndex]?.id}`}
                        src={advertisements[currentAdIndex]?.fileUrl || ''}
                        alt={advertisements[currentAdIndex]?.title || 'Reklam'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error('Resim yüklenemedi:', advertisements[currentAdIndex]?.fileUrl);
                          e.target.src = 'https://placehold.co/400x400/3B82F6/white?text=Ad+Not+Found';
                        }}
                        onLoad={() => {
                          console.log('Reklam yüklendi:', advertisements[currentAdIndex]?.title, advertisements[currentAdIndex]?.fileUrl);
                        }}
                      />
                    )}
                  </a>
                  {advertisements.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                      {advertisements.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full ${
                            index === currentAdIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1"></div>
            )}
            
            {/* Alt kısım - Bilgilendirme */}
            <div className="p-4 border-t bg-gray-50 text-center">
              <MessageSquare size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-1">Mesaj Göndermek İçin Giriş Yapın</p>
              <p className="text-xs text-gray-400">
                "{selectedListing.title}" ilanına mesaj göndermek için giriş yapmanız gerekiyor.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4">
            <h3 className="font-semibold text-sm mb-3">{t('conversations') || 'Konuşmalar'}</h3>
            {(() => {
              console.log('🔍 Render - conversations state:', conversations.length, conversations);
              return null;
            })()}
            {conversations.length === 0 ? (
              <div className="text-center text-gray-400 text-sm py-8">
                {t('noConversations') || 'Henüz konuşma yok'}
                {selectedListing && (
                  <p className="text-xs text-gray-500 mt-2">
                    Bir ilan seçerek mesaj gönderebilirsiniz
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv, index) => {
                  // Okunmamış mesaj kontrolü
                  const lastMsg = typeof conv.lastMessage === 'string' ? null : conv.lastMessage;
                  const isUnread = lastMsg && lastMsg.senderId !== user.id && !lastMsg.read;
                  
                  return (
                    <div
                      key={index}
                      className={`group relative w-full p-[9.836px] rounded-lg transition-colors ${
                        isUnread
                          ? 'bg-green-100 hover:bg-green-200 animate-unread-blink'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <button
                        onClick={() => {
                          setSelectedConversation({
                            otherUserId: conv.otherUserId,
                            listingId: conv.listingId,
                            listingTitle: conv.listingTitle || 'Listing',
                          });
                          loadMessages(conv.otherUserId, conv.listingId);
                          // Mesajlar açıldığında bildirimi kapat
                          setTimeout(() => {
                            loadConversations();
                          }, 500);
                        }}
                        className="w-full flex items-center gap-[9.836px] pr-[26.23px]"
                      >
                        {/* Sol: İlan Resmi */}
                        <div className="flex-shrink-0 w-[45.902px] h-[45.902px] rounded-lg overflow-hidden bg-gray-200">
                          {conv.listingImage ? (
                            <img
                              src={conv.listingImage}
                              alt={conv.listingTitle || 'Listing'}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                console.error('❌ Resim yüklenemedi:', conv.listingImage);
                                e.target.src = 'https://placehold.co/56x56/cccccc/white?text=No+Image';
                              }}
                              onLoad={() => {
                                console.log('✅ Resim yüklendi:', conv.listingImage);
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-[9.836px]">
                              <MessageSquare size={17} />
                            </div>
                          )}
                        </div>
                        {/* Orta: Kullanıcı Adı ve İlan Başlığı */}
                        <div className="flex-1 min-w-0 flex flex-col gap-0">
                          <p className="text-[11.476px] font-semibold text-gray-800 truncate">
                            {(() => {
                              const name = conv.otherUserName || 'Kullanıcı';
                              // İsim soyisim baş harflerini büyük yap
                              return name.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                            })()}
                          </p>
                          <div className="flex items-center gap-[3.279px] ml-[27%]">
                            <span className="text-[10.029px]">{getCategoryEmoji(conv.category || 'housing')}</span>
                            <p className="text-[10.029px] font-bold text-gray-900 truncate">
                              {(() => {
                                const title = conv.listingTitle || 'Listing';
                                // İlan başlığının baş harflerini büyük yap
                                return title.split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ');
                              })()}
                            </p>
                          </div>
                        </div>
                        {/* Sağ: Son Mesaj */}
                        <div className="flex-shrink-0 text-right max-w-[40%]">
                          <p className={`text-[9.836px] truncate ${
                          isUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                        }`}>
                            {(() => {
                              const message = typeof conv.lastMessage === 'string' 
                            ? conv.lastMessage 
                                : (conv.lastMessage?.message || 'Mesaj yok');
                              // Mesaj başlığının baş harflerini büyük yap
                              return message.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                            })()}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const confirmed = await confirm('Bu konuşmayı silmek istediğinize emin misiniz?');
                          if (confirmed) {
                            try {
                              await deleteConversation(conv.otherUserId, conv.listingId);
                              success('Konuşma silindi!');
                              loadConversations();
                              // Eğer silinen konuşma seçiliyse, seçimi temizle
                              if (selectedConversation && 
                                  selectedConversation.otherUserId === conv.otherUserId &&
                                  selectedConversation.listingId === conv.listingId) {
                                setSelectedConversation(null);
                                setMessages([]);
                              }
                            } catch (err) {
                              console.error('Konuşma silinemedi:', err);
                              error('Konuşma silinemedi. Lütfen tekrar deneyin.');
                            }
                          }
                        }}
                        className="absolute top-[6.556px] right-[6.556px] p-[3.279px] hover:bg-red-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                        title="Konuşmayı Sil"
                      >
                        <Trash2 size={11} className="text-red-600" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profil Düzenleme Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowProfileModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Profili Düzenle</h2>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) return;
                  
                  setProfileLoading(true);
                  try {
                    console.log('📤 Profil güncelleme başlatılıyor...');
                    console.log('📤 profilePhoto:', profilePhoto);
                    console.log('📤 profilePhoto tipi:', profilePhoto ? typeof profilePhoto : 'null');
                    console.log('📤 profilePhoto instanceof File:', profilePhoto instanceof File);
                    if (profilePhoto) {
                      console.log('📤 profilePhoto.name:', profilePhoto.name);
                      console.log('📤 profilePhoto.size:', profilePhoto.size);
                      console.log('📤 profilePhoto.type:', profilePhoto.type);
                    } else {
                      console.warn('⚠️ profilePhoto NULL - Resim seçilmemiş!');
                    }
                    console.log('📤 profileForm:', profileForm);
                    
                    console.log('📤 Profil güncelleme gönderiliyor:', {
                      showPhone: profileForm.showPhone,
                      showAddress: profileForm.showAddress
                    });
                    const updatedUser = await updateUserProfile(user.id, profileForm, profilePhoto);
                    console.log('📥 Backend\'den dönen kullanıcı:', updatedUser);
                    console.log('📥 photoURL:', updatedUser?.photoURL);
                    console.log('📥 showPhone:', updatedUser?.showPhone);
                    console.log('📥 showAddress:', updatedUser?.showAddress);
                    success('Profil başarıyla güncellendi!');
                    
                    // Kullanıcı bilgilerini güncelle (photoURL dahil)
                    if (updatedUser) {
                      // localStorage'ı güncelle - updatedUser'daki tüm alanları kullan
                      const updatedUserData = { ...updatedUser };
                      console.log('💾 localStorage\'a kaydedilecek:', updatedUserData);
                      localStorage.setItem('user', JSON.stringify(updatedUserData));
                      
                      // AuthContext state'ini güncelle (sayfa yenilemeden)
                      if (setAuthUser) {
                        console.log('🔄 AuthContext user güncelleniyor:', updatedUserData);
                        setAuthUser(updatedUserData);
                      }
                      if (setAuthUserProfile) {
                        console.log('🔄 AuthContext userProfile güncelleniyor:', updatedUserData);
                        setAuthUserProfile(updatedUserData);
                      }
                    }
                    
                    setShowProfileModal(false);
                    setProfilePhoto(null);
                    setProfilePhotoPreview(null);
                  } catch (err) {
                    console.error('Profil güncellenemedi:', err);
                    error(`Profil güncellenemedi: ${err.message || 'Bilinmeyen hata'}`);
                  } finally {
                    setProfileLoading(false);
                  }
                }}
                className="space-y-4"
              >
                {/* Profil Resmi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profil Resmi</label>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {profilePhotoPreview ? (
                        <img
                          src={profilePhotoPreview}
                          alt="Profil"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                          <User size={32} className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            try {
                              const file = e.target.files[0];
                              console.log('📸 Resim seçildi:', file);
                              console.log('📸 File name:', file?.name);
                              console.log('📸 File size:', file?.size);
                              console.log('📸 File type:', file?.type);
                              if (file) {
                                console.log('✅ Resim state\'e kaydediliyor...');
                                setProfilePhoto(file);
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  try {
                                    setProfilePhotoPreview(reader.result);
                                    console.log('✅ Preview oluşturuldu');
                                  } catch (err) {
                                    console.error('❌ Preview oluşturma hatası:', err);
                                  }
                                };
                                reader.onerror = (err) => {
                                  console.error('❌ FileReader hatası:', err);
                                };
                                reader.readAsDataURL(file);
                              } else {
                                console.warn('⚠️ Dosya seçilmedi!');
                              }
                            } catch (err) {
                              console.error('❌ Resim seçim hatası:', err);
                            }
                          }}
                          className="hidden"
                        />
                        <div className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium cursor-pointer inline-block">
                          <Camera size={16} className="inline mr-2" />
                          Resim Seç
                        </div>
                      </label>
                      {profilePhoto && (
                        <button
                          type="button"
                          onClick={() => {
                            setProfilePhoto(null);
                            setProfilePhotoPreview(user?.photoURL || userProfile?.photoURL || null);
                          }}
                          className="ml-2 px-3 py-1 text-xs text-red-600 hover:text-red-700"
                        >
                          İptal
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İsim</label>
                  <input
                    type="text"
                    value={profileForm.displayName}
                    onChange={(e) => setProfileForm({ ...profileForm, displayName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="İsim"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="E-posta"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Telefon"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPhone"
                    checked={profileForm.showPhone}
                    onChange={(e) => setProfileForm({ ...profileForm, showPhone: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="showPhone" className="text-sm text-gray-700 cursor-pointer">
                    Telefonumu göster
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                  <input
                    type="text"
                    value={profileForm.postalCode}
                    onChange={(e) => setProfileForm({ ...profileForm, postalCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Posta Kodu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Adres"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showAddress"
                    checked={profileForm.showAddress}
                    onChange={(e) => setProfileForm({ ...profileForm, showAddress: e.target.checked })}
                    className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="showAddress" className="text-sm text-gray-700 cursor-pointer">
                    Adresimi göster
                  </label>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {profileLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* İlan Detay Modal */}
      {selectedListingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setSelectedListingDetail(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">İlan Detayı</h2>
                <button
                  onClick={() => setSelectedListingDetail(null)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* İlan Resimleri - Gallery (Küçükler solda, büyük sağda) */}
              {(() => {
                const images = getListingImages(selectedListingDetail);
                if (images.length === 0) return null;
                
                return (
                  <div className="mb-4 flex gap-4">
                    {/* Sol: Küçük Thumbnail'ler - Yukarıdan Aşağıya */}
                    {images.length > 1 && (
                      <div className="flex-shrink-0 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {images.map((img, idx) => (
                          <button
                            key={idx}
                            onClick={(e) => {
                              e.stopPropagation();
                              setListingImageIndex(idx);
                            }}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 relative ${
                              idx === listingImageIndex 
                                ? 'border-red-500 scale-105 shadow-md' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                                e.target.src = 'https://placehold.co/80x80/cccccc/white?text=No+Image';
                              }}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Sağ: Büyük Resim */}
                    <div className={`relative ${images.length > 1 ? 'flex-1' : 'w-full'}`}>
                      <div className="relative w-full h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={images[listingImageIndex] || 'https://placehold.co/800x500/cccccc/white?text=No+Image'}
                          alt={`${selectedListingDetail.title} - Resim ${listingImageIndex + 1}`}
                          className="max-w-full max-h-full object-contain"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/800x500/cccccc/white?text=No+Image';
                        }}
                      />
                      
                      {/* Önceki/Sonraki Butonları */}
                      {images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setListingImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                          >
                              <ChevronLeft size={18} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setListingImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors z-10"
                          >
                              <ChevronRight size={18} />
                          </button>
                          
                          {/* Resim Sayacı */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {listingImageIndex + 1} / {images.length}
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
                  <p className="text-gray-800 font-semibold">{selectedListingDetail.title}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                  <p className="text-gray-600 text-sm">{selectedListingDetail.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat</label>
                    <p className="text-red-600 font-bold text-lg">${selectedListingDetail.price?.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                    <span className={`inline-block text-xs px-3 py-1 rounded ${
                      selectedListingDetail.isSold ? 'bg-red-500 text-white' :
                      selectedListingDetail.status === 'active' ? 'bg-green-500 text-white' : 
                      selectedListingDetail.status === 'pending' ? 'bg-yellow-500 text-white' : 
                      'bg-gray-500 text-white'
                    }`}>
                      {selectedListingDetail.isSold ? 'Satıldı' :
                       selectedListingDetail.status === 'active' ? 'Aktif' : 
                       selectedListingDetail.status === 'pending' ? 'Beklemede' : 
                       'Pasif'}
                    </span>
                  </div>
                </div>
                {selectedListingDetail.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                    <p className="text-gray-600 text-sm">{selectedListingDetail.address}</p>
                  </div>
                )}
                
                {/* İlan Tipi ve Emlak Tipi - Housing için */}
                {selectedListingDetail.category === 'housing' && (
                  <div className="relative grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">İlan Tipi</label>
                      <p className="text-gray-700 font-medium">
                        {selectedListingDetail.listingType === 'rent' ? 'Kiralık' :
                         selectedListingDetail.listingType === 'sale' ? 'Satılık' :
                         selectedListingDetail.listingType === 'room-rent' ? 'Oda Kiralama' :
                         selectedListingDetail.listingType === 'roommate' ? 'Oda Arkadaşı' :
                         selectedListingDetail.listingType || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Emlak Tipi</label>
                      <p className="text-gray-700 font-medium">
                        {selectedListingDetail.propertyType === 'apartment' ? 'Daire' :
                         selectedListingDetail.propertyType === 'condo' ? 'Kondo' :
                         selectedListingDetail.propertyType === 'house' ? 'Ev' :
                         selectedListingDetail.propertyType === 'townhouse' ? 'Müstakil' :
                         selectedListingDetail.propertyType === 'basement' ? 'Bodrum Dairesi' :
                         selectedListingDetail.propertyType === 'room' ? 'Oda / Paylaşımlı' :
                         selectedListingDetail.propertyType || 'Belirtilmemiş'}
                      </p>
                    </div>
                    {/* Durum Bilgisi - Sağ üst köşede */}
                    {(() => {
                      const isSold = selectedListingDetail.isSold === true || selectedListingDetail.isSold === 'true' || selectedListingDetail.isSold === 1;
                      const isReserved = selectedListingDetail.isReserved || (listingReservation && listingReservation.endTime && new Date(listingReservation.endTime) > new Date());
                      const isActive = !isSold && !isReserved;
                      
                      if (isReserved || isActive) {
                        return (
                          <div className="absolute top-3 right-0">
                            {isReserved ? (
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
                            ) : isActive ? (
                              <div className="bg-green-300 border-2 border-green-500 rounded px-2 py-0.5 shadow-sm">
                                <p className="text-[9px] font-black text-gray-800">Aktif</p>
                              </div>
                            ) : null}
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </div>
                )}
                
                {/* Durum Bilgisi - Al Sat kategorisi için */}
                {selectedListingDetail.category === 'buysell' && (() => {
                  const isSold = selectedListingDetail.isSold === true || selectedListingDetail.isSold === 'true' || selectedListingDetail.isSold === 1;
                  const isReserved = selectedListingDetail.isReserved || (listingReservation && listingReservation.endTime && new Date(listingReservation.endTime) > new Date());
                  const isActive = !isSold && !isReserved;
                  
                  if (isReserved || isActive) {
                    return (
                      <div className="relative pt-3 border-t">
                        <div className="flex justify-end">
                          {isReserved ? (
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
                          ) : isActive ? (
                            <div className="bg-green-300 border-2 border-green-500 rounded px-2 py-0.5 shadow-sm">
                              <p className="text-[9px] font-black text-gray-800">Aktif</p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                {/* Satılan ilanlarda satıcı ve alıcı bilgileri */}
                {selectedListingDetail.isSold && selectedListingDetail.userId && (
                  <div className="pt-3 border-t">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Satıcı ve Alıcı</label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Satıcı */}
                      <button
                        onClick={async () => {
                          if (selectedListingDetail.userId) {
                            await loadUserProfile(selectedListingDetail.userId);
                          }
                        }}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left w-full"
                      >
                        <img
                          src={selectedListingDetail.userPhotoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(selectedListingDetail.userDisplayName || 'User') + '&background=random'}
                          alt={selectedListingDetail.userDisplayName || 'Kullanıcı'}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                          onError={(e) => {
                            e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">Satıcı</p>
                          <p className="font-semibold text-gray-800 text-sm">
                            {(() => {
                              const name = selectedListingDetail.userDisplayName || 'Kullanıcı';
                              return name.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ');
                            })()}
                          </p>
                        </div>
                      </button>
                      {/* Alıcı */}
                      {buyerInfo && (
                        <button
                          onClick={async () => {
                            if (buyerInfo.id) {
                              await loadUserProfile(buyerInfo.id);
                            }
                          }}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left w-full"
                        >
                          <img
                            src={buyerInfo.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(buyerInfo.displayName || 'User') + '&background=random'}
                            alt={buyerInfo.displayName || 'Kullanıcı'}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                            onError={(e) => {
                              e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 mb-1">Alıcı</p>
                            <p className="font-semibold text-gray-800 text-sm">
                              {(() => {
                                const name = buyerInfo.displayName || 'Kullanıcı';
                                return name.split(' ').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                                ).join(' ');
                              })()}
                            </p>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* İşlem Butonları */}
              <div className="flex gap-2 pt-4 border-t">
                {/* Satılan ilanlar için sadece "İlanı Sil" butonu göster */}
                {selectedListingDetail.isSold ? (
                <button
                    type="button"
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      console.log('Sil butonu tıklandı', { selectedListingDetail, user });
                      
                      if (!selectedListingDetail || !user) {
                        error('İlan bilgisi bulunamadı');
                        return;
                      }
                      
                      try {
                        const confirmed = await confirm(
                          'İlanı Sil',
                          'Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
                          'Sil',
                          'İptal',
                          'danger'
                        );
                        
                        console.log('Confirm sonucu:', confirmed);
                        
                        if (!confirmed) {
                          console.log('Kullanıcı iptal etti');
                          return;
                        }
                        
                        setListingActionLoading(true);
                        console.log('API çağrısı yapılıyor...', selectedListingDetail.id);
                        
                        const result = await deleteListing(selectedListingDetail.id);
                        console.log('API sonucu:', result);
                        
                        // İlanları yeniden yükle
                        const listings = await fetchListings(null, true);
                        const myListings = listings.filter(l => l.userId === user.id);
                        // Her ilan için satıldı ve rezerve durumunu kontrol et
                        const listingsWithStatus = await Promise.all(myListings.map(async (listing) => {
                          try {
                            const isSold = listing.isSold === true || listing.isSold === 'true' || listing.isSold === 1 || listing.isSold === '1';
                            let isReserved = false;
                            try {
                              const reservation = await getListingReservation(listing.id);
                              isReserved = reservation && new Date(reservation.endTime) > new Date() && !reservation.cancelled;
                            } catch (resErr) {
                              isReserved = false;
                            }
                            return {
                              ...listing,
                              isSold,
                              isReserved
                            };
                          } catch (err) {
                            return {
                              ...listing,
                              isSold: listing.isSold === true || listing.isSold === 'true' || listing.isSold === 1,
                              isReserved: false
                            };
                          }
                        }));
                        setMyListings(listingsWithStatus);
                        setSelectedListingDetail(null);
                        success('İlan silindi!');
                      } catch (err) {
                        console.error('İlan silinemedi:', err);
                        error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                      } finally {
                        setListingActionLoading(false);
                      }
                    }}
                    disabled={listingActionLoading || !selectedListingDetail}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 size={16} />
                    İlanı Sil
                  </button>
                ) : (
                  <>
                    {/* Aktif ilanlar için tüm butonlar */}
                    <button
                      onClick={async () => {
                        // İlanı tekrar yükle (güncel details için)
                        try {
                          const listings = await fetchListings();
                          const freshListing = listings.find(l => l.id === selectedListingDetail.id);
                          if (freshListing) {
                            // Details objesini merge et
                            const listingWithDetails = {
                              ...freshListing,
                              ...(freshListing.details || {})
                            };
                            console.log('📋 Düzenleme formu açılıyor, listing:', listingWithDetails);
                            console.log('📋 Details:', listingWithDetails.details);
                            console.log('📋 petFriendly:', listingWithDetails.petFriendly);
                            console.log('📋 hasRefrigerator:', listingWithDetails.hasRefrigerator);
                            
                    // Form verilerini doldur
                    setEditFormData({
                          title: listingWithDetails.title || '',
                          description: listingWithDetails.description || '',
                          price: listingWithDetails.price || '',
                          address: listingWithDetails.address || '',
                          city: listingWithDetails.city || '',
                          postalCode: listingWithDetails.postalCode || '',
                          listingType: listingWithDetails.listingType || '',
                          propertyType: listingWithDetails.propertyType || '',
                          bedrooms: listingWithDetails.bedrooms || '',
                          bathrooms: listingWithDetails.bathrooms || '',
                          sqft: listingWithDetails.sqft || '',
                          showPhone: listingWithDetails.showPhone !== undefined ? listingWithDetails.showPhone : true,
                          // Özellikler
                          petFriendly: listingWithDetails.petFriendly === true || listingWithDetails.petFriendly === 'true',
                          noSmoking: listingWithDetails.noSmoking === true || listingWithDetails.noSmoking === 'true',
                          furnished: listingWithDetails.furnished === true || listingWithDetails.furnished === 'true',
                          parkingIncluded: listingWithDetails.parkingIncluded === true || listingWithDetails.parkingIncluded === 'true',
                          // Beyaz Eşya
                          hasRefrigerator: listingWithDetails.hasRefrigerator === true || listingWithDetails.hasRefrigerator === 'true',
                          hasDishwasher: listingWithDetails.hasDishwasher === true || listingWithDetails.hasDishwasher === 'true',
                          hasWasher: listingWithDetails.hasWasher === true || listingWithDetails.hasWasher === 'true',
                          hasDryer: listingWithDetails.hasDryer === true || listingWithDetails.hasDryer === 'true',
                          hasMicrowave: listingWithDetails.hasMicrowave === true || listingWithDetails.hasMicrowave === 'true',
                          hasOven: listingWithDetails.hasOven === true || listingWithDetails.hasOven === 'true'
                    });
                    // Mevcut resimleri yükle
                        const existingImages = listingWithDetails.images || (listingWithDetails.image ? [listingWithDetails.image] : []);
                        setEditImages(existingImages.map(url => ({ url, isExisting: true })));
                        setShowEditModal(true);
                        
                        // Güncel veriyi state'e kaydet
                        setSelectedListingDetail(listingWithDetails);
                      } else {
                        // Eğer ilan bulunamazsa eski veriyi kullan
                        const listingWithDetails = {
                          ...selectedListingDetail,
                          ...(selectedListingDetail.details || {})
                        };
                        setEditFormData({
                          title: listingWithDetails.title || '',
                          description: listingWithDetails.description || '',
                          price: listingWithDetails.price || '',
                          address: listingWithDetails.address || '',
                          city: listingWithDetails.city || '',
                          postalCode: listingWithDetails.postalCode || '',
                          listingType: listingWithDetails.listingType || '',
                          propertyType: listingWithDetails.propertyType || '',
                          bedrooms: listingWithDetails.bedrooms || '',
                          bathrooms: listingWithDetails.bathrooms || '',
                          sqft: listingWithDetails.sqft || '',
                          showPhone: listingWithDetails.showPhone !== undefined ? listingWithDetails.showPhone : true,
                          petFriendly: listingWithDetails.petFriendly === true || listingWithDetails.petFriendly === 'true',
                          noSmoking: listingWithDetails.noSmoking === true || listingWithDetails.noSmoking === 'true',
                          furnished: listingWithDetails.furnished === true || listingWithDetails.furnished === 'true',
                          parkingIncluded: listingWithDetails.parkingIncluded === true || listingWithDetails.parkingIncluded === 'true',
                          hasRefrigerator: listingWithDetails.hasRefrigerator === true || listingWithDetails.hasRefrigerator === 'true',
                          hasDishwasher: listingWithDetails.hasDishwasher === true || listingWithDetails.hasDishwasher === 'true',
                          hasWasher: listingWithDetails.hasWasher === true || listingWithDetails.hasWasher === 'true',
                          hasDryer: listingWithDetails.hasDryer === true || listingWithDetails.hasDryer === 'true',
                          hasMicrowave: listingWithDetails.hasMicrowave === true || listingWithDetails.hasMicrowave === 'true',
                          hasOven: listingWithDetails.hasOven === true || listingWithDetails.hasOven === 'true'
                        });
                    const existingImages = selectedListingDetail.images || (selectedListingDetail.image ? [selectedListingDetail.image] : []);
                    setEditImages(existingImages.map(url => ({ url, isExisting: true })));
                    setShowEditModal(true);
                      }
                    } catch (err) {
                      console.error('İlan yüklenirken hata:', err);
                      // Hata durumunda eski veriyi kullan
                      const listingWithDetails = {
                        ...selectedListingDetail,
                        ...(selectedListingDetail.details || {})
                      };
                      setEditFormData({
                        title: listingWithDetails.title || '',
                        description: listingWithDetails.description || '',
                        price: listingWithDetails.price || '',
                        address: listingWithDetails.address || '',
                        city: listingWithDetails.city || '',
                        postalCode: listingWithDetails.postalCode || '',
                        listingType: listingWithDetails.listingType || '',
                        propertyType: listingWithDetails.propertyType || '',
                        bedrooms: listingWithDetails.bedrooms || '',
                        bathrooms: listingWithDetails.bathrooms || '',
                        sqft: listingWithDetails.sqft || '',
                        showPhone: listingWithDetails.showPhone !== undefined ? listingWithDetails.showPhone : true,
                        petFriendly: listingWithDetails.petFriendly === true || listingWithDetails.petFriendly === 'true',
                        noSmoking: listingWithDetails.noSmoking === true || listingWithDetails.noSmoking === 'true',
                        furnished: listingWithDetails.furnished === true || listingWithDetails.furnished === 'true',
                        parkingIncluded: listingWithDetails.parkingIncluded === true || listingWithDetails.parkingIncluded === 'true',
                        hasRefrigerator: listingWithDetails.hasRefrigerator === true || listingWithDetails.hasRefrigerator === 'true',
                        hasDishwasher: listingWithDetails.hasDishwasher === true || listingWithDetails.hasDishwasher === 'true',
                        hasWasher: listingWithDetails.hasWasher === true || listingWithDetails.hasWasher === 'true',
                        hasDryer: listingWithDetails.hasDryer === true || listingWithDetails.hasDryer === 'true',
                        hasMicrowave: listingWithDetails.hasMicrowave === true || listingWithDetails.hasMicrowave === 'true',
                        hasOven: listingWithDetails.hasOven === true || listingWithDetails.hasOven === 'true'
                      });
                      const existingImages = selectedListingDetail.images || (selectedListingDetail.image ? [selectedListingDetail.image] : []);
                      setEditImages(existingImages.map(url => ({ url, isExisting: true })));
                      setShowEditModal(true);
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 size={16} />
                  Düzenle
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Beklemede Yap butonu tıklandı', { selectedListingDetail, user });
                    
                    if (!selectedListingDetail || !user) {
                      error('İlan bilgisi bulunamadı');
                      return;
                    }
                    
                    const newStatus = selectedListingDetail.status === 'active' ? 'pending' : 'active';
                    console.log('Yeni durum:', newStatus);
                    
                    try {
                      const confirmed = await confirm(
                        'İlan Durumu Değiştir',
                        `İlanı ${newStatus === 'active' ? 'aktif' : 'beklemede'} yapmak istediğinizden emin misiniz?`,
                        'Evet',
                        'İptal',
                        'warning'
                      );
                      
                      console.log('Confirm sonucu:', confirmed);
                      
                      if (!confirmed) {
                        console.log('Kullanıcı iptal etti');
                        return;
                      }
                      
                      setListingActionLoading(true);
                      console.log('API çağrısı yapılıyor...', selectedListingDetail.id, { status: newStatus });
                      
                      const result = await updateListing(selectedListingDetail.id, { status: newStatus });
                      console.log('API sonucu:', result);
                      
                      // İlanları yeniden yükle
                      const listings = await fetchListings();
                      const myListings = listings.filter(l => l.userId === user.id);
                      setMyListings(myListings);
                      
                      // Detayı güncelle
                      setSelectedListingDetail({ ...selectedListingDetail, status: newStatus });
                      success('İlan durumu güncellendi!');
                    } catch (err) {
                      console.error('İlan durumu güncellenemedi:', err);
                      error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                    } finally {
                      setListingActionLoading(false);
                    }
                  }}
                  disabled={listingActionLoading || !selectedListingDetail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {selectedListingDetail.status === 'active' ? (
                    <>
                      <Pause size={16} />
                      Beklemede Yap
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Aktif Yap
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Sil butonu tıklandı', { selectedListingDetail, user });
                    
                    if (!selectedListingDetail || !user) {
                      error('İlan bilgisi bulunamadı');
                      return;
                    }
                    
                    try {
                      const confirmed = await confirm(
                        'İlanı Sil',
                        'Bu ilanı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!',
                        'Sil',
                        'İptal',
                        'danger'
                      );
                      
                      console.log('Confirm sonucu:', confirmed);
                      
                      if (!confirmed) {
                        console.log('Kullanıcı iptal etti');
                        return;
                      }
                      
                      setListingActionLoading(true);
                      console.log('API çağrısı yapılıyor...', selectedListingDetail.id);
                      
                      const result = await deleteListing(selectedListingDetail.id);
                      console.log('API sonucu:', result);
                      
                      // İlanları yeniden yükle
                      const listings = await fetchListings();
                      const myListings = listings.filter(l => l.userId === user.id);
                      setMyListings(myListings);
                      setSelectedListingDetail(null);
                      success('İlan silindi!');
                    } catch (err) {
                      console.error('İlan silinemedi:', err);
                      error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                    } finally {
                      setListingActionLoading(false);
                    }
                  }}
                  disabled={listingActionLoading || !selectedListingDetail}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash2 size={16} />
                  İlanı Sil
                </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* İlan Düzenleme Modal */}
      {showEditModal && selectedListingDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">İlanı Düzenle</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!selectedListingDetail) return;

                  setListingActionLoading(true);
                  try {
                    // Yeni yüklenen resimleri yükle
                    let imageUrls = [];
                    const newImageFiles = editImages.filter(img => img.file).map(img => img.file);
                    const existingImageUrls = editImages.filter(img => img.isExisting && img.url).map(img => img.url);
                    
                    if (newImageFiles.length > 0) {
                      const uploadedUrls = await uploadImages(newImageFiles, 'listings');
                      imageUrls = [...existingImageUrls, ...uploadedUrls];
                    } else {
                      imageUrls = existingImageUrls;
                    }
                    
                    // Özellikler ve beyaz eşya bilgilerini details objesine ayır
                    const details = {};
                    const featureKeys = ['petFriendly', 'noSmoking', 'furnished', 'parkingIncluded'];
                    const applianceKeys = ['hasRefrigerator', 'hasDishwasher', 'hasWasher', 'hasDryer', 'hasMicrowave', 'hasOven'];
                    
                    // Tüm özellikleri ekle (false değerleri de dahil)
                    featureKeys.forEach(key => {
                      details[key] = editFormData[key] === true || editFormData[key] === 'true';
                    });
                    
                    // Tüm beyaz eşya özelliklerini ekle (false değerleri de dahil)
                    applianceKeys.forEach(key => {
                      details[key] = editFormData[key] === true || editFormData[key] === 'true';
                    });
                    
                    // En az bir true değeri var mı kontrol et
                    const hasAnyTrue = Object.values(details).some(v => v === true);
                    console.log('📤 İlan düzenleme - Details gönderiliyor:', details);
                    console.log('📤 Details keys:', Object.keys(details));
                    console.log('📤 En az bir true değeri var mı:', hasAnyTrue);
                    
                    // Eğer hiç true değeri yoksa, en azından boş bir obje gönder (backend'de kaydedilsin)
                    if (!hasAnyTrue) {
                      console.log('⚠️ Tüm değerler false, ama yine de kaydediliyor');
                    }
                    
                    await updateListing(selectedListingDetail.id, {
                      title: editFormData.title,
                      description: editFormData.description,
                      price: parseFloat(editFormData.price) || 0,
                      address: editFormData.address,
                      city: editFormData.city,
                      postalCode: editFormData.postalCode,
                      listingType: editFormData.listingType || null,
                      propertyType: editFormData.propertyType || null,
                      bedrooms: editFormData.bedrooms || null,
                      bathrooms: editFormData.bathrooms || null,
                      sqft: editFormData.sqft || null,
                      showPhone: editFormData.showPhone !== undefined ? editFormData.showPhone : true,
                      image: imageUrls[0] || '',
                      images: imageUrls,
                      details: details
                    });
                    
                    // İlanları yeniden yükle
                    const listings = await fetchListings();
                    const myListings = listings.filter(l => l.userId === user.id);
                    setMyListings(myListings);
                    
                    // Detayı güncelle - Details objesini merge et
                    const updatedListing = listings.find(l => l.id === selectedListingDetail.id);
                    if (updatedListing) {
                      const listingWithDetails = {
                        ...updatedListing,
                        ...(updatedListing.details || {})
                      };
                      setSelectedListingDetail(listingWithDetails);
                      console.log('✅ İlan güncellendi, details:', listingWithDetails.details);
                    }
                    
                    setShowEditModal(false);
                    success('İlan başarıyla güncellendi!');
                  } catch (err) {
                    console.error('İlan güncellenemedi:', err);
                    error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                  } finally {
                    setListingActionLoading(false);
                  }
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlık *</label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="İlan başlığı"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama *</label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="İlan açıklaması"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (CAD) *</label>
                    <input
                      type="number"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu</label>
                    <input
                      type="text"
                      value={editFormData.postalCode}
                      onChange={(e) => setEditFormData({ ...editFormData, postalCode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Posta Kodu"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                  <input
                    type="text"
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Şehir"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Adres</label>
                  <textarea
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    placeholder="Tam adres"
                    rows={2}
                  />
                </div>

                {/* İlan Tipi ve Emlak Tipi - Sadece Housing için */}
                {selectedListingDetail?.category === 'housing' && (
                  <>
                    <div className="grid grid-cols-2 gap-3 border-t pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">İlan Tipi *</label>
                        <select
                          value={editFormData.listingType}
                          onChange={(e) => setEditFormData({ ...editFormData, listingType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        >
                          <option value="">Seçiniz</option>
                          <option value="rent">Kiralık</option>
                          <option value="sale">Satılık</option>
                          <option value="room-rent">Oda Kiralama</option>
                          <option value="roommate">Oda Arkadaşı</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Emlak Tipi *</label>
                        <select
                          value={editFormData.propertyType}
                          onChange={(e) => setEditFormData({ ...editFormData, propertyType: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          required
                        >
                          <option value="">Seçiniz</option>
                          <option value="apartment">Daire</option>
                          <option value="condo">Kondo</option>
                          <option value="house">Ev</option>
                          <option value="townhouse">Müstakil</option>
                          <option value="basement">Bodrum Dairesi</option>
                          <option value="room">Oda / Paylaşımlı</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Yatak Sayısı</label>
                        <select
                          value={editFormData.bedrooms}
                          onChange={(e) => setEditFormData({ ...editFormData, bedrooms: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Seçiniz</option>
                          <option value="studio">Stüdyo</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5+">5+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banyo Sayısı</label>
                        <select
                          value={editFormData.bathrooms}
                          onChange={(e) => setEditFormData({ ...editFormData, bathrooms: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        >
                          <option value="">Seçiniz</option>
                          <option value="1">1</option>
                          <option value="1.5">1.5</option>
                          <option value="2">2</option>
                          <option value="2.5">2.5</option>
                          <option value="3">3</option>
                          <option value="3+">3+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metrekare (sqft)</label>
                        <input
                          type="number"
                          value={editFormData.sqft}
                          onChange={(e) => setEditFormData({ ...editFormData, sqft: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* İletişim Numarası Göster/Gizle */}
                {selectedListingDetail?.category === 'housing' && (
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          İletişim Numarası
                        </label>
                        <input
                          type="text"
                          value={user?.phone || ''}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="editShowPhone"
                          checked={editFormData.showPhone !== undefined ? editFormData.showPhone : true}
                          onChange={(e) => setEditFormData({ ...editFormData, showPhone: e.target.checked })}
                          className="w-4 h-4 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <label htmlFor="editShowPhone" className="text-sm text-gray-700 cursor-pointer">
                          İlanda göster
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Özellikler - Sadece Housing için */}
                {selectedListingDetail?.category === 'housing' && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Özellikler</h3>
                    <div className="space-y-2">
                      {[
                        { key: 'petFriendly', label: 'Pet Friendly', emoji: '🐕' },
                        { key: 'noSmoking', label: 'Sigara İçilmez', emoji: '🚭' },
                        { key: 'furnished', label: 'Eşyalı', emoji: '🛋️' },
                        { key: 'parkingIncluded', label: 'Parking Dahil', emoji: '🅿️' },
                      ].map((feature) => (
                        <label
                          key={feature.key}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData[feature.key] || false}
                            onChange={(e) => setEditFormData({ ...editFormData, [feature.key]: e.target.checked })}
                            className="w-5 h-5 text-red-500 rounded"
                          />
                          <span className="text-lg">{feature.emoji}</span>
                          <span>{feature.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Beyaz Eşya - Sadece Housing için */}
                {selectedListingDetail?.category === 'housing' && (
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span>🏠</span>
                      <span>Beyaz Eşya</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { key: 'hasRefrigerator', label: 'Buzdolabı', emoji: '🧊' },
                        { key: 'hasDishwasher', label: 'Bulaşık Makinesi', emoji: '🍽️' },
                        { key: 'hasWasher', label: 'Çamaşır Makinesi', emoji: '🌀' },
                        { key: 'hasDryer', label: 'Kurutma Makinesi', emoji: '🌪️' },
                        { key: 'hasMicrowave', label: 'Mikrodalga', emoji: '📻' },
                        { key: 'hasOven', label: 'Fırın', emoji: '🔥' },
                      ].map((appliance) => (
                        <label
                          key={appliance.key}
                          className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={editFormData[appliance.key] || false}
                            onChange={(e) => setEditFormData({ ...editFormData, [appliance.key]: e.target.checked })}
                            className="w-4 h-4 text-red-500 rounded"
                          />
                          <span className="text-base">{appliance.emoji}</span>
                          <span className="text-sm">{appliance.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resim Yönetimi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resimler</label>
                  <div className="space-y-3">
                    {/* Mevcut Resimler */}
                    <div className="grid grid-cols-3 gap-3">
                      {editImages.map((img, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300">
                            {img.file ? (
                              <img
                                src={URL.createObjectURL(img.file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : img.url ? (
                              <img
                                src={img.url}
                                alt={`Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = 'https://placehold.co/200x200/cccccc/white?text=No+Image';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                Resim Yok
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditImages(editImages.filter((_, i) => i !== index));
                            }}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                            title="Resmi Sil"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {/* Yeni Resim Ekle */}
                    <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-red-500 transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <Upload size={24} className="text-gray-400" />
                        <span className="text-sm text-gray-600">Yeni Resim Ekle</span>
                        <span className="text-xs text-gray-400">(Maksimum 10 resim)</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          const newImages = files.map(file => ({
                            file,
                            preview: URL.createObjectURL(file),
                            isExisting: false
                          }));
                          setEditImages(prev => [...prev, ...newImages].slice(0, 10));
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={listingActionLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {listingActionLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Kaydet
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Login/Register Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => setShowLoginModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                </h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setLoginLoading(true);
                  try {
                    if (isRegister) {
                      await register(loginEmail, loginPassword, registerDisplayName, registerPhone, registerPostalCode);
                    } else {
                      await login(loginEmail, loginPassword);
                    }
                    setShowLoginModal(false);
                    setLoginEmail('');
                    setLoginPassword('');
                    setRegisterDisplayName('');
                    setRegisterPhone('');
                    setRegisterPostalCode('');
                  } catch (err) {
                    error(err.message || 'Bir hata oluştu');
                  } finally {
                    setLoginLoading(false);
                  }
                }}
                className="space-y-4"
              >
                {isRegister && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={registerDisplayName}
                        onChange={(e) => setRegisterDisplayName(e.target.value)}
                        placeholder="Adınız Soyadınız"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={registerPhone}
                        onChange={(e) => setRegisterPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Posta Kodu <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={registerPostalCode}
                        onChange={(e) => setRegisterPostalCode(e.target.value)}
                        placeholder="A1A 1A1"
                        required
                        pattern="[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]"
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Format: A1A 1A1 (Kanada posta kodu)</p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ornek@email.com"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loginLoading ? 'Yükleniyor...' : isRegister ? 'Kayıt Ol' : 'Giriş Yap'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setLoginEmail('');
                    setLoginPassword('');
                    setRegisterDisplayName('');
                    setRegisterPhone('');
                    setRegisterPostalCode('');
                  }}
                  className="w-full text-sm text-gray-600 hover:text-gray-800"
                >
                  {isRegister ? 'Zaten hesabınız var mı? Giriş yapın' : 'Hesabınız yok mu? Kayıt olun'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Kullanıcı Profil Popup */}
      {viewedUserProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={() => {
          setViewedUserProfile(null);
          setViewedUserListings([]);
          setEnlargedImage(null);
        }}>
          <div className="bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ maxWidth: '538px' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Kullanıcı Profili</h2>
                <button
                  onClick={() => {
                    setViewedUserProfile(null);
                    setViewedUserListings([]);
                    setEnlargedImage(null);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>

              {/* Profil Bilgileri */}
              <div className="text-center mb-6">
                <img
                  src={viewedUserProfile.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(viewedUserProfile.displayName || 'User') + '&background=random'}
                  alt={viewedUserProfile.displayName || 'Kullanıcı'}
                  className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 mx-auto mb-3 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => setEnlargedImage(viewedUserProfile.photoURL)}
                  onError={(e) => {
                    e.target.src = 'https://ui-avatars.com/api/?name=User&background=random';
                  }}
                />
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-gray-800">
                    {(() => {
                      const name = viewedUserProfile.displayName || 'Kullanıcı';
                      return name.split(' ').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                      ).join(' ');
                    })()}
                  </h3>
                  {/* Toplam Puan ve Yıldız - Açık Yeşil 3D Kare Kutu */}
                  {(() => {
                    const totalRating = viewedUserComments.length > 0 
                      ? viewedUserComments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / viewedUserComments.length 
                      : 0;
                    const averageRating = totalRating > 0 ? totalRating.toFixed(1) : '0.0';
                    return (
                      <div 
                        className="flex items-center justify-center gap-1 bg-green-200"
                        style={{
                          width: '48px',
                          height: '48px',
                          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 8px 16px rgba(134, 239, 172, 0.4)',
                          transform: 'perspective(1000px) rotateX(5deg) rotateY(-2deg)',
                          transformStyle: 'preserve-3d',
                          borderRadius: '4px'
                        }}
                      >
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-semibold text-gray-700">{averageRating}</span>
                    </div>
                    );
                  })()}
                </div>
              </div>

              {/* Puan Verme */}
              {isAuthenticated && user && viewedUserProfile.id !== user.id && (
                <div className="border-t pt-6 mb-6 relative" style={{ zIndex: 1 }}>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Puan Ver (1-10)</label>
                  {/* Puan Bildirimi */}
                  {showViewedRatingNotification && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 z-[99999]" style={{ position: 'absolute', top: '-6px' }}>
                      <div className="bg-green-300 text-gray-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg rating-notification-3d whitespace-nowrap" style={{
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
                  <div className="flex items-center gap-2 relative overflow-x-auto" style={{ zIndex: 1 }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                      <button
                        key={rating}
                        onClick={async () => {
                          setViewedUserRating(rating);
                          setShowViewedRatingNotification(true);
                          setTimeout(() => setShowViewedRatingNotification(false), 3000);
                          try {
                            await createUserRating(viewedUserProfile.id, rating);
                          } catch (err) {
                            console.error('Puan kaydedilemedi:', err);
                            error(`Hata: ${err.message || 'Puan kaydedilemedi'}`);
                          }
                        }}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                          rating <= viewedUserRating
                            ? 'bg-green-400 text-white'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {rating}
                      </button>
                    ))}
                </div>
              </div>
              )}

              {/* Yorum Yazma */}
              {isAuthenticated && user && viewedUserProfile.id !== user.id && (
                <div className="border-t pt-6 mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yorum Yap</label>
                  <textarea
                    value={viewedUserComment}
                    onChange={(e) => setViewedUserComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                    placeholder="Yorumunuzu yazın..."
                    rows={4}
                  />
                  <button
                    onClick={async () => {
                      if (viewedUserRating > 0 || viewedUserComment.trim()) {
                        try {
                          const savedComment = await createUserComment(
                            viewedUserProfile.id,
                            viewedUserComment.trim(),
                            viewedUserRating
                          );
                          setViewedUserComments([...viewedUserComments, savedComment]);
                          success('Puan ve yorum kaydedildi!');
                          setViewedUserComment('');
                        } catch (err) {
                          console.error('❌ Yorum kaydedilemedi:', err);
                          error(err?.message || 'Yorum kaydedilemedi');
                        }
                      } else {
                        error('Lütfen puan verin veya yorum yazın');
                      }
                    }}
                    className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Gönder
                  </button>
                </div>
              )}

              {/* Yorumlar Listesi */}
              {viewedUserComments.length > 0 && (
                <div className="border-t pt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Yorumlar ({viewedUserComments.length})</label>
                  <div className="space-y-3 max-h-60 overflow-y-scroll scrollbar-thin pr-2" style={{ 
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#cbd5e1 #f1f1f1'
                  }}>
                    {viewedUserComments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-gray-800">
                              {comment.userName?.split(' ').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                              ).join(' ') || 'Kullanıcı'}
                            </span>
                            {comment.rating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                <span className="text-xs text-gray-600">{comment.rating}/10</span>
                          </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                          </span>
                        </div>
                        {comment.comment && (
                          <p className="text-sm text-gray-700">{comment.comment}</p>
                        )}
                  </div>
                    ))}
                  </div>
                </div>
              )}

              {(!isAuthenticated || !user || viewedUserProfile.id === user.id) && (
                <div className="border-t pt-4 text-center text-gray-500 text-sm">
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

      {/* Rezervasyon Modal */}
      {showReserveModal && selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setShowReserveModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">İlanı Rezerve Et</h2>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-600" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Bu ilanı kaç saat için rezerve etmek istiyorsunuz?
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rezervasyon Süresi (Saat)
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={reserveHours}
                  onChange={(e) => setReserveHours(Math.max(1, Math.min(168, parseInt(e.target.value) || 1)))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 1 saat, maksimum 168 saat (7 gün)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  onClick={async () => {
                    try {
                      await reserveListing(selectedConversation.listingId, reserveHours, selectedConversation.otherUserId);
                      success(`İlan ${reserveHours} saat için rezerve edildi!`);
                      setShowReserveModal(false);
                      // Rezervasyon bilgisini yükle
                      await loadListingReservation(selectedConversation.listingId);
                    } catch (err) {
                      error(`Hata: ${err.message || 'Bilinmeyen hata'}`);
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Rezerve Et
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Büyütülmüş Resim Modal */}
      {enlargedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000]" 
          onClick={() => setEnlargedImage(null)}
        >
          <button
            onClick={() => setEnlargedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X size={32} />
          </button>
          <img
            src={enlargedImage}
            alt="Büyütülmüş resim"
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Puan ve Yorumlar Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]" onClick={() => setShowRatingModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              {/* Kapat Butonu */}
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>

              {/* Profil Bilgileri */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 mb-3">
                  {user?.photoURL || userProfile?.photoURL ? (
                    <img
                      src={user?.photoURL || userProfile?.photoURL}
                      alt={userProfile?.displayName || user?.displayName || 'Profil'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={40} className="text-gray-400" />
                    </div>
                  )}
                </div>
                <p className="text-xl font-bold text-gray-800 mb-2">
                  {(() => {
                    const name = userProfile?.displayName || user?.displayName || user?.email || 'Kullanıcı';
                    return name.split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                    ).join(' ');
                  })()}
                </p>
                <div className="flex items-center gap-1">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-lg font-bold text-gray-800">{userRating || 0}</span>
                </div>
              </div>

              {/* Ayırıcı Çizgi */}
              <div className="border-t border-gray-200 mb-6"></div>

              {/* Yorumlar Bölümü */}
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Yorumlar ({userCommentsList.length})</h3>
                {userCommentsList.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {userCommentsList.map((comment, index) => (
                      <div key={index} className="pb-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-semibold text-gray-800">
                            {comment.senderName || comment.userName || 'Kullanıcı'}
                          </span>
                          {comment.rating > 0 && (
                            <>
                              <Star size={14} className="text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-bold text-gray-800">{comment.rating}/10</span>
                            </>
                          )}
                          {comment.createdAt && (
                            <span className="text-xs text-gray-500 ml-auto">
                              {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment || 'Yorum yok'}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">Henüz yorum yapılmamış</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bildirimler Modal */}
      {showNotifications && isAuthenticated && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowNotifications(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Bildirimler</h2>
              <button
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Bildirim bulunmuyor</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                        notif.read 
                          ? 'bg-gray-50 border-gray-300' 
                          : 'bg-blue-50 border-blue-500'
                      }`}
                      onClick={async () => {
                        if (!notif.read) {
                          try {
                            await markNotificationAsReadAPI(notif.id);
                            setNotifications(prev => 
                              prev.map(n => n.id === notif.id ? {...n, read: true} : n)
                            );
                            setUnreadNotificationCount(prev => Math.max(0, prev - 1));
                          } catch (err) {
                            console.error('Bildirim okundu olarak işaretlenemedi:', err);
                          }
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm mb-1">{notif.title}</p>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          {notif.createdAt && (
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notif.createdAt).toLocaleString('tr-TR')}
                            </p>
                          )}
                        </div>
                        {!notif.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

