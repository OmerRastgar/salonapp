// Check collections and run seeder if they exist, create them if they don't
async function checkAndRunSeeder() {
  try {
    console.log('🔧 Checking collections and running seeder...\n');
    
    // Login to Directus
    console.log('1. Logging in to Directus...');
    let token = null;
    try {
      const loginResponse = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@saloonmarketplace.com',
          password: process.env.ADMIN_PASSWORD
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.data.access_token;
        console.log('   ✅ Admin login successful');
      } else {
        console.log('   ❌ Admin login failed:', loginResponse.status);
        return;
      }
    } catch (error) {
      console.log('   ❌ Login error:', error.message);
      return;
    }
    
    // Check if collections exist
    console.log('\n2. Checking if collections exist...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        const collectionNames = collections.data.map(c => c.collection);
        
        const requiredCollections = ['locations', 'categories', 'vendors', 'employees'];
        const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c));
        
        console.log('   Found ' + collections.data.length + ' collections');
        console.log('   Missing collections: ' + missingCollections.join(', '));
        
        if (missingCollections.length > 0) {
          console.log('\n   ⚠️  Collections missing! Please create them manually:');
          console.log('   1. Go to http://localhost:8055/admin');
          console.log('   2. Login: admin@saloonmarketplace.com / process.env.ADMIN_PASSWORD');
          console.log('   3. Go to Settings → Data Model');
          console.log('   4. Create collections: ' + missingCollections.join(', '));
          console.log('   5. Add basic fields (name, slug, status, etc.)');
          console.log('   6. Set permissions for Public role (read access)');
          console.log('\n   After creating collections, run this script again.\n');
          return;
        }
        
        console.log('   ✅ All required collections exist');
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
      return;
    }
    
    // Test collection access
    console.log('\n3. Testing collection access...');
    const testCollections = ['locations', 'categories', 'vendors', 'employees'];
    
    for (const collection of testCollections) {
      try {
        const testResponse = await fetch('http://localhost:8055/items/' + collection, {
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        });
        
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log('   ✅ ' + collection + ': ' + data.data.length + ' items');
        } else {
          console.log('   ❌ ' + collection + ': ' + testResponse.status);
          return;
        }
      } catch (error) {
        console.log('   ❌ ' + collection + ' test error: ' + error.message);
        return;
      }
    }
    
    // Run the original seeder
    console.log('\n4. Running original seeder...');
    try {
      const { spawn } = require('child_process');
      const seederProcess = spawn('node', ['tests/scripts/seeder.js'], {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      
      seederProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 Seeder completed successfully!');
        } else {
          console.log('\n❌ Seeder failed with exit code:', code);
        }
      });
      
    } catch (error) {
      console.log('   ❌ Failed to run seeder:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Check and run seeder failed:', error);
  }
}

checkAndRunSeeder();
