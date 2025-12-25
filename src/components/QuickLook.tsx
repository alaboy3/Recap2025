import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { HEICImage } from './HEICImage';
import { getAssetPath } from '../utils/assetPath';
import './QuickLook.css';

export const QuickLook: React.FC = () => {
  const { quickLook, closeQuickLook } = useApp();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && quickLook.isOpen) {
        closeQuickLook();
      }
    };

    if (quickLook.isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [quickLook.isOpen, closeQuickLook]);

  if (!quickLook.isOpen || !quickLook.mediaSrc) {
    return null;
  }

  return (
    <div className="quicklook-overlay" onClick={closeQuickLook}>
      <div className="quicklook-content">
        {quickLook.mediaType === 'image' ? (
          <HEICImage src={quickLook.mediaSrc} alt="Preview" className="quicklook-media" />
        ) : (
          <video
            src={getAssetPath(quickLook.mediaSrc)}
            controls
            autoPlay
            className="quicklook-media"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
    </div>
  );
};

