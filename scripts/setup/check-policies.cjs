const DIRECTUS_URL = 'http://144.91.113.237:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure#Access';

async function checkPolicy() {
  try {
    // Login
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Get Vendor Role
    const rolesRes = await fetch(`${DIRECTUS_URL}/roles`, { headers });
    const rolesData = await rolesRes.json();
    const vendorRole = rolesData.data.find(r => r.name === 'Vendor');

    console.log('Vendor Role Object:', JSON.stringify(vendorRole, null, 2));

    if (vendorRole && vendorRole.policy) {
        console.log('✅ Found Policy ID:', vendorRole.policy);
    } else {
        console.log('❌ role.policy is missing. Directus 11 might handle this differently.');
        // Check if there's a policy with the same name or check /policies
        const policiesRes = await fetch(`${DIRECTUS_URL}/policies`, { headers });
        const policiesData = await policiesRes.json();
        console.log('Available Policies:', JSON.stringify(policiesData.data.map(p => ({id: p.id, name: p.name})), null, 2));
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPolicy();
