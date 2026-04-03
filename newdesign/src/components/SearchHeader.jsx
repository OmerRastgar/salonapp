import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ChevronLeft, ChevronRight, Menu, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, isTomorrow } from 'date-fns';

const TREATMENTS = [
  'Hair & styling', 'Hair Cut', 'Hair Coloring', 'Balayage', 'Blowout',
  'Manicure', 'Pedicure', 'Facial', 'Massage', 'Waxing',
];

const LOCATIONS = [
  { label: 'Current location', sub: 'Use GPS', icon: 'gps' },
  { label: 'New York, NY', sub: 'United States' },
  { label: 'Los Angeles, CA', sub: 'United States' },
  { label: 'Chicago, IL', sub: 'United States' },
  { label: 'Miami, FL', sub: 'United States' },
];

const TIME_SLOTS = ['Any time', 'Morning', 'Afternoon', 'Evening', 'Custom'];

export default function SearchHeader({ initialCategory = '', initialLocation = '', initialDate = null }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [treatment, setTreatment] = useState(initialCategory);
  const [location, setLocation] = useState(initialLocation);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState('Any time');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const daysInMonth = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startWeekday = (getDay(startOfMonth(currentMonth)) + 6) % 7;
  const today = new Date();
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1);

  const dateLabel = selectedDate
    ? (isToday(selectedDate) ? 'Today' : isTomorrow(selectedDate) ? 'Tomorrow' : format(selectedDate, 'EEE, d MMM'))
    : 'Any time';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border/50">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-8 h-16 flex items-center gap-4" ref={ref}>
        {/* Logo */}
        <Link to="/" className="flex-shrink-0">
          <span className="text-xl font-display font-semibold text-foreground">serene</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center bg-white border border-border rounded-full shadow-sm divide-x divide-border max-w-2xl w-full">
            {/* Treatment */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'treatment' ? null : 'treatment')}
              className="flex-1 flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors rounded-l-full"
            >
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{treatment || 'All treatments'}</span>
            </button>

            {/* Location */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'location' ? null : 'location')}
              className="flex-1 flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{location || 'Current location'}</span>
            </button>

            {/* Date/Time */}
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'datetime' ? null : 'datetime')}
              className="flex-1 flex items-center gap-2 px-4 py-2 hover:bg-muted/50 transition-colors"
            >
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground truncate">{dateLabel}</span>
            </button>

            {/* Search Button */}
            <button className="p-2.5 bg-foreground text-background rounded-full m-1 hover:bg-foreground/90 transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Menu Button */}
        <Button variant="outline" className="rounded-full border-border flex items-center gap-2">
          Menu <Menu className="w-4 h-4" />
        </Button>

        {/* Dropdowns */}
        <AnimatePresence>
          {activeDropdown === 'treatment' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-xl border border-border/50 p-3 z-50"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase px-2 mb-2">Popular</p>
              {TREATMENTS.map(t => (
                <button
                  key={t}
                  onMouseDown={() => { setTreatment(t); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left text-sm"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  {t}
                </button>
              ))}
            </motion.div>
          )}

          {activeDropdown === 'location' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white rounded-xl shadow-xl border border-border/50 p-3 z-50"
            >
              {LOCATIONS.map(loc => (
                <button
                  key={loc.label}
                  onMouseDown={() => { setLocation(loc.label); setActiveDropdown(null); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    {loc.icon === 'gps' ? <Navigation className="w-4 h-4 text-primary" /> : <MapPin className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{loc.label}</p>
                    <p className="text-xs text-muted-foreground">{loc.sub}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeDropdown === 'datetime' && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-xl shadow-xl border border-border/50 overflow-hidden z-50 w-[500px]"
            >
              <div className="flex">
                {/* Quick Select */}
                <div className="w-40 border-r border-border/50 p-3 space-y-2">
                  {[{ label: 'Today', date: today }, { label: 'Tomorrow', date: tomorrow }].map(opt => (
                    <button
                      key={opt.label}
                      onMouseDown={() => setSelectedDate(opt.date)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-sm ${
                        selectedDate && isSameDay(selectedDate, opt.date)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted'
                      }`}
                    >
                      <p className="font-semibold">{opt.label}</p>
                      <p className="text-xs text-muted-foreground">{format(opt.date, 'EEE, d MMM')}</p>
                    </button>
                  ))}
                </div>

                {/* Calendar */}
                <div className="flex-1 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <button onMouseDown={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1 rounded hover:bg-muted">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-semibold">{format(currentMonth, 'MMM yyyy')}</span>
                    <button onMouseDown={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1 rounded hover:bg-muted">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 mb-1">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                      <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: startWeekday }).map((_, i) => <div key={`e-${i}`} />)}
                    {daysInMonth.map(day => {
                      const isPast = day < new Date(new Date().setHours(0,0,0,0));
                      const isSelected = selectedDate && isSameDay(day, selectedDate);
                      return (
                        <button
                          key={day.toISOString()}
                          disabled={isPast}
                          onMouseDown={() => !isPast && setSelectedDate(day)}
                          className={`mx-auto w-7 h-7 rounded-full text-xs font-medium transition-all flex items-center justify-center
                            ${isPast ? 'text-muted-foreground/40' : 'hover:bg-muted cursor-pointer'}
                            ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                            ${isToday(day) && !isSelected ? 'text-primary font-bold' : ''}
                          `}
                        >
                          {format(day, 'd')}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Time */}
              <div className="border-t border-border/50 p-3 flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold mr-2">Select time</span>
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    onMouseDown={() => setSelectedTime(slot)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                      selectedTime === slot ? 'border-primary text-primary bg-primary/5' : 'border-border hover:bg-muted'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>

              <div className="px-3 pb-3 flex justify-end">
                <button onMouseDown={() => setActiveDropdown(null)} className="px-4 py-1.5 rounded-full bg-foreground text-background text-sm font-medium">
                  Apply
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}