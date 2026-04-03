
const { createDirectus, rest, readItems } = require('@directus/sdk');

async function testGetPage() {
  const directusUrl = "http://localhost:8055";
  const directus = createDirectus(directusUrl).with(rest());

  try {
    console.log('Testing connection to:', directusUrl);
    
    // Try a specific slug identified
    const testSlug = 'home';
    console.log(`Testing full getPageBySlug for '${testSlug}'...`);
    try {
      const response = await directus.request(
        readItems('pages', {
          filter: {
            slug: { _eq: testSlug },
            status: { _eq: 'published' }
          },
          fields: [
            'id',
            'title',
            'slug',
            'status',
            {
              blocks: [
                'collection',
                {
                  item: {
                    block_hero: ['*'],
                    block_text: ['*'],
                    block_features: ['*'],
                    block_live_activity: ['*'],
                    block_categories: ['*'],
                    block_cities: ['*']
                  }
                }
              ]
            }
          ],
          limit: 1
        })
      );
      
      const page = response[0];
      console.log(`Page '${testSlug}' found:`, !!page);
      
      if (page) {
        console.log('Page Title:', page.title);
        console.log('Blocks count:', page.blocks?.length || 0);
        if (page.blocks && page.blocks.length > 0) {
          page.blocks.forEach((b, i) => {
            console.log(`Block ${i} collection:`, b.collection);
            console.log(`Block ${i} item exists:`, !!b.item);
            if (b.item) {
              console.log(`Block ${i} item data:`, JSON.stringify(b.item, null, 2));
            }
          });
        } else {
          console.log('No blocks found in the page.');
        }
      }
    } catch (err) {
      console.error(`Error fetching page '${testSlug}':`, err.message || err);
      if (err.errors) console.error('Details:', JSON.stringify(err.errors, null, 2));
    }

  } catch (err) {
    console.error('Connection/Initialization Error:', err.message || err);
  }
}

testGetPage();
