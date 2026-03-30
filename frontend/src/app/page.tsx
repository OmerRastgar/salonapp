"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCategories, useLocations } from "@/hooks/useDirectus";
import { SimpleDirectusService } from "@/lib/directus-simple";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Karachi");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [appointmentsCount, setAppointmentsCount] = useState(418036);
  
  // Dynamic counter effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAppointmentsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
    }, 15000); // Update every 15 seconds for a "live" feel
    return () => clearInterval(interval);
  }, []);
  
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: locations, loading: locationsLoading } = useLocations();

  // Debug logging
  console.log('Categories:', categories, 'Loading:', categoriesLoading);
  console.log('Locations:', locations, 'Loading:', locationsLoading);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("category", searchQuery);
    params.set("location", location);
    router.push(`/search?${params.toString()}`);
  };

  const popularCategories = categories?.length > 0 
    ? categories.map((c) => c.name) 
    : ["Hair Salon", "Barber", "Spa", "Nail Salon", "Beauty Salon", "Massage"];

  const cities = locations?.length > 0 
    ? locations.map((l) => l.name) 
    : ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan"];

  const filteredSuggestions = popularCategories.filter(cat => 
    cat.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold mb-4">
          Discover Beauty & Wellness
          <br />
          Near You
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Book appointments at the best vendors, spas, and barbershops across Pakistan
        </p>


        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="bg-white rounded-full shadow-lg p-2 flex items-center gap-2 border border-gray-100">
            <div className="flex-1 flex items-center gap-2 px-4 relative">
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
                className="flex-1 outline-none text-lg py-2"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              
              {/* Autocomplete Dropdown */}
              {showSuggestions && searchQuery && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-[60] overflow-hidden">
                  {filteredSuggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      className="w-full text-left px-6 py-3 hover:bg-purple-50 flex items-center gap-3 transition-colors"
                      onClick={() => {
                        setSearchQuery(suggestion);
                        setShowSuggestions(false);
                        const params = new URLSearchParams();
                        params.set("category", suggestion);
                        params.set("location", location);
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
            <div className="h-10 w-px bg-gray-200" />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-4 outline-none text-lg bg-transparent cursor-pointer"
          >
            {cities.map((city: string) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <Button 
            size="lg" 
            className="rounded-full px-8 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={handleSearch}
          >
            Search
          </Button>
        </div>

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
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-purple-900 tracking-tighter tabular-nums">
                {appointmentsCount.toLocaleString()}
              </span>
              <span className="text-gray-600 font-semibold uppercase text-xs tracking-wider">appointments Booked</span>
            </div>
          </div>
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
                  const params = new URLSearchParams();
                  params.set("category", category);
                  params.set("location", location);
                  router.push(`/search?${params.toString()}`);
                }}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Cities Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {cities.map((city: string) => (
            <button
              key={city}
              onClick={() => {
                const params = new URLSearchParams();
                if (searchQuery) params.set("category", searchQuery);
                params.set("location", city);
                router.push(`/search?${params.toString()}`);
              }}
              className="p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <h3 className="font-semibold text-lg mb-1">{city}</h3>
              <p className="text-sm text-gray-600">Explore venues</p>
            </button>
          ))}
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
