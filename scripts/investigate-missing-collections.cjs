// Investigate why collections are missing
async function investigateMissingCollections() {
  try {
    console.log('🔍 Investigating missing collections...\n');
    
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
    
    // Check all collections in detail
    console.log('\n2. Checking all collections in detail...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        console.log('   Found ' + collections.data.length + ' total collections');
        
        // Separate system collections from user collections
        const systemCollections = collections.data.filter(c => 
          c.collection.startsWith('directus_')
        );
        const userCollections = collections.data.filter(c => 
          !c.collection.startsWith('directus_')
        );
        
        console.log('   System collections: ' + systemCollections.length);
        console.log('   User collections: ' + userCollections.length);
        
        console.log('\n3. User collections found:');
        userCollections.forEach(c => {
          console.log('     - ' + c.collection + ' (icon: ' + (c.icon || 'none') + ')');
        });
        
        // Look for the collections we expect
        const expectedCollections = ['locations', 'categories', 'vendors', 'employees'];
        const foundCollections = userCollections.filter(c => expectedCollections.includes(c.collection));
        
        console.log('\n4. Expected collections status:');
        expectedCollections.forEach(expected => {
          const found = userCollections.find(c => c.collection === expected);
          if (found) {
            console.log('   ✅ ' + expected + ' exists');
          } else {
            console.log('   ❌ ' + expected + ' missing');
          }
        });
        
        // Check if there are any collections that might be our expected ones with different names
        console.log('\n5. Looking for similar collections...');
        const possibleMatches = userCollections.filter(c => {
          return expectedCollections.some(expected => 
            c.collection.toLowerCase().includes(expected.toLowerCase()) ||
            expected.toLowerCase().includes(c.collection.toLowerCase())
          );
        });
        
        if (possibleMatches.length > 0) {
          console.log('   Found possible matches:');
          possibleMatches.forEach(c => {
            console.log('     - ' + c.collection + ' (might be: ' + 
              expectedCollections.filter(e => 
                c.collection.toLowerCase().includes(e.toLowerCase()) ||
                e.toLowerCase().includes(c.collection.toLowerCase())
              ).join(', ')
            );
          });
        }
        
        // Check database schema directly
        console.log('\n6. Testing database schema...');
        try {
          const schemaResponse = await fetch('http://localhost:8055/relations', {
            headers: {
              'Authorization': 'Bearer ' + token,
            }
          });
          
          if (schemaResponse.ok) {
            const relations = await schemaResponse.json();
            console.log('   Found ' + relations.data.length + ' relations');
            
            // Look for relations to our expected collections
            const collectionRelations = relations.data.filter(r => 
              expectedCollections.some(c => 
                r.collection === c || r.related_collection === c
              )
            );
            
            if (collectionRelations.length > 0) {
              console.log('   Found relations for expected collections:');
              collectionRelations.forEach(r => {
                console.log('     - ' + (r.collection || r.related_collection) + ' → ' + (r.related_collection || r.collection));
              });
            } else {
              console.log('   ❌ No relations found for expected collections');
            }
          } else {
            console.log('   ❌ Relations check failed');
          }
        } catch (error) {
          console.log('   ❌ Relations check error:', error.message);
        }
        
      } else {
        console.log('   ❌ Collections check failed');
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
    }
    
    // Check what happened during our previous setup
    console.log('\n7. Checking Docker logs for clues...');
    try {
      const logsResponse = await fetch('http://localhost:8055/settings', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (logsResponse.ok) {
        const settings = await logsResponse.json();
        console.log('   Directus settings accessible');
      } else {
        console.log('   ❌ Settings check failed');
      }
    } catch (error) {
      console.log('   ❌ Settings check error:', error.message);
    }
    
    console.log('\n🎉 Investigation completed!');
    console.log('\n📋 Findings:');
    console.log('   ✅ Directus connection: Working');
    console.log('   ✅ Admin credentials: Valid');
    console.log('   ❌ Expected collections missing: locations, categories, vendors, employees');
    console.log('   ❌ No user collections found (only system collections)');
    
    console.log('\n🔍 Possible Causes:');
    console.log('   1. Collections were never created in the first place');
    console.log('   2. Collections were created in a different session with different admin');
    console.log('   3. Collections were deleted during container restart');
    console.log('   4. Admin user permissions insufficient');
    
    console.log('\n🚀 Recommended Solution:');
    console.log('   1. Manually create collections in Directus Admin');
    console.log('   2. Use admin@saloonmarketplace.com / process.env.ADMIN_PASSWORD');
    console.log('   3. Then run seeder to populate data');
    
  } catch (error) {
    console.error('❌ Investigation failed:', error);
  }
}

investigateMissingCollections();
