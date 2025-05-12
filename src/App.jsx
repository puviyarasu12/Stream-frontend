import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import RoomList from './components/RoomList';
import UserWatchlist from './components/UserWatchlist';
import Trivia from './components/Trivia';
import Home from './components/Home';
import RoomLoader from './components/RoomLoader';
import Profile from './components/Profile';
import api from './utils/api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const fetchUser = async () => {
        try {
          await api.get('/debug');
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          console.error('Auto-login error:', error);
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            localStorage.removeItem('token');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = `${theme}-theme`;
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/';
  };

  const handleRoomSelect = (room) => {
    window.location.href = `/room/${room._id}`;
  };

  const handleLeaveRoom = () => {
    window.location.href = '/rooms';
  };

  const handleNavigate = (view) => {
    window.location.href = `/${view === 'home' ? '' : view}`;
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  const isAuthenticated = !!user;

  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" />;
    }
    return children;
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className={`app ${theme}-theme`}>
        <Routes>
          <Route path="/" element={null} />
          <Route
            path="*"
            element={
              <header className="header">
                <h1 className="title">StreamMate</h1>
                <div className="nav-buttons">
                  <button className="nav-button" onClick={() => window.location.href = '/'}>
                    Home
                  </button>
                  <button className="nav-button" onClick={() => window.location.href = '/rooms'}>
                    Zones
                  </button>
                  <button className="nav-button" onClick={() => window.location.href = '/watchlist'}>
                    My Watchlist
                  </button>
                  <button className="nav-button" onClick={() => window.location.href = '/trivia'}>
                    Movie Trivia
                  </button>
                  <button className="nav-button" onClick={() => window.location.href = '/profile'}>
                    Profile
                  </button>
                  <button className="theme-toggle" onClick={toggleTheme}>
                    {theme === 'dark' ? '🌙' : '☀️'}
                  </button>
                </div>
                <div className="user-info">
                  <span className="user-welcome">Welcome, {user?.username}!</span>
                  <button className="logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </header>
            }
          />
        </Routes>

        <main className="main">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  isAuthenticated={isAuthenticated}
                  onLogout={handleLogout}
                  onNavigate={handleNavigate}
                />
              }
            />
            <Route
              path="/login"
              element={<Login onLogin={handleLogin} onCancel={() => window.location.href = '/'} />}
            />
            <Route
              path="/rooms"
              element={
                <ProtectedRoute>
                  <RoomList onRoomSelect={handleRoomSelect} user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/room/:roomId"
              element={
                <ProtectedRoute>
                  <div>
                    <button className="back-button" onClick={() => window.location.href = '/rooms'}>
                      ← Back to Zones
                    </button>
                    <RoomLoader user={user} onLeaveRoom={handleLeaveRoom} />
                  </div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/watchlist"
              element={
                <ProtectedRoute>
                  <UserWatchlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trivia"
              element={
                <ProtectedRoute>
                  <Trivia standalone={true} user={user} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;