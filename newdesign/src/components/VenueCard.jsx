import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VenueCard({ venue, index }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
        <img
          src={venue.image}
          alt={venue.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width={400}
          height={300}
        />
        
        {/* Hover Overlay with Quick Book */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent"
        >
          <div className="flex gap-2">
            {['9:00 AM', '10:30 AM', '2:00 PM'].map((time) => (
              <button
                key={time}
                className="px-3 py-1.5 text-xs font-medium bg-white/95 text-foreground rounded-full hover:bg-white transition-colors"
              >
                {time}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-foreground text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {venue.name}
          </h3>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 fill-foreground text-foreground" />
            <span className="text-sm font-semibold text-foreground">{venue.rating}</span>
            <span className="text-sm text-muted-foreground">({venue.reviews.toLocaleString()})</span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground">{venue.location}</p>
        <p className="text-sm text-muted-foreground">{venue.category}</p>
      </div>
    </motion.div>
  );
}