import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { HEICImage } from './HEICImage';
import { useApp } from '../context/AppContext';
import './PhotoBoothWindow.css';

interface PhotoBoothWindowProps {
  position: { x: number; y: number };
  photoSrc: string;
  onClose?: () => void;
  isClosing?: boolean;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const PhotoBoothWindow: React.FC<PhotoBoothWindowProps> = ({ 
  position, 
  photoSrc, 
  onClose, 
  isClosing = false,
  onPositionChange 
}) => {
  const { openReminders } = useApp();
  const [isEffectApplied, setIsEffectApplied] = useState(false);
  
  const handleCaptureClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Capture button clicked');
    try {
      openReminders();
      console.log('openReminders called');
    } catch (error) {
      console.error('Error opening reminders:', error);
    }
  };
  
  const handleEffectsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEffectApplied(true);
  };
  
  const { position: dragPosition, handleMouseDown } = useDrag(position, (newPos) => {
    if (onPositionChange) {
      onPositionChange(newPos);
    }
  });
  
  const currentPhotoSrc = isEffectApplied ? '/images/Aiko/aiko.JPG' : photoSrc;
  const currentTitle = isEffectApplied ? 'Aiko' : 'Photo Booth';

  return (
    <div
      className={`photobooth-window ${isClosing ? 'photobooth-closing' : ''}`}
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
      }}
    >
      <div 
        className="photobooth-title-bar"
        onMouseDown={handleMouseDown}
        style={{ cursor: 'move' }}
      >
        <div className="photobooth-controls">
          <button 
            className="photobooth-control photobooth-control-close" 
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <button 
            className="photobooth-control photobooth-control-minimize"
            onMouseDown={(e) => e.stopPropagation()}
          />
          <button 
            className="photobooth-control photobooth-control-maximize"
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
        <div className="photobooth-title">{currentTitle}</div>
      </div>
      <div className="photobooth-content">
        <HEICImage src={currentPhotoSrc} alt={currentTitle} className="photobooth-photo" />
        {isEffectApplied && (
          <div className="photobooth-snow-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="photobooth-snowflake"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 4}s`,
                  opacity: 0.3 + Math.random() * 0.7,
                  fontSize: `${8 + Math.random() * 12}px`,
                }}
              >
                ❄
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="photobooth-bottom-bar">
        <div className="photobooth-left-controls">
          <button 
            className="photobooth-icon-button"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button 
            className="photobooth-icon-button"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <circle cx="10" cy="10" r="2" fill="currentColor" />
            </svg>
          </button>
          <button 
            className="photobooth-icon-button"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M7 3L7 7M13 3L13 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <button 
          className="photobooth-capture-button"
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onClick={handleCaptureClick}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" fill="#FF3B30" />
            <circle cx="16" cy="16" r="10" fill="white" />
          </svg>
        </button>
        <button 
          className="photobooth-effects-button"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={handleEffectsClick}
        >Effects</button>
      </div>
    </div>
  );
};

