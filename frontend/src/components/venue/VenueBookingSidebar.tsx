"use client";

import React from 'react';
import { Clock, MapPin, Phone, Mail, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Vendor, WorkingHour } from '@/lib/directus-simple';

interface VenueBookingSidebarProps {
  venue: Vendor;
}

export default function VenueBookingSidebar({ venue }: VenueBookingSidebarProps) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();

  const sortedHours = venue.working_hours?.sort((a, b) => a.day_of_week - b.day_of_week) || [];

  return (
    <div className="space-y-6">
      {/* Quick Booking CTA */}
      <Card className="rounded-2xl border border-border/50 shadow-xl shadow-primary/5 overflow-hidden">
        <CardContent className="p-6 bg-foreground text-background">
          <h3 className="text-xl font-bold mb-4">Book with us</h3>
          <p className="text-sm text-background/70 mb-6 leading-relaxed">
             Select a service to start your booking. We're open today until {sortedHours.find(h => h.day_of_week === today)?.close_time.slice(0, 5) || '8:00 PM'}.
          </p>
          <Button 
            className="w-full bg-white text-foreground hover:bg-white/90 rounded-full py-6 text-base font-bold transition-all hover:scale-105"
            onClick={() => {
                const element = document.getElementById('services-section');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Check Availability
          </Button>
        </CardContent>
      </Card>

      {/* Working Hours */}
      <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
             <Clock className="w-5 h-5 text-primary" />
             <h3 className="font-bold text-foreground">Working Hours</h3>
          </div>
          <div className="space-y-2.5">
             {sortedHours.map((wh) => (
                <div 
                    key={wh.day_of_week} 
                    className={`flex justify-between items-center text-sm font-medium ${
                        wh.day_of_week === today ? 'text-primary font-bold' : 'text-muted-foreground'
                    }`}
                >
                   <span>{days[wh.day_of_week]}</span>
                   <span className="flex items-center gap-1.5">
                      {wh.is_closed ? 'Closed' : `${wh.open_time.slice(0, 5)} – ${wh.close_time.slice(0, 5)}`}
                      {wh.day_of_week === today && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                   </span>
                </div>
             ))}
             {sortedHours.length === 0 && (
                <p className="text-xs text-muted-foreground">Hours not specified</p>
             )}
          </div>
        </CardContent>
      </Card>

      {/* Contact & Location */}
      <Card className="rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-muted-foreground" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
                <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight">
                    {venue.address}, {venue.area}, {venue.city}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-muted-foreground" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Contact</p>
                <p className="text-sm font-medium text-foreground">{venue.phone || 'Not available'}</p>
             </div>
          </div>

          <div className="pt-2">
            <Button 
                variant="outline" 
                className="w-full rounded-full border-border/60 font-semibold gap-2 hover:bg-muted/30"
                onClick={() => {
                    const url = `https://www.google.com/maps/search/?api=1&query=${venue.latitude},${venue.longitude}`;
                    window.open(url, '_blank');
                }}
            >
               Get Directions
               <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
