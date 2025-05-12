import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import '../styles/login.css';

const Login = ({ onLogin, onCancel }) => {
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  // New state for popup visibility and message
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Remove the /api prefix since it's already in the baseURL
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      console.log('Submitting to endpoint:', endpoint);
      const response = await api.post(endpoint, formData);
      if (isRegister && response.data.registrationSuccess) {
        setPopupMessage('Registration successful! Please log in.');
        setPopupVisible(true);
        console.log('Registration successful, showing popup');
        // Do not switch form here, wait for popup close
      } else if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        // Fetch user info after login
        try {
          const userResponse = await api.get('/auth/me');
          onLogin(userResponse.data);
        } catch (err) {
          console.error('Failed to fetch user info after login:', err);
          onLogin(null);
        }
        console.log('Login successful, navigating to /rooms');
        navigate('/rooms');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(error.response?.data?.error || 'An error occurred');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Close popup handler: hide popup and switch to login form
  const closePopup = () => {
    setPopupVisible(false);
    setIsRegister(false);
  };

  return (
    <div className="login-container">
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <div className="button-group">
          <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
          {onCancel && (
            <button type="button" onClick={onCancel}>Back to Home</button>
          )}
        </div>
      </form>
      <button
        className="toggle-auth"
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
      </button>

      {/* Custom popup/modal */}
      {popupVisible && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={closePopup}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
