import React from 'react';
import { useApp } from '../context/AppContext';
import { HEICImage } from './HEICImage';
import './MediaGrid.css';

interface MediaGridProps {
  items: string[];
}

export const MediaGrid: React.FC<MediaGridProps> = ({ items }) => {
  const { openQuickLook, closeQuickLook, quickLook } = useApp();

  const getMediaType = (filename: string): 'image' | 'video' => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext === 'mp4' || ext === 'mov' || ext === 'webm' ? 'video' : 'image';
  };

  const getMediaSrc = (filename: string): string => {
    // If it's already a full path starting with /images/ or /videos/, use it as-is
    if (filename.startsWith('/images/') || filename.startsWith('/videos/')) {
      return filename;
    }
    
    // Otherwise, construct the path based on media type
    const type = getMediaType(filename);
    return type === 'video' ? `/videos/${filename}` : `/images/${filename}`;
  };

  const handleClick = (filename: string) => {
    const type = getMediaType(filename);
    const src = getMediaSrc(filename);
    
    // Toggle: if the same item is already open, close it; otherwise open it
    if (quickLook.isOpen && quickLook.mediaSrc === src) {
      closeQuickLook();
    } else {
      openQuickLook(src, type);
    }
  };

  return (
    <div className="media-grid">
      {items.map((item, index) => {
        const type = getMediaType(item);
        const src = getMediaSrc(item);
        return (
          <div
            key={index}
            className="media-grid-item"
            onClick={() => handleClick(item)}
          >
            {type === 'image' ? (
              <HEICImage src={src} alt={item} className="media-thumbnail" />
            ) : (
              <div className="media-thumbnail video-thumbnail">
                <video src={src} className="media-preview" />
                <div className="video-play-icon">▶</div>
              </div>
            )}
            <div className="media-filename">{item}</div>
          </div>
        );
      })}
    </div>
  );
};

