const { createDirectus } = require('@directus/sdk');
const axios = require('axios');

class TestClient {
  constructor() {
    this.directusUrl = global.testConfig.directusUrl;
    this.adminToken = null;
  }

  async authenticateAdmin() {
    try {
      const response = await axios.post(`${this.directusUrl}/auth/login`, {
        email: global.testConfig.adminEmail,
        password: global.testConfig.adminPassword
      });
      
      this.adminToken = response.data.data.access_token;
      return this.adminToken;
    } catch (error) {
      throw new Error(`Admin authentication failed: ${error.message}`);
    }
  }

  getDirectusClient(token = null) {
    const client = createDirectus(this.directusUrl);
    if (token) {
      client.setToken(token);
    }
    return client;
  }

  async createTestUser(role, userData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultUserData = {
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      role: role,
      ...userData
    };

    return await client.request(
      createItems('directus_users', defaultUserData)
    );
  }

  async createTestVendor(vendorData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultVendorData = {
      name: `Test Vendor ${Date.now()}`,
      slug: `test-vendor-${Date.now()}`,
      status: 'active',
      ...vendorData
    };

    return await client.request(
      createItems('vendors', defaultVendorData)
    );
  }

  async createTestEmployee(vendorId, employeeData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultEmployeeData = {
      vendor_id: vendorId,
      name: `Test Employee ${Date.now()}`,
      email: `employee-${Date.now()}@example.com`,
      timezone: 'UTC',
      ...employeeData
    };

    return await client.request(
      createItems('employees', defaultEmployeeData)
    );
  }

  async createTestService(employeeId, serviceData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultServiceData = {
      employee_id: employeeId,
      name: `Test Service ${Date.now()}`,
      price: 50.00,
      duration_minutes: 30,
      is_active: true,
      sort: 0,
      ...serviceData
    };

    return await client.request(
      createItems('employee_services', defaultServiceData)
    );
  }

  async createTestSchedule(employeeId, scheduleData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultScheduleData = {
      employee_id: employeeId,
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      ...scheduleData
    };

    return await client.request(
      createItems('employee_schedules', defaultScheduleData)
    );
  }

  async createTestBooking(bookingData = {}) {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    const defaultBookingData = {
      booker_email: `customer-${Date.now()}@example.com`,
      booker_name: 'Test Customer',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'pending',
      ...bookingData
    };

    return await client.request(
      createItems('bookings', defaultBookingData)
    );
  }

  async cleanupTestData() {
    await this.ensureAdminToken();
    
    const client = this.getDirectusClient(this.adminToken);
    
    try {
      // Clean up test bookings
      await client.request(
        deleteItems('bookings', {
          filter: {
            booker_email: { _contains: 'test-' }
          }
        })
      );

      // Clean up test schedules
      await client.request(
        deleteItems('employee_schedules', {
          filter: {
            employee: {
              name: { _contains: 'Test Employee' }
            }
          }
        })
      );

      // Clean up test services
      await client.request(
        deleteItems('employee_services', {
          filter: {
            name: { _contains: 'Test Service' }
          }
        })
      );

      // Clean up test employees
      await client.request(
        deleteItems('employees', {
          filter: {
            name: { _contains: 'Test Employee' }
          }
        })
      );

      // Clean up test vendors
      await client.request(
        deleteItems('vendors', {
          filter: {
            name: { _contains: 'Test Vendor' }
          }
        })
      );

      // Clean up test users
      await client.request(
        deleteItems('directus_users', {
          filter: {
            email: { _contains: 'test-' }
          }
        })
      );
    } catch (error) {
      console.warn('Cleanup warning:', error.message);
    }
  }

  async ensureAdminToken() {
    if (!this.adminToken) {
      await this.authenticateAdmin();
    }
    return this.adminToken;
  }
}

module.exports = TestClient;
