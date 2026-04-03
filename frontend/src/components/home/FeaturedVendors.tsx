"use client";

import React, { useCallback } from 'react';
import { Star, MapPin, ChevronRight, ChevronLeft } from 'lucide-react';
import { Vendor, SimpleDirectusService } from '@/lib/directus-simple';
import { motion } from 'motion/react';
import { useRouter } from 'next/navigation';
import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';

interface FeaturedVendorsProps {
  vendors: Vendor[];
}

import VenueCard from '@/components/ui/VenueCard';

export function FeaturedVendors({ vendors }: FeaturedVendorsProps) {
  const router = useRouter();
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between px-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Recommended</h2>
          <p className="text-muted-foreground mt-2 font-medium italic">Hand-picked premium experiences near you.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={scrollPrev}
            className="p-3 rounded-full border border-border/60 bg-white hover:bg-muted/50 hover:border-purple-300 transition-all shadow-sm"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button 
            onClick={scrollNext}
            className="p-3 rounded-full border border-border/60 bg-white hover:bg-muted/50 hover:border-purple-300 transition-all shadow-sm"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden px-4 -mx-4 pb-12" ref={emblaRef}>
        <div className="flex gap-8">
          {vendors.map((vendor, idx) => (
            <div key={vendor.id} className="flex-[0_0_85%] sm:flex-[0_0_45%] lg:flex-[0_0_30%] min-w-0">
               <VenueCard 
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
