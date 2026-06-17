import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://pizzeria-ecommerce-production.up.railway.app/api',
});

// Interceptor para inyectar el tenant y el token automáticamente según la URL e iniciar sesión
api.interceptors.request.use((config) => {
    const pathParts = window.location.pathname.split('/');
    const slug = pathParts[1]; 

    if (slug) {
        config.headers['x-tenant'] = slug;
    }

    const token = localStorage.getItem('pizzeria_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
});

// Interceptor para manejar respuestas de error (ej. token JWT expirado o inválido)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            // Limpiar credenciales del localStorage
            localStorage.removeItem('pizzeria_token');
            localStorage.removeItem('pizzeria_user');

            const pathParts = window.location.pathname.split('/');
            const slug = pathParts[1];

            // Si hay un slug y no estamos ya en la página de login, redirigir
            if (slug && !window.location.pathname.endsWith('/login')) {
                window.location.href = `/${slug}/login`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;
