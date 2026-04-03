import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import VenueCarousel from '../components/VenueCarousel';
import CategorySection from '../components/CategorySection';
import FeaturesSection from '../components/FeaturesSection';
import CTASection from '../components/CTASection';
import Footer from '../components/Footer';

const recommendedVenues = [
  {
    id: 1,
    name: 'Meadow & Charm Wellness',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/bb10d0cbe_generated_a06bd202.png',
    rating: 5.0,
    reviews: 488,
    location: '108 East Broadway, Council Bluffs',
    category: 'Hair Salon',
  },
  {
    id: 2,
    name: 'Luxe Nail Studio',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/79b2b8d59_generated_7091f471.png',
    rating: 5.0,
    reviews: 2526,
    location: '1810 North Crossover Road',
    category: 'Nail Spa',
  },
  {
    id: 3,
    name: 'The Gentleman\'s Corner',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/4d3cd477c_generated_0915dd4c.png',
    rating: 5.0,
    reviews: 3308,
    location: 'Wash Park, Denver',
    category: 'Barber',
  },
  {
    id: 4,
    name: 'Serenity Massage & Spa',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/36c1442c1_generated_76277903.png',
    rating: 5.0,
    reviews: 2293,
    location: '3845 Lemay Ferry Road',
    category: 'Massage',
  },
  {
    id: 5,
    name: 'Radiance Beauty Lounge',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/d4fb567ce_generated_9e6521ba.png',
    rating: 4.9,
    reviews: 1872,
    location: '14525 Highway 7',
    category: 'Beauty Salon',
  },
];

const newVenues = [
  {
    id: 6,
    name: 'Aurora Hair Studio',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/d4fb567ce_generated_9e6521ba.png',
    rating: 5.0,
    reviews: 185,
    location: 'Colonial Hills, Lincoln',
    category: 'Hair Salon',
  },
  {
    id: 7,
    name: 'Tranquil Touch Spa',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/36c1442c1_generated_76277903.png',
    rating: 5.0,
    reviews: 8,
    location: '5237 West 95th Street',
    category: 'Massage',
  },
  {
    id: 8,
    name: 'The Wave Salon',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/bb10d0cbe_generated_a06bd202.png',
    rating: 5.0,
    reviews: 15,
    location: '4906 East Kenosha Street',
    category: 'Hair Salon',
  },
  {
    id: 9,
    name: 'Bliss Nail Bar',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/79b2b8d59_generated_7091f471.png',
    rating: 5.0,
    reviews: 64,
    location: '107 East Wilson Avenue',
    category: 'Nails',
  },
  {
    id: 10,
    name: 'Modern Cuts Barber',
    image: 'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/4d3cd477c_generated_0915dd4c.png',
    rating: 4.9,
    reviews: 112,
    location: '18801 East 39th Street',
    category: 'Barber',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero backgroundImage="https://media.base44.com/images/public/69cc18eb4ea26028ed156713/186ff3bc9_generated_d13139b1.png" />
      <VenueCarousel title="Recommended" venues={recommendedVenues} />
      <VenueCarousel title="New to Serene" venues={newVenues} />
      <CategorySection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}