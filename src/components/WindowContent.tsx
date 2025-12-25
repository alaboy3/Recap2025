import React from 'react';
import { Folder } from './Folder';
import { ImageIcon } from './ImageIcon';
import { MediaGrid } from './MediaGrid';
import { NotesWindow } from './NotesWindow';
import { CollageView } from './CollageView';
import { MusicWindow } from './MusicWindow';
import { MovieWindow } from './MovieWindow';
import { OutfitsView } from './OutfitsView';
import { ImageStackView } from './ImageStackView';
import { CalendarWindow } from './CalendarWindow';
import { HEICImage } from './HEICImage';
import { Folder as FolderType, ImageItem } from '../types';
import './WindowContent.css';

interface WindowContentProps {
  type: 'folder' | 'image' | 'imageStack' | 'folderContents' | 'notes' | 'collage' | 'music' | 'outfits' | 'calendar' | 'movies';
  items?: string[];
  imageSrc?: string;
  imageStack?: string[];
  backgroundImage?: string;
  windowId?: string;
  folderContents?: {
    folders?: FolderType[];
    images?: ImageItem[];
    items?: string[];
  };
}

export const WindowContent: React.FC<WindowContentProps> = ({
  type,
  items,
  imageSrc,
  imageStack,
  backgroundImage,
  windowId,
  folderContents,
}) => {
  if (type === 'folderContents' && folderContents) {
    return (
      <div className="window-folder-contents">
        <div className="window-folder-items">
          {folderContents.folders?.map((folder) => (
            <div key={folder.id} className="window-item-wrapper">
              <Folder folder={folder} />
            </div>
          ))}
          {folderContents.images?.map((image) => (
            <div key={image.id} className="window-item-wrapper">
              <ImageIcon image={image} />
            </div>
          ))}
        </div>
        {folderContents.items && folderContents.items.length > 0 && (
          <div className="window-media-grid-container">
            <MediaGrid items={folderContents.items} />
          </div>
        )}
      </div>
    );
  }

  if (type === 'folder' && items) {
    return <MediaGrid items={items} />;
  }

  if (type === 'imageStack' && imageStack && imageStack.length > 0) {
    return <ImageStackView images={imageStack} windowId={windowId} />;
  }

  if (type === 'image' && imageSrc) {
    return (
      <div className="window-image-view">
        <HEICImage src={imageSrc} alt="Preview" />
      </div>
    );
  }

  if (type === 'notes') {
    return <NotesWindow />;
  }

  if (type === 'collage' && items) {
    return <CollageView items={items} />;
  }

  if (type === 'music') {
    return <MusicWindow />;
  }

  if (type === 'outfits' && items) {
    return <OutfitsView items={items} />;
  }

  if (type === 'calendar') {
    return <CalendarWindow backgroundImage={backgroundImage} />;
  }

  if (type === 'movies') {
    return <MovieWindow />;
  }

  return null;
};

