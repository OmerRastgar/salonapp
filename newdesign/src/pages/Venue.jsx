import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import SearchHeader from '../components/SearchHeader';
import VenueGallery from '../components/venue/VenueGallery';
import VenueHero from '../components/venue/VenueHero';
import VenueServices from '../components/venue/VenueServices';
import VenueTeam from '../components/venue/VenueTeam';
import VenueReviews from '../components/venue/VenueReviews';
import VenueAbout from '../components/venue/VenueAbout';
import VenueBookingSidebar from '../components/venue/VenueBookingSidebar';
import VenueNearby from '../components/venue/VenueNearby';

// Mock venue data
export const VENUE_DATA = {
  id: 1,
  name: "The Gentleman's Corner",
  category: "Hair Salon",
  rating: 4.6,
  reviews: 96,
  status: "Open",
  opensAt: "9:00 AM",
  closesAt: "8:00 PM",
  address: "Wash Park, 34 Broadway Ave, Denver, CO 80209",
  about: "Since 1994, a landmark in premium grooming. A designer salon that redefined the art of hair and skin care. We are meticulous about hygiene and cleanliness, creating the perfect healthy environment our customers seek. Over the decades we have made our mark in becoming a trend setter in professional grooming.",
  images: [
    'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/4d3cd477c_generated_0915dd4c.png',
    'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/bb10d0cbe_generated_a06bd202.png',
    'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/36c1442c1_generated_76277903.png',
    'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/d4fb567ce_generated_9e6521ba.png',
    'https://media.base44.com/images/public/69cc18eb4ea26028ed156713/79b2b8d59_generated_7091f471.png',
  ],
  hours: [
    { day: 'Monday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Tuesday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Wednesday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Thursday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Friday', hours: '9:00 AM – 8:00 PM' },
    { day: 'Saturday', hours: '10:00 AM – 6:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ],
  serviceCategories: [
    {
      name: 'Featured',
      services: [
        { id: 1, name: 'Haircut', duration: '30 min', price: 35 },
        { id: 2, name: 'Beard Trim', duration: '20 min', price: 20 },
        { id: 3, name: 'Haircut & Beard', duration: '45 min', price: 50 },
        { id: 4, name: 'Hot Towel Shave', duration: '30 min', price: 40 },
      ],
    },
    {
      name: 'Haircut Men',
      services: [
        { id: 5, name: "Classic Men's Cut", duration: '30 min', price: 35 },
        { id: 6, name: 'Fade Haircut', duration: '45 min', price: 40 },
        { id: 7, name: 'Buzz Cut', duration: '20 min', price: 25 },
        { id: 8, name: 'Kids Haircut (under 12)', duration: '20 min', price: 22 },
      ],
    },
    {
      name: 'Beard & Shave',
      services: [
        { id: 9, name: 'Beard Trim & Shape', duration: '20 min', price: 20 },
        { id: 10, name: 'Full Shave', duration: '30 min', price: 35 },
        { id: 11, name: 'Hot Towel Shave', duration: '30 min', price: 40 },
      ],
    },
    {
      name: 'Hair Color Men',
      services: [
        { id: 12, name: 'Hair Dye', duration: '1 hr', price: 65 },
        { id: 13, name: 'Beard Color', duration: '30 min', price: 30 },
        { id: 14, name: 'Highlights', duration: '1.5 hr', price: 95, priceFrom: true },
      ],
    },
    {
      name: 'Massages',
      services: [
        { id: 15, name: 'Head Massage', duration: '20 min', price: 30 },
        { id: 16, name: 'Deep Tissue Massage', duration: '1 hr', price: 80 },
        { id: 17, name: 'Swedish Massage', duration: '1 hr', price: 75 },
      ],
    },
    {
      name: 'Facials',
      services: [
        { id: 18, name: "Men's Facial", duration: '45 min', price: 55 },
        { id: 19, name: 'Hydra Facial', duration: '1 hr', price: 85 },
      ],
    },
  ],
  team: [
    { id: 1, name: 'James', role: 'Senior Barber', rating: 4.8, avatar: 'J', initials: true },
    { id: 2, name: 'Marcus', role: 'Barber', rating: 4.6, avatar: 'M', initials: true },
    { id: 3, name: 'Tyler', role: 'Barber & Colorist', rating: 4.9, avatar: 'T', initials: true },
    { id: 4, name: 'Alex', role: 'Barber', rating: 4.5, avatar: 'A', initials: true },
    { id: 5, name: 'Chris', role: 'Senior Stylist', rating: 4.7, avatar: 'C', initials: true },
    { id: 6, name: 'Ryan', role: 'Barber', rating: 4.4, avatar: 'R', initials: true },
  ],
  reviewsList: [
    { id: 1, author: 'Hamza P', initials: 'H', date: 'Tue, Mar 17, 2026', rating: 5, text: 'Really smooth and enjoyable, the hair stylist was really polite and cooperative.' },
    { id: 2, author: 'Nathan F', initials: 'N', date: 'Tue, Mar 17, 2026', rating: 5, text: 'Got a really nice haircut and it was a great experience.' },
    { id: 3, author: 'Asim H', initials: 'A', date: 'Sun, Mar 15, 2026', rating: 5, text: "Didn't have to wait long. Good music and a very chill vibe." },
    { id: 4, author: 'Daniel S', initials: 'D', date: 'Sun, Mar 15, 2026', rating: 5, text: 'Best barbershop in town. Highly recommend the fade!' },
    { id: 5, author: 'Kevin M', initials: 'K', date: 'Sat, Mar 14, 2026', rating: 5, text: 'Great services, always consistent.' },
    { id: 6, author: 'mohsin k', initials: 'M', date: 'Sat, Mar 14, 2026', rating: 5, text: 'Excellent like always. My go-to place.' },
  ],
};

export default function Venue() {
  const { id } = useParams();
  const venue = VENUE_DATA; // In a real app, fetch by id

  return (
    <div className="min-h-screen bg-background">
      <SearchHeader />
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-4 flex items-center gap-1.5">
          <a href="/" className="hover:text-foreground">Home</a>
          <span>·</span>
          <a href="/search" className="hover:text-foreground">Hair Salons</a>
          <span>·</span>
          <a href="/search" className="hover:text-foreground">Denver</a>
          <span>·</span>
          <span className="text-foreground font-medium">{venue.name}</span>
        </nav>

        <VenueHero venue={venue} />
        <VenueGallery images={venue.images} />

        {/* Main Content + Sidebar */}
        <div className="mt-8 flex gap-8 items-start">
          {/* Left: all sections */}
          <div className="flex-1 min-w-0 space-y-12">
            <VenueServices categories={venue.serviceCategories} />
            <VenueTeam team={venue.team} />
            <VenueReviews rating={venue.rating} total={venue.reviews} reviews={venue.reviewsList} />
            <VenueAbout venue={venue} />
          </div>

          {/* Right: booking sidebar */}
          <div className="hidden lg:block w-80 flex-shrink-0 sticky top-20">
            <VenueBookingSidebar venue={venue} />
          </div>
        </div>

        <VenueNearby />
      </div>

      {/* Mobile sticky booking bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-border/50 p-4">
        <button className="w-full py-3.5 bg-foreground text-background rounded-full font-semibold text-base hover:bg-foreground/90 transition-colors">
          Book now
        </button>
      </div>
    </div>
  );
}