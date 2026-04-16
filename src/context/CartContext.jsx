import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Estado inicial: intentamos cargar del LocalStorage o empezamos con array vacío
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('pizza_cart');
            const parsed = savedCart ? JSON.parse(savedCart) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    });

    // Cada vez que el carrito cambie, lo guardamos en el storage (Persistencia)
    useEffect(() => {
        localStorage.setItem('pizza_cart', JSON.stringify(cart));
    }, [cart]);

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