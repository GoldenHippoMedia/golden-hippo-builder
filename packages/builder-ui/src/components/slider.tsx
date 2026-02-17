import React, { useState, useCallback, useEffect, useRef } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2';
import clsx from 'clsx';

export interface SliderProps {
  images: { src: string; alt: string }[];
  autoplay?: boolean;
  autoplayInterval?: number;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
}

export function Slider({
  images,
  autoplay = false,
  autoplayInterval = 5000,
  showArrows = true,
  showDots = true,
  className,
}: SliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(((index % images.length) + images.length) % images.length);
    },
    [images.length],
  );

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  useEffect(() => {
    if (autoplay && images.length > 1) {
      intervalRef.current = setInterval(next, autoplayInterval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [autoplay, autoplayInterval, next, images.length]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    },
    [prev, next],
  );

  if (images.length === 0) return null;

  return (
    <div
      className={clsx('relative w-full overflow-hidden rounded-lg', className)}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Image carousel"
    >
      <div className="relative aspect-video">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt={image.alt}
            className={clsx(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              index === currentIndex ? 'opacity-100' : 'opacity-0',
            )}
          />
        ))}
      </div>

      {showArrows && images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="btn btn-circle btn-sm absolute left-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            aria-label="Previous image"
          >
            <HiChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="btn btn-circle btn-sm absolute right-2 top-1/2 -translate-y-1/2 opacity-70 hover:opacity-100"
            aria-label="Next image"
          >
            <HiChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showDots && images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goTo(index)}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-base-content/30',
              )}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
