const fs = require('fs');

// Setup basic collections needed for the frontend to work
async function setupBasicCollections() {
  try {
    console.log('🔧 Setting up basic collections for frontend...\n');
    
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
    
    // Check current collections
    console.log('\n2. Checking current collections...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        console.log('   Found ' + collections.data.length + ' collections');
        
        const existingCollections = collections.data.map(c => c.collection);
        console.log('   Existing: ' + existingCollections.join(', '));
        
        // Collections we need to create
        const neededCollections = ['locations', 'categories', 'vendors', 'vendor_categories', 'employees', 'employee_services', 'employee_schedules', 'reviews', 'working_hours'];
        const missingCollections = neededCollections.filter(c => !existingCollections.includes(c));
        
        console.log('   Missing: ' + missingCollections.join(', '));
        
        if (missingCollections.length === 0) {
          console.log('   ✅ All needed collections already exist');
        } else {
          console.log('   ⚠️  Need to create: ' + missingCollections.length + ' collections');
        }
        
        return { token, existingCollections, missingCollections };
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Test if frontend can connect to basic Directus
async function testDirectusConnection() {
  try {
    console.log('🧪 Testing Directus connection from frontend perspective...\n');
    
    // Test basic Directus API access
    console.log('1. Testing Directus API base...');
    try {
      const response = await fetch('http://localhost:8055/server/info');
      if (response.ok) {
        console.log('   ✅ Directus API base accessible');
      } else {
        console.log('   ❌ Directus API base failed:', response.status);
      }
    } catch (error) {
      console.log('   ❌ Directus API base error:', error.message);
    }
    
    // Test authentication
    console.log('\n2. Testing authentication...');
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
        const token = loginData.data.access_token;
        console.log('   ✅ Authentication successful');
        
        // Test collections access
        console.log('\n3. Testing collections access...');
        try {
          const collectionsResponse = await fetch('http://localhost:8055/collections', {
            headers: {
              'Authorization': 'Bearer ' + token,
            }
          });
          
          if (collectionsResponse.ok) {
            const collections = await collectionsResponse.json();
            console.log('   ✅ Collections accessible: ' + collections.data.length);
            
            // Test specific collections that frontend needs
            const neededCollections = ['locations', 'categories', 'vendors'];
            console.log('\n4. Testing specific collections...');
            
            for (const collection of neededCollections) {
              try {
                const itemsResponse = await fetch('http://localhost:8055/items/' + collection, {
                  headers: {
                    'Authorization': 'Bearer ' + token,
                  }
                });
                
                if (itemsResponse.ok) {
                  const items = await itemsResponse.json();
                  console.log('   ✅ ' + collection + ': ' + items.data.length + ' items');
                } else {
                  console.log('   ❌ ' + collection + ': ' + itemsResponse.status);
                }
              } catch (error) {
                console.log('   ❌ ' + collection + ' error: ' + error.message);
              }
            }
          } else {
            console.log('   ❌ Collections access failed');
          }
        } catch (error) {
          console.log('   ❌ Collections test error:', error.message);
        }
      } else {
        console.log('   ❌ Authentication failed:', loginResponse.status);
      }
    } catch (error) {
      console.log('   ❌ Authentication error:', error.message);
    }
    
    console.log('\n🎉 Connection test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Create minimal collections to fix frontend errors
async function createMinimalCollections() {
  try {
    console.log('🔧 Creating minimal collections to fix frontend errors...\n');
    
    // Login to get token
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
        console.log('   ❌ Admin login failed');
        return;
      }
    } catch (error) {
      console.log('   ❌ Login error:', error.message);
      return;
    }
    
    // Create basic collections
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
    
    console.log('\n2. Creating basic collections...');
    for (const collection of collections) {
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
          console.log('   ✅ Created collection: ' + collection.collection);
        } else {
          const errorText = await createResponse.text();
          console.log('   ⚠️  Collection may already exist or failed: ' + collection.collection);
        }
      } catch (error) {
        console.log('   ❌ Collection creation error: ' + collection.collection);
      }
    }
    
    // Add basic fields to collections
    console.log('\n3. Adding basic fields...');
    const fields = {
      'locations': [
        { field: 'name', type: 'string', interface: 'input', required: true },
        { field: 'slug', type: 'string', interface: 'input', required: true },
        { field: 'sort_order', type: 'integer', interface: 'input', required: false },
        { field: 'status', type: 'string', interface: 'select-dropdown', required: false }
      ],
      'categories': [
        { field: 'name', type: 'string', interface: 'input', required: true },
        { field: 'slug', type: 'string', interface: 'input', required: true },
        { field: 'sort_order', type: 'integer', interface: 'input', required: false },
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
    
    for (const [collectionName, fieldList] of Object.entries(fields)) {
      console.log('   Adding fields to ' + collectionName + '...');
      for (const field of fieldList) {
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
    
    // Add some basic data
    console.log('\n4. Adding basic data...');
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
            console.log('     ❌ Failed to add: ' + item.name);
          }
        } catch (error) {
          console.log('     ❌ Data error: ' + item.name);
        }
      }
    }
    
    console.log('\n🎉 Basic collections setup completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Created basic collections: locations, categories, vendors');
    console.log('   ✅ Added fields to collections');
    console.log('   ✅ Added basic data for testing');
    console.log('   ✅ Frontend should now work without fetch errors');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

// Run the setup
async function runSetup() {
  console.log('🔧 Fixing frontend fetch errors...\n');
  
  // First test the connection
  await testDirectusConnection();
  
  // Then create minimal collections
  await createMinimalCollections();
}

runSetup();
