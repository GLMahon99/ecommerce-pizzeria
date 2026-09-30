import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Segmented = ({ options, value, onChange }) => (
    <div className="flex bg-surface-2 p-1 rounded-xl mb-3 sm:mb-4" role="radiogroup">
        {options.map(([label, val]) => (
            <button
                key={val}
                role="radio"
                aria-checked={value === val}
                onClick={() => onChange(val)}
                className={`press flex-1 py-2.5 text-xs font-semibold rounded-lg ${value === val ? 'bg-white text-brand-secondary shadow-sm' : 'text-muted hover:text-brand-secondary'}`}
            >
                {label}
            </button>
        ))}
    </div>
);

const ProductCard = ({ product, index = 0 }) => {
    const { cart, addToCart, decrementQuantity } = useCart();

    const isPizza = product.categoria === 'Pizzas';
    const isHelado = product.categoria === 'Helados';
    const hasVariants = (product.precio_chica !== null && product.precio_chica !== undefined) || (product.precio_cuarto !== null && product.precio_cuarto !== undefined);

    const [selectedVariant, setSelectedVariant] = useState(isPizza || isHelado ? 'Principal' : 'Normal');
    const [isExpanded, setIsExpanded] = useState(false);

    const getCurrentPrice = () => {
        if (selectedVariant === 'Opción 2' || selectedVariant === 'Chica' || selectedVariant === '1/2 kg') return product.precio_chica;
        if (selectedVariant === '1/4 kg') return product.precio_cuarto;
        return product.precio;
    };

    const currentPrice = getCurrentPrice();

    // Generar ID único para el carrito si tiene variantes
    const cartItemId = hasVariants ? `${product.id_producto}-${selectedVariant}` : String(product.id_producto);

    const cartItem = cart.find((item) => (item.cartItemId || String(item.id_producto)) === cartItemId);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
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

                {isHelado && (
                    <Segmented
                        value={selectedVariant}
                        onChange={setSelectedVariant}
                        options={[['1/4 kg', '1/4 kg'], ['1/2 kg', '1/2 kg'], ['1 kg', 'Principal']]}
                    />
                )}

                {isPizza && product.precio_chica && (
                    <Segmented
                        value={selectedVariant}
                        onChange={setSelectedVariant}
                        options={[['Chica', 'Chica'], ['Grande', 'Principal']]}
                    />
                )}

                {!isPizza && !isHelado && hasVariants && (
                    <Segmented
                        value={selectedVariant}
                        onChange={setSelectedVariant}
                        options={[['Secundario', 'Opción 2'], ['Principal', 'Normal']]}
                    />
                )}

                <div className="mt-auto">
                    {quantity > 0 ? (
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
                            <Plus size={18} /> Agregar
                        </button>
                    )}
                </div>
            </div>
        </article>
    );
};

export default ProductCard;
