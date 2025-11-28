import { initDatabase, dbQuery } from '../database/database.js';
import bcrypt from 'bcryptjs';

// Veritabanını başlat
initDatabase();

// Kullanıcıları ekle
const addUsers = async () => {
  const users = [
    {
      email: 'orhanozan33@gmail.com',
      password: '33333333',
      displayName: 'Admin User',
      role: 'admin'
    },
    {
      email: 'user1@example.com',
      password: '123456',
      displayName: 'Test User 1',
      role: 'user'
    },
    {
      email: 'user2@example.com',
      password: '123456',
      displayName: 'Test User 2',
      role: 'user'
    }
  ];

  console.log('📝 Kullanıcılar ekleniyor...\n');

  for (const userData of users) {
    try {
      // Email kontrolü
      const existingUser = dbQuery.getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log(`⚠️  Kullanıcı zaten mevcut: ${userData.email}`);
        // Şifreyi güncelle
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        dbQuery.updateUser(existingUser.id, { 
          password: hashedPassword,
          displayName: userData.displayName,
          role: userData.role
        });
        console.log(`   ✅ Şifre ve bilgiler güncellendi\n`);
      } else {
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Kullanıcıyı oluştur
        const user = dbQuery.createUser({
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          role: userData.role,
          photoURL: null,
          isBanned: false
        });

        console.log(`✅ Kullanıcı oluşturuldu:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Şifre: ${userData.password}`);
        console.log(`   Role: ${user.role}\n`);
      }
    } catch (error) {
      console.error(`❌ Hata (${userData.email}):`, error.message);
    }
  }

  // Tüm kullanıcıları listele
  console.log('\n📋 Mevcut Kullanıcılar:');
  const allUsers = dbQuery.getUsers();
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role}) - ${user.displayName}`);
  });
};

addUsers();

