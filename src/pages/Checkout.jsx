import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext'; // Importar Tenant
import {
    MapPin,
    CheckCircle2,
    MessageCircle,
    ArrowLeft,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import api from '../api/axiosConfig';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { getBuyer, saveBuyer, addOrderToken } from '../utils/guestStore';

const EMPTY_ADDRESS = { calle: '', altura: '', piso: '', depto: '', cp: '', observaciones: '' };

const inputClass = 'w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-bold text-sm text-brand-secondary disabled:opacity-60';
const labelClass = 'text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1';

const Checkout = () => {
    const { cart, total } = useCart();
    const { tenant } = useTenant(); // Obtener datos del tenant
    const navigate = useNavigate();

    const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'takeaway'
    const [buyer, setBuyer] = useState({ dni: '', nombre: '', telefono: '', email: '' });
    const [address, setAddress] = useState(EMPTY_ADDRESS);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [preferenceId, setPreferenceId] = useState(null);

    let shippingCost = deliveryMethod === 'takeaway' ? 0 : Number(tenant?.costo_envio || 0);
    if (deliveryMethod !== 'takeaway' && tenant?.envio_gratis_desde && total >= Number(tenant.envio_gratis_desde)) {
        shippingCost = 0;
    }
    const finalTotal = total + shippingCost;

    // Inicializar MP con la Public Key de ESTA pizzería
    useEffect(() => {
        if (tenant?.mp_public_key) {
            initMercadoPago(tenant.mp_public_key);
        }
    }, [tenant]);

    // Recordar los datos de la última compra en este dispositivo (no hay cuenta)
    useEffect(() => {
        if (!tenant?.slug) return;
        const saved = getBuyer(tenant.slug);
        if (saved) {
            setBuyer((prev) => ({ ...prev, ...saved.buyer }));
            setAddress((prev) => ({ ...prev, ...saved.address }));
        }
    }, [tenant?.slug]);

    // Si el carrito está vacío, lo mandamos al Home
    useEffect(() => {
        if (cart.length === 0) {
            navigate(`/${tenant?.slug}`);
        }
    }, [cart, navigate, tenant]);

    const isTakeaway = deliveryMethod === 'takeaway';
    const locked = !!preferenceId;

    const validate = () => {
        const dni = buyer.dni.replace(/\D/g, '');
        if (!/^\d{7,8}$/.test(dni)) return 'Ingresá un DNI válido (7 u 8 números).';
        if (buyer.nombre.trim().length < 2) return 'Ingresá tu nombre completo.';
        if (buyer.telefono.replace(/\D/g, '').length < 8) return 'Ingresá un celular válido.';
        if (buyer.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyer.email.trim())) return 'El email no es válido.';
        if (!isTakeaway) {
            if (!address.calle.trim() || !address.altura.trim() || !address.cp.trim()) {
                return 'Completá calle, altura y código postal.';
            }
            const allowed = (tenant?.codigos_postales || '').split(',').map((c) => c.trim()).filter(Boolean);
            if (allowed.length > 0 && !allowed.includes(address.cp.trim())) {
                return `Lo sentimos, no realizamos envíos a tu zona (CP ${address.cp.trim()}). Realizamos envíos a: ${allowed.join(', ')}`;
            }
        }
        return '';
    };

    const handleCreatePreference = async () => {
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }
        setError('');
        setLoading(true);
        try {
            // 1. Registrar el pedido (el cliente se asocia de forma silenciosa en el servidor)
            const orderResponse = await api.post('/pedidos/checkout', {
                comprador: {
                    dni: buyer.dni,
                    nombre: buyer.nombre,
                    telefono: buyer.telefono,
                    email: buyer.email || undefined
                },
                metodo_entrega: deliveryMethod,
                direccion: isTakeaway ? undefined : address,
                items: cart.map((item) => ({
                    id_producto: item.id_producto,
                    cantidad: item.quantity,
                    precio: item.precio
                }))
            });
            const { token_seguimiento } = orderResponse.data;

            saveBuyer(tenant.slug, { buyer, address });
            addOrderToken(tenant.slug, token_seguimiento);

            // 2. Crear la preferencia de Mercado Pago (items y total salen del pedido guardado)
            const paymentResponse = await api.post('/payments/create-preference', { token: token_seguimiento });
            setPreferenceId(paymentResponse.data.id);
        } catch (err) {
            console.error('Error al procesar el pedido:', err);
            setError(err.response?.data?.message || 'Hubo un error al procesar tu pedido.');
        } finally {
            setLoading(false);
        }
    };

    const setBuyerField = (field) => (e) => setBuyer({ ...buyer, [field]: e.target.value });
    const setAddressField = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

    return (
        <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto min-h-screen">

            {/* Header de Checkout */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <button onClick={() => navigate(`/${tenant?.slug}`)} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-brand transition-colors mb-2">
                        <ArrowLeft size={14} /> Volver al Menú
                    </button>
                    <h1 className="text-4xl font-black italic tracking-tighter text-brand-secondary">FINALIZAR COMPRA</h1>
                </div>
                <div className="bg-brand/10 border border-brand/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="bg-brand p-2 rounded-full text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest">Compra Segura</p>
                        <p className="text-xs font-bold text-gray-700">Sin registro, solo tus datos</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* LADO IZQUIERDO: Datos de Entrega */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-brand-secondary mb-6 flex items-center gap-3">
                            <MapPin className="text-brand" /> Tus Datos
                        </h2>

                        {/* Selector de Método de Entrega */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <button
                                type="button"
                                disabled={locked}
                                onClick={() => setDeliveryMethod('delivery')}
                                className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex flex-col gap-2 ${
                                    deliveryMethod === 'delivery'
                                    ? 'border-brand bg-brand/5 shadow-lg shadow-brand/5'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                }`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${deliveryMethod === 'delivery' ? 'text-brand' : 'text-gray-400'}`}>
                                    Envío a Domicilio 🛵
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Enviamos tu pedido directo a tu casa.
                                </span>
                            </button>
                            <button
                                type="button"
                                disabled={locked}
                                onClick={() => setDeliveryMethod('takeaway')}
                                className={`p-6 rounded-[2rem] border-2 text-left transition-all duration-300 flex flex-col gap-2 ${
                                    deliveryMethod === 'takeaway'
                                    ? 'border-brand bg-brand/5 shadow-lg shadow-brand/5'
                                    : 'border-gray-100 hover:border-gray-200 bg-white'
                                }`}
                            >
                                <span className={`text-xs font-black uppercase tracking-widest ${deliveryMethod === 'takeaway' ? 'text-brand' : 'text-gray-400'}`}>
                                    Retiro por Local 🛍️
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    Retirás tu pedido listo en nuestra sucursal.
                                </span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className={labelClass}>Nombre completo</label>
                                <input type="text" autoComplete="name" disabled={locked} className={inputClass}
                                    value={buyer.nombre} onChange={setBuyerField('nombre')} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>DNI</label>
                                <input type="text" inputMode="numeric" maxLength={10} placeholder="Ej. 30123456" disabled={locked} className={inputClass}
                                    value={buyer.dni} onChange={(e) => setBuyer({ ...buyer, dni: e.target.value.replace(/[^\d.]/g, '') })} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Celular (WhatsApp)</label>
                                <input type="tel" autoComplete="tel" placeholder="Ej: 11 1234 5678" disabled={locked} className={inputClass}
                                    value={buyer.telefono} onChange={setBuyerField('telefono')} />
                            </div>
                            <div className="space-y-1">
                                <label className={labelClass}>Email (opcional)</label>
                                <input type="email" autoComplete="email" placeholder="Ej: usuario@gmail.com" disabled={locked} className={inputClass}
                                    value={buyer.email} onChange={setBuyerField('email')} />
                            </div>
                        </div>

                        {isTakeaway ? (
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mt-6 flex flex-col gap-2 animate-in fade-in duration-300">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Punto de Retiro (Sucursal)</p>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
                                    <div>
                                        <p className="font-black text-brand-secondary text-base leading-relaxed">
                                            {tenant?.nombre || 'Nuestra Sucursal'}
                                        </p>
                                        <p className="font-bold text-gray-500 text-sm">
                                            {tenant?.direccion}, {tenant?.ciudad}
                                        </p>
                                    </div>
                                    <span className="bg-brand/10 text-brand px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        Retirar por acá
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-4">
                                <p className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-1">
                                    <MapPin size={12} /> Dirección de Entrega
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1 col-span-2">
                                        <label className={labelClass}>Calle</label>
                                        <input type="text" placeholder="Ej. Av. Siempreviva" disabled={locked} className={inputClass}
                                            value={address.calle} onChange={setAddressField('calle')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Altura / Nro</label>
                                        <input type="text" placeholder="Ej. 742" disabled={locked} className={inputClass}
                                            value={address.altura} onChange={setAddressField('altura')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Código Postal (solo número)</label>
                                        <input type="text" inputMode="numeric" placeholder="Ej. 1602" disabled={locked} className={inputClass}
                                            value={address.cp} onChange={(e) => setAddress({ ...address, cp: e.target.value.replace(/\D/g, '') })} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Piso (Opcional)</label>
                                        <input type="text" placeholder="Ej. 3" disabled={locked} className={inputClass}
                                            value={address.piso} onChange={setAddressField('piso')} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className={labelClass}>Depto (Opcional)</label>
                                        <input type="text" placeholder="Ej. B" disabled={locked} className={inputClass}
                                            value={address.depto} onChange={setAddressField('depto')} />
                                    </div>
                                    <div className="space-y-1 col-span-2">
                                        <label className={labelClass}>Observaciones</label>
                                        <input type="text" placeholder="Ej. Portón de madera, timbre que no suena..." disabled={locked} className={inputClass}
                                            value={address.observaciones} onChange={setAddressField('observaciones')} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-brand-secondary mb-6 flex items-center gap-3">
                            <CreditCard className="text-brand" /> Método de Pago
                        </h2>

                        {!preferenceId ? (
                            <button
                                onClick={handleCreatePreference}
                                disabled={loading}
                                className="w-full bg-brand hover:bg-brand-hover text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-brand/10 flex items-center justify-center gap-3 transition-all active:scale-95 animate-in fade-in disabled:opacity-70"
                            >
                                {loading ? 'Preparando Pago...' : 'Pagar con Mercado Pago'} <CheckCircle2 size={24} />
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                                <Wallet
                                    initialization={{ preferenceId }}
                                    customization={{ texts: { valueProp: 'smart_option' } }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setPreferenceId(null)}
                                    className="w-full text-center text-gray-400 text-xs font-black uppercase tracking-widest hover:text-brand transition-colors"
                                >
                                    Modificar mis datos
                                </button>
                            </div>
                        )}

                        {error && (
                            <p className="mt-4 text-red-500 text-center text-xs font-bold">{error}</p>
                        )}

                        <p className="mt-6 text-[10px] text-gray-400 text-center uppercase font-bold tracking-widest">
                            Serás redirigido a la plataforma segura de Mercado Pago
                        </p>
                    </div>
                </div>

                {/* LADO DERECHO: Resumen */}
                <div className="lg:col-span-1">
                    <div className="bg-brand-secondary rounded-[2.5rem] p-8 text-white sticky top-28 shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MessageCircle className="text-brand" size={20} /> Resumen
                        </h3>

                        <div className="space-y-4 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item) => (
                                <div key={item.cartItemId || item.id_producto} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400 font-medium">
                                        <span className="text-white font-bold">{item.quantity}x</span> {item.nombre}
                                    </span>
                                    <span className="font-bold">${(item.precio * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-800 pt-6 space-y-3">
                            <div className="flex justify-between text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <span>Subtotal</span>
                                <span>${total.toLocaleString()}</span>
                            </div>
                            <div className={`flex justify-between text-xs font-bold uppercase tracking-widest ${shippingCost === 0 ? 'text-green-400' : 'text-gray-300'}`}>
                                <span>Envío</span>
                                <span>{shippingCost === 0 ? '¡Gratis!' : `$${shippingCost.toLocaleString()}`}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-black">Total</span>
                                <span className="text-3xl font-black text-brand">${finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;
