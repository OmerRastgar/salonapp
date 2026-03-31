@echo off
echo 🖼️ Downloading high-resolution salon images...
echo.

cd /d "%~dp0..\Images"

echo Downloading beauty salon images...
curl -L "https://unsplash.com/photos/sRSRuxkOuzI/download?force=true" -o "professional-beauty-station.jpg"
curl -L "https://unsplash.com/photos/FkAZqQJTbXM/download?force=true" -o "elegant-salon-setup.jpg"
curl -L "https://unsplash.com/photos/pxax5WuM7eY/download?force=true" -o "modern-salon-mirror.jpg"

echo Downloading barbershop images...
curl -L "https://unsplash.com/photos/tgPrIYnW3g4/download?force=true" -o "traditional-barber-tools.jpg"
curl -L "https://unsplash.com/photos/dU6eE_j2My8/download?force=true" -o "barber-chair-setup.jpg"
curl -L "https://unsplash.com/photos/MNu0n-3BIKs/download?force=true" -o "professional-barbershop.jpg"

echo Downloading spa images...
curl -L "https://unsplash.com/photos/Pe9IXUuC6QU/download?force=true" -o "wellness-center.jpg"
curl -L "https://unsplash.com/photos/lK8oXGycy88/download?force=true" -o "massage-therapy-room.jpg"
curl -L "https://unsplash.com/photos/FoeIOgztCXo/download?force=true" -o "spa-treatment-area.jpg"
curl -L "https://unsplash.com/photos/MMz03PyCOZg/download?force=true" -o "beauty-spa-facility.jpg"

echo.
echo ✅ Download complete! Images are ready for your test data.
echo 💡 Run 'cd tests\scripts && node seeder.js' to use these images in your database.
pause
