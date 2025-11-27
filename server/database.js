import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'database.json');

// Veritabanını yükle veya oluştur
const loadDatabase = () => {
  if (fs.existsSync(dbPath)) {
    const data = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(data);
    // Eğer messages field'ı yoksa ekle (migration)
    if (!db.messages || !Array.isArray(db.messages)) {
      db.messages = [];
    }
    // Eğer user_ratings field'ı yoksa ekle (migration)
    if (!db.user_ratings || !Array.isArray(db.user_ratings)) {
      db.user_ratings = [];
    }
    // Eğer user_comments field'ı yoksa ekle (migration)
    if (!db.user_comments || !Array.isArray(db.user_comments)) {
      db.user_comments = [];
    }
    // Eğer listing_reservations field'ı yoksa ekle (migration)
    if (!db.listing_reservations || !Array.isArray(db.listing_reservations)) {
      db.listing_reservations = [];
    }
    // Eğer listing_sales field'ı yoksa ekle (migration)
    if (!db.listing_sales || !Array.isArray(db.listing_sales)) {
      db.listing_sales = [];
    }
    saveDatabase(db);
    return db;
  }
    return {
    users: [],
    listings: [],
    listing_details: [],
    messages: [],
    user_ratings: [],
    user_comments: [],
    listing_reservations: [],
    listing_sales: []
  };
};

// Veritabanını kaydet
const saveDatabase = (db) => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
    console.log('💾 Database başarıyla kaydedildi:', dbPath);
  } catch (error) {
    console.error('❌ Database kaydetme hatası:', error);
    throw error;
  }
};

// saveDatabase'i export et (server/index.js'de kullanmak için)
export { saveDatabase };

let db = loadDatabase();

// Veritabanı başlat
export const initDatabase = () => {
  console.log('✅ JSON veritabanı başlatıldı:', dbPath);
};

// loadDatabase'i export et (server/index.js'de kullanmak için)
export { loadDatabase };

