import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://pizzeria-ecommerce-production.up.railway.app/api',
});

export default api;
