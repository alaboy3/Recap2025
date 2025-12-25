import React, { useState, useRef, useEffect } from 'react';
import { useDrag } from '../hooks/useDrag';
import { useApp } from '../context/AppContext';
import { Window as WindowType } from '../types';
import { WindowContent } from './WindowContent';
import './Window.css';

interface WindowProps {
  window: WindowType;
}

export const Window: React.FC<WindowProps> = ({ window: windowData }) => {
  const { closeWindow, bringToFront, updateWindowPosition, updateWindowSize } = useApp();
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0 });
  const resizeStartSize = useRef({ width: 0, height: 0 });
  const { position, handleMouseDown: handleTitleBarMouseDown } = useDrag(
    windowData.position,
    (newPos) => {
      updateWindowPosition(windowData.id, newPos);
      bringToFront(windowData.id);
    }
  );

  useEffect(() => {
    bringToFront(windowData.id);
  }, []);

  const handleTitleBarClick = () => {
    bringToFront(windowData.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = { x: e.clientX, y: e.clientY };
    resizeStartSize.current = window.size;
  };

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - resizeStartPos.current.x;
      const deltaY = e.clientY - resizeStartPos.current.y;
      
      // Constrain to viewport
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
      const minWidth = 300;
      const minHeight = 200;
      const maxWidth = viewportWidth - window.position.x;
      const maxHeight = viewportHeight - window.position.y;

      const newSize = {
        width: Math.max(minWidth, Math.min(maxWidth, resizeStartSize.current.width + deltaX)),
        height: Math.max(minHeight, Math.min(maxHeight, resizeStartSize.current.height + deltaY)),
      };

      updateWindowSize(window.id, newSize);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      }
    };
  }, [isResizing, window.id, updateWindowSize]);

  return (
    <div
      className="window"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${window.size.width}px`,
        height: `${window.size.height}px`,
        zIndex: window.zIndex,
      }}
      onClick={handleTitleBarClick}
    >
      <div
        className="window-title-bar"
        onMouseDown={handleTitleBarMouseDown}
      >
        <div className="window-controls">
          <button
            className="window-control window-control-close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(window.id);
            }}
          />
          <button className="window-control window-control-minimize" />
          <button className="window-control window-control-maximize" />
        </div>
        <div className="window-title">{window.title}</div>
      </div>
      <div className="window-content">
        <WindowContent
          type={window.type}
          items={window.items}
          imageSrc={window.imageSrc}
          imageStack={window.imageStack}
          backgroundImage={window.backgroundImage}
          windowId={window.id}
          folderContents={window.folderContents}
        />
      </div>
      <div
        className="window-resize-handle"
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
};

