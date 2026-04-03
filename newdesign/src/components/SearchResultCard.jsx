import React, { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SearchResultCard({ venue }) {
  const [currentImage, setCurrentImage] = useState(0);

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % venue.images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + venue.images.length) % venue.images.length);
  };

  return (
    <Link to={`/venue/${venue.id}`} className="block border-b border-border/50 pb-6 mb-6 last:border-b-0 hover:bg-muted/20 -mx-2 px-2 rounded-xl transition-colors">
      {/* Image Gallery + Info */}
      <div className="flex gap-4">
        {/* Image Carousel */}
        <div className="relative w-32 h-24 md:w-40 md:h-28 rounded-xl overflow-hidden flex-shrink-0 group">
          <img
            src={venue.images[currentImage]}
            alt={venue.name}
            className="w-full h-full object-cover"
            width={160}
            height={112}
          />
          {venue.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Next image"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                {venue.images.map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      i === currentImage ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-foreground text-base line-clamp-1">{venue.name}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {venue.distance} • {venue.location}
              </p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-semibold">{venue.rating}</span>
              <span className="text-sm text-muted-foreground">({venue.reviews})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mt-4 space-y-3">
        {venue.services.slice(0, 2).map((service, idx) => (
          <div key={idx} className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground line-clamp-2">{service.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{service.duration}</p>
              </div>
              <p className="text-sm font-semibold text-foreground flex-shrink-0">
                {service.priceFrom ? `from $${service.price}` : `$${service.price}`}
              </p>
            </div>
            {/* Time Slots */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {service.timeSlots.map((slot) => (
                <button
                  key={slot}
                  className="px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:border-primary hover:text-primary transition-colors"
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* See all services */}
      {venue.totalServices > 2 && (
        <span className="inline-block mt-3 text-sm font-medium text-primary hover:underline cursor-pointer">
          See all {venue.totalServices} services
        </span>
      )}
    </Link>
  );
}