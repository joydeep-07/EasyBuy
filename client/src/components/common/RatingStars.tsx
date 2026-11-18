import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showScore?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  reviewCount,
  size = 16,
  showScore = true,
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating - fullStars >= 0.4;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  return (
    <div className="flex items-center gap-1.5 text-amber-500">
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} size={size} className="fill-amber-400 stroke-amber-500" />
        ))}
        {hasHalfStar && <StarHalf size={size} className="fill-amber-400 stroke-amber-500" />}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} size={size} className="text-gray-300 dark:text-gray-600" />
        ))}
      </div>
      {showScore && <span className="text-xs font-semibold text-[var(--text-main)] ml-0.5">{rating.toFixed(1)}</span>}
      {reviewCount !== undefined && (
        <span className="text-xs text-[var(--text-secondary)]">({reviewCount.toLocaleString()})</span>
      )}
    </div>
  );
};
