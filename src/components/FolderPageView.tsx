import React, { useState } from 'react';
import { Folder } from './Folder';
import { ImageIcon } from './ImageIcon';
import { NotesIcon } from './NotesIcon';
import { MusicIcon } from './MusicIcon';
import { CalendarIcon } from './CalendarIcon';
import { MovieIcon } from './MovieIcon';
import { Window } from './Window';
import { QuickLook } from './QuickLook';
import { MessageBubble } from './MessageBubble';
import { AirDropNotification } from './AirDropNotification';
import { PhotoBoothWindow } from './PhotoBoothWindow';
import { DoNotDisturbToggle } from './DoNotDisturbToggle';
import { WallpaperBackground } from './WallpaperBackground';
import { NotificationToast } from './NotificationToast';
import { RemindersPopup } from './RemindersPopup';
import { useApp } from '../context/AppContext';
import { DesktopData } from '../types';
import './FolderPageView.css';

interface FolderPageViewProps {
  folderId: string;
  folderContents: {
    folders?: import('../types').Folder[];
    images?: import('../types').ImageItem[];
    notes?: import('../types').NotesItem[];
    music?: import('../types').MusicItem[];
    calendar?: import('../types').CalendarItem[];
    movies?: import('../types').MovieItem[];
    items?: string[];
  };
  data: DesktopData;
  onBack: () => void;
  onUpdateData?: (updatedData: DesktopData) => void;
}

