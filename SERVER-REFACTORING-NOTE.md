# ⚠️ Server/Index.js Refactoring Notu

Bu büyük bir refactoring işlemi. Tüm route'ları gruplara ayırmak için:

1. ✅ Klasörler oluşturuldu (routes/, middleware/)
2. ✅ Middleware dosyaları oluşturuldu
3. ✅ auth.routes.js oluşturuldu
4. ⏳ Diğer route dosyaları oluşturulacak
5. ⏳ index.js sadeleştirilecek

**Not:** Tüm route dosyalarını oluşturmak çok fazla işlem gerektirir.
Dosya çok büyük olduğu için (2300+ satır), adım adım ilerliyoruz.

**Yaklaşım:**
- Her route grubu için Express Router kullanılıyor
- Route'lar `app.xxx()` yerine `router.xxx()` kullanacak
- index.js'de sadece router'lar import edilecek


