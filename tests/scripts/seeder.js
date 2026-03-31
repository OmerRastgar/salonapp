const fs = require('fs');
const path = require('path');
const {
  testVendors,
  testEmployees,
  testServices,
  testSchedules,
  testReviews,
  testLocations,
  testCategories,
  testBusinessLeads
} = require('../fixtures/test-data');

const ROOT_DIR = path.resolve(__dirname, '../..');
const ENV_PATH = path.join(ROOT_DIR, '.env');
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const DEFAULT_DIRECTUS_URL = process.env.DIRECTUS_INTERNAL_URL || process.env.DIRECTUS_URL || 'http://localhost:8055';

loadEnvFile(ENV_PATH);

const directusUrl = (process.env.DIRECTUS_INTERNAL_URL || process.env.DIRECTUS_URL || DEFAULT_DIRECTUS_URL).replace(/\/$/, '');
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const staticToken = process.env.DIRECTUS_TOKEN;

if (!staticToken && (!adminEmail || !adminPassword)) {
  console.error('Error: provide DIRECTUS_TOKEN or ADMIN_EMAIL + ADMIN_PASSWORD before running the seeder.');
  process.exit(1);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

async function getAccessToken() {
  if (adminEmail && adminPassword) {
    const response = await fetch(`${directusUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPassword,
      }),
    });

    if (response.ok) {
      const payload = await response.json();
      return payload?.data?.access_token;
    }
  }

  if (staticToken && !staticToken.includes('your-directus-static-token')) {
    return staticToken;
  }

  throw new Error('Unable to get a Directus access token for seeding.');
}

async function directusRequest(token, endpoint, options = {}) {
  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const response = await fetch(`${directusUrl}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Directus request failed (${response.status}) for ${endpoint}: ${body}`);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
}

async function readAllItems(token, collection) {
  const payload = await directusRequest(token, `/items/${collection}?fields=id&limit=-1`);
  return payload.data || [];
}

async function readItems(token, collection, fields) {
  const payload = await directusRequest(
    token,
    `/items/${collection}?fields=${encodeURIComponent(fields.join(','))}&limit=-1`
  );
  return payload.data || [];
}

async function deleteItemsByIds(token, collection, ids) {
  if (!ids.length) {
    return;
  }

  await directusRequest(token, `/items/${collection}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys: ids }),
  });
}

