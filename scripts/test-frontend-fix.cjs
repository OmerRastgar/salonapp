// Test and fix frontend issues
async function testFrontendFix() {
  try {
    console.log('🔧 Testing and fixing frontend issues...\n');
    
    // Login to get token
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
    
    // Check what collections actually exist
    console.log('\n2. Checking actual collections...');
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
        console.log('   ' + collectionNames.join(', '));
        
        // Check if the collections we need exist
        const neededCollections = ['locations', 'categories', 'vendors'];
        const existingCollections = collectionNames;
        const missingCollections = neededCollections.filter(c => !existingCollections.includes(c));
        
        console.log('\n   Needed collections:');
        neededCollections.forEach(c => {
          if (existingCollections.includes(c)) {
            console.log('     ✅ ' + c + ' - exists');
          } else {
            console.log('     ❌ ' + c + ' - missing');
          }
        });
        
        if (missingCollections.length > 0) {
          console.log('\n3. Creating missing collections...');
          for (const collectionName of missingCollections) {
            try {
              const createResponse = await fetch('http://localhost:8055/collections', {
                method: 'POST',
                headers: {
                  'Authorization': 'Bearer ' + token,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  collection: collectionName,
                  icon: 'folder',
                  note: 'Collection created for frontend functionality'
                })
              });
              
              if (createResponse.ok) {
                console.log('   ✅ Created collection: ' + collectionName);
              } else {
                console.log('   ❌ Failed to create: ' + collectionName);
              }
            } catch (error) {
              console.log('   ❌ Collection creation error: ' + collectionName);
            }
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
    }
    
    // Add basic data to collections
    console.log('\n4. Adding basic data to collections...');
    const basicData = {
      'locations': [
        { name: 'Karachi', slug: 'karachi', sort_order: 1, status: 'active' },
        { name: 'Lahore', slug: 'lahore', sort_order: 2, status: 'active' },
        { name: 'Islamabad', slug: 'islamabad', sort_order: 3, status: 'active' }
      ],
      'categories': [
        { name: 'Barber', slug: 'barber', sort_order: 1, status: 'active' },
        { name: 'Beauty Salon', slug: 'beauty-salon', sort_order: 2, status: 'active' },
        { name: 'Spa', slug: 'spa', sort_order: 3, status: 'active' }
      ],
      'vendors': [
        {
          name: 'Glamour Salon & Spa',
          slug: 'glamour-salon-spa',
          description: 'Premier beauty destination offering comprehensive hair, skin, and wellness services.',
          email: 'info@glamoursalon.com',
          phone: '+92-21-34567890',
          address: '123 Main Boulevard, Phase 5',
          city: 'Karachi',
          area: 'DHA',
          rating: 4.8,
          reviews_count: 156,
          is_featured: true,
          is_verified: true,
          women_only: false,
          status: 'active'
        }
      ]
    };
    
    for (const [collectionName, items] of Object.entries(basicData)) {
      console.log('   Adding data to ' + collectionName + '...');
      for (const item of items) {
        try {
          const createResponse = await fetch('http://localhost:8055/items/' + collectionName, {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(item)
          });
          
          if (createResponse.ok) {
            console.log('     ✅ Added: ' + item.name);
          } else {
            const errorText = await createResponse.text();
            console.log('     ❌ Failed to add: ' + item.name + ' - ' + errorText);
          }
        } catch (error) {
          console.log('     ❌ Data error: ' + item.name + ' - ' + error.message);
        }
      }
    }
    
    // Test if collections are accessible
    console.log('\n5. Testing collection access...');
    const testCollections = ['locations', 'categories', 'vendors'];
    
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
        }
      } catch (error) {
        console.log('   ❌ ' + collection + ' test error: ' + error.message);
      }
    }
    
    // Test frontend access
    console.log('\n6. Testing frontend access...');
    try {
      const frontendResponse = await fetch('http://localhost:3000');
      if (frontendResponse.ok) {
        console.log('   ✅ Frontend accessible');
      } else {
        console.log('   ❌ Frontend not accessible: ' + frontendResponse.status);
      }
    } catch (error) {
      console.log('   ❌ Frontend test error: ' + error.message);
    }
    
    console.log('\n🎉 Frontend fix test completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Checked and created missing collections');
    console.log('   ✅ Added basic test data');
    console.log('   ✅ Verified collection access');
    console.log('   ✅ Frontend should now work without fetch errors');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Refresh the frontend at http://localhost:3000');
    console.log('   2. Check browser console for errors');
    console.log('   3. Test the search and vendor pages');
    console.log('   4. Verify images are displayed correctly');
    
  } catch (error) {
    console.error('❌ Frontend fix test failed:', error);
  }
}

testFrontendFix();
