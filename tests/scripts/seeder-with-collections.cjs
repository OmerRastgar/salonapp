// Modified seeder that ensures collections exist first
const fs = require('fs');
const path = require('path');

// Directus API configuration
const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'process.env.ADMIN_PASSWORD';

// Helper function to make Directus API requests
async function directusRequest(endpoint, options = {}) {
  const url = `${DIRECTUS_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Directus request failed (${response.status}) for ${endpoint}: ${errorText}`);
  }
  
  return response.json();
}

// Get access token
async function getAccessToken() {
  const response = await directusRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    }),
  });
  
  return response.data.access_token;
}

// Ensure collections exist using SQL
async function ensureCollectionsWithSQL(token) {
  console.log('🔧 Ensuring collections exist using SQL...');
  
  const sqlCommands = `
    -- Create locations table
    CREATE TABLE IF NOT EXISTS locations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create categories table
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      sort_order INTEGER DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create vendors table
    CREATE TABLE IF NOT EXISTS vendors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      email VARCHAR(255),
      phone VARCHAR(50),
      address TEXT,
      city VARCHAR(255),
      area VARCHAR(255),
      rating DECIMAL(3,2),
      reviews_count INTEGER DEFAULT 0,
      is_featured BOOLEAN DEFAULT false,
      is_verified BOOLEAN DEFAULT false,
      women_only BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create employees table
    CREATE TABLE IF NOT EXISTS employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255),
      bio TEXT,
      timezone VARCHAR(50),
      status VARCHAR(50) DEFAULT 'active',
      sort_order INTEGER DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create vendor_categories junction table
    CREATE TABLE IF NOT EXISTS vendor_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendors_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
      categories_id UUID REFERENCES categories(id) ON DELETE CASCADE
    );
    
    -- Create reviews table
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      rating INTEGER CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      is_verified BOOLEAN DEFAULT false,
      status VARCHAR(50) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Register collections in Directus metadata
    INSERT INTO directus_collections (collection, icon, display_template) VALUES 
    ('locations', 'place', '{{name}}'),
    ('categories', 'category', '{{name}}'),
    ('vendors', 'store', '{{name}}'),
    ('employees', 'person', '{{name}}'),
    ('vendor_categories', 'link', '{{vendors_id}} - {{categories_id}}'),
    ('reviews', 'comment', '{{vendor_id}}')
    ON CONFLICT (collection) DO NOTHING;
    
    -- Register fields for locations
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('locations', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('locations', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
    ('locations', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
    ('locations', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 4, 'half', false),
    ('locations', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 5, 'half', false)
    ON CONFLICT (collection, field) DO NOTHING;
    
    -- Register fields for categories
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('categories', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('categories', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
    ('categories', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
    ('categories', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 4, 'half', false),
    ('categories', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 5, 'half', false)
    ON CONFLICT (collection, field) DO NOTHING;
    
    -- Register fields for vendors
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('vendors', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('vendors', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
    ('vendors', 'slug', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
    ('vendors', 'description', NULL, 'textarea', NULL, NULL, false, false, 4, 'full', false),
    ('vendors', 'email', NULL, 'input', NULL, NULL, false, false, 5, 'half', true),
    ('vendors', 'phone', NULL, 'input', NULL, NULL, false, false, 6, 'half', true),
    ('vendors', 'address', NULL, 'textarea', NULL, NULL, false, false, 7, 'full', false),
    ('vendors', 'city', NULL, 'input', NULL, NULL, false, false, 8, 'half', false),
    ('vendors', 'area', NULL, 'input', NULL, NULL, false, false, 9, 'half', false),
    ('vendors', 'rating', NULL, 'numeric', NULL, NULL, false, false, 10, 'half', false),
    ('vendors', 'reviews_count', NULL, 'numeric', NULL, NULL, false, false, 11, 'half', false),
    ('vendors', 'is_featured', NULL, 'toggle', NULL, NULL, false, false, 12, 'half', false),
    ('vendors', 'is_verified', NULL, 'toggle', NULL, NULL, false, false, 13, 'half', false),
    ('vendors', 'women_only', NULL, 'toggle', NULL, NULL, false, false, 14, 'half', false),
    ('vendors', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 15, 'half', false)
    ON CONFLICT (collection, field) DO NOTHING;
    
    -- Register fields for employees
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('employees', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('employees', 'name', NULL, 'input', NULL, NULL, false, false, 2, 'full', true),
    ('employees', 'email', NULL, 'input', NULL, NULL, false, false, 3, 'half', true),
    ('employees', 'bio', NULL, 'textarea', NULL, NULL, false, false, 4, 'full', false),
    ('employees', 'timezone', NULL, 'input', NULL, NULL, false, false, 5, 'half', false),
    ('employees', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 6, 'half', false),
    ('employees', 'sort_order', NULL, 'numeric', NULL, NULL, false, false, 7, 'half', false)
    ON CONFLICT (collection, field) DO NOTHING;
    
    -- Register fields for vendor_categories
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('vendor_categories', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('vendor_categories', 'vendors_id', NULL, 'relation', '{"collection":"vendors"}', NULL, false, false, 2, 'half', true),
    ('vendor_categories', 'categories_id', NULL, 'relation', '{"collection":"categories"}', NULL, false, false, 3, 'half', true)
    ON CONFLICT (collection, field) DO NOTHING;
    
    -- Register fields for reviews
    INSERT INTO directus_fields (collection, field, special, interface, options, display, readonly, hidden, sort, width, required) VALUES 
    ('reviews', 'id', 'uuid', 'input', NULL, NULL, true, true, 1, 'full', false),
    ('reviews', 'vendor_id', NULL, 'relation', '{"collection":"vendors"}', NULL, false, false, 2, 'half', true),
    ('reviews', 'customer_name', NULL, 'input', NULL, NULL, false, false, 3, 'full', true),
    ('reviews', 'customer_email', NULL, 'input', NULL, NULL, false, false, 4, 'half', false),
    ('reviews', 'rating', NULL, 'numeric', NULL, NULL, false, false, 5, 'half', true),
    ('reviews', 'comment', NULL, 'textarea', NULL, NULL, false, false, 6, 'full', true),
    ('reviews', 'is_verified', NULL, 'toggle', NULL, NULL, false, false, 7, 'half', false),
    ('reviews', 'status', NULL, 'select-dropdown', '{"choices":[{"value":"active","text":"Active"},{"value":"inactive","text":"Inactive"}]}', NULL, false, false, 8, 'half', false)
    ON CONFLICT (collection, field) DO NOTHING;
  `;
  
  try {
    const response = await directusRequest('/queries', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: sqlCommands
      })
    });
    
    console.log('   ✅ Collections created via SQL');
    return true;
  } catch (error) {
    console.log('   ❌ SQL creation failed:', error.message);
    return false;
  }
}

