"use client";

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import Link from 'next/link';
import { SimpleDirectusService } from '@/lib/directus-simple';

interface Venue {
  id: string | number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  category: string;
  slug?: string;
}

interface VenueCardProps {
  venue: Venue;
  index: number;
}

export default function VenueCard({ venue, index }: VenueCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const href = venue.slug ? `/vendor/${venue.slug}` : `/vendor/${venue.id}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={href}>
        {/* Image Container */}
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-muted">
          <Image
            src={venue.image ? SimpleDirectusService.getAssetUrl(venue.image)! : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800"}
            alt={venue.name}
            fill
            unoptimized={venue.image?.length > 0}
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Hover Overlay with Quick Book */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/70 mb-2 font-medium">Quick Book</p>
            <div className="flex gap-2">
              {['9:00 AM', '10:30 AM', '2:00 PM'].map((time) => (
                <button
                  key={time}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    // Handle quick book Logic
                  }}
                  className="px-2.5 py-1 text-[10px] font-semibold bg-white/95 text-foreground rounded-full hover:bg-white transition-colors"
                >
                  {time}
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="space-y-1.5 text-left">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
              <Star className="w-3.5 h-3.5 fill-foreground text-foreground" />
              <span className="text-xs font-bold text-foreground">{Number(venue.rating || 0).toFixed(1)}</span>
              <span className="text-[10px] font-medium text-muted-foreground">({venue.reviews.toLocaleString()})</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{venue.category}</p>
            <p className="text-sm text-foreground/70 font-medium line-clamp-1">{venue.location}</p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
