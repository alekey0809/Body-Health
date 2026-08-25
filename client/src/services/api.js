import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
});

// Interceptor para inyectar el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Intercalar token CSRF si está disponible en meta tags
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  if (csrfToken && !config.headers['X-CSRF-Token']) {
    config.headers['X-CSRF-Token'] = csrfToken.getAttribute('content');
  }
  return config;
});

// Función helper para obtener headers con CSRF
export const getCsrfHeaders = () => {
  const csrfToken = document.querySelector('meta[name="csrf-token"]');
  return csrfToken ? { 'X-CSRF-Token': csrfToken.getAttribute('content') } : {};
};

export default api;
