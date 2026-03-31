// Test data fixtures for salon marketplace testing
// Enhanced with complete business information including location, rating, images, and detailed descriptions

const testBusinessLeads = [
  {
    business_name: 'Elite Grooming Lounge',
    contact_person: 'Ahmed Hassan',
    phone: '+92-300-1234567',
    email: 'ahmed@elitegrooming.com',
    category: 'Barber',
    city: 'Karachi',
    status: 'pending'
  },
  {
    business_name: 'Luxe Beauty Studio',
    contact_person: 'Fatima Sheikh',
    phone: '+92-301-9876543',
    email: 'fatima@luxebeauty.com',
    category: 'Beauty Salon',
    city: 'Lahore',
    status: 'pending'
  },
  {
    business_name: 'Royal Spa & Wellness',
    contact_person: 'Khalid Malik',
    phone: '+92-21-37654321',
    email: 'khalid@royalspa.com',
    category: 'Spa',
    city: 'Islamabad',
    status: 'pending'
  },
  {
    business_name: 'Nail Art Gallery',
    contact_person: 'Ayesha Khan',
    phone: '+92-333-5558889',
    email: 'ayesha@nailart.com',
    category: 'Nail Salon',
    city: 'Rawalpindi',
    status: 'pending'
  },
  {
    business_name: 'Perfect Hair Solutions',
    contact_person: 'Bilal Ahmed',
    phone: '+92-42-1119990',
    email: 'bilal@perfecthair.com',
    category: 'Hair Salon',
    city: 'Karachi',
    status: 'pending'
  }
];

const testVendors = [
  {
    name: 'Glamour Salon & Spa',
    slug: 'glamour-salon-spa',
    description: 'Premier beauty destination offering comprehensive hair, skin, and wellness services. Our expert stylists and therapists are dedicated to providing you with a luxurious and transformative experience.',
    email: 'info@glamoursalon.com',
    phone: '+92-21-34567890',
    address: '123 Main Boulevard, Phase 5',
    city: 'Karachi',
    area: 'DHA',
    rating: 4.8,
    reviews_count: 156,
    is_featured: true,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 24.8136,
    longitude: 67.0482
    // Images will be assigned dynamically by seeder
  },
  {
    name: 'Barber Shop Pro',
    slug: 'barber-shop-pro',
    description: 'Traditional barbershop with modern techniques. Specializing in classic cuts, hot towel shaves, and men\'s grooming services. Step into our shop for an experience that combines tradition with contemporary style.',
    email: 'hello@barbershoppro.com',
    phone: '+92-21-23456789',
    address: '456 Commercial Street, Block 7',
    city: 'Karachi',
    area: 'Clifton',
    rating: 4.6,
    reviews_count: 89,
    is_featured: false,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 24.8005,
    longitude: 67.0422
    // Images will be assigned dynamically by seeder
  },
  {
    name: 'Royal Beauty Lounge',
    slug: 'royal-beauty-lounge',
    description: 'Exclusive women\'s only salon providing premium beauty services in a private and comfortable environment. Our certified professionals use only the finest products to ensure your beauty and wellness.',
    email: 'contact@royalbeauty.com',
    phone: '+92-21-34567891',
    address: '789 Fashion Avenue, Phase 6',
    city: 'Karachi',
    area: 'Bahadurabad',
    rating: 4.9,
    reviews_count: 234,
    is_featured: true,
    is_verified: true,
    women_only: true,
    status: 'active',
    latitude: 24.8236,
    longitude: 67.0582
    // Images will be assigned dynamically by seeder
  },
  {
    name: 'Capital Barber Studio',
    slug: 'capital-barber-studio',
    description: 'Modern barber studio in Islamabad offering fades, beard styling, premium grooming, and classic cuts for professionals and students alike.',
    email: 'hello@capitalbarberstudio.com',
    phone: '+92-51-2345678',
    address: '88 Jinnah Avenue, Blue Area',
    city: 'Islamabad',
    area: 'Blue Area',
    rating: 4.7,
    reviews_count: 102,
    is_featured: true,
    is_verified: true,
    women_only: false,
    status: 'active',
    latitude: 33.7075,
    longitude: 73.0498
    // Images will be assigned dynamically by seeder
  }
];

