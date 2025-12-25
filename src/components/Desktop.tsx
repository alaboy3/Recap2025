import React, { useState, useEffect } from 'react';
import { Folder } from './Folder';
import { ImageIcon } from './ImageIcon';
import { Window } from './Window';
import { QuickLook } from './QuickLook';
import { YearlyReportBubble } from './YearlyReportBubble';
import { FolderPageView } from './FolderPageView';
import { WallpaperBackground } from './WallpaperBackground';
import { useApp } from '../context/AppContext';
import { DesktopData } from '../types';
import desktopData from '../data/desktopData.json';
import './Desktop.css';

// Helper function to merge saved data with default data structure
const mergeDesktopData = (saved: any, defaults: DesktopData): DesktopData => {
  if (!saved || typeof saved !== 'object') {
    return defaults;
  }

  // Merge folders - ensure all default folders exist with their required properties
  const mergedFolders = defaults.folders.map((defaultFolder) => {
    const savedFolder = saved.folders?.find((f: any) => f?.id === defaultFolder.id);
    if (savedFolder && savedFolder.position && typeof savedFolder.position.x === 'number' && typeof savedFolder.position.y === 'number') {
      return {
        ...defaultFolder,
        position: savedFolder.position,
        name: savedFolder.name || defaultFolder.name,
        items: Array.isArray(savedFolder.items) ? savedFolder.items : defaultFolder.items,
      };
    }
    return defaultFolder;
  });

  // Merge images - ensure all default images exist with their required properties
  // Always use default src, name, and size from JSON (source of truth)
  // Only preserve position from saved data
  const mergedImages = defaults.images.map((defaultImage) => {
    const savedImage = saved.images?.find((img: any) => img?.id === defaultImage.id);
    if (savedImage && savedImage.position && typeof savedImage.position.x === 'number' && typeof savedImage.position.y === 'number') {
      return {
        ...defaultImage, // This includes src, name, size, imageStack from defaults
        position: savedImage.position, // Only preserve position from saved data
      };
    }
    return defaultImage;
  });

  // Merge folderContents - ensure structure exists and merge nested items
  const mergedFolderContents: DesktopData['folderContents'] = { ...defaults.folderContents };
  if (saved.folderContents && typeof saved.folderContents === 'object') {
    Object.keys(saved.folderContents).forEach((folderId) => {
      const savedContent = saved.folderContents[folderId];
      const defaultContent = defaults.folderContents?.[folderId];
      
      if (defaultContent) {
        mergedFolderContents[folderId] = {
          folders: defaultContent.folders?.map((defaultFolder) => {
            const savedFolder = savedContent.folders?.find((f: any) => f?.id === defaultFolder.id);
            if (savedFolder && savedFolder.position && typeof savedFolder.position.x === 'number' && typeof savedFolder.position.y === 'number') {
              return {
                ...defaultFolder,
                position: savedFolder.position,
                name: savedFolder.name || defaultFolder.name,
                items: Array.isArray(savedFolder.items) ? savedFolder.items : defaultFolder.items,
              };
            }
            return defaultFolder;
          }),
          images: defaultContent.images?.map((defaultImage) => {
            const savedImage = savedContent.images?.find((img: any) => img?.id === defaultImage.id);
            if (savedImage && savedImage.position && typeof savedImage.position.x === 'number' && typeof savedImage.position.y === 'number') {
              return {
                ...defaultImage,
                position: savedImage.position,
                name: savedImage.name || defaultImage.name,
                src: savedImage.src || defaultImage.src,
                size: savedImage.size || defaultImage.size,
              };
            }
            return defaultImage;
          }),
          notes: defaultContent.notes?.map((defaultNote) => {
            const savedNote = savedContent.notes?.find((n: any) => n?.id === defaultNote.id);
            if (savedNote && savedNote.position && typeof savedNote.position.x === 'number' && typeof savedNote.position.y === 'number') {
              return {
                ...defaultNote,
                position: savedNote.position,
                name: savedNote.name || defaultNote.name,
              };
            }
            return defaultNote;
          }),
          music: defaultContent.music?.map((defaultMusic) => {
            const savedMusic = savedContent.music?.find((m: any) => m?.id === defaultMusic.id);
            if (savedMusic && savedMusic.position && typeof savedMusic.position.x === 'number' && typeof savedMusic.position.y === 'number') {
              return {
                ...defaultMusic,
                position: savedMusic.position,
                name: savedMusic.name || defaultMusic.name,
              };
            }
            return defaultMusic;
          }),
          calendar: defaultContent.calendar?.map((defaultCalendar) => {
            const savedCalendar = savedContent.calendar?.find((c: any) => c?.id === defaultCalendar.id);
            if (savedCalendar && savedCalendar.position && typeof savedCalendar.position.x === 'number' && typeof savedCalendar.position.y === 'number') {
              return {
                ...defaultCalendar,
                position: savedCalendar.position,
                name: savedCalendar.name || defaultCalendar.name,
                backgroundImage: savedCalendar.backgroundImage || defaultCalendar.backgroundImage,
              };
            }
            return defaultCalendar;
          }),
          movies: defaultContent.movies?.map((defaultMovie) => {
            const savedMovie = savedContent.movies?.find((m: any) => m?.id === defaultMovie.id);
            if (savedMovie && savedMovie.position && typeof savedMovie.position.x === 'number' && typeof savedMovie.position.y === 'number') {
              return {
                ...defaultMovie,
                position: savedMovie.position,
                name: savedMovie.name || defaultMovie.name,
              };
            }
            return defaultMovie;
          }),
          items: Array.isArray(savedContent.items) ? savedContent.items : defaultContent.items,
          // Preserve PhotoBooth and AirDrop positions if they exist
          photoBoothPosition: savedContent.photoBoothPosition && 
            typeof savedContent.photoBoothPosition.x === 'number' && 
            typeof savedContent.photoBoothPosition.y === 'number'
            ? savedContent.photoBoothPosition
            : defaultContent.photoBoothPosition,
          airdropPosition: savedContent.airdropPosition && 
            typeof savedContent.airdropPosition.x === 'number' && 
            typeof savedContent.airdropPosition.y === 'number'
            ? savedContent.airdropPosition
            : defaultContent.airdropPosition,
          // Preserve bubble positions if they exist
          tripBubblePosition: savedContent.tripBubblePosition && 
            typeof savedContent.tripBubblePosition.x === 'number' && 
            typeof savedContent.tripBubblePosition.y === 'number'
            ? savedContent.tripBubblePosition
            : defaultContent.tripBubblePosition,
          nycBubblePosition: savedContent.nycBubblePosition && 
            typeof savedContent.nycBubblePosition.x === 'number' && 
            typeof savedContent.nycBubblePosition.y === 'number'
            ? savedContent.nycBubblePosition
            : defaultContent.nycBubblePosition,
        };
      }
    });
  }

  return {
    folders: mergedFolders,
    images: mergedImages,
    yearlyReportBubblePosition: saved.yearlyReportBubblePosition && 
      typeof saved.yearlyReportBubblePosition.x === 'number' && 
      typeof saved.yearlyReportBubblePosition.y === 'number'
      ? saved.yearlyReportBubblePosition
      : defaults.yearlyReportBubblePosition,
    folderContents: mergedFolderContents,
  };
};

