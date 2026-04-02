const http = require('http');

const BASE_URL = 'http://144.91.113.237:8055';
const TOKEN = '9a4f7c2e8b1d5f6a3cdfdfdff8a2c5e9b1d6f3a7c0e4b8d2f5a9c1e7b3d6f';

async function fetchPublic(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function fetchAdmin(path) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    };
    http.get(`${BASE_URL}${path}`, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('--- 🔍 DIAGNOSTIC SEARCH TEST ---');
  console.log(`Target: ${BASE_URL}\n`);

  const tests = [
    { name: '1. Categories Fetch', path: '/items/categories?fields=id,name,slug&limit=5' },
    { name: '2. Locations Fetch', path: '/items/locations?fields=id,name&limit=5' },
    { name: '3. Vendors List Fetch', path: '/items/vendors?fields=id,name&limit=5' },
    { name: '4. Junction Table (M2M)', path: '/items/vendor_categories?fields=vendors_id,categories_id.slug&limit=5' }
  ];

  for (const test of tests) {
    console.log(`Checking ${test.name}...`);
    try {
      const publicData = await fetchPublic(test.path);
      const adminData = await fetchAdmin(test.path);
      
      const publicCount = publicData.data ? publicData.data.length : 0;
      const adminCount = adminData.data ? adminData.data.length : 0;

      if (publicCount > 0) {
        console.log(`✅ PUBLIC: Found ${publicCount} items.`);
      } else if (adminCount > 0) {
        console.log(`❌ PUBLIC: Returned 0 items (Permission Blocked)`);
        console.log(`   💡 ADMIN: Found ${adminCount} items with Token.`);
      } else {
        console.log(`⚠️  BOTH: Returned 0 items (Database Empty)`);
      }
    } catch (e) {
      console.log(`💥 ERROR: ${e.message}`);
    }
    console.log('');
  }
}

runTest();
