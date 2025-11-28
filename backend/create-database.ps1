# Marketplace Database Creation Script (PowerShell)
# PostgreSQL'de marketplace veritabanını oluşturur

Write-Host "🔍 PostgreSQL versiyonunu buluyorum..." -ForegroundColor Yellow

# PostgreSQL versiyonlarını bul
$postgresVersions = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory | Where-Object { $_.Name -match '^\d+' } | Sort-Object Name -Descending

if ($postgresVersions.Count -eq 0) {
    Write-Host "❌ PostgreSQL bulunamadı!" -ForegroundColor Red
    Write-Host "Lütfen PostgreSQL'in kurulu olduğundan emin olun." -ForegroundColor Yellow
    exit 1
}

$latestVersion = $postgresVersions[0].Name
$psqlPath = "C:\Program Files\PostgreSQL\$latestVersion\bin\psql.exe"

if (-not (Test-Path $psqlPath)) {
    Write-Host "❌ psql.exe bulunamadı: $psqlPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ PostgreSQL $latestVersion bulundu: $psqlPath" -ForegroundColor Green
Write-Host ""

# Kullanıcıdan şifre iste
$password = Read-Host "PostgreSQL postgres kullanıcısının şifresini girin" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# PGPASSWORD environment variable set et
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "📦 Marketplace veritabanı oluşturuluyor..." -ForegroundColor Yellow

# Veritabanını oluştur
$createDbQuery = @"
CREATE DATABASE marketplace
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;
"@

try {
    # Önce mevcut veritabanını kontrol et
    $checkQuery = "SELECT 1 FROM pg_database WHERE datname = 'marketplace'"
    $exists = & $psqlPath -U postgres -d postgres -t -c $checkQuery 2>$null
    
    if ($exists) {
        Write-Host "⚠️  Marketplace veritabanı zaten mevcut!" -ForegroundColor Yellow
        $overwrite = Read-Host "Üzerine yazmak istiyor musunuz? (y/n)"
        
        if ($overwrite -eq "y" -or $overwrite -eq "Y") {
            Write-Host "🗑️  Eski veritabanı siliniyor..." -ForegroundColor Yellow
            & $psqlPath -U postgres -d postgres -c "DROP DATABASE IF EXISTS marketplace;" 2>&1 | Out-Null
            Write-Host "✅ Eski veritabanı silindi" -ForegroundColor Green
        } else {
            Write-Host "❌ İşlem iptal edildi" -ForegroundColor Red
            $env:PGPASSWORD = $null
            exit 0
        }
    }
    
    # Yeni veritabanını oluştur
    $result = & $psqlPath -U postgres -d postgres -c $createDbQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Marketplace veritabanı başarıyla oluşturuldu!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Veritabanı bilgileri:" -ForegroundColor Cyan
        & $psqlPath -U postgres -d postgres -c "SELECT datname, encoding, datcollate, datctype FROM pg_database WHERE datname = 'marketplace';" 2>&1
    } else {
        Write-Host "❌ Hata oluştu:" -ForegroundColor Red
        Write-Host $result
        exit 1
    }
} catch {
    Write-Host "❌ Hata: $_" -ForegroundColor Red
    exit 1
} finally {
    # Şifreyi temizle
    $env:PGPASSWORD = $null
}

Write-Host ""
Write-Host "🎉 İşlem tamamlandı!" -ForegroundColor Green

