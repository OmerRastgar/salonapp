"use client";

import React from 'react';
import { Star, ThumbsUp, MessageSquare, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'motion/react';
import { Review } from '@/lib/directus-simple';

interface VenueReviewsProps {
  rating: number;
  total: number;
  reviews: Review[];
  onWriteReview?: () => void;
}

export default function VenueReviews({ rating, total, reviews, onWriteReview }: VenueReviewsProps) {
  // Filter only published/active reviews
  const activeReviews = reviews.filter(r => r.status === 'published' || r.status === 'active');
  const displayReviews = activeReviews.slice(0, 10);

  return (
    <section className="mt-16 bg-muted/20 -mx-4 px-6 md:px-12 py-12 rounded-[40px] shadow-sm border border-border/40">
      <div className="flex flex-col lg:flex-row items-center justify-between mb-12 gap-8">
        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left transition-all">
          <div className="flex flex-col items-center">
            <h2 className="text-7xl font-display font-bold text-foreground mb-2">{Number(rating || 0).toFixed(1)}</h2>
            <div className="flex items-center gap-1.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-5 h-5 ${s <= Math.round(rating) ? 'fill-primary text-primary' : 'text-foreground/20'}`}
                />
              ))}
            </div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{total} reviews</p>
          </div>

          <div className="hidden md:flex flex-col gap-2 w-full max-w-[280px]">
             {[5,4,3,2,1].map((stars) => (
                <div key={stars} className="flex items-center gap-3">
                   <span className="text-xs font-bold text-foreground w-3">{stars}</span>
                   <div className="flex-1 h-1.5 bg-border/40 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-1000" 
                        style={{ width: `${stars === 5 ? 75 : stars === 4 ? 15 : 5}%` }} 
                      />
                   </div>
                </div>
             ))}
          </div>
        </div>

        <div className="flex-shrink-0">
          <Button 
            onClick={onWriteReview}
            className="rounded-full bg-foreground text-background hover:bg-foreground/90 px-8 py-7 text-lg font-bold shadow-xl shadow-foreground/10 transition-all hover:scale-105"
          >
            <MessageSquare className="w-5 h-5 mr-3 mb-0.5" />
            Write a Review
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayReviews.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="p-6 rounded-3xl bg-white border border-border/50 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {review.customer_name?.[0].toUpperCase() || 'A'}
                 </div>
                 <div className="flex flex-col">
                    <span className="font-bold text-foreground">{review.customer_name}</span>
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        {new Date(review.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                 </div>
              </div>
              <div className="flex items-center gap-1 pr-1">
                 <Star className="w-4 h-4 fill-primary text-primary" />
                 <span className="text-sm font-bold text-foreground">{review.rating}</span>
              </div>
            </div>
            
            <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-3">
              "{review.comment}"
            </p>
            
            <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
               <button className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  Helpful
               </button>
               <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Report <ChevronRight className="w-3 h-3" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
