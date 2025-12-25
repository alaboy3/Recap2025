import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { HEICImage } from './HEICImage';
import { getAssetPath } from '../utils/assetPath';
import './ImageStackView.css';

interface ImageStackViewProps {
  images: string[];
  initialIndex?: number;
  windowId?: string;
}

const getMediaType = (src: string): 'image' | 'video' => {
  const ext = src.split('.').pop()?.toLowerCase();
  return ext === 'mov' || ext === 'mp4' || ext === 'webm' ? 'video' : 'image';
};

const getVideoSrc = (src: string): string => {
  // If it's already a full path starting with /images/ or /videos/, use it as-is
  if (src.startsWith('/images/') || src.startsWith('/videos/')) {
    return src;
  }
  // Otherwise, try /videos/ path
  const filename = src.split('/').pop();
  return `/videos/${filename}`;
};

export const ImageStackView: React.FC<ImageStackViewProps> = ({ images, initialIndex = 0, windowId }) => {
  const { updateWindowSize, updateWindowTitle, updateWindowPosition } = useApp();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  const videoPositions = useRef<{ [key: string]: number }>({});
  const containerRef = useRef<HTMLDivElement | null>(null);

  const currentMedia = images[currentIndex];
  const currentMediaType = getMediaType(currentMedia);

  // Get filename for title
  const getMediaName = (src: string): string => {
    const filename = src.split('/').pop() || src;
    return filename.split('.')[0] || filename;
  };

  // Update window size, position, and title based on current media
  useEffect(() => {
    if (!windowId) return;

    const updateWindowDimensions = () => {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const titleBarHeight = 40;
      const padding = 32;

      if (currentMediaType === 'video') {
        const video = videoRefs.current[currentIndex];
        if (video && video.videoWidth && video.videoHeight) {
          const isHorizontal = video.videoWidth > video.videoHeight;
          const borderPadding = isHorizontal ? 10 : padding; // 5px on each side = 10px total
          // For horizontal, subtract border padding from available space
          const maxContentWidth = isHorizontal ? viewportWidth - borderPadding : viewportWidth - padding;
          const maxContentHeight = isHorizontal ? viewportHeight - titleBarHeight - borderPadding : viewportHeight - titleBarHeight - padding;
          
          // For horizontal videos, scale to fit width with borders; for vertical, fit both
          const scaleX = maxContentWidth / video.videoWidth;
          const scaleY = maxContentHeight / video.videoHeight;
          const scale = isHorizontal 
            ? Math.min(scaleX, 1) // For horizontal, fit width with borders
            : Math.min(scaleX, scaleY, 1); // For vertical, fit both
          
          const windowWidth = video.videoWidth * scale + borderPadding;
          const windowHeight = video.videoHeight * scale + titleBarHeight + borderPadding;
          
          // Center the window
          const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
          const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
          
          updateWindowSize(windowId, { width: windowWidth, height: windowHeight });
          updateWindowPosition(windowId, { x: windowX, y: windowY });
          // Note: We'll need to update position separately or combine with size update
        }
      } else {
        const img = containerRef.current?.querySelector('img') as HTMLImageElement;
        if (img && img.naturalWidth && img.naturalHeight) {
          const isHorizontal = img.naturalWidth > img.naturalHeight;
          const borderPadding = isHorizontal ? 10 : padding; // 5px on each side = 10px total
          // For horizontal, subtract border padding from available space
          const maxContentWidth = isHorizontal ? viewportWidth - borderPadding : viewportWidth - padding;
          const maxContentHeight = isHorizontal ? viewportHeight - titleBarHeight - borderPadding : viewportHeight - titleBarHeight - padding;
          
          // For horizontal images, scale to fit width with borders; for vertical, fit both
          const imgScaleX = maxContentWidth / img.naturalWidth;
          const imgScaleY = maxContentHeight / img.naturalHeight;
          const imgScale = isHorizontal 
            ? Math.min(imgScaleX, 1) // For horizontal, fit width with borders
            : Math.min(imgScaleX, imgScaleY, 1); // For vertical, fit both
          
          const windowWidth = img.naturalWidth * imgScale + borderPadding;
          const windowHeight = img.naturalHeight * imgScale + titleBarHeight + borderPadding;
          
          // Center the window
          const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
          const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
          
          updateWindowSize(windowId, { width: windowWidth, height: windowHeight });
          updateWindowPosition(windowId, { x: windowX, y: windowY });
        }
      }
    };

    // Update title
    if (windowId) {
      const mediaName = getMediaName(currentMedia);
      updateWindowTitle(windowId, mediaName);
    }

    // Small delay to ensure media is loaded
    const timer = setTimeout(updateWindowDimensions, 100);
    return () => clearTimeout(timer);
  }, [currentIndex, currentMedia, currentMediaType, windowId, updateWindowSize, updateWindowTitle, updateWindowPosition]);

  // Auto-play video when it becomes current
  useEffect(() => {
    if (currentMediaType === 'video') {
      const video = videoRefs.current[currentIndex];
      if (video) {
        // Resume from saved position if available
        const savedPosition = videoPositions.current[currentMedia];
        if (savedPosition !== undefined) {
          video.currentTime = savedPosition;
        }
        video.play().catch((e) => {
          console.error('Error playing video:', e);
        });
      }
    }

    // Pause all other videos
    Object.keys(videoRefs.current).forEach((key) => {
      const idx = parseInt(key);
      if (idx !== currentIndex && videoRefs.current[idx]) {
        const video = videoRefs.current[idx];
        if (video) {
          // Save current position before pausing
          if (video.currentTime > 0) {
            videoPositions.current[images[idx]] = video.currentTime;
          }
          video.pause();
        }
      }
    });
  }, [currentIndex, currentMediaType, currentMedia, images]);

  // Save video position when video time updates
  useEffect(() => {
    if (currentMediaType === 'video') {
      const video = videoRefs.current[currentIndex];
      if (video) {
        const handleTimeUpdate = () => {
          if (video.currentTime > 0) {
            videoPositions.current[currentMedia] = video.currentTime;
          }
        };
        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
          video.removeEventListener('timeupdate', handleTimeUpdate);
        };
      }
    }
  }, [currentIndex, currentMediaType, currentMedia]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [images.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="image-stack-view">
      <div className="image-stack-container" ref={containerRef}>
        {currentMediaType === 'image' ? (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '5px',
            boxSizing: 'border-box'
          }}>
            <HEICImage 
              src={currentMedia} 
              alt={`Image ${currentIndex + 1} of ${images.length}`}
              className="image-stack-image"
              onLoad={() => {
                // Trigger window resize when image loads
                if (windowId && containerRef.current) {
                  const img = containerRef.current.querySelector('img') as HTMLImageElement;
                  if (img && img.naturalWidth && img.naturalHeight) {
                    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
                    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
                    const titleBarHeight = 40;
                    const padding = 32;
                    
                    // For horizontal images, prioritize width
                    const isHorizontalImg = img.naturalWidth > img.naturalHeight;
                    const borderPadding = isHorizontalImg ? 10 : padding; // 5px on each side = 10px total
                    // For horizontal, subtract border padding from available space
                    const maxContentWidth = isHorizontalImg ? viewportWidth - borderPadding : viewportWidth - padding;
                    const maxContentHeight = isHorizontalImg ? viewportHeight - titleBarHeight - borderPadding : viewportHeight - titleBarHeight - padding;
                    
                    const imgOnLoadScaleX = maxContentWidth / img.naturalWidth;
                    const imgOnLoadScaleY = maxContentHeight / img.naturalHeight;
                    const imgOnLoadScale = isHorizontalImg 
                      ? Math.min(imgOnLoadScaleX, 1)
                      : Math.min(imgOnLoadScaleX, imgOnLoadScaleY, 1);
                    
                    const windowWidth = img.naturalWidth * imgOnLoadScale + borderPadding;
                    const windowHeight = img.naturalHeight * imgOnLoadScale + titleBarHeight + borderPadding;
                    
                    // Center the window
                    const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
                    const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
                    
                    updateWindowSize(windowId, { width: windowWidth, height: windowHeight });
                    updateWindowPosition(windowId, { x: windowX, y: windowY });
                  }
                }
              }}
            />
          </div>
        ) : (
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '5px',
            boxSizing: 'border-box'
          }}>
            <video
              ref={(el) => {
                videoRefs.current[currentIndex] = el;
                if (el && windowId) {
                  el.addEventListener('loadedmetadata', () => {
                    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
                    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
                    const titleBarHeight = 40;
                    const padding = 32;
                    
                    if (el.videoWidth && el.videoHeight) {
                      // For horizontal videos, prioritize width
                      const isHorizontalVid = el.videoWidth > el.videoHeight;
                      const borderPadding = isHorizontalVid ? 10 : padding; // 5px on each side = 10px total
                      // For horizontal, subtract border padding from available space
                      const maxContentWidth = isHorizontalVid ? viewportWidth - borderPadding : viewportWidth - padding;
                      const maxContentHeight = isHorizontalVid ? viewportHeight - titleBarHeight - borderPadding : viewportHeight - titleBarHeight - padding;
                      
                      const vidScaleX = maxContentWidth / el.videoWidth;
                      const vidScaleY = maxContentHeight / el.videoHeight;
                      const vidScale = isHorizontalVid 
                        ? Math.min(vidScaleX, 1)
                        : Math.min(vidScaleX, vidScaleY, 1);
                      
                      const windowWidth = el.videoWidth * vidScale + borderPadding;
                      const windowHeight = el.videoHeight * vidScale + titleBarHeight + borderPadding;
                      
                      // Center the window
                      const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
                      const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
                      
                      updateWindowSize(windowId, { width: windowWidth, height: windowHeight });
                      updateWindowPosition(windowId, { x: windowX, y: windowY });
                    }
                  });
                }
              }}
              src={getAssetPath(getVideoSrc(currentMedia))}
              className="image-stack-video"
              controls
              autoPlay
              playsInline
              onError={(e) => {
                // Try alternative path if video fails to load
                const video = e.currentTarget;
                const altSrc = currentMedia.startsWith('/images/')
                  ? `/videos/${currentMedia.split('/').pop()}`
                  : `/images/${currentMedia}`;
                if (video.src !== altSrc) {
                  video.src = getAssetPath(altSrc);
                }
              }}
            />
          </div>
        )}
      </div>
      {images.length > 1 && (
        <>
          <button 
            className="image-stack-nav image-stack-nav-left"
            onClick={handlePrevious}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button 
            className="image-stack-nav image-stack-nav-right"
            onClick={handleNext}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="image-stack-indicator">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

