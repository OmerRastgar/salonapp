const DIRECTUS_URL = 'http://144.91.113.237:8055';
const ADMIN_TOKEN = '9a4f7c2e8b1d5f6a3cdfdfdff8a2c5e9b1d6f3a7c0e4b8d2f5a9c1e7b3d6f';

async function debug() {
  console.log('🔍 Debugging Directus API Connection...');
  try {
    const res = await fetch(`${DIRECTUS_URL}/fields/directus_users`, {
      headers: { 'Authorization': `Bearer ${ADMIN_TOKEN}` }
    });
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response Body:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debug();
