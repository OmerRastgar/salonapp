/**
 * Admin Credentials:
 * admin@saloonmarketplace.com / Admin@2024!Secure#Access
 */

const ENVS = [
  { name: 'Local', url: 'http://localhost:8055' },
  { name: 'Remote', url: 'http://144.91.113.237:8055' }
];

const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure#Access';

const NEW_VENDOR_EMAIL = 'vendor@saloon.com';
const NEW_VENDOR_PASSWORD = 'Vendor123!';

async function sync() {
  console.log('🔄 Syncing Unified Vendor Access (Local & Remote)...\n');

  for (const env of ENVS) {
    try {
      console.log(`--- Processing ${env.name} (${env.url}) ---`);
      
      // 1. Login
      const loginRes = await fetch(`${env.url}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
      });
      if (!loginRes.ok) {
          console.error(`   ❌ ${env.name} Login failed: ${await loginRes.text()}`);
          continue;
      }
      const loginData = await loginRes.json();
      const token = loginData.data.access_token;
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
      console.log(`   ✅ Admin login successful.`);

      // 2. Ensure Vendor ID on directus_users exists
      const fieldsRes = await fetch(`${env.url}/fields/directus_users`, { headers });
      const fieldsData = await fieldsRes.json();
      if (!fieldsData.data.some(f => f.field === 'vendor')) {
          console.log(`   Adding 'vendor' field...`);
          await fetch(`${env.url}/fields/directus_users`, {
              method: 'POST', headers,
              body: JSON.stringify({ field: 'vendor', type: 'uuid', meta: { interface: 'select-relational', options: { collection: 'vendors' } }, schema: { foreign_key_table: 'vendors', foreign_key_column: 'id' } })
          });
      }

      // 3. Ensure Vendor Role & Policy
      const rolesRes = await fetch(`${env.url}/roles`, { headers });
      const rolesData = await rolesRes.json();
      let vendorRole = rolesData.data.find(r => r.name === 'Vendor');

      if (!vendorRole) {
          const createRoleRes = await fetch(`${env.url}/roles`, { method: 'POST', headers, body: JSON.stringify({ name: 'Vendor', icon: 'store' }) });
          const newRole = await createRoleRes.json();
          vendorRole = newRole.data;
      }

      const policiesRes = await fetch(`${env.url}/policies`, { headers });
      const policiesData = await policiesRes.json();
      let vendorPolicy = policiesData.data.find(p => p.name === 'Vendor Policy');

      if (!vendorPolicy) {
          const createPolicyRes = await fetch(`${env.url}/policies`, { method: 'POST', headers, body: JSON.stringify({ name: 'Vendor Policy', app_access: true, admin_access: false }) });
          const newPolicy = await createPolicyRes.json();
          vendorPolicy = newPolicy.data;
      } else {
          // Update to disable admin_access
          await fetch(`${env.url}/policies/${vendorPolicy.id}`, { method: 'PATCH', headers, body: JSON.stringify({ admin_access: false }) });
      }

      // 4. Ensure Unified User
      const usersRes = await fetch(`${env.url}/users?filter={"email":{"_eq":"${NEW_VENDOR_EMAIL}"}}`, { headers });
      const usersData = await usersRes.json();
      let vendorUser = usersData.data[0];

      const vendorListRes = await fetch(`${env.url}/items/vendors?limit=1`, { headers });
      const vendorList = await vendorListRes.json();
      const firstVendorId = vendorList.data[0]?.id;

      if (!vendorUser) {
          console.log(`   Creating unified vendor user: ${NEW_VENDOR_EMAIL}...`);
          const createUserRes = await fetch(`${env.url}/users`, {
              method: 'POST', headers,
              body: JSON.stringify({
                  first_name: 'Salon', last_name: 'Vendor',
                  email: NEW_VENDOR_EMAIL, password: NEW_VENDOR_PASSWORD,
                  role: vendorRole.id, vendor: firstVendorId
              })
          });
          const newUser = await createUserRes.json();
          vendorUser = newUser.data;
          console.log(`   ✅ User created.`);
      } else {
          console.log(`   Updating user: ${NEW_VENDOR_EMAIL}...`);
          await fetch(`${env.url}/users/${vendorUser.id}`, {
              method: 'PATCH', headers,
              body: JSON.stringify({ vendor: firstVendorId, role: vendorRole.id })
          });
          console.log(`   ✅ User synced.`);
      }

      console.log(`\n🎉 ${env.name} Sync Completed!`);

    } catch (error) {
      console.error(`❌ ${env.name} Failed:`, error.message);
    }
  }
}

sync();
