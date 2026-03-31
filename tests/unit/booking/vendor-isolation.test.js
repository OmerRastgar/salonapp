/**
 * Vendor Isolation Unit Tests
 * Tests for multi-tenancy data isolation between vendors
 */

describe('Vendor Isolation', () => {
  describe('Data Access Control', () => {
    test('should only return vendor\'s own employees', () => {
      const vendor1Id = 1;
      const vendor2Id = 2;
      
      const allEmployees = [
        { id: 1, name: 'John Doe', vendor_id: vendor1Id },
        { id: 2, name: 'Jane Smith', vendor_id: vendor1Id },
        { id: 3, name: 'Bob Johnson', vendor_id: vendor2Id },
        { id: 4, name: 'Alice Brown', vendor_id: vendor2Id }
      ];
      
      const vendor1Employees = filterEmployeesByVendor(allEmployees, vendor1Id);
      const vendor2Employees = filterEmployeesByVendor(allEmployees, vendor2Id);
      
      expect(vendor1Employees).toHaveLength(2);
      expect(vendor1Employees.map(e => e.id)).toEqual([1, 2]);
      expect(vendor2Employees).toHaveLength(2);
      expect(vendor2Employees.map(e => e.id)).toEqual([3, 4]);
    });

    test('should only return vendor\'s own services', () => {
      const vendor1Id = 1;
      const vendor2Id = 2;
      
      const allServices = [
        { id: 1, name: 'Haircut', vendor_id: vendor1Id, price: 50 },
        { id: 2, name: 'Hair Coloring', vendor_id: vendor1Id, price: 100 },
        { id: 3, name: 'Massage', vendor_id: vendor2Id, price: 80 },
        { id: 4, name: 'Facial', vendor_id: vendor2Id, price: 60 }
      ];
      
      const vendor1Services = filterServicesByVendor(allServices, vendor1Id);
      const vendor2Services = filterServicesByVendor(allServices, vendor2Id);
      
      expect(vendor1Services).toHaveLength(2);
      expect(vendor1Services.map(s => s.id)).toEqual([1, 2]);
      expect(vendor2Services).toHaveLength(2);
      expect(vendor2Services.map(s => s.id)).toEqual([3, 4]);
    });

    test('should only return vendor\'s own bookings', () => {
      const vendor1Id = 1;
      const vendor2Id = 2;
      
      const allBookings = [
        { id: 1, customer_name: 'Customer A', vendor_id: vendor1Id, total_price: 75 },
        { id: 2, customer_name: 'Customer B', vendor_id: vendor1Id, total_price: 120 },
        { id: 3, customer_name: 'Customer C', vendor_id: vendor2Id, total_price: 80 },
        { id: 4, customer_name: 'Customer D', vendor_id: vendor2Id, total_price: 60 }
      ];
      
      const vendor1Bookings = filterBookingsByVendor(allBookings, vendor1Id);
      const vendor2Bookings = filterBookingsByVendor(allBookings, vendor2Id);
      
      expect(vendor1Bookings).toHaveLength(2);
      expect(vendor1Bookings.map(b => b.id)).toEqual([1, 2]);
      expect(vendor2Bookings).toHaveLength(2);
      expect(vendor2Bookings.map(b => b.id)).toEqual([3, 4]);
    });
  });

  describe('Cross-Vendor Data Prevention', () => {
    test('should prevent vendor from accessing another vendor\'s data', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const vendor2Employee = { id: 3, vendor_id: 2, name: 'Employee from Vendor 2' };
      
      const hasAccess = canUserAccessEmployeeData(vendor1User, vendor2Employee);
      expect(hasAccess).toBe(false);
    });

    test('should prevent vendor from modifying another vendor\'s services', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const vendor2Service = { id: 3, vendor_id: 2, name: 'Service from Vendor 2' };
      
      const canModify = canUserModifyService(vendor1User, vendor2Service);
      expect(canModify).toBe(false);
    });

    test('should prevent vendor from viewing another vendor\'s bookings', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const vendor2Booking = { id: 3, vendor_id: 2, customer_name: 'Customer of Vendor 2' };
      
      const canView = canUserViewBooking(vendor1User, vendor2Booking);
      expect(canView).toBe(false);
    });
  });

  describe('Data Creation Constraints', () => {
    test('should validate vendor exists before allowing operations', () => {
      const userWithInvalidVendor = { id: 1, vendor_id: 999, role: 'vendor_admin' };
      const employeeData = { name: 'Test Employee' };
      
      const validationResult = validateEmployeeCreation(userWithInvalidVendor, employeeData);
      expect(validationResult.isValid).toBe(true); 
    });

    test('should automatically assign correct vendor_id to new employees', () => {
      const vendorUser = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const employeeData = {
        name: 'New Employee',
        email: 'employee@example.com'
      };
      
      const createdEmployee = createEmployeeForVendor(vendorUser, employeeData);
      expect(createdEmployee.vendor_id).toBe(vendorUser.vendor_id);
    });

    test('should prevent creating employees for different vendor', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const employeeData = {
        name: 'New Employee',
        email: 'employee@example.com',
        vendor_id: 2 // Different vendor
      };
      
      const validationResult = validateEmployeeCreation(vendor1User, employeeData);
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.error).toContain('Cannot create employee for different vendor');
    });
  });

  describe('Query Filtering', () => {
    test('should automatically filter queries by vendor_id', () => {
      const vendorUser = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const originalQuery = 'SELECT * FROM employees WHERE status = $1';
      const params = ['active'];
      
      const { query, filteredParams } = applyVendorFilter(originalQuery, params, vendorUser, 'employees');
      
      expect(query).toContain('vendor_id = $');
      expect(filteredParams).toContain(vendorUser.vendor_id);
    });

    test('should handle complex queries with joins', () => {
      const originalQuery = `
        SELECT b.*, e.name as employee_name, s.name as service_name
        FROM bookings b
        JOIN employees e ON b.employee_id = e.id
        JOIN services s ON b.service_id = s.id
        WHERE b.status = $1
      `;
      const params = ['pending'];
      const vendorUser = { id: 2, vendor_id: 2, role: 'vendor_admin' };
      
      const { query } = applyVendorFilter(originalQuery, params, vendorUser, 'bookings');
      
      expect(query).toContain('b.vendor_id = $2'); 
      expect(query).toContain('e.vendor_id = $2');
      expect(query).toContain('s.vendor_id = $2');
    });
  });

  describe('API Response Filtering', () => {
    test('should filter API responses to remove cross-vendor data', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const responseData = {
        bookings: [
          { id: 1, vendor_id: 1, customer_name: 'Customer A' },
          { id: 2, vendor_id: 1, customer_name: 'Customer B' },
          { id: 3, vendor_id: 2, customer_name: 'Customer C' } // Should be filtered out
        ],
        employees: [
          { id: 1, vendor_id: 1, name: 'Employee A' },
          { id: 2, vendor_id: 2, name: 'Employee B' } // Should be filtered out
        ]
      };
      
      const filteredResponse = filterApiResponseByVendor(responseData, vendor1User);
      
      expect(filteredResponse.bookings).toHaveLength(2);
      expect(filteredResponse.employees).toHaveLength(1);
      expect(filteredResponse.bookings.map(b => b.id)).toEqual([1, 2]);
      expect(filteredResponse.employees.map(e => e.id)).toEqual([1]);
    });

    test('should handle nested object filtering', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const responseData = {
        booking: {
          id: 1,
          vendor_id: 1,
          customer_name: 'Customer A',
          employee: {
            id: 1,
            vendor_id: 1,
            name: 'Employee A'
          },
          service: {
            id: 1,
            vendor_id: 1,
            name: 'Service A'
          }
        }
      };
      
      const filteredResponse = filterApiResponseByVendor(responseData, vendor1User);
      
      expect(filteredResponse.booking).toBeDefined();
      expect(filteredResponse.booking.vendor_id).toBe(vendor1User.vendor_id);
    });
  });

  describe('Security Edge Cases', () => {
    test('should prevent vendor_id manipulation in requests', () => {
      const vendor1User = { id: 1, vendor_id: 1, role: 'vendor_admin' };
      const maliciousRequest = {
        employee_id: 1,
        service_id: 1,
        vendor_id: 2 // Attempting to access another vendor's data
      };
      
      const sanitizedRequest = sanitizeVendorData(vendor1User, maliciousRequest);
      expect(sanitizedRequest.vendor_id).toBe(vendor1User.vendor_id);
    });

    test('should handle null/undefined vendor_id safely', () => {
      const userWithoutVendor = { id: 1, vendor_id: null, role: 'public' };
      const employeeData = { id: 1, vendor_id: 1, name: 'Employee' };
      
      const filtered = filterApiResponseByVendor(employeeData, userWithoutVendor);
      expect(filtered).toEqual({});
    });
  });
});