const testEmployees = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@glamoursalon.com',
    bio: 'Senior hairstylist with 12 years of experience in luxury salons. Specialized in color treatments, balayage, and bridal styling. Certified by L\'Oréal Professional and Wella Studios. Passionate about creating personalized looks that enhance each client\'s natural beauty.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 1
    // Photo will be assigned dynamically by seeder
  },
  {
    name: 'Mike Wilson',
    email: 'mike.wilson@barbershoppro.com',
    bio: 'Master barber with 8 years of experience in classic and modern men\'s grooming. Expert in traditional straight razor shaves, fades, and beard styling. Trained at the American Barber Academy. Known for attention to detail and creating sharp, lasting styles.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 1
    // Photo will be assigned dynamically by seeder
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@royalbeauty.com',
    bio: 'Licensed esthetician and makeup artist with 6 years of experience. Specialized in facials, skincare treatments, and bridal makeup. Uses organic and cruelty-free products. Committed to helping clients achieve healthy, glowing skin.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 2
    // Photo will be assigned dynamically by seeder
  },
  {
    name: 'James Chen',
    email: 'james.chen@barbershoppro.com',
    bio: 'Professional barber specializing in Asian hair techniques and modern styling. 5 years of experience in precision cutting and creative styling. Expert in handling thick and coarse hair types. Always updated with the latest grooming trends.',
    timezone: 'America/New_York',
    status: 'active',
    sort_order: 2
    // Photo will be assigned dynamically by seeder
  },
  {
    name: 'Ali Raza',
    email: 'ali.raza@capitalbarberstudio.com',
    bio: 'Islamabad-based barber known for clean fades, beard detailing, and sharp executive cuts. Focused on precise grooming and a relaxed client experience.',
    timezone: 'Asia/Karachi',
    status: 'active',
    sort_order: 1
    // Photo will be assigned dynamically by seeder
  }
];

