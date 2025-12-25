import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { MovieItem } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import './MovieIcon.css';

interface MovieIconProps {
  movie: MovieItem;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const MovieIcon: React.FC<MovieIconProps> = ({ movie, onPositionChange, onNameChange }) => {
  const { openWindow } = useApp();
  const { position, handleMouseDown } = useDrag(movie.position, onPositionChange);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDoubleClick = () => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    // Calculate exact width: 6 TV show posters (180px each) + 5 gaps (20px each) + padding (80px) = 1260px
    // 6 × 180 + 5 × 20 + 40 + 40 = 1080 + 100 + 80 = 1260px
    const exactWidth = 1260;
    const windowWidth = exactWidth;
    const windowHeight = Math.min(900, viewportHeight - 80);
    const windowX = Math.max(20, (viewportWidth - windowWidth) / 2);
    const windowY = (viewportHeight - windowHeight) / 2;
    
    openWindow({
      id: `window-${movie.id}`,
      title: movie.name,
      position: { x: windowX, y: windowY },
      size: { width: windowWidth, height: windowHeight },
      zIndex: 1,
      type: 'movies',
    });
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleRename = () => {
    setContextMenu(null);
    setIsRenaming(true);
  };

  const handleNameSave = (newName: string) => {
    if (onNameChange && newName !== movie.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <div
        className="movie-icon-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="movie-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="url(#movieGradient)"/>
            <rect x="8" y="8" width="48" height="48" rx="12" fill="white" fillOpacity="0.95"/>
            {/* Clapperboard - Clear and recognizable */}
            {/* Main board - dark with subtle gradient */}
            <rect x="14" y="22" width="36" height="26" rx="2.5" fill="url(#slateGradient)" stroke="url(#slateStrokeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Top edge with visible diagonal stripes */}
            <rect x="14" y="22" width="36" height="6" rx="2.5" fill="url(#stripePattern)"/>
            {/* Clapper Arm - raised with clear diagonal stripes */}
            <path d="M14 22 L40 10 L44 14 L18 28 Z" fill="url(#stripePattern)" stroke="url(#slateStrokeGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Rounded end of clapper */}
            <path d="M40 10 Q44 10 44 14" fill="url(#stripePattern)" stroke="url(#slateStrokeGradient)" strokeWidth="2" strokeLinecap="round"/>
            {/* Hinge on left - visible but subtle */}
            <rect x="12" y="24" width="4" height="6" rx="1" fill="url(#hingeGradient)" stroke="url(#slateStrokeGradient)" strokeWidth="1"/>
            <circle cx="14" cy="25" r="1" fill="url(#slateStrokeGradient)" opacity="0.6"/>
            <circle cx="14" cy="29" r="1" fill="url(#slateStrokeGradient)" opacity="0.6"/>
            {/* Text lines on slate - visible but subtle */}
            <line x1="18" y1="32" x2="46" y2="32" stroke="url(#slateStrokeGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            <line x1="18" y1="36" x2="46" y2="36" stroke="url(#slateStrokeGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            <line x1="18" y1="40" x2="46" y2="40" stroke="url(#slateStrokeGradient)" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
            <defs>
              <linearGradient id="movieGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8B5CF6"/>
                <stop offset="0.5" stopColor="#A855F7"/>
                <stop offset="1" stopColor="#C084FC"/>
              </linearGradient>
              <linearGradient id="slateGradient" x1="14" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2a2a2a"/>
                <stop offset="0.5" stopColor="#1a1a1a"/>
                <stop offset="1" stopColor="#0f0f0f"/>
              </linearGradient>
              <linearGradient id="slateStrokeGradient" x1="14" y1="22" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1a1a1a"/>
                <stop offset="1" stopColor="#0a0a0a"/>
              </linearGradient>
              <pattern id="stripePattern" x="0" y="0" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="2.5" height="5" fill="#1a1a1a"/>
                <rect x="2.5" width="2.5" height="5" fill="white" fillOpacity="0.95"/>
              </pattern>
              <linearGradient id="hingeGradient" x1="12" y1="24" x2="16" y2="30" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4a4a4a"/>
                <stop offset="1" stopColor="#2a2a2a"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="movie-icon-label">
          {isRenaming ? (
            <EditableLabel
              value={movie.name}
              onSave={handleNameSave}
              onCancel={() => setIsRenaming(false)}
              className="movie-label-editable"
              autoEdit={true}
            />
          ) : (
            movie.name
          )}
        </div>
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onRename={handleRename}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  );
};