export const FolderPageView: React.FC<FolderPageViewProps> = ({
  folderId,
  folderContents,
  data,
  onBack,
  onUpdateData,
}) => {
  const { windows, navigateToPage, showReminders, closeReminders } = useApp();
  
  // Reminders list for 2026
  const reminders = [
    'Starting my French classes again',
    'Improv classes',
    'Japan – March with Helena',
    'Washington DC – Mami y Papi',
    'Speaking at a couple of places',
    'Movie goals',
  ];
  const [viewportSize, setViewportSize] = React.useState({ width: 1920, height: 1080 });
  const [showPhotoBooth, setShowPhotoBooth] = useState(true);
  const [isPhotoBoothClosing, setIsPhotoBoothClosing] = useState(false);
  const [showNYCTag, setShowNYCTag] = useState(true);
  const [showTripBubble, setShowTripBubble] = useState(true);
  const [showAirDrop, setShowAirDrop] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [showDoNotDisturb, setShowDoNotDisturb] = useState(true);

  // Update viewport size on mount and resize
  React.useEffect(() => {
    const updateSize = () => {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Hide Do Not Disturb after 3 seconds, only show once per page load
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowDoNotDisturb(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Helper to constrain positions to viewport boundaries
  const constrainPosition = (position: { x: number; y: number }, width: number, height: number) => {
    const margin = 10;
    const maxX = Math.max(0, viewportSize.width - width - margin);
    const maxY = Math.max(0, viewportSize.height - height - margin);
    return {
      x: Math.max(margin, Math.min(maxX, position.x)),
      y: Math.max(margin, Math.min(maxY, position.y)),
    };
  };

  // Get saved positions from data or use defaults
  const getPhotoBoothPosition = () => {
    const saved = data.folderContents?.[folderId]?.photoBoothPosition;
    return saved ? constrainPosition(saved, 500, 400) : constrainPosition({ x: 150, y: 320 }, 500, 400);
  };

  const getAirDropPosition = () => {
    const saved = data.folderContents?.[folderId]?.airdropPosition;
    return saved ? constrainPosition(saved, 320, 300) : constrainPosition({ x: 800, y: 60 }, 320, 300);
  };

  const [photoBoothPosition, setPhotoBoothPosition] = React.useState(getPhotoBoothPosition());
  const [airdropPosition, setAirDropPosition] = React.useState(getAirDropPosition());

  // Update positions when data changes
  React.useEffect(() => {
    setPhotoBoothPosition(getPhotoBoothPosition());
    setAirDropPosition(getAirDropPosition());
  }, [data.folderContents?.[folderId]?.photoBoothPosition, data.folderContents?.[folderId]?.airdropPosition]);

  const updatePhotoBoothPosition = (position: { x: number; y: number }) => {
    const constrained = constrainPosition(position, 500, 400);
    setPhotoBoothPosition(constrained);
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            photoBoothPosition: constrained,
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateAirDropPosition = (position: { x: number; y: number }) => {
    const constrained = constrainPosition(position, 320, 300);
    setAirDropPosition(constrained);
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            airdropPosition: constrained,
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const dndPosition = constrainPosition({ x: 1140, y: 60 }, 180, 40);
  
  // Get saved bubble positions or calculate defaults
  const getTripBubblePosition = () => {
    const saved = data.folderContents?.[folderId]?.tripBubblePosition;
    if (saved) {
      return constrainPosition(saved, 200, 50);
    }
    // Default: above AirDrop
    return constrainPosition({ 
      x: airdropPosition.x + (320 / 2) - 100,
      y: airdropPosition.y - 60
    }, 200, 50);
  };

  const getNYCBubblePosition = () => {
    const saved = data.folderContents?.[folderId]?.nycBubblePosition;
    if (saved) {
      return constrainPosition(saved, 100, 50);
    }
    // Default: above Photo Booth
    if (!showPhotoBooth) {
      return constrainPosition({ x: 150, y: 280 }, 100, 50);
    }
    return constrainPosition({ 
      x: photoBoothPosition.x + (500 / 2) - 50,
      y: photoBoothPosition.y - 70
    }, 100, 50);
  };

  const [tripBubblePosition, setTripBubblePosition] = React.useState(getTripBubblePosition());
  const [nycBubblePosition, setNYCBubblePosition] = React.useState(getNYCBubblePosition());

  // Update positions when data changes
  React.useEffect(() => {
    setTripBubblePosition(getTripBubblePosition());
  }, [data.folderContents?.[folderId]?.tripBubblePosition, airdropPosition.x, airdropPosition.y]);

  React.useEffect(() => {
    setNYCBubblePosition(getNYCBubblePosition());
  }, [data.folderContents?.[folderId]?.nycBubblePosition, photoBoothPosition.x, photoBoothPosition.y, showPhotoBooth]);

  const updateTripBubblePosition = (position: { x: number; y: number }) => {
    const constrained = constrainPosition(position, 200, 50);
    setTripBubblePosition(constrained);
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            tripBubblePosition: constrained,
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateNYCBubblePosition = (position: { x: number; y: number }) => {
    const constrained = constrainPosition(position, 100, 50);
    setNYCBubblePosition(constrained);
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            nycBubblePosition: constrained,
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const handlePhotoBoothClose = () => {
    setIsPhotoBoothClosing(true);
    setShowNYCTag(false);
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      setShowPhotoBooth(false);
      setIsPhotoBoothClosing(false);
    }, 300);
  };

  const handleAirDropAccept = () => {
    setShowTripBubble(false);
    setShowAirDrop(false);
    setShowNotification(true);
  };

  const handleAirDropDecline = () => {
    setShowTripBubble(false);
    setShowAirDrop(false);
  };

  const handleNotificationComplete = () => {
    setShowNotification(false);
  };

  const updateFolderPosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            folders: data.folderContents[folderId].folders?.map((f) =>
              f.id === id ? { ...f, position } : f
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateImagePosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            images: data.folderContents[folderId].images?.map((img) =>
              img.id === id ? { ...img, position } : img
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateFolderName = (id: string, newName: string) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            folders: data.folderContents[folderId].folders?.map((f) =>
              f.id === id ? { ...f, name: newName } : f
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateNotePosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            notes: data.folderContents[folderId].notes?.map((n) =>
              n.id === id ? { ...n, position } : n
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateNoteName = (id: string, newName: string) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            notes: data.folderContents[folderId].notes?.map((n) =>
              n.id === id ? { ...n, name: newName } : n
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateMusicPosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            music: data.folderContents[folderId].music?.map((m) =>
              m.id === id ? { ...m, position } : m
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateMusicName = (id: string, newName: string) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            music: data.folderContents[folderId].music?.map((m) =>
              m.id === id ? { ...m, name: newName } : m
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateCalendarPosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            calendar: data.folderContents[folderId].calendar?.map((c) =>
              c.id === id ? { ...c, position } : c
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateCalendarName = (id: string, newName: string) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            calendar: data.folderContents[folderId].calendar?.map((c) =>
              c.id === id ? { ...c, name: newName } : c
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateMoviePosition = (id: string, position: { x: number; y: number }) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            movies: data.folderContents[folderId].movies?.map((m) =>
              m.id === id ? { ...m, position } : m
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  const updateMovieName = (id: string, newName: string) => {
    if (onUpdateData && data.folderContents?.[folderId]) {
      const updatedData = {
        ...data,
        folderContents: {
          ...data.folderContents,
          [folderId]: {
            ...data.folderContents[folderId],
            movies: data.folderContents[folderId].movies?.map((m) =>
              m.id === id ? { ...m, name: newName } : m
            ),
          },
        },
      };
      onUpdateData(updatedData);
    }
  };

  return (
    <div className="folder-page-view">
      <WallpaperBackground src="/images/wallpaper2025.jpg" />
      <button className="folder-page-back-button" onClick={onBack}>
        ←
      </button>
      
      {/* Message Bubbles */}
      {showTripBubble && (
        <MessageBubble
          text="trip of the year"
          position={tripBubblePosition}
          color="gray"
          onPositionChange={updateTripBubblePosition}
        />
      )}
      {showNYCTag && (
        <MessageBubble
          text="NYC"
          position={nycBubblePosition}
          color="gray"
          onPositionChange={updateNYCBubblePosition}
        />
      )}

      {/* Folders and Notes */}
      <div className="folder-page-items">
        {folderContents.folders?.map((folder) => (
          <Folder
            key={folder.id}
            folder={folder}
            folderContents={data.folderContents?.[folder.id]}
            onPositionChange={(pos) => updateFolderPosition(folder.id, pos)}
            onNameChange={(newName) => updateFolderName(folder.id, newName)}
          />
        ))}
        {folderContents.notes?.map((note) => (
          <NotesIcon
            key={note.id}
            note={note}
            onPositionChange={(pos) => updateNotePosition(note.id, pos)}
            onNameChange={(newName) => updateNoteName(note.id, newName)}
          />
        ))}
        {folderContents.music?.map((music) => (
          <MusicIcon
            key={music.id}
            music={music}
            onPositionChange={(pos) => updateMusicPosition(music.id, pos)}
            onNameChange={(newName) => updateMusicName(music.id, newName)}
          />
        ))}
        {folderContents.calendar?.map((calendar) => (
          <CalendarIcon
            key={calendar.id}
            calendar={calendar}
            onPositionChange={(pos) => updateCalendarPosition(calendar.id, pos)}
            onNameChange={(newName) => updateCalendarName(calendar.id, newName)}
          />
        ))}
        {folderContents.movies?.map((movie) => (
          <MovieIcon
            key={movie.id}
            movie={movie}
            onPositionChange={(pos) => updateMoviePosition(movie.id, pos)}
            onNameChange={(newName) => updateMovieName(movie.id, newName)}
          />
        ))}
      </div>

      {/* AirDrop Notification */}
      {showAirDrop && (
        <AirDropNotification
          position={airdropPosition}
          imageSrc="/images/Hamburg :: Berlin/1new year.MOV"
          mediaFiles={[
            "/images/Hamburg :: Berlin/1new year.MOV",
            "/images/Hamburg :: Berlin/2barcelona.jpg",
            "/images/Hamburg :: Berlin/3hamburg.JPEG",
            "/images/Hamburg :: Berlin/4mini.jpg",
            "/images/Hamburg :: Berlin/5kokki.JPEG",
            "/images/Hamburg :: Berlin/6cat.jpg",
            "/images/Hamburg :: Berlin/7game.JPEG",
            "/images/Hamburg :: Berlin/8snow.jpg",
            "/images/Hamburg :: Berlin/9airdrop.jpg",
            "/images/Hamburg :: Berlin/10.jpg",
            "/images/Hamburg :: Berlin/11berlin theater.MOV",
            "/images/Hamburg :: Berlin/12platz.jpg",
            "/images/Hamburg :: Berlin/13.jpg",
            "/images/Hamburg :: Berlin/14.MOV"
          ]}
          onAccept={handleAirDropAccept}
          onDecline={handleAirDropDecline}
          onPositionChange={updateAirDropPosition}
        />
      )}

      {/* Do Not Disturb Toggle - positioned to the right of AirDrop at the top */}
      {showDoNotDisturb && (
        <DoNotDisturbToggle position={dndPosition} />
      )}

      {/* Photo Booth Window - positioned below brooklyn folder */}
      {showPhotoBooth && (
        <PhotoBoothWindow
          position={photoBoothPosition}
          photoSrc="/images/photobooth.JPG"
          onClose={handlePhotoBoothClose}
          isClosing={isPhotoBoothClosing}
          onPositionChange={updatePhotoBoothPosition}
        />
      )}

      {/* Notification Toast */}
      {showNotification && (
        <NotificationToast
          message="Photo received from Hellie :3"
          onComplete={handleNotificationComplete}
        />
      )}

      {/* Other Windows */}
      <div className="folder-page-windows">
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </div>
      <QuickLook />
      <RemindersPopup 
        isOpen={showReminders}
        onClose={closeReminders}
        reminders={reminders}
      />
    </div>
  );
};

