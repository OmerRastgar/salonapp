import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function ServiceRow({ service }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border/40 last:border-b-0 group">
      <div>
        <p className="font-medium text-foreground">{service.name}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{service.duration}</p>
      </div>
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-foreground">
          {service.priceFrom ? `from $${service.price}` : `$${service.price}`}
        </p>
        <button className="px-5 py-2 rounded-full border border-border text-sm font-medium hover:border-foreground hover:bg-foreground hover:text-background transition-all duration-150">
          Book
        </button>
      </div>
    </div>
  );
}

export default function VenueServices({ categories }) {
  const [activeCategory, setActiveCategory] = useState(0);
  const tabsRef = useRef(null);

  const scrollTabs = (dir) => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const currentServices = categories[activeCategory]?.services || [];

  return (
    <section id="services">
      <h2 className="text-2xl font-display font-semibold text-foreground mb-5">Services</h2>

      {/* Category Tabs */}
      <div className="relative flex items-center gap-2 mb-6">
        <button onClick={() => scrollTabs('left')} className="flex-shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground hidden sm:flex">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div
          ref={tabsRef}
          className="flex items-center gap-2 overflow-x-auto scrollbar-hide"
          style={{ scrollbarWidth: 'none' }}
        >
          {categories.map((cat, i) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(i)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 border
                ${activeCategory === i
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground/40'
                }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <button onClick={() => scrollTabs('right')} className="flex-shrink-0 p-1 rounded-full hover:bg-muted text-muted-foreground hidden sm:flex">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Service Rows */}
      <div className="bg-white rounded-2xl border border-border/50 px-5">
        {currentServices.map(service => (
          <ServiceRow key={service.id} service={service} />
        ))}
      </div>

      <button className="mt-4 text-sm font-medium text-primary hover:underline">
        See all services
      </button>
    </section>
  );
}