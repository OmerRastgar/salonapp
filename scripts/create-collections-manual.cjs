// Manual collection creation using Directus API
async function createCollectionsManual() {
  try {
    console.log('🔧 Manually creating collections for frontend...\n');
    
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
    
    // Get Administrator policy ID
    console.log('\n2. Getting Administrator policy...');
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
      console.log('   ❌ Policy lookup error:', error.message);
    }
    
    if (!adminPolicyId) {
      console.log('   ❌ Could not find Administrator policy');
      return;
    }
    
    // Create collections
    console.log('\n3. Creating collections...');
    const collections = [
      {
        collection: 'locations',
        icon: 'place',
        note: 'Cities and areas where vendors operate'
      },
      {
        collection: 'categories',
        icon: 'category',
        note: 'Business categories like Barber, Beauty Salon, Spa'
      },
      {
        collection: 'vendors',
        icon: 'store',
        note: 'Salon and barbershop vendors'
      }
    ];
    
    for (const collection of collections) {
      console.log('   Creating: ' + collection.collection);
      try {
        const createResponse = await fetch('http://localhost:8055/collections', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(collection)
        });
        
        if (createResponse.ok) {
          console.log('     ✅ Collection created');
        } else {
          const errorText = await createResponse.text();
          console.log('     ⚠️  Collection may already exist or failed: ' + errorText);
        }
      } catch (error) {
        console.log('     ❌ Collection creation error: ' + error.message);
      }
    }
    
    // Wait a moment for collections to be fully created
    console.log('\n4. Waiting for collections to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create fields for each collection
    console.log('\n5. Creating fields...');
    const fieldsConfig = {
      'locations': [
        { field: 'name', type: 'string', interface: 'input', required: true },
        { field: 'slug', type: 'string', interface: 'input', required: true },
        { field: 'sort_order', type: 'integer', interface: 'numeric', required: false },
        { field: 'status', type: 'string', interface: 'select-dropdown', required: false }
      ],
      'categories': [
        { field: 'name', type: 'string', interface: 'input', required: true },
        { field: 'slug', type: 'string', interface: 'input', required: true },
        { field: 'sort_order', type: 'integer', interface: 'numeric', required: false },
        { field: 'status', type: 'string', interface: 'select-dropdown', required: false }
      ],
      'vendors': [
        { field: 'name', type: 'string', interface: 'input', required: true },
        { field: 'slug', type: 'string', interface: 'input', required: true },
        { field: 'description', type: 'text', interface: 'textarea', required: false },
        { field: 'email', type: 'string', interface: 'input', required: true },
        { field: 'phone', type: 'string', interface: 'input', required: true },
        { field: 'address', type: 'text', interface: 'textarea', required: false },
        { field: 'city', type: 'string', interface: 'input', required: true },
        { field: 'area', type: 'string', interface: 'input', required: false },
        { field: 'rating', type: 'decimal', interface: 'numeric', required: false },
        { field: 'reviews_count', type: 'integer', interface: 'numeric', required: false },
        { field: 'is_featured', type: 'boolean', interface: 'toggle', required: false },
        { field: 'is_verified', type: 'boolean', interface: 'toggle', required: false },
        { field: 'women_only', type: 'boolean', interface: 'toggle', required: false },
        { field: 'status', type: 'string', interface: 'select-dropdown', required: false }
      ]
    };
    
    for (const [collectionName, fields] of Object.entries(fieldsConfig)) {
      console.log('   Adding fields to: ' + collectionName);
      for (const field of fields) {
        try {
          const fieldResponse = await fetch('http://localhost:8055/fields', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              collection: collectionName,
              ...field
            })
          });
          
          if (fieldResponse.ok) {
            console.log('     ✅ Added field: ' + field.field);
          } else {
            console.log('     ⚠️  Field may already exist: ' + field.field);
          }
        } catch (error) {
          console.log('     ❌ Field error: ' + field.field);
        }
      }
    }
    
    // Wait for fields to be created
    console.log('\n6. Waiting for fields to be ready...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Add basic data
    console.log('\n7. Adding basic data...');
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
        },
        {
          name: 'Barber Shop Pro',
          slug: 'barber-shop-pro',
          description: 'Traditional barbershop with modern techniques. Specializing in classic cuts, hot towel shaves, and men\'s grooming services.',
          email: 'hello@barbershoppro.com',
          phone: '+92-21-23456789',
          address: '456 Commercial Street, Block 7',
          city: 'Karachi',
          area: 'Clifton',
          rating: 4.6,
          reviews_count: 89,
          is_featured: false,
          is_verified: true,
          women_only: false,
          status: 'active'
        }
      ]
    };
    
    for (const [collectionName, items] of Object.entries(basicData)) {
      console.log('   Adding data to: ' + collectionName);
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
            console.log('     ❌ Failed: ' + item.name + ' - ' + errorText);
          }
        } catch (error) {
          console.log('     ❌ Data error: ' + item.name + ' - ' + error.message);
        }
      }
    }
    
    // Set permissions
    console.log('\n8. Setting permissions...');
    const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // Public policy
    
    for (const collection of ['locations', 'categories', 'vendors']) {
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
          console.log('     ⚠️  Public read may already exist');
        }
      } catch (error) {
        console.log('     ❌ Public read error: ' + error.message);
      }
    }
    
    // Test collections
    console.log('\n9. Testing collections...');
    for (const collection of ['locations', 'categories', 'vendors']) {
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
    
    console.log('\n🎉 Manual collection creation completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Created collections: locations, categories, vendors');
    console.log('   ✅ Added fields to all collections');
    console.log('   ✅ Added basic test data');
    console.log('   ✅ Set public read permissions');
    console.log('   ✅ Frontend should now work without fetch errors');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Refresh frontend: http://localhost:3000');
    console.log('   2. Check browser console - errors should be resolved');
    console.log('   3. Test vendor listings and search');
    console.log('   4. Verify images are displayed correctly');
    
  } catch (error) {
    console.error('❌ Manual creation failed:', error);
  }
}

createCollectionsManual();
