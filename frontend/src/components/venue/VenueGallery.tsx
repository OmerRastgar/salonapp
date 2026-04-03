"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'motion/react';

interface VenueGalleryProps {
  images: string[];
}

export default function VenueGallery({ images }: VenueGalleryProps) {
  // Filter out empty or null images to prevent Next.js Image errors
  const validImages = (images || []).filter(img => img && img.trim() !== "");
  
  // Combine valid images with placeholders to always have at least 5 for the bento grid
  const placeholders = [
    '/assets/bf1e5cc1-dcfd-4867-b6dc-337192b3427c', // Glamour Interior
    '/assets/060814e7-a997-4c9a-8b4f-6cac367003c5', // Modern Barber Shop
    '/assets/48bbad28-4fca-47f5-9e6d-fd84be1f31a4', // Royal Beauty Lounge
    '/assets/90238b8c-5931-4c60-9a52-a6f7e4399adb', // Glamour Spa Interior
    '/assets/bd750759-f528-4961-8a50-370df6913738'  // Luxe Hair Interior
  ];

  const displayImages = validImages.length >= 5 
    ? validImages 
    : [...validImages, ...placeholders.slice(0, 5 - validImages.length)];

  return (
    <section className="mt-8 rounded-3xl overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px]">
        {/* Main Large Image */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="md:col-span-2 md:row-span-2 relative h-full w-full group overflow-hidden cursor-zoom-in"
        >
          <Image
            src={displayImages[0]}
            alt="Venue view 1"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={displayImages[0]?.includes("/assets/") || displayImages[0]?.includes("localhost") || displayImages[0]?.includes("ui-avatars.com") || displayImages[0]?.includes("images.unsplash.com")}
          />
        </motion.div>

        {/* Small Images */}
        {displayImages.slice(1, 5).map((img, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: (idx + 1) * 0.1 }}
            className="relative h-full w-full group overflow-hidden cursor-zoom-in hidden md:block"
          >
            <Image
              src={img}
              alt={`Venue view ${idx + 2}`}
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              fill
              sizes="25vw"
              unoptimized={img?.includes("/assets/") || img?.includes("localhost") || img?.includes("ui-avatars.com") || img?.includes("images.unsplash.com")}
            />
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm group-hover:bg-black/50 transition-colors">
                +{images.length - 5} photos
              </div>
            )}
          </motion.div>
        ))}
        
        {/* Mobile secondary image (if multi-col) */}
        <div className="md:hidden grid grid-cols-2 gap-2 h-[150px]">
             {displayImages.slice(1, 3).map((img, idx) => (
                <div key={idx} className="relative h-full w-full overflow-hidden rounded-lg">
                    <Image 
                      src={img} 
                      alt="More views" 
                      fill 
                      className="object-cover" 
            unoptimized={img?.includes("/assets/") || img?.includes("localhost") || img?.includes("ui-avatars.com") || img?.includes("images.unsplash.com")}
                    />
                </div>
             ))}
        </div>
      </div>
    </section>
  );
}
