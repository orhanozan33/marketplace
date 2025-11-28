import { initDatabase, dbQuery } from '../database/database.js';
import bcrypt from 'bcryptjs';

// Veritabanını başlat
initDatabase();

// Emir ve Aslan şifrelerini güncelle
const updateEmirAslan = async () => {
  console.log('🔄 Emir ve Aslan şifreleri güncelleniyor...\n');

  const users = [
    {
      email: 'emir@example.com',
      password: '33333333',
      displayName: 'Emir'
    },
    {
      email: 'aslan@example.com',
      password: '33333333',
      displayName: 'Aslan'
    }
  ];

  for (const userData of users) {
    try {
      const existingUser = dbQuery.getUserByEmail(userData.email);
      
      if (existingUser) {
        console.log(`📝 Kullanıcı bulundu: ${userData.email}`);
        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        
        // Şifreyi güncelle
        dbQuery.updateUser(existingUser.id, { 
          password: hashedPassword,
          displayName: userData.displayName
        });
        
        console.log(`✅ Şifre güncellendi: ${userData.email}`);
        console.log(`   Şifre: ${userData.password}\n`);
      } else {
        console.log(`⚠️  Kullanıcı bulunamadı: ${userData.email}`);
        // Kullanıcı yoksa oluştur
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = dbQuery.createUser({
          email: userData.email,
          password: hashedPassword,
          displayName: userData.displayName,
          role: 'user',
          phone: '+905551111111',
          postalCode: '34000',
          showPhone: true,
          photoURL: null,
          isBanned: false
        });
        console.log(`✅ Kullanıcı oluşturuldu: ${userData.email}`);
        console.log(`   Şifre: ${userData.password}\n`);
      }
    } catch (error) {
      console.error(`❌ Hata (${userData.email}):`, error.message);
    }
  }

  console.log('\n📋 Güncel Kullanıcılar:');
  const allUsers = dbQuery.getUsers();
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role || 'user'}) - ${user.displayName}`);
  });
};

updateEmirAslan().catch(console.error);

