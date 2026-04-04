"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCategories, useVendors } from "@/hooks/useDirectus";
import { motion } from "motion/react";
import { FeaturedVendors } from "@/components/home/FeaturedVendors";
import { SimpleDirectusService } from "@/lib/directus-simple";
import SearchBar from "@/components/ui/SearchBar";

export default function Home() {
  const router = useRouter();
  const [appointmentsCount, setAppointmentsCount] = useState(419473);
  
  const { data: categories } = useCategories();
  const { data: allVendors } = useVendors();
  const featuredVendors = allVendors?.filter(v => v.is_featured) || [];

  // Load the shared live activity count
  useEffect(() => {
    let cancelled = false;

    async function loadActivityCount() {
      try {
        const response = await fetch("/api/live-activity", { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to load live activity");

        const payload = await response.json();
        if (!cancelled && Number.isFinite(Number(payload?.appointmentsBooked))) {
          setAppointmentsCount(Number(payload.appointmentsBooked));
        }
      } catch (error) {
        console.error("Failed to load live activity:", error);
      }
    }

    const interval = setInterval(loadActivityCount, 20000);
    loadActivityCount();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="h-full bg-background overflow-y-auto custom-scrollbar">
      {/* Signature Animated 'Pink Blob' Background - More Vibrant & Morphing */}
      <motion.div
        className="absolute top-[-10%] right-[-10%] w-[400px] md:w-[1000px] h-[400px] md:h-[1000px] bg-gradient-to-br from-pink-500/30 via-purple-500/20 to-transparent rounded-full blur-[80px] md:blur-[140px] pointer-events-none z-0"
        animate={{ 
          scale: [1, 1.1, 0.95, 1.05, 1],
          rotate: [0, 90, 180, 270, 360],
          borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 20% 80% / 25% 80% 20% 75%", "40% 60% 70% 30% / 40% 50% 60% 50%"]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-10%] w-[350px] md:w-[800px] h-[350px] md:h-[800px] bg-gradient-to-tr from-purple-600/25 via-pink-400/20 to-transparent rounded-full blur-[70px] md:blur-[120px] pointer-events-none z-0"
        animate={{ 
          scale: [1, 1.15, 0.9, 1.1, 1],
          rotate: [360, 270, 180, 90, 0],
          borderRadius: ["50% 50% 20% 80% / 25% 80% 20% 75%", "40% 60% 70% 30% / 40% 50% 60% 50%", "50% 50% 20% 80% / 25% 80% 20% 75%"]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute top-[20%] left-[20%] w-[600px] h-[600px] bg-pink-400/10 rounded-full blur-[160px] pointer-events-none z-0"
        animate={{ 
          scale: [1, 1.3, 0.8, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Hero Section */}
      <div className="relative z-40 mx-auto max-w-4xl px-4 py-12 md:py-16 text-center sm:py-24">
        <h1 className="mb-6 text-4xl font-black leading-tight tracking-tighter sm:text-6xl md:text-7xl text-foreground">
          Book local
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-500">selfcare services</span>
        </h1>
        <p className="mb-12 text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover top-rated salons, barbers, and beauty experts trusted by millions worldwide.
        </p>
        
        <div className="mb-20">
          <SearchBar 
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

        {/* Live Counter */}
        <div className="flex flex-col items-center mb-20">
          <div className="flex items-center gap-2 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-bold text-green-600 uppercase tracking-[0.2em]">Live Activity</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-6xl font-black tracking-tighter tabular-nums text-foreground">
              {appointmentsCount.toLocaleString()}
            </span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground mt-2">
              Appointments Booked Today
            </span>
          </div>
        </div>
      </div>

      {/* Featured Vendors */}
      <section className="relative z-10 py-20 bg-white/40 backdrop-blur-sm border-t border-border/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <FeaturedVendors vendors={featuredVendors} />
        </div>
      </section>

      {/* Categories Modern Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-8">
         <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Popular Categories</h2>
            <p className="text-muted-foreground mt-2 font-medium italic">Discover professional care tailored to your needs.</p>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
             {categories?.map((cat, idx) => {
              const imageUrl = cat.image 
                ? SimpleDirectusService.getAssetUrl(cat.image)
                : 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400';
              
              return (
                <motion.button 
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => router.push(`/search?category=${encodeURIComponent(cat.slug)}`)}
                  className="group relative h-48 bg-white border border-border/40 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-purple-200/50 transition-all text-center"
                >
                  <img 
                    src={imageUrl || ''} 
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/40 z-10" />
                  <div className="relative z-20 h-full flex flex-col items-center justify-end pb-8">
                    <span className="font-black text-xs uppercase tracking-[0.2em] text-white group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </motion.button>
              );
            })}
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/40 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-muted-foreground">© 2026 Clyp Marketplace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
