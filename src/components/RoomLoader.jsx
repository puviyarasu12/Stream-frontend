import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Room from './Room';
import api from '../utils/api';

const RoomLoader = ({ user, onLeaveRoom }) => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchRoom = useCallback(async () => {
    if (!roomId) {
      setError('Invalid room ID.');
      setLoading(false);
      return;
    }
    if (!user || (!user._id && !user.userId)) {
      setError('User information is missing or incomplete.');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log(`Fetching room data for roomId: ${roomId}, user:`, user);
      const response = await api.get(`/rooms/${roomId}`);
      setRoom(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching room:', err);
      setError('Failed to load room data. Please try again.');
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(retryCount + 1);
          fetchRoom();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [roomId, user, retryCount]);

  useEffect(() => {
    fetchRoom();
  }, [fetchRoom]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="anime-spinner">
          <div className="circle circle1"></div>
          <div className="circle circle2"></div>
          <div className="circle circle3"></div>
          <div className="circle circle4"></div>
          <div className="circle circle5"></div>
          <div className="circle circle6"></div>
          <div className="circle circle7"></div>
          <div className="circle circle8"></div>
        </div>
        <p>Loading zone...</p>
        <style>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a1a, #2c003e);
            color: #fff;
            font-family: 'Arial', sans-serif;
          }

          .anime-spinner {
            position: relative;
            width: 80px;
            height: 80px;
            animation: spin 2s linear infinite;
          }

          .circle {
            position: absolute;
            width: 16px;
            height: 16px;
            background: radial-gradient(circle at center, #ff6ec4, #7873f5);
            border-radius: 50%;
            opacity: 0.8;
            animation: pulse 1.5s ease-in-out infinite;
          }

          .circle1 { top: 0; left: 32px; animation-delay: 0s; }
          .circle2 { top: 12px; left: 58px; animation-delay: 0.1875s; }
          .circle3 { top: 38px; left: 70px; animation-delay: 0.375s; }
          .circle4 { top: 64px; left: 58px; animation-delay: 0.5625s; }
          .circle5 { top: 76px; left: 32px; animation-delay: 0.75s; }
          .circle6 { top: 64px; left: 6px; animation-delay: 0.9375s; }
          .circle7 { top: 38px; left: -6px; animation-delay: 1.125s; }
          .circle8 { top: 12px; left: 6px; animation-delay: 1.3125s; }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 0.3; transform: scale(0.6); }
          }

          p {
            margin-top: 24px;
            font-size: 1.4rem;
            font-weight: bold;
            text-shadow: 0 0 8px #ff6ec4, 0 0 12px #7873f5;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <button onClick={() => window.location.href = '/rooms'}>
          Back to Zones
        </button>
        <style jsx>{`
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1a1a1a;
            color: #ff4040;
            font-family: 'Arial', sans-serif;
          }

          p {
            font-size: 1.2rem;
            margin-bottom: 20px;
            text-shadow: 0 0 5px rgba(255, 64, 64, 0.3);
          }

          button {
            padding: 10px 20px;
            background-color: #ff4500;
            border: none;
            border-radius: 5px;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          button:hover {
            background-color: #cc3700;
          }
        `}</style>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="error-state">
        <p>Zone not found</p>
        <button onClick={() => window.location.href = '/rooms'}>
          Back to Zones
        </button>
        <style jsx>{`
          .error-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background-color: #1a1a1a;
            color: #ff4040;
            font-family: 'Arial', sans-serif;
          }

          p {
            font-size: 1.2rem;
            margin-bottom: 20px;
            text-shadow: 0 0 5px rgba(255, 64, 64, 0.3);
          }

          button {
            padding: 10px 20px;
            background-color: #ff4500;
            border: none;
            border-radius: 5px;
            color: #fff;
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.3s;
          }

          button:hover {
            background-color: #cc3700;
          }
        `}</style>
      </div>
    );
  }

  return (
    <Room
      room={room}
      user={user}
      onLeaveRoom={onLeaveRoom}
    />
  );
};

export default RoomLoader;
