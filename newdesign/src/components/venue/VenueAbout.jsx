import React, { useState } from 'react';
import { MapPin, Clock, CheckCircle } from 'lucide-react';

export default function VenueAbout({ venue }) {
  const [hoursExpanded, setHoursExpanded] = useState(false);
  const today = new Date().getDay();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <section id="about">
      <h2 className="text-2xl font-display font-semibold text-foreground mb-5">About</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Description */}
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{venue.about}</p>

          {/* Additional info */}
          <div className="flex items-center gap-2 text-sm text-foreground">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="font-medium">Instant Confirmation</span>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 mt-4">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-foreground">{venue.address}</p>
              <button className="text-sm text-primary font-medium hover:underline mt-0.5">Get directions</button>
            </div>
          </div>
        </div>

        {/* Opening Times */}
        <div>
          <div
            className="flex items-center justify-between mb-3 cursor-pointer"
            onClick={() => setHoursExpanded(!hoursExpanded)}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="font-semibold text-sm">Opening times</span>
            </div>
          </div>

          <div className="space-y-2">
            {venue.hours.map((h, i) => {
              const isToday = days[today] === h.day;
              return (
                <div key={h.day} className={`flex justify-between text-sm py-1.5 px-3 rounded-lg ${isToday ? 'bg-primary/5 font-medium' : ''}`}>
                  <span className={isToday ? 'text-foreground' : 'text-muted-foreground'}>{h.day}</span>
                  <span className={`${h.hours === 'Closed' ? 'text-red-400' : isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {h.hours}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}