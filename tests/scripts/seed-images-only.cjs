const fs = require('fs');
const path = require('path');
const { createDirectus, rest } = require('@directus/sdk');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');

// Load environment variables
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=');
      if (key && values.length) {
        process.env[key.trim()] = values.join('=').trim();
      }
    }
  });
}

loadEnvFile(ENV_PATH);

const directusUrl = (process.env.DIRECTUS_INTERNAL_URL || process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');

// Directus client
const directus = createDirectus(directusUrl, {
  auth: {
    staticToken: process.env.DIRECTUS_TOKEN || null,
  },
}).with(rest());

async function getAccessToken() {
  try {
    if (process.env.DIRECTUS_TOKEN) {
      return process.env.DIRECTUS_TOKEN;
    }
    
    const result = await directus.login(
      process.env.ADMIN_EMAIL,
      process.env.ADMIN_PASSWORD
    );
    
    return result.access_token;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw error;
  }
}

async function createItem(token, collection, item) {
  const response = await fetch(`${directusUrl}/items/${collection}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create ${collection}: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function readAllItems(token, collection) {
  const response = await fetch(`${directusUrl}/items/${collection}?fields=id&limit=-1`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to read ${collection}: ${response.status}`);
  }

  const data = await response.json();
  return data.data || [];
}

async function deleteItemsByIds(token, collection, ids) {
  if (ids.length === 0) return;
  
  const response = await fetch(`${directusUrl}/items/${collection}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys: ids }),
  });

  if (!response.ok) {
    throw new Error(`Failed to delete from ${collection}: ${response.status}`);
  }
}

async function uploadLocalFile(token, filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  
  const formData = new FormData();
  formData.append('file', new Blob([fileBuffer]), fileName);

  const response = await fetch(`${directusUrl}/files`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload file: ${response.status} - ${errorText}`);
  }

  return response.json();
}

function normalizeValue(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function findImageMatch(keys, imageEntries, fallbackIndex = 0) {
  if (!imageEntries.length) return null;
  
  const normalizedKeys = keys.map(normalizeValue).filter(Boolean);

  for (const key of normalizedKeys) {
    const exactMatch = imageEntries.find((entry) => entry.normalizedBase === key);
    if (exactMatch) return exactMatch;
  }

  for (const key of normalizedKeys) {
    const partialMatch = imageEntries.find(
      (entry) => entry.normalizedBase.includes(key) || key.includes(entry.normalizedBase)
    );
    if (partialMatch) return partialMatch;
  }

  return imageEntries[fallbackIndex % imageEntries.length];
}

function getImageFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  
  const files = fs.readdirSync(directory);
  const imageExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
  
  return files
    .filter(file => imageExtensions.has(path.extname(file).toLowerCase()))
    .map(file => ({
      fileName: file,
      absolutePath: path.join(directory, file),
      normalizedBase: normalizeValue(path.parse(file).name),
    }));
}

async function cleanupExistingDemoImages(token, imageFiles) {
  try {
    const existingFiles = await readAllItems(token, 'directus_files');
    const existingFilenames = existingFiles.map(f => f.filename_download);
    const newFilenames = imageFiles.map(f => f.fileName);
    
    const filesToDelete = existingFiles.filter(f => newFilenames.includes(f.filename_download));
    
    if (filesToDelete.length > 0) {
      const idsToDelete = filesToDelete.map(f => f.id);
      await deleteItemsByIds(token, 'directus_files', idsToDelete);
      console.log(`   Removed ${filesToDelete.length} previously uploaded demo image entries`);
      return filesToDelete.length;
    }
  } catch (error) {
    console.warn('   Could not clean existing demo images:', error.message);
  }
  
  return 0;
}

