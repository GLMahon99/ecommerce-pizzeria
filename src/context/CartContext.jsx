import { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useTenant } from './TenantContext';

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

    // Función para agregar o incrementar cantidad
    const addToCart = (product) => {
        // Obtenemos el cartItemId (si viene) o creamos uno por defecto seguro.
        const cId = product.cartItemId || String(product.id_producto);
        
        setCart((prev) => {
            const existing = prev.find((item) => (item.cartItemId || String(item.id_producto)) === cId);
            if (existing) {
                return prev.map((item) =>
                    (item.cartItemId || String(item.id_producto)) === cId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { ...product, quantity: 1, cartItemId: cId }];
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

    // Vaciar carrito (después de una compra exitosa)
    const clearCart = useCallback(() => setCart([]), []);

    // Cálculos derivados (Data Analysis puro)
    const total = cart.reduce((acc, item) => acc + item.precio * item.quantity, 0);
    const itemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                addToCart,
                decrementQuantity,
                removeFromCart,
                clearCart,
                total,
                itemCount
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