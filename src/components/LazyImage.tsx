import React, { useState, useRef, useEffect } from 'react';
import { Music } from 'lucide-react';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: React.ReactNode;
}

export default function LazyImage({ src, alt, className = '', placeholder }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  const defaultPlaceholder = (
    <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
      <Music className="h-8 w-8 text-gray-600" />
    </div>
  );

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
      {!isInView && (placeholder || defaultPlaceholder)}
      
      {isInView && !hasError && (
        <>
          {!isLoaded && (placeholder || defaultPlaceholder)}
          <img
            src={src}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="lazy"
          />
        </>
      )}
      
      {hasError && (placeholder || defaultPlaceholder)}
    </div>
  );
}