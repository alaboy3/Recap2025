import React from 'react';
import { HEICImage } from './HEICImage';
import './MovieWindow.css';

interface Movie {
  title: string;
  poster: string;
}

const movies: Movie[] = [
  { title: "I'm Still Here", poster: '/images/movies/im still here.webp' },
  { title: 'Sound of Falling', poster: '/images/movies/sound of falling.jpg' },
  { title: 'Jay Kelly', poster: '/images/movies/jay kelly.jpg' },
  { title: 'Hamnet', poster: '/images/movies/hamnet.jpg' },
  { title: 'Bugonia', poster: '/images/movies/bugonia.jpg' },
];

const tvShows: Movie[] = [
  { title: 'The Pitt', poster: '/images/movies/the pitt.jpg' },
  { title: 'Hunting Wives', poster: '/images/movies/hunting wives.jpg' },
  { title: 'Arcane', poster: '/images/movies/arcane.jpg' },
  { title: 'Too Much', poster: '/images/movies/too much.jpg' },
  { title: 'SNL', poster: '/images/movies/snl.jpg' },
  { title: 'Succession', poster: '/images/movies/sucession.jpeg' },
];

export const MovieWindow: React.FC = () => {
  return (
    <div className="movie-window">
      <div className="movie-section">
        <h2 className="movie-section-title">Favorite Movies Seen in 2025</h2>
        <div className="movie-posters-grid">
          {movies.map((movie, index) => (
            <div key={index} className="movie-poster-container">
              <div className="movie-poster-ribbon">#{index + 1}</div>
              <HEICImage 
                src={movie.poster} 
                alt={movie.title}
                className="movie-poster"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="movie-section">
        <h2 className="movie-section-title">Favorite TV Shows Seen or Rewatched in 2025</h2>
        <div className="movie-posters-grid movie-posters-grid-nowrap">
          {tvShows.map((show, index) => (
            <div key={index} className="movie-poster-container">
              <div className="movie-poster-ribbon">#{index + 1}</div>
              <HEICImage 
                src={show.poster} 
                alt={show.title}
                className="movie-poster"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

