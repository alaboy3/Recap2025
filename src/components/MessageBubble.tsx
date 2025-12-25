import React from 'react';
import { useDrag } from '../hooks/useDrag';
import './MessageBubble.css';

interface MessageBubbleProps {
  text: string;
  position: { x: number; y: number };
  color?: 'blue' | 'gray';
  onPositionChange?: (position: { x: number; y: number }) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  text, 
  position, 
  color = 'blue',
  onPositionChange 
}) => {
  const { position: dragPosition, handleMouseDown } = useDrag(position, (newPos) => {
    if (onPositionChange) {
      onPositionChange(newPos);
    }
  });

  return (
    <div
      className={`message-bubble message-bubble-${color}`}
      style={{
        left: `${dragPosition.x}px`,
        top: `${dragPosition.y}px`,
        cursor: 'move',
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="message-bubble-content">{text}</div>
      <div className="message-bubble-tail" />
    </div>
  );
};

