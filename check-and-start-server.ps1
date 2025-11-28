# Server Kontrol ve Başlatma Scripti
# Server açık değilse otomatik başlatır

param(
    [int]$Port = 3000,
    [int]$Timeout = 3
)

$serverUrl = "http://localhost:$Port"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "SERVER KONTROL VE BAŞLATMA" -ForegroundColor Yellow
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Port kontrolü
Write-Host "🔍 Port $Port kontrol ediliyor..." -ForegroundColor Yellow
$portOpen = Test-NetConnection -ComputerName localhost -Port $Port -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $portOpen) {
    Write-Host "❌ Port $Port kapalı - Server çalışmıyor`n" -ForegroundColor Red
    Write-Host "🚀 Server başlatılıyor...`n" -ForegroundColor Yellow
    
    # Server'ı başlat
    Set-Location "$PSScriptRoot\server"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Start-Sleep -Seconds $Timeout
    
    Write-Host "✅ Server başlatma komutu çalıştırıldı!`n" -ForegroundColor Green
    Write-Host "   Yeni bir PowerShell penceresi açıldı (server logları için)" -ForegroundColor Cyan
    Write-Host "   URL: $serverUrl`n" -ForegroundColor Cyan
    
    Set-Location $PSScriptRoot
    exit 0
}

# 2. API yanıt kontrolü
Write-Host "🔍 Server yanıtı kontrol ediliyor..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$serverUrl/api" -Method GET -TimeoutSec $Timeout -ErrorAction Stop
    Write-Host "✅ Server aktif ve yanıt veriyor!`n" -ForegroundColor Green
    Write-Host "   URL: $serverUrl" -ForegroundColor Cyan
    Write-Host "   Status: $($response.StatusCode)`n" -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host "⚠️  Port açık ama server yanıt vermiyor`n" -ForegroundColor Yellow
    Write-Host "   Server'ı yeniden başlatılıyor...`n" -ForegroundColor Yellow
    
    # Çalışan node process'lerini durdur (isteğe bağlı)
    # Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Server'ı başlat
    Set-Location "$PSScriptRoot\server"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm start" -WindowStyle Normal
    Start-Sleep -Seconds $Timeout
    
    Write-Host "✅ Server yeniden başlatıldı!`n" -ForegroundColor Green
    Write-Host "   Yeni bir PowerShell penceresi açıldı" -ForegroundColor Cyan
    Write-Host "   URL: $serverUrl`n" -ForegroundColor Cyan
    
    Set-Location $PSScriptRoot
    exit 0
}

