import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { Folder as FolderType } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import { HEICImage } from './HEICImage';
import './Folder.css';

interface FolderProps {
  folder: FolderType;
  folderContents?: {
    folders?: FolderType[];
    images?: import('../types').ImageItem[];
    items?: string[];
  };
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const Folder: React.FC<FolderProps> = ({ folder, folderContents, onPositionChange, onNameChange }) => {
  const { openWindow, navigateToPage } = useApp();
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  
  // Special handling for year_2025 folder - convert x: 0 to actual center position for dragging
  const isYear2025 = folder.id === 'year_2025';
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  
  // Convert stored position to actual screen position for dragging
  const actualPosition = isYear2025 && folder.position.x === 0
    ? { x: viewportWidth / 2, y: folder.position.y }
    : folder.position;
  
  const { position, handleMouseDown } = useDrag(actualPosition, (newPos) => {
    if (onPositionChange) {
      // Save the actual position (no special centering)
      onPositionChange(newPos);
    }
  });

  const handleDoubleClick = () => {
    // Special handling for year_2025 - navigate to page instead of opening window
    if (folder.id === 'year_2025' && folderContents) {
      navigateToPage('year_2025');
      return;
    }

    if (folderContents) {
      // Open with folder contents (folders, images, and items) - for folders inside year_2025
      // Make window almost full screen with responsive margins
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const isMobile = viewportWidth < 768;
      const margin = isMobile ? 20 : 72;
      const windowWidth = Math.max(300, viewportWidth - (margin * 2));
      const windowHeight = Math.max(200, viewportHeight - (margin * 2));
      openWindow({
        id: `window-${folder.id}`,
        title: folder.name,
        position: { x: margin, y: margin },
        size: { width: windowWidth, height: windowHeight },
        zIndex: 100,
        type: 'folderContents',
        folderContents: folderContents,
      });
    } else if (folder.items && folder.items.length > 0) {
      // Special handling for apa folder - use collage view
      if (folder.id === 'apa') {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
        const isMobile = viewportWidth < 768;
        const margin = isMobile ? 20 : 72;
        const windowWidth = Math.max(300, viewportWidth - (margin * 2));
        const windowHeight = Math.max(200, viewportHeight - (margin * 2));
        openWindow({
          id: `window-${folder.id}`,
          title: folder.name,
          position: { x: margin, y: margin },
          size: { width: windowWidth, height: windowHeight },
          zIndex: 100,
          type: 'collage',
          items: folder.items,
        });
      } else if (folder.id === 'outfits') {
        // Special handling for outfits folder - use outfits view with vertical/portrait sizing
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
        
        // Responsive sizing - smaller on mobile
        const isMobile = viewportWidth < 768;
        const windowWidth = isMobile ? Math.min(viewportWidth - 40, 600) : 900;
        // Increased height to ensure all items fit without scrolling
        const windowHeight = isMobile ? Math.min(viewportHeight - 40, 1000) : Math.min(viewportHeight - 40, 1600);
        
        // Center the window
        const windowX = Math.max(20, (viewportWidth - windowWidth) / 2);
        const windowY = Math.max(20, (viewportHeight - windowHeight) / 2);
        openWindow({
          id: `window-${folder.id}`,
          title: 'my favorite outfits',
          position: { x: windowX, y: windowY },
          size: { width: windowWidth, height: windowHeight },
          zIndex: 100,
          type: 'outfits',
          items: folder.items,
        });
      } else {
        // Regular folder with items
        // Make window almost full screen with responsive margins
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
        const isMobile = viewportWidth < 768;
        const margin = isMobile ? 20 : 72;
        const windowWidth = Math.max(300, viewportWidth - (margin * 2));
        const windowHeight = Math.max(200, viewportHeight - (margin * 2));
        openWindow({
          id: `window-${folder.id}`,
          title: folder.name,
          position: { x: margin, y: margin },
          size: { width: windowWidth, height: windowHeight },
          zIndex: 100,
          type: 'folder',
          items: folder.items,
        });
      }
    }
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
    if (onNameChange && newName !== folder.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  // Use the current drag position for display
  // Only center year_2025 if it's at the default centered position (x: 0)
  // Once moved, use normal positioning
  const shouldCenter = isYear2025 && folder.position.x === 0;
  
  return (
    <>
      <div
        className={`folder-container ${shouldCenter ? 'folder-centered' : ''}`}
        style={{
          left: shouldCenter ? '50%' : `${position.x}px`,
          top: `${position.y}px`,
          transform: shouldCenter ? 'translateX(-50%)' : 'none',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onContextMenu={handleContextMenu}
      >
      <div className="folder-icon">
        {folder.placeholder ? (
          <div className="folder-placeholder-image">
            <HEICImage 
              src={folder.placeholder} 
              alt={folder.name}
              className="folder-placeholder-img"
            />
          </div>
        ) : (
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id={`folderGradient-${folder.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#5BA3FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#3A8EEF" stopOpacity="1" />
              </linearGradient>
              <linearGradient id={`folderTabGradient-${folder.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6BB0FF" stopOpacity="1" />
                <stop offset="100%" stopColor="#4A9EFF" stopOpacity="1" />
              </linearGradient>
              <filter id={`folderShadow-${folder.id}`}>
                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                <feOffset dx="0" dy="2" result="offsetblur" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {/* Main folder body with gradient */}
            <path
              d="M8 20C8 18.8954 8.89543 18 10 18H54C55.1046 18 56 18.8954 56 20V52C56 53.1046 55.1046 54 54 54H10C8.89543 54 8 53.1046 8 52V20Z"
              fill={`url(#folderGradient-${folder.id})`}
              filter={`url(#folderShadow-${folder.id})`}
            />
            {/* Folder tab */}
            <path
              d="M8 20C8 18.8954 8.89543 18 10 18H24L28 12C28 10.8954 28.8954 10 30 10H54C55.1046 10 56 10.8954 56 12V20H8V20Z"
              fill={`url(#folderTabGradient-${folder.id})`}
            />
            {/* Highlight on tab */}
            <path
              d="M24 18L28 12C28 10.8954 28.8954 10 30 10H50C51.1046 10 52 10.8954 52 12V18H24Z"
              fill="rgba(255, 255, 255, 0.3)"
            />
            {/* Highlight on body */}
            <path
              d="M10 20H54C55.1046 20 56 20.8954 56 22V24H8V20C8 20.8954 8.89543 20 10 20Z"
              fill="rgba(255, 255, 255, 0.2)"
            />
          </svg>
        )}
      </div>
      <div className="folder-label">
        {isRenaming ? (
          <EditableLabel
            value={folder.name}
            onSave={handleNameSave}
            onCancel={() => setIsRenaming(false)}
            className="folder-label-editable"
            autoEdit={true}
          />
        ) : (
          folder.name
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

