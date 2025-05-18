import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Room from './Room';
import api from '../utils/api';

const RoomLoader = ({ user, onLeaveRoom }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const retryButtonRef = useRef(null);

  useEffect(() => {
    const fetchRoom = async () => {
      abortControllerRef.current = new AbortController();
      try {
        setLoading(true);
        const response = await api.get(`/rooms/${roomId}`, {
          signal: abortControllerRef.current.signal,
        });
        setRoom(response.data);
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching room:', {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        const errorMessage =
          err.response?.status === 401 ? 'Please log in to access this room.' :
          err.response?.status === 403 ? 'You do not have permission to access this room.' :
          err.response?.status === 404 ? 'Room not found.' :
          'Failed to load room data. Please try again.';
        setError(errorMessage);
        if (retryButtonRef.current) retryButtonRef.current.focus();
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [roomId]);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (retryButtonRef.current) retryButtonRef.current.focus();
  };

  const handleBack = () => navigate('/rooms');

  return (
    <>
      {loading && (
        <div className="room-loader-loading" aria-live="polite">
          <div className="rasengan-spinner"></div>
          <p className="loading-text">Summoning Room... <span className="kanji">部屋</span></p>
        </div>
      )}

      {error && (
        <div className="room-loader-error" role="alert" aria-live="assertive">
          <p className="error-text">{error}</p>
          <div className="error-buttons">
            <button
              ref={retryButtonRef}
              onClick={handleRetry}
              className="retry-button"
              aria-label="Retry loading room"
            >
              Retry <span className="kanji">再試行</span>
            </button>
            <button
              onClick={handleBack}
              className="back-button"
              aria-label="Return to zones"
            >
              Back to Zones <span className="kanji">ゾーン</span>
            </button>
          </div>
        </div>
      )}

      {!loading && !error && !room && (
        <div className="room-loader-error" role="alert" aria-live="assertive">
          <p className="error-text">Room not found.</p>
          <button
            onClick={handleBack}
            className="back-button"
            aria-label="Return to zones"
          >
            Back to Zones <span className="kanji">ゾーン</span>
          </button>
        </div>
      )}

      {room && (
        <Room
          room={room}
          user={user}
          onLeaveRoom={onLeaveRoom}
        />
      )}

      <style jsx>{`
        /* Inherit App.css theme variables */
        :global(.light-theme) .room-loader-loading,
        :global(.light-theme) .room-loader-error {
          --loader-bg: #f8fafc;
          --loader-text: #1f2937;
          --error-text: #dc2626;
          --button-bg: #2563eb;
          --button-hover: #1d4ed8;
          --spinner-color: #2563eb;
          --spinner-glow: rgba(37, 99, 235, 0.8);
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        :global(.dark-theme) .room-loader-loading,
        :global(.dark-theme) .room-loader-error {
          --loader-bg: #1a1a1a;
          --loader-text: #e5e7eb;
          --error-text: #ef4444;
          --button-bg: #ff4500;
          --button-hover: #cc3700;
          --spinner-color: #ff4500;
          --spinner-glow: rgba(255, 69, 0, 0.8);
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        /* Base styles */
        .room-loader-loading,
        .room-loader-error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(180deg, var(--loader-bg), #2e2e2e);
          color: var(--loader-text);
          font-family: 'Zen Maru Gothic', 'Arial', sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Rasengan spinner */
        .rasengan-spinner {
          width: 80px;
          height: 80px;
          position: relative;
          animation: spin 1.2s linear infinite;
          z-index: 2;
        }

        .rasengan-spinner::before,
        .rasengan-spinner::after {
          content: '';
          position: absolute;
          background-color: var(--spinner-color);
          border-radius: 4px;
          box-shadow: 0 0 12px var(--spinner-glow);
        }

        .rasengan-spinner::before {
          width: 80px;
          height: 12px;
          top: 34px;
          left: 0;
          transform: rotate(45deg);
        }

        .rasengan-spinner::after {
          width: 80px;
          height: 12px;
          top: 34px;
          left: 0;
          transform: rotate(-45deg);
          animation: swirl 0.6s linear infinite;
        }

        /* Smoke effect */
        .room-loader-loading::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: linear-gradient(to bottom, rgba(255, 69, 0, 0.2), transparent);
          animation: smoke 4s linear infinite;
          z-index: 1;
        }

        /* Chakra glow effect */
        .room-loader-loading::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, rgba(255, 69, 0, 0.1) 0%, transparent 70%);
          z-index: 0;
        }

        /* Loading text */
        .loading-text {
          margin-top: 24px;
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
          animation: pulse 2s ease-in-out infinite;
          z-index: 2;
          display: flex;
          align-items: center;
        }

        /* Kanji text */
        .kanji {
          font-size: 1.25rem;
          color: var(--spinner-color);
          margin-left: 8px;
        }

        /* Error text */
        .error-text {
          font-size: 1.5rem;
          font-weight: 700;
          text-shadow: 0 0 6px rgba(255, 64, 64, 0.4);
          margin-bottom: 24px;
          text-align: center;
          max-width: 80%;
          color: var(--error-text);
          line-height: 1.5;
        }

        /* Error buttons */
        .error-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Retry button */
        .retry-button {
          padding: 12px 24px;
          background-color: var(--button-bg);
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .retry-button:hover {
          background-color: var(--button-hover);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }

        .retry-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(255, 69, 0, 0.3);
        }

        /* Back button */
        .back-button {
          padding: 12px 24px;
          background-color: var(--secondary, #6b7280);
          border: none;
          border-radius: 6px;
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .back-button:hover {
          background-color: var(--secondary-hover, #4b5563);
          transform: translateY(-2px);
          box-shadow: var(--shadow);
          text-shadow: 0 0 6px rgba(255, 255, 255, 0.4);
        }

        .back-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.3);
        }

        .retry-button .kanji,
        .back-button .kanji {
          font-size: 0.9rem;
          margin-left: 4px;
        }

        /* Button ripple effect */
        .retry-button::after,
        .back-button::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }

        .retry-button:active::after,
        .back-button:active::after {
          width: 200px;
          height: 200px;
        }

        /* Animations */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes swirl {
          from { transform: rotate(-45deg); }
          to { transform: rotate(315deg); }
        }

        @keyframes smoke {
          0% { transform: translateY(0); opacity: 0.3; }
          100% { transform: translateY(-100px); opacity: 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25%, 75% { transform: translateX(-5px); }
          50% { transform: translateX(5px); }
        }

        /* Responsive design */
        @media (max-width: 768px) {
          .loading-text,
          .error-text {
            font-size: 1.25rem;
          }

          .rasengan-spinner {
            width: 60px;
            height: 60px;
          }

          .rasengan-spinner::before,
          .rasengan-spinner::after {
            width: 60px;
            height: 10px;
            top: 25px;
          }

          .retry-button,
          .back-button {
            padding: 10px 20px;
            font-size: 0.95rem;
          }

          .kanji {
            font-size: 1.1rem;
          }
        }

        @media (max-width: 480px) {
          .loading-text,
          .error-text {
            font-size: 1.1rem;
            max-width: 90%;
          }

          .rasengan-spinner {
            width: 50px;
            height: 50px;
          }

          .rasengan-spinner::before,
          .rasengan-spinner::after {
            width: 50px;
            height: 8px;
            top: 21px;
          }

          .error-buttons {
            flex-direction: column;
            gap: 12px;
          }

          .retry-button,
          .back-button {
            width: 100%;
            padding: 10px;
          }
        }

        /* Accessibility: High contrast mode */
        @media (prefers-contrast: high) {
          .room-loader-loading,
          .room-loader-error {
            --loader-bg: #000000;
            --loader-text: #ffffff;
            --error-text: #ff6666;
            --button-bg: #ff6666;
            --button-hover: #cc3333;
            --spinner-color: #ff6666;
            --spinner-glow: rgba(255, 102, 102, 0.8);
          }

          .retry-button,
          .back-button {
            border: 2px solid #ffffff;
          }
        }

        /* Accessibility: Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .rasengan-spinner,
          .rasengan-spinner::before,
          .rasengan-spinner::after,
          .room-loader-loading::before,
          .room-loader-loading::after,
          .loading-text,
          .retry-button,
          .back-button,
          .room-loader-error {
            animation: none;
            transition: none;
          }
        }

        /* Print styles */
        @media print {
          .room-loader-loading,
          .room-loader-error {
            display: none;
          }
        }

        /* Utility styles */
        .room-loader-loading {
          animation: fadeIn 0.5s ease;
        }

        .room-loader-error {
          animation: shake 0.3s ease;
        }

        .room-loader-loading:focus-within,
        .room-loader-error:focus-within {
          outline: 2px solid var(--spinner-color);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
};

export default RoomLoader;
