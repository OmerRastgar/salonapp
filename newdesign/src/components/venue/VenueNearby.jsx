import React from 'react';
import { Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const NEARBY = [
  { id: 2, name: 'Luxe Hair Studio', rating: 4.9, reviews: 87, location: 'Downtown, Denver', category: 'Hair Salon', image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/bb10d0cbe_generated_a06bd202.png' },
  { id: 3, name: 'The Styling Room', rating: 5.0, reviews: 234, location: 'Midtown, Denver', category: 'Hair Salon', image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/36c1442c1_generated_76277903.png' },
  { id: 4, name: 'Roots & Ends Salon', rating: 5.0, reviews: 412, location: 'Cherry Creek, Denver', category: 'Beauty Salon', image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/79b2b8d59_generated_7091f471.png' },
  { id: 5, name: 'Modern Mane', rating: 4.8, reviews: 156, location: 'RiNo, Denver', category: 'Barber', image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/d4fb567ce_generated_9e6521ba.png' },
];

function NearbyCard({ venue }) {
  return (
    <Link to={`/venue/${venue.id}`} className="group flex-shrink-0 w-56">
      <div className="rounded-xl overflow-hidden mb-3 aspect-[4/3]">
        <img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      </div>
      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1">{venue.name}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{venue.location}</p>
      <div className="flex items-center gap-1 mt-1">
        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
        <span className="text-xs font-semibold">{venue.rating}</span>
        <span className="text-xs text-muted-foreground">({venue.reviews})</span>
        <span className="text-xs text-muted-foreground ml-1">· {venue.category}</span>
      </div>
    </Link>
  );
}

export default function VenueNearby() {
  return (
    <section className="mt-16 pb-24 lg:pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold text-foreground">Venues nearby</h2>
        <Link to="/search" className="flex items-center gap-1 text-sm text-primary font-medium hover:underline">
          See all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="flex gap-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
        {NEARBY.map(v => <NearbyCard key={v.id} venue={v} />)}
      </div>
    </section>
  );
}