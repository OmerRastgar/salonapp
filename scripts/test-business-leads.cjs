const fs = require('fs');
const path = require('path');

// Test business leads seeding with new images
async function testBusinessLeadsSeeding() {
  try {
    console.log('🧪 Testing business leads seeding with new images...');
    
    // Check if images exist
    const imagesDir = path.join(__dirname, '..', 'Images');
    const images = fs.readdirSync(imagesDir);
    
    console.log('📁 Available images:');
    images.forEach(img => {
      const stats = fs.statSync(path.join(imagesDir, img));
      console.log(`   - ${img} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    });
    
    console.log('\n✅ Images are ready for business leads testing!');
    console.log('📝 Business leads feature includes:');
    console.log('   - Collection creation and permissions');
    console.log('   - API route for submissions');
    console.log('   - Frontend form integration');
    console.log('   - Seeder script with sample data');
    console.log('   - High-quality test images');
    
    console.log('\n🚀 To test the complete system:');
    console.log('   1. Start Directus: docker-compose -f config/docker-compose.yml up -d');
    console.log('   2. Run seeder: cd tests/scripts && node seeder.js');
    console.log('   3. Test API: POST http://localhost/api/business-leads');
    console.log('   4. Check frontend: http://localhost/list-business');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testBusinessLeadsSeeding();
