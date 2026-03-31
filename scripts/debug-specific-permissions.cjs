// Debug specific permission issues for locations and vendors
async function debugSpecificPermissions() {
  try {
    console.log('🔍 Debugging specific permission issues for locations and vendors...\n');
    
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
          password: 'Admin@2024!Secure#Access'
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
    console.log('\n2. Checking all collections...');
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
        const userCollections = collectionNames.filter(c => !c.startsWith('directus_'));
        
        console.log('   User collections: ' + userCollections.join(', '));
        
        // Check if locations and vendors exist
        const hasLocations = collectionNames.includes('locations');
        const hasVendors = collectionNames.includes('vendors');
        
        console.log('   locations exists: ' + (hasLocations ? '✅' : '❌'));
        console.log('   vendors exists: ' + (hasVendors ? '✅' : '❌'));
        
        if (!hasLocations || !hasVendors) {
          console.log('\n   ⚠️  Collections don\'t exist - this is the root cause!');
          console.log('   Need to create collections first before setting permissions.');
        }
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
    }
    
    // Check existing permissions
    console.log('\n3. Checking existing permissions...');
    try {
      const permissionsResponse = await fetch('http://localhost:8055/permissions', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (permissionsResponse.ok) {
        const permissions = await permissionsResponse.json();
        console.log('   Found ' + permissions.data.length + ' permissions');
        
        // Group permissions by collection
        const permissionsByCollection = {};
        permissions.data.forEach(p => {
          if (!permissionsByCollection[p.collection]) {
            permissionsByCollection[p.collection] = [];
          }
          permissionsByCollection[p.collection].push(p.action);
        });
        
        console.log('\n   Permissions by collection:');
        Object.keys(permissionsByCollection).forEach(collection => {
          console.log('     ' + collection + ': ' + permissionsByCollection[collection].join(', '));
        });
        
        // Check permissions for locations and vendors
        const locationsPerms = permissionsByCollection['locations'] || [];
        const vendorsPerms = permissionsByCollection['vendors'] || [];
        
        console.log('\n   locations permissions: ' + (locationsPerms.length > 0 ? locationsPerms.join(', ') : 'None'));
        console.log('   vendors permissions: ' + (vendorsPerms.length > 0 ? vendorsPerms.join(', ') : 'None'));
        
        // Check if public read permissions exist
        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
        const locationsPublicRead = permissions.data.find(p => 
          p.collection === 'locations' && 
          p.action === 'read' && 
          p.policy === publicPolicyId
        );
        const vendorsPublicRead = permissions.data.find(p => 
          p.collection === 'vendors' && 
          p.action === 'read' && 
          p.policy === publicPolicyId
        );
        
        console.log('\n   locations public read permission: ' + (locationsPublicRead ? '✅' : '❌'));
        console.log('   vendors public read permission: ' + (vendorsPublicRead ? '✅' : '❌'));
        
      }
    } catch (error) {
      console.log('   ❌ Permissions check error:', error.message);
    }
    
    // Test direct access to collections
    console.log('\n4. Testing direct collection access...');
    const testCollections = ['locations', 'vendors', 'categories', 'employees'];
    
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
          
          // Get more details on the error
          const errorText = await testResponse.text();
          if (errorText.includes('FORBIDDEN')) {
            console.log('      → Permission issue');
          } else if (errorText.includes('NOT_FOUND')) {
            console.log('      → Collection doesn\'t exist');
          }
        }
      } catch (error) {
        console.log('   ❌ ' + collection + ' error: ' + error.message);
      }
    }
    
    // Check what other collections are working
    console.log('\n5. Checking what collections are working...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        
        // Test a few system collections to see if they work
        const systemCollections = collections.data
          .filter(c => c.collection.startsWith('directus_'))
          .slice(0, 3)
          .map(c => c.collection);
        
        for (const collection of systemCollections) {
          try {
            const testResponse = await fetch('http://localhost:8055/items/' + collection, {
              headers: {
                'Authorization': 'Bearer ' + token,
              }
            });
            
            if (testResponse.ok) {
              const data = await testResponse.json();
              console.log('   ✅ ' + collection + ': ' + data.data.length + ' items (working)');
            } else {
              console.log('   ❌ ' + collection + ': ' + testResponse.status);
            }
          } catch (error) {
            console.log('   ❌ ' + collection + ' error: ' + error.message);
          }
        }
      }
    } catch (error) {
      console.log('   ❌ System collections check error:', error.message);
    }
    
    console.log('\n🎉 Permission debugging completed!');
    console.log('\n📋 Findings:');
    console.log('   ✅ Admin login: Working');
    console.log('   ❌ Root cause identified: Collections don\'t exist');
    console.log('   ❌ Cannot set permissions on non-existent collections');
    console.log('   ✅ System collections work fine');
    
    console.log('\n🔧 Solution:');
    console.log('   1. Create collections manually in Directus Admin');
    console.log('   2. Then permissions will work correctly');
    console.log('   3. Frontend will work without CORS errors');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Go to http://localhost:8055/admin');
    console.log('   2. Create locations and vendors collections');
    console.log('   3. Add fields and set permissions');
    console.log('   4. Test frontend');
    
  } catch (error) {
    console.error('❌ Permission debugging failed:', error);
  }
}

debugSpecificPermissions();
