"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Calendar, Navigation, ChevronLeft, ChevronRight, X, Scissors, Footprints, Droplets, Sparkles, Wind, Stethoscope, Armchair } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

// --- TYPES ---
type PopoverType = "treatment" | "location" | "dateTime" | null;

interface AdvancedSearchBannerProps {
  initialSearch?: string;
  initialLocation?: string;
  onSearch: (data: { search: string; location: string; date: string }) => void;
}

// --- SUB-COMPONENTS: POPOVERS ---

const TreatmentPopover = ({ onClose, onSelect }: { onClose: () => void; onSelect: (val: string) => void }) => {
  const [activeTab, setActiveTab] = useState("All");
  const tabs = ["All", "Treatments"];
  
  const recents = [
    { name: "Hair & styling", meta: "Any time · Karachi" },
    { name: "All treatments", meta: "Any time · Clifton" },
    { name: "Nails", meta: "Any time · London" },
  ];

  const treatments = [
    { name: "All treatments", icon: <Sparkles className="size-4" /> },
    { name: "Hair & styling", icon: <Scissors className="size-4" /> },
    { name: "Nails", icon: <Wind className="size-4" /> },
    { name: "Hair removal", icon: <Droplets className="size-4" /> },
    { name: "Massage", icon: <Armchair className="size-4" /> },
    { name: "Barbering", icon: <Scissors className="size-4" /> },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-[110%] left-0 w-[400px] bg-white rounded-[24px] shadow-2xl border border-border/40 p-6 z-[100] text-left"
    >
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab ? "bg-purple-600 text-white shadow-lg shadow-purple-200" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-bold text-foreground">Recents</h4>
            <button className="text-xs font-semibold text-purple-600 hover:underline">Clear</button>
          </div>
          <div className="space-y-1">
            {recents.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(item.name)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors text-left group"
              >
                <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-white shadow-sm transition-colors">
                  <Search className="size-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{item.name}</div>
                  <div className="text-xs text-muted-foreground">{item.meta}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-foreground mb-3">Treatments</h4>
          <div className="space-y-1">
            {treatments.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelect(item.name)}
                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors text-left"
              >
                <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
                  {item.icon}
                </div>
                <div className="text-sm font-semibold">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LocationPopover = ({ onClose, onSelect }: { onClose: () => void; onSelect: (val: string) => void }) => {
  const recents = [
    { name: "Clifton", meta: "Clifton, Karachi, Pakistan" },
    { name: "London", meta: "London, UK" },
    { name: "Karachi", meta: "Karachi, Pakistan" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-[110%] left-[33%] w-[380px] bg-white rounded-[24px] shadow-2xl border border-border/40 p-6 z-[100] text-left"
    >
      <button 
        className="w-full flex items-center gap-4 p-4 rounded-2xl bg-purple-50 hover:bg-purple-100 transition-colors text-left mb-6 group border border-purple-100"
        onClick={() => onSelect("Current location")}
      >
        <div className="size-10 rounded-full bg-white flex items-center justify-center text-purple-600 shadow-sm transition-transform group-active:scale-95">
          <Navigation className="size-5 fill-purple-600" />
        </div>
        <span className="text-sm font-bold text-purple-900">Current location</span>
      </button>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-bold text-foreground">Recent</h4>
          <button className="text-xs font-semibold text-purple-600 hover:underline">Clear</button>
        </div>
        <div className="space-y-1">
          {recents.map((item, idx) => (
            <button
              key={idx}
              onClick={() => onSelect(item.name)}
              className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-muted/30 transition-colors text-left group"
            >
              <div className="size-10 rounded-full bg-muted/40 flex items-center justify-center text-muted-foreground group-hover:bg-white shadow-sm transition-colors">
                <MapPin className="size-4" />
              </div>
              <div>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-muted-foreground">{item.meta}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const DateTimePopover = ({ onClose, onSelect }: { onClose: () => void; onSelect: (val: string) => void }) => {
  const [selectedDate, setSelectedDate] = useState<number | null>(3); // Fri 3 Apr
  const [selectedTime, setSelectedTime] = useState("Any time");

  const calendarDays = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30
  ];

  const timeSlots = [
    { label: "Any time", sub: "" },
    { label: "Morning", sub: "9am - 12pm" },
    { label: "Afternoon", sub: "12pm - 5pm" },
    { label: "Evening", sub: "5pm - 12am" },
    { label: "Custom", sub: "" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-[110%] right-0 w-[650px] bg-white rounded-[32px] shadow-2xl border border-border/40 p-10 z-[100] text-left overflow-hidden"
    >
      <div className="flex gap-10">
        {/* Presets Sidebar */}
        <div className="w-48 space-y-4">
          <button 
            onClick={() => onSelect("Today")}
            className="w-full p-6 bg-muted/20 border border-border/50 rounded-2xl text-left hover:bg-white hover:border-purple-200 transition-all shadow-sm group">
            <div className="text-sm font-bold mb-1 group-hover:text-purple-600 transition-colors">Today</div>
            <div className="text-xs text-muted-foreground font-medium">Fri, 3 Apr</div>
          </button>
          <button 
            onClick={() => onSelect("Tomorrow")}
            className="w-full p-6 bg-white border border-border/50 rounded-2xl text-left hover:border-purple-200 transition-all shadow-sm group">
            <div className="text-sm font-bold mb-1 group-hover:text-purple-600 transition-colors">Tomorrow</div>
            <div className="text-xs text-muted-foreground font-medium">Sat, 4 Apr</div>
          </button>
        </div>

        {/* Main Calendar */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8 px-2">
            <button className="p-2 hover:bg-muted/30 rounded-xl transition-colors"><ChevronLeft className="size-5" /></button>
            <h3 className="font-bold text-lg">Apr 2026</h3>
            <button className="p-2 hover:bg-muted/30 rounded-xl transition-colors"><ChevronRight className="size-5" /></button>
          </div>

          {/* Week Headers */}
          <div className="grid grid-cols-7 mb-4 text-center">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(h => (
              <span key={h} className="text-[11px] font-bold text-muted-foreground tracking-wider">{h}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 text-center">
            {calendarDays.map((day, idx) => (
              <button
                key={idx}
                disabled={!day}
                onClick={() => day && setSelectedDate(day)}
                className={`h-12 w-full flex items-center justify-center text-sm font-semibold rounded-full transition-all ${
                  day ? "hover:bg-purple-50 hover:text-purple-600" : "opacity-0 cursor-default"
                } ${selectedDate === day ? "bg-white ring-1 ring-border shadow-md" : ""}`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border/30">
        <h4 className="text-sm font-bold text-foreground mb-6 pl-2">Select time</h4>
        <div className="flex flex-wrap gap-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.label}
              onClick={() => onSelect(slot.label)}
              className={`px-6 py-4 rounded-2xl text-sm font-bold transition-all border ${
                selectedTime === slot.label 
                ? "bg-white border-purple-600 text-purple-600 ring-1 ring-purple-600/20 shadow-md" 
                : "bg-white border-border/50 text-muted-foreground hover:border-purple-200"
              }`}
            >
              <div>{slot.label}</div>
              {slot.sub && <div className="text-[10px] opacity-60 font-medium mt-1">{slot.sub}</div>}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---

export const AdvancedSearchBanner = ({ initialSearch = "", initialLocation = "", onSearch }: AdvancedSearchBannerProps) => {
  const [activePopover, setActivePopover] = useState<PopoverType>(null);
  const [searchVal, setSearchVal] = useState(initialSearch);
  const [locationVal, setLocationVal] = useState(initialLocation);
  const [dateVal, setDateVal] = useState("Any time");
  
  const bannerRef = useRef<HTMLDivElement>(null);

  // Sync state with props when they change (Persistence in Search Page)
  useEffect(() => {
    if (initialSearch !== undefined) setSearchVal(initialSearch);
    if (initialLocation !== undefined) setLocationVal(initialLocation);
  }, [initialSearch, initialLocation]);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bannerRef.current && !bannerRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchClick = () => {
    onSearch({ search: searchVal, location: locationVal, date: dateVal });
    setActivePopover(null);
  };

  return (
    <div ref={bannerRef} className="relative max-w-4xl mx-auto z-[100]">
      <div className={`flex flex-col sm:flex-row items-center gap-0 rounded-[32px] bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-border/20 p-2 transition-all duration-300 ${activePopover ? "shadow-[0_40px_100px_-20px_rgba(100,50,200,0.1)]" : ""}`}>
        
        {/* TREATMENT SECTION */}
        <div 
          onClick={() => setActivePopover("treatment")}
          className={`relative flex flex-1 items-center gap-4 px-6 py-4 rounded-full cursor-pointer transition-colors group ${activePopover === "treatment" ? "bg-muted/30" : "hover:bg-muted/10"}`}
        >
          <Search className={`size-5 transition-colors ${activePopover === "treatment" ? "text-purple-600" : "text-muted-foreground"}`} />
          <div className="flex flex-col">
            <input 
              readOnly 
              value={searchVal || "All treatments"} 
              className="bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none w-full pointer-events-none"
            />
          </div>
          <div className="absolute right-0 h-8 w-[1px] bg-border/40 hidden sm:block" />
        </div>

        {/* LOCATION SECTION */}
        <div 
          onClick={() => setActivePopover("location")}
          className={`relative flex flex-1 items-center gap-4 px-6 py-4 rounded-full cursor-pointer transition-colors group ${activePopover === "location" ? "bg-muted/30" : "hover:bg-muted/10"}`}
        >
          <MapPin className={`size-5 transition-colors ${activePopover === "location" ? "text-purple-600" : "text-muted-foreground"}`} />
          <div className="flex flex-col">
            <input 
              readOnly 
              value={locationVal || "Current location"} 
              className="bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none w-full pointer-events-none"
            />
          </div>
          <div className="absolute right-0 h-8 w-[1px] bg-border/40 hidden sm:block" />
        </div>

        {/* DATETIME SECTION */}
        <div 
          onClick={() => setActivePopover("dateTime")}
          className={`relative flex-1 flex items-center gap-4 px-6 py-4 rounded-full cursor-pointer transition-colors group ${activePopover === "dateTime" ? "bg-muted/30" : "hover:bg-muted/10"}`}
        >
          <Calendar className={`size-5 transition-colors ${activePopover === "dateTime" ? "text-purple-600" : "text-muted-foreground"}`} />
          <div className="flex flex-col">
            <input 
              readOnly 
              value={dateVal} 
              className="bg-transparent text-sm font-bold text-foreground placeholder:text-muted-foreground outline-none w-full pointer-events-none"
            />
          </div>
        </div>

        {/* SEARCH BUTTON */}
        <button 
          onClick={handleSearchClick}
          className="ml-2 px-10 py-5 bg-[#0a0a0a] text-white rounded-full font-bold text-base hover:scale-[1.03] active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          Search
        </button>
      </div>

      {/* POPOVERS */}
      <AnimatePresence>
        {activePopover === "treatment" && (
          <TreatmentPopover 
            onSelect={(val) => { setSearchVal(val); setActivePopover("location"); }} 
            onClose={() => setActivePopover(null)} 
          />
        )}
        {activePopover === "location" && (
          <LocationPopover 
            onSelect={(val) => { setLocationVal(val); setActivePopover("dateTime"); }} 
            onClose={() => setActivePopover(null)} 
          />
        )}
        {activePopover === "dateTime" && (
          <DateTimePopover 
            onSelect={(val) => { setDateVal(val); setActivePopover(null); }} 
            onClose={() => setActivePopover(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};
