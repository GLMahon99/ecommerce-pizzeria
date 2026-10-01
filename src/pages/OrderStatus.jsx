import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    MapPin,
    UtensilsCrossed,
    Bike,
    MessageCircle,
    ChevronLeft,
    X
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { lineasDetallePedido } from '../utils/producto';
import { useTenant } from '../context/TenantContext'; // Importar Tenant

const OrderStatus = () => {
    const { result, token } = useParams();
    const { clearCart, cart } = useCart();
    const { tenant } = useTenant(); // Obtener datos del tenant
    const [status, setStatus] = useState('recibido'); 
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (result === 'success' && cart.length > 0) {
            clearCart();
        }
        if (result === 'failure' && token) {
            api.post(`/pedidos/seguimiento/${token}/rechazar`)
                .catch(err => console.error('Error al actualizar estado a Rechazado:', err));
        }
    }, [result, token, clearCart, cart.length]);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const response = await api.get(`/pedidos/seguimiento/${token}`);
                setOrderData(response.data);
                setStatus(response.data.estado.toLowerCase());
            } catch (error) {
                console.error('Error al cargar pedido:', error);
            } finally {
                setLoading(false);
            }
        };

        // Carga inicial
        fetchOrder();

        // Polling cada 10 segundos
        const interval = setInterval(fetchOrder, 10000);

        return () => clearInterval(interval);
    }, [token]);

    const isTakeaway = orderData?.metodo_entrega === 'takeaway';

    const steps = isTakeaway ? [
        { id: 'recibido', label: 'Pedido Recibido', icon: <CheckCircle2 size={20} />, subtext: 'Estamos preparando tu pedido' },
        { id: 'listo para retirar', label: 'Listo para retirar', icon: <UtensilsCrossed size={20} />, subtext: '¡Ya podés pasar a retirarlo!' },
        { id: 'entregado', label: '¡Retirado!', icon: <MapPin size={20} />, subtext: '¡Que lo disfrutes!' },
    ] : [
        { id: 'recibido', label: 'Pedido Recibido', icon: <CheckCircle2 size={20} />, subtext: 'Estamos preparando su pedido' },
        { id: 'en camino', label: 'Repartidor en camino', icon: <Bike size={20} />, subtext: 'Tu pedido está viajando' },
        { id: 'entregado', label: '¡Entregado!', icon: <MapPin size={20} />, subtext: '¡Que lo disfrutes!' },
    ];

    // Mapeo simple de estados del backend a los steps visuales
    const getStepIndex = () => {
        if (isTakeaway) {
            if (status.includes('recibido') || status.includes('pendiente') || status.includes('preparando')) return 0;
            if (status.includes('retirar') || status.includes('listo')) return 1;
            if (status.includes('entregado')) return 2;
            return 0;
        } else {
            if (status.includes('recibido') || status.includes('pendiente') || status.includes('preparando')) return 0;
            if (status.includes('camino')) return 1;
            if (status.includes('entregado')) return 2;
            return 0;
        }
    };

    const currentStepIndex = getStepIndex();


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <div className="text-center">
                    <div className="w-10 h-10 border-[3px] border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted text-sm font-semibold">Cargando el estado de tu pedido…</p>
                </div>
            </div>
        );
    }

    const shadow = 'shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]';

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 max-w-2xl mx-auto min-h-screen">

            <Link to={`/${tenant?.slug}`} className="press inline-flex items-center gap-1.5 text-muted text-sm font-semibold hover:text-brand-secondary mt-4 mb-6">
                <ChevronLeft size={16} /> Volver al menú
            </Link>

            {result === 'success' && (
                <div role="status" className="rise-in flex items-center gap-4 bg-green-50 text-green-900 rounded-xl p-4 mb-6">
                    <CheckCircle2 size={24} className="text-green-700 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="font-semibold">Pago aprobado</p>
                        <p className="text-sm text-green-800">Tu pedido ya está en preparación.</p>
                    </div>
                </div>
            )}

            {result === 'failure' && (
                <div role="alert" className="rise-in flex items-center gap-4 bg-red-50 text-red-900 rounded-xl p-4 mb-6">
                    <X size={24} className="text-red-700 shrink-0" aria-hidden="true" />
                    <div>
                        <p className="font-semibold">No se pudo completar el pago</p>
                        <p className="text-sm text-red-800">Probá de nuevo o escribile al local.</p>
                    </div>
                </div>
            )}

            {result !== 'failure' && (
                <section className={`bg-white rounded-2xl p-6 sm:p-8 ${shadow}`}>
                    <div className="flex items-center gap-4 mb-2">
                        <span className="bg-brand text-on-brand w-12 h-12 rounded-full flex items-center justify-center shrink-0">
                            {currentStepIndex === 0 && <UtensilsCrossed size={22} aria-hidden="true" />}
                            {currentStepIndex === 1 && (isTakeaway ? <MapPin size={22} aria-hidden="true" /> : <Bike size={22} aria-hidden="true" />)}
                            {currentStepIndex === 2 && <CheckCircle2 size={22} aria-hidden="true" />}
                        </span>
                        <div>
                            <h1 className="font-display text-3xl font-extrabold tracking-[-0.02em] text-brand-secondary leading-tight">
                                {steps[currentStepIndex].label}
                            </h1>
                            <p className="text-muted">{steps[currentStepIndex].subtext}</p>
                        </div>
                    </div>

                    <ol className="relative mt-8 space-y-7">
                        <div className="absolute left-[19px] top-3 bottom-3 w-px bg-line" aria-hidden="true" />
                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;
                            return (
                                <li key={step.id} className="flex items-start gap-5 relative" aria-current={isCurrent ? 'step' : undefined}>
                                    <span className={`z-10 w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isCompleted ? 'bg-brand text-on-brand' : 'bg-surface-2 text-stone-400'} ${isCurrent ? 'ring-4 ring-brand/20' : ''}`}>
                                        {step.icon}
                                    </span>
                                    <div className="pt-1.5">
                                        <h3 className={`font-semibold ${isCompleted ? 'text-brand-secondary' : 'text-stone-400'}`}>{step.label}</h3>
                                        <p className={`text-sm ${isCurrent ? 'text-brand-secondary' : 'text-muted'}`}>{step.subtext}</p>
                                    </div>
                                </li>
                            );
                        })}
                    </ol>

                    <div className="mt-8 pt-6 border-t border-line">
                        <p className="text-sm text-muted mb-3">¿Necesitás ayuda con tu pedido?</p>
                        <a
                            href={`https://wa.me/${tenant?.whatsapp || ''}?text=${encodeURIComponent(
                                `¡Hola! Quería consultar por mi pedido #${orderData?.id_pedido || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="press w-full flex items-center justify-center gap-2 bg-[#1f7a4d] hover:bg-[#186340] text-white py-3 rounded-xl font-semibold"
                        >
                            <MessageCircle size={20} aria-hidden="true" /> Escribir por WhatsApp
                        </a>
                    </div>
                </section>
            )}

            {result !== 'failure' && orderData && (
                <section className={`mt-6 bg-white rounded-2xl p-6 sm:p-8 ${shadow}`}>
                    <div className="flex justify-between items-baseline mb-5">
                        <h2 className="font-display text-xl font-bold text-brand-secondary">Pedido <span className="tabular">#{orderData.id_pedido}</span></h2>
                        <p className="tabular font-display text-2xl font-extrabold text-brand-secondary">${parseFloat(orderData.total).toLocaleString()}</p>
                    </div>

                    <ul className="divide-y divide-line">
                        {orderData.detalle && orderData.detalle.map((item, idx) => (
                            <li key={idx} className="flex justify-between gap-4 py-3 text-sm first:pt-0 last:pb-0">
                                <span className="text-brand-secondary">
                                    <span className="tabular font-semibold">{item.cantidad}×</span> {item.producto_nombre}
                                    {item.variante && <span className="text-muted"> ({item.variante})</span>}
                                    {lineasDetallePedido(item).map(l => <span key={l} className="block text-xs text-muted">{l}</span>)}
                                    {item.observacion && <span className="block text-xs text-amber-800">“{item.observacion}”</span>}
                                </span>
                                <span className="tabular text-muted shrink-0">${(item.cantidad * item.precio_unitario).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
};

export default OrderStatus;
