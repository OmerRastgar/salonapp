const fs = require('fs');
const path = require('path');

async function seedEssential() {
  try {
    console.log('🌱 Seeding essential collections and data...\n');
    
    // Fixed UUIDs for images
    const LOGO_MAP = { 
      'glamour-salon-spa': 'edc14fbe-b765-4735-9bb3-18be85ff68c3', 
      'barber-shop-pro': '1f34ddd5-c9ca-4fca-9914-3ae981883927', 
      'royal-beauty-lounge': '2033412b-9d7b-4cb2-ba54-0dde6c832c49', 
      'capital-barber-studio': 'd570eff1-c7d7-4878-90da-ad4e5aa02cfe' 
    };

    // Login to Directus
    console.log('1. Logging in to Directus...');
    const loginResponse = await fetch('http://localhost:8055/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@saloonmarketplace.com',
        password: 'Admin@2024!Secure#Access'
      })
    });
    
    const loginData = await loginResponse.json();
    const token = loginData.data.access_token;
    const authHeaders = { 'Authorization': 'Bearer ' + token };
    console.log('   ✅ Admin login successful');

    // --- NEW: Physical Image Restoration Section ---
    console.log('\n2. Restoring physical image files...');
    
    // First, delete existing file records to avoid conflicts
    const currentFilesRes = await fetch('http://localhost:8055/files', { headers: authHeaders });
    const currentFiles = (await currentFilesRes.json()).data || [];
    for (const f of currentFiles) {
      await fetch('http://localhost:8055/files/' + f.id, { method: 'DELETE', headers: authHeaders });
    }

    // Re-upload from local Images folder
    for (const [slug, id] of Object.entries(LOGO_MAP)) {
      const filename = slug + '.jpg';
      const filePath = path.join('Images', filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const formData = new FormData();
        formData.append('id', id);
        formData.append('file', new Blob([fileBuffer], { type: 'image/jpeg' }), filename);
        
        await fetch('http://localhost:8055/files', {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });
        console.log('     ✅ Restored: ' + filename + ' (ID: ' + id + ')');
      }
    }

    // --- Standard Seeding Continues ---
    console.log('\n3. Creating collections...');
    const collections = [
      { collection: 'locations', icon: 'place' },
      { collection: 'categories', icon: 'category' },
      { collection: 'vendors', icon: 'store' },
      { collection: 'employees', icon: 'person' }
    ];
    
    for (const collection of collections) {
      try {
        await fetch('http://localhost:8055/collections', {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(collection)
        });
        console.log('     ✅ Created: ' + collection.collection);
      } catch (e) {}
    }

    // Set Permissions (Clean Format)
    console.log('\n4. Setting Public Permissions...');
    const policyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
    await fetch('http://localhost:8055/policies/' + policyId, {
      method: 'PATCH',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_access: true })
    });

    for (const col of ['locations', 'categories', 'vendors', 'employees', 'directus_files']) {
      await fetch('http://localhost:8055/permissions', {
        method: 'POST',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection: col,
          action: 'read',
          permissions: {},
          validation: {},
          presets: {},
          fields: ['*'],
          policy: policyId
        })
      });
      console.log('     ✅ Granted read: ' + col);
    }

    // Add Basic Data
    console.log('\n5. Adding sample data...');
    const basicData = {
      'locations': [{ name: 'Karachi', slug: 'karachi' }, { name: 'Lahore', slug: 'lahore' }],
      'categories': [{ name: 'Barber', slug: 'barber' }, { name: 'Beauty Salon', slug: 'beauty-salon' }],
      'vendors': [
        { name: 'Royal Beauty Lounge', slug: 'royal-beauty-lounge', email: 'royal@test.com', phone: '123', city: 'Karachi', status: 'active', logo: LOGO_MAP['royal-beauty-lounge'], cover_image: LOGO_MAP['royal-beauty-lounge'] },
        { name: 'Barber Shop Pro', slug: 'barber-shop-pro', email: 'barber@test.com', phone: '456', city: 'Karachi', status: 'active', logo: LOGO_MAP['barber-shop-pro'], cover_image: LOGO_MAP['barber-shop-pro'] }
      ]
    };

    for (const [col, items] of Object.entries(basicData)) {
      for (const item of items) {
        await fetch('http://localhost:8055/items/' + col, {
          method: 'POST',
          headers: { ...authHeaders, 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      console.log('     ✅ Seeded: ' + col);
    }

    console.log('\n🎉 Nuclear Re-Seed Complete! Images are physically restored and publicly viewable.');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  }
}

seedEssential();
