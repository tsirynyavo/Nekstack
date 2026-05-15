import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(' Token envoyé:', token.substring(0, 20) + '...');
    } else {
      console.warn(' Aucun token dans localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;