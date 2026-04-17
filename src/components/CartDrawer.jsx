import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext'; // Importar Tenant
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, addToCart, decrementQuantity, removeFromCart, total } = useCart();
    const { tenant } = useTenant(); // Obtener los datos de la pizzería
    const navigate = useNavigate();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Overlay oscuro (Click afuera para cerrar) */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <div className="absolute top-0 right-0 h-[100dvh] w-full max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-brand" size={24} />
                        <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">Tu Pedido</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Lista de Productos (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="bg-brand/10 p-6 rounded-full">
                                <ShoppingBag size={48} className="text-brand/30" />
                            </div>
                            <p className="text-gray-400 font-bold">Tu carrito está vacío.<br />¡Pedite una de Muzza!</p>
                        </div>
                    ) : (
                        cart.map((item) => (
                            <div key={item.cartItemId || item.id_producto} className="flex gap-4">
                                <div className="w-20 h-20 bg-gray-100 rounded-2xl overflow-hidden shrink-0">
                                    <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-800 leading-tight">{item.nombre}</h3>
                                            {item.tamano && <span className="text-[10px] uppercase font-black text-brand tracking-widest">{item.tamano}</span>}
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartItemId || item.id_producto)} className="text-gray-300 hover:text-red-500 h-fit">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                                            <button onClick={() => decrementQuantity(item.cartItemId || item.id_producto)} className="text-brand hover:scale-125 transition-transform"><Minus size={14} /></button>
                                            <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                                            <button onClick={() => addToCart(item)} className="text-brand hover:scale-125 transition-transform"><Plus size={14} /></button>
                                        </div>
                                        <span className="font-black text-gray-800">${(item.precio * item.quantity).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer con el Total */}
                {cart.length > 0 && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4 shrink-0 pb-safe">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-bold uppercase text-xs tracking-widest">Subtotal</span>
                            <span className="text-2xl font-black text-gray-800">${total.toLocaleString()}</span>
                        </div>

                        <p className="text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                            🛵 Envío sin cargo en Florida y cercanías
                        </p>

                        <button
                            onClick={() => {
                                onClose();
                                navigate(`/${tenant?.slug}/checkout`);
                            }}
                            className="w-full bg-brand hover:bg-brand-hover text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-brand/20 transition-all active:scale-95"
                        >
                            Finalizar Compra
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;