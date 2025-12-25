import React from 'react';
import { HEICImage } from './HEICImage';
import { useApp } from '../context/AppContext';
import { getAssetPath } from '../utils/assetPath';
import './CollageView.css';

interface CollageViewProps {
  items: string[];
}

export const CollageView: React.FC<CollageViewProps> = ({ items }) => {
  const { openQuickLook } = useApp();

  const getMediaSrc = (filename: string): string => {
    // Check if it's already a full path
    if (filename.startsWith('/images/')) {
      return filename;
    }
    // All media files (images and videos) are in /images/
    return `/images/${filename}`;
  };

  const getMediaType = (filename: string): 'image' | 'video' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'mov' || ext === 'mp4' || ext === 'webm' ? 'video' : 'image';
  };

  const handleImageClick = (src: string, type: 'image' | 'video') => {
    openQuickLook(src, type);
  };

  // Generate positions dynamically for all items - overlapping, organic arrangement
  // All items stay on the same horizontal line with slight vertical variation
  // Items continue horizontally in a continuous line
  const generatePositions = (count: number) => {
    const baseY = 20; // Base y position for all items (elevated higher)
    const yVariation = 30; // Small variation to keep it on the same line
    const widths = [360, 380, 400, 420, 440, 450, 460];
    const heights = [480, 500, 520, 540, 560, 580, 600, 620];
    const rotations = [-2.5, -2, -1.5, -1, 1, 1.5, 2, 2.5];
    
    const positions = [];
    let currentX = 0;
    const gapRange = [40, 60]; // Gap between items (40-60px) - half of previous spacing
    
    // Generate positions for all items in a continuous horizontal line
    for (let i = 0; i < count; i++) {
      const width = widths[Math.floor(Math.random() * widths.length)];
      const height = heights[Math.floor(Math.random() * heights.length)];
      const rotation = rotations[Math.floor(Math.random() * rotations.length)];
      
      // Calculate y with slight variation to stay on the same line
      const y = baseY + (Math.random() * yVariation * 2 - yVariation);
      
      // Position x based on previous item with gap spacing
      if (i > 0) {
        const prevWidth = positions[i - 1].width;
        const gap = gapRange[0] + Math.random() * (gapRange[1] - gapRange[0]);
        currentX = currentX + prevWidth + gap;
      }
      
      positions.push({ x: currentX, y, width, height, rotation });
    }
    
    return positions;
  };
  
  const collagePositions = generatePositions(items.length);

  return (
    <div className="collage-container">
      <div className="collage-scroll-area">
        {items.map((item, index) => {
          const src = getMediaSrc(item);
          const type = getMediaType(item);
          const position = collagePositions[index] || collagePositions[index % collagePositions.length];
          // Extract filename from path (e.g., "Apa/1.jpg" -> "1.jpg")
          const filename = item.split('/').pop() || item;
          
          return (
            <div
              key={index}
              className="collage-item"
              style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${position.width}px`,
                height: `${position.height}px`,
                transform: `rotate(${position.rotation}deg)`,
              }}
              onClick={() => handleImageClick(src, type)}
            >
              {type === 'image' ? (
                <HEICImage
                  src={src}
                  alt={filename}
                  className="collage-image"
                />
              ) : (
                <div className="collage-video">
                  <video
                    src={getAssetPath(src)}
                    className="collage-video-element"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

