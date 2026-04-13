import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
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

// Inicializar MP con la Public Key
initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [preferenceId, setPreferenceId] = useState(null);
    
    // Estados para edición de dirección
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [newAddress, setNewAddress] = useState(user.direccion || user.direccion_principal || '');

    // Si el carrito está vacío, lo mandamos al Home
    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
        }
    }, [cart, navigate]);

    const handleUpdateAddress = async () => {
        if (!newAddress.trim()) return;
        setLoading(true);
        try {
            await api.put(`/clientes/${user.id_cliente}`, { direccion: newAddress });
            updateUser({ direccion_principal: newAddress, direccion: newAddress });
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
                total: total,
                estado: 'Pendiente', 
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
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-orange-600 transition-colors mb-2">
                        <ArrowLeft size={14} /> Volver al Menú
                    </button>
                    <h1 className="text-4xl font-black italic tracking-tighter text-gray-800">FINALIZAR COMPRA</h1>
                </div>
                <div className="bg-orange-50 border border-orange-100 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <div className="bg-orange-600 p-2 rounded-full text-white">
                        <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Compra Segura</p>
                        <p className="text-xs font-bold text-gray-700">Tu sesión está activa</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LADO IZQUIERDO: Datos de Entrega */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <MapPin className="text-orange-600" /> Datos de Entrega
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Nombre</p>
                                <p className="font-bold text-gray-800">{user.nombre}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">WhatsApp</p>
                                <p className="font-bold text-gray-800">{user.telefono}</p>
                            </div>
                            <div className="bg-gray-50 p-5 rounded-3xl border border-gray-100 md:col-span-2 flex flex-col gap-2">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Direccion de Envio</p>
                                {isEditingAddress ? (
                                    <div className="flex gap-2">
                                        <input 
                                            type="text"
                                            className="flex-1 bg-white border-2 border-orange-100 p-2 rounded-xl outline-none focus:border-orange-600 font-bold text-gray-800"
                                            value={newAddress}
                                            onChange={(e) => setNewAddress(e.target.value)}
                                            autoFocus
                                        />
                                        <button 
                                            onClick={handleUpdateAddress}
                                            disabled={loading}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase"
                                        >
                                            Guardar
                                        </button>
                                        <button 
                                            onClick={() => setIsEditingAddress(false)}
                                            className="bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-black text-xs uppercase"
                                        >
                                            X
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-between items-center">
                                        <p className="font-bold text-gray-800">{user.direccion || user.direccion_principal}</p>
                                        <button 
                                            onClick={() => setIsEditingAddress(true)}
                                            className="text-orange-600 font-bold text-xs uppercase tracking-widest hover:underline"
                                        >
                                            Cambiar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                        <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                            <CreditCard className="text-orange-600" /> Método de Pago
                        </h2>
                        
                        {!preferenceId ? (
                            <button
                                onClick={handleCreatePreference}
                                disabled={loading}
                                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-6 rounded-3xl font-black text-xl shadow-xl shadow-orange-100 flex items-center justify-center gap-3 transition-all active:scale-95 animate-in fade-in"
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
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-28 shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MessageCircle className="text-orange-500" size={20} /> Resumen
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
                            <div className="flex justify-between text-green-400 text-xs font-bold uppercase tracking-widest">
                                <span>Envío</span>
                                <span>¡Gratis!</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xl font-black">Total</span>
                                <span className="text-3xl font-black text-orange-500">${total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;