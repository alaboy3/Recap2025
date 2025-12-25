import React from 'react';
import { useApp } from '../context/AppContext';
import { HEICImage } from './HEICImage';
import './OutfitsView.css';

interface OutfitsViewProps {
  items: string[];
}

export const OutfitsView: React.FC<OutfitsViewProps> = ({ items }) => {
  const { openQuickLook } = useApp();

  // Map items to full paths - items should be in format like "Fashion/outfit2.HEIC"
  const getImagePath = (item: string) => {
    // If item already has a path, use it; otherwise assume it's in Fashion folder
    let path: string;
    if (item.includes('/')) {
      path = `/images/${item}`;
    } else {
      path = `/images/Fashion/${item}`;
    }
    console.log('OutfitsView: Constructed image path:', path, 'from item:', item);
    return path;
  };

  // Separate mainOutfit (large) from outfit1-3 (small)
  const largeImage = items.find(item => item.toLowerCase().includes('mainoutfit')) || items[0];
  const smallImages = items.filter(item => !item.toLowerCase().includes('mainoutfit')).slice(0, 3);

  return (
    <div className="outfits-view-container">
      <div className="outfits-left-section">
        {smallImages.map((item, index) => (
          <div
            key={index}
            className="outfits-small-image"
            onClick={() => openQuickLook(getImagePath(item), 'image')}
          >
            <HEICImage 
              src={getImagePath(item)} 
              alt={`Outfit ${index + 1}`}
              className="outfits-image"
              onError={() => console.error('Failed to load outfit image:', getImagePath(item))}
            />
            <div className="outfits-image-label">{item.split('/').pop()}</div>
          </div>
        ))}
      </div>
      <div className="outfits-right-section">
        <div
          className="outfits-large-image"
          onClick={() => openQuickLook(getImagePath(largeImage), 'image')}
        >
          <HEICImage 
            src={getImagePath(largeImage)} 
            alt="Main outfit"
            className="outfits-image"
            onError={() => console.error('Failed to load main outfit image:', getImagePath(largeImage))}
          />
        </div>
      </div>
    </div>
  );
};

