import React, { useEffect } from 'react';
import './NotificationToast.css';

interface NotificationToastProps {
  message: string;
  onComplete: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="notification-toast">
      <div className="notification-content">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="notification-icon">
          <path d="M10 2L2 7L10 12L18 7L10 2Z" fill="currentColor" />
          <path d="M2 9L10 14L18 9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M2 13L10 18L18 13" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="notification-message">{message}</span>
      </div>
    </div>
  );
};

