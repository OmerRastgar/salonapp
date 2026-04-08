const fs = require('fs');
const path = require('path');

async function fix() {
  try {
    const loginRes = await fetch('http://localhost:8055/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@saloonmarketplace.com', password: process.env.ADMIN_PASSWORD })
    });
    const token = (await loginRes.json()).data.access_token;
    const authHeaders = { 'Authorization': 'Bearer ' + token };
    
    // 1. Delete existing file metadata
    const filesRes = await fetch('http://localhost:8055/files', { headers: authHeaders });
    const files = (await filesRes.json()).data || [];
    
    for (const f of files) {
      await fetch('http://localhost:8055/files/' + f.id, { method: 'DELETE', headers: authHeaders });
      console.log('Deleted file record: ' + f.id);
    }
    
    const logoMap = {
      'royal-beauty-lounge.jpg': '2033412b-9d7b-4cb2-ba54-0dde6c832c49',
      'barber-shop-pro.jpg': '1f34ddd5-c9ca-4fca-9914-3ae981883927',
      'capital-barber-studio.jpg': 'd570eff1-c7d7-4878-90da-ad4e5aa02cfe',
      'glamour-salon-spa.jpg': 'edc14fbe-b765-4735-9bb3-18be85ff68c3'
    };
    
    // 2. Re-upload with Fixed IDs using native fetch + Blob (Node 22 support)
    for (const [filename, id] of Object.entries(logoMap)) {
      const filePath = path.join('Images', filename);
      if (fs.existsSync(filePath)) {
        const fileBuffer = fs.readFileSync(filePath);
        const fileName = filename;
        const fileType = 'image/jpeg';
        
        const formData = new FormData();
        formData.append('id', id);
        formData.append('file', new Blob([fileBuffer], { type: fileType }), fileName);
        
        const uploadRes = await fetch('http://localhost:8055/files', {
          method: 'POST',
          headers: authHeaders,
          body: formData
        });
        
        console.log('Uploaded: ' + filename + ' Status: ' + uploadRes.status);
      }
    }
    
    // 3. Grant Public Read
    const policyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
    await fetch('http://localhost:8055/permissions', {
      method: 'POST',
      headers: { ...authHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection: 'directus_files', action: 'read', permissions: {}, validation: {}, presets: {}, fields: ['*'], policy: policyId })
    });
    
    console.log('Physical restoration complete!');
  } catch (e) {
    console.error('Error during restoration:', e.message);
  }
}

fix();
