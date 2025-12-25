import React, { useState, useRef, useEffect } from 'react';
import './MusicWindow.css';

interface Album {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  previewUrl?: string;
  trackName?: string;
}

export const MusicWindow: React.FC = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to encode audio file paths
  const getAudioPath = (filename: string) => {
    // Use encodeURIComponent to handle special characters like Í
    const encoded = encodeURIComponent(filename);
    return `/audio/${encoded}`;
  };

  const albums: Album[] = [
    {
      id: '1',
      title: 'Lux',
      artist: 'Rosalía',
      coverUrl: '/images/Album/lux.jpg',
      previewUrl: getAudioPath('ROSALÍA - La Yugular.mp3'), // Note: Uses combining character for Í
      trackName: 'La Yugular',
    },
    {
      id: '2',
      title: 'Astropical',
      artist: 'Astropical',
      coverUrl: '/images/Album/astropical .jpg',
      previewUrl: getAudioPath('ASTROPICAL - Siento (Virgo).mp3'),
      trackName: 'Siento (Virgo)',
    },
    {
      id: '3',
      title: 'Debi Tirar Mas Fotos',
      artist: 'Bad Bunny',
      coverUrl: '/images/Album/debi tirar mas fotos.jpeg',
      previewUrl: getAudioPath('BAD BUNNY - EoO.mp3'),
      trackName: 'EoO',
    },
    {
      id: '4',
      title: 'Cosa Nuestra: Capitulo 0',
      artist: 'Rauw Alejandro',
      coverUrl: '/images/Album/Cosa Nuestra by Rauw.jpeg',
      previewUrl: getAudioPath('Rauw Alejandro - El Cuc0.0.mp3'),
      trackName: 'El Cuc0.0',
    },
    {
      id: '5',
      title: 'Deadbeat',
      artist: 'Tame Impala',
      coverUrl: '/images/Album/deadbeat by tame impala.jpeg',
      previewUrl: getAudioPath('Tame Impala - My Old Ways.mp3'),
      trackName: 'My Old Ways',
    },
  ];

  useEffect(() => {
    if (selectedAlbum && isPlaying && audioRef.current) {
      // CD starts rotating when album is selected and playing
      // Play audio preview if available
      if (selectedAlbum.previewUrl) {
        // Load and play the selected album's audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = selectedAlbum.previewUrl;
        audioRef.current.volume = 0.5;
        // Add event listeners for debugging
        const handleCanPlay = () => {
          console.log('Audio can play:', selectedAlbum.title, selectedAlbum.previewUrl);
        };
        const handleLoadedData = () => {
          console.log('Audio data loaded:', selectedAlbum.title);
        };
        const handleError = (e: Event) => {
          const target = e.target as HTMLAudioElement;
          console.error('Audio error for', selectedAlbum.title, ':', {
            error: target.error,
            code: target.error?.code,
            message: target.error?.message,
            src: target.src,
            networkState: target.networkState,
            readyState: target.readyState
          });
        };
        
        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.addEventListener('loadeddata', handleLoadedData);
        audioRef.current.addEventListener('error', handleError);
        
        audioRef.current.load(); // Reload the audio element
        
        audioRef.current.play().catch((err) => {
          console.error('Could not play audio preview for', selectedAlbum.title, ':', err, selectedAlbum.previewUrl);
        });
        
        return () => {
          if (audioRef.current) {
            audioRef.current.removeEventListener('canplay', handleCanPlay);
            audioRef.current.removeEventListener('loadeddata', handleLoadedData);
            audioRef.current.removeEventListener('error', handleError);
          }
        };
      }
    } else if (audioRef.current) {
      // Pause audio when not playing
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedAlbum, isPlaying]);

  const handleAlbumClick = (album: Album) => {
    if (selectedAlbum?.id === album.id) {
      // Toggle play/pause if same album
      setIsPlaying(!isPlaying);
    } else {
      // Stop current audio before switching
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setSelectedAlbum(album);
      setIsPlaying(true);
    }
  };

  return (
    <div className="music-window-content">
      <div className="music-header">
        <h1 className="music-title">Best Albums of 2025</h1>
      </div>
      
      <div className="music-main-container">
        {/* Left side - Rotating CD */}
        <div className="music-cd-section">
          <div className={`cd-container ${selectedAlbum && isPlaying ? 'cd-rotating' : ''}`}>
            <div className="cd-disc">
              {selectedAlbum ? (
                <img 
                  src={selectedAlbum.coverUrl} 
                  alt={selectedAlbum.title}
                  className="cd-cover"
                  loading="lazy"
                />
              ) : (
                <div className="cd-placeholder">
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
                    <circle cx="60" cy="60" r="50" fill="#333"/>
                    <circle cx="60" cy="60" r="20" fill="#1a1a1a"/>
                  </svg>
                </div>
              )}
            </div>
          </div>
          {selectedAlbum && (
            <div className="cd-info">
              <div className="cd-album-title">{selectedAlbum.title}</div>
              <div className="cd-artist-name">{selectedAlbum.artist}</div>
              {selectedAlbum.trackName && (
                <div className="cd-track-name">{selectedAlbum.trackName}</div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Album list */}
        <div className="music-albums-section">
          <div className="albums-list">
            {albums.map((album) => (
              <div
                key={album.id}
                className={`album-item ${selectedAlbum?.id === album.id ? 'album-selected' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAlbumClick(album);
                }}
              >
                <div className="album-cover-small">
                  <img 
                    src={album.coverUrl} 
                    alt={album.title}
                    loading="lazy"
                  />
                </div>
                <div className="album-details">
                  <div className="album-number">{album.id}.</div>
                  <div className="album-info">
                    <div className="album-title">{album.title}</div>
                    <div className="album-artist">by {album.artist}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        onError={(e) => {
          console.error('Audio playback error:', e);
          const target = e.target as HTMLAudioElement;
          console.error('Failed to load:', target.src);
        }}
      />
    </div>
  );
};

