import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Window, QuickLookState, Position } from '../types';

interface AppContextType {
  windows: Window[];
  openWindow: (window: Window) => void;
  closeWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: Position) => void;
  updateWindowSize: (id: string, size: { width: number; height: number }) => void;
  updateWindowTitle: (id: string, title: string) => void;
  bringToFront: (id: string) => void;
  quickLook: QuickLookState;
  openQuickLook: (src: string, type: 'image' | 'video') => void;
  closeQuickLook: () => void;
  currentPage: string | null;
  navigateToPage: (pageId: string | null) => void;
  showReminders: boolean;
  openReminders: () => void;
  closeReminders: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [quickLook, setQuickLook] = useState<QuickLookState>({
    isOpen: false,
    mediaSrc: null,
    mediaType: null,
  });
  const [currentPage, setCurrentPage] = useState<string | null>(null);
  const [showReminders, setShowReminders] = useState(false);

  const openWindow = useCallback((window: Window) => {
    setWindows((prev) => {
      const existingWindow = prev.find((w) => w.id === window.id);
      if (existingWindow) {
        // Window already exists, bring it to front
        const maxZ = Math.max(...prev.map((w) => w.zIndex));
        return prev.map((w) =>
          w.id === window.id ? { ...w, zIndex: maxZ + 1 } : w
        );
      } else {
        // New window
        const maxZ = prev.length > 0 ? Math.max(...prev.map((w) => w.zIndex)) : 0;
        return [...prev, { ...window, zIndex: maxZ + 1 }];
      }
    });
  }, []);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const updateWindowPosition = useCallback((id: string, position: Position) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) return prev;
      
      // Constrain position to viewport boundaries
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const minX = 0;
      const minY = 0;
      const maxX = Math.max(0, viewportWidth - win.size.width);
      const maxY = Math.max(0, viewportHeight - win.size.height);
      
      const constrainedPosition = {
        x: Math.max(minX, Math.min(maxX, position.x)),
        y: Math.max(minY, Math.min(maxY, position.y)),
      };
      
      return prev.map((w) => (w.id === id ? { ...w, position: constrainedPosition } : w));
    });
  }, []);

  const updateWindowSize = useCallback((id: string, size: { width: number; height: number }) => {
    setWindows((prev) => {
      const win = prev.find((w) => w.id === id);
      if (!win) return prev;
      
      // Constrain size to viewport boundaries
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const minWidth = 300;
      const minHeight = 200;
      const maxWidth = viewportWidth - win.position.x;
      const maxHeight = viewportHeight - win.position.y;
      
      const constrainedSize = {
        width: Math.max(minWidth, Math.min(maxWidth, size.width)),
        height: Math.max(minHeight, Math.min(maxHeight, size.height)),
      };
      
      // Also adjust position if window would overflow
      const constrainedPosition = {
        x: Math.min(win.position.x, viewportWidth - constrainedSize.width),
        y: Math.min(win.position.y, viewportHeight - constrainedSize.height),
      };
      
      return prev.map((w) => 
        w.id === id 
          ? { ...w, size: constrainedSize, position: constrainedPosition } 
          : w
      );
    });
  }, []);

  const updateWindowTitle = useCallback((id: string, title: string) => {
    setWindows((prev) => 
      prev.map((w) => (w.id === id ? { ...w, title } : w))
    );
  }, []);

  const bringToFront = useCallback((id: string) => {
    setWindows((prev) => {
      const maxZ = Math.max(...prev.map((w) => w.zIndex));
      return prev.map((w) =>
        w.id === id ? { ...w, zIndex: maxZ + 1 } : w
      );
    });
  }, []);

  const openQuickLook = useCallback((src: string, type: 'image' | 'video') => {
    setQuickLook({
      isOpen: true,
      mediaSrc: src,
      mediaType: type,
    });
  }, []);

  const closeQuickLook = useCallback(() => {
    setQuickLook({
      isOpen: false,
      mediaSrc: null,
      mediaType: null,
    });
  }, []);

  const navigateToPage = useCallback((pageId: string | null) => {
    setCurrentPage(pageId);
  }, []);

  const openReminders = useCallback(() => {
    setShowReminders(true);
  }, []);

  const closeReminders = useCallback(() => {
    setShowReminders(false);
  }, []);

  return (
    <AppContext.Provider
      value={{
        windows,
        openWindow,
        closeWindow,
        updateWindowPosition,
        updateWindowSize,
        updateWindowTitle,
        bringToFront,
        quickLook,
        openQuickLook,
        closeQuickLook,
        currentPage,
        navigateToPage,
        showReminders,
        openReminders,
        closeReminders,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

