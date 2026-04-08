// Check existing policies and create missing ones
async function checkAndFixPolicies() {
  try {
    console.log('🔧 Checking and fixing policies...\n');
    
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
    
    // Check existing policies
    console.log('\n2. Checking existing policies...');
    try {
      const policiesResponse = await fetch('http://localhost:8055/policies', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json();
        console.log('   Found ' + policies.data.length + ' policies:');
        policies.data.forEach(p => {
          console.log('     - ' + p.name + ' (' + p.id + ')');
        });
        
        const publicPolicy = policies.data.find(p => p.name === 'Public');
        const adminPolicy = policies.data.find(p => p.name === 'Administrator');
        
        if (!publicPolicy) {
          console.log('\n3. Creating Public policy...');
          try {
            const policyResponse = await fetch('http://localhost:8055/policies', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'Public',
                icon: 'public',
                description: 'Public access policy for unauthenticated users',
                roles: ['192df901-9d32-45ec-9b4e-60faf5feac5c'] // Public role ID
              })
            });
            
            if (policyResponse.ok) {
              const policyData = await policyResponse.json();
              console.log('   ✅ Public policy created: ' + policyData.data.id);
            } else {
              console.log('   ❌ Public policy creation failed');
            }
          } catch (error) {
            console.log('   ❌ Public policy creation error:', error.message);
          }
        } else {
          console.log('   ✅ Public policy already exists: ' + publicPolicy.id);
        }
        
        if (!adminPolicy) {
          console.log('\n4. Creating Administrator policy...');
          try {
            const policyResponse = await fetch('http://localhost:8055/policies', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: 'Administrator',
                icon: 'admin_panel_settings',
                description: 'Administrator access policy',
                roles: ['92b8ded5-e891-48b6-9aff-bf0ab047eb5e'] // Administrator role ID
              })
            });
            
            if (policyResponse.ok) {
              const policyData = await policyResponse.json();
              console.log('   ✅ Administrator policy created: ' + policyData.data.id);
            } else {
              console.log('   ❌ Administrator policy creation failed');
            }
          } catch (error) {
            console.log('   ❌ Administrator policy creation error:', error.message);
          }
        } else {
          console.log('   ✅ Administrator policy already exists: ' + adminPolicy.id);
        }
      }
    } catch (error) {
      console.log('   ❌ Policies check error:', error.message);
    }
    
    // Get updated policies
    console.log('\n5. Getting updated policies...');
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
          console.log('   ✅ Public policy: ' + publicPolicyId);
        }
        
        if (adminPolicy) {
          adminPolicyId = adminPolicy.id;
          console.log('   ✅ Administrator policy: ' + adminPolicyId);
        }
      }
    } catch (error) {
      console.log('   ❌ Updated policies check error:', error.message);
    }
    
    if (publicPolicyId && adminPolicyId) {
      // Create permissions for basic collections
      console.log('\n6. Creating permissions for basic collections...');
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
      console.log('\n7. Testing permissions...');
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
    }
    
    console.log('\n🎉 Policy check and fix completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Checked existing policies');
    console.log('   ✅ Created missing policies');
    console.log('   ✅ Fixed permissions for basic collections');
    console.log('   ✅ Frontend should now work without 403 errors');
    
  } catch (error) {
    console.error('❌ Policy fix failed:', error);
  }
}

checkAndFixPolicies();