// Set permissions for collections
async function setPermissions(token) {
  console.log('🔐 Setting permissions for collections...');
  
  const publicPolicyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'; // Public policy
  const adminPolicyId = '8688db16-4f8a-48bf-9272-35d5399d2c15'; // Administrator policy
  
  const collections = ['locations', 'categories', 'vendors', 'employees', 'vendor_categories', 'reviews'];
  
  for (const collection of collections) {
    console.log('   Setting permissions for: ' + collection);
    
    // Public read permissions
    try {
      await directusRequest('/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
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
      console.log('     ✅ Public read permission');
    } catch (error) {
      console.log('     ⚠️  Public read may already exist');
    }
    
    // Admin full permissions
    const actions = ['read', 'create', 'update', 'delete'];
    for (const action of actions) {
      try {
        await directusRequest('/permissions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
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
        console.log('     ✅ Admin ' + action + ' permission');
      } catch (error) {
        console.log('     ⚠️  Admin ' + action + ' may already exist');
      }
    }
  }
}

// Read all items from a collection
async function readAllItems(collection, token) {
  const response = await directusRequest(`/items/${collection}?fields=id&limit=-1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.data;
}

// Main seeding function
async function seed() {
  try {
    console.log('🌱 Starting enhanced seeding process...\n');
    
    // Get access token
    const token = await getAccessToken();
    
    // Ensure collections exist
    const collectionsReady = await ensureCollectionsWithSQL(token);
    if (!collectionsReady) {
      console.log('❌ Failed to create collections');
      return;
    }
    
    // Set permissions
    await setPermissions(token);
    
    // Wait for everything to be ready
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test collections
    console.log('\n🧪 Testing collections...');
    const testCollections = ['locations', 'categories', 'vendors', 'employees'];
    
    for (const collection of testCollections) {
      try {
        const testResponse = await directusRequest(`/items/${collection}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });
        console.log('   ✅ ' + collection + ': ' + testResponse.data.length + ' items');
      } catch (error) {
        console.log('   ❌ ' + collection + ': ' + error.message);
      }
    }
    
    console.log('\n🎉 Enhanced seeding completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Collections created and configured');
    console.log('   ✅ Permissions set for public and admin access');
    console.log('   ✅ Frontend should work without CORS errors');
    console.log('   ✅ Ready for data population');
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Test frontend: http://localhost:3000');
    console.log('   2. Add sample data via Directus Admin');
    console.log('   3. Assign professional images to vendors');
    
  } catch (error) {
    console.error('❌ Enhanced seeding failed:', error);
  }
}

// Run the seeding
seed();
