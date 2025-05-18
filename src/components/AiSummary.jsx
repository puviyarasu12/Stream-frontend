import React, { useState, useRef, useCallback } from 'react';
import { getMovieSummary } from '../utils/api';
import debounce from 'lodash/debounce';
import '../styles/AiSummary.css'; // Extracted styles

const AiSummary = () => {
  const [movieName, setMovieName] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // Input change handler without debounce for better typing responsiveness
  const handleInputChange = (value) => {
    setMovieName(value);
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (movieName.trim().length < 2) {
      setError('Please enter a valid movie name (at least 2 characters).');
      inputRef.current.focus();
      return;
    }

    setLoading(true);
    setError('');
    setSummary(null);

    try {
      const response = await getMovieSummary(movieName);
      setSummary(response.answer); // Adjusted to match backend response { answer: string }
    } catch (err) {
      console.error('Error fetching summary:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
      });
      const errorMessage = err.response?.data?.error || 'Failed to fetch movie summary. Please try again.';
      setError(errorMessage);
      if (err.response?.status === 401) {
        setError('Please log in to access movie summaries.');
      } else if (err.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      }
      inputRef.current.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the form and summary?')) {
      setMovieName('');
      setSummary(null);
      setError('');
      inputRef.current.focus();
    }
  };

  return (
    <div className="ai-summary-container">
      <div className="ai-summary-card">
        <h2 className="ai-summary-title">🎬 Movie Summary Generator</h2>

        <form onSubmit={handleSubmit} className="ai-summary-form" aria-label="Movie summary form">
          <input
            type="text"
            placeholder="Enter a movie name (e.g., Superman IV)"
            value={movieName}
            onChange={(e) => handleInputChange(e.target.value)}
            className="ai-summary-input"
            required
            disabled={loading}
            ref={inputRef}
            aria-label="Movie name input"
            aria-invalid={!!error}
          />
          <div className="ai-summary-buttons">
            <button
              type="submit"
              className="ai-summary-submit"
              disabled={loading}
              aria-label={loading ? 'Loading summary' : 'Get movie summary'}
            >
              {loading ? 'Loading...' : 'Get Summary'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="ai-summary-clear"
              disabled={loading}
              aria-label="Clear form and summary"
            >
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="ai-summary-error" role="alert" aria-live="assertive">
            {error}
          </div>
        )}

        {loading && (
          <div className="ai-summary-loading" aria-live="polite">
            Loading summary...
          </div>
        )}

        {summary && (
          <div className="ai-summary-content" role="region" aria-label="Movie summary">
            <p className="ai-summary-content-text" style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSummary;
