import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config({ path: '.env.local' });

const DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL || 'http://localhost:8055';
const STATIC_TOKEN = process.env.DIRECTUS_TOKEN;
const IMAGES_DIR = path.resolve(__dirname, '../../Images');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_DATABASE || 'postgres',
  port: parseInt(process.env.DB_PORT || '5432')
});

const assetMapping = [
  { type: 'category', slug: 'hair-salon', file: 'hair-salon-cat.png', title: 'Hair Salon Icon' },
  { type: 'category', slug: 'barber', file: 'barber-cat.png', title: 'Barber Icon' },
  { type: 'category', slug: 'spa', file: 'spa-cat.png', title: 'Spa Icon' },
  { type: 'category', slug: 'nail-salon', file: 'nail-salon-cat.png', title: 'Nail Salon Icon' },
  { type: 'vendor', slug: 'barber-studio', file: 'modern-barber-interior.png', title: 'Modern Barber Interior' },
  { type: 'vendor', slug: 'luxe-hair', file: 'luxury-hair-salon.png', title: 'Luxury Hair Salon' },
  { type: 'vendor', slug: 'serene-spa', file: 'serene-spa-interior.png', title: 'Serene Spa Interior' },
  { type: 'vendor', slug: 'oasis-nails', file: 'nail-salon-interior.png', title: 'Nail Salon Interior' },
  { type: 'employee', name: 'Ahmed', file: 'barber-1.png', title: 'Barber Profile 1' },
  { type: 'employee', name: 'Sarah', file: 'stylist-1.png', title: 'Stylist Profile 1' },
  { type: 'employee', name: 'Omar', file: 'therapist-1.png', title: 'Therapist Profile 1' },
  { type: 'employee', name: 'Elena', file: 'aesthetician-1.png', title: 'Nail Artist Profile 1' },
  { type: 'placeholder', name: 'Extra 1', file: 'glamour-salon-interior.jpg', title: 'Luxury Interior 1' },
  { type: 'placeholder', name: 'Extra 2', file: 'modern-barber-shop.jpg', title: 'Luxury Interior 2' },
  { type: 'placeholder', name: 'Extra 3', file: 'royal-beauty-lounge.jpg', title: 'Luxury Interior 3' },
  { type: 'placeholder', name: 'Extra 4', file: 'glamour-salon-spa.jpg', title: 'Luxury Interior 4' }
];

async function uploadAsset(asset: any) {
  const filePath = path.join(IMAGES_DIR, asset.file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return null;
  }

  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  formData.append('title', asset.title);

  try {
    const response = await axios.post(`${DIRECTUS_URL}/files`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${STATIC_TOKEN}`
      }
    });

    return response.data.data.id;
  } catch (error: any) {
    console.error(`Failed to upload ${asset.file}`);
    return null;
  }
}

async function run() {
  for (const asset of assetMapping) {
    const newId = await uploadAsset(asset);
    if (newId) {
      const identifier = asset.slug || asset.name;
      if (asset.type === 'category') {
        console.log(`UPDATE categories SET image = '${newId}' WHERE slug = '${identifier}';`);
      } else if (asset.type === 'vendor') {
        console.log(`UPDATE vendors SET cover_image = '${newId}' WHERE slug = '${identifier}';`);
      } else if (asset.type === 'employee') {
        console.log(`UPDATE employees SET photo = '${newId}' WHERE name = '${identifier}';`);
      } else if (asset.type === 'placeholder') {
        console.log(`-- Placeholder ${identifier}: ${newId}`);
      }
    }
  }
}

run().then(() => {
  // Ensure we close the pool if we used it (though we aren't currently using pg pool in the loop, only axios)
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
