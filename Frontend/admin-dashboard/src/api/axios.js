import axios from 'axios';

// Prefer explicit backend URL from env in production; fallback to CRA proxy in dev
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
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
