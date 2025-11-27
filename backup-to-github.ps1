# GitHub Yedekleme Scripti
# Bu script projeyi otomatik olarak GitHub'a yedekler

$projectPath = Join-Path $env:USERPROFILE "OneDrive\Masaüstü\yeni proje"
$backupPath = Join-Path $env:USERPROFILE "OneDrive\Masaüstü\yedek"
$gitRemote = "https://github.com/orhanozan33/marketplace.git"

Write-Host "🔄 GitHub yedekleme başlatılıyor..." -ForegroundColor Cyan

# Proje dizinine git
Set-Location $projectPath

# Git durumunu kontrol et
if (-not (Test-Path ".git")) {
    Write-Host "📦 Git repository başlatılıyor..." -ForegroundColor Yellow
    git init
    git config user.email "orhanozan33@users.noreply.github.com"
    git config user.name "orhanozan33"
}

# Remote'u kontrol et ve ayarla
$remoteExists = git remote | Select-String -Pattern "origin"
if (-not $remoteExists) {
    Write-Host "🔗 Remote repository ekleniyor..." -ForegroundColor Yellow
    git remote add origin $gitRemote
} else {
    git remote set-url origin $gitRemote
}

# Tüm değişiklikleri ekle
Write-Host "📝 Değişiklikler ekleniyor..." -ForegroundColor Yellow
git add .

# Commit yap
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$commitMessage = "Auto backup - $timestamp"

Write-Host "💾 Commit yapılıyor..." -ForegroundColor Yellow
git commit -m $commitMessage

# Branch'i main olarak ayarla
git branch -M main

# GitHub'a push yap
Write-Host "🚀 GitHub'a yükleniyor..." -ForegroundColor Yellow
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ GitHub yedekleme başarılı!" -ForegroundColor Green
    
    # Yerel yedekleme klasörüne de kopyala
    Write-Host "📁 Yerel yedekleme yapılıyor..." -ForegroundColor Yellow
    if (-not (Test-Path $backupPath)) {
        New-Item -ItemType Directory -Force -Path $backupPath | Out-Null
    }
    
    # .git klasörünü hariç tutarak kopyala
    $excludeItems = @(".git", "node_modules", ".vite", "dist")
    Get-ChildItem -Path $projectPath -Exclude $excludeItems | Copy-Item -Destination $backupPath -Recurse -Force
    
    Write-Host "✅ Yerel yedekleme başarılı!" -ForegroundColor Green
    Write-Host "📦 Yedekleme tamamlandı: $backupPath" -ForegroundColor Cyan
} else {
    Write-Host "❌ GitHub yedekleme başarısız!" -ForegroundColor Red
    exit 1
}

Write-Host "✨ Tüm yedekleme işlemleri tamamlandı!" -ForegroundColor Green

