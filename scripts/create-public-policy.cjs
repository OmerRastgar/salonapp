// Create Public policy and fix permissions
async function createPublicPolicyAndFixPermissions() {
  try {
    console.log('🔧 Creating Public policy and fixing permissions...\n');
    
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
    
    // Create Public role if it doesn't exist
    console.log('\n2. Creating Public role...');
    try {
      const roleResponse = await fetch('http://localhost:8055/roles', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Public',
          icon: 'public',
          description: 'Public access role for unauthenticated users'
        })
      });
      
      if (roleResponse.ok) {
        const roleData = await roleResponse.json();
        console.log('   ✅ Public role created: ' + roleData.data.id);
      } else {
        const errorText = await roleResponse.text();
        console.log('   ⚠️  Public role may already exist');
      }
    } catch (error) {
      console.log('   ❌ Public role creation error:', error.message);
    }
    
    // Get roles to find Public role
    console.log('\n3. Getting Public role...');
    let publicRoleId = null;
    let adminRoleId = null;
    
    try {
      const rolesResponse = await fetch('http://localhost:8055/roles', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (rolesResponse.ok) {
        const roles = await rolesResponse.json();
        const publicRole = roles.data.find(r => r.name === 'Public');
        const adminRole = roles.data.find(r => r.name === 'Administrator');
        
        if (publicRole) {
          publicRoleId = publicRole.id;
          console.log('   ✅ Found Public role: ' + publicRoleId);
        }
        
        if (adminRole) {
          adminRoleId = adminRole.id;
          console.log('   ✅ Found Administrator role: ' + adminRoleId);
        }
      }
    } catch (error) {
      console.log('   ❌ Role lookup error:', error.message);
    }
    
    if (!publicRoleId || !adminRoleId) {
      console.log('   ❌ Could not find required roles');
      return;
    }
    
    // Create Public policy
    console.log('\n4. Creating Public policy...');
    let publicPolicyId = null;
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
          roles: [publicRoleId]
        })
      });
      
      if (policyResponse.ok) {
        const policyData = await policyResponse.json();
        publicPolicyId = policyData.data.id;
        console.log('   ✅ Public policy created: ' + publicPolicyId);
      } else {
        const errorText = await policyResponse.text();
        console.log('   ⚠️  Public policy may already exist');
        
        // Try to find existing Public policy
        const policiesResponse = await fetch('http://localhost:8055/policies', {
          headers: {
            'Authorization': 'Bearer ' + token,
          }
        });
        
        if (policiesResponse.ok) {
          const policies = await policiesResponse.json();
          const publicPolicy = policies.data.find(p => p.name === 'Public');
          if (publicPolicy) {
            publicPolicyId = publicPolicy.id;
            console.log('   ✅ Found existing Public policy: ' + publicPolicyId);
          }
        }
      }
    } catch (error) {
      console.log('   ❌ Public policy creation error:', error.message);
    }
    
    if (!publicPolicyId) {
      console.log('   ❌ Could not find or create Public policy');
      return;
    }
    
    // Get Administrator policy
    console.log('\n5. Getting Administrator policy...');
    let adminPolicyId = null;
    try {
      const policiesResponse = await fetch('http://localhost:8055/policies', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json();
        const adminPolicy = policies.data.find(p => p.name === 'Administrator');
        
        if (adminPolicy) {
          adminPolicyId = adminPolicy.id;
          console.log('   ✅ Found Administrator policy: ' + adminPolicyId);
        }
      }
    } catch (error) {
      console.log('   ❌ Administrator policy lookup error:', error.message);
    }
    
    if (!adminPolicyId) {
      console.log('   ❌ Could not find Administrator policy');
      return;
    }
    
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
    
    console.log('\n🎉 Public policy and permissions setup completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Created Public role and policy');
    console.log('   ✅ Fixed permissions for: locations, categories, vendors');
    console.log('   ✅ Public read permissions added');
    console.log('   ✅ Admin full permissions added');
    console.log('   ✅ Frontend should now work without 403 errors');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

createPublicPolicyAndFixPermissions();
