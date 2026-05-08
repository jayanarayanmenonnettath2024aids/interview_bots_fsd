import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ai_interview_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function setAuthSession(token, user) {
  localStorage.setItem('ai_interview_token', token);
  localStorage.setItem('ai_interview_user', JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem('ai_interview_token');
  localStorage.removeItem('ai_interview_user');
}

export function getStoredUser() {
  const user = localStorage.getItem('ai_interview_user');
  return user ? JSON.parse(user) : null;
}

export default api;
