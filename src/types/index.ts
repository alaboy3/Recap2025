export interface Position {
  x: number;
  y: number;
}

export interface Folder {
  id: string;
  name: string;
  position: Position;
  items: string[];
  placeholder?: string; // Optional image path for folder icon
}

export interface ImageItem {
  id: string;
  name: string;
  src: string;
  position: Position;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  imageStack?: string[]; // Array of image sources for stack navigation
}

export interface NotesItem {
  id: string;
  name: string;
  position: Position;
}

export interface MusicItem {
  id: string;
  name: string;
  position: Position;
}

export interface CalendarItem {
  id: string;
  name: string;
  position: Position;
  backgroundImage?: string;
}

export interface MovieItem {
  id: string;
  name: string;
  position: Position;
}

export interface DesktopData {
  folders: Folder[];
  images: ImageItem[];
  notes?: NotesItem[];
  music?: MusicItem[];
  calendar?: CalendarItem[];
  movies?: MovieItem[];
  yearlyReportBubblePosition?: Position;
  folderContents?: {
    [folderId: string]: {
      folders?: Folder[];
      images?: ImageItem[];
      notes?: NotesItem[];
      music?: MusicItem[];
      calendar?: CalendarItem[];
      movies?: MovieItem[];
      items?: string[];
      photoBoothPosition?: Position;
      airdropPosition?: Position;
      tripBubblePosition?: Position;
      nycBubblePosition?: Position;
    };
  };
}

export interface Window {
  id: string;
  title: string;
  position: Position;
  size: { width: number; height: number };
  zIndex: number;
  type: 'folder' | 'image' | 'imageStack' | 'folderContents' | 'notes' | 'collage' | 'music' | 'outfits' | 'calendar' | 'movies';
  items?: string[];
  imageSrc?: string;
  imageStack?: string[]; // Array of image sources for stack navigation
  backgroundImage?: string; // For calendar background
  folderContents?: {
    folders?: Folder[];
    images?: ImageItem[];
    items?: string[];
  };
}

export interface QuickLookState {
  isOpen: boolean;
  mediaSrc: string | null;
  mediaType: 'image' | 'video' | null;
}
