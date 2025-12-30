import React, { useState, useEffect, useRef } from 'react';
import heic2any from 'heic2any';
import EXIF from 'exif-js';
import { getAssetPath } from '../utils/assetPath';

interface HEICImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

// List of images that need manual orientation fixes
// These are images that are known to have incorrect orientation
// Orientation 2 = horizontal flip (scaleX(-1))
// Orientation 6 = rotate 90deg clockwise (to fix images that are "turned to the left")
const MANUAL_ORIENTATION_FIXES: { [key: string]: number } = {
  // All manual fixes removed - images will display in their original orientation
};

// Helper function to get CSS transform based on EXIF orientation
const getOrientationTransform = (orientation: number): string => {
  switch (orientation) {
    case 1: // Normal
      return 'none';
    case 2: // Horizontal flip
      return 'scaleX(-1)';
    case 3: // 180° rotation
      return 'rotate(180deg)';
    case 4: // Vertical flip
      return 'scaleY(-1)';
    case 5: // 90° clockwise + horizontal flip
      return 'rotate(90deg) scaleX(-1)';
    case 6: // 90° clockwise (portrait photos - most common)
      return 'rotate(90deg)';
    case 7: // 90° counter-clockwise + horizontal flip
      return 'rotate(-90deg) scaleX(-1)';
    case 8: // 90° counter-clockwise
      return 'rotate(-90deg)';
    default:
      return 'none';
  }
};

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
  const [orientation, setOrientation] = useState<number>(1);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoading(true);
    setError(false);
    setImageSrc(''); // Clear previous image
    
    // Check for manual orientation fix first
    const manualFix = MANUAL_ORIENTATION_FIXES[src];
    if (manualFix) {
      setOrientation(manualFix);
      console.log(`Applying manual orientation fix ${manualFix} for ${src}`);
    } else {
      setOrientation(1); // Reset orientation
    }

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

    // Get the full asset path with base URL
    const fullPath = getAssetPath(src);

    if (isHEIC) {
      // First, try to load the pre-converted JPG version (which has EXIF orientation already applied)
      const jpgPath = fullPath.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');
      const jpgSrc = src.replace(/\.heic$/i, '.jpg').replace(/\.heif$/i, '.jpg');

      fetch(jpgPath, { method: 'HEAD' })
        .then((response) => {
          if (response.ok) {
            // JPG exists, use it instead of converting HEIC
            const globalCache = (window as any).__heicImageCache__;
            if (globalCache) {
              globalCache.set(src, jpgPath);
            }
            setImageSrc(jpgPath);
            setIsLoading(false);
            setError(false);
            if (onLoad) onLoad();
            return true;
          }
          return false;
        })
        .catch(() => false)
        .then((jpgLoaded) => {
          if (jpgLoaded) return; // JPG was loaded successfully, stop here

          // JPG doesn't exist, fall back to HEIC conversion
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
      fetch(fullPath)
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
        });
    } else {
      // Not HEIC, use the image directly with full path
      setImageSrc(fullPath);
      setIsLoading(false);
      if (onLoad) onLoad();
    }
  }, [src, className, onLoad, onError]);

  // Read EXIF orientation when image loads
  const handleImageLoad = () => {
    if (!imgRef.current) {
      if (onLoad) onLoad();
      return;
    }
    
    const img = imgRef.current;
    
    // Function to read EXIF from an image element
    const readEXIF = (imageElement: HTMLImageElement, sourceName: string): Promise<number> => {
      return new Promise((resolve) => {
        try {
          EXIF.getData(imageElement as any, function() {
            const exifOrientation = EXIF.getTag(this, 'Orientation');
            if (exifOrientation && exifOrientation !== 1) {
              console.log(`EXIF orientation ${exifOrientation} found for ${sourceName}: ${src}`);
              resolve(exifOrientation);
            } else {
              resolve(1);
            }
          });
        } catch (err) {
          console.log(`EXIF read failed for ${sourceName}: ${src}`, err);
          resolve(1);
        }
      });
    };
    
    // Check if manual fix is already applied
    const manualFix = MANUAL_ORIENTATION_FIXES[src];
    if (manualFix) {
      // Manual fix takes precedence, don't try to read EXIF
      console.log(`Using manual orientation fix ${manualFix} for ${src}`);
      return;
    }
    
    // Try to read EXIF orientation from the loaded image
    readEXIF(img, 'loaded image').then((orient) => {
      if (orient !== 1) {
        setOrientation(orient);
      } else {
        // If EXIF read failed or orientation is 1, try reading from original file
        // This is especially important for blob URLs (converted HEIC)
        if (imageSrc.startsWith('blob:') && src) {
          const originalPath = getAssetPath(src);
          const tempImg = new Image();
          tempImg.crossOrigin = 'anonymous';
          tempImg.onload = async function() {
            const originalOrient = await readEXIF(tempImg, 'original file');
            if (originalOrient !== 1) {
              setOrientation(originalOrient);
            }
          };
          tempImg.onerror = () => {
            // If original file read fails, keep orientation at 1
          };
          tempImg.src = originalPath;
        }
      }
    });
    
    // Call the original onLoad callback
    if (onLoad) onLoad();
  };

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

  const transform = getOrientationTransform(orientation);
  
  // Build the style object
  const imageStyle: React.CSSProperties = {
    ...style,
    // Use CSS image-orientation for automatic EXIF handling (modern browsers)
    imageOrientation: 'from-image' as any,
    transformOrigin: 'center center',
  };
  
  
  // Apply transform if orientation is not normal
  if (transform !== 'none') {
    // Combine with existing transform if any
    const existingTransform = style?.transform;
    if (existingTransform) {
      imageStyle.transform = `${existingTransform} ${transform}`;
    } else {
      imageStyle.transform = transform;
    }
  } else if (style?.transform) {
    // Keep existing transform if no orientation transform needed
    imageStyle.transform = style.transform;
  }

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={className}
      style={imageStyle}
      onLoad={handleImageLoad}
      onError={onError}
      decoding="async"
    />
  );
};

