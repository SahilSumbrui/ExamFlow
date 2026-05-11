import axios from 'axios';

const API = axios.create({
  // If we are in production, use a relative path. If local, use localhost.
  baseURL: import.meta.env.MODE === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default API;