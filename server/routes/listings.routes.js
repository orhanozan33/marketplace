import express from 'express';
import { authenticateToken, getUserById } from '../auth/auth.js';
import { dbQuery } from '../database/database.js';
import { jsonMiddleware } from '../middleware/json.middleware.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// URL normalize helper
const normalizeImageUrl = (url, req) => {
  if (!url) return url;
  try {
    if (url.includes('/uploads/listings/')) {
      const parts = url.split('/uploads/listings/');
      if (parts.length > 1) {
        const filename = parts[1].split('/').pop();
        url = `/uploads/listings/${filename}`;
      }
    }
    if (url.startsWith('/uploads/')) {
      url = `${req.protocol}://${req.get('host')}${url}`;
    }
  } catch (urlError) {
    console.error(`❌ URL normalize edilirken hata:`, urlError);
  }
  return url;
};

// Tüm ilanları getir
router.get('/', (req, res) => {
  try {
    const { category, status, includeSold } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status) filters.status = status;
    
    console.log('📋 GET /api/listings - Filtreler:', filters, 'includeSold:', includeSold);
    let listings = dbQuery.getListings(filters);
    
    const soldListings = dbQuery.getSoldListings();
    const soldListingIds = new Set(soldListings.map(sale => sale.listingId));
    
    if (!includeSold || includeSold !== 'true') {
      listings = listings.filter(listing => !soldListingIds.has(listing.id));
    } else {
      listings = listings.map(listing => ({
        ...listing,
        isSold: soldListingIds.has(listing.id)
      }));
    }
    
    const listingsWithDetails = listings.map(listing => {
      let details = {};
      try {
        details = dbQuery.getListingDetails(listing.id);
      } catch (detailsError) {
        console.error(`❌ İlan ${listing.id} için details okunurken hata:`, detailsError);
        details = {};
      }
      
      let imageUrl = listing.image;
      let imagesArray = [];
      try {
        imagesArray = listing.images ? (typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images) : [listing.image].filter(Boolean);
      } catch (parseError) {
        imagesArray = listing.image ? [listing.image] : [];
      }
      
      imageUrl = normalizeImageUrl(imageUrl, req);
      imagesArray = imagesArray.map(url => normalizeImageUrl(url, req)).filter(Boolean);
      
      let videosArray = [];
      try {
        videosArray = listing.videos ? (typeof listing.videos === 'string' ? JSON.parse(listing.videos) : listing.videos) : [];
        videosArray = videosArray.map(url => normalizeImageUrl(url, req)).filter(Boolean);
      } catch (videoError) {
        videosArray = [];
      }
      
      const listingUser = dbQuery.getUserById(listing.userId);
      const isSoldValue = listing.isSold === true || listing.isSold === 'true' || listing.isSold === 1 || listing.isSold === '1';
      
      return {
        ...listing,
        position: [listing.latitude, listing.longitude],
        details: details || {},
        image: imageUrl || imagesArray[0] || `https://placehold.co/300x200/3B82F6/white?text=${listing.category}`,
        images: imagesArray.length > 0 ? imagesArray : [imageUrl || `https://placehold.co/300x200/3B82F6/white?text=${listing.category}`].filter(Boolean),
        videos: videosArray,
        userPhone: listingUser?.phone || null,
        userDisplayName: listingUser?.displayName || null,
        userPhotoURL: listingUser?.photoURL || null,
        showPhone: listing.showPhone !== undefined ? listing.showPhone : true,
        price: typeof listing.price === 'string' ? parseFloat(listing.price) || 0 : (listing.price || 0),
        createdAt: listing.createdAt,
        created_at: listing.createdAt,
        isSold: isSoldValue
      };
    });
    
    res.json(listingsWithDetails);
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ error: 'İlanlar yüklenirken hata oluştu' });
  }
});

