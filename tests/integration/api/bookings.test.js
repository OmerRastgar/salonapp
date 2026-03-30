const TestClient = require('../../utils/test-client');
const { testVendors, testEmployees, testServices, testBookings } = require('../../fixtures/test-data');
const { createItems, readItems, readItem, updateItem, deleteItem } = require('@directus/sdk');

describe('Bookings API Integration Tests', () => {
  let testClient;
  let vendorId;
  let employeeId;
  let serviceId;
  let bookingId;

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

    // Create test service
    const service = await testClient.createTestService(employeeId, testServices[0]);
    serviceId = service.id;
  });

  afterEach(async () => {
    await testClient.cleanupTestData();
  });

  describe('POST /bookings', () => {
    test('should create a new booking with valid data', async () => {
      const bookingData = {
        ...testBookings[0],
        employee_id: employeeId,
        vendor_id: vendorId,
        employee_service_id: serviceId,
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      const booking = await client.request(
        createItems('bookings', bookingData)
      );

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();
      expect(booking.booker_email).toBe(bookingData.booker_email);
      expect(booking.booker_name).toBe(bookingData.booker_name);
      expect(booking.employee_id).toBe(employeeId);
      expect(booking.vendor_id).toBe(vendorId);
      expect(booking.employee_service_id).toBe(serviceId);
      
      bookingId = booking.id;
    });

    test('should reject booking with missing required fields', async () => {
      const incompleteBooking = {
        booker_email: testBookings[0].booker_email
        // Missing required fields
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      
      await expect(
        client.request(createItems('bookings', incompleteBooking))
      ).rejects.toThrow();
    });

    test('should reject booking with invalid email format', async () => {
      const invalidBooking = {
        ...testBookings[0],
        booker_email: 'invalid-email',
        employee_id: employeeId,
        vendor_id: vendorId,
        employee_service_id: serviceId,
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      
      await expect(
        client.request(createItems('bookings', invalidBooking))
      ).rejects.toThrow();
    });
  });

  describe('GET /bookings', () => {
    beforeEach(async () => {
      // Create a test booking for GET tests
      const bookingData = {
        ...testBookings[0],
        employee_id: employeeId,
        vendor_id: vendorId,
        employee_service_id: serviceId,
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      const booking = await client.request(createItems('bookings', bookingData));
      bookingId = booking.id;
    });

    test('should retrieve all bookings for admin', async () => {
      const client = testClient.getDirectusClient(testClient.adminToken);
      const bookings = await client.request(readItems('bookings'));

      expect(bookings).toBeDefined();
      expect(Array.isArray(bookings)).toBe(true);
      expect(bookings.length).toBeGreaterThan(0);
    });

    test('should filter bookings by employee', async () => {
      const client = testClient.getDirectusClient(testClient.adminToken);
      const bookings = await client.request(
        readItems('bookings', {
          filter: {
            employee_id: { _eq: employeeId }
          }
        })
      );

      expect(bookings).toBeDefined();
      expect(Array.isArray(bookings)).toBe(true);
      bookings.forEach(booking => {
        expect(booking.employee_id).toBe(employeeId);
      });
    });

    test('should filter bookings by vendor', async () => {
      const client = testClient.getDirectusClient(testClient.adminToken);
      const bookings = await client.request(
        readItems('bookings', {
          filter: {
            vendor_id: { _eq: vendorId }
          }
        })
      );

      expect(bookings).toBeDefined();
      expect(Array.isArray(bookings)).toBe(true);
      bookings.forEach(booking => {
        expect(booking.vendor_id).toBe(vendorId);
      });
    });
  });

  describe('PUT /bookings/:id', () => {
    beforeEach(async () => {
      // Create a test booking for update tests
      const bookingData = {
        ...testBookings[0],
        employee_id: employeeId,
        vendor_id: vendorId,
        employee_service_id: serviceId,
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      const booking = await client.request(createItems('bookings', bookingData));
      bookingId = booking.id;
    });

    test('should update booking status', async () => {
      const client = testClient.getDirectusClient(testClient.adminToken);
      const updatedBooking = await client.request(
        updateItem('bookings', bookingId, {
          status: 'confirmed'
        })
      );

      expect(updatedBooking.status).toBe('confirmed');
    });

    test('should update booking notes', async () => {
      const newNotes = 'Updated notes for testing';
      const client = testClient.getDirectusClient(testClient.adminToken);
      const updatedBooking = await client.request(
        updateItem('bookings', bookingId, {
          notes: newNotes
        })
      );

      expect(updatedBooking.notes).toBe(newNotes);
    });
  });

  describe('DELETE /bookings/:id', () => {
    beforeEach(async () => {
      // Create a test booking for deletion tests
      const bookingData = {
        ...testBookings[0],
        employee_id: employeeId,
        vendor_id: vendorId,
        employee_service_id: serviceId,
        start_datetime: '2024-01-15T10:00:00Z',
        end_datetime: '2024-01-15T10:30:00Z'
      };

      const client = testClient.getDirectusClient(testClient.adminToken);
      const booking = await client.request(createItems('bookings', bookingData));
      bookingId = booking.id;
    });

    test('should soft delete booking (archive)', async () => {
      const client = testClient.getDirectusClient(testClient.adminToken);
      
      // Archive the booking
      await client.request(
        deleteItem('bookings', bookingId)
      );

      // Verify it's archived (should not appear in normal queries)
      const bookings = await client.request(
        readItems('bookings', {
          filter: {
            id: { _eq: bookingId }
          }
        })
      );

      expect(bookings).toHaveLength(0);
    });
  });
});
