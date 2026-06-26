import { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const TenantContext = createContext();

export const TenantProvider = ({ children }) => {
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const fetchTenantConfig = async () => {
            try {
                // Obtenemos el slug de la URL (ej: /la-nona/productos -> la-nona)
                const pathParts = location.pathname.split('/');
                const slug = pathParts[1]; // El primer segmento tras el dominio

                if (!slug) {
                    setTenant(null);
                    setError(null);
                    setLoading(false);
                    return;
                }

                // Configurar URL del backend (usando el nombre correcto de tu .env)
                const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://pizzeria-ecommerce-production.up.railway.app/api';

                const response = await axios.get(`${apiUrl}/admin/config`, {
                    headers: { 'x-tenant': slug }
                });

                const config = response.data;
                config.slug = slug;
                setTenant(config);

                // Aplicar Branding con log para debug
                console.log('Aplicando color de pizzería:', config.color_primario);

                if (config.color_primario) {
                    document.documentElement.style.setProperty('--brand-color', config.color_primario);
                    document.documentElement.style.setProperty('--brand-hover', config.color_primario + 'DD');
                }

                if (config.color_secundario) {
                    document.documentElement.style.setProperty('--brand-secondary', config.color_secundario);
                }

                if (config.nombre) document.title = config.nombre;

                if (config.logo_url) {
                    let link = document.querySelector("link[rel~='icon']");
                    if (!link) {
                        link = document.createElement('link');
                        link.rel = 'icon';
                        document.head.appendChild(link);
                    }
                    link.href = config.logo_url;
                    link.type = config.logo_url.toLowerCase().endsWith('.svg') ? 'image/svg+xml' : 'image/png';
                }

                setLoading(false);
            } catch (err) {
                console.error('Error identificando pizzería:', err);
                setError('No pudimos encontrar esta pizzería.');
                setLoading(false);
            }
        };

        fetchTenantConfig();
    }, [location.pathname]); // SE RECARGA SI CAMBIA LA URL

    return (
        <TenantContext.Provider value={{ tenant, loading, error }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
