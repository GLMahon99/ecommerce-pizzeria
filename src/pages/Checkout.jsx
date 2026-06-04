import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext'; // Importar Tenant
import {
    MapPin,
    Phone,
    User,
    CheckCircle2,
    MessageCircle,
    ArrowLeft,
    ShieldCheck,
    CreditCard
} from 'lucide-react';
import api from '../api/axiosConfig';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { parseAddress, formatAddress } from '../utils/formatters';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const { tenant } = useTenant(); // Obtener datos del tenant
    const navigate = useNavigate();

    const [deliveryMethod, setDeliveryMethod] = useState('delivery'); // 'delivery' or 'takeaway'

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

    const [loading, setLoading] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    
    // Estados para edición de dirección
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [addressFields, setAddressFields] = useState({
        calle: '',
        altura: '',
        piso: '',
        depto: '',
        cp: '',
        observaciones: ''
    });

    useEffect(() => {
        if (user) {
            setAddressFields(parseAddress(user.direccion_principal || user.direccion));
        }
    }, [user]);

    // 1. SI NO HAY USUARIO, REDIRIGIR AL LOGIN
    useEffect(() => {
        if (!user) {
            navigate(`/${tenant?.slug}/login`);
        }
    }, [user, navigate, tenant]);

    // 2. Si el carrito está vacío, lo mandamos al Home
    useEffect(() => {
        if (cart.length === 0) {
            navigate(`/${tenant?.slug}`);
        }
    }, [cart, navigate, tenant]);

    const handleUpdateAddress = async () => {
        if (!addressFields.calle.trim() || !addressFields.altura.trim()) {
            alert('Por favor ingresa al menos calle y altura.');
            return;
        }
        setLoading(true);
        try {
            const serializedAddr = JSON.stringify(addressFields);
            await api.put(`/clientes/${user.id_cliente}`, { direccion: serializedAddr });
            updateUser({ direccion_principal: serializedAddr, direccion: serializedAddr });
            setIsEditingAddress(false);
        } catch (error) {
            console.error('Error al actualizar dirección:', error);
            alert('No se pudo actualizar la dirección.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePreference = async () => {
        setLoading(true);
        try {
            // 1. Guardar el pedido en nuestra base de datos
            const orderData = {
                id_cliente: user.id_cliente, 
                total: finalTotal,
                estado: 'Pendiente', 
                metodo_entrega: deliveryMethod,
                items: cart.map(item => ({
                    id_producto: item.id_producto,
                    cantidad: item.quantity,
                    precio: item.precio
                }))
            };


            const orderResponse = await api.post('/pedidos', orderData);
            const { id_pedido } = orderResponse.data;

            // 2. Crear la preferencia de Mercado Pago
            const paymentResponse = await api.post('/payments/create-preference', {
                orderId: id_pedido,
                items: cart
            });

            const { id } = paymentResponse.data;
            setPreferenceId(id);

        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            alert('Hubo un error al procesar tu pedido.');
        } finally {
            setLoading(false);
        }
    };



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
                        <p className="text-xs font-bold text-gray-700">Tu sesión está activa</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LADO IZQUIERDO: Datos de Entrega */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-brand-secondary mb-6 flex items-center gap-3">
                            <MapPin className="text-brand" /> Datos de Entrega
                        </h2>
                        
                        {/* Selector de Método de Entrega */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <button
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre</p>
                                <p className="font-bold text-brand-secondary">{user?.nombre}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                <p className="font-bold text-brand-secondary">{user?.telefono}</p>
                            </div>

                            {deliveryMethod === 'takeaway' ? (
                                <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 md:col-span-2 flex flex-col gap-2 animate-in fade-in duration-300">
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
                                <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 md:col-span-2 flex flex-col gap-2">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Dirección de Envío</p>
                                    {isEditingAddress ? (
                                        <div className="flex flex-col gap-4 w-full">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Calle</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. Av. Siempreviva"
                                                        value={addressFields.calle}
                                                        onChange={(e) => setAddressFields({...addressFields, calle: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Altura / Nro</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. 742"
                                                        value={addressFields.altura}
                                                        onChange={(e) => setAddressFields({...addressFields, altura: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Código Postal</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. 1602"
                                                        value={addressFields.cp}
                                                        onChange={(e) => setAddressFields({...addressFields, cp: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Piso (Opcional)</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. 3"
                                                        value={addressFields.piso}
                                                        onChange={(e) => setAddressFields({...addressFields, piso: e.target.value})}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Depto (Opcional)</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. B"
                                                        value={addressFields.depto}
                                                        onChange={(e) => setAddressFields({...addressFields, depto: e.target.value})}
                                                    />
                                                </div>
                                                <div className="col-span-2">
                                                    <label className="text-[9px] font-black text-gray-400 uppercase">Observaciones</label>
                                                    <input 
                                                        type="text"
                                                        className="w-full bg-white border-2 border-brand/20 p-3 rounded-xl outline-none focus:border-brand font-bold text-brand-secondary text-sm"
                                                        placeholder="Ej. Portón de madera, tocar timbre que no suena..."
                                                        value={addressFields.observaciones}
                                                        onChange={(e) => setAddressFields({...addressFields, observaciones: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex gap-2 justify-end">
                                                <button 
                                                    onClick={handleUpdateAddress}
                                                    disabled={loading}
                                                    className="bg-brand text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-md hover:bg-brand-hover active:scale-95 transition-all"
                                                >
                                                    Guardar
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (user) {
                                                            setAddressFields(parseAddress(user.direccion_principal || user.direccion));
                                                        }
                                                        setIsEditingAddress(false);
                                                    }}
                                                    className="bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl font-black text-xs uppercase hover:bg-gray-300 transition-all active:scale-95"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-start gap-4 w-full animate-in fade-in duration-300">
                                            <p className="font-bold text-brand-secondary text-base leading-relaxed">
                                                {formatAddress(parseAddress(user?.direccion || user?.direccion_principal))}
                                            </p>
                                            <button 
                                                onClick={() => setIsEditingAddress(true)}
                                                className="text-brand font-black text-xs uppercase tracking-widest hover:underline flex-shrink-0 pt-1"
                                            >
                                                Cambiar
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-brand-secondary mb-6 flex items-center gap-3">
                            <CreditCard className="text-brand" /> Método de Pago
                        </h2>
                        
                        {!preferenceId ? (
                            <button
                                onClick={handleCreatePreference}
                                disabled={loading}
                                className="w-full bg-brand hover:bg-brand-hover text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-brand/10 flex items-center justify-center gap-3 transition-all active:scale-95 animate-in fade-in"
                            >
                                {loading ? 'Preparando Pago...' : 'Pagar con Mercado Pago'} <CheckCircle2 size={24} />
                            </button>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                                <Wallet 
                                    initialization={{ preferenceId }} 
                                    customization={{ texts: { valueProp: 'smart_option' } }}
                                />
                            </div>
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
                                <div key={item.id_producto} className="flex justify-between items-center text-sm">
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