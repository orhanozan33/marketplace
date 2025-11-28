# Marketplace Projesi Kurulum Scripti
# Tüm kurulum adımlarını otomatik yapar

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "MARKETPLACE PROJESI KURULUM" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# 1. Frontend Environment Dosyası
Write-Host "1️⃣  Frontend .env dosyası kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "   📝 .env dosyası oluşturuluyor..." -ForegroundColor Cyan
    $frontendEnv = @"
# Frontend Environment Variables
VITE_API_URL=http://localhost:3000

# Production için backend URL'ini değiştirin
# VITE_API_URL=https://api.yourdomain.com
"@
    Set-Content -Path ".env" -Value $frontendEnv
    Write-Host "   ✅ .env dosyası oluşturuldu" -ForegroundColor Green
} else {
    Write-Host "   ✅ .env dosyası zaten mevcut" -ForegroundColor Green
}

# 2. Backend Environment Dosyası
Write-Host "`n2️⃣  Backend .env dosyası kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "backend\.env")) {
    Write-Host "   📝 backend/.env dosyası oluşturuluyor..." -ForegroundColor Cyan
    
    # PostgreSQL şifresini sor
    Write-Host "   🔐 PostgreSQL bilgileri:" -ForegroundColor Yellow
    $dbPassword = Read-Host "   PostgreSQL şifresi (Enter = 'postgres')"
    if ([string]::IsNullOrWhiteSpace($dbPassword)) {
        $dbPassword = "postgres"
    }
    
    $jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    
    $backendEnv = @"
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=$dbPassword
DB_DATABASE=marketplace
DB_SYNCHRONIZE=true
DB_LOGGING=false

# Application Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=$jwtSecret
JWT_EXPIRES_IN=7d
"@
    Set-Content -Path "backend\.env" -Value $backendEnv
    Write-Host "   ✅ backend/.env dosyası oluşturuldu" -ForegroundColor Green
    Write-Host "   🔑 JWT Secret otomatik oluşturuldu" -ForegroundColor Cyan
} else {
    Write-Host "   ✅ backend/.env dosyası zaten mevcut" -ForegroundColor Green
}

# 3. Frontend Bağımlılıkları
Write-Host "`n3️⃣  Frontend bağımlılıkları kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   📦 Frontend bağımlılıkları yükleniyor..." -ForegroundColor Cyan
    npm install
    Write-Host "   ✅ Frontend bağımlılıkları yüklendi" -ForegroundColor Green
} else {
    Write-Host "   ✅ Frontend bağımlılıkları zaten yüklü" -ForegroundColor Green
}

# 4. Backend Bağımlılıkları
Write-Host "`n4️⃣  Backend bağımlılıkları kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "backend\node_modules")) {
    Write-Host "   📦 Backend bağımlılıkları yükleniyor..." -ForegroundColor Cyan
    Set-Location backend
    npm install
    Set-Location ..
    Write-Host "   ✅ Backend bağımlılıkları yüklendi" -ForegroundColor Green
} else {
    Write-Host "   ✅ Backend bağımlılıkları zaten yüklü" -ForegroundColor Green
}

# 5. Server Bağımlılıkları
Write-Host "`n5️⃣  Server bağımlılıkları kontrol ediliyor..." -ForegroundColor Yellow
if (-not (Test-Path "server\node_modules")) {
    Write-Host "   📦 Server bağımlılıkları yükleniyor..." -ForegroundColor Cyan
    Set-Location server
    npm install
    Set-Location ..
    Write-Host "   ✅ Server bağımlılıkları yüklendi" -ForegroundColor Green
} else {
    Write-Host "   ✅ Server bağımlılıkları zaten yüklü" -ForegroundColor Green
}

# 6. Veritabanı Kontrolü
Write-Host "`n6️⃣  PostgreSQL veritabanı kontrol ediliyor..." -ForegroundColor Yellow
$postgresVersions = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^\d+' } | Sort-Object Name -Descending

