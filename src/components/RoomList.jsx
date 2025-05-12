import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MovieSearch from './MovieSearch';
import '../styles/roomlist.css';

const RoomList = ({ onRoomSelect, user }) => {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showMovieSearch, setShowMovieSearch] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching zones:', error);
      setError('Failed to fetch zones. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const createRoom = async (e) => {
    e.preventDefault();
    try {
      if (!newRoomName.trim()) {
        setError('Zone name is required');
        return;
      }

      const movieData = selectedMovie
        ? {
            title: selectedMovie.title,
            url: `https://www.youtube.com/watch?v=${selectedMovie.id}`,
            thumbnail: selectedMovie.thumbnail,
            currentTime: 0,
            isPlaying: false,
          }
        : null;

      const response = await api.post('/rooms', {
        name: newRoomName,
        movie: movieData,
        isPrivate,
      });

      const createdRoom = response.data;
      setRooms([...rooms, createdRoom]);

      // If it's a private zone, show invite code to creator
      if (createdRoom.isPrivate && createdRoom.inviteCode) {
        setError(`Zone created successfully! Invite code: ${createdRoom.inviteCode}`);
      } else {
        setError(null);
      }

      setNewRoomName('');
      setSelectedMovie(null);
      setShowMovieSearch(false);
      setIsPrivate(false);
    } catch (error) {
      console.error('Error creating zone:', error);
      setError(error.response?.data?.error || 'Failed to create zone');
    }
  };

  const joinPrivateRoom = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      setJoinError('Please enter an invite code');
      return;
    }
    try {
      const response = await api.post('/rooms/join', { inviteCode });
      onRoomSelect(response.data);
      setInviteCode('');
      setJoinError('');
    } catch (error) {
      console.error('Error joining private zone:', error);
      setJoinError(error.response?.data?.error || 'Invalid invite code');
    }
  };

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    setShowMovieSearch(false);
  };

  console.log('User ID:', user?._id);
  console.log('Rooms:', rooms);
  const filteredRooms = rooms.filter(room => {
    console.log('Room:', room.name, 'Creator ID:', room.creator?._id, 'Is Private:', room.isPrivate);
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Show zone if it's public or if the user is the creator or if showPrivateZones is true
    return matchesSearch && (!room.isPrivate || String(room.creator._id) === String(user._id));
  });

  return (
    <div className="room-list">
      <h2>Available Zones</h2>

      <div className="create-room-section">
        <form onSubmit={createRoom} className="create-room-form">
          <div className="form-group">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="Enter zone name"
              required
              className="room-name-input"
            />
            <label className="private-room-toggle">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              Private Zone
            </label>
            {selectedMovie && (
              <div className="selected-movie">
                Selected Movie: {selectedMovie.title}
                <button
                  type="button"
                  onClick={() => setSelectedMovie(null)}
                  className="clear-movie-btn"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <div className="button-group">
            <button type="submit" className="create-room-btn">Create Zone</button>
            <button
              type="button"
              onClick={() => setShowMovieSearch(!showMovieSearch)}
              className="toggle-search-btn"
            >
              {showMovieSearch ? 'Hide Movie Search' : 'Search Movie'}
            </button>
          </div>
        </form>
        {error && <div className="error-state">{error}</div>}
      </div>

      {showMovieSearch && (
        <div className="movie-search-container">
          <MovieSearch onMovieSelect={handleMovieSelect} />
        </div>
      )}

      <div className="private-room-section">
        <h3>Join Private Zone</h3>
        <form onSubmit={joinPrivateRoom} className="join-room-form">
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="Enter invite code"
            className="invite-code-input"
          />
          <button type="submit" className="join-room-btn">Join Private Zone</button>
        </form>
        {joinError && <div className="error-state">{joinError}</div>}
      </div>

      <div className="room-search">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search zones..."
          className="room-search-input"
        />
      </div>

      {isLoading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? 'No zones match your search' : 'No zones available. Create one to get started!'}
            </div>
          ) : (
            filteredRooms.map((room) => (
              <div key={room._id} className="room-item" onClick={() => onRoomSelect(room)}>
                {room.movie?.thumbnail && (
                  <div className="room-thumbnail">
                    <img
                      src={room.movie.thumbnail}
                      alt={room.movie.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="room-info">
                  <h3>
                    {room.name}
                    {room.isPrivate && <span className="private-badge">Private</span>}
                  </h3>
                  {room.movie?.title && (
                    <p className="movie-title">Playing: {room.movie.title}</p>
                  )}
                  <p className="room-details">
                    Created by: {room.creator.username}
                    <br />
                    Participants: {room.participants.length}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default RoomList;