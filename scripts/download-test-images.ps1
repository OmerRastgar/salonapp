# PowerShell script to download high-resolution salon images
# Usage: .\download-test-images.ps1

$ErrorActionPreference = "Stop"

# Image URLs organized by category
$imageUrls = @{
    'beauty-salon' = @(
        'https://unsplash.com/photos/g-m8EDc4X6Q/download?force=true',
        'https://unsplash.com/photos/LGXN4OSQSa4/download?force=true',
        'https://unsplash.com/photos/sRSRuxkOuzI/download?force=true',
        'https://unsplash.com/photos/FkAZqQJTbXM/download?force=true',
        'https://unsplash.com/photos/pxax5WuM7eY/download?force=true'
    )
    'barbershop' = @(
        'https://unsplash.com/photos/EW_rqoSdDes/download?force=true',
        'https://unsplash.com/photos/IvQeAVeJULw/download?force=true',
        'https://unsplash.com/photos/tgPrIYnW3g4/download?force=true',
        'https://unsplash.com/photos/dU6eE_j2My8/download?force=true',
        'https://unsplash.com/photos/MNu0n-3BIKs/download?force=true'
    )
    'spa-wellness' = @(
        'https://unsplash.com/photos/gb6gtiTZKB8/download?force=true',
        'https://unsplash.com/photos/Pe9IXUuC6QU/download?force=true',
        'https://unsplash.com/photos/lK8oXGycy88/download?force=true',
        'https://unsplash.com/photos/FoeIOgztCXo/download?force=true',
        'https://unsplash.com/photos/MMz03PyCOZg/download?force=true'
    )
}

# File names for the downloaded images
$fileNames = @{
    'beauty-salon' = @(
        'glamour-salon-interior.jpg',
        'luxury-beauty-studio.jpg',
        'professional-beauty-station.jpg',
        'elegant-salon-setup.jpg',
        'modern-salon-mirror.jpg'
    )
    'barbershop' = @(
        'classic-barbershop.jpg',
        'modern-barber-shop.jpg',
        'traditional-barber-tools.jpg',
        'barber-chair-setup.jpg',
        'professional-barbershop.jpg'
    )
    'spa-wellness' = @(
        'relaxing-spa-room.jpg',
        'wellness-center.jpg',
        'massage-therapy-room.jpg',
        'spa-treatment-area.jpg',
        'beauty-spa-facility.jpg'
    )
}

Write-Host "🖼️ Downloading high-resolution salon images for test data..." -ForegroundColor Green

# Ensure Images directory exists
$imagesDir = Join-Path (Split-Path $PSScriptRoot -Parent) "Images"
if (!(Test-Path $imagesDir)) {
    New-Item -ItemType Directory -Path $imagesDir -Force | Out-Null
}

$totalImages = 0
foreach ($category in $imageUrls.Keys) {
    $totalImages += $imageUrls[$category].Count
}
$downloadedCount = 0

foreach ($category in $imageUrls.Keys) {
    Write-Host "`n📁 Downloading $category images:" -ForegroundColor Cyan
    
    $urls = $imageUrls[$category]
    $names = $fileNames[$category]
    
    for ($i = 0; $i -lt $urls.Count; $i++) {
        $url = $urls[$i]
        $filename = $names[$i]
        $filePath = Join-Path $imagesDir $filename
        
        try {
            Write-Host "   Downloading $filename..." -ForegroundColor Yellow
            Invoke-WebRequest -Uri $url -OutFile $filePath -TimeoutSec 30
            Write-Host "   ✅ Downloaded: $filename" -ForegroundColor Green
            $downloadedCount++
            
            # Small delay between downloads
            Start-Sleep -Milliseconds 500
        }
        catch {
            Write-Host "   ❌ Failed to download $filename`: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎉 Download complete! $downloadedCount/$totalImages images downloaded successfully." -ForegroundColor Green
Write-Host "📂 Images are available in the Images/ directory for your test data." -ForegroundColor Blue
Write-Host "`n💡 Tip: These images will be automatically used by the seeder script." -ForegroundColor Yellow
Write-Host "   Run 'cd tests/scripts && node seeder.js' to populate your database with vendors using these images." -ForegroundColor Yellow
