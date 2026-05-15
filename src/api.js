import axios from 'axios';

const api = axios.create({
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur - Ajout token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vanquaire_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur - Gestion erreurs et refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('vanquaire_token');
      localStorage.removeItem('vanquaire_user');
      window.location.href = '/';
    }
    
    if (error.code === 'ERR_NETWORK') {
      console.warn('⚠️ Mode offline - Utilisation du cache');
    }
    
    return Promise.reject(error);
  }
);

export default api;