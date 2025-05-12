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
        <div className="loading-spinner"></div>
        <p>Loading room...</p>
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
