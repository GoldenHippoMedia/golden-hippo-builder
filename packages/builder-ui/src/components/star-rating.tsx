import React from 'react';

export interface StarRatingProps {
  rating: number;
  maxStars?: number;
  className?: string;
}

export function StarRating({ rating, maxStars = 5, className }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.25;

  return (
    <div className={`rating rating-half rating-sm ${className ?? ''}`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const isHalf = i === fullStars && hasHalfStar;
        const isFull = i < fullStars;
        return (
          <input
            key={i}
            type="radio"
            className={`mask mask-star-2 ${isFull || isHalf ? 'bg-warning' : 'bg-base-300'} ${isHalf ? 'mask-half-1' : ''}`}
            disabled
            checked={isFull || isHalf}
            readOnly
          />
        );
      })}
    </div>
  );
}
