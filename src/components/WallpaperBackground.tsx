import React, { useState, useEffect } from 'react';
import heic2any from 'heic2any';
import './WallpaperBackground.css';

interface WallpaperBackgroundProps {
  src: string;
  className?: string;
}

export const WallpaperBackground: React.FC<WallpaperBackgroundProps> = ({ src, className }) => {
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let blobUrl: string | null = null;
    const isHEIC = src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif');
    
    if (isHEIC) {
      setIsLoading(true);
      
      fetch(src)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.blob();
        })
        .then((blob) => {
          if (!blob || blob.size === 0) {
            throw new Error('Empty blob received');
          }
          return heic2any({
            blob,
            toType: 'image/jpeg',
            quality: 0.9, // High quality for wallpapers
          }).catch((conversionError) => {
            // Try with PNG as fallback
            return heic2any({
              blob,
              toType: 'image/png',
              quality: 0.85,
            });
          });
        })
        .then((conversionResult) => {
          const result = Array.isArray(conversionResult) ? conversionResult[0] : conversionResult;
          if (result) {
            blobUrl = URL.createObjectURL(result);
            setBackgroundImage(`url(${blobUrl})`);
            setIsLoading(false);
          } else {
            throw new Error('Conversion returned no result');
          }
        })
        .catch((err) => {
          console.error('Wallpaper conversion error:', err);
          setIsLoading(false);
        });
    } else {
      // Not HEIC, use directly
      setBackgroundImage(`url(${src})`);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [src]);

  return (
    <div 
      className={`wallpaper-background ${className || ''}`}
      style={{
        backgroundImage: backgroundImage || 'none',
        backgroundColor: isLoading && !backgroundImage ? '#ffffff' : 'transparent',
      }}
    />
  );
};

