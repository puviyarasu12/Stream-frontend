import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import RoomList from './components/RoomList';
import UserWatchlist from './components/UserWatchlist';
import Trivia from './components/Trivia';
import Home from './components/Home';
import RoomLoader from './components/RoomLoader';
import Profile from './components/Profile';
import AiSummary from './components/AiSummary';
import api from './utils/api';
import './App.css';

const ProtectedRoute = ({ user, children }) => {
  return user ? children : <Navigate to="/" />;
};

const AppContent = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const navigate = useNavigate();
  const location = useLocation();

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
          if (error.response?.status === 401 || error.response?.status === 403) {
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

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  const handleNavigate = (view) => {
    navigate(`/${view === 'home' ? '' : view}`);
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={`app ${theme}-theme`}>
      {user && location.pathname !== '/' && (
        <header className="header">
          <h1 className="title">StreamNest</h1>
          <div className="nav-buttons">
            <button onClick={() => navigate('/')}>Home</button>
            <button onClick={() => navigate('/rooms')}>Zones</button>
            <button onClick={() => navigate('/watchlist')}>My Watchlist</button>
            <button onClick={() => navigate('/trivia')}>Movie Trivia</button>
            <button onClick={() => navigate('/profile')}>Profile</button>
            <button onClick={() => navigate('/ai-summary')}>AI MovieInsight
</button>
            <button className="theme-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? '🌙' : '☀️'}
            </button>
          </div>
          <div className="user-info">
            <span>Welcome, {user.username}!</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>
      )}

      <main className="main">
        <Routes>
          <Route path="/" element={<Home isAuthenticated={!!user} onLogout={handleLogout} onNavigate={handleNavigate} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} onCancel={() => navigate('/')} />} />
          <Route path="/rooms" element={<ProtectedRoute user={user}><RoomList onRoomSelect={(room) => navigate(`/room/${room._id}`)} user={user} /></ProtectedRoute>} />
          <Route path="/room/:roomId" element={<ProtectedRoute user={user}><><button onClick={() => navigate('/rooms')}>← Back to Zones</button><RoomLoader user={user} onLeaveRoom={() => navigate('/rooms')} /></></ProtectedRoute>} />
          <Route path="/watchlist" element={<ProtectedRoute user={user}><UserWatchlist /></ProtectedRoute>} />
          <Route path="/trivia" element={<ProtectedRoute user={user}><Trivia standalone={true} user={user} /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute user={user}><Profile user={user} onLogout={handleLogout} onUpdateUser={setUser} /></ProtectedRoute>} />
          <Route path="/ai-summary" element={<ProtectedRoute user={user}><AiSummary /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
