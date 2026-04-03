import React, { useState } from 'react';
import { Star } from 'lucide-react';

const AVATAR_COLORS = ['bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700', 'bg-indigo-100 text-indigo-700'];

function ReviewCard({ review, i }) {
  return (
    <div className="py-5 border-b border-border/40 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
          {review.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-sm text-foreground">{review.author}</p>
            <p className="text-xs text-muted-foreground">{review.date}</p>
          </div>
          <div className="flex mt-1 mb-2">
            {[1,2,3,4,5].map(s => (
              <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{review.text}</p>
        </div>
      </div>
    </div>
  );
}

export default function VenueReviews({ rating, total, reviews }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <section id="reviews">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Reviews</h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
              ))}
            </div>
            <span className="font-bold text-lg">{rating}</span>
            <span className="text-muted-foreground">({total} reviews)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 px-5">
        {visible.map((review, i) => (
          <ReviewCard key={review.id} review={review} i={i} />
        ))}
      </div>

      {reviews.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-sm font-medium text-primary hover:underline"
        >
          {showAll ? 'Show less' : `See all ${total} reviews`}
        </button>
      )}
    </section>
  );
}