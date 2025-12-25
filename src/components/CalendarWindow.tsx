import React, { useState, useEffect } from 'react';
import { HEICImage } from './HEICImage';
import heic2any from 'heic2any';
import './CalendarWindow.css';

interface CalendarWindowProps {
  backgroundImage?: string;
  events?: any[];
}

interface MonthData {
  image: string;
  background: string;
  folder: string;
}

const monthData: Record<number, MonthData> = {
  7: { // August
    image: '/images/Agosto/Agosto.JPG',
    background: '/images/Agosto/bgAgosto.HEIC',
    folder: 'Agosto'
  },
  8: { // September
    image: '/images/september/september.JPG',
    background: '/images/september/bgSept.HEIC',
    folder: 'september'
  },
  9: { // October
    image: '/images/october/october.JPG',
    background: '/images/october/bgoctober.JPG',
    folder: 'october'
  },
  10: { // November
    image: '/images/November/november.JPG',
    background: '/images/November/bgNovember.JPG',
    folder: 'November'
  },
  11: { // December
    image: '/images/December/december.JPG',
    background: '/images/December/bgChristmas.JPG',
    folder: 'December'
  }
};

// Global image cache for converted HEIC images - accessible via window for HEICImage
const imageCache = new Map<string, string>();

// Make cache available globally for HEICImage component
if (typeof window !== 'undefined') {
  (window as any).__heicImageCache__ = imageCache;
}

export const CalendarWindow: React.FC<CalendarWindowProps> = () => {
  const [currentMonth, setCurrentMonth] = useState(7); // Start with August (0-indexed: 7)
  
  const monthInfo = monthData[currentMonth];
  
  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 7) return 7; // Don't go before August
      return prev - 1;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev === 11) return 11; // Don't go after December
      return prev + 1;
    });
  };
  
  // Preload current month images consistently
  useEffect(() => {
    const loadCurrentMonthImages = async () => {
      if (!monthInfo) return;
      
      const loadImage = async (src: string, isBackground: boolean): Promise<void> => {
        const isHEIC = src.toLowerCase().endsWith('.heic') || src.toLowerCase().endsWith('.heif');
        
        // Check cache first
        if (imageCache.has(src)) {
          return;
        }
        
        if (isHEIC) {
          try {
            const response = await fetch(src);
            const blob = await response.blob();
            const result = await heic2any({
              blob,
              toType: 'image/jpeg',
              quality: isBackground ? 0.75 : 0.9,
            });
            const convertedBlob = Array.isArray(result) ? result[0] : result;
            const url = URL.createObjectURL(convertedBlob);
            imageCache.set(src, url);
          } catch (err) {
            console.warn('Failed to convert HEIC:', src, err);
          }
        } else {
          // Preload regular images
          return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = () => resolve();
            img.src = src;
          });
        }
      };
      
      // Load both images in parallel
      await Promise.all([
        loadImage(monthInfo.background, true),
        loadImage(monthInfo.image, false)
      ]);
    };
    
    loadCurrentMonthImages();
    
    // Preload other months in background
    Object.values(monthData).forEach((month) => {
      if (month === monthInfo) return;
      
      const isBgHEIC = month.background.toLowerCase().endsWith('.heic') || month.background.toLowerCase().endsWith('.heif');
      if (isBgHEIC && !imageCache.has(month.background)) {
        fetch(month.background)
          .then(res => res.blob())
          .then(blob => heic2any({ blob, toType: 'image/jpeg', quality: 0.75 }))
          .then(result => {
            const convertedBlob = Array.isArray(result) ? result[0] : result;
            const url = URL.createObjectURL(convertedBlob);
            imageCache.set(month.background, url);
          })
          .catch(() => {});
      }
    });
  }, [currentMonth, monthInfo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        setCurrentMonth((prev) => {
          if (prev === 7) return 7; // Don't go before August
          return prev - 1;
        });
      } else if (event.key === 'ArrowRight') {
        setCurrentMonth((prev) => {
          if (prev === 11) return 11; // Don't go after December
          return prev + 1;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
  
  if (!monthInfo) {
    return null;
  }
  
  return (
    <div className="calendar-window-content">
      
      {/* Background Image */}
      <div className="calendar-background">
        <HEICImage 
          key={`bg-${currentMonth}`}
          src={monthInfo.background} 
          alt="Calendar background" 
          className="calendar-bg-image"
        />
      </div>
      
      {/* Invisible Navigation Buttons */}
      <div className="calendar-navigation-invisible">
        <button 
          className="calendar-nav-arrow calendar-nav-arrow-left"
          onClick={handlePreviousMonth}
          disabled={currentMonth === 7}
          title="Previous month"
          aria-label="Previous month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        <button 
          className="calendar-nav-arrow calendar-nav-arrow-right"
          onClick={handleNextMonth}
          disabled={currentMonth === 11}
          title="Next month"
          aria-label="Next month"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div className="calendar-image-container">
        <HEICImage 
          key={`main-${currentMonth}`}
          src={monthInfo.image} 
          alt="Calendar" 
          className="calendar-main-image"
        />
      </div>
    </div>
  );
};

