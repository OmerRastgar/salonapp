"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories, useSearchLocations } from "@/hooks/useDirectus";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(418036);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  
  // Load the shared live activity count, then persist each increment so all users see the same number move.
  useEffect(() => {
    let cancelled = false;

    async function loadActivityCount() {
      try {
        const response = await fetch("/api/live-activity", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load live activity");
        }

        const payload = await response.json();
        if (!cancelled && Number.isFinite(Number(payload?.appointmentsBooked))) {
          setAppointmentsCount(Number(payload.appointmentsBooked));
        }
      } catch (error) {
        console.error("Failed to load live activity:", error);
        if (!cancelled) {
          setActivityError("Live activity is temporarily unavailable.");
        }
      }
    }

    loadActivityCount();

    const interval = setInterval(() => {
      const incrementBy = Math.floor(Math.random() * 3) + 1;

      setAppointmentsCount((prev) => prev + incrementBy);

      fetch("/api/live-activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incrementBy }),
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error("Failed to persist live activity");
          }
          return response.json();
        })
        .then((payload) => {
          if (!cancelled && Number.isFinite(Number(payload?.appointmentsBooked))) {
            setAppointmentsCount(Number(payload.appointmentsBooked));
            setActivityError(null);
          }
        })
        .catch((error) => {
          console.error("Failed to persist live activity:", error);
          if (!cancelled) {
            setActivityError("Live activity is temporarily unavailable.");
          }
        });
    }, 15000); // Update every 15 seconds for a "live" feel

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);
  
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: searchLocations, loading: locationsLoading } = useSearchLocations();

  const buildSearchParams = (overrides?: { search?: string; category?: string; location?: string }) => {
    const params = new URLSearchParams();
    const nextSearch = overrides?.category ? overrides.search : (overrides?.search ?? searchQuery);
    const nextCategory = overrides?.category;
    const nextLocation = overrides?.location ?? location;

    if (nextSearch) params.set("search", nextSearch);
    if (nextCategory) params.set("category", nextCategory);
    if (nextLocation && nextLocation !== "__near_me__") {
      params.set("location", nextLocation);
    }
    if (userLocation) {
      params.set("nearMe", "1");
      params.set("lat", String(userLocation.latitude));
      params.set("lng", String(userLocation.longitude));
    }
    return params;
  };

  const handleSearch = () => {
    const params = buildSearchParams();
    router.push(`/search?${params.toString()}`);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Your browser does not support location access.");
      setLocation("");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocation("__near_me__");
        setIsLocating(false);
      },
      () => {
        setLocationError("Unable to get your location right now.");
        setLocation("");
        setUserLocation(null);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const popularCategories = categories?.length > 0 
    ? categories.map((c) => c.name) 
    : ["Hair Salon", "Barber", "Spa", "Nail Salon", "Beauty Salon", "Massage"];

  const dynamicLocations = searchLocations?.length > 0
    ? searchLocations
    : [
        { value: "Karachi", label: "Karachi", city: "Karachi" },
        { value: "Lahore", label: "Lahore", city: "Lahore" },
        { value: "Islamabad", label: "Islamabad", city: "Islamabad" },
        { value: "Rawalpindi", label: "Rawalpindi", city: "Rawalpindi" },
        { value: "Faisalabad", label: "Faisalabad", city: "Faisalabad" },
        { value: "Multan", label: "Multan", city: "Multan" },
      ];
  const locationOptions = [
    { value: "", label: "All locations" },
    { value: "__near_me__", label: isLocating ? "Finding your location..." : "Use my location" },
    ...dynamicLocations,
  ];

  const filteredSuggestions = popularCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* Hero Section */}
      <div className="mx-auto max-w-4xl px-4 py-14 text-center sm:py-20">
        <h1 className="mb-4 text-4xl font-bold leading-tight sm:text-5xl">
          Discover Beauty & Wellness
          <br />
          Near You
        </h1>
        <p className="mb-12 text-lg text-gray-600 sm:text-xl">
          Book appointments at the best vendors, spas, and barbershops across Pakistan
        </p>


        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="flex flex-col gap-2 rounded-[28px] border border-gray-200/80 bg-white p-2 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] sm:flex-row sm:items-center sm:rounded-full">
            <div className="relative flex min-w-0 flex-1 items-center gap-2 rounded-2xl px-3 py-1 sm:px-4">
              <Search className="size-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for services (e.g. Barber, Salon)"
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none sm:text-lg"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-[60] mt-2 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-6 py-3 hover:bg-purple-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        const params = buildSearchParams({ search: suggestion });
                        router.push(`/search?${params.toString()}`);
                      }}
                    >
                      <Search className="size-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden h-10 w-px bg-gray-200 sm:block" />
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
              <div className="relative w-full sm:w-auto">
                <select
                  value={location}
                  onChange={(e) => {
                    const nextLocation = e.target.value;
                    if (nextLocation === "__near_me__") {
                      handleUseMyLocation();
                      return;
                    }
                    setLocation(nextLocation);
                    setLocationError(null);
                    setUserLocation(null);
                  }}
                  className="w-full appearance-none rounded-2xl border border-transparent bg-gray-50 px-4 py-3 pr-10 text-base text-gray-700 outline-none transition focus:border-purple-200 focus:bg-white sm:min-w-[200px] sm:bg-transparent sm:py-2 sm:text-lg"
                >
                  {locationOptions.map((option: any) => {
                    const value = typeof option === "string" ? option : option.value;
                    const label = typeof option === "string" ? option : option.label;
                    return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                    );
                  })}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              </div>
              <Button 
                size="lg" 
                className="w-full rounded-2xl bg-purple-600 px-6 text-white shadow-sm hover:bg-purple-700 sm:w-auto sm:rounded-full sm:px-8"
                onClick={handleSearch}
              >
                Search
              </Button>
            </div>
          </div>
          {locationError && (
            <p className="px-2 pt-3 text-left text-sm text-red-600">{locationError}</p>
          )}

        {/* Live Appointment Counter */}
        <div className="flex flex-col items-center mt-8 mb-12">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Live Activity</span>
          </div>
          <div className="bg-white border-2 border-purple-100 rounded-2xl p-6 shadow-md inline-block relative z-10">
            <div className="flex flex-wrap items-baseline justify-center gap-3">
              <span className="text-3xl font-black tracking-tighter text-purple-900 tabular-nums sm:text-4xl">
                {appointmentsCount.toLocaleString()}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">appointments Booked</span>
            </div>
          </div>
          {activityError && (
            <p className="mt-2 text-xs text-gray-500">{activityError}</p>
          )}
        </div>
      </div>

        {/* Popular Categories */}
        <div className="mb-12">
          <p className="text-sm text-gray-600 mb-4">Popular searches:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularCategories.map((category: string) => (
              <button
                key={category}
                onClick={() => {
                  setSearchQuery(category);
                  const params = buildSearchParams({ category });
                  router.push(`/search?${params.toString()}`);
                }}
                className="rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm transition hover:border-purple-300 hover:bg-purple-50"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Cities Grid */}
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {locationOptions
            .filter((option: any) => {
              const value = typeof option === "string" ? option : option.value;
              return value && value !== "__near_me__";
            })
            .map((option: any) => {
            const value = typeof option === "string" ? option : option.value;
            const label = typeof option === "string" ? option : option.label;
            return (
            <button
              key={value}
              onClick={() => {
                const params = buildSearchParams({ location: value });
                router.push(`/search?${params.toString()}`);
              }}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="font-semibold text-lg mb-1">{label}</h3>
              <p className="text-sm text-gray-600">Explore venues</p>
            </button>
            );
          })}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white border-t py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Clyp?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="size-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Booking</h3>
              <p className="text-gray-600">
                Book appointments 24/7 with instant confirmation
              </p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Reviews</h3>
              <p className="text-gray-600">
                Read authentic reviews from real customers
              </p>
            </div>
            <div className="text-center">
              <div className="size-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⏲️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Wait Time</h3>
              <p className="text-gray-600">
                Book and get served instantly without the queue
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-2xl text-purple-600 mb-6">Clyp</h3>
              <Button variant="outline" className="rounded-full gap-2">
                Get the App
                <span className="text-lg">📱</span>
              </Button>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About Clyp</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#" className="block hover:text-gray-900">Careers</a>
                <a href="#" className="block hover:text-gray-900">Customer support</a>
                <a href="#" className="block hover:text-gray-900">Blog</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For business</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#" className="block hover:text-gray-900">For partners</a>
                <a href="#" className="block hover:text-gray-900">Pricing</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <a href="#" className="block hover:text-gray-900">Privacy Policy</a>
                <a href="#" className="block hover:text-gray-900">Terms of service</a>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-8 border-t text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span>🇵🇰 Pakistan</span>
            </div>
            <p>© 2026 Clyp Pakistan</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
