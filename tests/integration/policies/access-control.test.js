const TestClient = require('../../utils/test-client');
const { testVendors, testEmployees, testServices, testUsers } = require('../../fixtures/test-data');
const axios = require('axios');

describe('Access Control and Permissions', () => {
  let testClient;
  let vendorId;
  let employeeId;
  let vendorAdminToken;
  let employeeToken;
  let publicToken;

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.authenticateAdmin();
  });

  beforeEach(async () => {
    // Create test vendor
    const vendor = await testClient.createTestVendor(testVendors[0]);
    vendorId = vendor.id;

    // Create test employee
    const employee = await testClient.createTestEmployee(vendorId, testEmployees[0]);
    employeeId = employee.id;

    // Create vendor admin user
    const vendorAdmin = await testClient.createTestUser('vendor-admin', {
      ...testUsers.vendorAdmin,
      vendor_id: vendorId
    });

    // Create employee user
    const employeeUser = await testClient.createTestUser('employee', {
      ...testUsers.employee,
      employee_id: employeeId
    });

    // Authenticate as vendor admin
    const vendorAdminResponse = await axios.post(`${testClient.directusUrl}/auth/login`, {
      email: testUsers.vendorAdmin.email,
      password: testUsers.vendorAdmin.password
    });
    vendorAdminToken = vendorAdminResponse.data.data.access_token;

    // Authenticate as employee
    const employeeResponse = await axios.post(`${testClient.directusUrl}/auth/login`, {
      email: testUsers.employee.email,
      password: testUsers.employee.password
    });
    employeeToken = employeeResponse.data.access_token;

    // Public token (no authentication)
    publicToken = null;
  });

  afterEach(async () => {
    await testClient.cleanupTestData();
  });

  describe('Vendor Admin Permissions', () => {
    test('should allow vendor admin to CRUD own employees', async () => {
      const client = testClient.getDirectusClient(vendorAdminToken);

      // Create employee
      const newEmployee = await client.request(
        createItems('employees', {
          vendor_id: vendorId,
          name: 'New Employee',
          email: 'new@example.com'
        })
      );
      expect(newEmployee.id).toBeDefined();

      // Read employee
      const readEmployee = await client.request(
        readItem('employees', newEmployee.id)
      );
      expect(readEmployee.name).toBe('New Employee');

      // Update employee
      const updatedEmployee = await client.request(
        updateItem('employees', newEmployee.id, {
          name: 'Updated Employee'
        })
      );
      expect(updatedEmployee.name).toBe('Updated Employee');

      // Delete employee
      await client.request(deleteItem('employees', newEmployee.id));
    });

    test('should deny vendor admin access to other vendors\' data', async () => {
      // Create another vendor
      const otherVendor = await testClient.createTestVendor(testVendors[1]);
      const otherEmployee = await testClient.createTestEmployee(otherVendor.id, testEmployees[1]);

      const client = testClient.getDirectusClient(vendorAdminToken);

      // Try to access other vendor's employee
      await expect(
        client.request(readItem('employees', otherEmployee.id))
      ).rejects.toThrow();
    });

    test('should allow vendor admin to manage own bookings', async () => {
      const service = await testClient.createTestService(employeeId, testServices[0]);
      
      const client = testClient.getDirectusClient(vendorAdminToken);
      const booking = await client.request(
        createItems('bookings', {
          employee_id: employeeId,
          vendor_id: vendorId,
          employee_service_id: service.id,
          booker_email: 'customer@example.com',
          booker_name: 'Test Customer',
          start_datetime: '2024-01-15T10:00:00Z',
          end_datetime: '2024-01-15T10:30:00Z'
        })
      );

      expect(booking.id).toBeDefined();
      expect(booking.vendor_id).toBe(vendorId);
    });
  });

  describe('Employee Permissions', () => {
    test('should allow employee to read own schedule and bookings', async () => {
      const client = testClient.getDirectusClient(employeeToken);

      // Read own schedule
      const schedules = await client.request(
        readItems('employee_schedules', {
          filter: {
            employee_id: { _eq: employeeId }
          }
        })
      );

      expect(Array.isArray(schedules)).toBe(true);

      // Read own bookings
      const bookings = await client.request(
        readItems('bookings', {
          filter: {
            employee_id: { _eq: employeeId }
          }
        })
      );

      expect(Array.isArray(bookings)).toBe(true);
    });

    test('should deny employee access to other employees\' data', async () => {
      // Create another employee for the same vendor
      const otherEmployee = await testClient.createTestEmployee(vendorId, {
        ...testEmployees[1],
        email: 'other@example.com'
      });

      const client = testClient.getDirectusClient(employeeToken);

      // Try to access other employee's schedule
      await expect(
        client.request(
          readItems('employee_schedules', {
            filter: {
              employee_id: { _eq: otherEmployee.id }
            }
          })
        )
      ).rejects.toThrow();

      // Try to access other employee's bookings
      await expect(
        client.request(
          readItems('bookings', {
            filter: {
              employee_id: { _eq: otherEmployee.id }
            }
          })
        )
      ).rejects.toThrow();
    });

    test('should deny employee write access to services', async () => {
      const client = testClient.getDirectusClient(employeeToken);

      // Try to create a service
      await expect(
        client.request(
          createItems('employee_services', {
            employee_id: employeeId,
            name: 'Unauthorized Service',
            price: 50.00,
            duration_minutes: 30
          })
        )
      ).rejects.toThrow();

      // Try to update a service
      const service = await testClient.createTestService(employeeId, testServices[0]);
      await expect(
        client.request(
          updateItem('employee_services', service.id, {
            price: 75.00
          })
        )
      ).rejects.toThrow();
    });

    test('should allow employee to update own schedule', async () => {
      const schedule = await testClient.createTestSchedule(employeeId);
      
      const client = testClient.getDirectusClient(employeeToken);
      const updatedSchedule = await client.request(
        updateItem('employee_schedules', schedule.id, {
          start_time: '10:00',
          end_time: '18:00'
        })
      );

      expect(updatedSchedule.start_time).toBe('10:00');
      expect(updatedSchedule.end_time).toBe('18:00');
    });
  });

  describe('Public Permissions', () => {
    test('should allow public read access to employees, services, and schedules', async () => {
      const client = testClient.getDirectusClient(publicToken);

      // Read employees (public)
      const employees = await client.request(readItems('employees'));
      expect(Array.isArray(employees)).toBe(true);

      // Read services (public)
      const services = await client.request(readItems('employee_services'));
      expect(Array.isArray(services)).toBe(true);

      // Read schedules (public)
      const schedules = await client.request(readItems('employee_schedules'));
      expect(Array.isArray(schedules)).toBe(true);
    });

    test('should allow public booking creation with restricted fields', async () => {
      const service = await testClient.createTestService(employeeId, testServices[0]);
      
      const client = testClient.getDirectusClient(publicToken);
      const booking = await client.request(
        createItems('bookings', {
          booker_email: 'public@example.com',
          booker_name: 'Public User',
          employee_id: employeeId,
          employee_service_id: service.id,
          start_datetime: '2024-01-15T10:00:00Z',
          end_datetime: '2024-01-15T10:30:00Z',
          notes: 'Public booking test'
        })
      );

      expect(booking.id).toBeDefined();
      expect(booking.booker_email).toBe('public@example.com');
    });

    test('should deny public access to sensitive fields', async () => {
      const service = await testClient.createTestService(employeeId, testServices[0]);
      
      const client = testClient.getDirectusClient(publicToken);

      // Try to create booking with restricted fields
      await expect(
        client.request(
          createItems('bookings', {
            booker_email: 'public@example.com',
            booker_name: 'Public User',
            employee_id: employeeId,
            employee_service_id: service.id,
            start_datetime: '2024-01-15T10:00:00Z',
            end_datetime: '2024-01-15T10:30:00Z',
            status: 'confirmed', // Should be denied
            amount: 100.00, // Should be denied
            vendor_id: vendorId // Should be denied
          })
        )
      ).rejects.toThrow();
    });

    test('should deny public write access to employees, services, and schedules', async () => {
      const client = testClient.getDirectusClient(publicToken);

      // Try to create employee
      await expect(
        client.request(
          createItems('employees', {
            vendor_id: vendorId,
            name: 'Unauthorized Employee',
            email: 'unauthorized@example.com'
          })
        )
      ).rejects.toThrow();

      // Try to create service
      await expect(
        client.request(
          createItems('employee_services', {
            employee_id: employeeId,
            name: 'Unauthorized Service',
            price: 50.00,
            duration_minutes: 30
          })
        )
      ).rejects.toThrow();

      // Try to create schedule
      await expect(
        client.request(
          createItems('employee_schedules', {
            employee_id: employeeId,
            day_of_week: 1,
            start_time: '09:00',
            end_time: '17:00'
          })
        )
      ).rejects.toThrow();
    });
  });
});
