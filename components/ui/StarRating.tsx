
import React, { useState, useCallback } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  totalStars?: number;
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  className?: string;
  isEditable?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  totalStars = 5,
  rating,
  onRatingChange,
  size = 20,
  className,
  isEditable = false,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = useCallback((index: number) => {
    if (!isEditable) return;
    setHoverRating(index);
  }, [isEditable]);

  const handleMouseLeave = useCallback(() => {
    if (!isEditable) return;
    setHoverRating(0);
  }, [isEditable]);

  const handleClick = useCallback((index: number) => {
    if (!isEditable || !onRatingChange) return;
    onRatingChange(index);
  }, [isEditable, onRatingChange]);
  
  const baseClasses = `flex items-center gap-1 ${className || ''}`;
  const interactiveClasses = isEditable ? 'cursor-pointer' : 'cursor-default';

  return (
    <div className={`${baseClasses} ${interactiveClasses}`} onMouseLeave={handleMouseLeave}>
      {[...Array(totalStars)].map((_, i) => {
        const ratingValue = i + 1;
        const starIsFilled = ratingValue <= (hoverRating || rating);

        return (
          <button
            key={ratingValue}
            type="button"
            className={`transition-transform duration-200 ${isEditable ? 'hover:scale-125' : ''}`}
            onClick={() => handleClick(ratingValue)}
            onMouseEnter={() => handleMouseEnter(ratingValue)}
            aria-label={`Rate ${ratingValue} out of ${totalStars}`}
            disabled={!isEditable}
          >
            <Star
              size={size}
              className={`transition-colors ${starIsFilled ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
              fill={starIsFilled ? 'currentColor' : 'none'}
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;