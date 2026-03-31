const TestClient = require('../utils/test-client');
const { 
  testVendors, 
  testEmployees, 
  testServices, 
  testSchedules, 
  testBookings, 
  testReviews, 
  testLocations, 
  testCategories 
} = require('../fixtures/test-data');

describe('Complete Test Data Integration', () => {
  let testClient;
  let vendorIds = [];
  let employeeIds = [];
  let serviceIds = [];
  let locationIds = [];
  let categoryIds = [];
  let reviewIds = [];

  beforeAll(async () => {
    testClient = new TestClient();
    await testClient.authenticateAdmin();
  });

  beforeEach(async () => {
    // Clean up any existing test data
    await testClient.cleanupTestData();
  });

  describe('Complete Business Setup', () => {
    test('should create complete test business ecosystem', async () => {
      // 1. Create Locations
      for (const locationData of testLocations) {
        const location = await testClient.createTestLocation(locationData);
        locationIds.push(location.id);
        expect(location.id).toBeDefined();
        expect(location.name).toBe(locationData.name);
      }

      // 2. Create Categories
      for (const categoryData of testCategories) {
        const category = await testClient.createTestCategory(categoryData);
        categoryIds.push(category.id);
        expect(category.id).toBeDefined();
        expect(category.name).toBe(categoryData.name);
      }

      // 3. Create Vendors with complete business information
      for (const vendorData of testVendors) {
        const vendor = await testClient.createTestVendor(vendorData);
        vendorIds.push(vendor.id);
        
        expect(vendor.id).toBeDefined();
        expect(vendor.name).toBe(vendorData.name);
        expect(vendor.description).toBe(vendorData.description);
        expect(vendor.email).toBe(vendorData.email);
        expect(vendor.phone).toBe(vendorData.phone);
        expect(vendor.address).toBe(vendorData.address);
        expect(vendor.city).toBe(vendorData.city);
        expect(vendor.area).toBe(vendorData.area);
        expect(vendor.rating).toBe(vendorData.rating);
        expect(vendor.reviews_count).toBe(vendorData.reviews_count);
        expect(vendor.is_featured).toBe(vendorData.is_featured);
        expect(vendor.is_verified).toBe(vendorData.is_verified);
        expect(vendor.women_only).toBe(vendorData.women_only);
        expect(vendor.latitude).toBe(vendorData.latitude);
        expect(vendor.longitude).toBe(vendorData.longitude);
      }

      // 4. Link Vendors to Categories
      await testClient.createTestVendorCategory(vendorIds[0], categoryIds[0]); // Glamour Salon -> Beauty Salon
      await testClient.createTestVendorCategory(vendorIds[1], categoryIds[0]); // Barber Shop Pro -> Barber
      await testClient.createTestVendorCategory(vendorIds[2], categoryIds[3]); // Royal Beauty -> Bridal Services

      // 5. Create Employees with detailed bios
      for (let i = 0; i < testEmployees.length; i++) {
        const employeeData = testEmployees[i];
        const vendorIndex = i < 2 ? 0 : 2; // First 2 employees to first vendor, next 2 to third vendor
        
        const employee = await testClient.createTestEmployee(vendorIds[vendorIndex], employeeData);
        employeeIds.push(employee.id);
        
        expect(employee.id).toBeDefined();
        expect(employee.name).toBe(employeeData.name);
        expect(employee.bio).toBe(employeeData.bio);
        expect(employee.photo).toBe(employeeData.photo);
      }

      // 6. Create Services with descriptions
      for (let i = 0; i < testServices.length; i++) {
        const serviceData = testServices[i];
        const employeeIndex = i < 4 ? 0 : 2; // First 4 services to first employee, rest to third employee
        
        const service = await testClient.createTestService(employeeIds[employeeIndex], serviceData);
        serviceIds.push(service.id);
        
        expect(service.id).toBeDefined();
        expect(service.name).toBe(serviceData.name);
        expect(service.description).toBe(serviceData.description);
        expect(service.price).toBe(serviceData.price);
        expect(service.duration_minutes).toBe(serviceData.duration_minutes);
      }

      // 7. Create Schedules
      for (let i = 0; i < testSchedules.length; i++) {
        const scheduleData = testSchedules[i];
        await testClient.createTestSchedule(employeeIds[0], scheduleData);
      }

      // 8. Create realistic Bookings
      for (let i = 0; i < testBookings.length; i++) {
        const bookingData = testBookings[i];
        const employeeIndex = i % 2; // Alternate between employees
        const vendorIndex = employeeIndex === 0 ? 0 : 2; // Map to appropriate vendor
        
        const completeBookingData = {
          ...bookingData,
          employee_id: employeeIds[employeeIndex],
          vendor_id: vendorIds[vendorIndex],
          employee_service_id: serviceIds[i % serviceIds.length]
        };

        const booking = await testClient.createTestBooking(completeBookingData);
        
        expect(booking.id).toBeDefined();
        expect(booking.booker_name).toBe(bookingData.booker_name);
        expect(booking.booker_email).toBe(bookingData.booker_email);
        expect(booking.start_datetime).toBe(bookingData.start_datetime);
        expect(booking.end_datetime).toBe(bookingData.end_datetime);
        expect(booking.status).toBe(bookingData.status);
        expect(booking.amount).toBe(bookingData.amount);
        expect(booking.notes).toBe(bookingData.notes);
      }

      // 9. Create Reviews
      for (let i = 0; i < testReviews.length; i++) {
        const reviewData = testReviews[i];
        const vendorIndex = i % vendorIds.length;
        
        const review = await testClient.createTestReview(vendorIds[vendorIndex], reviewData);
        reviewIds.push(review.id);
        
        expect(review.id).toBeDefined();
        expect(review.customer_name).toBe(reviewData.customer_name);
        expect(review.customer_email).toBe(reviewData.customer_email);
        expect(review.rating).toBe(reviewData.rating);
        expect(review.comment).toBe(reviewData.comment);
        expect(review.is_verified).toBe(reviewData.is_verified);
        expect(review.status).toBe(reviewData.status);
      }

      // Verify all data was created successfully
      expect(vendorIds).toHaveLength(3);
      expect(employeeIds).toHaveLength(4);
      expect(serviceIds).toHaveLength(8);
      expect(locationIds).toHaveLength(3);
      expect(categoryIds).toHaveLength(4);
      expect(reviewIds).toHaveLength(5);
    });

    test('should verify vendor business completeness', async () => {
      // Create a complete vendor
      const vendor = await testClient.createTestVendor(testVendors[0]);
      
      // Verify all business fields are present
      expect(vendor.name).toBeTruthy();
      expect(vendor.description).toBeTruthy();
      expect(vendor.email).toBeTruthy();
      expect(vendor.phone).toBeTruthy();
      expect(vendor.address).toBeTruthy();
      expect(vendor.city).toBeTruthy();
      expect(vendor.area).toBeTruthy();
      expect(vendor.rating).toBeGreaterThanOrEqual(0);
      expect(vendor.rating).toBeLessThanOrEqual(5);
      expect(vendor.reviews_count).toBeGreaterThanOrEqual(0);
      expect(typeof vendor.is_featured).toBe('boolean');
      expect(typeof vendor.is_verified).toBe('boolean');
      expect(typeof vendor.women_only).toBe('boolean');
      expect(vendor.latitude).toBeTruthy();
      expect(vendor.longitude).toBeTruthy();
    });

    test('should verify service pricing and duration validity', async () => {
      // Create vendor and employee first
      const vendor = await testClient.createTestVendor(testVendors[0]);
      const employee = await testClient.createTestEmployee(vendor.id, testEmployees[0]);
      
      // Test all services
      for (const serviceData of testServices) {
        const service = await testClient.createTestService(employee.id, serviceData);
        
        expect(service.price).toBeGreaterThan(0);
        expect(service.duration_minutes).toBeGreaterThan(0);
        expect(service.name).toBeTruthy();
        expect(service.description).toBeTruthy();
        expect(typeof service.is_active).toBe('boolean');
        expect(service.sort_order).toBeGreaterThanOrEqual(0);
      }
    });

    test('should verify booking time logic', async () => {
      const vendor = await testClient.createTestVendor(testVendors[0]);
      const employee = await testClient.createTestEmployee(vendor.id, testEmployees[0]);
      const service = await testClient.createTestService(employee.id, testServices[0]);
      
      // Create booking with specific times
      const startTime = '2024-01-15T10:00:00Z';
      const endTime = '2024-01-15T10:30:00Z';
      
      const booking = await testClient.createTestBooking({
        employee_id: employee.id,
        vendor_id: vendor.id,
        employee_service_id: service.id,
        start_datetime: startTime,
        end_datetime: endTime,
        booker_name: 'Test Customer',
        booker_email: 'test@example.com',
        status: 'confirmed',
        amount: service.price
      });
      
      expect(booking.start_datetime).toBe(startTime);
      expect(booking.end_datetime).toBe(endTime);
      expect(booking.amount).toBe(service.price);
      
      // Verify end time is after start time
      const start = new Date(startTime);
      const end = new Date(endTime);
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });
  });

  afterEach(async () => {
    await testClient.cleanupTestData();
    // Reset arrays
    vendorIds = [];
    employeeIds = [];
    serviceIds = [];
    locationIds = [];
    categoryIds = [];
    reviewIds = [];
  });
});
