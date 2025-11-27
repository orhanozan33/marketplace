@echo off
REM GitHub Yedekleme Scripti (Windows Batch)
cd /d "C:\Users\orhan\OneDrive\Masaüstü\yeni proje"

echo 🔄 GitHub yedekleme başlatılıyor...

REM Git durumunu kontrol et
if not exist ".git" (
    echo 📦 Git repository başlatılıyor...
    git init
    git config user.email "orhanozan33@users.noreply.github.com"
    git config user.name "orhanozan33"
)

REM Remote'u kontrol et ve ayarla
git remote | findstr /C:"origin" >nul
if errorlevel 1 (
    echo 🔗 Remote repository ekleniyor...
    git remote add origin https://github.com/orhanozan33/marketplace.git
) else (
    git remote set-url origin https://github.com/orhanozan33/marketplace.git
)

REM Tüm değişiklikleri ekle
echo 📝 Değişiklikler ekleniyor...
git add .

REM Commit yap
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%:%datetime:~12,2%
git commit -m "Auto backup - %timestamp%"

REM Branch'i main olarak ayarla
git branch -M main

REM GitHub'a push yap
echo 🚀 GitHub'a yükleniyor...
git push -u origin main --force

if %errorlevel% equ 0 (
    echo ✅ GitHub yedekleme başarılı!
    
    REM Yerel yedekleme klasörüne de kopyala
    echo 📁 Yerel yedekleme yapılıyor...
    if not exist "C:\Users\orhan\OneDrive\Masaüstü\yedek" mkdir "C:\Users\orhan\OneDrive\Masaüstü\yedek"
    
    REM .git ve node_modules hariç kopyala
    xcopy /E /I /Y /EXCLUDE:exclude.txt "C:\Users\orhan\OneDrive\Masaüstü\yeni proje\*" "C:\Users\orhan\OneDrive\Masaüstü\yedek\"
    
    echo ✅ Yerel yedekleme başarılı!
    echo ✨ Tüm yedekleme işlemleri tamamlandı!
) else (
    echo ❌ GitHub yedekleme başarısız!
    exit /b 1
)

