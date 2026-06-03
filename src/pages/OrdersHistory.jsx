import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Clock, 
    Calendar, 
    ChevronRight, 
    ChevronDown, 
    ChevronUp,
    ShoppingBag, 
    UtensilsCrossed, 
    ArrowRight,
    Search,
    AlertCircle
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useTenant } from '../context/TenantContext';
import { useAuth } from '../context/AuthContext';

const OrdersHistory = () => {
    const { tenant } = useTenant();
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (tenant) {
            document.title = `${tenant.nombre || 'Pizzería'} - Mis Pedidos`;
        }
    }, [tenant]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                const response = await api.get('/pedidos/mis-pedidos');
                setOrders(response.data);
            } catch (err) {
                console.error('Error fetching client orders:', err);
                setError('No pudimos cargar tu historial de pedidos. Por favor, intentá de nuevo más tarde.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusStyle = (status) => {
        const cleanStatus = status.toLowerCase();
        if (cleanStatus.includes('pendiente')) {
            return {
                bg: 'bg-amber-50 text-amber-700 border-amber-200',
                label: 'Pendiente',
                dot: 'bg-amber-500'
            };
        }
        if (cleanStatus.includes('aprobado') || cleanStatus.includes('preparando')) {
            return {
                bg: 'bg-blue-50 text-blue-700 border-blue-200',
                label: 'Preparando',
                dot: 'bg-blue-500'
            };
        }
        if (cleanStatus.includes('camino')) {
            return {
                bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                label: 'En Camino',
                dot: 'bg-indigo-500'
            };
        }
        if (cleanStatus.includes('entregado') || cleanStatus.includes('completado')) {
            return {
                bg: 'bg-green-50 text-green-700 border-green-200',
                label: 'Entregado',
                dot: 'bg-green-500'
            };
        }
        if (cleanStatus.includes('cancelado') || cleanStatus.includes('rechazado')) {
            return {
                bg: 'bg-red-50 text-red-700 border-red-200',
                label: 'Cancelado',
                dot: 'bg-red-500'
            };
        }
        return {
            bg: 'bg-gray-50 text-gray-700 border-gray-200',
            label: status,
            dot: 'bg-gray-500'
        };
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }) + ' hs';
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-28">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand-secondary font-black uppercase tracking-[0.2em] text-xs">Cargando tus pedidos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto min-h-screen">
            {/* Header de la Página */}
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-4xl font-black text-brand-secondary tracking-tighter uppercase mb-2">
                    Mis <span className="text-brand">Pedidos</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                    Historial de compras de {user?.nombre || 'Cliente'}
                </p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-8 flex items-start gap-4 text-red-800 animate-in fade-in slide-in-from-top-4 duration-500">
                    <AlertCircle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-black text-sm uppercase tracking-widest">¡Ups! Algo salió mal</p>
                        <p className="text-xs font-bold text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {/* Listado de Pedidos */}
            {!error && orders.length === 0 ? (
                // Estado Vacío (Empty State)
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-brand/5 border border-gray-100 p-12 text-center max-w-lg mx-auto mt-12 animate-in fade-in zoom-in-95 duration-500">
                    <div className="bg-brand/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 text-brand">
                        <ShoppingBag size={44} />
                    </div>
                    <h2 className="text-2xl font-black text-brand-secondary uppercase tracking-tight mb-2">
                        ¿Aún no pediste nada?
                    </h2>
                    <p className="text-gray-400 font-bold text-sm mb-8">
                        Tus pizzas favoritas te están esperando. Realizá tu primer pedido hoy mismo.
                    </p>
                    <Link
                        to={`/${tenant?.slug}`}
                        className="inline-flex items-center gap-3 bg-brand hover:bg-brand-secondary text-white px-8 py-4 rounded-2xl font-black transition-all shadow-lg shadow-brand/20 active:scale-95 text-sm uppercase tracking-wider"
                    >
                        Ver el Menú <ArrowRight size={18} />
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const isExpanded = expandedOrder === order.id_pedido;
                        const statusInfo = getStatusStyle(order.estado);

                        return (
                            <div 
                                key={order.id_pedido}
                                className="bg-white rounded-[2rem] border border-gray-100 shadow-md shadow-gray-100/50 hover:shadow-xl hover:shadow-brand/5 transition-all duration-300 overflow-hidden"
                            >
                                {/* Cabecera de la Orden */}
                                <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-brand/5 w-12 h-12 rounded-2xl flex items-center justify-center text-brand flex-shrink-0">
                                            <UtensilsCrossed size={22} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-black text-lg text-brand-secondary tracking-tight">
                                                    Pedido #{order.id_pedido}
                                                </h3>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border uppercase tracking-wider ${statusInfo.bg}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                    {statusInfo.label}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> {formatDate(order.fecha)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                        <div className="text-left sm:text-right">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total</p>
                                            <p className="text-2xl font-black text-brand-secondary tracking-tighter">
                                                ${parseFloat(order.total).toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {/* Botón de Seguimiento */}
                                            <Link
                                                to={`/${tenant?.slug}/status/info/${order.id_pedido}`}
                                                className="bg-brand hover:bg-brand-secondary text-white text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-sm active:scale-95"
                                            >
                                                Seguimiento
                                            </Link>
                                            {/* Toggle Detalle */}
                                            <button
                                                onClick={() => toggleExpand(order.id_pedido)}
                                                className="p-2.5 text-gray-400 hover:text-brand hover:bg-gray-50 rounded-xl transition-colors"
                                                aria-label="Ver productos"
                                            >
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Detalle Desplegable */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 sm:px-8 sm:pb-8 border-t border-gray-50 bg-gray-50/30 animate-in slide-in-from-top-2 duration-200">
                                        <div className="pt-6">
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-3">Detalle del Pedido</p>
                                            <div className="space-y-2">
                                                {order.detalle && order.detalle.map((item, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className="flex justify-between items-center bg-white p-3 rounded-xl border border-gray-100"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-brand/10 text-brand w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black">
                                                                {item.cantidad}x
                                                            </span>
                                                            <span className="text-sm font-bold text-brand-secondary">
                                                                {item.producto_nombre}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs font-black text-gray-400">
                                                            ${(item.cantidad * item.precio_unitario).toLocaleString()}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default OrdersHistory;