async function createItem(token, collection, item) {
  try {
    const payload = await directusRequest(token, `/items/${collection}?fields=id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(item)
    });

    return payload?.data ?? payload ?? null;
  } catch (error) {
    console.error(`Error in createItem for ${collection}:`, error);
    throw error;
  }
}

async function readFiles(token) {
  const payload = await directusRequest(
    token,
    `/files?fields=${encodeURIComponent('id,title,filename_download')}&limit=-1`
  );
  return payload.data || [];
}

async function deleteFilesByIds(token, ids) {
  if (!ids.length) {
    return;
  }

  await directusRequest(token, '/files', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ keys: ids }),
  });
}

async function uploadLocalFile(token, filePath) {
  const fileName = path.basename(filePath);
  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();

  formData.append('title', path.parse(fileName).name);
  formData.append('file', new Blob([fileBuffer]), fileName);

  const payload = await directusRequest(token, '/files', {
    method: 'POST',
    body: formData,
  });

  console.log(`   Uploaded image: ${fileName} -> ${payload.data.id}`);
  return payload.data.id;
}

function normalizeValue(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function getImageFiles(imagesPath) {
  if (!fs.existsSync(imagesPath)) {
    return [];
  }

  return fs
    .readdirSync(imagesPath)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((left, right) => left.localeCompare(right));
}

async function cleanupExistingDemoImages(token, imageFiles) {
  if (!imageFiles.length) {
    return 0;
  }

  const allFiles = await readFiles(token);
  const fileNames = new Set(imageFiles.map((fileName) => fileName.toLowerCase()));
  const titles = new Set(imageFiles.map((fileName) => path.parse(fileName).name.toLowerCase()));

  const duplicateFileIds = allFiles
    .filter((file) => {
      const downloadName = String(file.filename_download || '').toLowerCase();
      const title = String(file.title || '').toLowerCase();
      return fileNames.has(downloadName) || titles.has(title);
    })
    .map((file) => file.id)
    .filter(Boolean);

  await deleteFilesByIds(token, duplicateFileIds);
  return duplicateFileIds.length;
}

function findImageMatch(keys, imageEntries, fallbackIndex) {
  const normalizedKeys = keys.map(normalizeValue).filter(Boolean);

  for (const key of normalizedKeys) {
    const exactMatch = imageEntries.find((entry) => entry.normalizedBase === key);
    if (exactMatch) {
      return exactMatch;
    }
  }

  for (const key of normalizedKeys) {
    const partialMatch = imageEntries.find(
      (entry) => entry.normalizedBase.includes(key) || key.includes(entry.normalizedBase)
    );
    if (partialMatch) {
      return partialMatch;
    }
  }

  if (!imageEntries.length) {
    return null;
  }

  return imageEntries[fallbackIndex % imageEntries.length];
}

async function seed() {
  try {
    const token = await getAccessToken();

    console.log('Starting seeding process...');

    console.log('Cleaning existing data...');
    const collectionsToClean = [
      'bookings',
      'reviews',
      'employee_schedules',
      'employee_services',
      'working_hours',
      'employees',
      'vendor_categories',
      'vendors',
      'categories',
      'locations',
      'business_leads'
    ];

    for (const collection of collectionsToClean) {
      try {
        const items = await readAllItems(token, collection);
        const ids = items.map((item) => item.id).filter(Boolean);
        await deleteItemsByIds(token, collection, ids);
        if (ids.length) {
          console.log(`   Deleted ${ids.length} items from ${collection}`);
        }
      } catch (error) {
        console.error(`   Could not clean ${collection}: ${error.message}`);
        throw error;
      }
    }

    console.log('Uploading demo images...');
    const imagesPath = path.join(ROOT_DIR, 'Images');
    const imageFiles = getImageFiles(imagesPath);
    const imageEntries = [];

    const removedDuplicateImages = await cleanupExistingDemoImages(token, imageFiles);
    if (removedDuplicateImages) {
      console.log(`   Removed ${removedDuplicateImages} previously uploaded demo image entries`);
    }

    for (const fileName of imageFiles) {
      const absolutePath = path.join(imagesPath, fileName);
      const uploadId = await uploadLocalFile(token, absolutePath);
      imageEntries.push({
        fileName,
        id: uploadId,
        normalizedBase: normalizeValue(path.parse(fileName).name),
      });
    }

    if (!imageEntries.length) {
      console.warn('   No images found in the Images folder. Vendors and employees will be created without uploaded photos.');
    }

    console.log('Seeding locations...');
    const locationIds = {};
    for (const location of testLocations) {
      const created = await createItem(token, 'locations', {
        ...location,
        status: 'active',
      });
      locationIds[location.slug] = created.id;
    }

    console.log('Seeding categories...');
    const categoryIds = {};
    for (const category of testCategories) {
      const created = await createItem(token, 'categories', {
        ...category,
        status: 'active',
      });
      categoryIds[category.slug] = created.id;
    }

    console.log('Seeding vendors...');
    const vendorIds = {};
    const vendorImageIds = {};
    testVendors.forEach((vendor, index) => {
      const imageEntry = findImageMatch([vendor.slug, vendor.name], imageEntries, index);
      vendorImageIds[vendor.slug] = imageEntry ? imageEntry.id : null;
    });

    for (const vendor of testVendors) {
      const created = await createItem(token, 'vendors', {
        ...vendor,
        logo: vendorImageIds[vendor.slug],
        cover_image: vendorImageIds[vendor.slug],
        status: 'active',
      });
      vendorIds[vendor.slug] = created.id;
      console.log(`   Created vendor: ${vendor.name}`);

      const categorySlug = vendor.name.toLowerCase().includes('barber') ? 'barber' : 'beauty-salon';
      if (categoryIds[categorySlug]) {
        await createItem(token, 'vendor_categories', {
          vendors_id: created.id,
          categories_id: categoryIds[categorySlug],
        });
      }

      for (const day of [1, 2, 3, 4, 5]) {
        await createItem(token, 'working_hours', {
          vendor_id: created.id,
          day_of_week: day,
          open_time: '09:00',
          close_time: '18:00',
          is_closed: false,
        });
      }
    }

    console.log('Seeding employees, services, and schedules...');
    for (let index = 0; index < testEmployees.length; index += 1) {
      const employee = testEmployees[index];
      const domain = employee.email.split('@')[1] || '';
      let vendorSlug = 'glamour-salon-spa';
      if (domain.includes('barbershop')) {
        vendorSlug = 'barber-shop-pro';
      } else if (domain.includes('capitalbarberstudio')) {
        vendorSlug = 'capital-barber-studio';
      } else if (domain.includes('royalbeauty')) {
        vendorSlug = 'royal-beauty-lounge';
      }

      const imageEntry = findImageMatch(
        [employee.name, employee.email.split('@')[0], vendorSlug],
        imageEntries,
        index
      );

      const createdEmployee = await createItem(token, 'employees', {
        ...employee,
        vendor_id: vendorIds[vendorSlug],
        photo: imageEntry ? imageEntry.id : vendorImageIds[vendorSlug],
        status: 'active',
        rating: 0,
        reviews_count: 0,
      });

      console.log(`   Created employee: ${employee.name}`);

      const serviceStart = (index * 3) % testServices.length;
      for (let serviceOffset = 0; serviceOffset < 3; serviceOffset += 1) {
        const serviceTemplate = testServices[(serviceStart + serviceOffset) % testServices.length];
        await createItem(token, 'employee_services', {
          ...serviceTemplate,
          employee_id: createdEmployee.id,
          is_active: true,
        });
      }

      for (const schedule of testSchedules) {
        await createItem(token, 'employee_schedules', {
          ...schedule,
          employee_id: createdEmployee.id,
        });
      }
    }

    console.log('Seeding reviews...');
    const vendorIdValues = Object.values(vendorIds);
    for (let vendorIndex = 0; vendorIndex < vendorIdValues.length; vendorIndex += 1) {
      const vendorId = vendorIdValues[vendorIndex];
      for (let reviewOffset = 0; reviewOffset < 2; reviewOffset += 1) {
        const reviewTemplate = testReviews[(vendorIndex * 2 + reviewOffset) % testReviews.length];
        await createItem(token, 'reviews', {
          ...reviewTemplate,
          vendor_id: vendorId,
          status: 'published',
        });
      }
    }

    console.log('Seeding business leads...');
    for (const businessLead of testBusinessLeads) {
      await createItem(token, 'business_leads', {
        ...businessLead,
        status: 'pending',
      });
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  seed();
}
