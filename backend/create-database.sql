-- Marketplace Database Creation Script
-- PostgreSQL veritabanı oluşturma scripti

-- Mevcut veritabanını kontrol et ve varsa sil (dikkatli kullanın!)
-- DROP DATABASE IF EXISTS marketplace;

-- Marketplace veritabanını oluştur
CREATE DATABASE marketplace
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Turkish_Turkey.1254'
    LC_CTYPE = 'Turkish_Turkey.1254'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Veritabanı oluşturulduğunu kontrol et
\c marketplace

-- Başarı mesajı
SELECT 'Marketplace database created successfully!' AS message;

