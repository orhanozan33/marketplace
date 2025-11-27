import { initDatabase, dbQuery } from './database.js';
import bcrypt from 'bcryptjs';

initDatabase();

const testLogin = async () => {
  const email = 'orhanozan33@gmail.com';
  const password = '33333333';

  console.log('🔍 Login testi başlatılıyor...');
  console.log('Email:', email);
  console.log('Şifre:', password);

  // Kullanıcıyı bul
  const user = dbQuery.getUserByEmail(email);
  
  if (!user) {
    console.error('❌ Kullanıcı bulunamadı!');
    return;
  }

  console.log('✅ Kullanıcı bulundu:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Role:', user.role);
  console.log('   Password hash:', user.password.substring(0, 20) + '...');

  // Şifre kontrolü
  console.log('\n🔐 Şifre kontrolü yapılıyor...');
  const isValid = await bcrypt.compare(password, user.password);
  
  if (isValid) {
    console.log('✅ Şifre doğru!');
  } else {
    console.log('❌ Şifre yanlış!');
    console.log('\n🔧 Şifre yeniden hash\'leniyor...');
    const newHash = await bcrypt.hash(password, 10);
    console.log('Yeni hash:', newHash);
    
    // Şifreyi güncelle
    dbQuery.updateUser(user.id, { password: newHash });
    console.log('✅ Şifre güncellendi!');
    
    // Tekrar test et
    const isValid2 = await bcrypt.compare(password, newHash);
    console.log('Yeniden test:', isValid2 ? '✅ Başarılı' : '❌ Başarısız');
  }
};

testLogin();

