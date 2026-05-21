import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sehat_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle 401 & refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('sehat_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
          localStorage.setItem('sehat_token', data.token);
          localStorage.setItem('sehat_refresh_token', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (err) {
        localStorage.removeItem('sehat_token');
        localStorage.removeItem('sehat_refresh_token');
        localStorage.removeItem('sehat_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
