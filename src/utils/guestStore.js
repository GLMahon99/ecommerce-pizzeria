// Persistencia local (por dispositivo y por tienda) de los datos del comprador y sus pedidos.
// No hay sesión: el servidor solo conoce al cliente por DNI/teléfono/email al momento de comprar.

const read = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};

const write = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Storage no disponible (modo privado, cuota): la compra sigue funcionando igual
    }
};

export const getBuyer = (slug) => read(`acommerr_buyer_${slug}`, null);
export const saveBuyer = (slug, buyer) => write(`acommerr_buyer_${slug}`, buyer);

export const getOrderTokens = (slug) => read(`acommerr_orders_${slug}`, []);
export const addOrderToken = (slug, token) => {
    const tokens = getOrderTokens(slug).filter((t) => t !== token);
    write(`acommerr_orders_${slug}`, [token, ...tokens].slice(0, 20));
};
