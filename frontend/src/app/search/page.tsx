"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Star, MapPin, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useVendors } from "@/hooks/useDirectus";
import { VendorCard } from "@/components/vendor-card";
import { SimpleDirectusService } from "@/lib/directus-simple";

// Simplified Vendor type for search page
interface SearchVendor {
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
  services?: any[];
  categories?: any[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Debug: Log all URL parameters
  console.log('All URL params:', Object.fromEntries(searchParams.entries()));
  
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "Karachi");
  
  const { data: vendors, loading, error } = useVendors({
    category: category || undefined,
    location: location || undefined
  });

  // Debug logging
  console.log('Search Debug - Category:', category, 'Location:', location);
  console.log('Vendors returned:', vendors, 'Loading:', loading, 'Error:', error);

  // Get categories and locations from service
  const [categories, setCategories] = useState<{id: string, name: string, slug: string}[]>([]);
  const [locations, setLocations] = useState<{id: string, name: string, slug: string}[]>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const categoriesData = await SimpleDirectusService.getCategories();
        const locationsData = await SimpleDirectusService.getLocations();
        setCategories(categoriesData);
        setLocations(locationsData);
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    }
    
    loadInitialData();
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    params.set("location", location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border rounded-lg pl-9 pr-8 py-2 text-sm bg-white cursor-pointer outline-none hover:border-purple-300 transition-colors w-auto min-w-[160px]"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="h-6 w-px bg-gray-300" />

            <div className="relative flex items-center">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border rounded-lg pl-9 pr-8 py-2 text-sm bg-white cursor-pointer outline-none hover:border-purple-300 transition-colors w-auto min-w-[140px]"
              >
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>

            <Button 
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 h-9 rounded-lg" 
                onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Title */}
        <h1 className="text-4xl font-bold mb-2">
          Best {category || "Venues"} in {location}
        </h1>
        <p className="text-gray-600 mb-6">
          Showing {vendors?.length || 0} results
        </p>

        {/* Vendor Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-600 mb-4">Error loading vendors: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {vendors?.map((vendor: SearchVendor) => (
              <VendorCard key={vendor.id} vendor={vendor as any} />
            ))}
            {vendors?.length === 0 && (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-xl">
                 <p className="text-gray-500">No venues found for your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
