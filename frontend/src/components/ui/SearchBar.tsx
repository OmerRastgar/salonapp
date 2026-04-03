"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight, Clock, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isTomorrow } from 'date-fns';

const TREATMENTS = [
  'Hair Cut', 'Hair Coloring', 'Balayage', 'Manicure', 'Pedicure',
  'Facial', 'Massage', 'Waxing', 'Eyebrow Threading', 'Lash Extensions',
  'Deep Tissue Massage', 'Swedish Massage', 'Hot Stone Massage', 'Blowout',
];

const LOCATION_SUGGESTIONS = [
  { label: 'Current location', sub: 'Use my GPS location', icon: 'gps' },
  { label: 'Karachi', sub: 'Pakistan' },
  { label: 'Lahore', sub: 'Pakistan' },
  { label: 'Islamabad', sub: 'Pakistan' },
  { label: 'Rawalpindi', sub: 'Pakistan' },
  { label: 'Faisalabad', sub: 'Pakistan' },
];

const TIME_SLOTS = ['Any time', 'Morning\n9am - 12pm', 'Afternoon\n12pm - 5pm', 'Evening\n5pm - 12am', 'Custom'];

interface SearchBarProps {
    initialTreatment?: string;
    initialLocation?: string;
    onSearch?: (params: { treatment: string; location: string; date: Date | null; time: string }) => void;
}

