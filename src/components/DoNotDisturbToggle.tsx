import React from 'react';
import './DoNotDisturbToggle.css';

interface DoNotDisturbToggleProps {
  position: { x: number; y: number };
}

export const DoNotDisturbToggle: React.FC<DoNotDisturbToggleProps> = ({ position }) => {
  return (
    <div
      className="dnd-toggle"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="dnd-icon">
        <defs>
          <mask id="crescent-mask">
            <circle cx="9" cy="9" r="8" fill="white" />
            <circle cx="6" cy="9" r="6" fill="black" />
          </mask>
        </defs>
        <circle cx="9" cy="9" r="8" fill="#A855F7" mask="url(#crescent-mask)" />
      </svg>
      <span className="dnd-text">Do Not Disturb</span>
    </div>
  );
};

