const fetch = require('node-fetch');
async function fix() {
  try {
    const loginRes = await fetch('http://localhost:8055/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@saloonmarketplace.com', password: 'Admin@2024!Secure#Access' })
    });
    const token = (await loginRes.json()).data.access_token;
    const headers = { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' };
    const roleId = '192df901-9d32-45ec-9b4e-60faf5feac5c';
    const policyId = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17';
    
    // 1. Ensure Policy has App Access
    await fetch('http://localhost:8055/policies/' + policyId, { method: 'PATCH', headers, body: JSON.stringify({ app_access: true }) });
    
    // 2. Link Role to Policy (directus_access)
    await fetch('http://localhost:8055/access/roles', { method: 'POST', headers, body: JSON.stringify({ role: roleId, policy: policyId }) });
    
    // 3. Grant directus_files READ
    await fetch('http://localhost:8055/permissions', { method: 'POST', headers, body: JSON.stringify({ collection: 'directus_files', action: 'read', permissions: {}, validation: {}, presets: {}, fields: ['*'], policy: policyId }) });
    
    const test = await fetch('http://localhost:8055/assets/2033412b-9d7b-4cb2-ba54-0dde6c832c49?width=1');
    console.log('Final Status:', test.status);
  } catch (e) { console.error(e); }
}
fix();