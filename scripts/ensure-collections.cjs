// Ensure collections exist before running seeder
async function ensureCollections() {
  try {
    console.log('🔧 Ensuring collections exist...\n');
    
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
          password: process.env.ADMIN_PASSWORD
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.data.access_token;
        console.log('   ✅ Admin login successful');
      } else {
        console.log('   ❌ Admin login failed:', loginResponse.status);
        return false;
      }
    } catch (error) {
      console.log('   ❌ Login error:', error.message);
      return false;
    }
    
    // Check existing collections
    console.log('\n2. Checking existing collections...');
    try {
      const collectionsResponse = await fetch('http://localhost:8055/collections', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (collectionsResponse.ok) {
        const collections = await collectionsResponse.json();
        const collectionNames = collections.data.map(c => c.collection);
        
        console.log('   Found ' + collections.data.length + ' collections');
        
        // Check which collections we need
        const requiredCollections = [
          { name: 'locations', icon: 'place', note: 'Cities and areas where vendors operate' },
          { name: 'categories', icon: 'category', note: 'Business categories like Barber, Beauty Salon, Spa' },
          { name: 'vendors', icon: 'store', note: 'Salon and barbershop vendors' },
          { name: 'employees', icon: 'person', note: 'Salon employees and service providers' },
          { name: 'vendor_categories', icon: 'link', note: 'Junction table for vendor-category relationships' },
          { name: 'reviews', icon: 'comment', note: 'Customer reviews for vendors' }
        ];
        
        const missingCollections = requiredCollections.filter(c => !collectionNames.includes(c.name));
        
        console.log('   Missing collections: ' + missingCollections.map(c => c.name).join(', '));
        
        if (missingCollections.length === 0) {
          console.log('   ✅ All required collections exist');
          return true;
        }
        
        // Create missing collections
        console.log('\n3. Creating missing collections...');
        for (const collection of missingCollections) {
          console.log('   Creating: ' + collection.name);
          try {
            const createResponse = await fetch('http://localhost:8055/collections', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                collection: collection.name,
                icon: collection.icon,
                note: collection.note
              })
            });
            
            if (createResponse.ok) {
              console.log('     ✅ Collection created');
            } else {
              console.log('     ❌ Failed to create collection');
              return false;
            }
          } catch (error) {
            console.log('     ❌ Collection creation error: ' + error.message);
            return false;
          }
        }
        
        // Wait for collections to be fully created
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Add fields to collections
        console.log('\n4. Adding fields to collections...');
        const fieldsConfig = {
          'locations': [
            { field: 'name', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter location name' } },
            { field: 'slug', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter slug' } },
            { field: 'sort_order', type: 'integer', interface: 'numeric', required: false, options: { placeholder: 'Sort order' } },
            { field: 'status', type: 'string', interface: 'select-dropdown', required: false, options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } }
          ],
          'categories': [
            { field: 'name', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter category name' } },
            { field: 'slug', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter slug' } },
            { field: 'sort_order', type: 'integer', interface: 'numeric', required: false, options: { placeholder: 'Sort order' } },
            { field: 'status', type: 'string', interface: 'select-dropdown', required: false, options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } }
          ],
          'vendors': [
            { field: 'name', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter vendor name' } },
            { field: 'slug', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter slug' } },
            { field: 'description', type: 'text', interface: 'textarea', required: false, options: { placeholder: 'Enter description' } },
            { field: 'email', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter email' } },
            { field: 'phone', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter phone' } },
            { field: 'address', type: 'text', interface: 'textarea', required: false, options: { placeholder: 'Enter address' } },
            { field: 'city', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter city' } },
            { field: 'area', type: 'string', interface: 'input', required: false, options: { placeholder: 'Enter area' } },
            { field: 'rating', type: 'decimal', interface: 'numeric', required: false, options: { placeholder: 'Enter rating' } },
            { field: 'reviews_count', type: 'integer', interface: 'numeric', required: false, options: { placeholder: 'Enter reviews count' } },
            { field: 'is_featured', type: 'boolean', interface: 'toggle', required: false },
            { field: 'is_verified', type: 'boolean', interface: 'toggle', required: false },
            { field: 'women_only', type: 'boolean', interface: 'toggle', required: false },
            { field: 'status', type: 'string', interface: 'select-dropdown', required: false, options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } }
          ],
          'employees': [
            { field: 'name', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter employee name' } },
            { field: 'email', type: 'string', interface: 'input', required: true, options: { placeholder: 'Enter email' } },
            { field: 'bio', type: 'text', interface: 'textarea', required: false, options: { placeholder: 'Enter bio' } },
            { field: 'timezone', type: 'string', interface: 'input', required: false, options: { placeholder: 'Enter timezone' } },
            { field: 'status', type: 'string', interface: 'select-dropdown', required: false, options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } },
            { field: 'sort_order', type: 'integer', interface: 'numeric', required: false, options: { placeholder: 'Sort order' } }
          ],
          'vendor_categories': [
            { field: 'vendors_id', type: 'uuid', interface: 'relation', required: true, options: { collection: 'vendors' } },
            { field: 'categories_id', type: 'uuid', interface: 'relation', required: true, options: { collection: 'categories' } }
          ],
          'reviews': [
            { field: 'vendor_id', type: 'uuid', interface: 'relation', required: true, options: { collection: 'vendors' } },
            { field: 'customer_name', type: 'string', interface: 'input', required: true, options: { placeholder: 'Customer name' } },
            { field: 'customer_email', type: 'string', interface: 'input', required: false, options: { placeholder: 'Customer email' } },
            { field: 'rating', type: 'integer', interface: 'numeric', required: true, options: { placeholder: 'Rating (1-5)' } },
            { field: 'comment', type: 'text', interface: 'textarea', required: true, options: { placeholder: 'Review comment' } },
            { field: 'is_verified', type: 'boolean', interface: 'toggle', required: false },
            { field: 'status', type: 'string', interface: 'select-dropdown', required: false, options: { choices: [{ text: 'Active', value: 'active' }, { text: 'Inactive', value: 'inactive' }] } }
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
                  field: field.field,
                  type: field.type,
                  interface: field.interface,
                  required: field.required,
                  options: field.options
                })
              });
              
              if (fieldResponse.ok) {
                console.log('     ✅ Added field: ' + field.field);
              } else {
                console.log('     ⚠️  Field may already exist: ' + field.field);
              }
            } catch (error) {
              console.log('     ❌ Field error: ' + field.field + ' - ' + error.message);
            }
          }
        }
        
        // Wait for fields to be created
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Set permissions
        console.log('\n5. Setting permissions...');
        const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // Public policy
        const adminPolicyId = '8688db16-4f8a-48bf-9272-35d5399d2c15'; // Administrator policy
        
        for (const collection of requiredCollections.map(c => c.name)) {
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
        
        console.log('\n✅ All collections created and configured successfully!');
        return true;
        
      } else {
        console.log('   ❌ Failed to check collections');
        return false;
      }
    } catch (error) {
      console.log('   ❌ Collections check error:', error.message);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Ensure collections failed:', error);
    return false;
  }
}

// Run the function
ensureCollections().then(success => {
  if (success) {
    console.log('\n🎉 Collections are ready! You can now run the seeder.');
    console.log('\n🚀 Next Steps:');
    console.log('   1. Run seeder: node tests/scripts/seeder.js');
    console.log('   2. Test frontend: http://localhost:3000');
    console.log('   3. Verify data in Directus Admin');
  } else {
    console.log('\n❌ Failed to ensure collections. Please check the logs above.');
  }
});
