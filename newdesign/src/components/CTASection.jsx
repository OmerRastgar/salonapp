import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/20 to-secondary/30" />
      <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl md:text-5xl font-display font-medium text-foreground leading-tight text-balance">
            Ready to elevate your business?
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of beauty and wellness professionals who use our platform to grow their business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="rounded-full bg-foreground hover:bg-foreground/90 text-background px-8 py-6 text-base font-semibold gap-2 transition-all duration-200 hover:scale-105"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="rounded-full border-foreground/20 px-8 py-6 text-base font-semibold transition-all duration-200 hover:bg-muted"
            >
              Learn more
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}