const testServices = [
  {
    name: 'Classic Haircut',
    description: 'Professional haircut including consultation, wash, precision cut, and basic styling. Perfect for maintaining your current style or trying something new.',
    price: 45.00,
    duration_minutes: 30,
    is_active: true,
    sort: 1
  },
  {
    name: 'Premium Beard Trim & Style',
    description: 'Complete beard service including trim, shaping, hot towel treatment, and beard oil application. Leaves your beard looking sharp and well-maintained.',
    price: 35.00,
    duration_minutes: 20,
    is_active: true,
    sort: 2
  },
  {
    name: 'Full Hair Color Transformation',
    description: 'Complete hair coloring service including consultation, color application, processing, treatment, and styling. Uses premium L\'Oréal products for optimal results.',
    price: 150.00,
    duration_minutes: 150,
    is_active: true,
    sort: 3
  },
  {
    name: 'Deep Conditioning Treatment',
    description: 'Intensive moisturizing treatment for damaged or dry hair. Includes scalp massage, deep conditioning mask application, and blow-dry styling.',
    price: 65.00,
    duration_minutes: 45,
    is_active: true,
    sort: 4
  },
  {
    name: 'Gentleman\'s Hot Towel Shave',
    description: 'Traditional straight razor shave with hot towel preparation, pre-shave oil, luxurious lather, close shave, and aftershave balm. The ultimate grooming experience.',
    price: 40.00,
    duration_minutes: 30,
    is_active: true,
    sort: 5
  },
  {
    name: 'Bridal Makeup & Hair',
    description: 'Complete bridal package including trial session, wedding day makeup application, hairstyle, and touch-up kit. Uses long-lasting, high-end products.',
    price: 300.00,
    duration_minutes: 180,
    is_active: true,
    sort: 6
  },
  {
    name: 'Anti-Aging Facial',
    description: 'Rejuvenating facial treatment including deep cleansing, exfoliation, extractions, anti-aging serum application, and LED therapy. Targets fine lines and wrinkles.',
    price: 120.00,
    duration_minutes: 75,
    is_active: true,
    sort: 7
  },
  {
    name: 'Men\'s Grooming Package',
    description: 'Complete grooming package including haircut, beard trim, hot towel shave, and scalp treatment. The perfect all-in-one solution for the modern gentleman.',
    price: 85.00,
    duration_minutes: 60,
    is_active: true,
    sort: 8
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
    booker_email: 'john.doe@email.com',
    start_datetime: '2024-01-15T10:00:00Z',
    end_datetime: '2024-01-15T10:30:00Z',
    status: 'confirmed',
    amount: 45.00,
    notes: 'First time customer. Looking for a modern style. Prefers shorter on sides, longer on top.'
  },
  {
    booker_name: 'Jane Smith',
    booker_email: 'jane.smith@email.com',
    start_datetime: '2024-01-15T14:00:00Z',
    end_datetime: '2024-01-15T15:30:00Z',
    status: 'pending',
    amount: 150.00,
    notes: 'Regular customer. Wants to try balayage for the first time. Has medium brown hair.'
  },
  {
    booker_name: 'Ahmed Khan',
    booker_email: 'ahmed.khan@email.com',
    start_datetime: '2024-01-16T09:30:00Z',
    end_datetime: '2024-01-16T10:00:00Z',
    status: 'confirmed',
    amount: 40.00,
    notes: 'Monthly appointment for hot towel shave. Sensitive skin.'
  },
  {
    booker_name: 'Fatima Raza',
    booker_email: 'fatima.raza@email.com',
    start_datetime: '2024-01-16T11:00:00Z',
    end_datetime: '2024-01-16T12:15:00Z',
    status: 'confirmed',
    amount: 120.00,
    notes: 'Bridal trial session. Wants natural makeup look with soft waves.'
  },
  {
    booker_name: 'David Lee',
    booker_email: 'david.lee@email.com',
    start_datetime: '2024-01-17T16:00:00Z',
    end_datetime: '2024-01-16T17:00:00Z',
    status: 'pending',
    amount: 85.00,
    notes: 'Grooming package for upcoming wedding. Has thick coarse hair.'
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

const testReviews = [
  {
    customer_name: 'Michael Roberts',
    customer_email: 'michael.roberts@email.com',
    rating: 5,
    comment: 'Amazing experience at Glamour Salon! Sarah did an fantastic job with my hair color. The salon is clean, modern, and the staff is very professional. Will definitely come back!',
    is_verified: true,
    status: 'active'
  },
  {
    customer_name: 'Aisha Khan',
    customer_email: 'aisha.khan@email.com',
    rating: 4,
    comment: 'Great service overall. Mike gave me exactly the haircut I wanted. The hot towel shave was incredibly relaxing. Only minor issue was the wait time, but worth it for the quality.',
    is_verified: true,
    status: 'active'
  },
  {
    customer_name: 'Sophia Martinez',
    customer_email: 'sophia.martinez@email.com',
    rating: 5,
    comment: 'Royal Beauty Lounge exceeded my expectations! Emma is wonderful - very knowledgeable about skincare and the facial left my skin glowing. The women-only environment is very comfortable.',
    is_verified: true,
    status: 'active'
  },
  {
    customer_name: 'James Wilson',
    customer_email: 'james.wilson@email.com',
    rating: 4,
    comment: 'Barber Shop Pro is my go-to place. James understands Asian hair perfectly. Always get compliments on my haircut. Good value for money.',
    is_verified: true,
    status: 'active'
  },
  {
    customer_name: 'Emily Chen',
    customer_email: 'emily.chen@email.com',
    rating: 5,
    comment: 'Had my bridal makeup done here and it was perfect! Sarah listened to exactly what I wanted and delivered beyond my expectations. The makeup lasted all day through the wedding ceremony and reception.',
    is_verified: true,
    status: 'active'
  }
];

const testLocations = [
  {
    name: 'Karachi',
    slug: 'karachi',
    sort_order: 1,
    status: 'active'
  },
  {
    name: 'Lahore',
    slug: 'lahore',
    sort_order: 2,
    status: 'active'
  },
  {
    name: 'Islamabad',
    slug: 'islamabad',
    sort_order: 3,
    status: 'active'
  }
];

const testCategories = [
  {
    name: 'Barber',
    slug: 'barber',
    sort_order: 1,
    status: 'active'
  },
  {
    name: 'Beauty Salon',
    slug: 'beauty-salon',
    sort_order: 2,
    status: 'active'
  },
  {
    name: 'Spa & Wellness',
    slug: 'spa-wellness',
    sort_order: 3,
    status: 'active'
  },
  {
    name: 'Bridal Services',
    slug: 'bridal-services',
    sort_order: 4,
    status: 'active'
  }
];

module.exports = {
  testVendors,
  testEmployees,
  testServices,
  testSchedules,
  testBookings,
  testUsers,
  overlappingBookings,
  testReviews,
  testLocations,
  testCategories,
  testBusinessLeads
};
