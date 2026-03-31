const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Image URLs organized by category
const imageUrls = {
  'beauty-salon': [
    'https://unsplash.com/photos/g-m8EDc4X6Q/download?force=true',
    'https://unsplash.com/photos/LGXN4OSQSa4/download?force=true',
    'https://unsplash.com/photos/sRSRuxkOuzI/download?force=true',
    'https://unsplash.com/photos/FkAZqQJTbXM/download?force=true',
    'https://unsplash.com/photos/pxax5WuM7eY/download?force=true'
  ],
  'barbershop': [
    'https://unsplash.com/photos/EW_rqoSdDes/download?force=true',
    'https://unsplash.com/photos/IvQeAVeJULw/download?force=true',
    'https://unsplash.com/photos/tgPrIYnW3g4/download?force=true',
    'https://unsplash.com/photos/dU6eE_j2My8/download?force=true',
    'https://unsplash.com/photos/MNu0n-3BIKs/download?force=true'
  ],
  'spa-wellness': [
    'https://unsplash.com/photos/gb6gtiTZKB8/download?force=true',
    'https://unsplash.com/photos/Pe9IXUuC6QU/download?force=true',
    'https://unsplash.com/photos/lK8oXGycy88/download?force=true',
    'https://unsplash.com/photos/FoeIOgztCXo/download?force=true',
    'https://unsplash.com/photos/MMz03PyCOZg/download?force=true'
  ]
};

// File names for the downloaded images
const fileNames = {
  'beauty-salon': [
    'glamour-salon-interior.jpg',
    'luxury-beauty-studio.jpg',
    'professional-beauty-station.jpg',
    'elegant-salon-setup.jpg',
    'modern-salon-mirror.jpg'
  ],
  'barbershop': [
    'classic-barbershop.jpg',
    'modern-barber-shop.jpg',
    'traditional-barber-tools.jpg',
    'barber-chair-setup.jpg',
    'professional-barbershop.jpg'
  ],
  'spa-wellness': [
    'relaxing-spa-room.jpg',
    'wellness-center.jpg',
    'massage-therapy-room.jpg',
    'spa-treatment-area.jpg',
    'beauty-spa-facility.jpg'
  ]
};

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 30000
    });

    const imagePath = path.join(__dirname, '..', 'Images', filename);
    const writer = fs.createWriteStream(imagePath);
    
    response.data.pipe(writer);
    
    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Downloaded: ${filename}`);
        resolve(imagePath);
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`❌ Failed to download ${filename}:`, error.message);
    return null;
  }
}

async function downloadAllImages() {
  console.log('🖼️ Downloading high-resolution salon images for test data...\n');
  
  // Ensure Images directory exists
  const imagesDir = path.join(__dirname, '..', 'Images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const totalImages = Object.values(imageUrls).flat().length;
  let downloadedCount = 0;

  for (const [category, urls] of Object.entries(imageUrls)) {
    console.log(`\n📁 Downloading ${category} images:`);
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const filename = fileNames[category][i];
      
      const success = await downloadImage(url, filename);
      if (success) {
        downloadedCount++;
      }
      
      // Small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  console.log(`\n🎉 Download complete! ${downloadedCount}/${totalImages} images downloaded successfully.`);
  console.log('\n📂 Images are available in the Images/ directory for your test data.');
  
  // Update the seeder to use these new images
  console.log('\n💡 Tip: These images will be automatically used by the seeder script.');
  console.log('   Run "cd tests/scripts && node seeder.js" to populate your database with vendors using these images.');
}

// Run the download
if (require.main === module) {
  downloadAllImages().catch(console.error);
}

module.exports = { downloadAllImages, imageUrls, fileNames };
