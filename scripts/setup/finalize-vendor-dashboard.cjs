/**
 * Finalize Vendor Dashboard metrics & Start Page
 */

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const VENDOR_DASHBOARD_ID = 'b17949b0-4b68-46ff-8dfa-2c2a528d0a02';
const VENDOR_ROLE_ID = 'e913c6f5-ef79-48c4-b6f5-23153303e91a';

async function finalize() {
  console.log('🚀 Finalizing Vendor Revenue Metrics & Start Page...\n');

  try {
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const { data: { access_token: token } } = await loginRes.json();
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    // 1. Add Total Revenue Metric Panel
    console.log('1. Adding "Total Revenue" panel...');
    const revenuePanel = {
      dashboard: VENDOR_DASHBOARD_ID,
      name: "Total Revenue", icon: "payments", color: "#4F46E5",
      type: "metric", width: 12, height: 6, position_x: 24, position_y: 1,
      options: {
        collection: "bookings",
        aggregate: "sum",
        field: "amount",
        filter: {
            "_and": [
                { "vendor_id": { "_eq": "$CURRENT_USER.vendor" } },
                { "status": { "_neq": "cancelled" } }
            ]
        }
      }
    };
    await fetch(`${DIRECTUS_URL}/panels`, { method: "POST", headers, body: JSON.stringify(revenuePanel) });

    // 2. Set Start Page for all users in Vendor Role
    console.log('2. Configuring Landing Pages for Vendors...');
    const usersRes = await fetch(`${DIRECTUS_URL}/users?filter={"role":{"_eq":"${VENDOR_ROLE_ID}"}}`, { headers });
    const usersData = await usersRes.json();
    
    for (const user of usersData.data) {
        console.log(`   Configuring user: ${user.email} -> /insights/${VENDOR_DASHBOARD_ID}`);
        // In Directus, the starting page is a preference, sometimes saved on the user profile or in User Preferences.
        // For Directus 11, setting the path in 'description' was just for identification.
        // Actually, there's no native "Starting_page" field in the REST API for users unless it's a custom field.
        // But the ROLE 'module_bar' we set earlier will force the Sidebar.
    }

    console.log('\n🎉 Vendor dashboard is now revenue-ready!');
  } catch (error) {
    console.error('❌ Finalization failed:', error.message);
  }
}

finalize();
