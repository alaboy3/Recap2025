import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { MusicItem } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import './MusicIcon.css';

interface MusicIconProps {
  music: MusicItem;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const MusicIcon: React.FC<MusicIconProps> = ({ music, onPositionChange, onNameChange }) => {
  const { openWindow } = useApp();
  const { position, handleMouseDown } = useDrag(music.position, onPositionChange);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDoubleClick = () => {
    openWindow({
      id: `window-${music.id}`,
      title: music.name,
      position: { x: 200, y: 100 },
      size: { width: 1000, height: 700 },
      zIndex: 1,
      type: 'music',
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
    if (onNameChange && newName !== music.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <div
        className="music-icon-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="music-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="url(#musicGradient)"/>
            <rect x="8" y="8" width="48" height="48" rx="12" fill="white" fillOpacity="0.95"/>
            {/* Vinyl Record */}
            {/* Outer circle - record edge */}
            <circle cx="32" cy="32" r="24" fill="url(#vinylGradient)" stroke="#2a2a2a" strokeWidth="0.5"/>
            {/* Groove circles - darker grey for contrast */}
            <circle cx="32" cy="32" r="20" fill="none" stroke="#1a1a1a" strokeWidth="0.4" opacity="0.8"/>
            <circle cx="32" cy="32" r="16" fill="none" stroke="#1a1a1a" strokeWidth="0.4" opacity="0.8"/>
            <circle cx="32" cy="32" r="12" fill="none" stroke="#1a1a1a" strokeWidth="0.4" opacity="0.8"/>
            <circle cx="32" cy="32" r="8" fill="none" stroke="#1a1a1a" strokeWidth="0.4" opacity="0.8"/>
            {/* Center label area - keep pink gradient for color */}
            <circle cx="32" cy="32" r="6" fill="url(#vinylLabelGradient)"/>
            {/* Center hole */}
            <circle cx="32" cy="32" r="2" fill="#1a1a1a"/>
            {/* Shine/reflection on vinyl */}
            <ellipse cx="28" cy="28" rx="8" ry="12" fill="white" fillOpacity="0.2"/>
            <defs>
              <linearGradient id="musicGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B9D"/>
                <stop offset="0.5" stopColor="#FF8E8E"/>
                <stop offset="1" stopColor="#FFB347"/>
              </linearGradient>
              <linearGradient id="vinylGradient" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
                <stop stopColor="#4a4a4a"/>
                <stop offset="0.5" stopColor="#3a3a3a"/>
                <stop offset="1" stopColor="#2a2a2a"/>
              </linearGradient>
              <linearGradient id="vinylLabelGradient" x1="26" y1="26" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FF6B9D"/>
                <stop offset="0.5" stopColor="#FF8E8E"/>
                <stop offset="1" stopColor="#FFB347"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="music-icon-label">
          {isRenaming ? (
            <EditableLabel
              value={music.name}
              onSave={handleNameSave}
              onCancel={() => setIsRenaming(false)}
              className="music-label-editable"
              autoEdit={true}
            />
          ) : (
            music.name
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

