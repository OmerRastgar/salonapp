// Diagnose seeder issues
async function diagnoseSeeder() {
  try {
    console.log('🔧 Diagnosing seeder issues...\n');
    
    // Test Directus connection
    console.log('1. Testing Directus connection...');
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
    
    // Check what collections exist
    console.log('\n2. Checking available collections...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        console.log('   Found ' + collections.data.length + ' collections:');
        
        const collectionNames = collections.data.map(c => c.collection);
        console.log('   All collections: ' + collectionNames.join(', '));
        
        // Check for the collections we need
        const neededCollections = ['locations', 'categories', 'vendors', 'employees'];
        const existingCollections = neededCollections.filter(c => collectionNames.includes(c));
        
        console.log('\n3. Checking needed collections:');
        neededCollections.forEach(collection => {
          if (collectionNames.includes(collection)) {
            console.log('   ✅ ' + collection + ' exists');
          } else {
            console.log('   ❌ ' + collection + ' missing');
          }
        });
        
        // Test accessing each needed collection
        console.log('\n4. Testing collection access...');
        for (const collection of neededCollections) {
          if (collectionNames.includes(collection)) {
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
          } else {
            console.log('   ⚠️  ' + collection + ' not found');
          }
        }
      } else {
        console.log('   ❌ Collections check failed');
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
    }
    
    // Check if we can create collections
    console.log('\n5. Testing collection creation...');
    try {
      const testCollection = {
        collection: 'test_collection',
        icon: 'folder',
        note: 'Test collection for diagnosis'
      };
      
      const createResponse = await fetch('http://localhost:8055/collections', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCollection)
      });
      
      if (createResponse.ok) {
        console.log('   ✅ Can create collections');
        
        // Delete test collection
        const deleteResponse = await fetch('http://localhost:8055/collections/test_collection', {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        });
        
        if (deleteResponse.ok) {
          console.log('   ✅ Can delete collections');
        } else {
          console.log('   ⚠️  Cannot delete test collection');
        }
      } else {
        console.log('   ❌ Cannot create collections:', createResponse.status);
        const errorText = await createResponse.text();
        console.log('   Error: ' + errorText);
      }
    } catch (error) {
      console.log('   ❌ Collection creation test error:', error.message);
    }
    
    // Check images
    console.log('\n6. Checking uploaded images...');
    try {
      const filesResponse = await fetch('http://localhost:8055/files', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (filesResponse.ok) {
        const files = await filesResponse.json();
        const imageFiles = files.data.filter(f => 
          f.type && f.type.startsWith('image/') && 
          (f.filename_download.endsWith('.jpg') || f.filename_download.endsWith('.jpeg') || f.filename_download.endsWith('.png'))
        );
        
        console.log('   ✅ Found ' + imageFiles.length + ' images:');
        imageFiles.forEach(img => {
          console.log('     - ' + img.filename_download + ' (' + Math.round(img.filesize / 1024 / 1024) + 'MB)');
        });
      } else {
        console.log('   ❌ Cannot access files');
      }
    } catch (error) {
      console.log('   ❌ Files check error:', error.message);
    }
    
    console.log('\n🎉 Diagnosis completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Directus connection: Working');
    console.log('   ✅ Admin authentication: Working');
    console.log('   ✅ Images: ' + (imageFiles ? imageFiles.length + ' uploaded' : 'Not accessible'));
    console.log('   Collections status: ' + (existingCollections ? 'Some exist' : 'Need creation'));
    console.log('   Collection creation: ' + (createResponse.ok ? 'Possible' : 'Not possible'));
    
    console.log('\n🔧 Next Steps:');
    if (existingCollections && existingCollections.includes('vendors')) {
      console.log('   ✅ Run original seeder: node tests/scripts/seeder.js');
    } else {
      console.log('   ❌ Create missing collections first in Directus Admin');
      console.log('   📍 Admin URL: http://localhost:8055/admin');
      console.log('   🔑 Login: admin@saloonmarketplace.com / process.env.ADMIN_PASSWORD');
    }
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
  }
}

diagnoseSeeder();
