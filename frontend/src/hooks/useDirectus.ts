import { useState, useEffect } from 'react';
import { SimpleDirectusService, Vendor, Category, Location } from '@/lib/directus-simple';

// Custom hook for fetching vendors
export function useVendors(options: {
  category?: string;
  location?: string;
  featured?: boolean;
  limit?: number;
  offset?: number;
} = {}) {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    async function fetchVendors() {
      try {
        setLoading(true);
        setError(null);
        const result = await SimpleDirectusService.getVendors(options);
        setData(result.data);
        setMeta(result.meta);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendors');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchVendors();
  }, [options.category, options.location, options.featured, options.limit, options.offset]);

  return { data, loading, error, meta };
}

// Custom hook for fetching a single vendor by slug
export function useVendor(slug: string) {
  const [data, setData] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    async function fetchVendor() {
      try {
        setLoading(true);
        setError(null);
        const result = await SimpleDirectusService.getVendorBySlug(slug);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch vendor');
        setData(null);
      } finally {
        setLoading(false);
      }
    }

    fetchVendor();
  }, [slug]);

  return { data, loading, error };
}

// Custom hook for fetching categories
export function useCategories() {
  const [data, setData] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true);
        setError(null);
        const categories = await SimpleDirectusService.getCategories();
        setData(categories);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return { data, loading, error };
}

// Custom hook for fetching locations
export function useLocations() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        setError(null);
        const locations = await SimpleDirectusService.getLocations();
        setData(locations);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  return { data, loading, error };
}

// Custom hook for searching vendors
export function useSearch(query: string, filters: {
  category?: string;
  location?: string;
  minRating?: number;
  womenOnly?: boolean;
} = {}) {
  const [data, setData] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setData([]);
      setLoading(false);
      return;
    }

    async function searchVendors() {
      try {
        setLoading(true);
        setError(null);
        const results = await SimpleDirectusService.getVendors({
        category: filters.category,
        location: filters.location
      });
      setData(results.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search vendors');
        setData([]);
      } finally {
        setLoading(false);
      }
    }

    const debounceTimer = setTimeout(searchVendors, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, filters.category, filters.location, filters.minRating, filters.womenOnly]);

  return { data, loading, error };
}
