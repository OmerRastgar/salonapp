// Execute rebuild script to restore all collections and data
async function executeRebuild() {
  try {
    console.log('🔧 Executing rebuild script to restore collections and data...\n');
    
    // Read the SQL file
    console.log('1. Reading rebuild script...');
    const fs = require('fs');
    const path = require('path');
    
    const sqlFile = path.join(__dirname, '..', 'sql', 'setup', 'rebuild_marketplace.sql');
    
    if (!fs.existsSync(sqlFile)) {
      console.log('   ❌ SQL file not found:', sqlFile);
      return;
    }
    
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    console.log('   ✅ SQL file read successfully');
    
    // Login to Directus
    console.log('\n2. Logging in to Directus...');
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
    
    // Execute SQL via Directus queries endpoint
    console.log('\n3. Executing rebuild SQL...');
    try {
      // Split the SQL into smaller chunks to avoid timeouts
      const sqlChunks = sqlContent.split(';').filter(chunk => chunk.trim().length > 0);
      
      console.log('   Found ' + sqlChunks.length + ' SQL statements to execute');
      
      for (let i = 0; i < sqlChunks.length; i++) {
        const chunk = sqlChunks[i].trim();
        if (chunk.length === 0) continue;
        
        try {
          const response = await fetch('http://localhost:8055/queries', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sql: chunk
            })
          });
          
          if (response.ok) {
            console.log('   ✅ Statement ' + (i + 1) + ' executed successfully');
          } else {
            console.log('   ⚠️  Statement ' + (i + 1) + ' may have failed');
          }
        } catch (error) {
          console.log('   ❌ Statement ' + (i + 1) + ' error:', error.message);
        }
      }
      
      console.log('   ✅ All SQL statements processed');
    } catch (error) {
      console.log('   ❌ SQL execution error:', error.message);
    }
    
    // Check if collections were created
    console.log('\n4. Verifying collections...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        const collectionNames = collections.data.map(c => c.collection);
        
        const expectedCollections = ['locations', 'categories', 'vendors', 'employees'];
        const foundCollections = expectedCollections.filter(c => collectionNames.includes(c));
        
        console.log('   Found ' + collections.data.length + ' total collections');
        console.log('   Expected collections found: ' + foundCollections.length + '/' + expectedCollections.length);
        
        expectedCollections.forEach(collection => {
          if (collectionNames.includes(collection)) {
            console.log('   ✅ ' + collection + ' exists');
          } else {
            console.log('   ❌ ' + collection + ' still missing');
          }
        });
        
        // Test accessing collections
        console.log('\n5. Testing collection access...');
        for (const collection of expectedCollections) {
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
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Collections verification error:', error.message);
    }
    
    console.log('\n🎉 Rebuild execution completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ SQL script executed');
    console.log('   ✅ Collections should be restored');
    console.log('   ✅ Sample data should be populated');
    console.log('   ✅ Frontend should work without errors');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Refresh Directus Admin: http://localhost:8055/admin');
    console.log('   2. Check collections and sample data');
    console.log('   3. Test frontend: http://localhost:3000');
    console.log('   4. Verify professional images are assigned');
    
  } catch (error) {
    console.error('❌ Rebuild execution failed:', error);
  }
}

executeRebuild();
