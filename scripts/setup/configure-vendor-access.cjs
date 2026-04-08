/**
 * Configure Vendor Access in Directus 11+
 * 1. Login
 * 2. Adds 'vendor' field to 'directus_users'
 * 3. Creates 'Vendor' role
 * 4. Creates 'Vendor Policy'
 * 5. Links role to policy
 * 6. Sets up filtered permissions in the policy
 */

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function setup() {
  console.log('🚀 Starting Vendor Access Configuration (D11 Mode)...\n');

  try {
    // 1. Get Access Token
    console.log('1. Logging in...');
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    console.log('   ✅ Login successful.');

    // 2. Add 'vendor' field to 'directus_users'
    console.log('\n2. Ensuring "vendor" field on directus_users...');
    const fieldsRes = await fetch(`${DIRECTUS_URL}/fields/directus_users`, { headers });
    const fieldsData = await fieldsRes.json();
    const hasVendorField = fieldsData.data.some(f => f.field === 'vendor');

    if (!hasVendorField) {
      await fetch(`${DIRECTUS_URL}/fields/directus_users`, {
        method: 'POST', headers,
        body: JSON.stringify({
          field: 'vendor', type: 'uuid',
          meta: { interface: 'select-relational', options: { collection: 'vendors' }, width: 'full' },
          schema: { foreign_key_column: 'id', foreign_key_table: 'vendors' }
        })
      });
      console.log('   ✅ Vendor field added.');
    } else console.log('   ✅ Vendor field exists.');

    // 3. Create 'Vendor' Role
    console.log('\n3. Ensuring "Vendor" role...');
    const rolesRes = await fetch(`${DIRECTUS_URL}/roles`, { headers });
    const rolesData = await rolesRes.json();
    let vendorRole = rolesData.data.find(r => r.name === 'Vendor');

    if (!vendorRole) {
      const createRoleRes = await fetch(`${DIRECTUS_URL}/roles`, {
        method: 'POST', headers,
        body: JSON.stringify({ name: 'Vendor', icon: 'store' })
      });
      const newRole = await createRoleRes.json();
      vendorRole = newRole.data;
      console.log('   ✅ Vendor role created.');
    } else console.log('   ✅ Vendor role exists.');

    // 4. Create 'Vendor Policy'
    console.log('\n4. Ensuring "Vendor Policy"...');
    const policiesRes = await fetch(`${DIRECTUS_URL}/policies`, { headers });
    const policiesData = await policiesRes.json();
    let vendorPolicy = policiesData.data.find(p => p.name === 'Vendor Policy');

    if (!vendorPolicy) {
        const createPolicyRes = await fetch(`${DIRECTUS_URL}/policies`, {
            method: 'POST', headers,
            body: JSON.stringify({
                name: 'Vendor Policy',
                description: 'Restricted access for vendors to their own data',
                app_access: true,
                api_access: true
            })
        });
        const newPolicy = await createPolicyRes.json();
        vendorPolicy = newPolicy.data;
        console.log('   ✅ Vendor policy created.');
    } else console.log('   ✅ Vendor policy exists.');

    // 5. Link Role to Policy (using access endpoint or direct update)
    console.log('\n5. Linking Vendor Role to Policy...');
    // Directus 11 uses directus_access to link roles/users to policies
    const accessRes = await fetch(`${DIRECTUS_URL}/access`, { headers });
    const accessData = await accessRes.json();
    const hasAccessLink = accessData.data.some(a => a.role === vendorRole.id && a.policy === vendorPolicy.id);

    if (!hasAccessLink) {
        const linkRes = await fetch(`${DIRECTUS_URL}/access`, {
            method: 'POST', headers,
            body: JSON.stringify({
                role: vendorRole.id,
                policy: vendorPolicy.id
            })
        });
        if (linkRes.ok) console.log('   ✅ Link created.');
        else console.log('   ⚠️  Link failed or exists:', await linkRes.text());
    } else console.log('   ✅ Link already exists.');

    // 6. Set Filtered Permissions
    console.log('\n6. Configuring filtered permissions in Vendor Policy...');
    const permissionsToSet = [
      { collection: 'vendors', action: 'read', permissions: { id: { _eq: '$CURRENT_USER.vendor' } } },
      { collection: 'vendors', action: 'update', permissions: { id: { _eq: '$CURRENT_USER.vendor' } } },
      { collection: 'employees', action: 'read', permissions: { vendor_id: { _eq: '$CURRENT_USER.vendor' } } },
      { collection: 'employees', action: 'create', permissions: {}, presets: { vendor_id: '$CURRENT_USER.vendor' } },
      { collection: 'employees', action: 'update', permissions: { vendor_id: { _eq: '$CURRENT_USER.vendor' } } },
      { collection: 'bookings', action: 'read', permissions: { vendor_id: { _eq: '$CURRENT_USER.vendor' } } },
      { collection: 'reviews', action: 'read', permissions: { vendor_id: { _eq: '$CURRENT_USER.vendor' } } }
    ];

    for (const perm of permissionsToSet) {
      console.log(`   Setting ${perm.action} for ${perm.collection}...`);
      await fetch(`${DIRECTUS_URL}/permissions`, {
        method: 'POST', headers,
        body: JSON.stringify({
          policy: vendorPolicy.id,
          collection: perm.collection,
          action: perm.action,
          permissions: perm.permissions || {},
          presets: perm.presets || {},
          fields: ['*']
        })
      });
      console.log(`     ✅ Done.`);
    }

    console.log('\n🎉 Vendor Access Successfully Configured!');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setup();
