# Server Başlatma Scripti
# Eğer server çalışmıyorsa otomatik başlatır

Write-Host "🔍 Server durumu kontrol ediliyor..." -ForegroundColor Yellow

$port = 3000
$serverUrl = "http://localhost:$port"

# Port kontrolü
$connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue

if ($connection) {
    # Port açık, API testi yap
    try {
        $response = Invoke-WebRequest -Uri "$serverUrl/api" -Method GET -TimeoutSec 2 -ErrorAction Stop
        Write-Host "✅ Server zaten çalışıyor!" -ForegroundColor Green
        Write-Host "   URL: $serverUrl" -ForegroundColor Cyan
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "⚠️  Port açık ama server yanıt vermiyor" -ForegroundColor Yellow
        Write-Host "   Server'ı yeniden başlatılıyor..." -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Server çalışmıyor" -ForegroundColor Yellow
    Write-Host "   Server başlatılıyor..." -ForegroundColor Yellow
}

# Server'ı başlat
Write-Host ""
Write-Host "🚀 Server başlatılıyor..." -ForegroundColor Cyan
Write-Host "   Klasör: server" -ForegroundColor Gray
Write-Host "   Port: $port" -ForegroundColor Gray
Write-Host ""

# Server klasörüne git ve başlat
$serverPath = Join-Path $PSScriptRoot "server"

if (-not (Test-Path $serverPath)) {
    Write-Host "❌ Server klasörü bulunamadı: $serverPath" -ForegroundColor Red
    exit 1
}

# Arka planda server'ı başlat
$job = Start-Job -ScriptBlock {
    Set-Location $using:serverPath
    npm start
}

Write-Host "✅ Server başlatma job'u oluşturuldu (Job ID: $($job.Id))" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Server durumunu kontrol etmek için:" -ForegroundColor Yellow
Write-Host "   Get-Job -Id $($job.Id)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Server loglarını görmek için:" -ForegroundColor Yellow
Write-Host "   Receive-Job -Id $($job.Id) -Keep" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛑 Server'ı durdurmak için:" -ForegroundColor Yellow
Write-Host "   Stop-Job -Id $($job.Id)" -ForegroundColor Cyan
Write-Host "   Remove-Job -Id $($job.Id)" -ForegroundColor Cyan
Write-Host ""

# Biraz bekle ve kontrol et
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "$serverUrl/api" -Method GET -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✅ Server başarıyla başlatıldı!" -ForegroundColor Green
    Write-Host "   URL: $serverUrl" -ForegroundColor Cyan
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "⏳ Server başlatılıyor, lütfen bekleyin..." -ForegroundColor Yellow
    Write-Host "   $serverUrl adresini kontrol edebilirsiniz" -ForegroundColor Gray
}

