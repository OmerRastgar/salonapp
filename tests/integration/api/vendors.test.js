/**
 * Vendors Collection API Integration Tests
 * Tests for Directus vendors collection CRUD operations
 */

const { createDirectusTestClient } = require('../../utils/test-client');
const { getTestData } = require('../../fixtures/test-data');

describe('Vendors API Integration', () => {
  let testClient;
  let testData;
  let vendorIds = [];

  beforeAll(async () => {
    testClient = await createDirectusTestClient();
    testData = getTestData();
  });

  afterAll(async () => {
    // Cleanup test data
    await testClient.cleanupTestData();
  });

  beforeEach(async () => {
    // Cleanup any existing vendors
    const existingVendors = await testClient.getItems('vendors', {
      filter: { name: { _starts_with: 'Test' } }
    });
    
    for (const vendor of existingVendors) {
      await testClient.deleteItem('vendors', vendor.id);
    }
    vendorIds = [];
  });

  describe('POST /vendors - Create Vendor', () => {
    test('should create a basic vendor successfully', async () => {
      const vendorData = {
        name: 'Test Salon',
        email: 'test@salon.com',
        phone: '+1234567890',
        address: '123 Test Street',
        city: 'Test City',
        state: 'TS',
        zip_code: '12345',
        country: 'Test Country',
        status: 'active'
      };

      const response = await testClient.createItem('vendors', vendorData);
      
      expect(response).toBeDefined();
      expect(response.name).toBe(vendorData.name);
      expect(response.email).toBe(vendorData.email);
      expect(response.phone).toBe(vendorData.phone);
      expect(response.status).toBe('active');
      expect(response.id).toBeDefined();
      
      vendorIds.push(response.id);
    });

    test('should create vendor with detailed business information', async () => {
      const vendorData = {
        name: 'Premium Salon',
        email: 'premium@salon.com',
        phone: '+1234567890',
        address: '456 Premium Ave',
        city: 'Luxury City',
        state: 'LC',
        zip_code: '54321',
        country: 'Premium Country',
        website: 'https://premiumsalon.com',
        description: 'A premium salon offering luxury services',
        business_license: 'BL-123456',
        tax_id: 'TX-789012',
        status: 'active',
        settings: {
          booking_confirmation_required: true,
          auto_reminders: true,
          cancellation_policy: '24_hours',
          payment_methods: ['cash', 'card', 'online']
        }
      };

      const response = await testClient.createItem('vendors', vendorData);
      
      expect(response.website).toBe(vendorData.website);
      expect(response.description).toBe(vendorData.description);
      expect(response.business_license).toBe(vendorData.business_license);
      expect(response.settings.booking_confirmation_required).toBe(true);
      expect(response.settings.payment_methods).toEqual(['cash', 'card', 'online']);
      
      vendorIds.push(response.id);
    });

    test('should create vendor with operating hours', async () => {
      const vendorData = {
        name: 'Hours Test Salon',
        email: 'hours@salon.com',
        phone: '+1234567890',
        address: '789 Hours St',
        status: 'active',
        operating_hours: {
          monday: { open: '09:00', close: '18:00', is_open: true },
          tuesday: { open: '09:00', close: '18:00', is_open: true },
          wednesday: { open: '09:00', close: '18:00', is_open: true },
          thursday: { open: '09:00', close: '18:00', is_open: true },
          friday: { open: '09:00', close: '20:00', is_open: true },
          saturday: { open: '10:00', close: '16:00', is_open: true },
          sunday: { is_open: false }
        }
      };

      const response = await testClient.createItem('vendors', vendorData);
      
      expect(response.operating_hours.monday.open).toBe('09:00');
      expect(response.operating_hours.friday.close).toBe('20:00');
      expect(response.operating_hours.sunday.is_open).toBe(false);
      
      vendorIds.push(response.id);
    });

    test('should validate required fields', async () => {
      const invalidVendorData = {
        phone: '+1234567890'
        // Missing name, email
      };

      await expect(testClient.createItem('vendors', invalidVendorData))
        .rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidVendorData = {
        name: 'Invalid Email Salon',
        email: 'invalid-email-format',
        phone: '+1234567890'
      };

      await expect(testClient.createItem('vendors', invalidVendorData))
        .rejects.toThrow();
    });

    test('should enforce unique email', async () => {
      const vendorData = {
        name: 'First Salon',
        email: 'duplicate@salon.com',
        phone: '+1234567890',
        status: 'active'
      };

      // Create first vendor
      await testClient.createItem('vendors', vendorData);

      // Try to create second vendor with same email
      const duplicateData = {
        name: 'Second Salon',
        email: 'duplicate@salon.com', // Same email
        phone: '+9876543210',
        status: 'active'
      };

      await expect(testClient.createItem('vendors', duplicateData))
        .rejects.toThrow();
    });
  });

  describe('GET /vendors - Read Vendors', () => {
    beforeEach(async () => {
      // Create test vendors
      const vendors = [
        {
          name: 'Active Salon 1',
          email: 'active1@salon.com',
          phone: '+1111111111',
          status: 'active',
          city: 'City A'
        },
        {
          name: 'Active Salon 2',
          email: 'active2@salon.com',
          phone: '+2222222222',
          status: 'active',
          city: 'City B'
        },
        {
          name: 'Inactive Salon',
          email: 'inactive@salon.com',
          phone: '+3333333333',
          status: 'inactive',
          city: 'City C'
        }
      ];

      for (const vendor of vendors) {
        const created = await testClient.createItem('vendors', vendor);
        vendorIds.push(created.id);
      }
    });

    test('should retrieve all vendors', async () => {
      const response = await testClient.getItems('vendors');

      expect(response.length).toBeGreaterThanOrEqual(3);
      expect(response.map(v => v.name)).toContain('Active Salon 1');
      expect(response.map(v => v.name)).toContain('Active Salon 2');
      expect(response.map(v => v.name)).toContain('Inactive Salon');
    });

    test('should filter vendors by status', async () => {
      const activeVendors = await testClient.getItems('vendors', {
        filter: { status: { _eq: 'active' } }
      });

      expect(activeVendors.every(v => v.status === 'active')).toBe(true);
      expect(activeVendors.length).toBeGreaterThanOrEqual(2);
    });

    test('should filter vendors by city', async () => {
      const cityVendors = await testClient.getItems('vendors', {
        filter: { city: { _eq: 'City A' } }
      });

      expect(cityVendors).toHaveLength(1);
      expect(cityVendors[0].name).toBe('Active Salon 1');
    });

    test('should search vendors by name', async () => {
      const searchResults = await testClient.getItems('vendors', {
        filter: { name: { _contains: 'Active' } }
      });

      expect(searchResults.length).toBeGreaterThanOrEqual(2);
      expect(searchResults.every(v => v.name.includes('Active'))).toBe(true);
    });

    test('should sort vendors by name', async () => {
      const sortedVendors = await testClient.getItems('vendors', {
        sort: ['name']
      });

      const names = sortedVendors.map(v => v.name);
      expect(names).toEqual([...names].sort());
    });

    test('should support pagination', async () => {
      const firstPage = await testClient.getItems('vendors', {
        limit: 2,
        offset: 0
      });

      const secondPage = await testClient.getItems('vendors', {
        limit: 2,
        offset: 2
      });

      expect(firstPage.length).toBeLessThanOrEqual(2);
      expect(secondPage.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /vendors/:id - Read Single Vendor', () => {
    let vendorId;

    beforeEach(async () => {
      const vendor = await testClient.createItem('vendors', {
        name: 'Single Test Salon',
        email: 'single@salon.com',
        phone: '+1234567890',
        address: '123 Single St',
        status: 'active',
        description: 'A single test vendor'
      });
      vendorId = vendor.id;
      vendorIds.push(vendorId);
    });

    test('should retrieve single vendor by ID', async () => {
      const response = await testClient.getItem('vendors', vendorId);

      expect(response).toBeDefined();
      expect(response.id).toBe(vendorId);
      expect(response.name).toBe('Single Test Salon');
      expect(response.email).toBe('single@salon.com');
    });

    test('should return 404 for non-existent vendor', async () => {
      await expect(testClient.getItem('vendors', 99999))
        .rejects.toThrow();
    });

    test('should include related data', async () => {
      // Create related employees and services
      await testClient.createItem('employees', {
        first_name: 'Test',
        last_name: 'Employee',
        email: 'emp@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });

      await testClient.createItem('services', {
        name: 'Test Service',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        status: 'active'
      });

      const vendorWithRelations = await testClient.getItem('vendors', vendorId, {
        fields: ['*', 'employees.count', 'services.count']
      });

      expect(vendorWithRelations.employees).toBeDefined();
      expect(vendorWithRelations.services).toBeDefined();
    });
  });

  describe('PATCH /vendors/:id - Update Vendor', () => {
    let vendorId;

    beforeEach(async () => {
      const vendor = await testClient.createItem('vendors', {
        name: 'Original Salon',
        email: 'original@salon.com',
        phone: '+1234567890',
        address: '123 Original St',
        status: 'active'
      });
      vendorId = vendor.id;
      vendorIds.push(vendorId);
    });

    test('should update vendor basic fields', async () => {
      const updateData = {
        name: 'Updated Salon',
        phone: '+9876543210',
        address: '456 Updated St'
      };

      const response = await testClient.updateItem('vendors', vendorId, updateData);

      expect(response.name).toBe('Updated Salon');
      expect(response.phone).toBe('+9876543210');
      expect(response.address).toBe('456 Updated St');
      expect(response.email).toBe('original@salon.com'); // Unchanged
    });

    test('should update vendor status', async () => {
      const response = await testClient.updateItem('vendors', vendorId, {
        status: 'inactive'
      });

      expect(response.status).toBe('inactive');
    });

    test('should update vendor settings', async () => {
      const newSettings = {
        booking_confirmation_required: false,
        auto_reminders: true,
        cancellation_policy: '12_hours',
        payment_methods: ['card', 'online']
      };

      const response = await testClient.updateItem('vendors', vendorId, {
        settings: newSettings
      });

      expect(response.settings.booking_confirmation_required).toBe(false);
      expect(response.settings.cancellation_policy).toBe('12_hours');
      expect(response.settings.payment_methods).toEqual(['card', 'online']);
    });

    test('should update operating hours', async () => {
      const newOperatingHours = {
        monday: { open: '08:00', close: '19:00', is_open: true },
        sunday: { open: '10:00', close: '15:00', is_open: true }
      };

      const response = await testClient.updateItem('vendors', vendorId, {
        operating_hours: newOperatingHours
      });

      expect(response.operating_hours.monday.open).toBe('08:00');
      expect(response.operating_hours.sunday.is_open).toBe(true);
    });

    test('should validate update data', async () => {
      await expect(testClient.updateItem('vendors', vendorId, {
        email: 'invalid-email-format'
      })).rejects.toThrow();
    });
  });

  describe('DELETE /vendors/:id - Delete Vendor', () => {
    let vendorId;

    beforeEach(async () => {
      const vendor = await testClient.createItem('vendors', {
        name: 'To Delete',
        email: 'delete@salon.com',
        phone: '+1234567890',
        status: 'active'
      });
      vendorId = vendor.id;
      vendorIds.push(vendorId);
    });

    test('should delete vendor successfully', async () => {
      await testClient.deleteItem('vendors', vendorId);

      // Verify vendor is deleted
      await expect(testClient.getItem('vendors', vendorId))
        .rejects.toThrow();
    });

    test('should prevent deletion of vendor with active employees', async () => {
      // Create an employee for this vendor
      await testClient.createItem('employees', {
        first_name: 'Test',
        last_name: 'Employee',
        email: 'emp@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });

      await expect(testClient.deleteItem('vendors', vendorId))
        .rejects.toThrow();
    });

    test('should prevent deletion of vendor with active bookings', async () => {
      // Create employee and service first
      const employee = await testClient.createItem('employees', {
        first_name: 'Test',
        last_name: 'Employee',
        email: 'emp@salon.com',
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

      // Create a booking for this vendor
      await testClient.createItem('bookings', {
        service_id: service.id,
        employee_id: employee.id,
        vendor_id: vendorId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed'
      });

      await expect(testClient.deleteItem('vendors', vendorId))
        .rejects.toThrow();
    });
  });

  describe('Vendor Analytics and Metrics', () => {
    let vendorId;
    let employeeId;
    let serviceId;

    beforeEach(async () => {
      // Create vendor
      const vendor = await testClient.createItem('vendors', {
        name: 'Analytics Salon',
        email: 'analytics@salon.com',
        phone: '+1234567890',
        status: 'active'
      });
      vendorId = vendor.id;
      vendorIds.push(vendorId);

      // Create employee
      const employee = await testClient.createItem('employees', {
        first_name: 'Analytics',
        last_name: 'Employee',
        email: 'analytics.emp@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });
      employeeId = employee.id;

      // Create service
      const service = await testClient.createItem('services', {
        name: 'Analytics Service',
        price: 75.00,
        duration: 60,
        vendor_id: vendorId,
        status: 'active'
      });
      serviceId = service.id;
    });

    test('should track vendor booking metrics', async () => {
      // Create multiple bookings with different statuses
      await testClient.createItem('bookings', {
        service_id: serviceId,
        employee_id: employeeId,
        vendor_id: vendorId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed',
        total_price: 75.00
      });

      await testClient.createItem('bookings', {
        service_id: serviceId,
        employee_id: employeeId,
        vendor_id: vendorId,
        start_time: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
        status: 'completed',
        total_price: 75.00
      });

      // Query bookings for this vendor
      const vendorBookings = await testClient.getItems('bookings', {
        filter: { vendor_id: { _eq: vendorId } },
        fields: ['status', 'total_price']
      });

      expect(vendorBookings).toHaveLength(2);
      
      const totalRevenue = vendorBookings.reduce((sum, booking) => sum + booking.total_price, 0);
      expect(totalRevenue).toBe(150.00);
    });

    test('should count vendor employees and services', async () => {
      // Create additional employees and services
      await testClient.createItem('employees', {
        first_name: 'Second',
        last_name: 'Employee',
        email: 'second@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });

      await testClient.createItem('services', {
        name: 'Second Service',
        price: 50.00,
        duration: 45,
        vendor_id: vendorId,
        status: 'active'
      });

      // Count employees
      const employees = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      // Count services
      const services = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      expect(employees).toHaveLength(2);
      expect(services).toHaveLength(2);
    });
  });

  describe('Vendor Search and Discovery', () => {
    beforeEach(async () => {
      const vendors = [
        {
          name: 'Hair Studio Downtown',
          email: 'downtown@salon.com',
          phone: '+1111111111',
          status: 'active',
          city: 'Downtown',
          description: 'Professional hair services in downtown area'
        },
        {
          name: 'Spa & Wellness Center',
          email: 'spa@salon.com',
          phone: '+2222222222',
          status: 'active',
          city: 'Uptown',
          description: 'Full service spa and wellness treatments'
        },
        {
          name: 'Quick Cuts Express',
          email: 'express@salon.com',
          phone: '+3333333333',
          status: 'active',
          city: 'Midtown',
          description: 'Fast and affordable haircuts'
        }
      ];

      for (const vendor of vendors) {
        const created = await testClient.createItem('vendors', vendor);
        vendorIds.push(created.id);
      }
    });

    test('should search vendors by description', async () => {
      const searchResults = await testClient.getItems('vendors', {
        filter: {
          description: { _contains: 'hair' }
        }
      });

      expect(searchResults.length).toBeGreaterThanOrEqual(2);
      expect(searchResults.every(v => v.description.includes('hair'))).toBe(true);
    });

    test('should filter vendors by multiple cities', async () => {
      const cityResults = await testClient.getItems('vendors', {
        filter: {
          city: { _in: ['Downtown', 'Uptown'] }
        }
      });

      expect(cityResults.length).toBe(2);
      expect(cityResults.map(v => v.city)).toEqual(expect.arrayContaining(['Downtown', 'Uptown']));
    });

    test('should combine search and filters', async () => {
      const combinedResults = await testClient.getItems('vendors', {
        filter: {
          status: { _eq: 'active' },
          name: { _contains: 'Studio' }
        }
      });

      expect(combinedResults).toHaveLength(1);
      expect(combinedResults[0].name).toBe('Hair Studio Downtown');
    });
  });
});
