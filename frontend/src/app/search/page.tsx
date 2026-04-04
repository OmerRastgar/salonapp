"use client";

import { useMemo, useState, Suspense, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Map, X, LocateFixed, ChevronDown, Filter } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVendors, useSearchLocations } from "@/hooks/useDirectus";
import { VendorCard } from "@/components/vendor-card";
import { SearchResultsMap } from "@/components/search-results-map";
import { SimpleDirectusService } from "@/lib/directus-simple";
import { SiteBreadcrumbs } from "@/components/site-breadcrumbs";
import { motion, AnimatePresence } from "motion/react";
import SearchBar from "@/components/ui/SearchBar";
import VenueCard from "@/components/ui/VenueCard";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Directly derive search parameters from URL to ensure reactivity
  const category = searchParams.get("category") || "";
  const location = searchParams.get("location") || "";
  const searchQuery = searchParams.get("search") || "";
  
  const [showMap, setShowMap] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([]);

  const { data: searchLocations } = useSearchLocations();
  const { data: vendors, loading, error } = useVendors({
    category: category || undefined,
    location: location || undefined,
    search: searchQuery || undefined,
  });

  useEffect(() => {
    SimpleDirectusService.getCategories().then(setCategories);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Header / Sub-Toolbar - Sticky for easy access */}
      <header className="sticky top-0 z-[110] border-b border-border/40 bg-white/90 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-3 flex flex-col md:flex-row items-center gap-4">
           <div className="hidden md:flex items-center gap-3 w-full md:w-auto">
              <SiteBreadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
           </div>
           
           <div className="flex-1 flex items-center justify-center">
              <SearchBar 
                initialTreatment={searchQuery}
                initialLocation={location}
                onSearch={(data) => {
                  const params = new URLSearchParams();
                  if (data.treatment) params.set("search", data.treatment);
                  const loc = data.location === "Current location" ? "__near_me__" : data.location;
                  if (loc && loc !== "" && loc !== "__near_me__") params.set("location", loc);
                  if (data.date) params.set("date", data.date.toISOString());
                  router.push(`/search?${params.toString()}`);
                }}
              />
            </div>
            
            {/* Desktop Map Toggle */}
            <div className="hidden lg:flex items-center gap-2 border-l border-border/40 pl-6 ml-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowMap(!showMap)}
                className={`rounded-full font-bold text-xs gap-2 px-4 ${showMap ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
              >
                {showMap ? <X className="size-3" /> : <Map className="size-3" />}
                {showMap ? "Hide Map" : "Show Map"}
              </Button>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex relative">
        
        {/* Results Column */}
        <div className={`flex-1 transition-all duration-500 ease-in-out ${showMap ? 'lg:w-[50%] xl:w-[45%]' : 'w-full'}`}>
           <div className="px-4 md:px-6 py-6 md:py-10 min-h-[500px]">
              <div className="max-w-4xl mx-auto">
                 <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
                        {category ? categories.find(c => c.slug === category)?.name : 'All Venues'}
                        {location && <span className="text-primary/70"> in {location}</span>}
                    </h1>
                    <p className="text-muted-foreground mt-2 font-bold uppercase tracking-wider text-[10px]">
                      Found {vendors?.length || 0} premium locations
                    </p>
                 </div>

                 {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {[1,2,3,4].map(i => <div key={i} className="aspect-[4/3] bg-muted/40 animate-pulse rounded-3xl" />)}
                    </div>
                 ) : vendors && vendors.length > 0 ? (
                    <div className={`grid gap-10 ${showMap ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                       {vendors.map((vendor, idx) => (
                           <VenueCard 
                             key={vendor.id}
                             index={idx}
                             venue={{
                               id: vendor.id,
                               name: vendor.name,
                               image: vendor.cover_image || '',
                               rating: Number(vendor.rating || 5.0),
                               reviews: Number(vendor.reviews_count || 0),
                               location: `${vendor.area}, ${vendor.city}`,
                               category: (vendor as any).categories?.[0]?.name || 'Salon',
                               slug: vendor.slug
                             }} 
                           />
                       ))}
                    </div>
                 ) : (
                    <div className="py-24 text-center bg-muted/20 rounded-[40px] border border-dashed border-border/60">
                       <p className="text-muted-foreground font-bold italic mb-4">No results found for your specific criteria.</p>
                       <Button 
                         variant="outline" 
                         onClick={() => router.push("/search")} 
                         className="rounded-full border-primary/20 text-primary font-bold px-8"
                       >
                         Clear all filters
                       </Button>
                    </div>
                 )}
              </div>
           </div>
        </div>
        
        {/* ... (rest of main as is) */}


        {/* Right Column: Fixed Map */}
        <AnimatePresence>
            {showMap && (
                <motion.div 
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="hidden lg:block w-[50%] xl:w-[55%] h-full bg-muted/10 relative z-10"
                >
                    <SearchResultsMap vendors={(vendors || []) as any} fullBleed={true} />
                </motion.div>
            )}
        </AnimatePresence>

        {/* Mobile Map Toggle Button */}
        <Button 
            onClick={() => setShowMap(!showMap)}
            className="lg:hidden fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] rounded-full shadow-2xl bg-foreground text-background px-8 py-6 font-bold flex items-center gap-3 scale-110"
        >
            {showMap ? <X className="size-5" /> : <Map className="size-5" />}
            {showMap ? "Hide Map" : "Show Map"}
        </Button>

        {/* Mobile Fullscreen Map Overlay */}
        <AnimatePresence>
            {showMap && (
                <motion.div 
                    initial={{ opacity: 0, y: '100%' }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: '100%' }}
                    className="lg:hidden fixed inset-0 z-50 bg-background pt-16"
                >
                    <div className="w-full h-full">
                        <SearchResultsMap vendors={(vendors || []) as any} fullBleed={true} />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-muted-foreground">Loading marketplace...</div>}>
      <SearchContent />
    </Suspense>
  );
}
