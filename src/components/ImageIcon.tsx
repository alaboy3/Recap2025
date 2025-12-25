import React, { useState } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { ImageItem } from '../types';
import { ContextMenu } from './ContextMenu';
import { EditableLabel } from './EditableLabel';
import { HEICImage } from './HEICImage';
import './ImageIcon.css';

interface ImageIconProps {
  image: ImageItem;
  onPositionChange?: (position: { x: number; y: number }) => void;
  onNameChange?: (newName: string) => void;
}

export const ImageIcon: React.FC<ImageIconProps> = ({ image, onPositionChange, onNameChange }) => {
  const { openWindow } = useApp();
  const { position, handleMouseDown } = useDrag(image.position, onPositionChange);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const handleDoubleClick = () => {
    // Check if this is an image stack
    if (image.imageStack && image.imageStack.length > 0) {
      // For image stacks, load first image to get dimensions and center window
      const firstImageSrc = image.imageStack[0];
      const isVideo = firstImageSrc.toLowerCase().endsWith('.mov') || 
                     firstImageSrc.toLowerCase().endsWith('.mp4') || 
                     firstImageSrc.toLowerCase().endsWith('.webm');
      
      if (isVideo) {
        // For videos, use default size and center
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
        
        const windowWidth = Math.min(1200, viewportWidth - 40);
        const windowHeight = Math.min(800, viewportHeight - 40);
        const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
        const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
        
        openWindow({
          id: `window-${image.id}`,
          title: image.name,
          position: { x: windowX, y: windowY },
          size: { width: windowWidth, height: windowHeight },
          zIndex: 1,
          type: 'imageStack',
          imageStack: image.imageStack,
        });
      } else {
        // Load first image to get dimensions
        const img = new Image();
        img.onload = () => {
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
          const titleBarHeight = 40;
          const padding = 32;
          
          const isHorizontal = img.width > img.height;
          const borderPadding = isHorizontal ? 10 : padding; // 5px on each side = 10px total
          // For horizontal, subtract border padding from available space
          const maxContentWidth = isHorizontal ? viewportWidth - borderPadding : viewportWidth - padding;
          const maxContentHeight = isHorizontal ? viewportHeight - titleBarHeight - borderPadding : viewportHeight - titleBarHeight - padding;
          
          // For horizontal images, scale to fit width with borders
          const scaleX = maxContentWidth / img.width;
          const scaleY = maxContentHeight / img.height;
          const scale = isHorizontal 
            ? Math.min(scaleX, 1)
            : Math.min(scaleX, scaleY, 1);
          
          const windowWidth = img.width * scale + borderPadding;
          const windowHeight = img.height * scale + titleBarHeight + borderPadding;
          
          // Center the window
          const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
          const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
          
          openWindow({
            id: `window-${image.id}`,
            title: image.name,
            position: { x: windowX, y: windowY },
            size: { width: windowWidth, height: windowHeight },
            zIndex: 1,
            type: 'imageStack',
            imageStack: image.imageStack,
          });
        };
        img.onerror = () => {
          // Fallback to default size if image fails to load
          const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
          const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
          
          const windowWidth = Math.min(1200, viewportWidth - 40);
          const windowHeight = Math.min(800, viewportHeight - 40);
          const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
          const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
          
          openWindow({
            id: `window-${image.id}`,
            title: image.name,
            position: { x: windowX, y: windowY },
            size: { width: windowWidth, height: windowHeight },
            zIndex: 1,
            type: 'imageStack',
            imageStack: image.imageStack,
          });
        };
        img.src = firstImageSrc;
      }
      return;
    }

    // Load image to get its dimensions for single images
    const img = new Image();
    img.onload = () => {
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      
      // Title bar height is 40px, add some padding (32px total)
      const titleBarHeight = 40;
      const padding = 32;
      const maxContentWidth = viewportWidth - padding;
      const maxContentHeight = viewportHeight - titleBarHeight - padding;
      
      // Calculate scale to fit image within viewport
      const scaleX = maxContentWidth / img.width;
      const scaleY = maxContentHeight / img.height;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up, only down
      
      // Calculate window size based on image dimensions
      const windowWidth = Math.min(img.width * scale + padding, maxContentWidth + padding);
      const windowHeight = Math.min(img.height * scale + titleBarHeight + padding, maxContentHeight + titleBarHeight + padding);
      
      // Center the window
      const windowX = Math.max(0, (viewportWidth - windowWidth) / 2);
      const windowY = Math.max(0, (viewportHeight - windowHeight) / 2);
      
      openWindow({
        id: `window-${image.id}`,
        title: image.name,
        position: { x: windowX, y: windowY },
        size: { width: windowWidth, height: windowHeight },
        zIndex: 1,
        type: 'image',
        imageSrc: image.src,
      });
    };
    img.onerror = () => {
      // Fallback to default size if image fails to load
      openWindow({
        id: `window-${image.id}`,
        title: image.name,
        position: { x: 200, y: 100 },
        size: { width: 800, height: 600 },
        zIndex: 1,
        type: 'image',
        imageSrc: image.src,
      });
    };
    img.src = image.src;
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
    if (onNameChange && newName !== image.name) {
      onNameChange(newName);
    }
    setIsRenaming(false);
  };

  const size = image.size || 'medium';
  
  return (
    <>
    <div
      className={`image-icon-container image-icon-${size}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={`image-icon-thumbnail image-icon-thumbnail-${size} ${image.imageStack && image.imageStack.length > 1 ? 'has-stack' : ''}`}>
        {/* Stacked images behind */}
        {image.imageStack && image.imageStack.length > 1 && (
          <>
            {image.imageStack.slice(1, Math.min(4, image.imageStack.length)).map((stackSrc, idx) => {
              const stackType = stackSrc.split('.').pop()?.toLowerCase();
              const isImage = stackType !== 'mov' && stackType !== 'mp4' && stackType !== 'webm';
              return (
                <div 
                  key={idx} 
                  className="image-icon-stack-layer"
                  style={{
                    zIndex: -idx - 1,
                    transform: `translate(${(idx + 1) * 3}px, ${(idx + 1) * 3}px) scale(${1 - (idx + 1) * 0.03})`,
                    opacity: 0.7 - (idx + 1) * 0.15,
                  }}
                >
                  {isImage ? (
                    <HEICImage src={stackSrc} alt={`Stack ${idx + 2}`} className="image-icon-stack-img" />
                  ) : (
                    <div className="image-icon-stack-video">
                      <div className="image-icon-stack-video-icon">▶</div>
                    </div>
                  )}
                </div>
              );
            })}
          </>
        )}
        {/* Main image on top */}
        <div className="image-icon-main-layer">
          <HEICImage src={image.src} alt={image.name} className="image-icon-thumbnail-img" />
        </div>
      </div>
      <div className="image-icon-label">
        {isRenaming ? (
          <EditableLabel
            value={image.name}
            onSave={handleNameSave}
            onCancel={() => setIsRenaming(false)}
            className="image-label-editable"
            autoEdit={true}
          />
        ) : (
          image.name
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

