import axios from 'axios';

// Axios instance pointing to backend routes via CRA proxy
const api = axios.create({
  baseURL: '/api',
});

// Attach JWT if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
