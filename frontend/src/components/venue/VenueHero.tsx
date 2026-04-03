"use client";

import React from 'react';
import { Star, MapPin, Share2, Heart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Vendor, SimpleDirectusService } from '@/lib/directus-simple';

interface VenueHeroProps {
  venue: Vendor;
  onShare?: () => void;
}

export default function VenueHero({ venue, onShare }: VenueHeroProps) {
  const [isFavorited, setIsFavorited] = React.useState(false);
  const logoUrl = venue.logo ? SimpleDirectusService.getAssetUrl(venue.logo) : null;

  return (
    <section className="relative pt-4 pb-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
             {logoUrl && (
                <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-border/40">
                   <img src={logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200"} alt={venue.name} className="w-full h-full object-cover" />
                </div>
             )}
             <div className="flex flex-col">
                <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                    {venue.name}
                </h1>
             </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4 text-sm font-medium">
             <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-primary text-primary" />
                <span className="text-foreground font-bold">{Number(venue.rating || 0).toFixed(1)}</span>
                <span className="text-muted-foreground">({venue.reviews_count} reviews)</span>
             </div>
             <span className="text-foreground/20 hidden md:block">•</span>
             <div className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{venue.area ? `${venue.area}, ${venue.city}` : venue.city}</span>
             </div>
             {venue.is_verified && (
                <>
                   <span className="text-foreground/20 hidden md:block">•</span>
                   <div className="flex items-center gap-1.5 text-primary">
                      <CheckCircle className="w-4 h-4" />
                      <span>Verified</span>
                   </div>
                </>
             )}
          </div>
        </div>

        <div className="flex items-center gap-3 md:pb-1">
          <Button 
            variant="outline" 
            className="rounded-full gap-2 border-border/60 hover:bg-muted/50 font-semibold px-6"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className={`rounded-full w-12 h-12 border-border/60 hover:bg-muted/50 transition-colors ${isFavorited ? 'text-red-500 border-red-200 bg-red-50' : ''}`}
            onClick={() => setIsFavorited(!isFavorited)}
          >
            <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
          </Button>
          <Button 
            onClick={() => {
                const el = document.getElementById('services-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-bold shadow-lg shadow-primary/20 hidden md:flex"
          >
             Book Appointment
          </Button>
        </div>
      </div>
    </section>
  );
}
