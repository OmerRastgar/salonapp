"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Clock, Info, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Service } from '@/lib/directus-simple';

interface ServiceCategory {
  name: string;
  services: Service[];
}

interface VenueServicesProps {
  categories: ServiceCategory[];
  onBook?: (service: Service) => void;
}

export default function VenueServices({ categories, onBook }: VenueServicesProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToCategory = (name: string) => {
    setActiveCategory(name);
    const element = document.getElementById(`category-${name}`);
    if (element) {
        const offset = 160; // Approximate header height
        const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (!categories || categories.length === 0) return null;

  return (
    <section className="mt-12">
      {/* Sticky Category Tabs */}
      <div className="sticky top-[72px] z-20 bg-white/95 backdrop-blur-md border-b border-border/50 -mx-4 px-4 py-3 mb-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => scrollToCategory(cat.name)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                activeCategory === cat.name
                  ? 'bg-foreground text-background shadow-md transform scale-105'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Services List */}
      <div className="space-y-12">
        {categories.map((category) => (
          <div key={category.name} id={`category-${category.name}`} className="scroll-mt-40">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                {category.name}
            </h2>
            <div className="space-y-4">
              {category.services.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="group relative p-5 rounded-2xl border border-border/50 bg-white hover:border-primary/30 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{service.duration} mins</span>
                        </div>
                        {service.is_popular && (
                          <div className="flex items-center gap-1.5 text-primary">
                            <Check className="w-3.5 h-3.5" />
                            <span>Popular</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end gap-3">
                      <div className="text-xl font-bold text-foreground">
                        Rs. {service.price.toLocaleString()}
                      </div>
                      <Button 
                        size="sm"
                        onClick={() => onBook?.(service)}
                        className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-6 font-bold transition-all hover:scale-105"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
