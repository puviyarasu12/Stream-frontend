import React, { useState, useEffect, useRef } from 'react';

const MovieDetails = ({ movie, onClose, onSelect, buttonText = 'Select Movie' }) => {
  const [imageError, setImageError] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (modalRef.current) {
      modalRef.current.focus();
    }

    const handleTab = (e) => {
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, []);

  if (!movie) return null;

  const handleImageError = () => {
    setImageError(true);
  };

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

  const styles = {
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    },
    modalContent: {
      background: '#fff',
      color: '#333',
      padding: '20px',
      borderRadius: '8px',
      width: '90%',
      maxWidth: '600px',
      outline: 'none',
      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.3)'
    },
    modalCloseBtn: {
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      float: 'right',
      cursor: 'pointer'
    },
    modalHeader: {
      marginTop: 0
    },
    ratingBadge: {
      marginLeft: '10px',
      padding: '2px 8px',
      borderRadius: '4px',
      fontSize: '0.8em'
    },
    ratingG: { background: '#4CAF50', color: 'white' },
    ratingPg: { background: '#FF9800', color: 'white' },
    ratingPg13: { background: '#f44336', color: 'white' },
    ratingGeneral: { background: '#607D8B', color: 'white' },
    modalBody: {
      display: 'flex',
      marginTop: '15px'
    },
    moviePosterImg: {
      width: '150px',
      height: '220px',
      objectFit: 'cover',
      borderRadius: '4px'
    },
    noPoster: {
      width: '150px',
      height: '220px',
      background: '#ccc',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '48px',
      fontWeight: 'bold',
      borderRadius: '4px'
    },
    movieInfoDetails: {
      marginLeft: '20px',
      flex: 1
    },
    movieInfoText: {
      margin: '5px 0'
    },
    modalFooter: {
      textAlign: 'right',
      marginTop: '20px'
    },
    selectMovieBtn: {
      padding: '10px 20px',
      backgroundColor: '#2196F3',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer'
    },
    selectMovieBtnHover: {
      backgroundColor: '#1976D2'
    }
  };

  return (
    <div
      style={styles.modalOverlay}
      role="dialog"
      aria-labelledby="movie-details-title"
      aria-modal="true"
      ref={modalRef}
      tabIndex="-1"
    >
      <div style={styles.modalContent}>
        <button
          style={styles.modalCloseBtn}
          onClick={onClose}
          aria-label="Close movie details"
        >
          ×
        </button>
        <div style={styles.modalHeader}>
          <h2 id="movie-details-title">
            {movie.title} ({movie.year})
            {movie.rated && (
              <span 
                style={{
                  ...styles.ratingBadge,
                  ...styles[getRatingClass(movie.rated)]
                }}
              >
                {movie.rated}
              </span>
            )}
          </h2>
        </div>
        <div style={styles.modalBody}>
          <div>
            {movie.thumbnail && movie.thumbnail !== 'N/A' && !imageError ? (
              <img
                src={movie.thumbnail}
                alt={`${movie.title} poster`}
                onError={handleImageError}
                style={styles.moviePosterImg}
              />
            ) : (
              <div style={styles.noPoster}>
                <span>{movie.title[0]}</span>
              </div>
            )}
          </div>
          <div style={styles.movieInfoDetails}>
            <p style={styles.movieInfoText}><strong>Director:</strong> {movie.director || 'Not available'}</p>
            <p style={styles.movieInfoText}><strong>Cast:</strong> {movie.actors || 'Not available'}</p>
            <p style={styles.movieInfoText}><strong>Genre:</strong> {movie.genre || 'Not available'}</p>
            <p style={styles.movieInfoText}><strong>Runtime:</strong> {movie.runtime || 'Not available'}</p>
            <p style={styles.movieInfoText}><strong>Rating:</strong> {movie.rating ? `${movie.rating}/10` : 'Not rated'}</p>
            <p style={styles.movieInfoText}><strong>Plot:</strong> {movie.plot || 'No plot available'}</p>
          </div>
        </div>
        <div style={styles.modalFooter}>
          <button 
            style={styles.selectMovieBtn}
            onMouseOver={(e) => e.target.style.backgroundColor = styles.selectMovieBtnHover.backgroundColor}
            onMouseOut={(e) => e.target.style.backgroundColor = styles.selectMovieBtn.backgroundColor}
            onClick={() => onSelect(movie)}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;