const { execSync } = require('child_process');
const axios = require('axios');
require('dotenv').config();

async function setupDirectusAdmin() {
  const directusUrl = process.env.PUBLIC_URL || 'http://localhost:8055';
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  console.log('Setting up Directus admin user...');
  console.log(`Directus URL: ${directusUrl}`);
  console.log(`Admin Email: ${adminEmail}`);

  try {
    // Wait for Directus to be ready
    console.log('Waiting for Directus to be ready...');
    let retries = 30;
    let directusReady = false;

    while (retries > 0 && !directusReady) {
      try {
        const response = await axios.get(`${directusUrl}/server/info`, { timeout: 5000 });
        if (response.status === 200) {
          directusReady = true;
          console.log('✓ Directus is ready');
        }
      } catch (error) {
        retries--;
        console.log(`Waiting for Directus... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    if (!directusReady) {
      throw new Error('Directus did not become ready in time');
    }

    // Try to authenticate with existing admin
    try {
      const authResponse = await axios.post(`${directusUrl}/auth/login`, {
        email: adminEmail,
        password: adminPassword
      });

      if (authResponse.status === 200) {
        console.log('✓ Admin user already exists and credentials work');
        return true;
      }
    } catch (authError) {
      console.log('Admin authentication failed, attempting to create admin user...');
    }

    // Try to create admin user using Docker exec
    try {
      console.log('Creating admin user via Docker...');
      
      const createAdminCommand = `npx directus users create --email "${adminEmail}" --password "${adminPassword}" --role "1" --first-name "Admin" --last-name "User"`;
      
      execSync(`docker-compose exec -T directus sh -c "${createAdminCommand}"`, {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      console.log('✓ Admin user created successfully');
      
      // Verify the admin user works
      const verifyResponse = await axios.post(`${directusUrl}/auth/login`, {
        email: adminEmail,
        password: adminPassword
      });

      if (verifyResponse.status === 200) {
        console.log('✓ Admin user verification successful');
        return true;
      }
    } catch (dockerError) {
      console.log('Docker method failed, trying alternative approach...');
    }

    // Alternative: Try using the Directus CLI to reset
    try {
      console.log('Attempting to reset admin credentials...');
      
      execSync('docker-compose exec -T directus npx directus utils reset-admin-credentials', {
        stdio: 'inherit',
        cwd: process.cwd()
      });

      console.log('✓ Admin credentials reset');
      return true;
    } catch (resetError) {
      console.log('Reset method failed');
    }

    // Final fallback: Manual database setup
    console.log('Attempting manual database setup...');
    
    const setupSQL = `
      -- Check if admin user exists
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM directus_users WHERE email = '${adminEmail}') THEN
          -- Create admin user
          INSERT INTO directus_users (first_name, last_name, email, password, role, status)
          VALUES (
            'Admin',
            'User',
            '${adminEmail}',
            crypt('${adminPassword}', gen_salt('bf')),
            '1',
            'active'
          );
          RAISE NOTICE 'Admin user created successfully';
        ELSE
          RAISE NOTICE 'Admin user already exists';
        END IF;
      END $$;
    `;

    // Write SQL to temp file and execute
    require('fs').writeFileSync('/tmp/setup-admin.sql', setupSQL);
    
    execSync('docker-compose exec -T database psql -U admin -d postgres -f /tmp/setup-admin.sql', {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('✓ Manual database setup completed');
    
    // Final verification
    const finalVerify = await axios.post(`${directusUrl}/auth/login`, {
      email: adminEmail,
      password: adminPassword
    });

    if (finalVerify.status === 200) {
      console.log('✓ Final verification successful');
      return true;
    }

    throw new Error('All admin setup methods failed');

  } catch (error) {
    console.error('Setup failed:', error.message);
    console.log('\nManual setup required:');
    console.log(`1. Visit ${directusUrl}/admin`);
    console.log(`2. Create admin user with email: ${adminEmail}`);
    console.log(`3. Use password: ${adminPassword}`);
    return false;
  }
}

// Run the setup
setupDirectusAdmin().then(success => {
  if (success) {
    console.log('\n✅ Directus admin setup completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Directus admin setup failed. Manual intervention required.');
    process.exit(1);
  }
}).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
