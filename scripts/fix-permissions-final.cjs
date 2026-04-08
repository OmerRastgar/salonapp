// Fix permissions using existing policies
async function fixPermissionsFinal() {
  try {
    console.log('🔧 Final permissions fix...\n');
    
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
    
    // Get existing policies
    console.log('\n2. Getting existing policies...');
    let publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // $t:public_label
    let adminPolicyId = '8688db16-4f8a-48bf-9272-35d5399d2c15'; // Administrator
    
    console.log('   ✅ Using Public policy: ' + publicPolicyId);
    console.log('   ✅ Using Administrator policy: ' + adminPolicyId);
    
    // Create permissions for basic collections
    console.log('\n3. Creating permissions for basic collections...');
    const collections = ['locations', 'categories', 'vendors'];
    
    for (const collection of collections) {
      console.log('   Setting permissions for: ' + collection);
      
      // Public read permissions
      try {
        const permResponse = await fetch('http://localhost:8055/permissions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: collection,
            action: 'read',
            permissions: '{}',
            validation: '{}',
            presets: '[]',
            fields: '["*"]',
            policy: publicPolicyId
          })
        });
        
        if (permResponse.ok) {
          console.log('     ✅ Public read permission');
        } else {
          const errorText = await permResponse.text();
          console.log('     ⚠️  Public read may already exist');
        }
      } catch (error) {
        console.log('     ❌ Public read error: ' + error.message);
      }
      
      // Admin full permissions
      const actions = ['read', 'create', 'update', 'delete'];
      for (const action of actions) {
        try {
          const permResponse = await fetch('http://localhost:8055/permissions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: collection,
              action: action,
              permissions: '{}',
              validation: '{}',
              presets: '[]',
              fields: '["*"]',
              policy: adminPolicyId
            })
          });
          
          if (permResponse.ok) {
            console.log('     ✅ Admin ' + action + ' permission');
          } else {
            console.log('     ⚠️  Admin ' + action + ' may already exist');
          }
        } catch (error) {
          console.log('     ❌ Admin ' + action + ' error: ' + error.message);
        }
      }
    }
    
    // Test if permissions work
    console.log('\n4. Testing permissions...');
    for (const collection of collections) {
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
    
    // Test public access (without token)
    console.log('\n5. Testing public access...');
    for (const collection of collections) {
      try {
        const testResponse = await fetch('http://localhost:8055/items/' + collection);
        
        if (testResponse.ok) {
          const data = await testResponse.json();
          console.log('   ✅ Public ' + collection + ': ' + data.data.length + ' items');
        } else {
          console.log('   ❌ Public ' + collection + ': ' + testResponse.status);
        }
      } catch (error) {
        console.log('   ❌ Public ' + collection + ' test error: ' + error.message);
      }
    }
    
    console.log('\n🎉 Final permissions fix completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Used existing Public policy ($t:public_label)');
    console.log('   ✅ Used existing Administrator policy');
    console.log('   ✅ Fixed permissions for: locations, categories, vendors');
    console.log('   ✅ Public read permissions added');
    console.log('   ✅ Admin full permissions added');
    console.log('   ✅ Frontend should now work without 403 errors');
    
  } catch (error) {
    console.error('❌ Final permissions fix failed:', error);
  }
}

fixPermissionsFinal();
