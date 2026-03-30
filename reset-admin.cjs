const { createDirectus } = require('@directus/sdk');
const axios = require('axios');
require('dotenv').config();

async function resetAdminCredentials() {
  const directusUrl = process.env.PUBLIC_URL || 'http://localhost:8055';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log('Resetting Directus admin credentials...');
  console.log(`URL: ${directusUrl}`);
  console.log(`Email: ${adminEmail}`);

  try {
    // First, try to see if we can access the Directus instance
    const response = await axios.get(`${directusUrl}/server/info`);
    console.log('✓ Directus is accessible');

    // Try to create a new admin user using the Directus API
    // This will work if the admin user doesn't exist yet
    try {
      const createResponse = await axios.post(`${directusUrl}/users`, {
        first_name: 'Admin',
        last_name: 'User',
        email: adminEmail,
        password: adminPassword,
        role: '1' // Administrator role
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (createResponse.status === 200 || createResponse.status === 201) {
        console.log('✓ Admin user created successfully');
        return;
      }
    } catch (createError) {
      console.log('Admin user might already exist, trying to reset password...');
    }

    // If user creation failed, try to reset the password
    // This is a workaround for Directus installations where the admin user exists but has password issues
    const client = createDirectus(directusUrl);
    
    // Try to authenticate with the current credentials
    try {
      const authResponse = await axios.post(`${directusUrl}/auth/login`, {
        email: adminEmail,
        password: adminPassword
      });
      
      if (authResponse.status === 200) {
        console.log('✓ Admin credentials are working');
        return;
      }
    } catch (authError) {
      console.log('Current admin credentials are not working');
    }

    console.log('You may need to manually reset the admin password in the database or reinstall Directus');
    console.log('Alternatively, you can try accessing the Directus admin interface at http://localhost:8055/admin');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

resetAdminCredentials();
