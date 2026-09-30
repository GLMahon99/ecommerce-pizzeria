import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ShoppingBag, AlertCircle, ArrowRight } from 'lucide-react';
import api from '../api/axiosConfig';
import { useTenant } from '../context/TenantContext';
import { getOrderTokens } from '../utils/guestStore';

const getStatusStyle = (status) => {
    const s = status.toLowerCase();
    if (s.includes('pendiente')) return { cls: 'bg-amber-50 text-amber-900', dot: 'bg-amber-500', label: 'Pendiente' };
    if (s.includes('aprobado') || s.includes('preparando')) return { cls: 'bg-sky-50 text-sky-900', dot: 'bg-sky-500', label: 'Preparando' };
    if (s.includes('camino')) return { cls: 'bg-indigo-50 text-indigo-900', dot: 'bg-indigo-500', label: 'En camino' };
    if (s.includes('entregado') || s.includes('completado')) return { cls: 'bg-green-50 text-green-900', dot: 'bg-green-600', label: 'Entregado' };
    if (s.includes('cancelado') || s.includes('rechazado')) return { cls: 'bg-red-50 text-red-900', dot: 'bg-red-500', label: 'Cancelado' };
    return { cls: 'bg-surface-2 text-brand-secondary', dot: 'bg-stone-400', label: status };
};

const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires'
    }) + ' hs';
};

const OrdersHistory = () => {
    const { tenant } = useTenant();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedOrder, setExpandedOrder] = useState(null);

    useEffect(() => {
        if (tenant) {
            document.title = `${tenant.nombre || 'Tienda'} - Mis pedidos`;
        }
    }, [tenant]);

    useEffect(() => {
        if (!tenant?.slug) return;
        const fetchOrders = async () => {
            try {
                setLoading(true);
                // Sin sesión: el historial son los pedidos hechos desde este dispositivo (por token de seguimiento)
                const tokens = getOrderTokens(tenant.slug);
                const results = await Promise.allSettled(
                    tokens.map((token) => api.get(`/pedidos/seguimiento/${token}`).then((r) => ({ ...r.data, token })))
                );
                setOrders(results.filter((r) => r.status === 'fulfilled').map((r) => r.value));
            } catch (err) {
                console.error('Error fetching orders:', err);
                setError('No pudimos cargar tu historial de pedidos. Intentá de nuevo en un rato.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [tenant?.slug]);

    const toggleExpand = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    if (loading) {
        return (
            <div className="pt-28 px-4 sm:px-6 max-w-3xl mx-auto min-h-screen">
                <div className="pt-4 mb-8">
                    <div className="skeleton h-10 w-56 rounded-lg" />
                </div>
                <div className="space-y-4">
                    {[0, 1, 2].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 max-w-3xl mx-auto min-h-screen">
            <header className="pt-4 mb-8">
                <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] text-brand-secondary">Mis pedidos</h1>
                <p className="mt-2 text-muted">Las compras hechas desde este dispositivo.</p>
            </header>

            {error && (
                <div role="alert" className="flex items-start gap-3 bg-red-50 text-red-900 rounded-xl p-4 mb-6 text-sm">
                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    {error}
                </div>
            )}

            {!error && orders.length === 0 ? (
                <div className="rise-in py-16 text-center max-w-sm mx-auto">
                    <ShoppingBag size={40} strokeWidth={1.5} className="text-brand mx-auto mb-4" aria-hidden="true" />
                    <h2 className="font-display text-2xl font-bold text-brand-secondary mb-2">Todavía no pediste nada</h2>
                    <p className="text-muted mb-6">Cuando hagas tu primer pedido, lo vas a encontrar acá.</p>
                    <Link
                        to={`/${tenant?.slug}`}
                        className="press inline-flex items-center gap-2 bg-brand-secondary text-white px-6 py-3 rounded-xl font-semibold text-sm"
                    >
                        Ver el menú <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                </div>
            ) : (
                <ul className="space-y-4">
                    {orders.map((order, i) => {
                        const isExpanded = expandedOrder === order.id_pedido;
                        const statusInfo = getStatusStyle(order.estado);

                        return (
                            <li
                                key={order.id_pedido}
                                className="rise-in bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]"
                                style={{ '--i': Math.min(i, 8) }}
                            >
                                <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                            <h2 className="font-display text-lg font-bold text-brand-secondary">
                                                Pedido <span className="tabular">#{order.id_pedido}</span>
                                            </h2>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold ${statusInfo.cls}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                                                {statusInfo.label}
                                            </span>
                                        </div>
                                        <p className="tabular text-sm text-muted mt-1">{formatDate(order.fecha)}</p>
                                    </div>

                                    <div className="flex items-center justify-between sm:justify-end gap-4">
                                        <p className="tabular font-display text-xl font-extrabold text-brand-secondary">
                                            ${parseFloat(order.total).toLocaleString()}
                                        </p>
                                        <div className="flex items-center gap-1">
                                            <Link
                                                to={`/${tenant?.slug}/status/info/${order.token}`}
                                                className="press bg-brand text-on-brand hover:bg-brand-hover text-sm font-semibold px-4 py-2 rounded-lg"
                                            >
                                                Seguimiento
                                            </Link>
                                            <button
                                                onClick={() => toggleExpand(order.id_pedido)}
                                                aria-expanded={isExpanded}
                                                aria-label={isExpanded ? 'Ocultar productos' : 'Ver productos'}
                                                className="press p-2 text-muted hover:text-brand-secondary rounded-lg"
                                            >
                                                <ChevronDown
                                                    size={20}
                                                    className="transition-transform duration-200"
                                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transitionTimingFunction: 'var(--ease-out)' }}
                                                />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="fade-in px-5 sm:px-6 pb-5 sm:pb-6 pt-4 border-t border-line bg-surface/60">
                                        <ul className="space-y-2">
                                            {order.detalle && order.detalle.map((item, idx) => (
                                                <li key={idx} className="flex justify-between gap-4 text-sm">
                                                    <span className="text-brand-secondary">
                                                        <span className="tabular font-semibold">{item.cantidad}×</span> {item.producto_nombre}
                                                    </span>
                                                    <span className="tabular text-muted shrink-0">
                                                        ${(item.cantidad * item.precio_unitario).toLocaleString()}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default OrdersHistory;
