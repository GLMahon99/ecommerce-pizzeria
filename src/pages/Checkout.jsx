import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { ArrowLeft, Bike, Store, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../api/axiosConfig';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { getBuyer, saveBuyer, addOrderToken } from '../utils/guestStore';
import { textoTamano } from '../utils/producto';

const EMPTY_ADDRESS = { calle: '', altura: '', piso: '', depto: '', cp: '', observaciones: '' };

const inputClass = 'w-full bg-white border border-line px-4 h-12 rounded-xl outline-none transition-colors text-base text-brand-secondary placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60 disabled:bg-surface-2';

const Field = ({ label, className = '', children }) => (
    <label className={`block ${className}`}>
        <span className="block text-sm font-semibold text-brand-secondary mb-1.5">{label}</span>
        {children}
    </label>
);

const DeliveryOption = ({ active, disabled, onClick, icon, title, text }) => (
    <button
        type="button"
        role="radio"
        aria-checked={active}
        disabled={disabled}
        onClick={onClick}
        className={`press p-4 rounded-xl border text-left flex gap-3 items-start disabled:opacity-60 ${active ? 'border-brand bg-brand/5 ring-1 ring-brand' : 'border-line bg-white hover:border-stone-300'}`}
    >
        <span className={active ? 'text-brand' : 'text-muted'}>{icon}</span>
        <span>
            <span className="block font-semibold text-brand-secondary">{title}</span>
            <span className="block text-sm text-muted mt-0.5">{text}</span>
        </span>
    </button>
);

const Checkout = () => {
    const { cart, total } = useCart();
    const { tenant, localAbierto, refreshEstado } = useTenant();
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

    // Inicializar MP con la Public Key de ESTA tienda
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
        if (!localAbierto) {
            setError(tenant?.estado?.mensaje || 'El local está cerrado.');
            return;
        }
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
                    precio: item.precio,
                    variante: item.tamano === 'Chica' ? 'Chica' : undefined,
                    gustos: item.gustos,
                    toppings: item.toppings,
                    aderezos: item.aderezos,
                    guarnicion: item.guarnicion,
                    carnes_extra: item.carnes_extra,
                    observacion: item.observacion
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
            // El local cerró mientras el cliente completaba el pedido
            if (err.response?.data?.code === 'LOCAL_CERRADO') refreshEstado();
            setError(err.response?.data?.message || 'Hubo un error al procesar tu pedido.');
        } finally {
            setLoading(false);
        }
    };

    const setBuyerField = (field) => (e) => setBuyer({ ...buyer, [field]: e.target.value });
    const setAddressField = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

    return (
        <div className="pt-28 pb-8 px-4 sm:px-6 max-w-5xl mx-auto min-h-screen">

            <div className="pt-4 mb-8">
                <button onClick={() => navigate(`/${tenant?.slug}`)} className="press inline-flex items-center gap-1.5 min-h-11 text-muted text-sm font-semibold hover:text-brand-secondary mb-1">
                    <ArrowLeft size={16} /> Volver al menú
                </button>
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <h1 className="font-display text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] text-brand-secondary">Finalizar compra</h1>
                    <p className="flex items-center gap-2 text-sm text-muted pb-1.5">
                        <ShieldCheck size={16} className="text-brand" aria-hidden="true" /> Sin registro, solo tus datos
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 items-start">

                <div className="space-y-10">
                    <section>
                        <h2 className="font-display text-xl font-bold text-brand-secondary mb-4">Cómo lo recibís</h2>
                        <div role="radiogroup" aria-label="Método de entrega" className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                            <DeliveryOption
                                active={deliveryMethod === 'delivery'} disabled={locked}
                                onClick={() => setDeliveryMethod('delivery')}
                                icon={<Bike size={22} aria-hidden="true" />} title="Envío a domicilio" text="Lo llevamos hasta tu casa."
                            />
                            <DeliveryOption
                                active={deliveryMethod === 'takeaway'} disabled={locked}
                                onClick={() => setDeliveryMethod('takeaway')}
                                icon={<Store size={22} aria-hidden="true" />} title="Retiro en el local" text="Pasás a buscarlo, ya listo."
                            />
                        </div>

                        <h2 className="font-display text-xl font-bold text-brand-secondary mb-4">Tus datos</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Field label="Nombre completo">
                                <input type="text" autoComplete="name" disabled={locked} className={inputClass}
                                    value={buyer.nombre} onChange={setBuyerField('nombre')} />
                            </Field>
                            <Field label="DNI">
                                <input type="text" inputMode="numeric" maxLength={10} placeholder="30123456" disabled={locked} className={`${inputClass} tabular`}
                                    value={buyer.dni} onChange={(e) => setBuyer({ ...buyer, dni: e.target.value.replace(/[^\d.]/g, '') })} />
                            </Field>
                            <Field label="Celular (WhatsApp)">
                                <input type="tel" autoComplete="tel" placeholder="11 1234 5678" disabled={locked} className={`${inputClass} tabular`}
                                    value={buyer.telefono} onChange={setBuyerField('telefono')} />
                            </Field>
                            <Field label="Email (opcional)">
                                <input type="email" autoComplete="email" placeholder="nombre@gmail.com" disabled={locked} className={inputClass}
                                    value={buyer.email} onChange={setBuyerField('email')} />
                            </Field>
                        </div>
                    </section>

                    {isTakeaway ? (
                        <section className="fade-in bg-surface-2 rounded-xl p-5">
                            <h2 className="font-display text-xl font-bold text-brand-secondary mb-2">Dónde retirarlo</h2>
                            <p className="font-semibold text-brand-secondary">{tenant?.nombre || 'Nuestro local'}</p>
                            <p className="text-muted text-sm">{[tenant?.direccion, tenant?.ciudad].filter(Boolean).join(', ')}</p>
                        </section>
                    ) : (
                        <section className="fade-in">
                            <h2 className="font-display text-xl font-bold text-brand-secondary mb-4">Dirección de entrega</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Calle" className="col-span-2">
                                    <input type="text" autoComplete="address-line1" placeholder="Av. Siempreviva" disabled={locked} className={inputClass}
                                        value={address.calle} onChange={setAddressField('calle')} />
                                </Field>
                                <Field label="Altura">
                                    <input type="text" placeholder="742" disabled={locked} className={`${inputClass} tabular`}
                                        value={address.altura} onChange={setAddressField('altura')} />
                                </Field>
                                <Field label="Código postal">
                                    <input type="text" inputMode="numeric" autoComplete="postal-code" placeholder="1602" disabled={locked} className={`${inputClass} tabular`}
                                        value={address.cp} onChange={(e) => setAddress({ ...address, cp: e.target.value.replace(/\D/g, '') })} />
                                </Field>
                                <Field label="Piso (opcional)">
                                    <input type="text" placeholder="3" disabled={locked} className={inputClass}
                                        value={address.piso} onChange={setAddressField('piso')} />
                                </Field>
                                <Field label="Depto (opcional)">
                                    <input type="text" placeholder="B" disabled={locked} className={inputClass}
                                        value={address.depto} onChange={setAddressField('depto')} />
                                </Field>
                                <Field label="Observaciones (opcional)" className="col-span-2">
                                    <input type="text" placeholder="Portón de madera, el timbre no suena…" disabled={locked} className={inputClass}
                                        value={address.observaciones} onChange={setAddressField('observaciones')} />
                                </Field>
                            </div>
                        </section>
                    )}

                    <section>
                        <h2 className="font-display text-xl font-bold text-brand-secondary mb-4">Pago</h2>

                        {preferenceId && (
                            <div className="fade-in space-y-4 mb-4">
                                <Wallet
                                    initialization={{ preferenceId }}
                                    customization={{ texts: { valueProp: 'smart_option' } }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setPreferenceId(null)}
                                    className="press w-full min-h-11 text-center text-muted text-sm font-semibold underline underline-offset-4 hover:text-brand-secondary"
                                >
                                    Modificar mis datos
                                </button>
                            </div>
                        )}

                        <p className="text-sm text-muted">
                            Te llevamos a Mercado Pago para pagar de forma segura.
                        </p>
                    </section>

                    {!preferenceId && (
                        <div className="sticky bottom-0 z-30 -mx-4 px-4 pt-3 pb-safe bg-surface/95 backdrop-blur-sm border-t border-line sm:mx-0 sm:px-0 sm:pt-0 sm:pb-0 sm:bg-transparent sm:border-0 sm:static">
                            {error && (
                                <div role="alert" className="fade-in mb-3 flex items-start gap-3 bg-red-50 text-red-900 rounded-xl p-3.5 text-sm">
                                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                                    {error}
                                </div>
                            )}
                            {!localAbierto && !error && (
                                <div role="alert" className="mb-3 flex items-start gap-3 bg-red-50 text-red-900 rounded-xl p-3.5 text-sm">
                                    <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                                    {tenant?.estado?.mensaje || 'El local está cerrado.'} No podemos tomar tu pedido ahora.
                                </div>
                            )}
                            <button
                                onClick={handleCreatePreference}
                                disabled={loading || !localAbierto}
                                className="press w-full bg-brand hover:bg-brand-hover text-on-brand h-14 rounded-xl font-semibold text-base sm:text-lg disabled:opacity-70"
                            >
                                {loading ? 'Preparando el pago…' : !localAbierto ? 'Local cerrado' : `Pagar $${finalTotal.toLocaleString()}`}
                            </button>
                        </div>
                    )}
                </div>

                <aside className="order-first lg:order-none lg:sticky lg:top-32 bg-white rounded-2xl p-5 sm:p-6 shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]">
                    <h2 className="font-display text-xl font-bold text-brand-secondary mb-3 lg:mb-5">Tu pedido <span className="lg:hidden text-muted font-sans text-sm font-medium">· {cart.reduce((n, i) => n + i.quantity, 0)} productos</span></h2>

                    <ul className="hidden lg:block space-y-3 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {cart.map((item) => (
                            <li key={item.cartItemId || item.id_producto} className="flex justify-between gap-4 text-sm">
                                <span className="text-brand-secondary">
                                    <span className="tabular font-semibold">{item.quantity}×</span> {item.nombre}
                                    {textoTamano(item.tamano) && <span className="text-muted"> ({textoTamano(item.tamano)})</span>}
                                    {(item.detalleTexto || []).map(l => <span key={l} className="block text-xs text-muted">{l}</span>)}
                                    {item.observacion && <span className="block text-xs text-amber-800">“{item.observacion}”</span>}
                                </span>
                                <span className="tabular font-semibold shrink-0">${(item.precio * item.quantity).toLocaleString()}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-line pt-4 space-y-2 text-sm">
                        <div className="flex justify-between text-muted">
                            <span>Subtotal</span>
                            <span className="tabular">${total.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-muted">
                            <span>Envío</span>
                            <span className={`tabular ${shippingCost === 0 ? 'text-green-700 font-semibold' : ''}`}>
                                {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toLocaleString()}`}
                            </span>
                        </div>
                        <div className="flex justify-between items-baseline pt-3 border-t border-line">
                            <span className="font-semibold text-brand-secondary">Total</span>
                            <span className="tabular font-display text-3xl font-extrabold text-brand-secondary">${finalTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </aside>

            </div>
        </div>
    );
};

export default Checkout;
