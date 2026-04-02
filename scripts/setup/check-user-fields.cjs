async function checkUserFields() {
  try {
    const response = await fetch('http://localhost:8055/fields/directus_users', {
      headers: {
        'Authorization': 'Bearer 9a4f7c2e8b1d5f6a3cdfdfdff8a2c5e9b1d6f3a7c0e4b8d2f5a9c1e7b3d6f'
      }
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error fetching fields:', response.status, errorData);
        return;
    }
    
    const data = await response.json();
    const fields = data.data.map(f => f.field);
    console.log('Current directus_user fields:', fields.join(', '));
    
    if (fields.includes('vendor')) {
      console.log('✅ Vendor field already exists.');
    } else {
      console.log('❌ Vendor field missing.');
    }
  } catch (error) {
    console.error('Error checking fields:', error.message);
  }
}

checkUserFields();
