import React, { useState, useEffect, useRef } from 'react';
import { useDrag } from '../hooks/useDrag';
import { HEICImage } from './HEICImage';
import './AirDropNotification.css';

interface AirDropNotificationProps {
  position: { x: number; y: number };
  imageSrc: string;
  mediaFiles?: string[]; // Array of media file paths
  onAccept?: () => void;
  onDecline?: () => void;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const AirDropNotification: React.FC<AirDropNotificationProps> = ({
  position,
  imageSrc,
  mediaFiles,
  onAccept,
  onDecline,
  onPositionChange,
}) => {
  const { position: dragPosition, handleMouseDown } = useDrag(position, (newPos) => {
    if (onPositionChange) {
      onPositionChange(newPos);
    }
  });

  // Use mediaFiles if provided, otherwise fall back to single imageSrc
  const files = mediaFiles && mediaFiles.length > 0 ? mediaFiles : [imageSrc];
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isVideo, setIsVideo] = useState(false);
  const [size, setSize] = useState({ width: 320, height: 200 });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 320, height: 200 });

  const currentMedia = files[currentIndex];

  // Count photos and videos
  const photoCount = files.filter(file => {
    const ext = file.split('.').pop()?.toLowerCase();
    return ext !== 'mov' && ext !== 'mp4' && ext !== 'webm';
  }).length;
  const videoCount = files.length - photoCount;

  // Get message text
  const getMessageText = () => {
    if (files.length === 1) {
      return isVideo ? 'a video' : 'a photo';
    }
    const parts = [];
    if (photoCount > 0) {
      parts.push(`${photoCount} photo${photoCount !== 1 ? 's' : ''}`);
    }
    if (videoCount > 0) {
      parts.push(`${videoCount} video${videoCount !== 1 ? 's' : ''}`);
    }
    return parts.join(' and ');
  };

  // Check if current media is a video
  useEffect(() => {
    if (currentMedia) {
      const ext = currentMedia.split('.').pop()?.toLowerCase();
      setIsVideo(ext === 'mov' || ext === 'mp4' || ext === 'webm');
    }
  }, [currentMedia]);

  // Handle video playback when navigating between media
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const isCurrentVideo = currentMedia && (currentMedia.endsWith('.mov') || currentMedia.endsWith('.MOV') || 
                                             currentMedia.endsWith('.mp4') || currentMedia.endsWith('.MP4') || 
                                             currentMedia.endsWith('.webm') || currentMedia.endsWith('.WEBM'));

    if (isCurrentVideo) {
      // We're navigating TO a video - set it up but don't play yet
      // Use path as-is (browser handles URL encoding automatically)                                                                                                                                                            
      // Get current video filename for comparison
      const currentFilename = currentMedia.split('/').pop() || '';
      const currentSrc = video.src || '';
      const currentSrcPath = currentSrc ? new URL(currentSrc, window.location.origin).pathname : '';
      const currentSrcFilename = currentSrcPath ? decodeURIComponent(currentSrcPath.split('/').pop() || '') : '';
      
      // Only update src if it's different to avoid unnecessary reloads
      if (currentSrcFilename !== currentFilename || !video.src) {
        video.src = currentMedia;
        video.load();
      }
      // Ensure video is paused initially - Intersection Observer will handle playing
      video.pause();
    } else {
      // We're navigating AWAY from a video - stop it completely
      video.pause();
      video.currentTime = 0;
      if (video.src) {
        video.src = '';
        video.load();
      }
    }
  }, [currentIndex, currentMedia, files]);

  // Use Intersection Observer to play/pause video based on visibility
  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    const isCurrentVideo = currentMedia && (currentMedia.endsWith('.mov') || currentMedia.endsWith('.MOV') || 
                                             currentMedia.endsWith('.mp4') || currentMedia.endsWith('.MP4') || 
                                             currentMedia.endsWith('.webm') || currentMedia.endsWith('.WEBM'));

    if (!isCurrentVideo) {
      // Not a video, ensure video is paused
      video.pause();
      return;
    }

    // Ensure video starts paused
    video.pause();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
            // Video is visible - play it
            if (video.paused && !document.hidden) {
              const playPromise = video.play();
              if (playPromise !== undefined) {
                playPromise.catch((err) => {
                  console.error('Error auto-playing video:', err);
                });
              }
            }
          } else {
            // Video is not visible - pause it immediately
            if (!video.paused) {
              video.pause();
            }
          }
        });
      },
      {
        threshold: [0, 0.1, 0.5, 1.0], // Multiple thresholds for better detection
        rootMargin: '0px',
      }
    );

    // Observe both the video element and container for better detection
    observer.observe(video);
    observer.observe(container);

    // Pause video when window loses focus
    const handleBlur = () => {
      if (video && !video.paused) {
        video.pause();
      }
    };

    // Pause video when window is hidden (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && video && !video.paused) {
        video.pause();
      }
    };

    // Periodic check to ensure video is paused if not visible
    const checkVisibility = () => {
      if (!video || document.hidden) {
        if (video && !video.paused) {
          video.pause();
        }
        return;
      }
      
      const rect = video.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && 
                       rect.bottom > 0 && 
                       rect.left < window.innerWidth && 
                       rect.right > 0 &&
                       rect.width > 0 &&
                       rect.height > 0;
      
      if (!isVisible && !video.paused) {
        video.pause();
      }
    };

    // Set up event listeners
    window.addEventListener('blur', handleBlur);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Check visibility periodically (every 500ms) as a safety net
    const intervalId = setInterval(checkVisibility, 500);
    
    // Check visibility immediately
    checkVisibility();

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Ensure video is paused when effect cleans up
      if (video && !video.paused) {
        video.pause();
      }
    };
  }, [currentIndex, currentMedia, files]);

  // Handle arrow key navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [files.length]);

  const handlePrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = size;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      // Constrain to viewport
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const minWidth = 280;
      const minHeight = 200;
      const maxWidth = viewportWidth - dragPosition.x;
      const maxHeight = viewportHeight - dragPosition.y;

      const newSize = {
        width: Math.max(minWidth, Math.min(maxWidth, resizeStartSize.current.width + deltaX)),
        height: Math.max(minHeight, Math.min(maxHeight, resizeStartSize.current.height + deltaY)),
      };

      setSize(newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isResizing, dragPosition.x, dragPosition.y]);

  return (
    <div
      className="airdrop-notification"
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        width: `${size.width}px`,
      }}
    >
      <div 
        className="airdrop-title"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
      >AirDrop</div>
      <div className="airdrop-message">Hellie :3 would like to share {getMessageText()}.</div>
      <div 
        className="airdrop-media-container"
        style={{ height: `${size.height}px` }}
      >
        {files.length > 1 && (
          <button
            className="airdrop-nav-button airdrop-nav-prev"
            onClick={handlePrevious}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Previous"
          >
            ‹
          </button>
        )}
        <div className="airdrop-image-container" ref={videoContainerRef}>
          {isVideo ? (
            <video
              key={`video-${currentIndex}-${currentMedia}`}
              ref={videoRef}
              src={currentMedia}
              className="airdrop-media"
              muted={false}
              playsInline
              loop={false}
              preload="auto"
            />
          ) : (
            <HEICImage src={currentMedia} alt="Shared photo" className="airdrop-media" />
          )}
        </div>
        {files.length > 1 && (
          <button
            className="airdrop-nav-button airdrop-nav-next"
            onClick={handleNext}
            onMouseDown={(e) => e.stopPropagation()}
            aria-label="Next"
          >
            ›
          </button>
        )}
        {files.length > 1 && (
          <div className="airdrop-indicator">
            {currentIndex + 1} / {files.length}
          </div>
        )}
      </div>
      <div className="airdrop-buttons">
        <button 
          className="airdrop-button airdrop-decline" 
          onClick={onDecline}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Decline
        </button>
        <button 
          className="airdrop-button airdrop-accept" 
          onClick={onAccept}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Accept
        </button>
      </div>
      <div
        className="airdrop-resize-handle"
        onMouseDown={handleResizeMouseDown}
        style={{ cursor: 'nwse-resize' }}
      />
    </div>
  );
};

