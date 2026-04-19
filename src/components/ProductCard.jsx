import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { cart, addToCart, decrementQuantity } = useCart();

    const isPizza = product.categoria === 'Pizzas';
    const isHelado = product.categoria === 'Helados';
    const hasVariants = (product.precio_chica !== null && product.precio_chica !== undefined) || (product.precio_cuarto !== null && product.precio_cuarto !== undefined);
    
    const [selectedVariant, setSelectedVariant] = useState(isPizza || isHelado ? 'Principal' : 'Normal');

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
        <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* Imagen con Badge de Precio */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={product.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500'}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-sm">
                    <span className="text-brand font-black text-lg">${parseFloat(currentPrice).toLocaleString()}</span>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-brand-secondary mb-2">{product.nombre}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {product.descripcion || 'Sin descripción disponible.'}
                </p>

                {/* Selectores de Variante Helados (3 opciones) */}
                {isHelado && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4 text-[10px]">
                        <button
                            onClick={() => setSelectedVariant('1/4 kg')}
                            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${selectedVariant === '1/4 kg' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            1/4 kg
                        </button>
                        <button
                            onClick={() => setSelectedVariant('1/2 kg')}
                            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${selectedVariant === '1/2 kg' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            1/2 kg
                        </button>
                        <button
                            onClick={() => setSelectedVariant('Principal')}
                            className={`flex-1 py-1.5 font-bold rounded-lg transition-all ${selectedVariant === 'Principal' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            1 kg
                        </button>
                    </div>
                )}

                {/* Selectores de Variante Pizzas (2 opciones) */}
                {isPizza && product.precio_chica && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button
                            onClick={() => setSelectedVariant('Chica')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedVariant === 'Chica' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            Chica
                        </button>
                        <button
                            onClick={() => setSelectedVariant('Principal')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedVariant === 'Principal' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            Grande
                        </button>
                    </div>
                )}

                {/* Selectores Genéricos si tiene precio_chica pero no es ni Pizza ni Helado */}
                {!isPizza && !isHelado && hasVariants && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button
                            onClick={() => setSelectedVariant('Opción 2')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedVariant === 'Opción 2' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            Secundario
                        </button>
                        <button
                            onClick={() => setSelectedVariant('Normal')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedVariant === 'Normal' ? 'bg-white text-brand shadow-sm' : 'text-gray-400'}`}
                        >
                            Principal
                        </button>
                    </div>
                )}

                {/* Botón de Acción */}
                {quantity > 0 ? (
                    <div className="w-full flex items-center justify-between bg-brand/10 border border-brand/20 py-2 px-2 rounded-2xl">
                        <button onClick={() => decrementQuantity(cartItemId)} className="p-2 bg-white text-brand rounded-xl hover:bg-brand/10 shadow-sm transition-all active:scale-95">
                            <Minus size={20} />
                        </button>
                        <span className="font-black text-brand-secondary text-lg w-8 text-center">{quantity}</span>
                        <button onClick={handleAddToCart} className="p-2 bg-brand text-white rounded-xl hover:bg-brand-hover shadow-sm transition-all active:scale-95">
                            <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-brand text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                    >
                        <Plus size={20} /> Agregar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;