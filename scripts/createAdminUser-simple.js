// Basit admin kullanıcı oluşturma - Firebase Console kullanarak
// Bu script sadece Firestore'da admin rolü verir
// Kullanıcıyı Firebase Console'dan manuel oluşturmanız gerekiyor

console.log(`
╔══════════════════════════════════════════════════════════════╗
║         ADMIN KULLANICI OLUŞTURMA TALİMATLARI                ║
╚══════════════════════════════════════════════════════════════╝

📋 Kullanıcı Bilgileri:
   Email: orhanozan33@gmail.com
   Şifre: 33333333
   Rol: admin

🔧 ADIM ADIM TALİMATLAR:

1️⃣  Firebase Console'a gidin:
   https://console.firebase.google.com

2️⃣  Projenizi seçin

3️⃣  Authentication > Users menüsüne gidin

4️⃣  "Add user" butonuna tıklayın

5️⃣  Email: orhanozan33@gmail.com
    Password: 33333333
    (Email verification: Disable - isteğe bağlı)
    
    "Add user" butonuna tıklayın

6️⃣  Kullanıcı oluşturulduktan sonra, UID'yi kopyalayın
    (Kullanıcı listesinde görünecek)

7️⃣  Firestore Database > Data menüsüne gidin

8️⃣  "users" collection'ını oluşturun (yoksa)

9️⃣  Kullanıcı UID'si ile yeni bir döküman oluşturun:
    
    Döküman ID: [Kullanıcı UID'si]
    
    Alanlar:
    - email: "orhanozan33@gmail.com" (string)
    - displayName: "Admin User" (string)
    - role: "admin" (string)
    - createdAt: [Şu anki tarih] (timestamp)
    - isBanned: false (boolean)

🔟  Kaydedin

✅ Artık orhanozan33@gmail.com ile giriş yapabilirsiniz!

💡 Alternatif: Uygulama içinde kayıt olup sonra admin rolü verebilirsiniz.
`);


