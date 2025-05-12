import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import MovieSearch from './MovieSearch';
import MovieDetails from './MovieDetails';
import { useError } from '../contexts/ErrorContext';
import '../styles/userwatchlist.css';

const UserWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const { showError } = useError();

  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await api.get('/users/watchlist');
      setWatchlist(response.data);
    } catch (error) {
      showError('Failed to fetch watchlist');
    }
  }, [showError]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleMovieSelect = async (movie) => {
    try {
      await api.post('/users/watchlist', {
        movie: {
          id: movie.id,
          title: movie.title,
          thumbnail: movie.thumbnail,
          year: movie.year
        }
      });
      await fetchWatchlist();
      setShowMovieSearch(false);
    } catch (error) {
      showError('Failed to add movie to watchlist');
    }
  };

  const handleRemoveMovie = async (movieId) => {
    try {
      await api.delete(`/users/watchlist/${movieId}`);
      await fetchWatchlist();
    } catch (error) {
      showError('Failed to remove movie from watchlist');
    }
  };

  const handleMovieClick = async (movie) => {
    try {
      const response = await api.get(`/movies/${movie.id}`);
      setSelectedMovie(response.data);
    } catch (error) {
      showError('Failed to fetch movie details');
    }
  };

  return (
    <div className="user-watchlist">
      <div className="watchlist-header">
        <h2>My Watchlist</h2>
        <button
          onClick={() => setShowMovieSearch(!showMovieSearch)}
          className="toggle-search-btn"
        >
          {showMovieSearch ? 'Hide Search' : 'Add Movie'}
        </button>
      </div>

      {showMovieSearch && (
        <div className="movie-search-container">
          <MovieSearch onMovieSelect={handleMovieSelect} />
        </div>
      )}

      <div className="watchlist-grid">
        {watchlist.length === 0 ? (
          <p className="empty-message">Your watchlist is empty</p>
        ) : (
          watchlist.map((item) => (
            <div
              key={item.movie.id}
              className="watchlist-item"
              onClick={() => handleMovieClick(item.movie)}
              style={{ cursor: 'pointer' }}
            >
              {item.movie.thumbnail && item.movie.thumbnail !== 'N/A' ? (
                <img
                  src={item.movie.thumbnail}
                  alt={item.movie.title}
                  className="watchlist-thumbnail"
                  loading="lazy"
                />
              ) : (
                <div className="no-poster">
                  <span>{item.movie.title[0]}</span>
                </div>
              )}
              <div className="watchlist-info">
                <h4>{item.movie.title} ({item.movie.year})</h4>
                <p className="added-date">
                  Added: {new Date(item.addedAt).toLocaleDateString()}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMovie(item.movie.id);
                  }}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onSelect={() => setSelectedMovie(null)}
          buttonText="Close"
        />
      )}
    </div>
  );
};

export default UserWatchlist;