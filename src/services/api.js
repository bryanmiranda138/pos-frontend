import axios from 'axios';
//espero funcione
// 1. Si existe la variable en Vercel, úsala.
// 2. Si no existe pero estamos en Producción (Vercel), usa Render directamente.
// 3. Solo si estamos programando localmente en la PC, usa localhost.
const API_URL = import.meta.env.VITE_API_URL || (
    import.meta.env.PROD
        ? 'https://pos-backend-api-8cks.onrender.com/api'
        : 'http://localhost:3000/api'
);

const api = axios.create({
    baseURL: API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;