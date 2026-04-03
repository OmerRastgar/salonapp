import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';
import SearchBar from './SearchBar';

export default function Hero({ backgroundImage }) {
  const [count, setCount] = useState(657904);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + Math.floor(Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const formattedCount = count.toLocaleString();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/60 via-pink-50/40 to-amber-50/60" />
      
      {/* Decorative Orbs - animated roaming */}
      <motion.div
        className="absolute w-[500px] h-[500px] bg-purple-300/25 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, 120, -80, 60, 0],
          y: [0, -80, 100, -40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{ top: '10%', left: '5%' }}
      />
      <motion.div
        className="absolute w-[420px] h-[420px] bg-pink-300/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          x: [0, -100, 80, -60, 0],
          y: [0, 80, -60, 50, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        style={{ bottom: '10%', right: '5%' }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-amber-200/15 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-32 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Main Heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-foreground leading-tight text-balance">
            Book local selfcare services
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover top-rated salons, barbers, medspas, wellness studios and beauty experts trusted by millions worldwide
          </p>

          {/* Search Bar */}
          <div className="pt-4">
            <SearchBar />
          </div>

          {/* Stats */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-base text-muted-foreground pt-4"
          >
            <span className="font-semibold text-foreground font-sans tabular-nums">
              {formattedCount}
            </span>
            {' '}appointments booked today
          </motion.p>

          {/* App Download CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-4"
          >
            <Button
              variant="outline"
              className="rounded-full border-border/50 bg-white/80 backdrop-blur-sm hover:bg-white px-6 py-5 text-sm font-medium gap-2 transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Get the app
              <QrCode className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}