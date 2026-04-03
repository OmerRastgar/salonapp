import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Images } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function VenueGallery({ images }) {
  const [lightbox, setLightbox] = useState(null);

  const prev = () => setLightbox(i => (i - 1 + images.length) % images.length);
  const next = () => setLightbox(i => (i + 1) % images.length);

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[320px] md:h-[420px] rounded-2xl overflow-hidden">
        {/* Main large image */}
        <div className="col-span-2 row-span-2 cursor-pointer overflow-hidden" onClick={() => setLightbox(0)}>
          <img src={images[0]} alt="Venue" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
        </div>
        {/* Small images */}
        {images.slice(1, 5).map((img, i) => (
          <div key={i} className="relative overflow-hidden cursor-pointer" onClick={() => setLightbox(i + 1)}>
            <img src={img} alt={`Venue ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            {i === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center gap-2 text-white font-semibold text-sm">
                <Images className="w-4 h-4" />
                See all {images.length} photos
              </div>
            )}
          </div>
        ))}
        {/* See all images button (bottom-right of grid) */}
        {images.length <= 5 && (
          <button
            onClick={() => setLightbox(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-foreground text-sm font-semibold px-4 py-2 rounded-full shadow-lg hover:bg-muted transition-colors z-10"
            style={{ position: 'relative', marginTop: '-2rem', marginLeft: 'auto' }}
          />
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
            onClick={() => setLightbox(null)}
          >
            <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/10">
              <X className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/10">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <img
              src={images[lightbox]}
              alt="Gallery"
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 rounded-full hover:bg-white/10">
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-4 text-white/60 text-sm">{lightbox + 1} / {images.length}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}