import { initDatabase, dbQuery, loadDatabase } from '../database/database.js';
import bcrypt from 'bcryptjs';

// Veritabanını başlat
initDatabase();

// Email adreslerini gmail olarak güncelle
const updateEmails = async () => {
  console.log('🔄 Email adresleri gmail olarak güncelleniyor...\n');

  const db = loadDatabase();
  
  // Emir'i bul
  const emirOld = db.users.find(u => u.email === 'emir@example.com');
  const aslanOld = db.users.find(u => u.email === 'aslan@example.com');

  if (emirOld) {
    console.log(`📝 Emir bulundu: ${emirOld.email} -> emir@gmail.com`);
    
    // Yeni email ile kullanıcı var mı kontrol et
    const emirNew = dbQuery.getUserByEmail('emir@gmail.com');
    if (emirNew && emirNew.id !== emirOld.id) {
      console.log(`⚠️  emir@gmail.com zaten başka bir kullanıcı tarafından kullanılıyor`);
    } else {
      // Email'i güncelle
      dbQuery.updateUser(emirOld.id, { 
        email: 'emir@gmail.com'
      });
      console.log(`✅ Emir email güncellendi: emir@gmail.com\n`);
    }
  } else {
    console.log(`⚠️  Emir kullanıcısı bulunamadı`);
  }

  if (aslanOld) {
    console.log(`📝 Aslan bulundu: ${aslanOld.email} -> aslan@gmail.com`);
    
    // Yeni email ile kullanıcı var mı kontrol et
    const aslanNew = dbQuery.getUserByEmail('aslan@gmail.com');
    if (aslanNew && aslanNew.id !== aslanOld.id) {
      console.log(`⚠️  aslan@gmail.com zaten başka bir kullanıcı tarafından kullanılıyor`);
    } else {
      // Email'i güncelle
      dbQuery.updateUser(aslanOld.id, { 
        email: 'aslan@gmail.com'
      });
      console.log(`✅ Aslan email güncellendi: aslan@gmail.com\n`);
    }
  } else {
    console.log(`⚠️  Aslan kullanıcısı bulunamadı`);
  }

  console.log('\n📋 Güncel Kullanıcılar:');
  const allUsers = dbQuery.getUsers();
  allUsers.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} (${user.role || 'user'}) - ${user.displayName}`);
  });
};

updateEmails().catch(console.error);

