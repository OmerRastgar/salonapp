/**
 * Verification Script for Vendor Access
 * 1. Creates a 'Test Vendor'
 * 2. Creates a 'Test Vendor User' linked to 'Test Vendor'
 * 3. Logins as 'Test Vendor User'
 * 4. Verifies only 'Test Vendor' is visible in 'vendors' collection
 */

const DIRECTUS_URL = 'http://144.91.113.237:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure#Access';

async function verify() {
  console.log('🧪 Starting Verification...\n');

  try {
    // 1. Admin Login
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const { data: { access_token: adminToken } } = await loginRes.json();
    const adminHeaders = { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

    // 2. Create Test Vendor
    console.log('1. Creating Test Vendor...');
    const vendorRes = await fetch(`${DIRECTUS_URL}/items/vendors`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({ name: 'Verification Salon', slug: 'verification-salon' })
    });
    const { data: testVendor } = await vendorRes.json();
    console.log(`   ✅ Test Vendor created: ${testVendor.id}`);

    // 3. Get Vendor Role ID
    const rolesRes = await fetch(`${DIRECTUS_URL}/roles`, { headers: adminHeaders });
    const { data: roles } = await rolesRes.json();
    const vendorRole = roles.find(r => r.name === 'Vendor');

    // 4. Create Test User
    console.log('\n2. Creating Test Vendor User...');
    const userRes = await fetch(`${DIRECTUS_URL}/users`, {
        method: 'POST', headers: adminHeaders,
        body: JSON.stringify({
            first_name: 'Vendor',
            last_name: 'Test',
            email: `test-vendor-${Date.now()}@example.com`,
            password: 'VendorPassword123!',
            role: vendorRole.id,
            vendor: testVendor.id
        })
    });
    const { data: testUser } = await userRes.json();
    console.log(`   ✅ Test user created: ${testUser.id}`);

    // 5. Login as Test User
    console.log('\n3. Logging in as Test User...');
    const userLoginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: testUser.email, password: 'VendorPassword123!' })
    });
    const { data: { access_token: userToken } } = await userLoginRes.json();
    const userHeaders = { 'Authorization': `Bearer ${userToken}` };
    console.log('   ✅ Login successful.');

    // 6. Verify Permission (fetch vendors)
    console.log('\n4. Verifying filtered access...');
    const vendorsRes = await fetch(`${DIRECTUS_URL}/items/vendors`, { headers: userHeaders });
    const { data: vendors } = await vendorsRes.json();
    
    console.log(`   Found ${vendors.length} vendors in response.`);
    if (vendors.length === 1 && vendors[0].id === testVendor.id) {
        console.log('   ✅ Verification Passed: User can only see their own vendor.');
    } else {
        console.log('   ❌ Verification Failed: User seeing incorrect number of vendors or wrong data.');
    }

    console.log('\n🎉 Verification Completed!');

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verify();
