// Firebase Admin SDK ile admin kullanıcı oluşturma scripti
// Kullanım: node scripts/createAdminUser.js

import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env dosyasını yükle
dotenv.config({ path: join(__dirname, '..', '.env') });

// Firebase Admin SDK yapılandırması
// NOT: Firebase Console > Project Settings > Service Accounts > Generate new private key
// İndirdiğiniz JSON dosyasını proje kök dizinine "firebase-service-account.json" olarak kaydedin

let adminApp;
let adminAuth;
let adminDb;

try {
  // Service Account JSON dosyasını yükle
  const serviceAccount = await import('../firebase-service-account.json', { assert: { type: 'json' } });
  
  adminApp = initializeApp({
    credential: cert(serviceAccount.default),
  });
  
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
  
  console.log('✅ Firebase Admin SDK başlatıldı');
} catch (error) {
  console.error('❌ Firebase Admin SDK başlatılamadı:', error.message);
  console.error('\n💡 Lütfen şunları yapın:');
  console.error('1. Firebase Console > Project Settings > Service Accounts');
  console.error('2. "Generate new private key" butonuna tıklayın');
  console.error('3. İndirdiğiniz JSON dosyasını proje kök dizinine "firebase-service-account.json" olarak kaydedin');
  process.exit(1);
}

// Admin kullanıcı oluştur
async function createAdminUser() {
  const email = 'orhanozan33@gmail.com'; // Email formatında olmalı
  const password = '33333333';
  const displayName = 'Admin User';

  try {
    // Kullanıcı oluştur
    console.log(`\n📝 Kullanıcı oluşturuluyor: ${email}...`);
    const userRecord = await adminAuth.createUser({
      email: email,
      password: password,
      displayName: displayName,
      emailVerified: true,
    });

    console.log('✅ Kullanıcı oluşturuldu:', userRecord.uid);

    // Firestore'da admin rolü ver
    console.log('🔐 Admin rolü veriliyor...');
    await adminDb.collection('users').doc(userRecord.uid).set({
      email: email,
      displayName: displayName,
      role: 'admin',
      createdAt: new Date(),
      isBanned: false,
    });

    console.log('✅ Admin rolü verildi!');
    console.log('\n📋 Kullanıcı Bilgileri:');
    console.log(`   Email: ${email}`);
    console.log(`   Şifre: ${password}`);
    console.log(`   UID: ${userRecord.uid}`);
    console.log(`   Rol: admin`);
    console.log('\n🎉 Admin kullanıcı başarıyla oluşturuldu!');
    console.log('💡 Artık bu bilgilerle giriş yapabilirsiniz.');

    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log('⚠️  Bu email zaten kullanılıyor. Admin rolü veriliyor...');
      
      // Mevcut kullanıcıyı bul
      const userRecord = await adminAuth.getUserByEmail(email);
      
      // Admin rolü ver
      await adminDb.collection('users').doc(userRecord.uid).set({
        email: email,
        displayName: displayName,
        role: 'admin',
        createdAt: new Date(),
        isBanned: false,
      }, { merge: true });

      console.log('✅ Mevcut kullanıcıya admin rolü verildi!');
      console.log(`   UID: ${userRecord.uid}`);
      process.exit(0);
    } else {
      console.error('❌ Hata:', error.message);
      process.exit(1);
    }
  }
}

// Scripti çalıştır
createAdminUser();


