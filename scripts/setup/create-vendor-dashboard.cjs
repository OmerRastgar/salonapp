/**
 * Configure Vendor Access in Directus 11+
 * Includes Dashboards and Panels permissions
 */

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure#Access';

async function setup() {
  console.log('🚀 Starting Vendor Access & Dashboard Configuration...\n');

  try {
    // 1. Get Access Token
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.access_token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
    console.log('   ✅ Login successful.');

    // Get Policy ID
    const policiesRes = await fetch(`${DIRECTUS_URL}/policies`, { headers });
    const policiesData = await policiesRes.json();
    let vendorPolicy = policiesData.data.find(p => p.name === 'Vendor Policy');
    
    if (!vendorPolicy) {
        console.error('❌ Vendor Policy not found. Please run the previous configuration script first.');
        return;
    }
    const POLICY_ID = vendorPolicy.id;

    // 6. Set Dashboard Permissions
    console.log('\n6. Configuring Dashboard & Panel permissions...');
    const systemPermissions = [
      { collection: 'directus_dashboards', action: 'read', permissions: {} },
      { collection: 'directus_panels', action: 'read', permissions: {} },
      { collection: 'directus_users', action: 'read', permissions: { id: { _eq: '$CURRENT_USER' } } }
    ];

    for (const perm of systemPermissions) {
      console.log(`   Setting ${perm.action} for ${perm.collection}...`);
      await fetch(`${DIRECTUS_URL}/permissions`, {
        method: 'POST', headers,
        body: JSON.stringify({
          policy: POLICY_ID,
          collection: perm.collection,
          action: perm.action,
          permissions: perm.permissions || {},
          fields: ['*']
        })
      });
      console.log(`     ✅ Done.`);
    }

    // 7. Create Vendor Dashboard
    console.log('\n7. Creating Vendor Dashboard...');
    const dashRes = await fetch(`${DIRECTUS_URL}/dashboards`, {
        method: 'POST', headers,
        body: JSON.stringify({
            name: 'Vendor Dashboard',
            icon: 'analytics',
            note: 'Your salon performance overview'
        })
    });
    const dashData = await dashRes.json();
    const DASHBOARD_ID = dashData.data.id;
    console.log(`   ✅ Dashboard created: ${DASHBOARD_ID}`);

    // 8. Add Panels
    console.log('\n8. Adding Insights Panels...');
    const panels = [
        {
            name: 'Total Bookings',
            type: 'metric',
            dashboard: DASHBOARD_ID,
            options: {
                collection: 'bookings',
                aggregate: 'count',
                filter: { vendor_id: { _eq: '$CURRENT_USER.vendor' } },
                color: '#6366f1'
            },
            width: 12, height: 4, x: 0, y: 0
        },
        {
            name: 'Staff Overview',
            type: 'list',
            dashboard: DASHBOARD_ID,
            options: {
                collection: 'employees',
                filter: { vendor_id: { _eq: '$CURRENT_USER.vendor' } },
                display: 'table',
                columns: ['name', 'rating', 'reviews_count']
            },
            width: 24, height: 8, x: 0, y: 4
        }
    ];

    for (const panel of panels) {
        console.log(`   Adding panel: ${panel.name}...`);
        await fetch(`${DIRECTUS_URL}/panels`, {
            method: 'POST', headers,
            body: JSON.stringify(panel)
        });
        console.log(`     ✅ Done.`);
    }

    console.log('\n🎉 Vendor Dashboard Successfully Created!');

  } catch (error) {
    console.error('❌ Dashboard setup failed:', error.message);
  }
}

setup();
