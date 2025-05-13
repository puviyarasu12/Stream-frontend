import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import RandomMovie from './RandomMovie';
import MovieDetails from './MovieDetails';
import '../styles/moviesearch.css';

const MovieSearch = ({ onMovieSelect, buttonText = "Add to Watchlist" }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    // Fetch all movies on initial load or when searchQuery is empty
    const fetchAllMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get('/movies');
        const results = Array.isArray(response.data) ? response.data : [];
        setSearchResults(results);
        if (results.length === 0) {
          setError('No movies available');
        }
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (searchQuery.trim() === '') {
      fetchAllMovies();
    }
  }, [searchQuery]);

  const getRatingClass = (rated) => {
    switch (rated) {
      case 'G':
        return 'rating-g';
      case 'PG':
        return 'rating-pg';
      case 'PG-13':
        return 'rating-pg13';
      default:
        return 'rating-general';
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim() === '') {
      // If search query is empty, fetch all movies
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/movies');
        const results = Array.isArray(response.data) ? response.data : [];
        setSearchResults(results);
        if (results.length === 0) {
          setError('No movies available');
        }
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch movies');
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/movies/search?query=${encodeURIComponent(searchQuery)}`);
      // Ensure response.data is an array
      const results = Array.isArray(response.data) ? response.data : [];
      setSearchResults(results);
      if (results.length === 0) {
        setError('No movies found matching your search');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to search movies');
      console.error('Error searching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    try {
      const response = await api.get(`/movies/${movie.id || movie.imdbID}`);
      setSelectedMovie(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching movie details:', error);
      setError('Failed to get movie details. Please try again.');
    }
  };

  const handleImageError = (movieId) => {
    setImageErrors((prev) => ({ ...prev, [movieId]: true }));
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleSelectMovie = (movie) => {
    onMovieSelect(movie);
    setSelectedMovie(null);
  };

  return (
    <div className="movie-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a movie..."
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <RandomMovie onMovieClick={handleMovieClick} />

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {searchResults.map((movie) => (
          <div
            key={movie.id}
            className="movie-item"
            onClick={() => handleMovieClick(movie)}
            role="button"
            tabIndex={0}
          >
            {movie.thumbnail && movie.thumbnail !== 'N/A' && !imageErrors[movie.id] ? (
              <img
                src={movie.thumbnail}
                alt={movie.title}
                onError={() => handleImageError(movie.id)}
                loading="lazy"
              />
            ) : (
              <div className="no-poster">
                <span>{movie.title[0]}</span>
              </div>
            )}
            <div className="movie-info">
              <h3>{movie.title}</h3>
              <p>Year: {movie.year}</p>
              {movie.rated && (
                <p className={`rating-badge ${getRatingClass(movie.rated)}`}>
                  {movie.rated}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={handleCloseModal}
          onSelect={handleSelectMovie}
          buttonText={buttonText}
        />
      )}
    </div>
  );
};

export default MovieSearch;
