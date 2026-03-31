/**
 * Services Collection API Integration Tests
 * Tests for Directus services collection CRUD operations
 */

const { createDirectusTestClient } = require('../../utils/test-client');
const { getTestData } = require('../../fixtures/test-data');

describe('Services API Integration', () => {
  let testClient;
  let testData;
  let vendorId;
  let serviceIds = [];

  beforeAll(async () => {
    testClient = await createDirectusTestClient();
    testData = getTestData();
    
    // Create test vendor
    const vendor = await testClient.createItem('vendors', {
      name: 'Test Salon',
      email: 'test@salon.com',
      phone: '+1234567890',
      address: '123 Test St',
      status: 'active'
    });
    vendorId = vendor.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await testClient.cleanupTestData();
  });

  beforeEach(async () => {
    // Cleanup any existing services for this vendor
    const existingServices = await testClient.getItems('services', {
      filter: { vendor_id: { _eq: vendorId } }
    });
    
    for (const service of existingServices) {
      await testClient.deleteItem('services', service.id);
    }
    serviceIds = [];
  });

  describe('POST /services - Create Service', () => {
    test('should create a basic service successfully', async () => {
      const serviceData = {
        name: 'Haircut',
        description: 'Professional haircut service',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        category: 'hair',
        status: 'active'
      };

      const response = await testClient.createItem('services', serviceData);
      
      expect(response).toBeDefined();
      expect(response.name).toBe(serviceData.name);
      expect(response.price).toBe(serviceData.price);
      expect(response.vendor_id).toBe(vendorId);
      expect(response.id).toBeDefined();
      
      serviceIds.push(response.id);
    });

    test('should create service with advanced options', async () => {
      const serviceData = {
        name: 'Premium Hair Coloring',
        description: 'Full hair coloring with premium products',
        price: 120.00,
        duration: 180,
        vendor_id: vendorId,
        category: 'hair',
        status: 'active',
        max_concurrent_bookings: 2,
        min_advance_booking_hours: 24,
        buffer_time: 15,
        required_skills: ['hair_coloring', 'color_theory'],
        images: ['coloring1.jpg', 'coloring2.jpg']
      };

      const response = await testClient.createItem('services', serviceData);
      
      expect(response.max_concurrent_bookings).toBe(2);
      expect(response.min_advance_booking_hours).toBe(24);
      expect(response.buffer_time).toBe(15);
      expect(response.required_skills).toEqual(['hair_coloring', 'color_theory']);
      expect(response.images).toEqual(['coloring1.jpg', 'coloring2.jpg']);
      
      serviceIds.push(response.id);
    });

    test('should validate required fields', async () => {
      const invalidServiceData = {
        description: 'Missing required fields'
        // Missing name, price, duration, vendor_id
      };

      await expect(testClient.createItem('services', invalidServiceData))
        .rejects.toThrow();
    });

    test('should enforce price validation', async () => {
      const invalidServiceData = {
        name: 'Invalid Service',
        description: 'Service with invalid price',
        price: -10.00, // Negative price
        duration: 60,
        vendor_id: vendorId
      };

      await expect(testClient.createItem('services', invalidServiceData))
        .rejects.toThrow();
    });

    test('should enforce duration validation', async () => {
      const invalidServiceData = {
        name: 'Invalid Service',
        description: 'Service with invalid duration',
        price: 50.00,
        duration: 0, // Zero duration
        vendor_id: vendorId
      };

      await expect(testClient.createItem('services', invalidServiceData))
        .rejects.toThrow();
    });
  });

  describe('GET /services - Read Services', () => {
    beforeEach(async () => {
      // Create test services
      const services = [
        {
          name: 'Haircut',
          price: 50.00,
          duration: 60,
          vendor_id: vendorId,
          category: 'hair',
          status: 'active'
        },
        {
          name: 'Beard Trim',
          price: 25.00,
          duration: 30,
          vendor_id: vendorId,
          category: 'hair',
          status: 'active'
        },
        {
          name: 'Shave',
          price: 35.00,
          duration: 45,
          vendor_id: vendorId,
          category: 'hair',
          status: 'inactive'
        }
      ];

      for (const service of services) {
        const created = await testClient.createItem('services', service);
        serviceIds.push(created.id);
      }
    });

    test('should retrieve all services for vendor', async () => {
      const response = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      expect(response).toHaveLength(3);
      expect(response.map(s => s.name)).toContain('Haircut');
      expect(response.map(s => s.name)).toContain('Beard Trim');
      expect(response.map(s => s.name)).toContain('Shave');
    });

    test('should filter services by status', async () => {
      const activeServices = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          status: { _eq: 'active' }
        }
      });

      expect(activeServices).toHaveLength(2);
      expect(activeServices.every(s => s.status === 'active')).toBe(true);
    });

    test('should filter services by category', async () => {
      const hairServices = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          category: { _eq: 'hair' }
        }
      });

      expect(hairServices).toHaveLength(3);
      expect(hairServices.every(s => s.category === 'hair')).toBe(true);
    });

    test('should filter services by price range', async () => {
      const midRangeServices = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          price: { _between: [30, 60] }
        }
      });

      expect(midRangeServices).toHaveLength(2);
      expect(midRangeServices.every(s => s.price >= 30 && s.price <= 60)).toBe(true);
    });

    test('should sort services by price', async () => {
      const sortedServices = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } },
        sort: ['price']
      });

      expect(sortedServices[0].price).toBe(25.00); // Beard Trim
      expect(sortedServices[1].price).toBe(35.00); // Shave
      expect(sortedServices[2].price).toBe(50.00); // Haircut
    });

    test('should support pagination', async () => {
      const firstPage = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } },
        limit: 2,
        offset: 0
      });

      const secondPage = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } },
        limit: 2,
        offset: 2
      });

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(1);
      expect([...firstPage, ...secondPage]).toHaveLength(3);
    });

    test('should include related vendor data', async () => {
      const servicesWithVendor = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } },
        fields: ['*', 'vendor.name', 'vendor.email']
      });

      expect(servicesWithVendor[0].vendor).toBeDefined();
      expect(servicesWithVendor[0].vendor.name).toBe('Test Salon');
    });
  });

  describe('GET /services/:id - Read Single Service', () => {
    let serviceId;

    beforeEach(async () => {
      const service = await testClient.createItem('services', {
        name: 'Test Service',
        description: 'Test description',
        price: 75.00,
        duration: 90,
        vendor_id: vendorId,
        category: 'test',
        status: 'active'
      });
      serviceId = service.id;
      serviceIds.push(serviceId);
    });

    test('should retrieve single service by ID', async () => {
      const response = await testClient.getItem('services', serviceId);

      expect(response).toBeDefined();
      expect(response.id).toBe(serviceId);
      expect(response.name).toBe('Test Service');
      expect(response.price).toBe(75.00);
    });

    test('should return 404 for non-existent service', async () => {
      await expect(testClient.getItem('services', 99999))
        .rejects.toThrow();
    });
  });

  describe('PATCH /services/:id - Update Service', () => {
    let serviceId;

    beforeEach(async () => {
      const service = await testClient.createItem('services', {
        name: 'Original Service',
        description: 'Original description',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        category: 'test',
        status: 'active'
      });
      serviceId = service.id;
      serviceIds.push(serviceId);
    });

    test('should update service basic fields', async () => {
      const updateData = {
        name: 'Updated Service',
        description: 'Updated description',
        price: 65.00
      };

      const response = await testClient.updateItem('services', serviceId, updateData);

      expect(response.name).toBe('Updated Service');
      expect(response.description).toBe('Updated description');
      expect(response.price).toBe(65.00);
      expect(response.duration).toBe(60); // Unchanged
    });

    test('should update service status', async () => {
      const response = await testClient.updateItem('services', serviceId, {
        status: 'inactive'
      });

      expect(response.status).toBe('inactive');
    });

    test('should add and remove required skills', async () => {
      // Add skills
      const response1 = await testClient.updateItem('services', serviceId, {
        required_skills: ['skill1', 'skill2']
      });
      expect(response1.required_skills).toEqual(['skill1', 'skill2']);

      // Remove skills
      const response2 = await testClient.updateItem('services', serviceId, {
        required_skills: ['skill1']
      });
      expect(response2.required_skills).toEqual(['skill1']);
    });

    test('should validate update data', async () => {
      await expect(testClient.updateItem('services', serviceId, {
        price: -10.00 // Invalid negative price
      })).rejects.toThrow();
    });
  });

  describe('DELETE /services/:id - Delete Service', () => {
    let serviceId;

    beforeEach(async () => {
      const service = await testClient.createItem('services', {
        name: 'Service to Delete',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        category: 'test',
        status: 'active'
      });
      serviceId = service.id;
    });

    test('should delete service successfully', async () => {
      await testClient.deleteItem('services', serviceId);

      // Verify service is deleted
      await expect(testClient.getItem('services', serviceId))
        .rejects.toThrow();
    });

    test('should prevent deletion of service with active bookings', async () => {
      // Create a booking for this service
      const employee = await testClient.createItem('employees', {
        name: 'Test Employee',
        email: 'employee@test.com',
        vendor_id: vendorId
      });

      await testClient.createItem('bookings', {
        service_id: serviceId,
        employee_id: employee.id,
        vendor_id: vendorId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed'
      });

      await expect(testClient.deleteItem('services', serviceId))
        .rejects.toThrow();
    });
  });

  describe('Service Search and Filtering', () => {
    beforeEach(async () => {
      const services = [
        { name: 'Men\'s Haircut', description: 'Haircut for men', price: 40, category: 'hair' },
        { name: 'Women\'s Haircut', description: 'Haircut for women', price: 60, category: 'hair' },
        { name: 'Beard Trim', description: 'Beard trimming service', price: 25, category: 'facial' },
        { name: 'Hair Coloring', description: 'Full hair coloring', price: 100, category: 'color' }
      ];

      for (const service of services) {
        const created = await testClient.createItem('services', {
          ...service,
          duration: 60,
          vendor_id: vendorId,
          status: 'active'
        });
        serviceIds.push(created.id);
      }
    });

    test('should search services by name', async () => {
      const searchResults = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          name: { _contains: 'Haircut' }
        }
      });

      expect(searchResults).toHaveLength(2);
      expect(searchResults.map(s => s.name)).toContain('Men\'s Haircut');
      expect(searchResults.map(s => s.name)).toContain('Women\'s Haircut');
    });

    test('should search services by description', async () => {
      const searchResults = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          description: { _contains: 'coloring' }
        }
      });

      expect(searchResults).toHaveLength(1);
      expect(searchResults[0].name).toBe('Hair Coloring');
    });

    test('should combine multiple filters', async () => {
      const filteredResults = await testClient.getItems('services', {
        filter: {
          vendor_id: { _eq: vendorId },
          category: { _eq: 'hair' },
          price: { _lte: 50 }
        }
      });

      expect(filteredResults).toHaveLength(1);
      expect(filteredResults[0].name).toBe('Men\'s Haircut');
    });
  });

  describe('Vendor Isolation', () => {
    let otherVendorId;
    let otherServiceId;

    beforeEach(async () => {
      // Create another vendor
      const otherVendor = await testClient.createItem('vendors', {
        name: 'Other Salon',
        email: 'other@salon.com',
        status: 'active'
      });
      otherVendorId = otherVendor.id;

      // Create service for other vendor
      const otherService = await testClient.createItem('services', {
        name: 'Other Service',
        price: 50.00,
        duration: 60,
        vendor_id: otherVendorId,
        category: 'test',
        status: 'active'
      });
      otherServiceId = otherService.id;
    });

    test('should only return services for specific vendor', async () => {
      const vendor1Services = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      const vendor2Services = await testClient.getItems('services', {
        filter: { vendor_id: { _eq: otherVendorId } }
      });

      expect(vendor1Services.every(s => s.vendor_id === vendorId)).toBe(true);
      expect(vendor2Services.every(s => s.vendor_id === otherVendorId)).toBe(true);
      expect(vendor1Services.length !== vendor2Services.length).toBe(true);
    });

    test('should prevent cross-vendor service access', async () => {
      // Try to access other vendor's service
      await expect(testClient.getItem('services', otherServiceId))
        .rejects.toThrow();
    });
  });
});
