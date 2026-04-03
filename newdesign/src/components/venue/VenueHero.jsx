import React from 'react';
import { Star, MapPin, Clock, Share2, Heart, ChevronRight } from 'lucide-react';

export default function VenueHero({ venue }) {
  const dayIndex = new Date().getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = venue.hours.find(h => h.day === days[dayIndex]);
  const isClosed = today?.hours === 'Closed';

  return (
    <div className="mb-4">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-semibold text-foreground">
            {venue.name}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Rating */}
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(venue.rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                ))}
              </div>
              <span className="font-semibold text-sm">{venue.rating}</span>
              <span className="text-muted-foreground text-sm">({venue.reviews})</span>
            </div>

            <span className="text-border">•</span>

            {/* Status */}
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className={`text-sm font-medium ${isClosed ? 'text-red-500' : 'text-emerald-600'}`}>
                {isClosed ? 'Closed' : 'Open'}
              </span>
              {!isClosed && today && (
                <span className="text-sm text-muted-foreground">· closes at {today.hours.split('–')[1]?.trim()}</span>
              )}
              {isClosed && (
                <span className="text-sm text-muted-foreground">· opens {venue.opensAt}</span>
              )}
            </div>

            <span className="text-border">•</span>

            {/* Address */}
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{venue.address}</span>
              <button className="text-sm text-primary font-medium hover:underline ml-1 flex items-center gap-0.5">
                Get directions <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Share">
            <Share2 className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors" aria-label="Save">
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}