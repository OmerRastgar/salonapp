const axios = require('axios');

class SimpleTestClient {
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

  getAuthHeaders(token = null) {
    const authToken = token || this.adminToken;
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }

  async makeRequest(method, endpoint, data = null, useAuth = true) {
    const config = {
      method,
      url: `${this.directusUrl}/${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...(useAuth && this.getAuthHeaders())
      }
    };

    if (data) {
      config.data = data;
    }

    try {
      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  async createTestUser(role, userData = {}) {
    await this.ensureAdminToken();
    
    const defaultUserData = {
      first_name: 'Test',
      last_name: 'User',
      email: `test-${Date.now()}@example.com`,
      role: role,
      ...userData
    };

    return await this.makeRequest('POST', 'users', defaultUserData);
  }

  async createTestVendor(vendorData = {}) {
    await this.ensureAdminToken();
    
    const defaultVendorData = {
      name: `Test Vendor ${Date.now()}`,
      slug: `test-vendor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      ...vendorData
    };

    return await this.makeRequest('POST', 'items/vendors', defaultVendorData);
  }

  async createTestEmployee(vendorId, employeeData = {}) {
    await this.ensureAdminToken();
    
    const defaultEmployeeData = {
      vendor_id: vendorId,
      name: `Test Employee ${Date.now()}`,
      email: `employee-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      timezone: 'UTC',
      ...employeeData
    };

    return await this.makeRequest('POST', 'items/employees', defaultEmployeeData);
  }

  async createTestService(employeeId, serviceData = {}) {
    await this.ensureAdminToken();
    
    const defaultServiceData = {
      employee_id: employeeId,
      name: `Test Service ${Date.now()}`,
      price: 50.00,
      duration_minutes: 30,
      is_active: true,
      sort: 0,
      ...serviceData
    };

    return await this.makeRequest('POST', 'items/employee_services', defaultServiceData);
  }

  async createTestSchedule(employeeId, scheduleData = {}) {
    await this.ensureAdminToken();
    
    const defaultScheduleData = {
      employee_id: employeeId,
      day_of_week: 1, // Monday
      start_time: '09:00',
      end_time: '17:00',
      ...scheduleData
    };

    return await this.makeRequest('POST', 'items/employee_schedules', defaultScheduleData);
  }

  async createTestBooking(bookingData = {}) {
    await this.ensureAdminToken();
    
    const defaultBookingData = {
      booker_email: `customer-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
      booker_name: 'Test Customer',
      start_datetime: new Date().toISOString(),
      end_datetime: new Date(Date.now() + 30 * 60000).toISOString(),
      status: 'pending',
      ...bookingData
    };

    return await this.makeRequest('POST', 'items/bookings', defaultBookingData);
  }

  async cleanupTestData() {
    await this.ensureAdminToken();
    
    try {
      // Clean up test bookings
      await this.makeRequest('DELETE', 'items/bookings', {
        filter: {
          booker_email: { _contains: 'test-' }
        }
      });

      // Clean up test services
      await this.makeRequest('DELETE', 'items/employee_services', {
        filter: {
          name: { _contains: 'Test Service' }
        }
      });

      // Clean up test employees
      await this.makeRequest('DELETE', 'items/employees', {
        filter: {
          name: { _contains: 'Test Employee' }
        }
      });

      // Clean up test vendors
      await this.makeRequest('DELETE', 'items/vendors', {
        filter: {
          name: { _contains: 'Test Vendor' }
        }
      });

      // Clean up test users
      await this.makeRequest('DELETE', 'users', {
        filter: {
          email: { _contains: 'test-' }
        }
      });
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

module.exports = SimpleTestClient;
