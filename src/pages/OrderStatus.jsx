import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    MapPin,
    UtensilsCrossed,
    Bike,
    MessageCircle,
    ChevronLeft,
    X,
    ClipboardList
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext'; // Importar Tenant

const OrderStatus = () => {
    const { result, id } = useParams();
    const { clearCart, cart } = useCart();
    const { tenant } = useTenant(); // Obtener datos del tenant
    const [status, setStatus] = useState('recibido'); 
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (result === 'success' && cart.length > 0) {
            clearCart();
        }
    }, [result, clearCart, cart.length]);

    useEffect(() => {
        if (id) {
            const fetchOrder = async () => {
                try {
                    const response = await api.get(`/pedidos/${id}`);
                    setOrderData(response.data);
                    setStatus(response.data.estado.toLowerCase());
                } catch (error) {
                    console.error('Error al cargar pedido:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchOrder();
        } else {
            setLoading(false);
        }
    }, [id]);

    const steps = [
        { id: 'recibido', label: 'Pedido Recibido', icon: <CheckCircle2 size={20} />, subtext: 'Estamos preparando su pedido' },
        { id: 'en camino', label: 'Repartidor en camino', icon: <Bike size={20} />, subtext: 'Tu pedido está viajando' },
        { id: 'entregado', label: '¡Entregado!', icon: <MapPin size={20} />, subtext: '¡Que lo disfrutes!' },
    ];

    // Mapeo simple de estados del backend a los steps visuales
    const getStepIndex = () => {
        if (status.includes('recibido') || status.includes('pendiente') || status.includes('preparando')) return 0;
        if (status.includes('camino')) return 1;
        if (status.includes('entregado')) return 2;
        return 0;
    };

    const currentStepIndex = getStepIndex();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Cargando estado...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto min-h-screen">

            {/* Botón Volver */}
            <Link to={`/${tenant?.slug}`} className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm mb-6 hover:text-brand transition-colors">
                <ChevronLeft size={16} /> Volver al Menú
            </Link>

            {result === 'success' && (
                <div className="bg-green-100 border border-green-200 p-4 rounded-3xl mb-8 flex items-center gap-4 text-green-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-green-600 p-2 rounded-full text-white">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase tracking-widest">¡Pago Aprobado!</p>
                        <p className="text-xs opacity-80 font-bold uppercase tracking-tight">Tu pedido ya entró en la fila de producción.</p>
                    </div>
                </div>
            )}

            {result === 'failure' && (
                <div className="bg-red-100 border border-red-200 p-4 rounded-3xl mb-8 flex items-center gap-4 text-red-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-red-600 p-2 rounded-full text-white">
                        <X size={24} />
                    </div>
                    <div>
                        <p className="font-black text-sm uppercase tracking-widest">Hubo un problema con el pago</p>
                        <p className="text-xs opacity-80 font-bold uppercase tracking-tight">Intentá de nuevo o hablá con el local.</p>
                    </div>
                </div>
            )}

            {/* Card Principal de Estado */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/20 border border-brand/10 overflow-hidden">

                {/* Header Animado */}
                <div className="bg-brand p-10 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="grid grid-cols-6 gap-4 p-4">
                            {[...Array(12)].map((_, i) => <UtensilsCrossed key={i} size={40} />)}
                        </div>
                    </div>

                    <div className="relative z-10">
                        <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                            {currentStepIndex === 0 && <UtensilsCrossed size={32} className="animate-bounce" />}
                            {currentStepIndex === 1 && <Bike size={32} className="animate-pulse" />}
                            {currentStepIndex === 2 && <CheckCircle2 size={32} />}
                        </div>
                        <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-1">
                            {steps[currentStepIndex].label}
                        </h1>
                        <p className="text-brand/80 text-sm font-medium">{steps[currentStepIndex].subtext}</p>
                    </div>
                </div>

                {/* Tracker (Línea de tiempo) */}
                <div className="p-8 md:p-12">
                    <div className="relative space-y-10">
                        {/* Línea vertical de fondo */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.id} className="flex items-start gap-6 relative">
                                    <div className={`
                                        z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                        ${isCompleted ? 'bg-brand border-brand/20 text-white' : 'bg-white border-gray-100 text-gray-200'}
                                        ${isCurrent ? 'ring-4 ring-orange-100 animate-pulse' : ''}
                                    `}>
                                        {step.icon}
                                    </div>

                                    <div className="flex-1 pt-1">
                                        <h3 className={`font-black text-lg ${isCompleted ? 'text-brand-secondary' : 'text-gray-300'}`}>
                                            {step.label}
                                        </h3>
                                        <p className={`text-sm font-bold ${isCurrent ? 'text-brand' : 'text-gray-400'}`}>
                                            {step.subtext}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <hr className="my-10 border-gray-100" />

                    {/* Acciones de Ayuda */}
                    <div className="space-y-4 text-center">
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">¿Necesitás ayuda con tu pedido?</h4>
                        <a
                            href="https://wa.me/tu-numero"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            <MessageCircle size={22} fill="white" /> Contactanos por WhatsApp
                        </a>
                    </div>
                </div>
            </div>

            {/* Resumen Dinámico del Pedido */}
            {orderData && (
                <div className="mt-8 bg-brand-secondary rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <ClipboardList size={80} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Tu Pedido</p>
                                <h3 className="text-xl font-black italic tracking-tighter">ORDEN #{orderData.id_pedido}</h3>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Pagado</p>
                                <p className="text-3xl font-black text-brand tracking-tighter">${parseFloat(orderData.total).toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {orderData.detalle && orderData.detalle.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-brand w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black">{item.cantidad}x</span>
                                        <span className="text-sm font-bold text-gray-200">{item.producto_nombre}</span>
                                    </div>
                                    <span className="text-xs font-black text-gray-500">${(item.cantidad * item.precio_unitario).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderStatus;