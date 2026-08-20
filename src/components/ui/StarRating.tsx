// src/components/ui/StarRating.tsx
import { Star } from 'lucide-react';

export function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'fill-warning text-warning' : 'text-border'}
        />
      ))}
    </div>
  );
}