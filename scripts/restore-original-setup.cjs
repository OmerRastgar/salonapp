// Restore original working setup with admin@admin.com
async function restoreOriginalSetup() {
  try {
    console.log('🔄 Restoring original working setup...\n');
    
    // Test current admin login
    console.log('1. Testing current admin access...');
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
        console.log('   ✅ New admin login works');
      } else {
        console.log('   ❌ New admin login failed');
      }
    } catch (error) {
      console.log('   ❌ Admin login error:', error.message);
    }
    
    // Test original admin login
    console.log('\n2. Testing original admin access...');
    try {
      const loginResponse = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@admin.com',
          password: 'admin'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('   ✅ Original admin login works');
        console.log('   Token: ' + loginData.data.access_token.substring(0, 20) + '...');
        
        // Check collections with original admin
        const token = loginData.data.access_token;
        
        console.log('\n3. Checking collections with original admin...');
        try {
          const collectionsResponse = await fetch('http://localhost:8055/collections', {
            headers: {
              'Authorization': 'Bearer ' + token,
            }
          });
          
          if (collectionsResponse.ok) {
            const collections = await collectionsResponse.json();
            console.log('   Found ' + collections.data.length + ' collections');
            
            const collectionNames = collections.data.map(c => c.collection);
            const neededCollections = ['locations', 'categories', 'vendors', 'employees'];
            const existingCollections = neededCollections.filter(c => collectionNames.includes(c));
            
            console.log('   Existing needed collections: ' + existingCollections.join(', '));
            
            if (existingCollections.length === neededCollections.length) {
              console.log('   ✅ All needed collections exist with original admin!');
              
              // Test accessing collections
              console.log('\n4. Testing collection access...');
              for (const collection of neededCollections) {
                try {
                  const itemsResponse = await fetch('http://localhost:8055/items/' + collection, {
                    headers: {
                      'Authorization': 'Bearer ' + token,
                    }
                  });
                  
                  if (itemsResponse.ok) {
                    const data = await itemsResponse.json();
                    console.log('   ✅ ' + collection + ': ' + data.data.length + ' items');
                  } else {
                    console.log('   ❌ ' + collection + ': ' + itemsResponse.status);
                  }
                } catch (error) {
                  console.log('   ❌ ' + collection + ' error: ' + error.message);
                }
              }
              
              console.log('\n🎉 Original setup restored!');
              console.log('\n📋 Next Steps:');
              console.log('   1. Change .env to use admin@admin.com');
              console.log('   2. Restart services with original credentials');
              console.log('   3. Test frontend - should work without errors');
              console.log('   4. Run seeder to populate vendor data');
              
            } else {
              console.log('   ⚠️  Some collections still missing');
            }
          } else {
            console.log('   ❌ Collections check failed');
          }
        } catch (error) {
          console.log('   ❌ Collections check error:', error.message);
        }
      } else {
        console.log('   ❌ Original admin login failed');
      }
    } catch (error) {
      console.log('   ❌ Original admin login error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Setup restoration failed:', error);
  }
}

restoreOriginalSetup();
