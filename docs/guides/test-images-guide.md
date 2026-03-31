# Test Images Guide

This guide explains how to use high-resolution images for your salon marketplace test data.

## 🖼️ Available Images

### Current Images (Already Downloaded)

| Category | Image Name | Description | Size |
|----------|------------|-------------|------|
| Beauty Salon | `glamour-salon-interior.jpg` | Modern beauty salon with elegant decor | 2.0MB |
| Beauty Salon | `luxury-beauty-studio.jpg` | High-end beauty studio with professional setup | 2.9MB |
| Barbershop | `classic-barbershop.jpg` | Traditional barbershop interior | 2.7MB |
| Barbershop | `modern-barber-shop.jpg` | Contemporary barber shop | 2.2MB |
| Spa & Wellness | `relaxing-spa-room.jpg` | Peaceful spa treatment room | 2.1MB |
| Legacy | `Bridal-Salon.jpeg` | Bridal salon setup (legacy) | 55KB |
| Legacy | `barbar.jpg` | Barber shop (legacy) | 11KB |
| Legacy | `message.jpg` | Contact/message image (legacy) | 46KB |

### Additional Images (Can be Downloaded)

Run the simple download script to get more images:

```bash
cd scripts
download-images-simple.bat
```

This will download 9 additional high-quality images:
- **Beauty Salon**: professional-beauty-station.jpg, elegant-salon-setup.jpg, modern-salon-mirror.jpg
- **Barbershop**: traditional-barber-tools.jpg, barber-chair-setup.jpg, professional-barbershop.jpg  
- **Spa**: wellness-center.jpg, massage-therapy-room.jpg, spa-treatment-area.jpg, beauty-spa-facility.jpg

## 🚀 Using Images with the Seeder

The seeder script automatically uses images from the `Images/` directory:

1. **Run the seeder:**
   ```bash
   cd tests/scripts
   node seeder.js
   ```

2. **Images are automatically assigned:**
   - Vendors get logo and cover images
   - Employees get profile photos
   - Images are matched by vendor name/category

## 📁 Image Organization

### Recommended File Naming Convention

```
Images/
├── beauty-salon/
│   ├── glamour-salon-interior.jpg
│   ├── luxury-beauty-studio.jpg
│   └── professional-beauty-station.jpg
├── barbershop/
│   ├── classic-barbershop.jpg
│   ├── modern-barber-shop.jpg
│   └── traditional-barber-tools.jpg
├── spa-wellness/
│   ├── relaxing-spa-room.jpg
│   ├── wellness-center.jpg
│   └── massage-therapy-room.jpg
└── legacy/
    ├── Bridal-Salon.jpeg
    ├── barbar.jpg
    └── message.jpg
```

### Image Sources

All images are from **Unsplash** and are:
- ✅ Free for commercial use
- ✅ No attribution required
- ✅ High resolution (typically 3000x2000+ pixels)
- ✅ Professional quality

## 🎨 Image Categories & Usage

### Beauty Salon Images
- **Use for**: Glamour Salon & Spa, Royal Beauty Lounge
- **Characteristics**: Elegant interiors, modern equipment, sophisticated decor
- **Colors**: Soft whites, golds, pastels

### Barbershop Images  
- **Use for**: Barber Shop Pro, Capital Barber Studio
- **Characteristics**: Classic barber chairs, traditional tools, masculine decor
- **Colors**: Dark woods, blacks, leather browns

### Spa & Wellness Images
- **Use for**: Royal Spa & Wellness, wellness centers
- **Characteristics**: Relaxing ambiance, treatment rooms, natural elements
- **Colors**: Earth tones, soft lighting, natural materials

## 🔧 Manual Image Download

If you want to download specific images manually:

```powershell
# Example: Download a specific image
cd Images
Invoke-WebRequest -Uri "https://unsplash.com/photos/[IMAGE-ID]/download?force=true" -OutFile "filename.jpg"
```

### Recommended Image URLs

**Beauty Salon:**
- https://unsplash.com/photos/sRSRuxkOuzI/download?force=true
- https://unsplash.com/photos/FkAZqQJTbXM/download?force=true
- https://unsplash.com/photos/pxax5WuM7eY/download?force=true

**Barbershop:**
- https://unsplash.com/photos/tgPrIYnW3g4/download?force=true
- https://unsplash.com/photos/dU6eE_j2My8/download?force=true
- https://unsplash.com/photos/MNu0n-3BIKs/download?force=true

**Spa & Wellness:**
- https://unsplash.com/photos/Pe9IXUuC6QU/download?force=true
- https://unsplash.com/photos/lK8oXGycy88/download?force=true
- https://unsplash.com/photos/FoeIOgztCXo/download?force=true

## 📊 Image Quality Standards

For best results, use images that meet these criteria:

- **Resolution**: Minimum 1920x1080 pixels
- **File Size**: 1-5MB (for balance of quality and performance)
- **Format**: JPEG or PNG
- **Aspect Ratio**: 16:9 or 4:3 (works well with web layouts)
- **Content**: Professional, well-lit, high-quality salon interiors

## 🌟 Pro Tips

1. **Consistent Style**: Use images with similar color schemes for a cohesive look
2. **Proper Licensing**: Only use images with commercial-friendly licenses
3. **Optimization**: Large images are automatically optimized by Directus
4. **Backup**: Keep a backup of your custom images
5. **Testing**: Test images on different screen sizes and devices

## 🔄 Updating Images

To update or replace images:

1. **Add new images** to the `Images/` directory
2. **Run the seeder** to re-populate with new images
3. **Clean up** old images if needed (Directus will handle orphaned files)

## 📞 Support

If you need help with images:
1. Check the [Unsplash website](https://unsplash.com) for more options
2. Use the download scripts provided
3. Contact support for image-related issues
