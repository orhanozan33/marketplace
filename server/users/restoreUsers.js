import { initDatabase, dbQuery } from '../database/database.js';
import bcrypt from 'bcryptjs';

// Veritabanını başlat
initDatabase();

// Orijinal kullanıcıları geri ekle
const restoreUsers = async () => {
  console.log('🔄 Orijinal kullanıcılar geri ekleniyor...\n');

  const users = [
    {
      email: 'orhanozan33@gmail.com',
      password: '33333333',
      displayName: 'Orhan Ozan',
      role: 'admin',
      phone: '+905551234567',
      postalCode: '34000',
      showPhone: true
    },
    {
      email: 'emir@example.com', // Email'i doğru olmayabilir, güncellemeniz gerekebilir
      password: '123456',
      displayName: 'Emir',
      role: 'user',
      phone: '+905551111111',
      postalCode: '34000',
      showPhone: true
    },
    {
      email: 'aslan@example.com', // Email'i doğru olmayabilir, güncellemeniz gerekebilir
      password: '123456',
      displayName: 'Aslan',
      role: 'user',
      phone: '+905552222222',
      postalCode: '34000',
      showPhone: true
    }
  ];

  for (const userData of users) {
    try {
      // Email kontrolü
      const existingUser = dbQuery.getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log(`⚠️  Kullanıcı zaten mevcut: ${userData.email}`);
        // Bilgileri güncelle
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        dbQuery.updateUser(existingUser.id, { 
          password: hashedPassword,
          displayName: userData.displayName,
          role: userData.role,
          phone: userData.phone,
          postalCode: userData.postalCode,
          showPhone: userData.showPhone
        });
        console.log(`   ✅ Bilgiler güncellendi\n`);
      } else {
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Kullanıcıyı oluştur
        const user = dbQuery.createUser({
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
        console.log(`   Ad: ${user.displayName}`);
        console.log(`   Role: ${user.role}\n`);
      }
    } catch (error) {
      console.error(`❌ Hata (${userData.email}):`, error.message);
    }
  }

  // Tüm kullanıcıları listele
  console.log('\n📋 Tüm Kullanıcılar:');
  const allUsers = dbQuery.getUsers();
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role || 'user'}) - ${user.displayName}`);
  });
};

restoreUsers().catch(console.error);

