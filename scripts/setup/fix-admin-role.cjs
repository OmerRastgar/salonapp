/**
 * Repair Administrator Role & Policy Linkage
 */

const DIRECTUS_URL = 'http://localhost:8055';
const ADMIN_EMAIL = 'admin@saloonmarketplace.com';
const ADMIN_PASSWORD = 'Admin@2024!Secure#Access';
const ADMIN_ROLE_ID = '92b8ded5-e891-48b6-9aff-bf0ab047eb5e';
const ADMIN_POLICY_ID = '8688db16-4f8a-48bf-9272-35d5399d2c15';

async function repair() {
  console.log('👷 Repairing Administrator Role Access...\n');

  try {
    const loginRes = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    const loginData = await loginRes.json();
    const token = loginData.data?.access_token;
    
    if (!token) throw new Error('Token not found in login response');
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log(`📝 Updating Role ${ADMIN_ROLE_ID} to use Policy ${ADMIN_POLICY_ID}...`);
    const updateRes = await fetch(`${DIRECTUS_URL}/roles/${ADMIN_ROLE_ID}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ policies: [ADMIN_POLICY_ID] })
    });

    if (updateRes.ok) {
        console.log('✅ Administrator Role re-linked successfully.');
        // Verify
        const verifyRes = await fetch(`${DIRECTUS_URL}/roles/${ADMIN_ROLE_ID}`, { headers });
        const verifyData = await verifyRes.json();
        console.log('🔎 Verification:', JSON.stringify(verifyData.data.policies, null, 2));
    } else {
        console.error('❌ Update failed:', await updateRes.text());
    }
  } catch (error) {
    console.error('❌ Repair failed:', error.message);
  }
}

repair();
