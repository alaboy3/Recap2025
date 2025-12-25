import React from 'react';
import { useApp } from '../context/AppContext';
import { HEICImage } from './HEICImage';
import './NotesWindow.css';

export const NotesWindow: React.FC = () => {
  const { openQuickLook } = useApp();
  
  const restaurants = [
    { name: 'Dirty Candy', images: ['/images/Restaurants/dirt candy.JPG', '/images/Restaurants/dirt candy 2.JPG'] },
    { name: 'GEMELLO', images: ['/images/Restaurants/gemello.JPEG', '/images/Restaurants/gemello 2.png'] },
    { name: 'Reverie', images: ['/images/Restaurants/reverie.jpg', '/images/Restaurants/reverie 2.jpg'] },
    { name: 'Kora', images: ['/images/Restaurants/kora.png', '/images/Restaurants/kora 2.JPG'] },
  ];

  const handleImageDoubleClick = (imageSrc: string) => {
    openQuickLook(imageSrc, 'image');
  };

  return (
    <div className="notes-window-content">
      {/* Top Bar */}
      <div className="notes-top-bar">
        <div className="notes-top-left">
          <div className="notes-folder-icon">📁</div>
          <span className="notes-location">All iCloud</span>
          <span className="notes-count">1 note</span>
        </div>
        <div className="notes-top-center">
          <div className="notes-date">December 24, 2025 at 12:31 PM</div>
        </div>
        <div className="notes-top-right">
          <div className="notes-search">🔍 Search</div>
        </div>
      </div>

      <div className="notes-main-container">
        {/* Left Sidebar */}
        <div className="notes-sidebar">
          <div className="notes-sidebar-header">
            <div className="notes-sidebar-title">Notes</div>
          </div>
          <div className="notes-list">
            <div className="notes-list-item notes-list-item-selected">
              <div className="notes-list-item-title">Best Restaurants</div>
              <div className="notes-list-item-date">Today</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="notes-content-area">
          <div className="notes-content-header">
            <div className="notes-content-title">Best Restaurants</div>
          </div>
          <div className="notes-content-body">
            <div className="notes-restaurants-grid">
              {/* Top Left: Dirty Candy */}
              <div className="notes-restaurant-item">
                <div className="notes-restaurant-name">Dirty Candy</div>
                <div className="notes-restaurant-images">
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[0].images[0])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[0].images[0]} alt="Dirty Candy 1" />
                  </div>
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[0].images[1])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[0].images[1]} alt="Dirty Candy 2" />
                  </div>
                </div>
              </div>

              {/* Top Right: GEMELLO */}
              <div className="notes-restaurant-item">
                <div className="notes-restaurant-name">GEMELLO</div>
                <div className="notes-restaurant-images">
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[1].images[0])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[1].images[0]} alt="GEMELLO 1" />
                  </div>
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[1].images[1])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[1].images[1]} alt="GEMELLO 2" />
                  </div>
                </div>
              </div>

              {/* Bottom Left: Reverie */}
              <div className="notes-restaurant-item">
                <div className="notes-restaurant-name">Reverie</div>
                <div className="notes-restaurant-images">
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[2].images[0])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[2].images[0]} alt="Reverie 1" />
                  </div>
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[2].images[1])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[2].images[1]} alt="Reverie 2" />
                  </div>
                </div>
              </div>

              {/* Bottom Right: Kora */}
              <div className="notes-restaurant-item">
                <div className="notes-restaurant-name">Kora</div>
                <div className="notes-restaurant-images">
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[3].images[0])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[3].images[0]} alt="Kora 1" />
                  </div>
                  <div 
                    className="notes-restaurant-image"
                    onDoubleClick={() => handleImageDoubleClick(restaurants[3].images[1])}
                    style={{ cursor: 'pointer' }}
                  >
                    <HEICImage src={restaurants[3].images[1]} alt="Kora 2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

