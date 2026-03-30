// Test data fixtures for salon marketplace testing

const testVendors = [
  {
    name: 'Glamour Salon',
    slug: 'glamour-salon',
    status: 'active'
  },
  {
    name: 'Barber Shop Pro',
    slug: 'barber-shop-pro',
    status: 'active'
  }
];

const testEmployees = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    bio: 'Professional hairstylist with 10 years experience',
    timezone: 'America/New_York'
  },
  {
    name: 'Mike Wilson',
    email: 'mike@example.com',
    bio: 'Expert barber and men\'s grooming specialist',
    timezone: 'America/New_York'
  }
];

const testServices = [
  {
    name: 'Haircut',
    price: 45.00,
    duration_minutes: 30,
    is_active: true,
    sort: 1
  },
  {
    name: 'Beard Trim',
    price: 25.00,
    duration_minutes: 15,
    is_active: true,
    sort: 2
  },
  {
    name: 'Hair Color',
    price: 120.00,
    duration_minutes: 120,
    is_active: true,
    sort: 3
  },
  {
    name: 'Deep Conditioning',
    price: 60.00,
    duration_minutes: 45,
    is_active: true,
    sort: 4
  }
];

const testSchedules = [
  {
    day_of_week: 1, // Monday
    start_time: '09:00',
    end_time: '17:00'
  },
  {
    day_of_week: 2, // Tuesday
    start_time: '09:00',
    end_time: '17:00'
  },
  {
    day_of_week: 3, // Wednesday
    start_time: '09:00',
    end_time: '17:00'
  },
  {
    day_of_week: 4, // Thursday
    start_time: '09:00',
    end_time: '17:00'
  },
  {
    day_of_week: 5, // Friday
    start_time: '09:00',
    end_time: '17:00'
  }
];

const testBookings = [
  {
    booker_name: 'John Doe',
    booker_email: 'john@example.com',
    notes: 'First time customer'
  },
  {
    booker_name: 'Jane Smith',
    booker_email: 'jane@example.com',
    notes: 'Regular customer'
  }
];

const testUsers = {
  vendorAdmin: {
    first_name: 'Vendor',
    last_name: 'Admin',
    email: 'vendor@example.com',
    password: 'vendor123'
  },
  employee: {
    first_name: 'Test',
    last_name: 'Employee',
    email: 'employee@example.com',
    password: 'employee123'
  }
};

const overlappingBookings = [
  {
    start_datetime: '2024-01-15T10:00:00Z',
    end_datetime: '2024-01-15T10:30:00Z'
  },
  {
    start_datetime: '2024-01-15T10:15:00Z', // Overlaps with first booking
    end_datetime: '2024-01-15T10:45:00Z'
  },
  {
    start_datetime: '2024-01-15T11:00:00Z', // No overlap
    end_datetime: '2024-01-15T11:30:00Z'
  }
];

module.exports = {
  testVendors,
  testEmployees,
  testServices,
  testSchedules,
  testBookings,
  testUsers,
  overlappingBookings
};
