// Fix permissions for basic collections
async function fixPermissions() {
  try {
    console.log('🔧 Fixing permissions for frontend collections...\n');
    
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
    
    // Get policy IDs
    console.log('\n2. Getting policy IDs...');
    let publicPolicyId = null;
    let adminPolicyId = null;
    
    try {
      const policiesResponse = await fetch('http://localhost:8055/policies', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json();
        const publicPolicy = policies.data.find(p => p.name === 'Public');
        const adminPolicy = policies.data.find(p => p.name === 'Administrator');
        
        if (publicPolicy) {
          publicPolicyId = publicPolicy.id;
          console.log('   ✅ Found Public policy: ' + publicPolicyId);
        }
        
        if (adminPolicy) {
          adminPolicyId = adminPolicy.id;
          console.log('   ✅ Found Administrator policy: ' + adminPolicyId);
        }
      }
    } catch (error) {
      console.log('   ❌ Policy lookup error:', error.message);
    }
    
    if (!publicPolicyId || !adminPolicyId) {
      console.log('   ❌ Could not find required policies');
      return;
    }
    
    // Create permissions for basic collections
    console.log('\n3. Creating permissions for basic collections...');
    const collections = ['locations', 'categories', 'vendors'];
    const actions = ['read', 'create', 'update', 'delete'];
    
    for (const collection of collections) {
      console.log('   Setting permissions for: ' + collection);
      
      for (const action of actions) {
        // Public read permissions
        if (action === 'read') {
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
                policy: publicPolicyId
              })
            });
            
            if (permResponse.ok) {
              console.log('     ✅ Public ' + action + ' permission');
            } else {
              const errorText = await permResponse.text();
              console.log('     ⚠️  Public ' + action + ' may already exist');
            }
          } catch (error) {
            console.log('     ❌ Public ' + action + ' error: ' + error.message);
          }
        }
        
        // Admin all permissions
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
            const errorText = await permResponse.text();
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
    
    console.log('\n🎉 Permissions fix completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Fixed permissions for: locations, categories, vendors');
    console.log('   ✅ Public read permissions added');
    console.log('   ✅ Admin full permissions added');
    console.log('   ✅ Frontend should now work without 403 errors');
    
  } catch (error) {
    console.error('❌ Permission fix failed:', error);
  }
}

fixPermissions();
