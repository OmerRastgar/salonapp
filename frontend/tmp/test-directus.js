
const { createDirectus, rest, readItems } = require('@directus/sdk');

async function testGetPage() {
  const directusUrl = "http://localhost:8055";
  const directus = createDirectus(directusUrl).with(rest());

  try {
    console.log('Testing connection to:', directusUrl);
    
    // Test pages collection
    console.log('Fetching pages items...');
    try {
      const pages = await directus.request(readItems('pages', { 
        limit: 5,
        fields: ['id', 'slug', 'status']
      }));
      console.log('Pages found:', pages.length);
      if (pages.length > 0) {
        console.log('Sample page slugs:', pages.map(p => p.slug));
      } else {
        console.log('No pages found in the collection.');
      }
    } catch (err) {
      console.error('Error fetching pages items:', err.message || err);
      if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    }

    // Try a specific slug if identified
    const testSlug = 'home'; // Most likely slug
    console.log(`Testing getPageBySlug for '${testSlug}'...`);
    try {
      const response = await directus.request(
        readItems('pages', {
          filter: {
            slug: { _eq: testSlug },
            status: { _eq: 'published' }
          },
          fields: ['*'],
          limit: 1
        })
      );
      console.log(`Page '${testSlug}' found:`, !!response[0]);
    } catch (err) {
      console.error(`Error fetching page '${testSlug}':`, err.message || err);
    }

  } catch (err) {
    console.error('Connection/Initialization Error:', err.message || err);
  }
}

testGetPage();
