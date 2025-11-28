# Marketplace Veritabanı Kurulumu

PostgreSQL'de `marketplace` veritabanını oluşturmak için aşağıdaki adımları izleyin.

## 🚀 Hızlı Kurulum

### Yöntem 1: pgAdmin ile (En Kolay)

1. **pgAdmin'i açın**
2. **PostgreSQL server'a bağlanın** (şifrenizi girin)
3. **Databases** klasörüne sağ tıklayın
4. **Create > Database** seçin
5. **Database name:** `marketplace` yazın
6. **Owner:** `postgres` seçin
7. **Save** butonuna tıklayın

### Yöntem 2: PowerShell ile (Otomatik)

```powershell
cd backend
.\create-database.ps1
```

Script size şifrenizi soracak ve veritabanını otomatik oluşturacak.

### Yöntem 3: SQL Komut Satırı ile

1. **Command Prompt veya PowerShell'i açın**
2. **PostgreSQL'e bağlanın:**

```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

3. **SQL komutunu çalıştırın:**

```sql
CREATE DATABASE marketplace;
```

4. **Çıkış:**

```sql
\q
```

### Yöntem 4: SQL Dosyası ile

1. **PostgreSQL'e bağlanın:**

```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

2. **SQL dosyasını çalıştırın:**

```sql
\i create-database-simple.sql
```

veya tek satırda:

```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -f create-database-simple.sql
```

## ✅ Veritabanını Kontrol Etme

Veritabanının başarıyla oluşturulduğunu kontrol etmek için:

```powershell
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d marketplace -c "\l"
```

veya

```sql
-- psql içinde
\l
```

`marketplace` veritabanını listede görmelisiniz.

## 🔧 Sorun Giderme

### Şifre Hatası

Eğer şifre sorunları yaşıyorsanız, `.pgpass` dosyası oluşturabilirsiniz:

1. **Kullanıcı klasörünüzde** `.pgpass` dosyası oluşturun: `C:\Users\orhan\.pgpass`
2. **İçine şunu yazın:**

```
localhost:5432:*:postgres:şifreniz_buraya
```

3. **Dosya izinlerini ayarlayın** (PowerShell'de):

```powershell
icacls "$env:USERPROFILE\.pgpass" /inheritance:r /grant "$env:USERNAME:R"
```

### psql Bulunamıyor

PostgreSQL'in bin klasörünü PATH'e ekleyin veya tam yolu kullanın:

```powershell
# PATH'e ekle (geçici)
$env:Path += ";C:\Program Files\PostgreSQL\18\bin"

# Veya tam yolu kullan
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres
```

## 📝 Notlar

- Veritabanı adı: `marketplace`
- Varsayılan kullanıcı: `postgres`
- Port: `5432` (varsayılan)
- Encoding: `UTF8`

## 🎯 Sonraki Adımlar

Veritabanı oluşturulduktan sonra:

1. Backend'deki `.env` dosyasında veritabanı bağlantı bilgilerini ayarlayın
2. TypeORM migration'larını çalıştırın
3. Seed data'yı yükleyin (varsa)

