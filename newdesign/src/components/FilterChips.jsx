import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FILTER_OPTIONS = {
  'Sort by': ['Recommended', 'Highest rated', 'Most reviewed', 'Nearest', 'Price: low to high'],
  'Price': ['Under $20', '$20 – $50', '$50 – $100', 'Over $100'],
  'Rating': ['5.0', '4.5+', '4.0+'],
  'Availability': ['Today', 'Tomorrow', 'This week'],
  'Gender': ['Everyone', 'Women', 'Men'],
};

export default function FilterChips() {
  const [openFilter, setOpenFilter] = useState(null);
  const [selected, setSelected] = useState({});
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenFilter(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (filter, option) => {
    setSelected(prev => ({ ...prev, [filter]: option }));
    setOpenFilter(null);
  };

  const clearFilter = (filter, e) => {
    e.stopPropagation();
    setSelected(prev => {
      const next = { ...prev };
      delete next[filter];
      return next;
    });
  };

  return (
    <div ref={dropdownRef} className="relative flex items-center gap-2 flex-wrap">
      {Object.entries(FILTER_OPTIONS).map(([filter, options]) => {
        const isActive = !!selected[filter];
        const isOpen = openFilter === filter;

        return (
          <div key={filter} className="relative">
            <button
              onClick={() => setOpenFilter(isOpen ? null : filter)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-150
                ${isActive
                  ? 'bg-foreground text-background border-foreground'
                  : 'bg-background text-foreground border-border hover:border-foreground/40 hover:bg-muted/50'
                }`}
            >
              <span>{isActive ? selected[filter] : filter}</span>
              {isActive ? (
                <X
                  className="w-3.5 h-3.5 opacity-70 hover:opacity-100"
                  onClick={(e) => clearFilter(filter, e)}
                />
              ) : (
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              )}
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 min-w-[180px] bg-white border border-border/50 rounded-xl shadow-xl z-50 py-1.5 overflow-hidden"
                >
                  {options.map((option) => (
                    <button
                      key={option}
                      onMouseDown={() => handleSelect(filter, option)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                        ${selected[filter] === option
                          ? 'bg-primary/5 text-primary font-medium'
                          : 'hover:bg-muted text-foreground'
                        }`}
                    >
                      {option}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}