export default function SearchBar({ initialTreatment = '', initialLocation = '', onSearch }: SearchBarProps) {
  const router = useRouter();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [treatmentQuery, setTreatmentQuery] = useState(initialTreatment);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('Any time');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredTreatments = treatmentQuery
    ? TREATMENTS.filter(t => t.toLowerCase().includes(treatmentQuery.toLowerCase()))
    : TREATMENTS.slice(0, 6);

  const filteredLocations = locationQuery
    ? LOCATION_SUGGESTIONS.filter(l => l.label.toLowerCase().includes(locationQuery.toLowerCase()))
    : LOCATION_SUGGESTIONS;

  // Calendar helpers
  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (getDay(startOfMonth(currentMonth)) + 6) % 7; // Mon=0

  const dateLabel = selectedDate
    ? (isToday(selectedDate) ? 'Today' : isTomorrow(selectedDate) ? 'Tomorrow' : format(selectedDate, 'EEE, d MMM'))
    : 'Any time';

  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);

  const handleSearchClick = () => {
    if (onSearch) {
        onSearch({ treatment: treatmentQuery, location: locationQuery, date: selectedDate, time: selectedTime });
    } else {
        const params = new URLSearchParams();
        if (treatmentQuery) params.set('search', treatmentQuery);
        if (locationQuery) params.set('location', locationQuery);
        if (selectedDate) params.set('date', selectedDate.toISOString());
        params.set('time', selectedTime);
        router.push(`/search?${params.toString()}`);
    }
  };

  return (
    <div ref={ref} className="relative w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="bg-white/90 backdrop-blur-xl rounded-full shadow-xl border border-white/50 p-2 flex flex-col md:flex-row items-stretch md:items-center"
      >
        {/* Treatment */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-border/30 cursor-pointer rounded-full md:rounded-none hover:bg-black/5 transition-colors"
          onClick={() => setActiveDropdown(activeDropdown === 'treatment' ? null : 'treatment')}
        >
          <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="All treatments"
            value={treatmentQuery}
            onChange={e => { setTreatmentQuery(e.target.value); setActiveDropdown('treatment'); }}
            onFocus={() => setActiveDropdown('treatment')}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none cursor-pointer"
          />
        </div>

        {/* Location */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 border-b md:border-b-0 md:border-r border-border/30 cursor-pointer rounded-full md:rounded-none hover:bg-black/5 transition-colors"
          onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
        >
          <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Current location"
            value={locationQuery}
            onChange={e => { setLocationQuery(e.target.value); setActiveDropdown('location'); }}
            onFocus={() => setActiveDropdown('location')}
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-sm font-medium focus:outline-none cursor-pointer"
          />
        </div>

        {/* Date/Time */}
        <div
          className="flex-1 flex items-center gap-3 px-4 py-3 md:py-2 cursor-pointer rounded-full md:rounded-none hover:bg-black/5 transition-colors"
          onClick={() => setActiveDropdown(activeDropdown === 'datetime' ? null : 'datetime')}
        >
          <Calendar className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className={`text-sm font-medium ${selectedDate ? 'text-foreground' : 'text-muted-foreground'}`}>
            {dateLabel}
          </span>
        </div>

        {/* Search Button */}
        <Button 
            onClick={handleSearchClick}
            className="mt-2 md:mt-0 md:ml-2 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-sm font-semibold transition-all duration-200 hover:scale-105 flex-shrink-0"
        >
          Search
        </Button>
      </motion.div>

      {/* Treatment Dropdown */}
      <AnimatePresence>
        {activeDropdown === 'treatment' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+8px)] left-0 w-72 bg-white rounded-2xl shadow-2xl border border-border/30 overflow-hidden z-50 text-left"
          >
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {treatmentQuery ? 'Results' : 'Popular treatments'}
              </p>
              {filteredTreatments.length === 0 ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No treatments found</p>
              ) : (
                filteredTreatments.map((t) => (
                  <button
                    key={t}
                    onMouseDown={() => { setTreatmentQuery(t); setActiveDropdown(null); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-colors"
                  >
                    <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-foreground">{t}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location Dropdown */}
      <AnimatePresence>
        {activeDropdown === 'location' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+8px)] left-0 md:left-1/3 w-80 bg-white rounded-2xl shadow-2xl border border-border/30 overflow-hidden z-50 text-left"
          >
            <div className="p-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                {locationQuery ? 'Suggestions' : 'Nearby & Popular'}
              </p>
              {filteredLocations.map((loc) => (
                <button
                  key={loc.label}
                  onMouseDown={() => { setLocationQuery(loc.label); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted text-left transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    {loc.icon === 'gps'
                      ? <Navigation className="w-4 h-4 text-primary" />
                      : <MapPin className="w-4 h-4 text-muted-foreground" />
                    }
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{loc.label}</p>
                    <p className="text-xs text-muted-foreground">{loc.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date/Time Dropdown */}
      <AnimatePresence>
        {activeDropdown === 'datetime' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute top-[calc(100%+8px)] right-0 bg-white rounded-2xl shadow-2xl border border-border/30 overflow-hidden z-50 w-full max-w-[560px] text-left"
          >
            <div className="flex flex-col sm:flex-row">
              {/* Quick Select */}
              <div className="sm:w-44 border-b sm:border-b-0 sm:border-r border-border/30 p-4 flex flex-row sm:flex-col gap-3">
                {[{ label: 'Today', sub: format(today, 'EEE, d MMM'), date: today }, { label: 'Tomorrow', sub: format(tomorrow, 'EEE, d MMM'), date: tomorrow }].map(opt => (
                  <button
                    key={opt.label}
                    onMouseDown={() => { setSelectedDate(opt.date); }}
                    className={`flex-1 sm:flex-none text-left p-3 rounded-xl border-2 transition-all ${
                      selectedDate && isSameDay(selectedDate, opt.date)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/80 hover:bg-muted'
                    }`}
                  >
                    <p className="font-semibold text-sm text-foreground">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.sub}</p>
                  </button>
                ))}
              </div>

              {/* Calendar */}
              <div className="flex-1 p-4">
                {/* Month Nav */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onMouseDown={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                    aria-label="Previous month"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-semibold text-foreground">
                    {format(currentMonth, 'MMM yyyy')}
                  </span>
                  <button
                    onMouseDown={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-1.5 rounded-full hover:bg-muted transition-colors"
                    aria-label="Next month"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 mb-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-xs text-muted-foreground font-medium py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 gap-y-1">
                  {Array.from({ length: startWeekday }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {daysInMonth.map((day) => {
                    const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isTodayDay = isToday(day);
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={isPast}
                        onMouseDown={() => { if (!isPast) setSelectedDate(day); }}
                        className={`mx-auto w-8 h-8 rounded-full text-xs font-medium transition-all flex items-center justify-center
                          ${isPast ? 'text-muted-foreground/40 cursor-not-allowed' : 'hover:bg-muted cursor-pointer'}
                          ${isSelected ? 'bg-primary text-primary-foreground hover:bg-primary' : ''}
                          ${isTodayDay && !isSelected ? 'text-primary font-bold' : ''}
                        `}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Selector */}
            <div className="border-t border-border/30 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground mr-1">Select time</span>
                {TIME_SLOTS.map((slot) => {
                  const [main, sub] = slot.split('\n');
                  return (
                    <button
                      key={slot}
                      onMouseDown={() => setSelectedTime(main)}
                      className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all flex flex-col items-center leading-tight
                        ${selectedTime === main
                          ? 'border-primary text-primary bg-primary/5'
                          : 'border-border hover:border-border/80 hover:bg-muted text-foreground'
                        }`}
                    >
                      <span>{main}</span>
                      {sub && <span className="text-muted-foreground font-normal">{sub}</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Apply */}
            <div className="px-4 pb-4 flex justify-end">
              <button
                onMouseDown={() => setActiveDropdown(null)}
                className="px-5 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
