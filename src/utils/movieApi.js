// src/utils/movieApi.js
import axios from 'axios';

export const getMovieSummary = (movieName) => {
  return axios.post('http://localhost:5000/api/movies/summary', { movieName });
};