if ($postgresVersions.Count -gt 0) {
    $latestVersion = $postgresVersions[0].Name
    $psqlPath = "C:\Program Files\PostgreSQL\$latestVersion\bin\psql.exe"
    
    if (Test-Path $psqlPath) {
        Write-Host "   ✅ PostgreSQL $latestVersion bulundu" -ForegroundColor Green
        
        # Veritabanı kontrolü
        $dbCheckQuery = "SELECT 1 FROM pg_database WHERE datname = 'marketplace'"
        
        try {
            $env:PGPASSWORD = (Get-Content "backend\.env" | Select-String "DB_PASSWORD=(.+)" | ForEach-Object { $_.Matches.Groups[1].Value })
            $dbExists = & $psqlPath -U postgres -d postgres -t -c $dbCheckQuery 2>$null
            
            if ($dbExists) {
                Write-Host "   ✅ Marketplace veritabanı zaten mevcut" -ForegroundColor Green
            } else {
                Write-Host "   📦 Marketplace veritabanı oluşturuluyor..." -ForegroundColor Cyan
                & $psqlPath -U postgres -d postgres -c "CREATE DATABASE marketplace;" 2>$null
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "   ✅ Marketplace veritabanı oluşturuldu" -ForegroundColor Green
                } else {
                    Write-Host "   ⚠️  Veritabanı oluşturulamadı (manuel oluşturun)" -ForegroundColor Yellow
                }
            }
            $env:PGPASSWORD = $null
        } catch {
            Write-Host "   ⚠️  Veritabanı kontrol edilemedi (manuel kontrol edin)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  PostgreSQL bulunamadı" -ForegroundColor Yellow
        Write-Host "   💡 PostgreSQL'i yükleyin veya veritabanını manuel oluşturun" -ForegroundColor Cyan
    }
} else {
    Write-Host "   ⚠️  PostgreSQL bulunamadı" -ForegroundColor Yellow
    Write-Host "   💡 PostgreSQL'i yükleyin veya veritabanını manuel oluşturun" -ForegroundColor Cyan
}

# 7. Uploads Klasörleri
Write-Host "`n7️⃣  Uploads klasörleri kontrol ediliyor..." -ForegroundColor Yellow
$uploadDirs = @(
    "server\uploads\listings",
    "server\uploads\profiles",
    "server\uploads\advertisements"
)

foreach ($dir in $uploadDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ $dir oluşturuldu" -ForegroundColor Green
    }
}

# 8. .gitkeep Dosyaları
Write-Host "`n8️⃣  .gitkeep dosyaları oluşturuluyor..." -ForegroundColor Yellow
$gitkeepDirs = @(
    "server\uploads\listings",
    "server\uploads\profiles",
    "server\uploads\advertisements"
)

foreach ($dir in $gitkeepDirs) {
    $gitkeepPath = Join-Path $dir ".gitkeep"
    if (-not (Test-Path $gitkeepPath)) {
        Set-Content -Path $gitkeepPath -Value ""
        Write-Host "   ✅ $gitkeepPath oluşturuldu" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ KURULUM TAMAMLANDI!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "📋 Sonraki Adımlar:`n" -ForegroundColor Yellow
Write-Host "   1. Backend'i başlatın:" -ForegroundColor White
Write-Host "      npm run server" -ForegroundColor Cyan
Write-Host "   veya" -ForegroundColor Gray
Write-Host "      npm run backend`n" -ForegroundColor Cyan

Write-Host "   2. Frontend'i başlatın:" -ForegroundColor White
Write-Host "      npm run dev`n" -ForegroundColor Cyan

Write-Host "   3. Tarayıcıda açın:" -ForegroundColor White
Write-Host "      http://localhost:5173`n" -ForegroundColor Cyan

Write-Host "📚 Dokümantasyon:" -ForegroundColor Yellow
Write-Host "   - SETUP.md - Detaylı kurulum rehberi" -ForegroundColor White
Write-Host "   - README.md - Ana dokümantasyon`n" -ForegroundColor White

Write-Host "========================================`n" -ForegroundColor Cyan

