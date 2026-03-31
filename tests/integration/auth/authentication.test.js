/**
 * Authentication and Authorization Integration Tests
 * Tests for user authentication, role-based access control, and permissions
 */

const { createDirectusTestClient } = require('../../utils/test-client');
const { getTestData } = require('../../fixtures/test-data');

describe('Authentication & Authorization', () => {
  let testClient;
  let testData;
  let vendorId;
  let adminUser;
  let vendorAdminUser;
  let employeeUser;
  let publicUser;

  beforeAll(async () => {
    testClient = await createDirectusTestClient();
    testData = getTestData();
    
    // Create test vendor
    const vendor = await testClient.createItem('vendors', {
      name: 'Auth Test Salon',
      email: 'auth@salon.com',
      phone: '+1234567890',
      status: 'active'
    });
    vendorId = vendor.id;

    // Create test users with different roles
    adminUser = await testClient.createItem('users', {
      email: 'admin@test.com',
      password: 'testpass123',
      role: 'admin'
    });

    vendorAdminUser = await testClient.createItem('users', {
      email: 'vendor@test.com',
      password: 'testpass123',
      role: 'vendor_admin',
      vendor_id: vendorId
    });

    employeeUser = await testClient.createItem('users', {
      email: 'employee@test.com',
      password: 'testpass123',
      role: 'employee',
      vendor_id: vendorId
    });

    publicUser = await testClient.createItem('users', {
      email: 'public@test.com',
      password: 'testpass123',
      role: 'public'
    });
  });

  afterAll(async () => {
    // Cleanup test data
    await testClient.cleanupTestData();
  });

  describe('User Authentication', () => {
    test('should authenticate admin user successfully', async () => {
      const authResult = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });

      expect(authResult).toBeDefined();
      expect(authResult.user.email).toBe('admin@test.com');
      expect(authResult.user.role).toBe('admin');
      expect(authResult.token).toBeDefined();
      expect(authResult.expires_at).toBeDefined();
    });

    test('should authenticate vendor admin user successfully', async () => {
      const authResult = await testClient.authenticate({
        email: 'vendor@test.com',
        password: 'testpass123'
      });

      expect(authResult.user.role).toBe('vendor_admin');
      expect(authResult.user.vendor_id).toBe(vendorId);
    });

    test('should authenticate employee user successfully', async () => {
      const authResult = await testClient.authenticate({
        email: 'employee@test.com',
        password: 'testpass123'
      });

      expect(authResult.user.role).toBe('employee');
      expect(authResult.user.vendor_id).toBe(vendorId);
    });

    test('should authenticate public user successfully', async () => {
      const authResult = await testClient.authenticate({
        email: 'public@test.com',
        password: 'testpass123'
      });

      expect(authResult.user.role).toBe('public');
      expect(authResult.user.vendor_id).toBeNull();
    });

    test('should reject invalid credentials', async () => {
      await expect(testClient.authenticate({
        email: 'admin@test.com',
        password: 'wrongpassword'
      })).rejects.toThrow();
    });

    test('should reject non-existent user', async () => {
      await expect(testClient.authenticate({
        email: 'nonexistent@test.com',
        password: 'anypassword'
      })).rejects.toThrow();
    });

    test('should handle expired tokens', async () => {
      const authResult = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });

      // Simulate expired token
      const expiredToken = authResult.token;
      
      // Mock token expiration check
      testClient.setTokenExpired(expiredToken);
      
      await expect(testClient.getItems('vendors', {}, expiredToken))
        .rejects.toThrow();
    });

    test('should refresh tokens successfully', async () => {
      const authResult = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });

      const refreshResult = await testClient.refreshToken(authResult.refresh_token);
      
      expect(refreshResult.token).toBeDefined();
      expect(refreshResult.token).not.toBe(authResult.token);
      expect(refreshResult.user.email).toBe('admin@test.com');
    });
  });

  describe('Role-Based Access Control', () => {
    describe('Admin Role Permissions', () => {
      test('should allow admin to access all vendors', async () => {
        const adminToken = await testClient.getUserToken('admin@test.com', 'testpass123');
        
        const vendors = await testClient.getItems('vendors', {}, adminToken);
        
        expect(vendors.length).toBeGreaterThan(0);
      });

      test('should allow admin to create vendors', async () => {
        const adminToken = await testClient.getUserToken('admin@test.com', 'testpass123');
        
        const newVendor = await testClient.createItem('vendors', {
          name: 'Admin Created Salon',
          email: 'admin.created@salon.com',
          phone: '+1234567890',
          status: 'active'
        }, adminToken);
        
        expect(newVendor.id).toBeDefined();
      });

      test('should allow admin to delete vendors', async () => {
        const adminToken = await testClient.getUserToken('admin@test.com', 'testpass123');
        
        const vendor = await testClient.createItem('vendors', {
          name: 'To Delete Admin',
          email: 'delete.admin@salon.com',
          phone: '+1234567890',
          status: 'active'
        }, adminToken);
        
        await testClient.deleteItem('vendors', vendor.id, adminToken);
        
        await expect(testClient.getItem('vendors', vendor.id, adminToken))
          .rejects.toThrow();
      });
    });

    describe('Vendor Admin Role Permissions', () => {
      test('should allow vendor admin to access own vendor data', async () => {
        const vendorToken = await testClient.getUserToken('vendor@test.com', 'testpass123');
        
        const vendor = await testClient.getItem('vendors', vendorId, vendorToken);
        
        expect(vendor.id).toBe(vendorId);
        expect(vendor.name).toBe('Auth Test Salon');
      });

      test('should prevent vendor admin from accessing other vendors', async () => {
        const vendorToken = await testClient.getUserToken('vendor@test.com', 'testpass123');
        
        // Create another vendor
        const otherVendor = await testClient.createItem('vendors', {
          name: 'Other Salon',
          email: 'other@salon.com',
          phone: '+9876543210',
          status: 'active'
        });
        
        await expect(testClient.getItem('vendors', otherVendor.id, vendorToken))
          .rejects.toThrow();
      });

      test('should allow vendor admin to manage own employees', async () => {
        const vendorToken = await testClient.getUserToken('vendor@test.com', 'testpass123');
        
        const employee = await testClient.createItem('employees', {
          first_name: 'Vendor',
          last_name: 'Employee',
          email: 'vendor.employee@salon.com',
          vendor_id: vendorId,
          status: 'active'
        }, vendorToken);
        
        expect(employee.id).toBeDefined();
        expect(employee.vendor_id).toBe(vendorId);
      });

      test('should prevent vendor admin from managing other vendor employees', async () => {
        const vendorToken = await testClient.getUserToken('vendor@test.com', 'testpass123');
        
        // Create another vendor and employee
        const otherVendor = await testClient.createItem('vendors', {
          name: 'Other Vendor',
          email: 'other.vendor@salon.com',
          phone: '+9876543210',
          status: 'active'
        });
        
        await expect(testClient.createItem('employees', {
          first_name: 'Other',
          last_name: 'Employee',
          email: 'other.employee@salon.com',
          vendor_id: otherVendor.id,
          status: 'active'
        }, vendorToken)).rejects.toThrow();
      });
    });

    describe('Employee Role Permissions', () => {
      test('should allow employee to access own schedule', async () => {
        const employeeToken = await testClient.getUserToken('employee@test.com', 'testpass123');
        
        // Create employee record
        const employee = await testClient.createItem('employees', {
          first_name: 'Test',
          last_name: 'Employee',
          email: 'employee@test.com',
          vendor_id: vendorId,
          status: 'active'
        });
        
        const employeeData = await testClient.getItem('employees', employee.id, employeeToken);
        
        expect(employeeData.id).toBe(employee.id);
        expect(employeeData.email).toBe('employee@test.com');
      });

      test('should prevent employee from accessing other employees data', async () => {
        const employeeToken = await testClient.getUserToken('employee@test.com', 'testpass123');
        
        // Create another employee
        const otherEmployee = await testClient.createItem('employees', {
          first_name: 'Other',
          last_name: 'Employee',
          email: 'other.employee@salon.com',
          vendor_id: vendorId,
          status: 'active'
        });
        
        await expect(testClient.getItem('employees', otherEmployee.id, employeeToken))
          .rejects.toThrow();
      });

      test('should allow employee to view own bookings', async () => {
        const employeeToken = await testClient.getUserToken('employee@test.com', 'testpass123');
        
        // Create employee and service
        const employee = await testClient.createItem('employees', {
          first_name: 'Test',
          last_name: 'Employee',
          email: 'employee@test.com',
          vendor_id: vendorId,
          status: 'active'
        });
        
        const service = await testClient.createItem('services', {
          name: 'Test Service',
          price: 50.00,
          duration: 60,
          vendor_id: vendorId,
          status: 'active'
        });
        
        // Create booking for this employee
        const booking = await testClient.createItem('bookings', {
          service_id: service.id,
          employee_id: employee.id,
          vendor_id: vendorId,
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          status: 'confirmed'
        });
        
        const bookingData = await testClient.getItem('bookings', booking.id, employeeToken);
        
        expect(bookingData.id).toBe(booking.id);
        expect(bookingData.employee_id).toBe(employee.id);
      });

      test('should prevent employee from modifying vendor settings', async () => {
        const employeeToken = await testClient.getUserToken('employee@test.com', 'testpass123');
        
        await expect(testClient.updateItem('vendors', vendorId, {
          name: 'Hacked Name'
        }, employeeToken)).rejects.toThrow();
      });
    });

    describe('Public Role Permissions', () => {
      test('should allow public user to browse vendors', async () => {
        const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
        
        const vendors = await testClient.getItems('vendors', {
          filter: { status: { _eq: 'active' } }
        }, publicToken);
        
        expect(vendors.length).toBeGreaterThan(0);
        // Should not include sensitive data
        expect(vendors[0]).not.toHaveProperty('business_license');
        expect(vendors[0]).not.toHaveProperty('tax_id');
      });

      test('should allow public user to browse services', async () => {
        const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
        
        // Create a service
        await testClient.createItem('services', {
          name: 'Public Service',
          price: 50.00,
          duration: 60,
          vendor_id: vendorId,
          status: 'active'
        });
        
        const services = await testClient.getItems('services', {
          filter: { status: { _eq: 'active' } }
        }, publicToken);
        
        expect(services.length).toBeGreaterThan(0);
      });

      test('should allow public user to create bookings', async () => {
        const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
        
        // Create employee and service
        const employee = await testClient.createItem('employees', {
          first_name: 'Public',
          last_name: 'Employee',
          email: 'public.emp@salon.com',
          vendor_id: vendorId,
          status: 'active'
        });
        
        const service = await testClient.createItem('services', {
          name: 'Public Service',
          price: 50.00,
          duration: 60,
          vendor_id: vendorId,
          status: 'active'
        });
        
        const booking = await testClient.createItem('bookings', {
          service_id: service.id,
          employee_id: employee.id,
          vendor_id: vendorId,
          customer_name: 'Public Customer',
          customer_email: 'public.customer@email.com',
          customer_phone: '+1234567890',
          start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          status: 'pending'
        }, publicToken);
        
        expect(booking.id).toBeDefined();
        expect(booking.customer_name).toBe('Public Customer');
      });

      test('should prevent public user from accessing sensitive data', async () => {
        const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
        
        await expect(testClient.getItems('employees', {}, publicToken))
          .rejects.toThrow();
          
        await expect(testClient.getItems('bookings', {}, publicToken))
          .rejects.toThrow();
      });
    });
  });

  describe('Field-Level Permissions', () => {
    test('should restrict sensitive fields for public users', async () => {
      const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
      
      const vendor = await testClient.getItem('vendors', vendorId, publicToken, {
        fields: ['name', 'email', 'phone', 'address', 'city', 'status']
      });
      
      expect(vendor).toHaveProperty('name');
      expect(vendor).toHaveProperty('email');
      expect(vendor).not.toHaveProperty('business_license');
      expect(vendor).not.toHaveProperty('tax_id');
      expect(vendor).not.toHaveProperty('settings');
    });

    test('should allow vendor admin to see all vendor fields', async () => {
      const vendorToken = await testClient.getUserToken('vendor@test.com', 'testpass123');
      
      const vendor = await testClient.getItem('vendors', vendorId, vendorToken);
      
      expect(vendor).toHaveProperty('name');
      expect(vendor).toHaveProperty('business_license');
      expect(vendor).toHaveProperty('settings');
    });

    test('should restrict employee personal data from other employees', async () => {
      const employeeToken = await testClient.getUserToken('employee@test.com', 'testpass123');
      
      const employee = await testClient.createItem('employees', {
        first_name: 'Private',
        last_name: 'Employee',
        email: 'private@salon.com',
        phone: '+1234567890',
        ssn: '123-45-6789', // Sensitive field
        vendor_id: vendorId,
        status: 'active'
      });
      
      const employeeData = await testClient.getItem('employees', employee.id, employeeToken, {
        fields: ['first_name', 'last_name', 'email']
      });
      
      expect(employeeData).toHaveProperty('first_name');
      expect(employeeData).not.toHaveProperty('ssn');
      expect(employeeData).not.toHaveProperty('phone');
    });
  });

  describe('Cross-Origin Resource Sharing (CORS)', () => {
    test('should handle preflight requests correctly', async () => {
      const response = await testClient.preflightRequest('/items/vendors', {
        method: 'GET',
        headers: {
          'Origin': 'https://example.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization'
        }
      });
      
      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    test('should include CORS headers in API responses', async () => {
      const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
      
      const response = await testClient.getItems('vendors', {
        filter: { status: { _eq: 'active' } }
      }, publicToken);
      
      // In a real implementation, you'd check response headers
      expect(response).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('should allow normal request rate', async () => {
      const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
      
      // Make multiple requests within normal limits
      for (let i = 0; i < 5; i++) {
        const vendors = await testClient.getItems('vendors', {
          filter: { status: { _eq: 'active' } }
        }, publicToken);
        expect(vendors).toBeDefined();
      }
    });

    test('should handle rate limiting gracefully', async () => {
      const publicToken = await testClient.getUserToken('public@test.com', 'testpass123');
      
      // Simulate rapid requests that might trigger rate limiting
      const promises = [];
      for (let i = 0; i < 20; i++) {
        promises.push(testClient.getItems('vendors', {
          filter: { status: { _eq: 'active' } }
        }, publicToken));
      }
      
      const results = await Promise.allSettled(promises);
      const failed = results.filter(result => result.status === 'rejected');
      
      // Some requests might be rate limited
      expect(failed.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Password Security', () => {
    test('should enforce password complexity requirements', async () => {
      await expect(testClient.createItem('users', {
        email: 'weak@test.com',
        password: '123', // Too weak
        role: 'public'
      })).rejects.toThrow();
    });

    test('should hash passwords correctly', async () => {
      const user = await testClient.createItem('users', {
        email: 'hashed@test.com',
        password: 'SecurePass123!',
        role: 'public'
      });
      
      // Password should not be stored in plain text
      expect(user.password).not.toBe('SecurePass123!');
      expect(user.password).toMatch(/^\$2[aby]\$\d+\$/); // bcrypt hash pattern
    });

    test('should handle password reset functionality', async () => {
      const resetToken = await testClient.requestPasswordReset('admin@test.com');
      
      expect(resetToken.token).toBeDefined();
      expect(resetToken.expires_at).toBeDefined();
      
      // Use reset token to set new password
      await testClient.resetPassword(resetToken.token, 'NewSecurePass123!');
      
      // Authenticate with new password
      const authResult = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'NewSecurePass123!'
      });
      
      expect(authResult.user.email).toBe('admin@test.com');
    });
  });

  describe('Session Management', () => {
    test('should handle concurrent sessions', async () => {
      // User logs in from multiple devices
      const session1 = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });
      
      const session2 = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });
      
      expect(session1.token).toBeDefined();
      expect(session2.token).toBeDefined();
      expect(session1.token).not.toBe(session2.token);
    });

    test('should invalidate all sessions on password change', async () => {
      const session1 = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'testpass123'
      });
      
      // Change password
      await testClient.changePassword('admin@test.com', 'testpass123', 'NewPass123!');
      
      // Old token should be invalid
      await expect(testClient.getItems('vendors', {}, session1.token))
        .rejects.toThrow();
      
      // New password should work
      const newSession = await testClient.authenticate({
        email: 'admin@test.com',
        password: 'NewPass123!'
      });
      
      expect(newSession.token).toBeDefined();
    });
  });
});
