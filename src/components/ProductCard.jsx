import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Segmented from './Segmented';
import ArmarProductoSheet from './ArmarProductoSheet';

const ProductCard = ({ product, index = 0 }) => {
    const { cart, addToCart, decrementQuantity } = useCart();

    // Pizza con tamaño chico cargado: selector Chica / Grande ('Principal' = grande, igual que en carritos guardados)
    const pizza = product.tipo === 'PIZZA' ? product.pizza : null;
    const hasVariants = pizza?.precio_chica != null;
    // Helado y hamburguesa se arman en una ventana (gustos, guarnición, toppings...)
    const seArma = product.tipo === 'HELADO' || product.tipo === 'HAMBURGUESA';

    const [selectedVariant, setSelectedVariant] = useState('Principal');
    const [isExpanded, setIsExpanded] = useState(false);
    const [armando, setArmando] = useState(false);

    const currentPrice = hasVariants && selectedVariant === 'Chica'
        ? pizza.precio_chica
        : Number(pizza ? pizza.precio_grande : product.precio);

    // Generar ID único para el carrito si tiene variantes
    const cartItemId = hasVariants ? `${product.id_producto}-${selectedVariant}` : String(product.id_producto);

    const cartItem = cart.find((item) => (item.cartItemId || String(item.id_producto)) === cartItemId);
    // Los productos que se arman tienen una línea por combinación: se cuenta el total del producto
    const quantity = seArma
        ? cart.filter(item => item.id_producto === product.id_producto).reduce((acc, item) => acc + item.quantity, 0)
        : (cartItem ? cartItem.quantity : 0);

    const handleAddToCart = () => {
        if (seArma) {
            setArmando(true);
            return;
        }
        addToCart({
            ...product,
            precio: currentPrice, // el precio final
            tamano: hasVariants ? selectedVariant : null,
            cartItemId
        });
    };

    return (
        <article
            className="rise-in group flex sm:flex-col h-full bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]"
            style={{ '--i': Math.min(index, 12) }}
        >
            <div className="relative shrink-0 w-28 self-stretch min-h-28 sm:w-auto sm:self-auto sm:min-h-0 sm:aspect-[4/3] overflow-hidden bg-surface-2">
                <img
                    src={product.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500'}
                    alt={product.nombre}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out motion-safe:[@media(hover:hover)]:group-hover:scale-105"
                />
            </div>

            <div className="p-3.5 sm:p-5 flex flex-col flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1">
                    <h3 className="font-display text-base sm:text-lg font-bold text-brand-secondary leading-snug">{product.nombre}</h3>
                    <span className="tabular font-display text-base sm:text-lg font-extrabold text-brand-secondary shrink-0">
                        ${parseFloat(currentPrice).toLocaleString()}
                    </span>
                </div>

                <div className="mb-3 sm:mb-5">
                    <p className={`text-muted text-[13px] sm:text-sm leading-snug sm:leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {product.descripcion || 'Sin descripción disponible.'}
                    </p>
                    {product.descripcion && product.descripcion.length > 70 && (
                        <button
                            type="button"
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="text-brand-secondary text-xs font-semibold underline underline-offset-4 decoration-line hover:decoration-brand mt-0.5 py-1.5 cursor-pointer"
                        >
                            {isExpanded ? 'Ver menos' : 'Ver más'}
                        </button>
                    )}
                </div>

                {hasVariants && (
                    <Segmented
                        value={selectedVariant}
                        onChange={setSelectedVariant}
                        options={[['Chica', 'Chica'], ['Grande', 'Principal']]}
                    />
                )}

                <div className="mt-auto">
                    {quantity > 0 && !seArma ? (
                        <div className="w-full flex items-center justify-between bg-brand/10 p-1 rounded-xl">
                            <button
                                onClick={() => decrementQuantity(cartItemId)}
                                aria-label="Quitar uno"
                                className="press w-11 h-11 flex items-center justify-center bg-white text-brand-secondary rounded-lg shadow-sm"
                            >
                                <Minus size={18} />
                            </button>
                            <span className="tabular font-bold text-brand-secondary text-lg w-10 text-center">{quantity}</span>
                            <button
                                onClick={handleAddToCart}
                                aria-label="Agregar uno más"
                                className="press w-11 h-11 flex items-center justify-center bg-brand text-on-brand rounded-lg hover:bg-brand-hover shadow-sm"
                            >
                                <Plus size={18} />
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            className="press w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand hover:text-on-brand text-white h-12 rounded-xl font-semibold text-sm"
                        >
                            <Plus size={18} />
                            {seArma
                                ? (quantity > 0 ? `Agregar otro · ${quantity} en tu pedido` : 'Elegir y agregar')
                                : 'Agregar'}
                        </button>
                    )}
                </div>
            </div>

            {armando && <ArmarProductoSheet product={product} onClose={() => setArmando(false)} />}
        </article>
    );
};

export default ProductCard;