// Veritabanı helper fonksiyonları
export const dbQuery = {
  // Users
  getUsers: () => {
    if (!db.users || !Array.isArray(db.users)) {
      console.warn('⚠️ db.users geçersiz, boş array döndürülüyor');
      db.users = [];
      saveDatabase(db);
    }
    return db.users;
  },
  getUserById: (id) => db.users.find(u => u.id === id),
  getUserByEmail: (email) => db.users.find(u => u.email === email),
  createUser: (userData) => {
    const user = { ...userData, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.users.push(user);
    saveDatabase(db);
    return user;
  },
  updateUser: (id, updates) => {
    const user = db.users.find(u => u.id === id);
    if (user) {
      console.log('🔄 updateUser çağrıldı:', { id, updates });
      console.log('🔄 Güncellemeden önce user.photoURL:', user.photoURL);
      
      // updates null veya undefined ise boş obje kullan
      const safeUpdates = updates && typeof updates === 'object' ? updates : {};
      Object.assign(user, safeUpdates, { updatedAt: new Date().toISOString() });
      
      console.log('🔄 Güncellemeden sonra user.photoURL:', user.photoURL);
      saveDatabase(db);
      console.log('💾 Database kaydedildi');
      // Database dosyasını oku ve kontrol et
      const savedDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      const savedUser = savedDb.users.find(u => u.id === id);
      console.log('📖 Database\'den okunan user.photoURL:', savedUser?.photoURL);
      return user;
    }
    return null;
  },
  deleteUser: (id) => {
    const index = db.users.findIndex(u => u.id === id);
    if (index !== -1) {
      db.users.splice(index, 1);
      saveDatabase(db);
      return true;
    }
    return false;
  },

  // Listings
  getListings: (filters = {}) => {
    // Database'i yeniden yükle (güncel veriler için)
    db = loadDatabase();
    console.log('📋 getListings çağrıldı - Toplam ilan sayısı:', db.listings?.length || 0);
    let listings = [...(db.listings || [])];
    if (filters.category) {
      listings = listings.filter(l => l.category === filters.category);
      console.log('📋 Kategori filtresi uygulandı:', filters.category, '- Filtrelenmiş ilan sayısı:', listings.length);
    }
    if (filters.status) {
      listings = listings.filter(l => l.status === filters.status);
      console.log('📋 Status filtresi uygulandı:', filters.status, '- Filtrelenmiş ilan sayısı:', listings.length);
    }
    const sorted = listings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    console.log('📋 getListings döndürüyor:', sorted.length, 'ilan');
    return sorted;
  },
  getListingById: (id) => db.listings.find(l => l.id === id),
  createListing: (listingData) => {
    const listing = { ...listingData, id: uuidv4(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.listings.push(listing);
    saveDatabase(db);
    return listing;
  },
  updateListing: (id, updates) => {
    const listing = db.listings.find(l => l.id === id);
    if (listing) {
      Object.assign(listing, updates, { updatedAt: new Date().toISOString() });
      saveDatabase(db);
      return listing;
    }
    return null;
  },
  deleteListing: (id) => {
    const index = db.listings.findIndex(l => l.id === id);
    if (index !== -1) {
      db.listings.splice(index, 1);
      // İlgili details'leri de sil
      db.listing_details = db.listing_details.filter(ld => ld.listingId !== id);
      saveDatabase(db);
      return true;
    }
    return false;
  },

  // Listing Details
  getListingDetails: (listingId) => {
    try {
      const details = db.listing_details.find(ld => ld.listingId === listingId);
      const result = details ? details.details : {};
      // Sadece housing kategorisi için log (çok fazla log olmasın)
      // console.log('📖 getListingDetails çağrıldı:', { listingId, found: !!details, result, keys: Object.keys(result || {}) });
      return result;
    } catch (error) {
      console.error('❌ getListingDetails hatası:', error);
      return {};
    }
  },
  saveListingDetails: (listingId, details) => {
    console.log('💾 saveListingDetails çağrıldı:', { listingId, details, keys: Object.keys(details || {}) });
    const existing = db.listing_details.find(ld => ld.listingId === listingId);
    if (existing) {
      existing.details = details;
      console.log('✅ Mevcut details güncellendi');
    } else {
      const newDetail = { id: uuidv4(), listingId, details };
      db.listing_details.push(newDetail);
      console.log('✅ Yeni details eklendi:', newDetail);
    }
    saveDatabase(db);
    console.log('💾 Database kaydedildi, toplam details sayısı:', db.listing_details.length);
  },

  // Messages
  getAllMessages: () => {
    if (!db.messages) {
      db.messages = [];
      saveDatabase(db);
    }
    return db.messages;
  },
  getMessages: (filters = {}) => {
    try {
      if (!db.messages || !Array.isArray(db.messages)) {
        db = loadDatabase();
        if (!db.messages) {
          db.messages = [];
        }
      }
      
      let messages = db.messages.filter(m => m && m.id); // Geçersiz mesajları filtrele
      
      if (filters.userId) {
        messages = messages.filter(m => 
          m.senderId === filters.userId || m.receiverId === filters.userId
        );
      }
      if (filters.listingId) {
        messages = messages.filter(m => m.listingId === filters.listingId);
      }
      if (filters.otherUserId && filters.userId) {
        messages = messages.filter(m => 
          (m.senderId === filters.userId && m.receiverId === filters.otherUserId) ||
          (m.senderId === filters.otherUserId && m.receiverId === filters.userId)
        );
      }
      
      // Kullanıcı için silinmiş mesajları filtrele
      if (filters.userId) {
        messages = messages.filter(m => {
          // Eğer mesaj bu kullanıcı için silinmişse gösterme
          if (m.deletedFor && Array.isArray(m.deletedFor) && m.deletedFor.includes(filters.userId)) {
            return false;
          }
          return true;
        });
      }
      
      // Tarih sıralaması yaparken hata yakalama
      return messages.sort((a, b) => {
        try {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateA - dateB;
        } catch (sortError) {
          console.error('❌ Mesaj sıralama hatası:', sortError);
          return 0;
        }
      });
    } catch (error) {
      console.error('❌ getMessages hatası:', error);
      return [];
    }
  },
  createMessage: (messageData) => {
    const message = { ...messageData, id: uuidv4(), createdAt: new Date().toISOString() };
    if (!db.messages) {
      db.messages = [];
    }
    db.messages.push(message);
    saveDatabase(db);
    return message;
  },
  getAllMessages: () => {
    if (!db.messages) {
      db.messages = [];
      saveDatabase(db);
    }
    return db.messages;
  },
  getMessageById: (id) => {
    if (!db.messages) {
      db.messages = [];
      saveDatabase(db);
    }
    return db.messages.find(m => m.id === id);
  },
  updateMessage: (id, updates) => {
    if (!db.messages) {
      db.messages = [];
      saveDatabase(db);
    }
    const index = db.messages.findIndex(m => m.id === id);
    if (index !== -1) {
      db.messages[index] = { ...db.messages[index], ...updates };
      saveDatabase(db);
      return db.messages[index];
    }
    return null;
  },
  deleteMessage: (id, userId) => {
    try {
      if (!db.messages) {
        db = loadDatabase();
        if (!db.messages) {
          db.messages = [];
        }
      }
      
      const index = db.messages.findIndex(m => m.id === id);
      if (index === -1) {
        return false;
      }
      
      const message = db.messages[index];
      
      // Eğer mesaj zaten silinmişse, diğer kullanıcı için de sil
      if (message.deletedFor && Array.isArray(message.deletedFor)) {
        // Her iki kullanıcı da silmişse mesajı tamamen sil
        if (message.deletedFor.includes(userId)) {
          // Zaten bu kullanıcı için silinmiş
          return true;
        }
        // Diğer kullanıcı için de sil
        message.deletedFor.push(userId);
        if (message.deletedFor.length >= 2) {
          // Her iki kullanıcı da silmişse mesajı tamamen sil
          db.messages.splice(index, 1);
        }
      } else {
        // İlk silme işlemi - sadece bu kullanıcı için işaretle
        message.deletedFor = [userId];
      }
      
      saveDatabase(db);
      return true;
    } catch (error) {
      console.error('❌ deleteMessage hatası:', error);
      return false;
    }
  },
  deleteConversation: (userId, otherUserId, listingId) => {
    try {
      if (!db.messages) {
        db.messages = [];
        saveDatabase(db);
        return 0;
      }
      
      // Bu konuşmadaki tüm mesajları bul ve sil
      const messagesToDelete = db.messages.filter(msg => 
        msg.listingId === listingId &&
        ((msg.senderId === userId && msg.receiverId === otherUserId) ||
         (msg.senderId === otherUserId && msg.receiverId === userId))
      );
      
      // Mesajları sil
      messagesToDelete.forEach(msg => {
        const index = db.messages.findIndex(m => m.id === msg.id);
        if (index !== -1) {
          db.messages.splice(index, 1);
        }
      });
      
      saveDatabase(db);
      return messagesToDelete.length;
    } catch (error) {
      console.error('❌ deleteConversation hatası:', error);
      return 0;
    }
  },
  getConversations: (userId) => {
    try {
      console.log('🔍 getConversations çağrıldı, userId:', userId);
      
      if (!db.messages) {
        db.messages = [];
        saveDatabase(db);
      }
      
      if (!Array.isArray(db.messages)) {
        console.error('❌ db.messages bir array değil:', typeof db.messages);
        db.messages = [];
        saveDatabase(db);
      }
      
      const userMessages = db.messages.filter(m => 
        m && 
        (m.senderId === userId || m.receiverId === userId) &&
        m.listingId
      );
      
      console.log('📨 User messages bulundu:', userMessages.length);
      
      const conversationsMap = new Map();
      
      userMessages.forEach(msg => {
        try {
          if (!msg.senderId || !msg.receiverId || !msg.listingId) {
            console.warn('⚠️ Geçersiz mesaj:', msg);
            return;
          }
          
          const otherUserId = msg.senderId === userId ? msg.receiverId : msg.senderId;
          const key = `${msg.listingId}_${otherUserId}`;
          
          if (!conversationsMap.has(key)) {
            const listing = db.listings?.find(l => l && l.id === msg.listingId);
            // İlan resmini al (image veya images array'inden ilk resim)
            let listingImage = null;
            const listingOwnerId = listing?.userId || null;
            if (listing) {
              // Önce image field'ını kontrol et
              if (listing.image) {
                listingImage = listing.image;
              } 
              // Sonra images array'ini kontrol et
              else if (listing.images) {
                try {
                  const images = typeof listing.images === 'string' ? JSON.parse(listing.images) : listing.images;
                  if (Array.isArray(images) && images.length > 0) {
                    listingImage = images[0];
                  }
                } catch (e) {
                  console.error('Error parsing listing images:', e);
                }
              }
              
              // URL'leri normalize et (localhost:3001 -> localhost:3000 ve relative URL'leri düzelt)
              if (listingImage) {
                // Port numarasını düzelt
                listingImage = listingImage.replace('localhost:3001', 'localhost:3000');
                // Relative URL'leri full URL'e çevir (eğer sadece path ise)
                if (listingImage.startsWith('/uploads/')) {
                  listingImage = `http://localhost:3000${listingImage}`;
                }
              }
              
              console.log('📸 Listing image for conversation:', {
                listingId: listing.id,
                listingTitle: listing.title,
                image: listing.image,
                images: listing.images,
                listingImage: listingImage
              });
            } else {
              console.warn('⚠️ Listing bulunamadı:', msg.listingId);
            }
            conversationsMap.set(key, {
              listingId: msg.listingId,
              otherUserId,
              listingTitle: listing?.title || 'Listing',
              listingImage: listingImage || null,
              category: listing?.category || 'housing',
              listingOwnerId: listing?.userId || null,
              lastMessage: {
                id: msg.id,
                message: msg.message || '',
                senderId: msg.senderId,
                createdAt: msg.createdAt || new Date().toISOString()
              },
              lastMessageTime: msg.createdAt || new Date().toISOString()
            });
          } else {
            const conv = conversationsMap.get(key);
            const msgDate = new Date(msg.createdAt || 0);
            const convDate = new Date(conv.lastMessageTime || 0);
            
            if (msgDate > convDate) {
              conv.lastMessage = {
                id: msg.id,
                message: msg.message || '',
                senderId: msg.senderId,
                createdAt: msg.createdAt || new Date().toISOString()
              };
              conv.lastMessageTime = msg.createdAt || new Date().toISOString();
            }
          }
        } catch (msgError) {
          console.error('❌ Mesaj işleme hatası:', msgError);
        }
      });
      
      const result = Array.from(conversationsMap.values());
      console.log('📤 getConversations result:', result.map(c => ({
        listingTitle: c.listingTitle,
        listingImage: c.listingImage,
        listingId: c.listingId
      })));
      
      return result;
    } catch (error) {
      console.error('❌ getConversations hatası:', error);
      return [];
    }
  },

  // User Ratings
  getUserRatings: (userId) => {
    if (!db.user_ratings || !Array.isArray(db.user_ratings)) {
      db.user_ratings = [];
      saveDatabase(db);
    }
    return db.user_ratings.filter(r => r.ratedUserId === userId);
  },
  createUserRating: (ratingData) => {
    if (!db.user_ratings || !Array.isArray(db.user_ratings)) {
      db.user_ratings = [];
    }
    // Aynı kullanıcıdan aynı kullanıcıya daha önce puan verilmişse hata döndür
    const existingIndex = db.user_ratings.findIndex(
      r => r.userId === ratingData.userId && r.ratedUserId === ratingData.ratedUserId
    );
    if (existingIndex !== -1) {
      throw new Error('Bu kullanıcıya zaten puan verdiniz. Her kullanıcı sadece 1 kez puan verebilir.');
    }
    const rating = {
      ...ratingData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.user_ratings.push(rating);
    saveDatabase(db);
    return rating;
  },

  // User Comments
  getUserComments: (userId) => {
    if (!db.user_comments || !Array.isArray(db.user_comments)) {
      db.user_comments = [];
      saveDatabase(db);
    }
    return db.user_comments.filter(c => c.ratedUserId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  createUserComment: (commentData) => {
    if (!db.user_comments || !Array.isArray(db.user_comments)) {
      db.user_comments = [];
    }
    // Aynı kullanıcıdan aynı kullanıcıya daha önce yorum yapılmışsa hata döndür
    const existingComment = db.user_comments.find(
      c => c.userId === commentData.userId && c.ratedUserId === commentData.ratedUserId
    );
    if (existingComment) {
      throw new Error('Bu kullanıcıya zaten yorum yaptınız. Her kullanıcı sadece 1 kez yorum yapabilir.');
    }
    const comment = {
      ...commentData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.user_comments.push(comment);
    saveDatabase(db);
    return comment;
  },

  // Listing Reservations
  createReservation: (reservationData) => {
    if (!db.listing_reservations || !Array.isArray(db.listing_reservations)) {
      db.listing_reservations = [];
    }
    // Aynı ilan için aktif rezervasyon varsa hata döndür
    const activeReservation = db.listing_reservations.find(
      r => r.listingId === reservationData.listingId && 
           new Date(r.endTime) > new Date() &&
           !r.cancelled
    );
    if (activeReservation) {
      throw new Error('Bu ilan zaten rezerve edilmiş.');
    }
    const reservation = {
      ...reservationData,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      cancelled: false
    };
    db.listing_reservations.push(reservation);
    saveDatabase(db);
    return reservation;
  },

  getReservation: (listingId) => {
    try {
      if (!db.listing_reservations || !Array.isArray(db.listing_reservations)) {
        return null;
      }
      
      const now = new Date();
      const reservation = db.listing_reservations.find(
        r => r && 
             r.listingId === listingId && 
             !r.cancelled &&
             r.endTime &&
             new Date(r.endTime) > now
      );
      
      return reservation || null;
    } catch (error) {
      console.error('❌ getReservation hatası:', error);
      return null;
    }
  },

  cancelReservation: (listingId, userId) => {
    try {
      console.log('🔍 cancelReservation çağrıldı:', { listingId, userId });
      
      if (!db.listing_reservations || !Array.isArray(db.listing_reservations)) {
        console.warn('⚠️ listing_reservations array yok veya geçersiz');
        return null;
      }
      
      console.log('📋 Toplam rezervasyon sayısı:', db.listing_reservations.length);
      
      const reservation = db.listing_reservations.find(
        r => r && 
             r.listingId === listingId && 
             r.reservedByUserId === userId &&
             !r.cancelled
      );
      
      console.log('🔍 Bulunan rezervasyon:', reservation ? {
        id: reservation.id,
        listingId: reservation.listingId,
        reservedByUserId: reservation.reservedByUserId,
        endTime: reservation.endTime,
        cancelled: reservation.cancelled
      } : 'Bulunamadı');
      
      if (reservation) {
        // End time kontrolü - eğer geçmişteyse de iptal edilebilir
        const endTime = new Date(reservation.endTime);
        const now = new Date();
        
        reservation.cancelled = true;
        reservation.cancelledAt = new Date().toISOString();
        saveDatabase(db);
        console.log('✅ Rezervasyon iptal edildi');
        return reservation;
      }
      
      console.warn('⚠️ Rezervasyon bulunamadı');
      return null;
    } catch (error) {
      console.error('❌ cancelReservation hatası:', error);
      console.error('❌ Hata stack:', error.stack);
      throw error;
    }
  },

  // Listing Sales
  markListingAsSold: (saleData) => {
    if (!db.listing_sales || !Array.isArray(db.listing_sales)) {
      db.listing_sales = [];
    }
    const sale = {
      ...saleData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    db.listing_sales.push(sale);
    saveDatabase(db);
    return sale;
  },

  getListingSale: (listingId) => {
    if (!db.listing_sales || !Array.isArray(db.listing_sales)) {
      return null;
    }
    return db.listing_sales.find(s => s.listingId === listingId) || null;
  },

  getSoldListings: () => {
    if (!db.listing_sales || !Array.isArray(db.listing_sales)) {
      return [];
    }
    return db.listing_sales;
  }

};

export default dbQuery;
