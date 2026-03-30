import { createDirectus, rest, readItems, readItem } from '@directus/sdk';

// Types for the data
export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  area: string;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  is_verified: boolean;
  women_only: boolean;
  status: string;
  logo?: string;
  cover_image?: string;
  latitude?: number;
  longitude?: number;
  services?: Service[];
  categories?: Category[];
  working_hours?: WorkingHour[];
  reviews?: Review[];
}

export interface Service {
  id: string;
  vendor_id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  original_price?: number;
  is_popular: boolean;
  status: string;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
}

export interface WorkingHour {
  id: string;
  vendor_id: string;
  day_of_week: number;
  open_time: string;
  close_time: string;
  is_closed: boolean;
}

export interface Review {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  comment: string;
  is_verified: boolean;
  status: string;
  created_at: string;
}

export interface Employee {
  id: string;
  vendor_id: string;
  name: string;
  email?: string;
  photo?: string;
  bio?: string;
  timezone?: string;
  status: string;
  sort_order?: number;
}

export interface EmployeeService {
  id: string;
  employee_id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description?: string;
  is_active: boolean;
  sort_order?: number;
}

export interface EmployeeSchedule {
  id: string;
  employee_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_closed: boolean;
  sort_order?: number;
}

export interface Booking {
  id: string;
  employee_id: string;
  vendor_id: string;
  employee_service_id: string;
  booker_email: string;
  booker_name: string;
  start_datetime: string;
  end_datetime: string;
  status: string;
  amount?: number;
  notes?: string;
  created_at: string;
}

const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const directus = createDirectus(directusUrl).with(rest());

export class SimpleDirectusService {
  static async getVendors(options: {
    category?: string;
    location?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}) {
    try {
      console.log('Fetching vendors with options:', options);
      
      const filters: any = {
        status: { _eq: 'active' }
      };

      if (options.location) {
        filters.city = { _icontains: options.location };
      }

      if (options.featured) {
        filters.is_featured = { _eq: true };
      }

      // Category filtering: use two-step approach to avoid M2M deep-filter 403 errors.
      // Step 1: find vendor IDs in the junction table that match the category.
      if (options.category) {
        const categorySlug = options.category.toLowerCase().replace(/\s+/g, '-');
        const junctionRows = await directus.request(
          readItems('vendor_categories', {
            fields: ['vendors_id', 'categories_id.slug', 'categories_id.name'],
            limit: 100
          })
        ) as any[];

        const matchingVendorIds = junctionRows
          .filter((row: any) => {
            const slug: string = row.categories_id?.slug || '';
            const name: string = row.categories_id?.name || '';
            return (
              slug === categorySlug ||
              name.toLowerCase().includes(options.category!.toLowerCase())
            );
          })
          .map((row: any) => row.vendors_id);

        if (matchingVendorIds.length === 0) {
          return { data: [] as Vendor[], meta: null };
        }
        filters.id = { _in: matchingVendorIds };
      }

      const query: any = {
        filter: filters,
        // Fetch vendor fields + junction categories (no 'services' — services belong to employees)
        fields: ['*', 'categories.categories_id.*'],
        limit: options.limit || 10,
        offset: options.offset || 0
      };

      const response = await directus.request(readItems('vendors', query));
      return { data: response as Vendor[], meta: null };
    } catch (error) {
      console.error('Error in getVendors:', error);
      throw error;
    }
  }

  static async getVendorBySlug(slug: string) {
    try {
      const response = await directus.request(
        readItems('vendors', {
          filter: {
            slug: { _eq: slug },
            status: { _eq: 'active' }
          },
          fields: ['*', { 
            categories: ['*'], 
            services: ['*'],
            working_hours: ['*'],
            reviews: ['*']
          }],
          limit: 1
        })
      );
      return response[0] as Vendor || null;
    } catch (error) {
      console.error('Error in getVendorBySlug:', error);
      return null;
    }
  }

  static async getCategories() {
    try {
      const response = await directus.request(
        readItems('categories', {
          filter: { status: { _eq: 'active' } },
          sort: ['sort_order'],
          fields: ['*']
        })
      );
      return response as Category[];
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  static async getLocations() {
    try {
      const response = await directus.request(
        readItems('locations', {
          filter: { status: { _eq: 'active' } },
          sort: ['sort_order'],
          fields: ['*']
        })
      );
      return response as Location[];
    } catch (error) {
      console.error('Error in getLocations:', error);
      return [];
    }
  }

  static getAssetUrl(id: string | null | undefined) {
    if (!id) return null;
    return `${directusUrl}/assets/${id}`;
  }

  static async getEmployees(vendorId: number | string): Promise<Employee[]> {
    try {
      const response = await directus.request(
        readItems('employees', {
          filter: { 
            vendor_id: { _eq: vendorId },
            status: { _eq: 'active' }
          },
          sort: ['sort_order']
        })
      );
      return response as Employee[];
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  static async getEmployeeServices(employeeId: number | string): Promise<EmployeeService[]> {
    try {
      const response = await directus.request(
        readItems('employee_services', {
          filter: { 
            employee_id: { _eq: employeeId },
            is_active: { _eq: true }
          },
          sort: ['sort_order']
        })
      );
      return response as EmployeeService[];
    } catch (error) {
      console.error('Error fetching employee services:', error);
      return [];
    }
  }

  static async getEmployeeSchedules(employeeId: number | string): Promise<EmployeeSchedule[]> {
    try {
      const response = await directus.request(
        readItems('employee_schedules', {
          filter: { 
            employee_id: { _eq: employeeId },
            is_closed: { _eq: false }
          },
          sort: ['day_of_week', 'sort_order']
        })
      );
      return response as EmployeeSchedule[];
    } catch (error) {
      console.error('Error fetching employee schedules:', error);
      return [];
    }
  }

  static async getBookings(employeeId: number | string, startDate: Date, endDate: Date): Promise<Booking[]> {
    try {
      const response = await directus.request(
        readItems('bookings', {
          filter: {
            employee_id: { _eq: employeeId },
            _and: [
              { start_datetime: { _gte: startDate.toISOString() } },
              { start_datetime: { _lte: endDate.toISOString() } }
            ],
            status: { _nin: ['cancelled'] }
          },
          sort: ['start_datetime']
        })
      );
      return response as Booking[];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  static async createBooking(data: Partial<Booking>): Promise<Booking> {
    try {
      const response = await fetch(`${directusUrl}/items/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.errors?.[0]?.message || 'Failed to create booking');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async createVendorReview(data: any) {
    try {
      const response = await fetch(`${directusUrl}/items/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create vendor review');
      return await response.json();
    } catch (error) {
      console.error('Error creating vendor review:', error);
      throw error;
    }
  }

  static async createEmployeeReview(data: any) {
    try {
      const response = await fetch(`${directusUrl}/items/employee_reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create employee review');
      return await response.json();
    } catch (error) {
      console.error('Error creating employee review:', error);
      throw error;
    }
  }

  static async createBusinessLead(data: any) {
    try {
      const response = await fetch(`${directusUrl}/items/business_leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Failed to create lead');
      return await response.json();
    } catch (error) {
      console.error('Error creating business lead:', error);
      throw error;
    }
  }
}


