import React, { useReducer, useRef } from 'react';
import PropTypes from 'prop-types';
import api from '../utils/api';

// Reducer for managing component state
const initialState = {
  isLoading: false,
  error: null,
  success: null,
  retryCount: 0,
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, isLoading: true, error: null, success: null };
    case 'FETCH_SUCCESS':
      return { ...state, isLoading: false, success: action.payload, error: null };
    case 'FETCH_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
        retryCount: state.retryCount + 1,
      };
    case 'RESET':
      return { ...state, error: null, success: null, retryCount: 0 };
    default:
      return state;
  }
};

const RandomMovie = ({ onMovieClick }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isLoading, error, success, retryCount } = state;
  const maxRetries = 3;
  const buttonRef = useRef(null);

  // Fetch random movie with retry logic
  const getRandomMovie = async () => {
    dispatch({ type: 'FETCH_START' });

    try {
      const response = await api.get('/movies/random/movie');
      if (response.data) {
        dispatch({ type: 'FETCH_SUCCESS', payload: 'Movie fetched successfully!' });
        onMovieClick(response.data);
        // Reset success message after 3 seconds
        setTimeout(() => dispatch({ type: 'RESET' }), 3000);
      }
    } catch (error) {
      console.error('Error fetching random movie:', error);
      const errorMessage =
        retryCount < maxRetries
          ? `${error.response?.data?.error || 'Failed to get random movie'}. Retrying...`
          : 'Max retries reached. Please try again later.';
      dispatch({ type: 'FETCH_ERROR', payload: errorMessage });

      // Retry logic
      if (retryCount < maxRetries) {
        setTimeout(getRandomMovie, 2000); // Retry after 2 seconds
      }
    }
  };

  // Handle retry button click
  const handleRetry = () => {
    dispatch({ type: 'RESET' });
    getRandomMovie();
    buttonRef.current.focus();
  };

  return (
    <>
      <style>{`
        /* RandomMovie Component Styles (Dark Theme) */

        /* Root Container */
        [data-theme="dark"] .random-movie-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 24px;
          background-color: #1f2937; /* Dark gray background */
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
          max-width: 400px;
          margin: 16px auto;
          color: #d1d5db; /* Light gray text */
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: fadeIn 0.5s ease-out;
        }

        /* Container Hover Effect */
        [data-theme="dark"] .random-movie-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.7);
        }

        /* Button Container */
        [data-theme="dark"] .random-movie-button-container {
          position: relative;
          display: inline-block;
        }

        /* Tooltip for Button */
        [data-theme="dark"] .random-movie-button-container::after {
          content: attr(data-tooltip);
          position: absolute;
          top: -40px;
          left: 50%;
          transform: translateX(-50%);
          background-color: #374151; /* Darker gray tooltip */
          color: #f3f4f6; /* Light text */
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          z-index: 10;
        }

        /* Tooltip Visible on Hover */
        [data-theme="dark"] .random-movie-button-container:hover::after {
          opacity: 1;
          visibility: visible;
        }

        /* Random Movie Button */
        [data-theme="dark"] .random-movie-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background-color: #3b82f6; /* Blue accent */
          color: #ffffff;
          font-size: 16px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        /* Button Disabled State */
        [data-theme="dark"] .random-movie-button:disabled {
          background-color: #4b5563; /* Muted gray */
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* Button Hover State */
        [data-theme="dark"] .random-movie-button:not(:disabled):hover {
          background-color: #2563eb;
          transform: scale(1.05);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.7);
        }

        /* Button Focus State */
        [data-theme="dark"] .random-movie-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
        }

        /* Button Active State */
        [data-theme="dark"] .random-movie-button:active {
          transform: scale(0.98);
        }

        /* Spinner for Loading */
        [data-theme="dark"] .random-movie-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #d1d5db; /* Light gray border */
          border-top-color: #3b82f6; /* Blue accent */
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        /* Error Message */
        [data-theme="dark"] .random-movie-error {
          background-color: #7f1d1d; /* Dark red background */
          color: #f3f4f6; /* Light text */
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          max-width: 100%;
          animation: fadeIn 0.5s ease-out;
          border: 1px solid #991b1b; /* Slightly lighter red border */
        }

        /* Success Message */
        [data-theme="dark"] .random-movie-success {
          background-color: #14532d; /* Dark green background */
          color: #f3f4f6; /* Light text */
          padding: 12px 16px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          max-width: 100%;
          animation: fadeIn 0.5s ease-out;
          border: 1px solid #15803d; /* Slightly lighter green border */
        }

        /* Retry Button */
        [data-theme="dark"] .random-movie-retry-button {
          margin-left: 8px;
          padding: 6px 12px;
          background-color: #ef4444; /* Red accent */
          color: #ffffff;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-size: 12px;
          font-weight: 600;
          transition: background-color 0.2s ease, transform 0.1s ease;
        }

        /* Retry Button Hover */
        [data-theme="dark"] .random-movie-retry-button:hover {
          background-color: #dc2626; /* Darker red */
        }

        /* Retry Button Focus */
        [data-theme="dark"] .random-movie-retry-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.3);
        }

        /* Retry Button Active */
        [data-theme="dark"] .random-movie-retry-button:active {
          transform: scale(0.98);
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        /* Responsive Design: Tablets and Below */
        @media (max-width: 768px) {
          [data-theme="dark"] .random-movie-container {
            max-width: 90%;
            padding: 20px;
            margin: 12px auto;
          }

          [data-theme="dark"] .random-movie-button {
            font-size: 14px;
            padding: 10px 20px;
          }

          [data-theme="dark"] .random-movie-spinner {
            width: 18px;
            height: 18px;
            border-width: 2px;
          }

          [data-theme="dark"] .random-movie-error,
          [data-theme="dark"] .random-movie-success {
            font-size: 13px;
            padding: 10px 14px;
          }

          [data-theme="dark"] .random-movie-retry-button {
            font-size: 11px;
            padding: 5px 10px;
          }

          [data-theme="dark"] .random-movie-button-container::after {
            font-size: 11px;
            padding: 6px 10px;
            top: -36px;
          }
        }

        /* Responsive Design: Mobile Devices */
        @media (max-width: 480px) {
          [data-theme="dark"] .random-movie-container {
            padding: 16px;
            margin: 8px auto;
            max-width: 95%;
          }

          [data-theme="dark"] .random-movie-button {
            font-size: 13px;
            padding: 8px 16px;
            gap: 6px;
          }

          [data-theme="dark"] .random-movie-spinner {
            width: 16px;
            height: 16px;
            border-width: 2px;
            margin-right: 6px;
          }

          [data-theme="dark"] .random-movie-error,
          [data-theme="dark"] .random-movie-success {
            font-size: 12px;
            padding: 8px 12px;
          }

          [data-theme="dark"] .random-movie-retry-button {
            font-size: 10px;
            padding: 4px 8px;
            margin-left: 6px;
          }

          [data-theme="dark"] .random-movie-button-container::after {
            font-size: 10px;
            padding: 5px 8px;
            top: -32px;
          }
        }

        /* Accessibility: Focus Enhancements */
        [data-theme="dark"] .random-movie-container:focus-within {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Screen Reader Only Class */
        [data-theme="dark"] .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        /* High Contrast Mode */
        @media (prefers-contrast: high) {
          [data-theme="dark"] .random-movie-container {
            background-color: #000000;
            color: #ffffff;
            border: 2px solid #ffffff;
          }

          [data-theme="dark"] .random-movie-button {
            background-color: #0000ff;
            color: #ffffff;
            border: 1px solid #ffffff;
          }

          [data-theme="dark"] .random-movie-button:disabled {
            background-color: #666666;
            color: #cccccc;
            border: none;
          }

          [data-theme="dark"] .random-movie-spinner {
            border-color: #ffffff;
            border-top-color: #0000ff;
          }

          [data-theme="dark"] .random-movie-error {
            background-color: #ff0000;
            color: #ffffff;
            border: 2px solid #ffffff;
          }

          [data-theme="dark"] .random-movie-success {
            background-color: #008000;
            color: #ffffff;
            border: 2px solid #ffffff;
          }

          [data-theme="dark"] .random-movie-retry-button {
            background-color: #ff0000;
            color: #ffffff;
            border: 1px solid #ffffff;
          }

          [data-theme="dark"] .random-movie-retry-button:hover {
            background-color: #cc0000;
          }

          [data-theme="dark"] .random-movie-button-container::after {
            background-color: #333333;
            color: #ffffff;
            border: 1px solid #ffffff;
          }
        }

        /* Reduced Motion Preference */
        @media (prefers-reduced-motion: reduce) {
          [data-theme="dark"] .random-movie-container,
          [data-theme="dark"] .random-movie-button,
          [data-theme="dark"] .random-movie-retry-button,
          [data-theme="dark"] .random-movie-error,
          [data-theme="dark"] .random-movie-success {
            transition: none;
            animation: none;
          }
        }

        /* Utility Classes */
        [data-theme="dark"] .text-center {
          text-align: center;
        }

        [data-theme="dark"] .text-left {
          text-align: left;
        }

        [data-theme="dark"] .text-right {
          text-align: right;
        }

        [data-theme="dark"] .mt-1 {
          margin-top: 4px;
        }

        [data-theme="dark"] .mt-2 {
          margin-top: 8px;
        }

        [data-theme="dark"] .mt-3 {
          margin-top: 12px;
        }

        [data-theme="dark"] .mt-4 {
          margin-top: 16px;
        }

        [data-theme="dark"] .mt-5 {
          margin-top: 20px;
        }

        [data-theme="dark"] .mb-1 {
          margin-bottom: 4px;
        }

        [data-theme="dark"] .mb-2 {
          margin-bottom: 8px;
        }

        [data-theme="dark"] .mb-3 {
          margin-bottom: 12px;
        }

        [data-theme="dark"] .mb-4 {
          margin-bottom: 16px;
        }

        [data-theme="dark"] .mb-5 {
          margin-bottom: 20px;
        }

        [data-theme="dark"] .p-1 {
          padding: 4px;
        }

        [data-theme="dark"] .p-2 {
          padding: 8px;
        }

        [data-theme="dark"] .p-3 {
          padding: 12px;
        }

        [data-theme="dark"] .p-4 {
          padding: 16px;
        }

        [data-theme="dark"] .p-5 {
          padding: 20px;
        }

        [data-theme="dark"] .rounded-sm {
          border-radius: 4px;
        }

        [data-theme="dark"] .rounded-md {
          border-radius: 6px;
        }

        [data-theme="dark"] .rounded-lg {
          border-radius: 8px;
        }

        [data-theme="dark"] .shadow-sm {
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        }

        [data-theme="dark"] .shadow-md {
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.5);
        }

        [data-theme="dark"] .shadow-lg {
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.5);
        }

        [data-theme="dark"] .bg-gray-800 {
          background-color: #1f2937;
        }

        [data-theme="dark"] .bg-gray-900 {
          background-color: #111827;
        }

        [data-theme="dark"] .text-gray-200 {
          color: #e5e7eb;
        }

        [data-theme="dark"] .text-gray-300 {
          color: #d1d5db;
        }

        [data-theme="dark"] .text-gray-400 {
          color: #9ca3af;
        }

        [data-theme="dark"] .font-medium {
          font-weight: 500;
        }

        [data-theme="dark"] .font-semibold {
          font-weight: 600;
        }

        [data-theme="dark"] .font-bold {
          font-weight: 700;
        }

        /* Additional Spacing Utilities */
        [data-theme="dark"] .gap-1 {
          gap: 4px;
        }

        [data-theme="dark"] .gap-2 {
          gap: 8px;
        }

        [data-theme="dark"] .gap-3 {
          gap: 12px;
        }

        [data-theme="dark"] .gap-4 {
          gap: 16px;
        }

        [data-theme="dark"] .gap-5 {
          gap: 20px;
        }

        /* Border Utilities */
        [data-theme="dark"] .border-gray-600 {
          border-color: #4b5563;
        }

        [data-theme="dark"] .border-gray-700 {
          border-color: #374151;
        }

        [data-theme="dark"] .border-gray-800 {
          border-color: #1f2937;
        }

        /* Line Height Utilities */
        [data-theme="dark"] .leading-tight {
          line-height: 1.25;
        }

        [data-theme="dark"] .leading-normal {
          line-height: 1.5;
        }

        [data-theme="dark"] .leading-loose {
          line-height: 2;
        }

        /* Additional Hover Effects */
        [data-theme="dark"] .random-movie-error:hover,
        [data-theme="dark"] .random-movie-success:hover {
          background-color: #4b5563; /* Slightly lighter on hover */
        }

        /* Focus States for Messages */
        [data-theme="dark"] .random-movie-error:focus,
        [data-theme="dark"] .random-movie-success:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Disabled State for Container */
        [data-theme="dark"] .random-movie-container:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        /* Animation for Button Container */
        [data-theme="dark"] .random-movie-button-container {
          animation: fadeIn 0.3s ease-out;
        }

        /* Ensure Consistent Box Sizing */
        [data-theme="dark"] *,
        [data-theme="dark"] *::before,
        [data-theme="dark"] *::after {
          box-sizing: border-box;
        }

        /* Additional Accessibility */
        [data-theme="dark"] [aria-hidden="true"] {
          display: none;
        }

        /* Focus Visible States */
        [data-theme="dark"] .random-movie-button:focus-visible,
        [data-theme="dark"] .random-movie-retry-button:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Ensure Consistent Line Height */
        [data-theme="dark"] .random-movie-container {
          line-height: 1.5;
        }
      `}</style>

      <div
        className="random-movie-container"
        role="region"
        aria-label="Random Movie Selector"
        data-theme="dark"
      >
        {/* Button with Tooltip */}
        <div
          className="random-movie-button-container"
          data-tooltip="Click to discover a random movie!"
        >
          <button
            ref={buttonRef}
            className="random-movie-button"
            onClick={getRandomMovie}
            disabled={isLoading || retryCount >= maxRetries}
            aria-busy={isLoading}
            aria-label="Get a random movie"
          >
            {isLoading ? (
              <>
                <span className="random-movie-spinner" />
                Finding a movie...
              </>
            ) : (
              <>
                <span style={{ fontSize: '1.2em' }}>🎲</span>
                Get Random Movie
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="random-movie-error"
            role="alert"
            aria-live="assertive"
          >
            {error}
            {retryCount >= maxRetries && (
              <button
                className="random-movie-retry-button"
                onClick={handleRetry}
                aria-label="Retry fetching random movie"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div
            className="random-movie-success"
            role="status"
            aria-live="polite"
          >
            {success}
          </div>
        )}
      </div>
    </>
  );
};

// PropTypes for type-checking
RandomMovie.propTypes = {
  onMovieClick: PropTypes.func.isRequired,
};

export default RandomMovie;