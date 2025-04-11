import React, { useEffect, useRef, useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface LazyImageProps extends Omit<ImageProps, 'onLoad' | 'placeholder'> {
  threshold?: number;
  placeholder?: string;
  rootMargin?: string;
  onLoad?: () => void;
}

/**
 * Composant d'image avec chargement différé utilisant l'Intersection Observer API
 * Charge les images uniquement lorsqu'elles entrent dans la vue ou s'approchent de la vue
 */
const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  width,
  height,
  placeholder = '/images/placeholder.svg',
  threshold = 0.1,
  rootMargin = '200px 0px',
  onLoad,
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);
  
  // Utiliser un placeholder local au lieu d'un service externe
  const getLocalPlaceholder = () => {
    // Si le placeholder commence par http, générer un placeholder local à la place
    if (typeof placeholder === 'string' && placeholder.startsWith('http')) {
      return '/images/placeholder.svg';
    }
    return placeholder;
  };

  useEffect(() => {
    // Réinitialiser l'état en cas de changement de src
    setIsLoaded(false);
    setError(false);
  }, [src]);

  useEffect(() => {
    // Observer pour détecter quand l'image entre dans la vue
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        root: null,
        rootMargin,
        threshold,
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [rootMargin, threshold]);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleImageError = () => {
    setError(true);
  };

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${props.className || ''}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      {/* Placeholder ou image de fallback */}
      {(!isVisible || !isLoaded) && !error && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse" 
          style={{ 
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      )}

      {/* Image réelle (chargée seulement quand visible) */}
      {isVisible && (
        <Image
          src={error ? getLocalPlaceholder() : src}
          alt={alt}
          width={width}
          height={height}
          onLoad={handleImageLoad}
          onError={handleImageError}
          {...props}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${props.className || ''}`}
          loading="lazy"
          unoptimized={typeof src === 'string' && src.startsWith('data:')}
        />
      )}
    </div>
  );
};

export default LazyImage; 