// src/utils/movieApi.js
import axios from 'axios';

// Create a reusable axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || (
    process.env.NODE_ENV === 'production'
      ? 'https://stream-backend-wxa4.onrender.com/api'
      : 'http://localhost:5000/api'
  ),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Authorization token to every request if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getMovieSummary = async (question) => {
  const response = await api.post('/movies/summary', { question });
  return response.data;
};

export default api;
