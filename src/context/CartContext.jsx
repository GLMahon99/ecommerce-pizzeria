import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useTenant } from './TenantContext';
import api from '../api/axiosConfig';
import { calcularPromos } from '../utils/promos';

const CartContext = createContext();

const getSlugFromPath = () => {
    const pathParts = window.location.pathname.split('/');
    return pathParts[1] || 'default';
};

export const CartProvider = ({ children }) => {
    const { tenant } = useTenant();
    const slug = tenant?.slug || getSlugFromPath();
    const cartKey = `pizza_cart_${slug}`;
    const activeSlugRef = useRef(slug);

    // Estado inicial: intentamos cargar del LocalStorage o empezamos con array vacío
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem(cartKey);
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    // Cargar el carrito correspondiente cuando cambia la tienda (slug)
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(cartKey);
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            setCart(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
            setCart([]);
        }
        activeSlugRef.current = slug;
    }, [cartKey, slug]);

    // Cada vez que el carrito cambie, lo guardamos en el storage de la tienda activa
    useEffect(() => {
        if (activeSlugRef.current === slug) {
            localStorage.setItem(cartKey, JSON.stringify(cart));
        }
    }, [cart, cartKey, slug]);

    // Función para agregar o incrementar cantidad (qty > 1 desde la ventana de armado)
    const addToCart = (product, qty = 1) => {
        // Obtenemos el cartItemId (si viene) o creamos uno por defecto seguro.
        const cId = product.cartItemId || String(product.id_producto);
        
        setCart((prev) => {
            const existing = prev.find((item) => (item.cartItemId || String(item.id_producto)) === cId);
            if (existing) {
                return prev.map((item) =>
                    (item.cartItemId || String(item.id_producto)) === cId
                        ? { ...item, quantity: item.quantity + qty }
                        : item
                );
            }
            return [...prev, { ...product, quantity: qty, cartItemId: cId }];
        });
    };

    // Función para restar cantidad (si llega a 0 se elimina)
    const decrementQuantity = (cId) => {
        setCart((prev) =>
            prev
                .map((item) =>
                    (item.cartItemId || String(item.id_producto)) === String(cId) ? { ...item, quantity: item.quantity - 1 } : item
                )
                .filter((item) => item.quantity > 0)
        );
    };

    // Eliminar producto por completo (el tachito de basura)
    const removeFromCart = (cId) => {
        setCart((prev) => prev.filter((item) => (item.cartItemId || String(item.id_producto)) !== String(cId)));
    };

    // Aclaración del comprador en un ítem (ej: "sin rúcula").
    // El ítem pasa a tener su propio ID, así el agregado rápido de la tarjeta crea otro sin aclaración;
    // si ya había uno idéntico con la misma aclaración, se juntan.
    const setObservacion = (cId, texto) => {
        const observacion = String(texto || '').trim().slice(0, 150);
        setCart((prev) => {
            const item = prev.find((i) => (i.cartItemId || String(i.id_producto)) === String(cId));
            if (!item) return prev;
            const base = String(item.cartItemId || item.id_producto).split('#obs:')[0];
            const nuevoId = observacion ? `${base}#obs:${observacion.toLowerCase()}` : base;
            const resto = prev.filter((i) => i !== item);
            const igual = resto.find((i) => (i.cartItemId || String(i.id_producto)) === nuevoId);
            if (igual) {
                return resto.map((i) => (i === igual ? { ...i, quantity: i.quantity + item.quantity } : i));
            }
            return prev.map((i) => (i === item ? { ...i, observacion: observacion || undefined, cartItemId: nuevoId } : i));
        });
    };

    // Vaciar carrito (después de una compra exitosa)
    const clearCart = useCallback(() => setCart([]), []);

    // Promociones vigentes del local: se refrescan cada 5 minutos y al volver a la pestaña
    // Se guardan junto al slug para no mostrar las de otra tienda mientras carga
    const [promosState, setPromosState] = useState({ slug: null, lista: [] });
    const promos = promosState.slug === slug ? promosState.lista : [];
    const refreshPromos = useCallback(async () => {
        if (!slug || slug === 'default') return [];
        try {
            const { data } = await api.get('/promociones');
            const lista = Array.isArray(data) ? data : [];
            setPromosState({ slug, lista });
            return lista;
        } catch (e) {
            console.error('Error al cargar promociones:', e);
            return [];
        }
    }, [slug]);

    useEffect(() => {
        refreshPromos();
        const id = setInterval(refreshPromos, 5 * 60 * 1000);
        const onVisible = () => { if (document.visibilityState === 'visible') refreshPromos(); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            clearInterval(id);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, [refreshPromos]);

    // Cálculos derivados
    const total = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    // Descuento por promociones (el servidor vuelve a calcularlo al comprar)
    const { lineas: lineasPromo, total: descuento } = calcularPromos(
        cart.map((item) => ({ id_producto: item.id_producto, cantidad: item.quantity, precio: item.precio })),
        promos
    );
    const totalNeto = Math.round((total - descuento) * 100) / 100;
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decrementQuantity,
                removeFromCart,
                setObservacion,
                clearCart,
                total,
                itemCount,
                promos,
                refreshPromos,
                lineasPromo,
                descuento,
                totalNeto
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe ser usado dentro de un CartProvider');
    }
    return context;
};