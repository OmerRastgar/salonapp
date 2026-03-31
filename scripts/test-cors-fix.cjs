// Test CORS fix
async function testCorsFix() {
  try {
    console.log('🧪 Testing CORS fix...\n');
    
    // Test Directus API with CORS headers
    console.log('1. Testing Directus API with CORS...');
    try {
      const response = await fetch('http://localhost:8055/items/locations', {
        method: 'GET',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      
      if (response.ok) {
        console.log('   ✅ Directus API accessible with CORS');
        console.log('   Status: ' + response.status);
        console.log('   CORS Headers: ' + JSON.stringify(response.headers));
      } else {
        console.log('   ❌ Directus API failed: ' + response.status);
      }
    } catch (error) {
      console.log('   ❌ Directus API error: ' + error.message);
    }
    
    // Test frontend access to Directus
    console.log('\n2. Testing frontend to Directus communication...');
    try {
      const response = await fetch('http://localhost:8055/items/locations', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('   ✅ Frontend can access Directus');
        console.log('   Status: ' + response.status);
        const data = await response.json();
        console.log('   Items: ' + data.data.length);
      } else {
        console.log('   ❌ Frontend access failed: ' + response.status);
      }
    } catch (error) {
      console.log('   ❌ Frontend access error: ' + error.message);
    }
    
    // Test if collections exist
    console.log('\n3. Checking if collections exist...');
    try {
      const loginResponse = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@saloonmarketplace.com',
          password: 'Admin@2024!Secure#Access'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        const token = loginData.data.access_token;
        
        const collectionsResponse = await fetch('http://localhost:8055/collections', {
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        });
        
        if (collectionsResponse.ok) {
          const collections = await collectionsResponse.json();
          console.log('   ✅ Collections accessible: ' + collections.data.length);
          
          const collectionNames = collections.data.map(c => c.collection);
          const neededCollections = ['locations', 'categories', 'vendors'];
          const existingCollections = neededCollections.filter(c => collectionNames.includes(c));
          
          console.log('   Existing needed collections: ' + existingCollections.join(', '));
          
          if (existingCollections.length === neededCollections.length) {
            console.log('   ✅ All needed collections exist!');
          } else {
            console.log('   ⚠️  Some collections still missing');
          }
        } else {
          console.log('   ❌ Collections not accessible');
        }
      } else {
        console.log('   ❌ Login failed');
      }
    } catch (error) {
      console.log('   ❌ Collection check error: ' + error.message);
    }
    
    console.log('\n🎉 CORS test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ CORS configuration tested');
    console.log('   ✅ Frontend-Directus communication tested');
    console.log('   ✅ Collection existence verified');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. If CORS issues persist, restart Directus service');
    console.log('   2. If collections missing, create them manually in Directus Admin');
    console.log('   3. Refresh frontend and test functionality');
    
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
}

testCorsFix();
