import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://pizzeria-ecommerce-production.up.railway.app/api',
});

// Interceptor para inyectar el tenant automáticamente según la URL
api.interceptors.request.use((config) => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[1]; 

    if (slug) {
        config.headers['x-tenant'] = slug;
    }

    return config;
});

export default api;
