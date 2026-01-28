import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import api from '../utils/api';
import MovieSearch from './MovieSearch';
import Chat from './Chat';
import RoomSettings from './RoomSettings';
import MovieDetails from './MovieDetails';
import { socket } from '../socket';
import '../styles/room.css';

const Room = ({ room, user: propUser, onLeaveRoom }) => {

  // User handling
  let user = propUser;
  if (!user) {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user = JSON.parse(storedUser);
      } else {
        user = null;
      }
    } catch (e) {
      user = null;
    }
  }
  if (user && !user._id && user.userId) {
    user._id = user.userId;
  }

  // State
  const [movie, setMovie] = useState(room.movie || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [participants, setParticipants] = useState(room.participants || []);
  const [watchlist, setWatchlist] = useState(room.watchlist || []);
  const [customUrl, setCustomUrl] = useState('');
  const [error, setError] = useState(null);
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [joined, setJoined] = useState(() => {
    if (!user) return false;
    return !room.isPrivate || (room.creator?._id && user._id && room.creator._id.toString() === user._id.toString());
  });
  const [showSettings, setShowSettings] = useState(false);
  const [settingsUpdated, setSettingsUpdated] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [inviteCode, setInviteCode] = useState(room.inviteCode || '');
  const [copySuccess, setCopySuccess] = useState(false);

  const playerRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const isUserAction = useRef(false);
  const lastSyncTimestamp = useRef(0);
  const syncBuffer = 0.1;
  const seekThreshold = 5;

  // Fetch invite code for creator
  const fetchInviteCode = useCallback(async () => {
    if (room.isPrivate && user && room.creator?._id && user._id && room.creator._id.toString() === user._id.toString()) {
      try {
        const response = await api.get(`/rooms/${room._id}/invite-code`);
        setInviteCode(response.data.inviteCode);
      } catch (error) {
        console.error('Failed to fetch invite code:', error);
        setError('Failed to fetch invite code.');
      }
    }
  }, [room._id, room.isPrivate, user, room.creator?._id]);

  // Join room logic
  const joinRoom = useCallback(
    async (code) => {
      try {
        console.log('Attempting to join room with code:', code);
        const payload = {};
        if (user && room.creator?._id && user._id && room.creator._id.toString() === user._id.toString()) {
          payload.roomId = room._id;
          if (code) payload.inviteCode = code;
        } else {
          payload.inviteCode = code;
        }
        const response = await api.post('/rooms/join', payload);
        console.log('Join room response:', response.data);
        setJoined(true);
        setInviteCode(response.data.inviteCode || code);
        setError(null);
      } catch (joinError) {
        console.error('Failed to join private room:', joinError.response?.data, joinError.response?.status);
        if (joinError.response?.status === 403) {
          setError('You are banned from this room.');
        } else if (joinError.response?.status === 404) {
          setError('Invalid invite code or room not found.');
        } else {
          setError('Failed to join private room.');
        }
      }
    },
    [room._id, room.creator, user]
  );

  // Copy invite code to clipboard
  const handleCopyInviteCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch (error) {
      console.error('Failed to copy invite code:', error);
      setError('Failed to copy invite code.');
    }
  };

  const handleWatchlistMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  // Fetch room state
  const fetchRoomState = useCallback(
    async () => {
      if (room.isPrivate && !joined) return;
      try {
        const response = await api.get(`/rooms/${room._id}`);
        const roomData = response.data;
        setParticipants(roomData.participants);
        setWatchlist(roomData.watchlist || []);
        setError(null);

        // Only update movie state if it differs significantly
        if (roomData.movie && (!movie || roomData.movie.url !== movie.url)) {
          setMovie(roomData.movie);
          setIsPlaying(roomData.movie.isPlaying);
          if (playerRef.current) {
            playerRef.current.seekTo(roomData.movie.currentTime);
          }
          lastUpdateTime.current = roomData.movie.currentTime;
        }
      } catch (error) {
        console.error('Fetch room state error:', error.response?.data, error.response?.status);
        if (error.response?.status === 403) {
          setError(
            error.response.data.error.includes('banned')
              ? 'You are banned from this room.'
              : 'You are not authorized to access this room.'
          );
          setTimeout(() => {
            if (typeof onLeaveRoom === 'function') onLeaveRoom();
            else console.error('onLeaveRoom is not a function');
          }, 3000);
        } else if (error.response?.status === 404) {
          setError('Room not found or has been deleted.');
          setTimeout(() => {
            if (typeof onLeaveRoom === 'function') onLeaveRoom();
            else console.error('onLeaveRoom is not a function');
          }, 3000);
        } else if (error.response?.status === 401) {
          setError('Session expired. Please log in again.');
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        } else {
          setError('Error fetching room state. Please try refreshing.');
        }
      }
    },
    [room._id, room.isPrivate, joined, onLeaveRoom, movie]
  );

  // Auto-join and fetch invite code for creator
  useEffect(() => {
    if (user && room.creator?._id && user._id && room.creator._id.toString() === user._id.toString() && !joined) {
      console.log('Auto-joining room for creator');
      joinRoom('');
    }
    if (joined && room.isPrivate) {
      fetchInviteCode();
    }
  }, [user, room.creator, joined, joinRoom, fetchInviteCode, room.isPrivate]);

  // Handle invite code input change
  const handleInviteCodeChange = (e) => {
    setInviteCode(e.target.value);
  };

  // Handle invite code form submit
  const handleInviteCodeSubmit = async (e) => {
    e.preventDefault();
    if (!inviteCode) {
      setError('Please enter an invite code.');
      return;
    }
    await joinRoom(inviteCode);
  };

