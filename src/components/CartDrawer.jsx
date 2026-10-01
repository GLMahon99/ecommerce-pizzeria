import { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2, Bike } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = ({ isOpen, onClose }) => {
    const { cart, addToCart, decrementQuantity, removeFromCart, total } = useCart();
    const { tenant, localAbierto } = useTenant();
    const navigate = useNavigate();
    const [closing, setClosing] = useState(false);

    const requestClose = (after) => {
        setClosing(true);
        setTimeout(() => {
            setClosing(false);
            onClose();
            if (typeof after === 'function') after();
        }, 200);
    };

    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e) => { if (e.key === 'Escape') requestClose(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    let shippingCost = Number(tenant?.costo_envio || 0);
    if (tenant?.envio_gratis_desde && total >= Number(tenant.envio_gratis_desde)) {
        shippingCost = 0;
    }
    const finalTotal = total + shippingCost;
    const missingForFree = tenant?.envio_gratis_desde ? Number(tenant.envio_gratis_desde) - total : 0;
    const freeProgress = tenant?.envio_gratis_desde
        ? Math.min(100, Math.max(0, (total / Number(tenant.envio_gratis_desde)) * 100))
        : 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true" aria-label="Tu pedido">
            <div
                className={`absolute inset-0 bg-stone-900/40 ${closing ? 'fade-out' : 'fade-in'}`}
                onClick={() => requestClose()}
            />

            <div className={`absolute top-0 right-0 h-[100dvh] w-full max-w-md bg-surface shadow-2xl flex flex-col ${closing ? 'drawer-out' : 'drawer-in'}`}>

                <div className="px-6 h-[72px] border-b border-line flex justify-between items-center shrink-0">
                    <h2 className="font-display text-2xl font-extrabold text-brand-secondary tracking-tight">Tu pedido</h2>
                    <button
                        onClick={() => requestClose()}
                        aria-label="Cerrar"
                        className="press w-11 h-11 -mr-2 flex items-center justify-center text-muted hover:text-brand-secondary rounded-full"
                    >
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                            <ShoppingBag size={40} strokeWidth={1.5} className="text-brand" aria-hidden="true" />
                            <div>
                                <p className="font-display text-xl font-bold text-brand-secondary">Todavía no elegiste nada</p>
                                <p className="text-muted text-sm mt-1">Sumá productos del menú y aparecen acá.</p>
                            </div>
                            <button
                                onClick={() => requestClose()}
                                className="press mt-2 px-5 py-2.5 rounded-xl bg-brand-secondary text-white text-sm font-semibold"
                            >
                                Ver el menú
                            </button>
                        </div>
                    ) : (
                        <ul className="divide-y divide-line">
                            {cart.map((item) => {
                                const id = item.cartItemId || item.id_producto;
                                return (
                                    <li key={id} className="flex gap-4 py-5 first:pt-0">
                                        <div className="w-20 h-20 bg-surface-2 rounded-xl overflow-hidden shrink-0">
                                            <img
                                                src={item.img || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=500'}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 flex flex-col justify-between min-w-0">
                                            <div className="flex justify-between gap-2">
                                                <div className="min-w-0">
                                                    <h3 className="font-display font-bold text-brand-secondary leading-tight">{item.nombre}</h3>
                                                    {item.tamano && item.tamano !== 'Normal' && item.tamano !== 'Principal' && (
                                                        <span className="text-xs text-muted">{item.tamano}</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(id)}
                                                    aria-label={`Quitar ${item.nombre}`}
                                                    className="press text-muted hover:text-red-600 h-fit p-2.5 -m-2.5"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>

                                            <div className="flex justify-between items-center mt-2">
                                                <div className="flex items-center bg-white rounded-lg border border-line">
                                                    <button onClick={() => decrementQuantity(id)} aria-label="Quitar uno" className="press w-10 h-10 flex items-center justify-center text-brand-secondary"><Minus size={14} /></button>
                                                    <span className="tabular font-bold text-sm w-5 text-center">{item.quantity}</span>
                                                    <button onClick={() => addToCart(item)} aria-label="Agregar uno más" className="press w-10 h-10 flex items-center justify-center text-brand-secondary"><Plus size={14} /></button>
                                                </div>
                                                <span className="tabular font-bold text-brand-secondary">${(item.precio * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="px-6 pt-5 pb-6 bg-white border-t border-line space-y-3 shrink-0 pb-safe">
                        {shippingCost > 0 && tenant?.envio_gratis_desde && (
                            <div className="pb-2">
                                <p className="flex items-center gap-2 text-sm text-brand-secondary mb-2">
                                    <Bike size={16} className="text-brand" aria-hidden="true" />
                                    Sumá <strong className="tabular">${missingForFree.toLocaleString()}</strong> y el envío es gratis
                                </p>
                                <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                                    <div
                                        className="h-full bg-brand rounded-full transition-[width] duration-300"
                                        style={{ width: `${freeProgress}%`, transitionTimingFunction: 'var(--ease-out)' }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between text-sm text-muted">
                            <span>Subtotal</span>
                            <span className="tabular">${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted">
                            <span>Envío</span>
                            <span className={`tabular ${shippingCost === 0 ? 'text-green-700 font-semibold' : ''}`}>
                                {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline border-t border-line pt-3">
                            <span className="font-semibold text-brand-secondary">Total</span>
                            <span className="tabular font-display text-2xl font-extrabold text-brand-secondary">${finalTotal.toLocaleString()}</span>
                        </div>

                        {!localAbierto && (
                            <p role="alert" className="bg-red-50 text-red-900 rounded-xl p-3 text-sm font-medium">
                                {tenant?.estado?.mensaje || 'El local está cerrado.'}
                            </p>
                        )}
                        <button
                            onClick={() => requestClose(() => navigate(`/${tenant?.slug}/checkout`))}
                            disabled={!localAbierto}
                            className="press w-full bg-brand hover:bg-brand-hover text-on-brand h-14 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {localAbierto ? 'Finalizar compra' : 'Local cerrado'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartDrawer;