export const Desktop: React.FC = () => {
  const { windows, currentPage, navigateToPage } = useApp();
  const [data, setData] = useState<DesktopData>(desktopData);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Expose function to export current positions (for setting as defaults)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).exportDesktopPositions = () => {
        const positions = {
          folders: data.folders.map(f => ({
            id: f.id,
            position: f.position
          })),
          images: data.images.map(img => ({
            id: img.id,
            position: img.position
          })),
          yearlyReportBubblePosition: data.yearlyReportBubblePosition,
          folderContents: {} as any
        };
        
        if (data.folderContents) {
          Object.keys(data.folderContents).forEach(folderId => {
            const content = data.folderContents![folderId];
            positions.folderContents[folderId] = {
              folders: content.folders?.map(f => ({ id: f.id, position: f.position })) || [],
              images: content.images?.map(img => ({ id: img.id, position: img.position })) || [],
              notes: content.notes?.map(n => ({ id: n.id, position: n.position })) || [],
              music: content.music?.map(m => ({ id: m.id, position: m.position })) || [],
              calendar: content.calendar?.map(c => ({ id: c.id, position: c.position })) || [],
              movies: content.movies?.map(m => ({ id: m.id, position: m.position })) || [],
              photoBoothPosition: content.photoBoothPosition,
              airdropPosition: content.airdropPosition,
              tripBubblePosition: content.tripBubblePosition,
              nycBubblePosition: content.nycBubblePosition
            };
          });
        }
        
        console.log('Current desktop positions:');
        console.log(JSON.stringify(positions, null, 2));
        return positions;
      };
    }
  }, [data]);

  // Load saved data on mount
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('desktopData');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          const merged = mergeDesktopData(parsed, desktopData);
          setData(merged);
          console.log('Loaded saved desktop data from localStorage');
        } catch (parseError) {
          console.error('Failed to parse saved desktop data, using defaults:', parseError);
          // Clear corrupted data
          localStorage.removeItem('desktopData');
          setData(desktopData);
        }
      } else {
        console.log('No saved desktop data found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load saved desktop data, using defaults:', error);
      setData(desktopData);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save data to localStorage whenever it changes (but not on initial load)
  useEffect(() => {
    if (!isLoaded) return; // Don't save on initial load
    
    try {
      localStorage.setItem('desktopData', JSON.stringify(data));
      console.log('Saved desktop data to localStorage');
    } catch (error) {
      console.error('Failed to save desktop data to localStorage:', error);
      // Handle quota exceeded error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded, clearing old data');
        try {
          localStorage.clear();
          localStorage.setItem('desktopData', JSON.stringify(data));
        } catch (retryError) {
          console.error('Failed to save after clearing localStorage:', retryError);
        }
      }
    }
  }, [data, isLoaded]);

  // Validate and correct initial positions on mount and window resize
  useEffect(() => {
    if (!isLoaded) return; // Wait for data to load first
    
    const validatePositions = () => {
      setData((prev) => {
        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
        const margin = 10;

        // Helper to get image dimensions
        const getImageDimensions = (size: string = 'medium') => {
          const sizes: { [key: string]: { width: number; height: number } } = {
            small: { width: 106, height: 132 },
            medium: { width: 156, height: 182 },
            large: { width: 196, height: 222 },
            xlarge: { width: 256, height: 282 },
          };
          return sizes[size] || sizes.medium;
        };

        // Validate and correct image positions
        const correctedImages = prev.images.map((img) => {
          const imgSize = getImageDimensions(img.size);
          const maxX = Math.max(0, viewportWidth - imgSize.width - margin);
          const maxY = Math.max(0, viewportHeight - imgSize.height - margin);
          const constrainedX = Math.max(margin, Math.min(maxX, img.position.x));
          const constrainedY = Math.max(margin, Math.min(maxY, img.position.y));

          // Check if position changed
          if (constrainedX !== img.position.x || constrainedY !== img.position.y) {
            return { ...img, position: { x: constrainedX, y: constrainedY } };
          }
          return img;
        });

        // Validate and correct folder positions
        const folderWidth = 100;
        const folderHeight = 100;
        const correctedFolders = prev.folders.map((folder) => {
          // For all folders including year_2025, validate both X and Y
          const maxX = Math.max(0, viewportWidth - folderWidth - margin);
          const maxY = Math.max(0, viewportHeight - folderHeight - margin);
          const constrainedX = Math.max(margin, Math.min(maxX, folder.position.x));
          const constrainedY = Math.max(margin, Math.min(maxY, folder.position.y));

          if (constrainedX !== folder.position.x || constrainedY !== folder.position.y) {
            return { ...folder, position: { x: constrainedX, y: constrainedY } };
          }
          return folder;
        });

        // Only update if positions changed
        const imagesChanged = correctedImages.some((img, idx) => 
          img.position.x !== prev.images[idx].position.x || 
          img.position.y !== prev.images[idx].position.y
        );
        const foldersChanged = correctedFolders.some((folder, idx) => 
          folder.position.x !== prev.folders[idx].position.x || 
          folder.position.y !== prev.folders[idx].position.y
        );

        if (imagesChanged || foldersChanged) {
          return {
            ...prev,
            images: correctedImages,
            folders: correctedFolders,
          };
        }

        return prev;
      });
    };

    // Validate on mount
    validatePositions();

    // Validate on window resize
    const handleResize = () => {
      validatePositions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoaded]); // Run when data is loaded

  const updateFolderPosition = (id: string, position: { x: number; y: number }) => {
    setData((prev) => {
      const folder = prev.folders.find((f) => f.id === id);
      if (!folder) return prev;
      
      // Folder dimensions: 64px icon + 8px padding each side = 80px width, ~100px height with label
      const folderWidth = 100;
      const folderHeight = 100;
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      
      // Constrain to viewport boundaries with safety margin
      const margin = 10;
      const maxX = Math.max(0, viewportWidth - folderWidth - margin);
      const maxY = Math.max(0, viewportHeight - folderHeight - margin);
      const constrainedX = Math.max(margin, Math.min(maxX, position.x));
      const constrainedY = Math.max(margin, Math.min(maxY, position.y));
      
      return {
        ...prev,
        folders: prev.folders.map((f) => (f.id === id ? { ...f, position: { x: constrainedX, y: constrainedY } } : f)),
      };
    });
  };

  const updateImagePosition = (id: string, position: { x: number; y: number }) => {
    setData((prev) => {
      const currentImage = prev.images.find((img) => img.id === id);
      if (!currentImage) return prev;
      
      // Get image dimensions based on size
      const getImageDimensions = (size: string = 'medium') => {
        const sizes: { [key: string]: { width: number; height: number } } = {
          small: { width: 106, height: 132 },
          medium: { width: 156, height: 182 },
          large: { width: 196, height: 222 },
          xlarge: { width: 256, height: 282 },
        };
        return sizes[size] || sizes.medium;
      };
      
      const imageSize = getImageDimensions(currentImage.size);
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      
      // Constrain to viewport boundaries with safety margin
      // Use more conservative margins for smaller screens
      const margin = viewportWidth < 1400 ? 15 : 10;
      const maxX = Math.max(0, viewportWidth - imageSize.width - margin);
      const maxY = Math.max(0, viewportHeight - imageSize.height - margin);
      const constrainedX = Math.max(margin, Math.min(maxX, position.x));
      const constrainedY = Math.max(margin, Math.min(maxY, position.y));
      
      return {
        ...prev,
        images: prev.images.map((img) => 
          img.id === id 
            ? { ...img, position: { x: constrainedX, y: constrainedY } } 
            : img
        ),
      };
    });
  };

  const updateFolderName = (id: string, newName: string) => {
    setData((prev) => ({
      ...prev,
      folders: prev.folders.map((f) => (f.id === id ? { ...f, name: newName } : f)),
    }));
  };

  const updateImageName = (id: string, newName: string) => {
    setData((prev) => ({
      ...prev,
      images: prev.images.map((img) => (img.id === id ? { ...img, name: newName } : img)),
    }));
  };

  // If we're on a folder page, show the page view
  if (currentPage === 'year_2025' && data.folderContents?.year_2025) {
    return (
      <div className="desktop-container">
        <FolderPageView
          folderId="year_2025"
          folderContents={data.folderContents.year_2025}
          data={data}
          onBack={() => navigateToPage(null)}
          onUpdateData={setData}
        />
      </div>
    );
  }

  return (
    <div className="desktop">
      <WallpaperBackground src="/images/wallpaperMain.jpg" className="desktop-wallpaper" />
      <YearlyReportBubble 
        folderPosition={data.folders.find(f => f.id === 'year_2025')?.position}
        position={data.yearlyReportBubblePosition}
        onPositionChange={(position) => {
          setData((prev) => ({
            ...prev,
            yearlyReportBubblePosition: position,
          }));
        }}
      />
      <div className="desktop-items">
        {data.folders.map((folder) => (
          <Folder
            key={folder.id}
            folder={folder}
            folderContents={data.folderContents?.[folder.id]}
            onPositionChange={(pos) => updateFolderPosition(folder.id, pos)}
            onNameChange={(newName) => updateFolderName(folder.id, newName)}
          />
        ))}
        {data.images.map((image) => (
          <ImageIcon
            key={image.id}
            image={image}
            onPositionChange={(pos) => updateImagePosition(image.id, pos)}
            onNameChange={(newName) => updateImageName(image.id, newName)}
          />
        ))}
      </div>
      <div className="desktop-windows">
        {windows.map((window) => (
          <Window key={window.id} window={window} />
        ))}
      </div>
      <QuickLook />
    </div>
  );
};