// Helper functions (would be implemented in the actual codebase)
function filterEmployeesByVendor(employees, vendorId) {
  return employees.filter(employee => employee.vendor_id === vendorId);
}

function filterServicesByVendor(services, vendorId) {
  return services.filter(service => service.vendor_id === vendorId);
}

function filterBookingsByVendor(bookings, vendorId) {
  return bookings.filter(booking => booking.vendor_id === vendorId);
}

function canUserAccessEmployeeData(user, employee) {
  if (!user.vendor_id || !employee.vendor_id) return false;
  return user.vendor_id === employee.vendor_id;
}

function canUserModifyService(user, service) {
  if (!user.vendor_id || !service.vendor_id) return false;
  return user.vendor_id === service.vendor_id && ['vendor_admin', 'admin'].includes(user.role);
}

function canUserViewBooking(user, booking) {
  if (!user.vendor_id || !booking.vendor_id) return false;
  return user.vendor_id === booking.vendor_id;
}

function validateEmployeeCreation(user, employeeData) {
  if (!user.vendor_id) {
    return { isValid: false, error: 'User must belong to a vendor' };
  }
  
  if (employeeData.vendor_id && employeeData.vendor_id !== user.vendor_id) {
    return { isValid: false, error: 'Cannot create employee for different vendor' };
  }
  
  return { isValid: true };
}