// Tek ilan getir
router.get('/:id', (req, res) => {
  try {
    const listing = dbQuery.getListingById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    const details = dbQuery.getListingDetails(listing.id);
    
    let imageUrl = listing.image;
    let imagesArray = listing.images ? (typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images) : [listing.image].filter(Boolean);
    
    imageUrl = normalizeImageUrl(imageUrl, req);
    imagesArray = imagesArray.map(url => normalizeImageUrl(url, req));
    
    let videosArray = listing.videos ? (typeof listing.videos === 'string' ? JSON.parse(listing.videos) : listing.videos) : [];
    videosArray = videosArray.map(url => normalizeImageUrl(url, req));
    
    const listingUser = dbQuery.getUserById(listing.userId);
    
    res.json({
      ...listing,
      position: [listing.latitude, listing.longitude],
      details: details || {},
      image: imageUrl || imagesArray[0] || `https://placehold.co/300x200/3B82F6/white?text=${listing.category}`,
      images: imagesArray.length > 0 ? imagesArray : [imageUrl || `https://placehold.co/300x200/3B82F6/white?text=${listing.category}`],
      videos: videosArray,
      userPhone: listingUser?.phone || null,
      userDisplayName: listingUser?.displayName || null,
      userPhotoURL: listingUser?.photoURL || null,
      showPhone: listing.showPhone !== undefined ? listing.showPhone : true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Yeni ilan oluştur
router.post('/', authenticateToken, (req, res) => {
  try {
    const listingData = req.body;
    
    const listing = dbQuery.createListing({
      userId: req.userId,
      category: listingData.category,
      title: listingData.title,
      description: listingData.description || '',
      price: listingData.price || 0,
      latitude: listingData.latitude || listingData.position?.[0] || 49.2827,
      longitude: listingData.longitude || listingData.position?.[1] || -123.1207,
      address: listingData.address || listingData.postalCode || '',
      postalCode: listingData.postalCode || '',
      city: listingData.city || '',
      province: listingData.province || '',
      image: listingData.image || '',
      images: JSON.stringify(listingData.images || [listingData.image].filter(Boolean)),
      videos: JSON.stringify(listingData.videos || []),
      showPhone: listingData.showPhone !== undefined ? listingData.showPhone : true,
      status: listingData.status || 'active',
      views: 0,
      listingType: listingData.listingType || null,
      propertyType: listingData.propertyType || null,
      bedrooms: listingData.bedrooms || null,
      bathrooms: listingData.bathrooms || null,
      sqft: listingData.sqft || null,
      userPhone: listingData.userPhone || null
    });
    
    if (listingData.details && Object.keys(listingData.details).length > 0) {
      dbQuery.saveListingDetails(listing.id, listingData.details);
    }
    
    const details = dbQuery.getListingDetails(listing.id);
    const listingUser = dbQuery.getUserById(listing.userId);
    
    res.status(201).json({
      ...listing,
      position: [listing.latitude, listing.longitude],
      details: details || {},
      images: listing.images ? (typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images) : [listing.image].filter(Boolean),
      videos: listing.videos ? (typeof listing.videos === 'string' ? JSON.parse(listing.videos) : listing.videos) : [],
      userPhone: listingUser?.phone || null,
      userDisplayName: listingUser?.displayName || null,
      userPhotoURL: listingUser?.photoURL || null,
      showPhone: listing.showPhone !== undefined ? listing.showPhone : true
    });
  } catch (error) {
    console.error('Error creating listing:', error);
    res.status(500).json({ error: error.message || 'İlan oluşturulurken hata oluştu' });
  }
});

// İlan güncelle
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const listing = dbQuery.getListingById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    const user = getUserById(req.userId);
    if (listing.userId !== req.userId && user?.role !== 'admin' && user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    const updateData = req.body;
    const updates = {};
    
    if (updateData.title !== undefined) updates.title = updateData.title;
    if (updateData.description !== undefined) updates.description = updateData.description;
    if (updateData.price !== undefined) updates.price = updateData.price;
    if (updateData.latitude !== undefined || updateData.position) updates.latitude = updateData.latitude || updateData.position?.[0];
    if (updateData.longitude !== undefined || updateData.position) updates.longitude = updateData.longitude || updateData.position?.[1];
    if (updateData.address !== undefined) updates.address = updateData.address;
    if (updateData.city !== undefined) updates.city = updateData.city;
    if (updateData.postalCode !== undefined) updates.postalCode = updateData.postalCode;
    if (updateData.image !== undefined) updates.image = updateData.image;
    if (updateData.images !== undefined) updates.images = JSON.stringify(updateData.images);
    if (updateData.videos !== undefined) updates.videos = JSON.stringify(updateData.videos);
    if (updateData.showPhone !== undefined) updates.showPhone = updateData.showPhone;
    if (updateData.status !== undefined) updates.status = updateData.status;
    if (updateData.listingType !== undefined) updates.listingType = updateData.listingType;
    if (updateData.propertyType !== undefined) updates.propertyType = updateData.propertyType;
    if (updateData.bedrooms !== undefined) updates.bedrooms = updateData.bedrooms;
    if (updateData.bathrooms !== undefined) updates.bathrooms = updateData.bathrooms;
    if (updateData.sqft !== undefined) updates.sqft = updateData.sqft;
    if (updateData.userPhone !== undefined) updates.userPhone = updateData.userPhone;
    
    const oldPrice = listing.price;
    const newPrice = updateData.price;
    const priceChanged = newPrice !== undefined && oldPrice !== undefined && newPrice !== oldPrice;
    
    const updated = dbQuery.updateListing(req.params.id, updates);
    
    if (priceChanged && newPrice < oldPrice) {
      const messageUsers = dbQuery.getListingMessageUsers(req.params.id);
      const priceDifference = oldPrice - newPrice;
      
      messageUsers.forEach(userId => {
        dbQuery.createNotification({
          userId,
          listingId: req.params.id,
          type: 'price_drop',
          title: 'Fiyat Düştü!',
          message: `"${listing.title}" ilanında fiyat ${oldPrice} TL'den ${newPrice} TL'ye düşürüldü. Bu bir fırsat! (${priceDifference} TL indirim)`,
          listingTitle: listing.title,
          oldPrice,
          newPrice
        });
      });
    }
    
    if (updateData.details && typeof updateData.details === 'object' && Object.keys(updateData.details).length > 0) {
      dbQuery.saveListingDetails(req.params.id, updateData.details);
    }
    
    const details = dbQuery.getListingDetails(req.params.id);
    const listingUser = dbQuery.getUserById(updated.userId);
    
    res.json({
      ...updated,
      position: [updated.latitude, updated.longitude],
      details: details || {},
      images: updated.images ? (typeof updated.images === 'string' ? JSON.parse(updated.images) : updated.images) : [updated.image].filter(Boolean),
      videos: updated.videos ? (typeof updated.videos === 'string' ? JSON.parse(updated.videos) : updated.videos) : [],
      userPhone: listingUser?.phone || null,
      userDisplayName: listingUser?.displayName || null,
      userPhotoURL: listingUser?.photoURL || null,
      showPhone: updated.showPhone !== undefined ? updated.showPhone : true
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// İlan sil
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const listing = dbQuery.getListingById(req.params.id);
    
    if (!listing) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    const user = getUserById(req.userId);
    if (listing.userId !== req.userId && user?.role !== 'admin' && user?.role !== 'superadmin') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    dbQuery.deleteListing(req.params.id);
    res.json({ success: true, message: 'İlan silindi' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// İlanı rezerve et
router.post('/:listingId/reserve', jsonMiddleware, authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { hours, sellerId } = req.body || {};
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    if (!hours || hours < 1 || hours > 168) {
      return res.status(400).json({ error: 'Rezervasyon süresi 1-168 saat arasında olmalıdır' });
    }
    
    const listing = dbQuery.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + parseInt(hours));
    
    const reservationData = {
      listingId,
      reservedByUserId: req.userId,
      sellerId: sellerId || listing.userId,
      hours: parseInt(hours),
      endTime: endTime.toISOString()
    };
    
    const reservation = dbQuery.createReservation(reservationData);
    const reservedByUser = dbQuery.getUserById(req.userId);
    
    const messageUsers = dbQuery.getListingMessageUsers(listingId);
    const reservedByUserName = reservedByUser?.displayName || 'Kullanıcı';
    const reservationEndTime = new Date(reservation.endTime);
    const endTimeStr = reservationEndTime.toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    messageUsers.forEach(userId => {
      if (userId !== req.userId) {
        dbQuery.createNotification({
          userId,
          listingId,
          type: 'reservation',
          title: 'İlan Rezerve Edildi',
          message: `"${listing.title}" ilanı ${reservedByUserName} tarafından ${endTimeStr} tarihine kadar rezerve edildi.`,
          listingTitle: listing.title,
          reservedByUserId: req.userId,
          reservedByName: reservedByUserName,
          endTime: reservation.endTime
        });
      }
    });
    
    res.json({
      ...reservation,
      reservedByName: reservedByUserName
    });
  } catch (error) {
    if (error.message && error.message.includes('zaten rezerve edilmiş')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message || 'Rezervasyon oluşturulamadı' });
  }
});

// İlan rezervasyon bilgisini getir
router.get('/:listingId/reservation', (req, res) => {
  try {
    const { listingId } = req.params;
    const reservation = dbQuery.getReservation(listingId);
    
    if (!reservation) {
      return res.json({ isReserved: false });
    }
    
    const endTime = new Date(reservation.endTime);
    const now = new Date();
    
    if (endTime <= now) {
      return res.json({ isReserved: false });
    }
    
    const reservedByUser = dbQuery.getUserById(reservation.reservedByUserId);
    
    res.json({
      isReserved: true,
      ...reservation,
      reservedByName: reservedByUser?.displayName || 'Kullanıcı'
    });
  } catch (error) {
    res.status(500).json({ error: error.message || 'Rezervasyon bilgisi getirilemedi' });
  }
});

// Rezervasyonu iptal et
router.post('/:listingId/reservation/cancel', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    const cancelled = dbQuery.cancelReservation(listingId, req.userId);
    
    if (!cancelled) {
      return res.status(404).json({ error: 'Rezervasyon bulunamadı veya iptal edilemez' });
    }
    
    res.json({ success: true, message: 'Rezervasyon iptal edildi' });
  } catch (error) {
    res.status(500).json({ 
      error: error.message || 'Rezervasyon iptal edilemedi'
    });
  }
});

// İlan satış bilgisini getir
router.get('/:listingId/sale', (req, res) => {
  try {
    const { listingId } = req.params;
    const sale = dbQuery.getListingSale(listingId);
    
    if (sale) {
      res.json(sale);
    } else {
      res.status(200).json(null);
    }
  } catch (error) {
    res.status(500).json({ error: error.message || 'Satış bilgisi alınamadı' });
  }
});

// İlanı satıldı olarak işaretle
router.post('/:listingId/sold', authenticateToken, (req, res) => {
  try {
    const { listingId } = req.params;
    const { buyerId } = req.body;
    
    if (!req.userId) {
      return res.status(401).json({ error: 'Kimlik doğrulaması gerekli' });
    }
    
    const listing = dbQuery.getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'İlan bulunamadı' });
    }
    
    if (listing.userId !== req.userId) {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }
    
    const saleData = {
      listingId,
      sellerId: req.userId,
      buyerId: buyerId || null,
      soldAt: new Date().toISOString()
    };
    
    const sale = dbQuery.markListingAsSold(saleData);
    
    const messageUsers = dbQuery.getListingMessageUsers(listingId);
    
    messageUsers.forEach(userId => {
      dbQuery.createNotification({
        userId,
        listingId,
        type: 'sold',
        title: 'İlan Satıldı',
        message: `"${listing.title}" ilanı satıldı ve listeden kaldırıldı.`,
        listingTitle: listing.title
      });
    });
    
    if (buyerId) {
      const seller = dbQuery.getUserById(req.userId);
      
      const buyerMessage = {
        id: uuidv4(),
        conversationId: `${buyerId}_${req.userId}_${listingId}`,
        senderId: req.userId,
        receiverId: buyerId,
        listingId,
        message: `${seller?.displayName || 'Kullanıcı'} Bu Ilanı Size Sattı. Karşılıklı Puan Vermeniz Önerilir.`,
        timestamp: new Date().toISOString(),
        read: false
      };
      dbQuery.createMessage(buyerMessage);
    }
    
    res.json(sale);
  } catch (error) {
    console.error('❌ İlan satıldı olarak işaretlenemedi:', error);
    res.status(500).json({ error: error.message || 'İlan satıldı olarak işaretlenemedi' });
  }
});

export default router;


