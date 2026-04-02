"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Map, LocateFixed, ChevronDown } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVendors, useSearchLocations } from "@/hooks/useDirectus";
import { VendorCard } from "@/components/vendor-card";
import { SearchResultsMap } from "@/components/search-results-map";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";

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
  latitude?: number;
  longitude?: number;
  services?: any[];
  categories?: any[];
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get("category") || "";
  const initialLocation = searchParams.get("location") || "";
  const searchQuery = searchParams.get("search") || "";
  const initialLatitude = searchParams.get("lat");
  const initialLongitude = searchParams.get("lng");
  const initialNearMe = searchParams.get("nearMe") === "1";

  const [category, setCategory] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [showMap, setShowMap] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(
    initialNearMe && initialLatitude && initialLongitude
      ? {
          latitude: Number(initialLatitude),
          longitude: Number(initialLongitude),
        }
      : null
  );
  const { data: searchLocations } = useSearchLocations();
  const locationOptions = [
    { value: "", label: "All locations", city: "" },
    ...(searchLocations.length > 0
      ? searchLocations
      : [{ value: "Karachi", label: "Karachi", city: "Karachi" }]),
  ];

  const { data: vendors, loading, error } = useVendors({
    category: category || undefined,
    location: location || undefined,
    search: searchQuery || undefined,
    latitude: userLocation?.latitude,
    longitude: userLocation?.longitude,
  });

  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const categoriesData = await SimpleDirectusService.getCategories();
        setCategories(categoriesData);
      } catch (loadError) {
        console.error("Error loading categories:", loadError);
      }
    }

    loadInitialData();
  }, []);

  useEffect(() => {
    setCategory(initialCategory);
    setLocation(initialLocation);
    setUserLocation(
      initialNearMe && initialLatitude && initialLongitude
        ? {
            latitude: Number(initialLatitude),
            longitude: Number(initialLongitude),
          }
        : null
    );
  }, [initialCategory, initialLocation]);

  const locationLabel = useMemo(() => {
    return locationOptions.find((option) => option.value === location)?.label || location;
  }, [location, locationOptions]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (category) {
      params.set("category", category);
    } else if (searchQuery) {
      params.set("search", searchQuery);
    }
    if (location) {
      params.set("location", location);
    }
    if (userLocation) {
      params.set("nearMe", "1");
      params.set("lat", String(userLocation.latitude));
      params.set("lng", String(userLocation.longitude));
    }
    router.push(`/search?${params.toString()}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextUserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setUserLocation(nextUserLocation);
        setShowMap(true);

        const params = new URLSearchParams();
        if (category) {
          params.set("category", category);
        } else if (searchQuery) {
          params.set("search", searchQuery);
        }
        if (location) {
          params.set("location", location);
        }
        params.set("nearMe", "1");
        params.set("lat", String(nextUserLocation.latitude));
        params.set("lng", String(nextUserLocation.longitude));
        router.push(`/search?${params.toString()}`);
        setIsLocating(false);
      },
      () => {
        const msg = !window.isSecureContext 
          ? "Location requires a secure (HTTPS) connection." 
          : "Unable to get your location right now.";
        setLocationError(msg);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50/70 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <SiteBreadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Search Results" },
            ]}
            className="mb-4"
          />
          <div className="flex flex-col gap-3 rounded-3xl border border-gray-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <div className="relative flex w-full items-center sm:min-w-[180px] sm:flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none transition hover:border-purple-300 focus:border-purple-300"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>

              <div className="relative flex w-full items-center sm:min-w-[220px] sm:flex-1">
                <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  className="w-full appearance-none rounded-2xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm outline-none transition hover:border-purple-300 focus:border-purple-300"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc.value} value={loc.value}>
                      {loc.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>

              <Button
                className="h-11 w-full rounded-2xl bg-purple-600 px-5 text-white shadow-sm hover:bg-purple-700 sm:w-auto"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
              <Button
                variant="outline"
                className="w-full rounded-2xl gap-2 border-gray-200 lg:w-auto"
                onClick={handleUseMyLocation}
                disabled={isLocating}
              >
                <LocateFixed className="size-4" />
                {isLocating ? "Finding you..." : "Use my location"}
              </Button>
              <Button
                variant={showMap ? "default" : "outline"}
                className="w-full rounded-2xl gap-2 border-gray-200 lg:w-auto"
                onClick={() => setShowMap((current) => !current)}
              >
                <Map className="size-4" />
                {showMap ? "Hide map" : "Show map"}
              </Button>
            </div>
          </div>
          {locationError && (
            <p className="mt-3 text-sm text-red-600">{locationError}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Best {category || "Venues"}{location ? ` in ${locationLabel}` : " across Pakistan"}
            </h1>
            <p className="mt-2 text-gray-600">Showing {vendors?.length || 0} results</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-600" />
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-red-600">Error loading vendors: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${showMap ? "xl:grid-cols-[minmax(0,1fr)_420px]" : "grid-cols-1"}`}>
            <div className={`grid gap-6 ${showMap ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"}`}>
              {vendors?.map((vendor: SearchVendor) => (
                <VendorCard key={vendor.id} vendor={vendor as any} />
              ))}
              {vendors?.length === 0 && (
                <div className="col-span-full rounded-xl bg-gray-50 py-20 text-center">
                  <p className="text-gray-500">No venues found for your search.</p>
                </div>
              )}
            </div>

            {showMap && (
              <div className="xl:sticky xl:top-6 xl:self-start">
                <SearchResultsMap vendors={(vendors || []) as any} userLocation={userLocation} />
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