useEffect(() => {
  if (!joined || room.isPrivate) return;

  fetchRoomState();
  if (!socket.connected) socket.connect();
  socket.emit('join-room', room._id);

  const syncTimestamps = [];
  const maxSyncFrequency = 1000;

  socket.on('video-sync', (videoState) => {
    if (isUserAction.current) return;
    if (videoState.timestamp <= lastSyncTimestamp.current) return;

    lastSyncTimestamp.current = videoState.timestamp;

    const now = Date.now();
    if (
      syncTimestamps.length > 0 &&
      now - syncTimestamps[syncTimestamps.length - 1] < maxSyncFrequency
    ) {
      return;
    }

    syncTimestamps.push(now);
    if (syncTimestamps.length > 5) syncTimestamps.shift();

    setMovie(videoState);
    setIsPlaying(videoState.isPlaying);

    if (playerRef.current && videoState.isPlaying) {
      const currentTime = playerRef.current.getCurrentTime();
      const timeDiff = currentTime - videoState.currentTime;

      if (Math.abs(timeDiff) > seekThreshold) {
        playerRef.current.seekTo(videoState.currentTime + syncBuffer);
      }
    }

    lastUpdateTime.current = videoState.currentTime;
  });

  return () => {
    socket.emit('leave-room', room._id);
    socket.off('video-sync');
  };
}, [joined, room._id, room.isPrivate, fetchRoomState]);


  // Update movie state with user actions
  const updateMovieState = async (currentTime, playing) => {
    try {
      if (Math.abs(currentTime - lastUpdateTime.current) < 1) {
        console.log('[updateMovieState] Skipping sync due to insignificant time change');
        return;
      }

      isUserAction.current = true;
      lastUpdateTime.current = currentTime;
      const videoState = {
        currentTime,
        isPlaying: playing,
        title: movie?.title,
        url: movie?.url,
        timestamp: Date.now(),
      };
      await api.patch(`/rooms/${room._id}/movie`, videoState);
      socket.emit('video-sync', { roomId: room._id, videoState });
      setError(null);
      setTimeout(() => {
        isUserAction.current = false;
      }, 1000);
    } catch (error) {
      setError('Error updating movie state');
      isUserAction.current = false;
    }
  };

  const handleMovieSelect = async (selectedMovie) => {
    try {
      await api.post(`/rooms/${room._id}/watchlist`, {
        movie: {
          id: selectedMovie.id,
          title: selectedMovie.title,
          thumbnail: selectedMovie.thumbnail,
          year: selectedMovie.year,
        },
      });
      await fetchRoomState();
    } catch (error) {
      setError('Failed to add movie to watchlist');
    }
  };

  const handleSelectWatchlistMovie = async (movieId) => {
    try {
      await api.post(`/rooms/${room._id}/watchlist/${movieId}/select`, {});
      await fetchRoomState();
    } catch (error) {
      setError('Failed to select movie');
    }
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    console.log('Custom URL submitted:', customUrl);

    // List of domains that should be rendered in an iframe
    const supportedEmbedDomains = [
      'vidmoly.to',
      'dhcplay.com',
      'play.onestream.watch',
      'play.bunnycdn.to', // Added to support BunnyCDN embeds
    ];

    // Check if the URL is from a supported embed domain
    const isEmbedUrl = supportedEmbedDomains.some((domain) => customUrl.includes(domain));

    if (isEmbedUrl) {
      console.log('Rendering URL in iframe:', customUrl);
      setMovie({ url: customUrl, title: 'Custom Video' });
      setError(null);
      setCustomUrl('');
    } else if (ReactPlayer.canPlay(customUrl)) {
      console.log('Rendering URL with ReactPlayer:', customUrl);
      setMovie({ url: customUrl, title: 'Custom Video' });
      setError(null);
      setCustomUrl('');
    } else {
      console.error('Invalid video URL:', customUrl);
      setError(
        'Unsupported video URL. Please use a supported platform (e.g., YouTube, Vimeo, Vidmoly, BunnyCDN) or a valid embed link.'
      );
    }
  };

  useEffect(() => {
    console.log('Movie state updated:', movie);
  }, [movie]);

  const handleProgress = () => {};

  const handleSettingsUpdate = (_, deleted = false) => {
    if (deleted) {
      if (typeof onLeaveRoom === 'function') onLeaveRoom();
      else console.error('onLeaveRoom is not a function');
      return;
    }
    setSettingsUpdated(true);
    setTimeout(() => setSettingsUpdated(false), 3000);
    setShowSettings(false);
    fetchRoomState();
  };

  if (error) {
    console.log('Room creator ID:', room?.creator?._id);
    console.log('User ID:', user?._id);
    return (
      <div className="room">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="room">
      <div className="room-details">
        <div className="room-header">
          <h2>{room.name}</h2>
          <div className="room-header-controls">
            {room.isPrivate && !joined && (
              <form onSubmit={handleInviteCodeSubmit} className="invite-code-form">
                <label htmlFor="inviteCode">Enter Invite Code to Join Private Zone:</label>
                <input
                  type="text"
                  id="inviteCode"
                  value={inviteCode}
                  onChange={handleInviteCodeChange}
                  placeholder="Invite Code"
                  className="invite-code-input"
                />
                <button type="submit" className="btn btn--primary">Join</button>
              </form>
            )}
            {room.isPrivate && joined && (
              <div className="private-zone">
                <p>Welcome to the private zone!</p>
                {inviteCode && (
                  <div className="invite-code-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={handleCopyInviteCode}
                      className="btn btn--secondary copy-invite-btn"
                      aria-label="Copy invite code to clipboard"
                    >
                      Copy Invite Code
                    </button>
                    <span className="invite-code-text" style={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      {inviteCode}
                    </span>
                    {copySuccess && <span className="success-message">Invite code copied!</span>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="participants">
            {participants.map((participant) => (
              <div key={participant._id} className="participant">
                <span>{participant.username}</span>
                {room?.creator?._id === user?._id && participant._id !== user._id && (
                  <div className="moderation-controls">{/* Add moderation buttons here if needed */}</div>
                )}
              </div>
            ))}
          </div>
          <div className="controls-section">
            <div className="controls-header">
              <div className="controls-buttons">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="settings-btn btn btn--primary"
                  aria-expanded={showSettings}
                >
                  {showSettings ? 'Close Settings' : 'Zone Settings'}
                </button>
                <button
                  onClick={() => setShowWatchlist(!showWatchlist)}
                  className="toggle-watchlist-btn btn btn--secondary"
불편한
                >
                  {showWatchlist ? 'Hide Watchlist' : 'Show Watchlist'}
                </button>
              </div>

              {showSettings && (
                <div className="settings-container">
                  <RoomSettings room={room} onSettingsUpdate={handleSettingsUpdate} currentUserId={user?._id} />
                </div>
              )}

              {settingsUpdated && <div className="success-message">Settings updated successfully!</div>}
            </div>

            {showWatchlist && (
              <div className="watchlist-section" style={{ overflowY: 'auto', minHeight: '200px' }}>
                <h3>Watchlist</h3>
                <div
                  className="watchlist-controls"
                  style={{ marginBottom: '1rem', overflow: 'visible', minHeight: '100px' }}
                >
                  <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                    <MovieSearch onMovieSelect={handleMovieSelect} buttonText="Add to Zone Watchlist" />
                  </div>
                </div>
                <div className="watchlist-grid">
                  {(!watchlist || watchlist.length === 0) && <p>No movies in watchlist</p>}
                  {watchlist &&
                    watchlist.map((item) => (
                      <div
                        key={item.movie.id}
                        className="watchlist-item"
                        role="button"
                        tabIndex={0}
                        onClick={() => handleWatchlistMovieClick(item.movie)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleWatchlistMovieClick(item.movie);
                          }
                        }}
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
                          <h4>
                            {item.movie.title} ({item.movie.year})
                          </h4>
                          <p>Added by: {item.addedBy.username}</p>
                          <p>Votes: {(item.votes && item.votes.length) || 0}</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="video-section">
          {movie ? (
            <div className="video-container">
              {movie.url &&
              (movie.url.includes('vidmoly.to') ||
                movie.url.includes('dhcplay.com') ||
                movie.url.includes('play.onestream.watch') ||
                movie.url.includes('play.bunnycdn.to')) ? (
                <iframe
                  src={movie.url}
                  title={movie.title || 'Video Player'}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  // Comment out sandbox for testing if BunnyCDN fails to load
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-presentation"
                  onError={() => {
                    setError('Failed to load video. Please check the URL or try another.');
                  }}
                />
              ) : (
                <ReactPlayer
                  ref={playerRef}
                  url={movie.url}
                  playing={isPlaying}
                  controls={true}
                  width="100%"
                  height="100%"
                  onProgress={handleProgress}
                  onPlay={() => {
                    setIsPlaying(true);
                    updateMovieState(playerRef.current?.getCurrentTime() || 0, true);
                  }}
                  onPause={() => {
                    setIsPlaying(false);
                    updateMovieState(playerRef.current?.getCurrentTime() || 0, false);
                  }}
                  onError={() => {
                    setError('Error playing video. Please try another URL.');
                  }}
                  config={{
                    youtube: {
                      playerVars: {
                        origin: window.location.origin,
                        enablejsapi: 1,
                      },
                    },
                  }}
                />
              )}
            </div>
          ) : (
            <div className="movie-selection" style={{ overflowY: 'auto', minHeight: '200px' }}>
              <form onSubmit={handleCustomUrlSubmit} className="url-input-form">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="Enter video URL (YouTube, Vimeo, Vidmoly, BunnyCDN, etc.)"
                  className="url-input"
                />
                <button type="submit" className="btn btn--primary">Play Video</button>
              </form>
              {error && (
                <div className="error-message">
                  {error}
                  <br />
                  <a href={customUrl} target="_blank" rel="noopener noreferrer">
                    Try opening the video in a new tab
                  </a>
                </div>
              )}
              <div className="movie-search-section" style={{ overflow: 'visible', minHeight: '150px' }}>
                <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                  <MovieSearch onMovieSelect={handleMovieSelect} buttonText="Add to Zone Watchlist" />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="chat-section">
          <Chat roomId={room._id} user={user} />
        </div>
      </div>

      {selectedMovie && (
        <MovieDetails
          movie={selectedMovie}
          onClose={handleCloseModal}
          onSelect={(movie) => {
            handleSelectWatchlistMovie(movie.id);
            handleCloseModal();
          }}
          buttonText="Add to Zone Watchlist"
        />
      )}
    </div>
  );
};

export default Room;


