import axios from 'axios';

// Creamos una instancia de axios configurada con la URL de tu backend
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

// "Interceptor": Antes de que cualquier petición salga, le inyectamos el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;