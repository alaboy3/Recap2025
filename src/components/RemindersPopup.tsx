import React from 'react';
import './RemindersPopup.css';

interface RemindersPopupProps {
  isOpen: boolean;
  onClose: () => void;
  reminders: string[];
}

export const RemindersPopup: React.FC<RemindersPopupProps> = ({ isOpen, onClose, reminders }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="reminders-overlay" onClick={onClose} />
      <div className="reminders-popup">
        <div className="reminders-header">
          <h2 className="reminders-title">2026</h2>
          <button className="reminders-close" onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className="reminders-content">
          <ul className="reminders-list">
            {reminders.map((reminder, index) => (
              <li key={index} className="reminders-item">
                {reminder}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

