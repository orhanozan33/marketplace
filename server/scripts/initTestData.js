import { initDatabase, dbQuery, saveDatabase } from '../database/database.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Veritabanını başlat
initDatabase();

// Test verilerini oluştur
const initTestData = async () => {
  console.log('🚀 Test verileri oluşturuluyor...\n');

  // 1. Kullanıcıları oluştur
  console.log('📝 Kullanıcılar oluşturuluyor...\n');
  const users = [
    {
      email: 'admin@test.com',
      password: '123456',
      displayName: 'Admin User',
      role: 'admin',
      phone: '+905551234567',
      postalCode: '34000',
      showPhone: true
    },
    {
      email: 'user1@test.com',
      password: '123456',
      displayName: 'Ahmet Yılmaz',
      role: 'user',
      phone: '+905551111111',
      postalCode: '34000',
      showPhone: true
    },
    {
      email: 'user2@test.com',
      password: '123456',
      displayName: 'Ayşe Demir',
      role: 'user',
      phone: '+905552222222',
      postalCode: '35000',
      showPhone: true
    },
    {
      email: 'user3@test.com',
      password: '123456',
      displayName: 'Mehmet Kaya',
      role: 'user',
      phone: '+905553333333',
      postalCode: '06000',
      showPhone: false
    }
  ];

  const createdUsers = [];
  for (const userData of users) {
    try {
      let user = dbQuery.getUserByEmail(userData.email);
      
      if (user) {
        console.log(`⚠️  Kullanıcı zaten mevcut: ${userData.email}`);
        // Şifreyi güncelle
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        dbQuery.updateUser(user.id, { 
          password: hashedPassword,
          displayName: userData.displayName,
          role: userData.role,
          phone: userData.phone,
          postalCode: userData.postalCode,
          showPhone: userData.showPhone
        });
        user = dbQuery.getUserById(user.id);
        console.log(`   ✅ Bilgiler güncellendi\n`);
      } else {
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Kullanıcıyı oluştur
        user = dbQuery.createUser({
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          role: userData.role,
          phone: userData.phone,
          postalCode: userData.postalCode,
          showPhone: userData.showPhone,
          photoURL: null,
          isBanned: false
        });

        console.log(`✅ Kullanıcı oluşturuldu:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Şifre: ${userData.password}`);
        console.log(`   Ad: ${user.displayName}\n`);
      }
      createdUsers.push(user);
    } catch (error) {
      console.error(`❌ Hata (${userData.email}):`, error.message);
    }
  }

  // 2. İlanları oluştur
  console.log('\n🏠 İlanlar oluşturuluyor...\n');
  
  if (createdUsers.length < 2) {
    console.error('❌ Yeterli kullanıcı yok!');
    return;
  }

  const user1 = createdUsers.find(u => u.email === 'user1@test.com') || createdUsers[1];
  const user2 = createdUsers.find(u => u.email === 'user2@test.com') || createdUsers[2] || createdUsers[1];

  const listings = [
    {
      category: 'housing',
      title: 'Merkezi Konumda 2+1 Daire',
      description: 'Şehrin merkezinde, ulaşım imkanlarına yakın, ferah ve güneş alan 2+1 daire. Banyo ve mutfak tam teşekküllü. Asansörlü bina.',
      price: 15000,
      latitude: 41.0082,
      longitude: 28.9784,
      position: [41.0082, 28.9784],
      address: 'Kadıköy, İstanbul',
      postalCode: '34000',
      bedrooms: 2,
      bathrooms: 1,
      sqft: 85,
      listingType: 'rent',
      propertyType: 'apartment',
      userId: user1.id,
      userDisplayName: user1.displayName,
      userPhotoURL: user1.photoURL,
      userPhone: user1.phone,
      showPhone: user1.showPhone,
      image: 'https://placehold.co/800x600/3B82F6/white?text=2+1+Daire',
      images: ['https://placehold.co/800x600/3B82F6/white?text=2+1+Daire'],
      details: {
        petFriendly: true,
        noSmoking: true,
        furnished: false,
        parkingIncluded: true,
        hasRefrigerator: true,
        hasDishwasher: true,
        hasWasher: true,
        hasDryer: false,
        hasMicrowave: true,
        hasOven: true
      },
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      category: 'housing',
      title: 'Eşyalı Stüdyo Daire',
      description: 'Öğrenci ve genç profesyoneller için ideal, eşyalı stüdyo daire. Metroya 5 dakika yürüme mesafesi.',
      price: 8000,
      latitude: 41.0122,
      longitude: 28.9854,
      position: [41.0122, 28.9854],
      address: 'Beşiktaş, İstanbul',
      postalCode: '34000',
      bedrooms: 0,
      bathrooms: 1,
      sqft: 35,
      listingType: 'rent',
      propertyType: 'apartment',
      userId: user1.id,
      userDisplayName: user1.displayName,
      userPhotoURL: user1.photoURL,
      userPhone: user1.phone,
      showPhone: user1.showPhone,
      image: 'https://placehold.co/800x600/22C55E/white?text=Stüdyo',
      images: ['https://placehold.co/800x600/22C55E/white?text=Stüdyo'],
      details: {
        petFriendly: false,
        noSmoking: true,
        furnished: true,
        parkingIncluded: false,
        hasRefrigerator: true,
        hasDishwasher: false,
        hasWasher: false,
        hasDryer: false,
        hasMicrowave: true,
        hasOven: false
      },
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      category: 'housing',
      title: 'Satılık 3+1 Müstakil Ev',
      description: 'Bahçeli, geniş otoparklı, 3+1 müstakil ev. Çocuklu aileler için ideal. Okul ve marketlere yakın.',
      price: 2500000,
      latitude: 41.0152,
      longitude: 28.9904,
      position: [41.0152, 28.9904],
      address: 'Üsküdar, İstanbul',
      postalCode: '34000',
      bedrooms: 3,
      bathrooms: 2,
      sqft: 150,
      listingType: 'sale',
      propertyType: 'house',
      userId: user2.id,
      userDisplayName: user2.displayName,
      userPhotoURL: user2.photoURL,
      userPhone: user2.phone,
      showPhone: user2.showPhone,
      image: 'https://placehold.co/800x600/F97316/white?text=3+1+Ev',
      images: ['https://placehold.co/800x600/F97316/white?text=3+1+Ev'],
      details: {
        petFriendly: true,
        noSmoking: true,
        furnished: false,
        parkingIncluded: true,
        hasRefrigerator: true,
        hasDishwasher: true,
        hasWasher: true,
        hasDryer: true,
        hasMicrowave: true,
        hasOven: true
      },
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      category: 'vehicle',
      title: '2020 Honda Civic - Düşük KM',
      description: 'Bakımlı, kazasız, düşük kilometreli 2020 model Honda Civic. Tek elden, özenle kullanılmış.',
      price: 450000,
      latitude: 41.0182,
      longitude: 28.9954,
      position: [41.0182, 28.9954],
      address: 'Şişli, İstanbul',
      postalCode: '34000',
      year: 2020,
      mileage: 35000,
      vehicleType: 'sedan',
      make: 'Honda',
      model: 'Civic',
      transmission: 'automatic',
      fuelType: 'gas',
      userId: user2.id,
      userDisplayName: user2.displayName,
      userPhotoURL: user2.photoURL,
      userPhone: user2.phone,
      showPhone: user2.showPhone,
      image: 'https://placehold.co/800x600/22C55E/white?text=Honda+Civic',
      images: ['https://placehold.co/800x600/22C55E/white?text=Honda+Civic'],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      category: 'buysell',
      title: 'IKEA Koltuk Takımı - İkinci El',
      description: 'Çok iyi durumda, temiz, 3+2 IKEA koltuk takımı. Taşınma nedeniyle satılık.',
      price: 3500,
      latitude: 41.0202,
      longitude: 29.0004,
      position: [41.0202, 29.0004],
      address: 'Beyoğlu, İstanbul',
      postalCode: '34000',
      itemCategory: 'furniture',
      condition: 'good',
      brand: 'IKEA',
      userId: user1.id,
      userDisplayName: user1.displayName,
      userPhotoURL: user1.photoURL,
      userPhone: user1.phone,
      showPhone: user1.showPhone,
      image: 'https://placehold.co/800x600/F97316/white?text=IKEA+Koltuk',
      images: ['https://placehold.co/800x600/F97316/white?text=IKEA+Koltuk'],
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];

  for (const listingData of listings) {
    try {
      // Aynı başlıkta ilan var mı kontrol et
      const existingListing = dbQuery.getListings().find(
        l => l.title === listingData.title && l.userId === listingData.userId
      );

      if (existingListing) {
        console.log(`⚠️  İlan zaten mevcut: ${listingData.title}`);
        // İlanı güncelle
        dbQuery.updateListing(existingListing.id, listingData);
        console.log(`   ✅ İlan güncellendi\n`);
      } else {
        // İlanı oluştur
        const listing = dbQuery.createListing(listingData);
        console.log(`✅ İlan oluşturuldu:`);
        console.log(`   Başlık: ${listing.title}`);
        console.log(`   Kategori: ${listing.category}`);
        console.log(`   Fiyat: ${listing.price} TL\n`);
      }
    } catch (error) {
      console.error(`❌ Hata (${listingData.title}):`, error.message);
    }
  }

  // 3. Özet
  console.log('\n📊 Veritabanı Özeti:');
  console.log(`   Kullanıcılar: ${dbQuery.getUsers().length}`);
  console.log(`   İlanlar: ${dbQuery.getListings().length}`);
  console.log(`   Mesajlar: ${dbQuery.getAllMessages().length}`);
  console.log('\n✅ Test verileri başarıyla oluşturuldu!');
  console.log('\n🔑 Test Kullanıcıları:');
  console.log('   Admin: admin@test.com / 123456');
  console.log('   User 1: user1@test.com / 123456');
  console.log('   User 2: user2@test.com / 123456');
  console.log('   User 3: user3@test.com / 123456');
};

initTestData().catch(console.error);


