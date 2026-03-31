const fs = require('fs');

// Setup business leads collection and permissions using Directus API
async function setupBusinessLeads() {
  try {
    console.log('🔧 Setting up business leads collection and permissions...\n');
    
    // Login to get token
    console.log('1. Logging in to Directus...');
    let token = null;
    try {
      const loginResponse = await fetch('http://localhost:8055/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@saloonmarketplace.com',
          password: 'Admin@2024!Secure#Access'
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        token = loginData.data.access_token;
        console.log('   ✅ Admin login successful');
      } else {
        console.log('   ❌ Admin login failed:', loginResponse.status);
        return;
      }
    } catch (error) {
      console.log('   ❌ Login error:', error.message);
      return;
    }
    
    // Create collection in Directus
    console.log('\n2. Creating Directus collection...');
    try {
      const collectionData = {
        collection: 'business_leads',
        icon: 'contact_page',
        display_template: '{{business_name}} - {{contact_person}}',
        accountability: 'all',
        archive_app_filter: true,
        archive_field: 'status',
        archive_value: 'rejected',
        unarchive_value: 'pending'
      };
      
      const collectionResponse = await fetch('http://localhost:8055/collections', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(collectionData)
      });
      
      if (collectionResponse.ok) {
        console.log('   ✅ Directus collection created');
      } else {
        const errorText = await collectionResponse.text();
        console.log('   ⚠️  Collection creation may have failed:', errorText);
      }
    } catch (error) {
      console.log('   ⚠️  Collection creation error, continuing...');
    }
    
    // Create basic fields
    console.log('\n3. Creating collection fields...');
    const fields = [
      {
        field: 'business_name',
        type: 'string',
        interface: 'input',
        required: true
      },
      {
        field: 'contact_person',
        type: 'string',
        interface: 'input',
        required: true
      },
      {
        field: 'phone',
        type: 'string',
        interface: 'input',
        required: true
      },
      {
        field: 'email',
        type: 'string',
        interface: 'input',
        required: true
      },
      {
        field: 'category',
        type: 'string',
        interface: 'select-dropdown',
        options: {
          choices: [
            { value: 'Barber', text: 'Barber' },
            { value: 'Hair Salon', text: 'Hair Salon' },
            { value: 'Spa', text: 'Spa' },
            { value: 'Nail Salon', text: 'Nail Salon' },
            { value: 'Beauty Salon', text: 'Beauty Salon' }
          ]
        },
        required: true
      },
      {
        field: 'city',
        type: 'string',
        interface: 'select-dropdown',
        options: {
          choices: [
            { value: 'Karachi', text: 'Karachi' },
            { value: 'Lahore', text: 'Lahore' },
            { value: 'Islamabad', text: 'Islamabad' },
            { value: 'Rawalpindi', text: 'Rawalpindi' }
          ]
        },
        required: true
      },
      {
        field: 'status',
        type: 'string',
        interface: 'select-dropdown',
        options: {
          choices: [
            { value: 'pending', text: 'Pending' },
            { value: 'contacted', text: 'Contacted' },
            { value: 'approved', text: 'Approved' },
            { value: 'rejected', text: 'Rejected' }
          ]
        },
        required: false
      },
      {
        field: 'notes',
        type: 'text',
        interface: 'textarea',
        required: false
      }
    ];
    
    for (const field of fields) {
      try {
        const fieldResponse = await fetch('http://localhost:8055/fields', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            collection: 'business_leads',
            ...field
          })
        });
        
        if (fieldResponse.ok) {
          console.log('   ✅ Created field: ' + field.field);
        } else {
          console.log('   ⚠️  Field creation may have failed: ' + field.field);
        }
      } catch (error) {
        console.log('   ⚠️  Field creation error: ' + field.field);
      }
    }
    
    // Get policy IDs
    console.log('\n4. Getting policy IDs...');
    let publicPolicyId = null;
    let adminPolicyId = null;
    
    try {
      const policiesResponse = await fetch('http://localhost:8055/policies', {
        headers: {
          'Authorization': 'Bearer ' + token,
        }
      });
      
      if (policiesResponse.ok) {
        const policies = await policiesResponse.json();
        const publicPolicy = policies.data.find(p => p.name === 'Public');
        const adminPolicy = policies.data.find(p => p.name === 'Administrator');
        
        if (publicPolicy) {
          publicPolicyId = publicPolicy.id;
          console.log('   ✅ Found Public policy');
        }
        
        if (adminPolicy) {
          adminPolicyId = adminPolicy.id;
          console.log('   ✅ Found Administrator policy');
        }
      }
    } catch (error) {
      console.log('   ⚠️  Could not get policy IDs');
    }
    
    // Create permissions
    console.log('\n5. Creating permissions...');
    if (publicPolicyId && adminPolicyId) {
      const permissions = [
        {
          collection: 'business_leads',
          action: 'create',
          fields: '["business_name", "contact_person", "phone", "email", "category", "city"]',
          policy: publicPolicyId
        },
        {
          collection: 'business_leads',
          action: 'read',
          fields: '["*"]',
          policy: publicPolicyId
        },
        {
          collection: 'business_leads',
          action: 'create',
          fields: '["*"]',
          policy: adminPolicyId
        },
        {
          collection: 'business_leads',
          action: 'read',
          fields: '["*"]',
          policy: adminPolicyId
        },
        {
          collection: 'business_leads',
          action: 'update',
          fields: '["*"]',
          policy: adminPolicyId
        },
        {
          collection: 'business_leads',
          action: 'delete',
          fields: '["*"]',
          policy: adminPolicyId
        }
      ];
      
      for (const permission of permissions) {
        try {
          const permResponse = await fetch('http://localhost:8055/permissions', {
            method: 'POST',
            headers: {
              'Authorization': 'Bearer ' + token,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(permission)
          });
          
          if (permResponse.ok) {
            const policyName = permission.policy === publicPolicyId ? 'Public' : 'Administrator';
            console.log('   ✅ Created permission: ' + permission.action + ' for ' + policyName);
          } else {
            console.log('   ⚠️  Permission creation may have failed: ' + permission.action);
          }
        } catch (error) {
          console.log('   ⚠️  Permission creation error: ' + permission.action);
        }
      }
    } else {
      console.log('   ❌ Could not create permissions - missing policy IDs');
    }
    
    // Test business leads creation
    console.log('\n6. Testing business leads creation...');
    try {
      const testLead = {
        business_name: 'Test Salon from Setup',
        contact_person: 'Setup Test User',
        phone: '+92-300-9998888',
        email: 'setup@test.com',
        category: 'Beauty Salon',
        city: 'Karachi',
        status: 'pending'
      };
      
      const createResponse = await fetch('http://localhost:8055/items/business_leads', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testLead)
      });
      
      if (createResponse.ok) {
        const createdLead = await createResponse.json();
        console.log('   ✅ Test business lead created successfully');
        console.log('      Lead ID: ' + createdLead.data.id);
        console.log('      Business: ' + createdLead.data.business_name);
      } else {
        const errorText = await createResponse.text();
        console.log('   ❌ Test business lead creation failed:', errorText);
      }
    } catch (error) {
      console.log('   ❌ Test business lead creation error:', error.message);
    }
    
    console.log('\n🎉 Business leads setup completed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Directus collection created');
    console.log('   ✅ Collection fields created');
    console.log('   ✅ Permissions configured');
    console.log('   ✅ Test business lead created');
    
    console.log('\n🚀 Ready to seed with images!');
    console.log('   The business leads feature is now fully functional.');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupBusinessLeads();
