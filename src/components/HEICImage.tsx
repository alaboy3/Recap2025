import React, { useState, useEffect } from 'react';
import heic2any from 'heic2any';

interface HEICImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export const HEICImage: React.FC<HEICImageProps> = ({
  src,
  alt,
  className,
  style,
  onLoad,
  onError,
}) => {
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setError(false);
    setImageSrc(''); // Clear previous image
    
    // Check if the image is HEIC format (case-insensitive)
    const isHEIC = src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif');
    
    // Validate src is not empty
    if (!src || src.trim() === '') {
      console.error('HEICImage: Empty src provided');
      setError(true);
      setIsLoading(false);
      if (onError) onError();
      return;
    }
    
    if (isHEIC) {
      // Check global cache first (if available from CalendarWindow)
      const globalCache = (window as any).__heicImageCache__;
      if (globalCache && globalCache.has(src)) {
        const cachedUrl = globalCache.get(src);
        setImageSrc(cachedUrl);
        setIsLoading(false);
        setError(false);
        if (onLoad) onLoad();
        return;
      }
      
      // Fetch the HEIC file
      fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (!blob || blob.size === 0) {
            throw new Error('Empty blob received');
          }
          // Convert HEIC to JPEG/PNG
          try {
            // Use optimized quality - lower for backgrounds and thumbnails for faster conversion
            const isThumbnail = className?.includes('thumbnail') || className?.includes('icon') || className?.includes('media-thumbnail');
            const isBackground = className?.includes('bg') || className?.includes('background');
            let quality = 0.9;
            if (isBackground) {
              quality = 0.75; // Lower quality for backgrounds = faster conversion
            } else if (isThumbnail) {
              quality = 0.8;
            }
            
            return heic2any({
              blob,
              toType: 'image/jpeg',
              quality: quality,
            }).catch((conversionError) => {
              console.error('heic2any JPEG conversion failed:', conversionError);
              return heic2any({
                blob,
                toType: 'image/png',
                quality: quality,
              });
            });
          } catch (initError) {
            console.error('heic2any initialization error:', initError);
            throw initError;
          }
        })
        .then((conversionResult) => {
          // heic2any returns an array, get the first result
          const result = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          if (!result) {
            throw new Error('Conversion returned no result');
          }
          const url = URL.createObjectURL(result);
          
          // Store in global cache if available
          const globalCache = (window as any).__heicImageCache__;
          if (globalCache) {
            globalCache.set(src, url);
          }
          
          setImageSrc(url);
          setIsLoading(false);
          setError(false);
          if (onLoad) onLoad();
        })
        .catch((err) => {
          console.error('HEIC conversion error:', err);
          console.error('Error details:', {
            message: err.message,
            stack: err.stack,
            source: src,
            name: err.name
          });
          setError(true);
          setIsLoading(false);
          if (onError) onError();
        });
    } else {
      // Not HEIC, use the image directly
      setImageSrc(src);
      setIsLoading(false);
      if (onLoad) onLoad();
    }
  }, [src, className, onLoad, onError]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (imageSrc && imageSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imageSrc);
      }
    };
  }, [imageSrc]);

  if (error) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#f0f0f0',
          color: '#666',
          fontSize: '12px'
        }}>
          Failed to load image
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={className} style={style}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background: '#f0f0f0',
          color: '#666',
          fontSize: '12px'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={style}
      onLoad={onLoad}
      onError={onError}
      decoding="async"
    />
  );
};

