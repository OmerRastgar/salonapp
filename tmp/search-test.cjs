const http = require('http');

const BASE_URL = 'http://144.91.113.237:8055';

function fetchPublic(path) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve({ error: 'Invalid JSON response', raw: data.substring(0, 100) });
        }
      });
    }).on('error', reject);
  });
}

async function runTest() {
  console.log('--- 🔍 PUBLIC SEARCH DIAGNOSTIC ---');
  console.log(`Checking what your customers see at: ${BASE_URL}\n`);

  const tests = [
    { name: '1. Categories', path: '/items/categories?fields=id,name,slug&limit=3' },
    { name: '2. Locations', path: '/items/locations?fields=id,name&limit=3' },
    { name: '3. Vendors (Salons)', path: '/items/vendors?fields=id,name&limit=3' },
    { name: '4. Salon-to-Category Link', path: '/items/vendor_categories?fields=vendors_id,categories_id.slug&limit=3' }
  ];

  for (const test of tests) {
    process.stdout.write(`Checking ${test.name}... `);
    try {
      const result = await fetchPublic(test.path);
      if (result.error) {
        console.log(`❌ ERROR: ${result.error}`);
      } else if (result.data && result.data.length > 0) {
        console.log(`✅ OK: Found ${result.data.length} items.`);
      } else {
        console.log(`❌ FAILED: Found 0 items. (Locked by permissions)`);
      }
    } catch (e) {
      console.log(`💥 CRITICAL ERROR: ${e.message}`);
    }
  }
  console.log('\n--- END OF TEST ---');
}

runTest();
