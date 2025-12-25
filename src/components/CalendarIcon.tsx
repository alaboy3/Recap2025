import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { CalendarItem } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import './CalendarIcon.css';

interface CalendarIconProps {
  calendar: CalendarItem;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({ calendar, onPositionChange, onNameChange }) => {
  const { openWindow } = useApp();
  const { position, handleMouseDown } = useDrag(calendar.position, onPositionChange);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDoubleClick = () => {
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
    const windowWidth = Math.min(1000, viewportWidth - 80);
    const windowHeight = Math.min(800, viewportHeight - 80);
    const windowX = (viewportWidth - windowWidth) / 2;
    const windowY = (viewportHeight - windowHeight) / 2;
    
    openWindow({
      id: `window-${calendar.id}`,
      title: calendar.name,
      position: { x: windowX, y: windowY },
      size: { width: windowWidth, height: windowHeight },
      zIndex: 1,
      type: 'calendar',
      backgroundImage: calendar.backgroundImage,
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
    if (onNameChange && newName !== calendar.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <div
        className="calendar-icon-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="calendar-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="url(#calendarGradient)"/>
            <rect x="8" y="8" width="48" height="48" rx="12" fill="white" fillOpacity="0.95"/>
            {/* Modern calendar design - centered */}
            <rect x="14" y="18" width="36" height="28" rx="4" fill="none" stroke="url(#calendarLineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Spiral binding on left - adjusted for centering */}
            <circle cx="18" cy="22" r="1.5" fill="url(#calendarLineGradient)"/>
            <circle cx="18" cy="28" r="1.5" fill="url(#calendarLineGradient)"/>
            <circle cx="18" cy="34" r="1.5" fill="url(#calendarLineGradient)"/>
            <circle cx="18" cy="40" r="1.5" fill="url(#calendarLineGradient)"/>
            {/* Grid lines - centered */}
            <line x1="14" y1="26" x2="50" y2="26" stroke="url(#calendarLineGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
            <line x1="22" y1="18" x2="22" y2="46" stroke="url(#calendarLineGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <line x1="32" y1="18" x2="32" y2="46" stroke="url(#calendarLineGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <line x1="42" y1="18" x2="42" y2="46" stroke="url(#calendarLineGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            {/* Date dots - centered */}
            <circle cx="27" cy="32" r="2.5" fill="url(#calendarDotGradient)"/>
            <circle cx="37" cy="32" r="2.5" fill="url(#calendarDotGradient)"/>
            <circle cx="27" cy="38" r="2.5" fill="url(#calendarDotGradient)"/>
            <circle cx="37" cy="38" r="2.5" fill="url(#calendarDotGradient)"/>
            <defs>
              <linearGradient id="calendarGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#5E9EFF"/>
                <stop offset="0.5" stopColor="#4A8EFF"/>
                <stop offset="1" stopColor="#007AFF"/>
              </linearGradient>
              <linearGradient id="calendarLineGradient" x1="14" y1="18" x2="50" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF"/>
                <stop offset="1" stopColor="#0051D5"/>
              </linearGradient>
              <linearGradient id="calendarDotGradient" x1="24.5" y1="29.5" x2="39.5" y2="40.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#007AFF"/>
                <stop offset="1" stopColor="#0051D5"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="calendar-icon-label">
          {isRenaming ? (
            <EditableLabel
              value={calendar.name}
              onSave={handleNameSave}
              onCancel={() => setIsRenaming(false)}
              className="calendar-label-editable"
              autoEdit={true}
            />
          ) : (
            calendar.name
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

