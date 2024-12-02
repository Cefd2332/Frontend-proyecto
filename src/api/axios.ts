// src/api/axios.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://petracker.online/api', // Asegúrate de que esta es tu URL base
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token JWT a las solicitudes si es necesario
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Asegúrate de guardar el token al autenticar
  if (token) {
    if (config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
