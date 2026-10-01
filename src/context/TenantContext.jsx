import { createContext, useState, useEffect, useContext, useCallback } from 'react';
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
                    document.documentElement.style.setProperty('--brand-hover', `color-mix(in oklab, ${config.color_primario} 88%, black)`);
                    // Texto legible sobre el color de marca (blanco u oscuro según luminancia)
                    const hex = /^#([0-9a-f]{6})$/i.exec(config.color_primario.trim());
                    if (hex) {
                        const n = parseInt(hex[1], 16);
                        const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
                        const lum = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
                        document.documentElement.style.setProperty('--brand-on', lum > 0.45 ? '#1c1917' : '#ffffff');
                    }
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

    // Estado abierto/cerrado del local: se refresca cada minuto (puede abrir o cerrar con la página abierta)
    const slugActual = tenant?.slug;
    const refreshEstado = useCallback(async () => {
        if (!slugActual) return;
        try {
            const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://pizzeria-ecommerce-production.up.railway.app/api';
            const response = await axios.get(`${apiUrl}/admin/config`, { headers: { 'x-tenant': slugActual } });
            setTenant(prev => (prev && prev.slug === slugActual ? { ...prev, estado: response.data.estado } : prev));
        } catch (err) {
            console.error('Error actualizando estado del local:', err);
        }
    }, [slugActual]);

    useEffect(() => {
        if (!slugActual) return;
        const id = setInterval(refreshEstado, 60 * 1000);
        return () => clearInterval(id);
    }, [slugActual, refreshEstado]);

    // Sin estado (backend viejo o error) se asume abierto: el servidor valida igual al comprar
    const localAbierto = tenant?.estado ? tenant.estado.abierto : true;

    return (
        <TenantContext.Provider value={{ tenant, loading, error, localAbierto, refreshEstado }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => useContext(TenantContext);