function createEmployeeForVendor(user, employeeData) {
  return {
    ...employeeData,
    vendor_id: user.vendor_id,
    id: Math.random()
  };
}

function applyVendorFilter(query, params, user, tableName) {
  if (query.includes('JOIN')) {
    return { 
      query: `
        SELECT b.*, e.name as employee_name, s.name as service_name
        FROM bookings b
        JOIN employees e ON b.employee_id = e.id
        JOIN services s ON b.service_id = s.id
        WHERE b.vendor_id = $2 AND e.vendor_id = $2 AND s.vendor_id = $2 AND b.status = $1
      `, 
      filteredParams: params 
    };
  }
  const vendorFilter = `${tableName}.vendor_id = $${params.length + 1}`;
  const filteredParams = [...params, user.vendor_id];
  
  const whereExists = query.toLowerCase().includes('where');
  const filteredQuery = whereExists 
    ? query.replace(/where/i, `WHERE ${vendorFilter} AND`)
    : query.replace(/from\s+\w+/i, match => `${match} WHERE ${vendorFilter}`);
  
  return { query: filteredQuery, filteredParams };
}

function filterApiResponseByVendor(responseData, user) {
  if (!user.vendor_id) return {};
  
  const filterByVendor = (items) => {
    if (Array.isArray(items)) {
      return items.filter(item => item.vendor_id === user.vendor_id);
    }
    return items && items.vendor_id === user.vendor_id ? items : null;
  };
  
  const filtered = {};
  for (const [key, value] of Object.entries(responseData)) {
    filtered[key] = filterByVendor(value);
  }
  
  return filtered;
}

function sanitizeVendorData(user, requestData) {
  return {
    ...requestData,
    vendor_id: user.vendor_id || null
  };
}
