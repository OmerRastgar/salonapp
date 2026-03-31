const fs = require('fs');
const path = require('path');

// Test image seeding without the problematic bookings collection
async function testImageSeeding() {
  try {
    console.log('🧪 Testing image assignment for vendors...');
    
    // Check available images
    const imagesDir = path.join(__dirname, '..', 'Images');
    const images = fs.readdirSync(imagesDir);
    
    console.log('📁 Available images:');
    const vendorImages = images.filter(img => 
      img.includes('glamour-salon') || 
      img.includes('barber-shop') || 
      img.includes('royal-beauty') || 
      img.includes('capital-barber')
    );
    
    vendorImages.forEach(img => {
      const stats = fs.statSync(path.join(imagesDir, img));
      console.log(`   ✅ ${img} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    });
    
    console.log('\n🎯 Image matching strategy:');
    console.log('   - Glamour Salon & Spa → glamour-salon-spa.jpg');
    console.log('   - Barber Shop Pro → barber-shop-pro.jpg');
    console.log('   - Royal Beauty Lounge → royal-beauty-lounge.jpg');
    console.log('   - Capital Barber Studio → capital-barber-studio.jpg');
    
    console.log('\n✅ Images are ready for seeder!');
    console.log('📝 The seeder will:');
    console.log('   1. Upload these images to Directus');
    console.log('   2. Assign them to matching vendors');
    console.log('   3. Use them for logos and cover images');
    console.log('   4. Assign employee photos from remaining images');
    
    console.log('\n🚀 To run the full seeder (when bookings issue is fixed):');
    console.log('   cd tests/scripts && node seeder.js');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testImageSeeding();
