import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Room from './Room';
import api from '../utils/api';

const RoomLoader = ({ user, onLeaveRoom }) => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/rooms/${roomId}`);
        setRoom(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching room:', err);
        setError('Failed to load room data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  if (loading) {
    return (
    <div className="loading-state">
      <div className="shuriken"></div>
      <p>Loading room...</p>
      <style>{`
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background-color: #1a1a1a;
          color: #fff;
          font-family: 'Arial', sans-serif;
        }

          .shuriken {
            width: 60px;
            height: 60px;
            position: relative;
            animation: spin 1s linear infinite;
          }

          .shuriken::before,
          .shuriken::after {
            content: '';
            position: absolute;
            background-color: #ff4500;
            border-radius: 2px;
          }

          .shuriken::before {
            width: 60px;
            height: 8px;
            top: 26px;
            left: 0;
            transform: rotate(45deg);
            box-shadow: 0 0 8px rgba(255, 69, 0, 0.8);
          }

          .shuriken::after {
            width: 60px;
            height: 8px;
            top: 26px;
            left: 0;
            transform: rotate(-45deg);
            box-shadow: 0 0 8px rgba(255, 69, 0, 0.8);
          }

          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          p {
            margin-top: 20px;
            font-size: 1.2rem;
            text-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
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
        <p>Room not found</p>
        <button onClick={() => window.location.href = '/rooms'}>
          Back to Rooms
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