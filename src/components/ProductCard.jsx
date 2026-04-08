import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
    const { cart, addToCart, decrementQuantity } = useCart();

    const isPizza = product.categoria === 'Pizzas';
    const [selectedSize, setSelectedSize] = useState('Grande');

    // Mmock price rule: Chica es más barata
    const currentPrice = isPizza && selectedSize === 'Chica' ? product.precio * 0.7 : product.precio;
    
    // Generar ID único para el carrito si tiene tamaño
    const cartItemId = isPizza ? `${product.id_producto}-${selectedSize}` : String(product.id_producto);

    const cartItem = cart.find((item) => (item.cartItemId || String(item.id_producto)) === cartItemId);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleAddToCart = () => {
        addToCart({
            ...product,
            precio: currentPrice, // el precio final
            tamano: isPizza ? selectedSize : null,
            cartItemId
        });
    };

    return (
        <div className="bg-white rounded-[2rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden">
            {/* Imagen con Badge de Precio */}
            <div className="relative h-52 overflow-hidden">
                <img
                    src={product.imagen_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=500'}
                    alt={product.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-2xl shadow-sm">
                    <span className="text-orange-600 font-black text-lg">${currentPrice.toLocaleString()}</span>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{product.nombre}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-2">
                    {product.descripcion || 'Sin descripción disponible.'}
                </p>

                {/* Selectores de Tamaño (Solo para Pizza) */}
                {isPizza && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
                        <button
                            onClick={() => setSelectedSize('Chica')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedSize === 'Chica' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            Chica
                        </button>
                        <button
                            onClick={() => setSelectedSize('Grande')}
                            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${selectedSize === 'Grande' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            Grande
                        </button>
                    </div>
                )}

                {/* Botón de Acción */}
                {quantity > 0 ? (
                    <div className="w-full flex items-center justify-between bg-orange-50 border border-orange-100 py-2 px-2 rounded-2xl">
                        <button onClick={() => decrementQuantity(cartItemId)} className="p-2 bg-white text-orange-600 rounded-xl hover:bg-orange-100 shadow-sm transition-all active:scale-95">
                            <Minus size={20} />
                        </button>
                        <span className="font-black text-gray-800 text-lg w-8 text-center">{quantity}</span>
                        <button onClick={handleAddToCart} className="p-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 shadow-sm transition-all active:scale-95">
                            <Plus size={20} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleAddToCart}
                        className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold transition-all active:scale-95"
                    >
                        <Plus size={20} /> Agregar
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProductCard;