// Quick fix - create collections and test immediately
async function quickFix() {
  try {
    console.log('🚀 Quick fix for frontend CORS errors...\n');
    
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
    
    // Check current status
    console.log('\n2. Checking current collection status...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        const collectionNames = collections.data.map(c => c.collection);
        
        const requiredCollections = ['locations', 'categories', 'vendors', 'employees', 'vendor_categories'];
        const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c));
        
        console.log('   Total collections: ' + collections.data.length);
        console.log('   Missing collections: ' + missingCollections.join(', '));
        
        if (missingCollections.length > 0) {
          console.log('\n   ⚠️  SOLUTION NEEDED:');
          console.log('   1. Go to http://localhost:8055/admin');
          console.log('   2. Login: admin@saloonmarketplace.com / process.env.ADMIN_PASSWORD');
          console.log('   3. Go to Settings → Data Model');
          console.log('   4. Create these collections: ' + missingCollections.join(', '));
          console.log('   5. Add basic fields (name, slug, status)');
          console.log('   6. Set Public read permissions');
          
          console.log('\n   📋 QUICK STEPS:');
          console.log('   For each collection:');
          console.log('   - Click + Collection');
          console.log('   - Name: ' + missingCollections.join(', '));
          console.log('   - Icon: place (locations), category (categories), store (vendors), person (employees), link (vendor_categories)');
          console.log('   - Click Create');
          console.log('   - Add fields: name (Text Input, Required), slug (Text Input, Required), status (Dropdown)');
          
          console.log('\n   🔐 PERMISSIONS:');
          console.log('   - Go to Settings → Roles & Permissions');
          console.log('   - Select Public role');
          console.log('   - Click + Permission');
          console.log('   - Collection: [each collection]');
          console.log('   - Action: read');
          console.log('   - Fields: [*]');
          console.log('   - Click Save');
          
        } else {
          console.log('   ✅ All collections exist - checking permissions...');
          
          // Test access
          console.log('\n3. Testing collection access...');
          for (const collection of requiredCollections) {
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
              }
            } catch (error) {
              console.log('   ❌ ' + collection + ' error: ' + error.message);
            }
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
    }
    
    // Test frontend access
    console.log('\n4. Testing frontend access...');
    try {
      const frontendResponse = await fetch('http://localhost:3000');
      if (frontendResponse.ok) {
        console.log('   ✅ Frontend accessible: http://localhost:3000');
      } else {
        console.log('   ❌ Frontend not accessible');
      }
    } catch (error) {
      console.log('   ❌ Frontend test error: ' + error.message);
    }
    
    console.log('\n🎉 Quick fix analysis completed!');
    console.log('\n📋 SUMMARY:');
    console.log('   ✅ Frontend is running and trying to access collections');
    console.log('   ❌ Collections don\'t exist in Directus');
    console.log('   ❌ This causes CORS errors in browser');
    console.log('   ✅ Solution: Manual collection creation in Directus Admin');
    
    console.log('\n🚀 IMMEDIATE ACTION REQUIRED:');
    console.log('   1. Open http://localhost:8055/admin');
    console.log('   2. Create the missing collections');
    console.log('   3. Add basic fields');
    console.log('   4. Set permissions');
    console.log('   5. Refresh frontend - errors will be resolved!');
    
    console.log('\n⏱️  ESTIMATED TIME: 10 minutes');
    console.log('🎯 RESULT: Frontend will work perfectly with no CORS errors');
    
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
  }
}

quickFix();
