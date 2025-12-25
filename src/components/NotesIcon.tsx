import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { NotesItem } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import './NotesIcon.css';

interface NotesIconProps {
  note: NotesItem;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const NotesIcon: React.FC<NotesIconProps> = ({ note, onPositionChange, onNameChange }) => {
  const { openWindow } = useApp();
  const { position, handleMouseDown } = useDrag(note.position, onPositionChange);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDoubleClick = () => {
    openWindow({
      id: `window-${note.id}`,
      title: note.name,
      position: { x: 200, y: 100 },
      size: { width: 1000, height: 700 },
      zIndex: 1,
      type: 'notes',
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
    if (onNameChange && newName !== note.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  return (
    <>
      <div
        className="notes-icon-container"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
        <div className="notes-icon">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="64" height="64" rx="16" fill="url(#notesGradient)"/>
            <rect x="8" y="8" width="48" height="48" rx="12" fill="white" fillOpacity="0.95"/>
            {/* Modern notebook design with margin line */}
            <line x1="20" y1="16" x2="20" y2="48" stroke="url(#notesMarginGradient)" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
            {/* Text lines with varying lengths for natural look */}
            <path d="M24 22H46M24 28H44M24 34H42M24 40H40M24 46H38" stroke="url(#notesLineGradient)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {/* Bullet points */}
            <circle cx="26" cy="22" r="2" fill="url(#notesLineGradient)"/>
            <circle cx="26" cy="28" r="2" fill="url(#notesLineGradient)"/>
            <circle cx="26" cy="34" r="2" fill="url(#notesLineGradient)"/>
            {/* Subtle corner fold */}
            <path d="M48 16L56 8L56 16L48 16Z" fill="url(#notesCornerGradient)" opacity="0.3"/>
            <defs>
              <linearGradient id="notesGradient" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFD93D"/>
                <stop offset="0.5" stopColor="#FFC947"/>
                <stop offset="1" stopColor="#FFA726"/>
              </linearGradient>
              <linearGradient id="notesLineGradient" x1="24" y1="22" x2="46" y2="46" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFB300"/>
                <stop offset="0.5" stopColor="#FFC107"/>
                <stop offset="1" stopColor="#FFD54F"/>
              </linearGradient>
              <linearGradient id="notesMarginGradient" x1="20" y1="16" x2="20" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFB300" stopOpacity="0.4"/>
                <stop offset="1" stopColor="#FFC107" stopOpacity="0.4"/>
              </linearGradient>
              <linearGradient id="notesCornerGradient" x1="48" y1="16" x2="56" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFA726"/>
                <stop offset="1" stopColor="#FFB300"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="notes-icon-label">
          {isRenaming ? (
            <EditableLabel
              value={note.name}
              onSave={handleNameSave}
              onCancel={() => setIsRenaming(false)}
              className="notes-label-editable"
              autoEdit={true}
            />
          ) : (
            note.name
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

