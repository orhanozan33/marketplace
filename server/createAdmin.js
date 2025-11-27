import { initDatabase, dbQuery } from './database.js';
import bcrypt from 'bcryptjs';

// Veritabanını başlat
initDatabase();

// Admin kullanıcı oluştur
const createAdmin = async () => {
  try {
    const email = 'orhanozan33@gmail.com';
    const password = '33333333';
    const displayName = 'Admin User';

    // Email kontrolü
    const existingUser = dbQuery.getUserByEmail(email);
    if (existingUser) {
      console.log('✅ Admin kullanıcı zaten mevcut:', email);
      // Şifreyi güncelle
      const hashedPassword = await bcrypt.hash(password, 10);
      dbQuery.updateUser(existingUser.id, { 
        password: hashedPassword,
        role: 'admin' 
      });
      console.log('✅ Admin şifresi güncellendi');
      return;
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10);

    // Admin kullanıcıyı oluştur
    const user = dbQuery.createUser({
      email,
      password: hashedPassword,
      displayName,
      role: 'admin',
      photoURL: null,
      isBanned: false
    });

    console.log('✅ Admin kullanıcı oluşturuldu:');
    console.log('   Email:', email);
    console.log('   Şifre:', password);
    console.log('   Role:', user.role);
  } catch (error) {
    console.error('❌ Hata:', error);
  }
};

createAdmin();

