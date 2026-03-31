import { createDirectus, rest, readItems } from '@directus/sdk';

const directusUrl = 'http://localhost:8055';
const directus = createDirectus(directusUrl).with(rest());

async function test() {
  const slug = 'barber-shop-pro';
  
  // 1. Get vendor
  const response = await directus.request(
    readItems('vendors', {
      filter: {
        slug: { _eq: slug },
        status: { _eq: 'active' }
      },
      fields: ['*', 'categories.categories_id.*', 'working_hours.*'],
      limit: 1
    })
  );
  
  const vendor = response[0];
  console.log("Found vendor:", vendor.id);

  // 2. Fetch reviews
  try {
    const reviewsResponse = await directus.request(
        readItems('reviews', {
        filter: { vendor_id: { _eq: vendor.id } },
        fields: ['*'],
        sort: ['-created_at'],
        limit: 50
        })
    );
    vendor.reviews = reviewsResponse || [];
    console.log("Reviews fetched:", vendor.reviews.length);
    console.log("First review:", JSON.stringify(vendor.reviews[0], null, 2));
  } catch (e) {
    console.error('Error fetching reviews:', e);
  }
}

test();
