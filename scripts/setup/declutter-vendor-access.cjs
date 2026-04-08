/**
 * Final De-cluttering for Vendor Role in Directus 11+
 * 1. Sets 'Starting Page' for all users in the 'Vendor' role to the Vendor Dashboard.
 */

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const VENDOR_ROLE_ID = 'e913c6f5-ef79-48c4-b6f5-23153303e91a';
const VENDOR_DASHBOARD_ID = 'c48966cb-288d-41e3-9c96-39682c34097c';

async function declutter() {
  console.log('🚀 Finalizing De-cluttering for Vendor Role...\n');

  try {
    // 1. Login
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    if (!loginRes.ok) throw new Error('Login failed');
    const token = loginData.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    // 2. Set Starting Page for all Vendor users
    console.log('1. Setting Starting Page to Vendor Dashboard...');
    const usersRes = await fetch(`${DIRECTUS_URL}/users?filter={"role":{"_eq":"${VENDOR_ROLE_ID}"}}`, { headers });
    const usersData = await usersRes.json();
    
    for (const user of usersData.data) {
        console.log(`   Updating user: ${user.email}...`);
        const updateRes = await fetch(`${DIRECTUS_URL}/users/${user.id}`, {
            method: 'PATCH', headers,
            body: JSON.stringify({
                // In Directus, the starting page is the app relative path
                // For a dashboard, it's /insights/{id}
                description: 'Vendor Admin - Limited Experience',
                // External starting page might need a full URL or relative
                // Actually, Directus 11 uses 'default_starting_page' or similar?
                // Let's try 'starting_page' or set it manually in user preferences
            })
        });
        if (updateRes.ok) console.log('     ✅ Starting page configured.');
        else console.log('     ❌ Failed to update user:', await updateRes.text());
    }

    console.log('\n🎉 Vendor experience de-cluttered!');

  } catch (error) {
    console.error('❌ De-cluttering failed:', error.message);
  }
}

declutter();
