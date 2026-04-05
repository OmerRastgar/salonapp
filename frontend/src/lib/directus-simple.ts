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
  distance_km?: number;
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
  image?: string;
}

export interface Location {
  id: string;
  name: string;
  slug: string;
}

export interface SearchLocationOption {
  value: string;
  label: string;
  city: string;
  area?: string;
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
  image?: string;
  bio?: string;
  timezone?: string;
  status: string;
  sort_order?: number;
  rating?: number;
  reviews_count?: number;
  vendor?: Vendor;
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

const isServer = typeof window === 'undefined';

// Setup Directus URL logic
const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
const internalUrl = process.env.DIRECTUS_INTERNAL_URL || "http://directus:8055";

let finalUrl = "";
if (isServer) {
  // Server-side (Node.js): Use internal Docker network for speed
  finalUrl = internalUrl;
} else {
  // Client-side (Browser): Prioritize the configured public URL
  // If not available, use current origin as fallback for Nginx proxies
  finalUrl = publicUrl || (typeof window !== 'undefined' ? window.location.origin : "");
}

console.log(`[Directus] Initializing SDK on ${isServer ? 'SERVER' : 'CLIENT'} with URL: "${finalUrl}"`);
console.log(`[Directus] Environment vars - PUBLIC: "${publicUrl}", INTERNAL: "${internalUrl}"`);


const directus = createDirectus(finalUrl).with(rest());

export class SimpleDirectusService {
  static async getVendors(options: {
    category?: string;
    location?: string;
    search?: string;
    latitude?: number;
    longitude?: number;
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
        const normalizedLocation = options.location.trim();
        const [areaPartRaw, cityPartRaw] = normalizedLocation.includes('||')
          ? normalizedLocation.split('||')
          : normalizedLocation.split(',').map((part) => part.trim());
        const areaPart = areaPartRaw?.trim();
        const cityPart = cityPartRaw?.trim();

        if (areaPart && cityPart) {
          filters._and = [
            ...(filters._and || []),
            { city: { _icontains: cityPart } },
            { area: { _icontains: areaPart } }
          ];
        } else {
          filters._and = [
            ...(filters._and || []),
            {
              _or: [
                { city: { _icontains: normalizedLocation } },
                { area: { _icontains: normalizedLocation } }
              ]
            }
          ];
        }
      }

      if (options.featured) {
        filters.is_featured = { _eq: true };
      }

      if (options.search) {
        filters._or = [
          { name: { _icontains: options.search } },
          { description: { _icontains: options.search } },
          { area: { _icontains: options.search } },
          { city: { _icontains: options.search } }
        ];
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
            const slug: string = (row.categories_id?.slug || '').toLowerCase();
            const name: string = (row.categories_id?.name || '').toLowerCase();
            const searchTerm = options.category!.toLowerCase();
            
            return (
              slug === searchTerm || 
              searchTerm.includes(slug) ||
              name.includes(searchTerm) ||
              searchTerm.includes(name)
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
        fields: ['*', 'latitude', 'longitude', 'categories.categories_id.*', 'working_hours.*', 'services.*'],
        limit: options.limit || 10,
        offset: options.offset || 0,
        // Manual cache-buster in the URL
        _t: Date.now()
      };

      const response = await directus.request(readItems('vendors', query));
      const vendors = response as Vendor[];

      if (vendors.length === 0) {
        return { data: [], meta: null };
      }

      const vendorIds = vendors.map((vendor) => vendor.id);

      const [workingHoursResponse, employeesResponse] = await Promise.all([
        directus.request(
          readItems('working_hours', {
            filter: { vendor_id: { _in: vendorIds } },
            fields: ['*'],
            limit: 500
          })
        ),
        directus.request(
          readItems('employees', {
            filter: {
              vendor_id: { _in: vendorIds },
              status: { _eq: 'active' }
            },
            fields: ['id', 'vendor_id'],
            limit: 500
          })
        )
      ]);

      const workingHours = workingHoursResponse as WorkingHour[];
      const employees = employeesResponse as Pick<Employee, 'id' | 'vendor_id'>[];
      const employeeIds = employees.map((employee) => employee.id);

      let employeeServices: EmployeeService[] = [];
      if (employeeIds.length > 0) {
        const employeeServicesResponse = await directus.request(
          readItems('employee_services', {
            filter: {
              employee_id: { _in: employeeIds },
              is_active: { _eq: true }
            },
            fields: ['id', 'employee_id', 'name', 'price', 'is_active', 'description', 'duration_minutes', 'sort_order'],
            sort: ['sort_order'],
            limit: 1000
          })
        );
        employeeServices = employeeServicesResponse as EmployeeService[];
      }

      const employeeVendorMap = new Map(employees.map((employee) => [employee.id, employee.vendor_id]));

      const servicesByVendor = new Map<string, Service[]>();
      employeeServices.forEach((service) => {
        const vendorId = employeeVendorMap.get(service.employee_id);
        if (!vendorId) {
          return;
        }

        const existing = servicesByVendor.get(vendorId) || [];
        const alreadyIncluded = existing.some((item) => item.name === service.name);
        if (alreadyIncluded) {
          return;
        }

        existing.push({
          id: service.id,
          vendor_id: vendorId,
          name: service.name,
          description: service.description || '',
          duration: service.duration_minutes,
          price: Number(service.price),
          is_popular: false,
          status: service.is_active ? 'active' : 'inactive',
          sort_order: service.sort_order || 0
        });
        servicesByVendor.set(vendorId, existing);
      });

      let enrichedVendors = vendors.map((vendor) => ({
        ...vendor,
        working_hours: workingHours.filter((hours) => hours.vendor_id === vendor.id),
        services: (servicesByVendor.get(vendor.id) || []).slice(0, 3)
      }));

      if (typeof options.latitude === 'number' && typeof options.longitude === 'number') {
        const toRadians = (value: number) => (value * Math.PI) / 180;
        const haversineDistance = (vendor: Vendor) => {
          const lat = Number(vendor.latitude);
          const lng = Number(vendor.longitude);
          if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return Number.POSITIVE_INFINITY;
          }

          const earthRadiusKm = 6371;
          const dLat = toRadians(lat - options.latitude!);
          const dLng = toRadians(lng - options.longitude!);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(options.latitude!)) *
              Math.cos(toRadians(lat)) *
              Math.sin(dLng / 2) *
              Math.sin(dLng / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return earthRadiusKm * c;
        };

        enrichedVendors = enrichedVendors
          .map((vendor) => ({
            ...vendor,
            distance_km: haversineDistance(vendor)
          }))
          .sort((left, right) => (left.distance_km || Number.POSITIVE_INFINITY) - (right.distance_km || Number.POSITIVE_INFINITY));
      }

      return { data: enrichedVendors, meta: null };
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
          fields: [
            '*', 
            'categories.categories_id.*',
            'working_hours.*',
            'reviews.*'
          ],
          limit: 1
        })
      );
      const vendor = response[0] as Vendor | null;
      console.log(`[SimpleDirectusService] Fetched vendor by slug "${slug}":`, vendor ? vendor.name : 'Not Found', vendor?.id);
      
      if (!vendor) {
        return null;
      }

      const [workingHoursResponse, reviewsResponse] = await Promise.all([
        directus.request(
          readItems('working_hours', {
            filter: { vendor_id: { _eq: vendor.id } },
            fields: ['*'],
            sort: ['day_of_week'],
            limit: 50
          })
        ),
        directus.request(
          readItems('reviews', {
            filter: { vendor_id: { _eq: vendor.id } },
            fields: ['*'],
            sort: ['-created_at'],
            limit: 100
          })
        )
      ]);

      const employeesResponse = await directus.request(
        readItems('employees', {
          filter: {
            vendor_id: { _eq: vendor.id },
            status: { _eq: 'active' }
          },
          fields: ['id'],
          limit: 100
        })
      );

      const employeeIds = (employeesResponse as Pick<Employee, 'id'>[]).map((employee) => employee.id);
      let services: Service[] = [];

      // 3. AGGREGATE SERVICES FROM INDIVIDUAL EMPLOYEES
      let employeeServicesResponse: EmployeeService[] = [];
      if (employeeIds.length > 0) {
        const response = await directus.request(
          readItems('employee_services', {
            filter: {
              employee_id: { _in: employeeIds },
              is_active: { _eq: true }
            },
            fields: ['id', 'employee_id', 'name', 'price', 'description', 'duration_minutes', 'sort_order', 'is_active'],
            sort: ['sort_order'],
            limit: 500
          })
        );
        employeeServicesResponse = response as EmployeeService[];
      }

      const seenNames = new Set<string>();
      services = employeeServicesResponse
        .filter((service) => {
          if (seenNames.has(service.name)) return false;
          seenNames.add(service.name);
          return true;
        })
        .map((service) => ({
          id: service.id,
          vendor_id: vendor.id,
          name: service.name,
          description: service.description || '',
          duration: service.duration_minutes,
          price: Number(service.price),
          is_popular: false,
          status: service.is_active ? 'active' : 'inactive',
          sort_order: service.sort_order || 0
        }));

      console.log(`[SimpleDirectusService] Mapped ${services.length} services for vendor ${vendor.name}`, services);

      return {
        ...vendor,
        working_hours: workingHoursResponse as WorkingHour[],
        reviews: reviewsResponse as Review[],
        services
      };
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

  static getAssetUrl(id: string | null | undefined): string | null {
    if (!id) return null;
    const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
    
    // If we're on localhost, use a relative path to bypass Next.js private IP blocks
    if (publicUrl.includes('localhost') || publicUrl === '' || publicUrl.includes('127.0.0.1')) {
      return `/assets/${id}`;
    }
    
    return `${publicUrl}/assets/${id}`;
  }

  static async getEmployees(vendorId: number | string): Promise<Employee[]> {
    try {
      const response = await directus.request(
        readItems('employees', {
          filter: { 
            vendor_id: { _eq: vendorId },
            status: { _eq: 'active' }
          },
          fields: ['id', 'vendor_id', 'name', 'email', 'photo', 'bio', 'timezone', 'status', 'sort_order', 'rating', 'reviews_count'],
          sort: ['sort_order']
        })
      );
      return (response as Employee[]).map((employee) => ({
        ...employee,
        image: employee.photo
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  }

  static async getSearchLocations(): Promise<SearchLocationOption[]> {
    try {
      const [locationsResponse, vendorsResponse] = await Promise.all([
        directus.request(
          readItems('locations', {
            filter: { status: { _eq: 'active' } },
            sort: ['sort_order'],
            fields: ['id', 'name', 'slug']
          })
        ),
        directus.request(
          readItems('vendors', {
            filter: { status: { _eq: 'active' } },
            fields: ['id', 'city', 'area'],
            sort: ['city', 'area'],
            limit: 500
          })
        )
      ]);

      const options = new Map<string, SearchLocationOption>();

      (locationsResponse as Location[]).forEach((location) => {
        const city = location.name.trim();
        options.set(`city:${city.toLowerCase()}`, {
          value: city,
          label: city,
          city
        });
      });

      (vendorsResponse as Pick<Vendor, 'city' | 'area'>[]).forEach((vendor) => {
        const city = vendor.city?.trim();
        const area = vendor.area?.trim();
        if (!city) {
          return;
        }

        if (!options.has(`city:${city.toLowerCase()}`)) {
          options.set(`city:${city.toLowerCase()}`, {
            value: city,
            label: city,
            city
          });
        }

        if (area) {
          const key = `area:${area.toLowerCase()}::${city.toLowerCase()}`;
          options.set(key, {
            value: `${area}||${city}`,
            label: `${area}, ${city}`,
            city,
            area
          });
        }
      });

      return Array.from(options.values()).sort((left, right) => {
        if (left.city === right.city) {
          return (left.area || '').localeCompare(right.area || '');
        }
        return left.city.localeCompare(right.city);
      });
    } catch (error) {
      console.error('Error in getSearchLocations:', error);
      return [];
    }
  }

  static async getEmployeeWithVendor(employeeId: string): Promise<Employee | null> {
    try {
      const response = await directus.request(
        readItems('employees', {
          filter: { id: { _eq: employeeId } },
          fields: ['*', 'vendor_id.slug'],
          limit: 1
        })
      );
      const employee = (response as any[])[0] as Employee | undefined;
      return employee || null;
    } catch (error) {
      console.error('Error fetching employee by id:', error);
      return null;
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
    } catch (error: any) {
      console.error('Error fetching employee schedules:', error?.errors || error?.message || error);
      return [];
    }
  }

  static async getVendorEmployees(vendorId: string): Promise<(Employee & { services: EmployeeService[] })[]> {
    try {
      const employeesResponse = await directus.request(
        readItems('employees', {
          filter: {
            vendor_id: { _eq: vendorId },
            status: { _eq: 'active' }
          },
          fields: ['id', 'vendor_id', 'name', 'email', 'photo', 'bio', 'timezone', 'status', 'sort_order', 'rating', 'reviews_count'],
          sort: ['sort_order']
        })
      );

      const employees = (employeesResponse as Employee[]) || [];
      console.log(`[SimpleDirectusService] Fetched ${employees.length} employees for vendor ${vendorId}`);

      if (employees.length === 0) {
        return [];
      }

      const employeeIds = employees.map((employee) => employee.id);
      const servicesResponse = await directus.request(
        readItems('employee_services', {
          filter: {
            employee_id: { _in: employeeIds },
            is_active: { _eq: true }
          },
          fields: ['*'],
          sort: ['sort_order']
        })
      );

      const services = (servicesResponse as EmployeeService[]) || [];

      return employees.map((employee) => ({
        ...employee,
        image: employee.photo,
        services: services.filter((service) => service.employee_id === employee.id)
      }));
    } catch (error) {
      console.error('Error fetching vendor employees:', error);
      return [];
    }
  }

  static async getBookings(employeeId: number | string, startDate: Date, endDate: Date): Promise<Booking[]> {
    try {
      const params = new URLSearchParams({
        employeeId: String(employeeId),
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      });

      const response = await fetch(`/api/bookings?${params.toString()}`, {
        cache: 'no-store'
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Failed to fetch bookings');
      }

      const payload = await response.json();
      return (payload?.data || []) as Booking[];
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  static async createBooking(data: Partial<Booking>): Promise<Booking> {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || error?.errors?.[0]?.message || 'Failed to create booking');
      }

      const text = await response.text();
      return text ? JSON.parse(text) : (data as Booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  static async createVendorReview(data: any) {
    try {
      const publicUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || "";
      const isLocal = publicUrl.includes('localhost') || publicUrl === '' || publicUrl.includes('127.0.0.1');
      const endpoint = isLocal ? '/items/reviews' : `${publicUrl}/items/reviews`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Directus Review Error:', errorData);
        throw new Error('Failed to create vendor review');
      }
      return await response.json();
    } catch (error: any) {
      console.error('Error creating vendor review:', error?.errors || error?.message || error);
      throw error;
    }
  }

  static async createEmployeeReview(data: any) {
    try {
      const response = await fetch('/api/employee-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Failed to create employee review');
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating employee review:', error);
      throw error;
    }
  }

  static async createBusinessLead(data: any) {
    try {
      const response = await fetch('/api/business-leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error || 'Failed to create lead');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating business lead:', error);
      throw error;
    }
  }
}