// Test data
const testVendors = [
  {
    name: 'Glamour Salon & Spa',
    slug: 'glamour-salon-spa',
    description: 'Premier beauty destination offering comprehensive hair, skin, and wellness services. Our expert stylists and therapists are dedicated to providing you with a luxurious and transformative experience.',
    email: 'info@glamoursalon.com',
    phone: '+92-21-34567890',
    address: '123 Main Boulevard, Phase 5',
    city: 'Karachi',
    area: 'DHA',
    rating: 4.8,
    reviews_count: 156,
    is_featured: true,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 24.8136,
    longitude: 67.0482
  },
  {
    name: 'Barber Shop Pro',
    slug: 'barber-shop-pro',
    description: 'Traditional barbershop with modern techniques. Specializing in classic cuts, hot towel shaves, and men\'s grooming services. Step into our shop for an experience that combines tradition with contemporary style.',
    email: 'hello@barbershoppro.com',
    phone: '+92-21-23456789',
    address: '456 Commercial Street, Block 7',
    city: 'Karachi',
    area: 'Clifton',
    rating: 4.6,
    reviews_count: 89,
    is_featured: false,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 24.8005,
    longitude: 67.0422
  },
  {
    name: 'Royal Beauty Lounge',
    slug: 'royal-beauty-lounge',
    description: 'Exclusive women\'s only salon providing premium beauty services in a private and comfortable environment. Our certified professionals use only the finest products to ensure your beauty and wellness.',
    email: 'contact@royalbeauty.com',
    phone: '+92-21-34567891',
    address: '789 Fashion Avenue, Phase 6',
    city: 'Karachi',
    area: 'Bahadurabad',
    rating: 4.9,
    reviews_count: 234,
    is_featured: true,
    is_verified: true,
    women_only: true,
    status: 'active',
    latitude: 24.8236,
    longitude: 67.0582
  },
  {
    name: 'Capital Barber Studio',
    slug: 'capital-barber-studio',
    description: 'Modern barber studio in Islamabad offering fades, beard styling, premium grooming, and classic cuts for professionals and students alike.',
    email: 'hello@capitalbarberstudio.com',
    phone: '+92-51-2345678',
    address: '88 Jinnah Avenue, Blue Area',
    city: 'Islamabad',
    area: 'Blue Area',
    rating: 4.7,
    reviews_count: 102,
    is_featured: true,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 33.7075,
    longitude: 73.0498
  }
];

const testEmployees = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@glamoursalon.com',
    bio: 'Senior hairstylist with 12 years of experience in luxury salons. Specialized in color treatments, balayage, and bridal styling. Certified by L\'Oréal Professional and Wella Studios.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 1
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@barbershoppro.com',
    bio: 'Master barber with 8 years of experience in classic and modern men\'s grooming. Expert in traditional straight razor shaves, fades, and beard styling.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 1
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@royalbeauty.com',
    bio: 'Licensed esthetician and makeup artist with 6 years of experience. Specialized in facials, skincare treatments, and bridal makeup.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 2
  },
  {
    name: 'James Chen',
    email: 'james.chen@barbershoppro.com',
    bio: 'Professional barber specializing in Asian hair techniques and modern styling. 5 years of experience in precision cutting and creative styling.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 2
  },
  {
    name: 'Ali Raza',
    email: 'ali.raza@capitalbarberstudio.com',
    bio: 'Islamabad-based barber known for clean fades, beard detailing, and sharp executive cuts. Focused on precise grooming and a relaxed client experience.',
    timezone: 'Asia/Karachi',
    status: 'active',
    sort_order: 1
  }
];

