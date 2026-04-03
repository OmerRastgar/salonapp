import React, { useState } from 'react';
import { Star, Clock, ChevronDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getNext7Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const TIME_SLOTS = ['9:00 AM', '10:30 AM', '12:00 PM', '1:30 PM', '3:00 PM', '4:30 PM', '6:00 PM'];

export default function VenueBookingSidebar({ venue }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState(null);
  const [hoursOpen, setHoursOpen] = useState(false);
  const days = getNext7Days();

  const today = new Date().getDay();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayHours = venue.hours.find(h => h.day === dayNames[today]);
  const isClosed = todayHours?.hours === 'Closed';

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/40">
        <button className="w-full py-3.5 bg-foreground text-background rounded-full font-semibold text-base hover:bg-foreground/90 transition-colors">
          Book now
        </button>

        {/* Status */}
        <div
          className="flex items-center justify-between mt-4 cursor-pointer"
          onClick={() => setHoursOpen(!hoursOpen)}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className={`text-sm font-medium ${isClosed ? 'text-red-500' : 'text-emerald-600'}`}>
              {isClosed ? 'Closed' : 'Open now'}
            </span>
            {todayHours && !isClosed && (
              <span className="text-sm text-muted-foreground">· {todayHours.hours}</span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${hoursOpen ? 'rotate-180' : ''}`} />
        </div>

        <AnimatePresence>
          {hoursOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-1.5">
                {venue.hours.map((h, i) => {
                  const isToday = dayNames[today] === h.day;
                  return (
                    <div key={h.day} className={`flex justify-between text-xs px-2 py-1 rounded ${isToday ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                      <span>{h.day}</span>
                      <span className={h.hours === 'Closed' ? 'text-red-400' : ''}>{h.hours}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Day Picker */}
      <div className="p-5 border-b border-border/40">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Select date</p>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => { setSelectedDay(i); setSelectedTime(null); }}
              className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all
                ${selectedDay === i
                  ? 'bg-foreground text-background'
                  : 'hover:bg-muted text-foreground'
                }`}
            >
              <span className="font-medium">{DAYS_SHORT[day.getDay()]}</span>
              <span className={`mt-0.5 ${selectedDay === i ? 'text-background/80' : 'text-muted-foreground'}`}>
                {day.getDate()}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-5">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Available times</p>
        <div className="grid grid-cols-3 gap-2">
          {TIME_SLOTS.map(slot => (
            <button
              key={slot}
              onClick={() => setSelectedTime(slot)}
              className={`py-2 rounded-xl text-xs font-medium border transition-all
                ${selectedTime === slot
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border hover:border-foreground/40 text-foreground'
                }`}
            >
              {slot}
            </button>
          ))}
        </div>

        {/* Rating in sidebar */}
        <div className="mt-5 pt-4 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="font-bold">{venue.rating}</span>
            <span className="text-sm text-muted-foreground">({venue.reviews} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
}