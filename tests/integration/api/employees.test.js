/**
 * Employees Collection API Integration Tests
 * Tests for Directus employees collection CRUD operations
 */

const { createDirectusTestClient } = require('../../utils/test-client');
const { getTestData } = require('../../fixtures/test-data');

describe('Employees API Integration', () => {
  let testClient;
  let testData;
  let vendorId;
  let employeeIds = [];

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
    // Cleanup any existing employees for this vendor
    const existingEmployees = await testClient.getItems('employees', {
      filter: { vendor_id: { _eq: vendorId } }
    });
    
    for (const employee of existingEmployees) {
      await testClient.deleteItem('employees', employee.id);
    }
    employeeIds = [];
  });

  describe('POST /employees - Create Employee', () => {
    test('should create a basic employee successfully', async () => {
      const employeeData = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@salon.com',
        phone: '+1234567890',
        vendor_id: vendorId,
        status: 'active'
      };

      const response = await testClient.createItem('employees', employeeData);
      
      expect(response).toBeDefined();
      expect(response.first_name).toBe(employeeData.first_name);
      expect(response.last_name).toBe(employeeData.last_name);
      expect(response.email).toBe(employeeData.email);
      expect(response.vendor_id).toBe(vendorId);
      expect(response.id).toBeDefined();
      
      employeeIds.push(response.id);
    });

    test('should create employee with work hours', async () => {
      const employeeData = {
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@salon.com',
        vendor_id: vendorId,
        status: 'active',
        work_hours: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { start: '10:00', end: '16:00', available: true },
          sunday: { available: false }
        }
      };

      const response = await testClient.createItem('employees', employeeData);
      
      expect(response.work_hours).toBeDefined();
      expect(response.work_hours.monday.start).toBe('09:00');
      expect(response.work_hours.sunday.available).toBe(false);
      
      employeeIds.push(response.id);
    });

    test('should create employee with skills', async () => {
      const employeeData = {
        first_name: 'Bob',
        last_name: 'Johnson',
        email: 'bob.johnson@salon.com',
        vendor_id: vendorId,
        status: 'active',
        skills: ['haircut', 'beard_trim', 'styling']
      };

      const response = await testClient.createItem('employees', employeeData);
      
      expect(response.skills).toEqual(['haircut', 'beard_trim', 'styling']);
      
      employeeIds.push(response.id);
    });

    test('should create employee with split shifts', async () => {
      const employeeData = {
        first_name: 'Alice',
        last_name: 'Brown',
        email: 'alice.brown@salon.com',
        vendor_id: vendorId,
        status: 'active',
        work_hours: {
          monday: [
            { start: '09:00', end: '12:00', available: true },
            { start: '13:00', end: '17:00', available: true }
          ]
        }
      };

      const response = await testClient.createItem('employees', employeeData);
      
      expect(Array.isArray(response.work_hours.monday)).toBe(true);
      expect(response.work_hours.monday).toHaveLength(2);
      
      employeeIds.push(response.id);
    });

    test('should validate required fields', async () => {
      const invalidEmployeeData = {
        email: 'missing.fields@salon.com'
        // Missing first_name, last_name, vendor_id
      };

      await expect(testClient.createItem('employees', invalidEmployeeData))
        .rejects.toThrow();
    });

    test('should validate email format', async () => {
      const invalidEmployeeData = {
        first_name: 'Invalid',
        last_name: 'Email',
        email: 'invalid-email-format',
        vendor_id: vendorId
      };

      await expect(testClient.createItem('employees', invalidEmployeeData))
        .rejects.toThrow();
    });

    test('should enforce unique email within vendor', async () => {
      const employeeData = {
        first_name: 'First',
        last_name: 'Employee',
        email: 'duplicate@salon.com',
        vendor_id: vendorId,
        status: 'active'
      };

      // Create first employee
      await testClient.createItem('employees', employeeData);

      // Try to create second employee with same email
      const duplicateData = {
        first_name: 'Second',
        last_name: 'Employee',
        email: 'duplicate@salon.com', // Same email
        vendor_id: vendorId,
        status: 'active'
      };

      await expect(testClient.createItem('employees', duplicateData))
        .rejects.toThrow();
    });
  });

  describe('GET /employees - Read Employees', () => {
    beforeEach(async () => {
      // Create test employees
      const employees = [
        {
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@salon.com',
          vendor_id: vendorId,
          status: 'active',
          skills: ['haircut', 'styling']
        },
        {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@salon.com',
          vendor_id: vendorId,
          status: 'active',
          skills: ['hair_coloring', 'styling']
        },
        {
          first_name: 'Bob',
          last_name: 'Johnson',
          email: 'bob.johnson@salon.com',
          vendor_id: vendorId,
          status: 'inactive',
          skills: ['massage']
        }
      ];

      for (const employee of employees) {
        const created = await testClient.createItem('employees', employee);
        employeeIds.push(created.id);
      }
    });

    test('should retrieve all employees for vendor', async () => {
      const response = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      expect(response).toHaveLength(3);
      expect(response.map(e => e.first_name)).toContain('John');
      expect(response.map(e => e.first_name)).toContain('Jane');
      expect(response.map(e => e.first_name)).toContain('Bob');
    });

    test('should filter employees by status', async () => {
      const activeEmployees = await testClient.getItems('employees', {
        filter: {
          vendor_id: { _eq: vendorId },
          status: { _eq: 'active' }
        }
      });

      expect(activeEmployees).toHaveLength(2);
      expect(activeEmployees.every(e => e.status === 'active')).toBe(true);
    });

    test('should filter employees by skills', async () => {
      const stylingEmployees = await testClient.getItems('employees', {
        filter: {
          vendor_id: { _eq: vendorId },
          skills: { _contains: 'styling' }
        }
      });

      expect(stylingEmployees).toHaveLength(2);
      expect(stylingEmployees.every(e => e.skills.includes('styling'))).toBe(true);
    });

    test('should search employees by name', async () => {
      const searchResults = await testClient.getItems('employees', {
        filter: {
          vendor_id: { _eq: vendorId },
          first_name: { _contains: 'J' }
        }
      });

      expect(searchResults).toHaveLength(2);
      expect(searchResults.map(e => e.first_name)).toContain('John');
      expect(searchResults.map(e => e.first_name)).toContain('Jane');
    });

    test('should sort employees by last name', async () => {
      const sortedEmployees = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: vendorId } },
        sort: ['last_name']
      });

      expect(sortedEmployees[0].last_name).toBe('Doe');
      expect(sortedEmployees[1].last_name).toBe('Johnson');
      expect(sortedEmployees[2].last_name).toBe('Smith');
    });

    test('should include related vendor data', async () => {
      const employeesWithVendor = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: vendorId } },
        fields: ['*', 'vendor.name', 'vendor.email']
      });

      expect(employeesWithVendor[0].vendor).toBeDefined();
      expect(employeesWithVendor[0].vendor.name).toBe('Test Salon');
    });
  });

  describe('GET /employees/:id - Read Single Employee', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await testClient.createItem('employees', {
        first_name: 'Test',
        last_name: 'Employee',
        email: 'test.employee@salon.com',
        vendor_id: vendorId,
        status: 'active',
        skills: ['haircut']
      });
      employeeId = employee.id;
      employeeIds.push(employeeId);
    });

    test('should retrieve single employee by ID', async () => {
      const response = await testClient.getItem('employees', employeeId);

      expect(response).toBeDefined();
      expect(response.id).toBe(employeeId);
      expect(response.first_name).toBe('Test');
      expect(response.last_name).toBe('Employee');
    });

    test('should return 404 for non-existent employee', async () => {
      await expect(testClient.getItem('employees', 99999))
        .rejects.toThrow();
    });
  });

  describe('PATCH /employees/:id - Update Employee', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await testClient.createItem('employees', {
        first_name: 'Original',
        last_name: 'Name',
        email: 'original@salon.com',
        vendor_id: vendorId,
        status: 'active',
        skills: ['haircut']
      });
      employeeId = employee.id;
      employeeIds.push(employeeId);
    });

    test('should update employee basic fields', async () => {
      const updateData = {
        first_name: 'Updated',
        last_name: 'Name',
        phone: '+9876543210'
      };

      const response = await testClient.updateItem('employees', employeeId, updateData);

      expect(response.first_name).toBe('Updated');
      expect(response.last_name).toBe('Name');
      expect(response.phone).toBe('+9876543210');
      expect(response.email).toBe('original@salon.com'); // Unchanged
    });

    test('should update employee status', async () => {
      const response = await testClient.updateItem('employees', employeeId, {
        status: 'inactive'
      });

      expect(response.status).toBe('inactive');
    });

    test('should update employee work hours', async () => {
      const newWorkHours = {
        monday: { start: '08:00', end: '16:00', available: true },
        tuesday: { start: '08:00', end: '16:00', available: true }
      };

      const response = await testClient.updateItem('employees', employeeId, {
        work_hours: newWorkHours
      });

      expect(response.work_hours.monday.start).toBe('08:00');
      expect(response.work_hours.monday.end).toBe('16:00');
    });

    test('should add and remove skills', async () => {
      // Add skills
      const response1 = await testClient.updateItem('employees', employeeId, {
        skills: ['haircut', 'styling', 'coloring']
      });
      expect(response1.skills).toEqual(['haircut', 'styling', 'coloring']);

      // Remove skills
      const response2 = await testClient.updateItem('employees', employeeId, {
        skills: ['haircut', 'coloring']
      });
      expect(response2.skills).toEqual(['haircut', 'coloring']);
    });

    test('should validate update data', async () => {
      await expect(testClient.updateItem('employees', employeeId, {
        email: 'invalid-email-format'
      })).rejects.toThrow();
    });
  });

  describe('DELETE /employees/:id - Delete Employee', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await testClient.createItem('employees', {
        first_name: 'To',
        last_name: 'Delete',
        email: 'delete@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });
      employeeId = employee.id;
    });

    test('should delete employee successfully', async () => {
      await testClient.deleteItem('employees', employeeId);

      // Verify employee is deleted
      await expect(testClient.getItem('employees', employeeId))
        .rejects.toThrow();
    });

    test('should prevent deletion of employee with active bookings', async () => {
      // Create a service first
      const service = await testClient.createItem('services', {
        name: 'Test Service',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        status: 'active'
      });

      // Create a booking for this employee
      await testClient.createItem('bookings', {
        service_id: service.id,
        employee_id: employeeId,
        vendor_id: vendorId,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        end_time: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
        status: 'confirmed'
      });

      await expect(testClient.deleteItem('employees', employeeId))
        .rejects.toThrow();
    });
  });

  describe('Employee Availability and Scheduling', () => {
    let employeeId;

    beforeEach(async () => {
      const employee = await testClient.createItem('employees', {
        first_name: 'Available',
        last_name: 'Employee',
        email: 'available@salon.com',
        vendor_id: vendorId,
        status: 'active',
        work_hours: {
          monday: { start: '09:00', end: '17:00', available: true },
          tuesday: { start: '09:00', end: '17:00', available: true },
          wednesday: { start: '09:00', end: '17:00', available: true },
          thursday: { start: '09:00', end: '17:00', available: true },
          friday: { start: '09:00', end: '17:00', available: true },
          saturday: { available: false },
          sunday: { available: false }
        }
      });
      employeeId = employee.id;
      employeeIds.push(employeeId);
    });

    test('should retrieve employee availability for specific date', async () => {
      const availability = await testClient.getItems('employees', {
        filter: {
          id: { _eq: employeeId },
          vendor_id: { _eq: vendorId }
        },
        fields: ['*', 'work_hours']
      });

      expect(availability[0].work_hours.monday.available).toBe(true);
      expect(availability[0].work_hours.saturday.available).toBe(false);
    });

    test('should handle time off requests', async () => {
      const timeOffData = {
        employee_id: employeeId,
        start_date: '2024-12-25',
        end_date: '2024-12-25',
        reason: 'holiday',
        approved: true
      };

      // This would typically go to a time_off collection
      const timeOff = await testClient.createItem('time_off', timeOffData);
      
      expect(timeOff.employee_id).toBe(employeeId);
      expect(timeOff.approved).toBe(true);
    });
  });

  describe('Vendor Isolation', () => {
    let otherVendorId;
    let otherEmployeeId;

    beforeEach(async () => {
      // Create another vendor
      const otherVendor = await testClient.createItem('vendors', {
        name: 'Other Salon',
        email: 'other@salon.com',
        status: 'active'
      });
      otherVendorId = otherVendor.id;

      // Create employee for other vendor
      const otherEmployee = await testClient.createItem('employees', {
        first_name: 'Other',
        last_name: 'Employee',
        email: 'other@other.com',
        vendor_id: otherVendorId,
        status: 'active'
      });
      otherEmployeeId = otherEmployee.id;
    });

    test('should only return employees for specific vendor', async () => {
      const vendor1Employees = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: vendorId } }
      });

      const vendor2Employees = await testClient.getItems('employees', {
        filter: { vendor_id: { _eq: otherVendorId } }
      });

      expect(vendor1Employees.every(e => e.vendor_id === vendorId)).toBe(true);
      expect(vendor2Employees.every(e => e.vendor_id === otherVendorId)).toBe(true);
      expect(vendor1Employees.length !== vendor2Employees.length).toBe(true);
    });

    test('should prevent cross-vendor employee access', async () => {
      // Try to access other vendor's employee
      await expect(testClient.getItem('employees', otherEmployeeId))
        .rejects.toThrow();
    });
  });

  describe('Employee Performance Metrics', () => {
    let employeeId;
    let serviceId;

    beforeEach(async () => {
      // Create employee
      const employee = await testClient.createItem('employees', {
        first_name: 'Performance',
        last_name: 'Test',
        email: 'performance@salon.com',
        vendor_id: vendorId,
        status: 'active'
      });
      employeeId = employee.id;
      employeeIds.push(employeeId);

      // Create service
      const service = await testClient.createItem('services', {
        name: 'Test Service',
        price: 50.00,
        duration: 60,
        vendor_id: vendorId,
        status: 'active'
      });
      serviceId = service.id;
    });

    test('should track employee booking count', async () => {
      // Create multiple bookings for the employee
      for (let i = 0; i < 5; i++) {
        await testClient.createItem('bookings', {
          service_id: serviceId,
          employee_id: employeeId,
          vendor_id: vendorId,
          start_time: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
          end_time: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
          status: 'confirmed'
        });
      }

      // Query bookings for this employee
      const employeeBookings = await testClient.getItems('bookings', {
        filter: {
          employee_id: { _eq: employeeId },
          vendor_id: { _eq: vendorId }
        }
      });

      expect(employeeBookings).toHaveLength(5);
    });
  });
});