async function seedImagesAndVendors() {
  try {
    console.log('🎨 Seeding vendors with high-resolution images...');
    const token = await getAccessToken();

    // Clean existing vendors and employees
    console.log('🧹 Cleaning existing data...');
    const collectionsToClean = ['vendors', 'employees'];
    
    for (const collection of collectionsToClean) {
      try {
        const items = await readAllItems(token, collection);
        const ids = items.map((item) => item.id).filter(Boolean);
        await deleteItemsByIds(token, collection, ids);
        if (ids.length) {
          console.log(`   Deleted ${ids.length} items from ${collection}`);
        }
      } catch (error) {
        console.warn(`   Could not clean ${collection}: ${error.message}`);
      }
    }

    // Upload demo images
    console.log('📸 Uploading demo images...');
    const imagesPath = path.join(ROOT_DIR, 'Images');
    const imageFiles = getImageFiles(imagesPath);
    const imageEntries = [];
    
    const removedDuplicateImages = await cleanupExistingDemoImages(token, imageFiles);
    if (removedDuplicateImages) {
      console.log(`   Removed ${removedDuplicateImages} previously uploaded demo image entries`);
    }

    if (!imageEntries.length && imageFiles.length > 0) {
      console.log(`   Found ${imageFiles.length} images to upload`);
    }

    for (const fileName of imageFiles) {
      try {
        const absolutePath = path.join(imagesPath, fileName);
        const uploadId = await uploadLocalFile(token, absolutePath);
        imageEntries.push({
          fileName: fileName.fileName,
          id: uploadId.data.id,
          normalizedBase: normalizeValue(path.parse(fileName.fileName).name),
        });
        console.log(`   Uploaded image: ${fileName.fileName} → ${uploadId.data.id}`);
      } catch (error) {
        console.error(`   Failed to upload ${fileName.fileName}: ${error.message}`);
      }
    }

    // Seed vendors with images
    console.log('🏪 Seeding vendors...');
    const vendorIds = {};
    const vendorImageIds = {};
    
    testVendors.forEach((vendor, index) => {
      const imageEntry = findImageMatch([vendor.slug, vendor.name], imageEntries, index);
      vendorImageIds[vendor.slug] = imageEntry ? imageEntry.id : null;
      if (imageEntry) {
        console.log(`   Matched ${vendor.name} → ${imageEntry.fileName}`);
      }
    });

    for (const vendor of testVendors) {
      const created = await createItem(token, 'vendors', {
        ...vendor,
        logo: vendorImageIds[vendor.slug],
        cover_image: vendorImageIds[vendor.slug],
        status: 'active',
      });
      vendorIds[vendor.slug] = created.id;
      console.log(`   Created vendor: ${vendor.name} with images`);
    }

    // Seed employees with remaining images
    console.log('👥 Seeding employees...');
    let employeeImageIndex = 0;
    
    for (const employee of testEmployees) {
      const domain = employee.email.split('@')[1] || '';
      let vendorSlug = 'glamour-salon-spa';
      if (domain.includes('barbershop')) {
        vendorSlug = 'barber-shop-pro';
      } else if (domain.includes('royalbeauty')) {
        vendorSlug = 'royal-beauty-lounge';
      } else if (domain.includes('capitalbarber')) {
        vendorSlug = 'capital-barber-studio';
      }

      const imageEntry = imageEntries.length > 0 ? imageEntries[employeeImageIndex % imageEntries.length] : null;
      const createdEmployee = await createItem(token, 'employees', {
        ...employee,
        vendor_id: vendorIds[vendorSlug],
        photo: imageEntry ? imageEntry.id : null,
        status: 'active',
        rating: 0,
        reviews_count: 0,
      });
      console.log(`   Created employee: ${employee.name} ${imageEntry ? `with photo: ${imageEntry.fileName}` : 'without photo'}`);
      employeeImageIndex++;
    }

    // Seed business leads
    console.log('📋 Seeding business leads...');
    const testBusinessLeads = [
      {
        business_name: 'Elite Grooming Lounge',
        contact_person: 'Ahmed Hassan',
        phone: '+92-300-1234567',
        email: 'ahmed@elitegrooming.com',
        category: 'Barber',
        city: 'Karachi',
        status: 'pending'
      },
      {
        business_name: 'Luxe Beauty Studio',
        contact_person: 'Fatima Sheikh',
        phone: '+92-301-9876543',
        email: 'fatima@luxebeauty.com',
        category: 'Beauty Salon',
        city: 'Lahore',
        status: 'pending'
      },
      {
        business_name: 'Royal Spa & Wellness',
        contact_person: 'Khalid Malik',
        phone: '+92-21-37654321',
        email: 'khalid@royalspa.com',
        category: 'Spa',
        city: 'Islamabad',
        status: 'pending'
      }
    ];

    for (const businessLead of testBusinessLeads) {
      await createItem(token, 'business_leads', {
        ...businessLead,
        status: 'pending'
      });
      console.log(`   Created business lead: ${businessLead.business_name}`);
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`✅ Created ${Object.keys(vendorIds).length} vendors with high-resolution images`);
    console.log(`✅ Created ${testEmployees.length} employees`);
    console.log(`✅ Created ${testBusinessLeads.length} business leads`);
    console.log(`✅ Uploaded ${imageEntries.length} images`);
    
    console.log('\n🌐 Access points:');
    console.log('   Frontend: http://localhost:3000');
    console.log('   Directus: http://localhost:8055');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  seedImagesAndVendors();
}

module.exports = { seedImagesAndVendors };
