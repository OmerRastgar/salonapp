"use client";

import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Vendor, Service, SimpleDirectusService } from '@/lib/directus-simple';
import { motion, AnimatePresence } from 'motion/react';

interface SearchResultCardProps {
  vendor: Vendor;
}

export default function SearchResultCard({ vendor }: SearchResultCardProps) {
  const [currentImage, setCurrentImage] = useState(0);
  const images = vendor.cover_image ? [SimpleDirectusService.getAssetUrl(vendor.cover_image)] : ["https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"];
  
  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const vendorHref = `/vendor/${vendor.slug || vendor.id}`;

  return (
    <div className="group border-b border-border/50 pb-8 mb-8 last:border-b-0 hover:bg-muted/30 -mx-4 px-4 rounded-2xl transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Image Carousel */}
        <div className="relative w-full md:w-64 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden flex-shrink-0 group/img shadow-sm">
          <Link href={vendorHref}>
            <Image
              src={images[currentImage] || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"}
              alt={vendor.name}
              fill
              className="object-cover transition-transform duration-700 group-hover/img:scale-110"
              sizes="(max-width: 768px) 100vw, 256px"
            />
          </Link>
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
                aria-label="Next image"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      i === currentImage ? 'bg-white w-3' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Quick distance/rating badge for mobile */}
          <div className="absolute top-3 left-3 md:hidden">
            <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm flex items-center gap-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              {Number(vendor.rating || 0).toFixed(1)}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <div>
            <div className="flex items-start justify-between gap-4">
              <Link href={vendorHref} className="flex-1 min-w-0">
                <h3 className="font-display text-xl md:text-2xl font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                  {vendor.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 text-muted-foreground">
                  <div className="flex items-center gap-1 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{vendor.area ? `${vendor.area}, ${vendor.city}` : vendor.city}</span>
                    {vendor.distance_km !== undefined && (
                      <span className="text-foreground/40 text-xs font-medium ml-1">
                        • {Number(vendor.distance_km || 0).toFixed(1)}km away
                      </span>
                    )}
                  </div>
                </div>
              </Link>
              
              <div className="hidden md:flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-1.5">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-foreground">Excellent</span>
                    <span className="text-[11px] text-muted-foreground">{vendor.reviews_count} reviews</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm">
                    {Number(vendor.rating || 0).toFixed(1)}
                  </div>
                </div>
              </div>
            </div>

            {/* Services Preview */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vendor.services?.slice(0, 2).map((service) => (
                <Link 
                    key={service.id} 
                    href={`${vendorHref}?service=${service.id}`}
                    className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-muted/20 hover:border-primary/30 hover:bg-white hover:shadow-md transition-all duration-300 group/service"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="font-semibold text-sm text-foreground line-clamp-1 group-hover/service:text-primary transition-colors">
                        {service.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{service.duration} mins</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-foreground">Rs. {service.price.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* View More Services */}
            {vendor.services && vendor.services.length > 2 && (
              <Link 
                href={vendorHref}
                className="inline-flex items-center gap-1 mt-4 text-sm font-semibold text-primary hover:underline transition-all"
              >
                View all {vendor.services.length} services
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
