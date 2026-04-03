import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Map, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import SearchHeader from '../components/SearchHeader';
import SearchResultCard from '../components/SearchResultCard';
import MapPanel from '../components/MapPanel';
import FilterChips from '../components/FilterChips';

const MOCK_VENUES = [
  {
    id: 1,
    name: 'Hair and More by Marsha',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/0afaf06d9_generated_image.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/aff06cbef_generated_image.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/12d28ec13_generated_image.png',
    ],
    rating: 5.0,
    reviews: 11,
    distance: '26.4 mi',
    location: 'Stanley/Aley, Wichita',
    coordinates: [37.6872, -97.3301],
    services: [
      { name: 'Shampoo', duration: '15 min', price: 10, timeSlots: ['4:45 PM', '5:00 PM'] },
      { name: 'Shampoo/Cut/Style — extra charges may apply for length and thickness', duration: '30 min – 1 hr', price: 50, priceFrom: true, timeSlots: ['4:45 PM'] },
    ],
    totalServices: 21,
  },
  {
    id: 2,
    name: 'Luxe Hair Studio',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/aff06cbef_generated_image.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/12d28ec13_generated_image.png',
    ],
    rating: 4.9,
    reviews: 87,
    distance: '3.2 mi',
    location: 'Downtown, Kansas City',
    coordinates: [39.0997, -94.5786],
    services: [
      { name: 'Haircut & Blow Dry', duration: '45 min', price: 35, timeSlots: ['10:00 AM', '11:30 AM', '2:00 PM'] },
      { name: 'Balayage', duration: '2 hr', price: 150, priceFrom: true, timeSlots: ['9:00 AM', '1:00 PM'] },
    ],
    totalServices: 15,
  },
  {
    id: 3,
    name: 'The Styling Room',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/12d28ec13_generated_image.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/0afaf06d9_generated_image.png',
    ],
    rating: 5.0,
    reviews: 234,
    distance: '5.8 mi',
    location: 'Midtown, Kansas City',
    coordinates: [39.0653, -94.5857],
    services: [
      { name: 'Blowout', duration: '30 min', price: 40, timeSlots: ['9:30 AM', '11:00 AM', '3:30 PM'] },
      { name: 'Full Color', duration: '1.5 hr', price: 95, timeSlots: ['10:00 AM', '2:00 PM'] },
    ],
    totalServices: 28,
  },
  {
    id: 4,
    name: 'Modern Mane',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/bb10d0cbe_generated_a06bd202.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/0afaf06d9_generated_image.png',
    ],
    rating: 4.8,
    reviews: 156,
    distance: '8.1 mi',
    location: 'Overland Park',
    coordinates: [38.9822, -94.6708],
    services: [
      { name: "Men's Haircut", duration: '30 min', price: 28, timeSlots: ['10:30 AM', '12:00 PM', '4:00 PM'] },
      { name: 'Highlights', duration: '2 hr', price: 120, priceFrom: true, timeSlots: ['9:00 AM'] },
    ],
    totalServices: 12,
  },
  {
    id: 5,
    name: 'Roots & Ends Salon',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/79b2b8d59_generated_7091f471.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/aff06cbef_generated_image.png',
    ],
    rating: 5.0,
    reviews: 412,
    distance: '2.4 mi',
    location: 'Plaza, Kansas City',
    coordinates: [39.0425, -94.5925],
    services: [
      { name: "Women's Cut & Style", duration: '1 hr', price: 55, timeSlots: ['9:00 AM', '1:30 PM', '4:30 PM'] },
      { name: 'Deep Conditioning Treatment', duration: '30 min', price: 35, timeSlots: ['10:00 AM', '2:00 PM', '5:00 PM'] },
    ],
    totalServices: 19,
  },
  {
    id: 6,
    name: 'Signature Styles',
    images: [
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/d4fb567ce_generated_9e6521ba.png',
      'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/12d28ec13_generated_image.png',
    ],
    rating: 4.9,
    reviews: 98,
    distance: '4.6 mi',
    location: 'Westport, Kansas City',
    coordinates: [39.0533, -94.5958],
    services: [
      { name: 'Brazilian Blowout', duration: '2.5 hr', price: 250, timeSlots: ['9:00 AM'] },
      { name: 'Trim', duration: '20 min', price: 25, timeSlots: ['11:00 AM', '3:00 PM', '5:30 PM'] },
    ],
    totalServices: 16,
  },
];

export default function Search() {
  const [searchParams] = useSearchParams();
  const categoryName = searchParams.get('category-name') || 'Hair & styling';
  const [showMap, setShowMap] = useState(true);
  const [activeTab, setActiveTab] = useState('venues');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SearchHeader initialCategory={categoryName} />

      {/* Two-column layout */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Left: Results Panel ── */}
        <div className={`flex flex-col overflow-hidden transition-all duration-300 ${showMap ? 'w-full lg:w-[52%] xl:w-[48%]' : 'w-full'}`}>

          {/* Sticky sub-toolbar */}
          <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 lg:px-6 py-3 space-y-3">
            {/* Tabs + map toggle */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center bg-muted rounded-full p-1 gap-0.5">
                {['venues', 'professionals'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full capitalize transition-all duration-150
                      ${activeTab === tab ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:block">
                  {MOCK_VENUES.length} venues within map area
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMap(!showMap)}
                  className="rounded-full gap-1.5 border-border text-sm font-medium"
                >
                  {showMap ? <X className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
                  {showMap ? 'Hide map' : 'Show map'}
                </Button>
              </div>
            </div>

            {/* Filter chips row */}
            <div className="overflow-x-auto scrollbar-hide pb-0.5" style={{ scrollbarWidth: 'none' }}>
              <FilterChips />
            </div>
          </div>

          {/* Scrollable results */}
          <div className="flex-1 overflow-y-auto px-4 lg:px-6 pt-6 pb-12">
            {activeTab === 'venues' ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {MOCK_VENUES.map((venue, i) => (
                  <motion.div
                    key={venue.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <SearchResultCard venue={venue} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">Professionals coming soon</p>
                <p className="text-sm mt-1">Browse venues in the meantime</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Map Panel ── */}
        {showMap && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="hidden lg:block flex-1 sticky top-16 h-[calc(100vh-64px)] border-l border-border/30"
          >
            <MapPanel
              venues={MOCK_VENUES}
              center={[39.0997, -94.5786]}
            />
          </motion.div>
        )}
      </div>
    </div>
  );
}