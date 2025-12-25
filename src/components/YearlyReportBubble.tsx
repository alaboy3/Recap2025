import React, { useMemo } from 'react';
import { useDrag } from '../hooks/useDrag';
import { Position } from '../types';
import './YearlyReportBubble.css';

interface YearlyReportBubbleProps {
  folderPosition?: Position;
  position?: Position;
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const YearlyReportBubble: React.FC<YearlyReportBubbleProps> = ({ 
  folderPosition,
  position: savedPosition,
  onPositionChange 
}) => {
  // Calculate default position based on folder, or use saved position
  const defaultPosition = useMemo(() => {
    if (savedPosition) {
      return savedPosition;
    }
    
    if (!folderPosition) {
      // Default position if folder not found
      return { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 960, y: 80 };
    }

    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
    const folderX = folderPosition.x === 0 ? viewportWidth / 2 : folderPosition.x;
    const folderY = folderPosition.y;
    
    // Position bubble above the folder, pointing down to it
    // Folder is typically around 100px tall, so position bubble about 80px above
    const bubbleY = Math.max(40, folderY - 80);
    
    // Position bubble horizontally aligned with folder center
    const bubbleX = folderX;
    
    return { x: bubbleX, y: bubbleY };
  }, [folderPosition, savedPosition]);

  const { position: dragPosition, handleMouseDown } = useDrag(defaultPosition, (newPos) => {
    if (onPositionChange) {
      onPositionChange(newPos);
    }
  });

  return (
    <div 
      className="yearly-report-bubble"
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        transform: 'translateX(-50%)',
        cursor: 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bubble-content">YEARLY REPORT</div>
      <div className="bubble-tail" />
    </div>
  );
};

