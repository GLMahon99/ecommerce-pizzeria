import { useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import {
    MapPin,
    Phone,
    User,
    ChevronRight,
    CheckCircle2,
    MessageCircle,
    ArrowLeft,
    ShieldCheck
} from 'lucide-react';
import api from '../api/axiosConfig';

const Checkout = () => {
    const { cart, total, clearCart } = useCart();
    const navigate = useNavigate();

    // Estados para el flujo
    const [step, setStep] = useState(1); // 1: Telefono, 2: Datos, 3: Validación OTP
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        referencias: ''
    });
    const [otp, setOtp] = useState('');

    const [clientId, setClientId] = useState(null);

    // Si el carrito está vacío, lo mandamos al Home
    if (cart.length === 0 && step === 1) {
        navigate('/');
    }

    const handleCheckPhone = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.get(`/clientes/find/${formData.telefono}`);
            if (response.data.found) {
                const c = response.data.client;
                setFormData({
                    ...formData,
                    nombre: c.nombre,
                    direccion: c.direccion_principal,
                });
                setClientId(c.id_cliente);
                setStep(3); // Ya existe -> Validar directamente
            } else {
                setStep(2); // Nuevo -> Pedir datos
            }
        } catch (error) {
            console.error('Error al verificar teléfono:', error);
            alert('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveData = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/clientes', {
                nombre: formData.nombre,
                telefono: formData.telefono,
                direccion_principal: formData.direccion
            });
            setClientId(response.data.id_cliente);
            setStep(3);
        } catch (error) {
            console.error('Error al guardar cliente:', error);
            alert('Hubo un error al guardar tus datos.');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizeOrder = async () => {
        setLoading(true);
        try {
            // 1. Guardar el pedido en nuestra base de datos
            const orderData = {
                id_cliente: clientId, 
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

            const { init_point } = paymentResponse.data;

            // 3. Limpiar carrito y Redirigir a Mercado Pago
            clearCart();
            window.location.href = init_point; // Redirección directa al Checkout Pro

        } catch (error) {
            console.error('Error al procesar el pedido:', error);
            alert('Hubo un error al procesar tu pedido. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto min-h-screen">

            {/* Indicador de Pasos */}
            <div className="flex items-center justify-center gap-4 mb-12">
                <div className={`flex items-center gap-2 font-bold ${step >= 1 ? 'text-orange-600' : 'text-gray-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>1</span>
                    <span className="hidden sm:inline">Teléfono</span>
                </div>
                <div className={`h-[2px] w-8 bg-gray-200 ${step >= 2 && 'bg-orange-600'}`} />
                <div className={`flex items-center gap-2 font-bold ${step >= 2 ? 'text-orange-600' : 'text-gray-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>2</span>
                    <span className="hidden sm:inline">Datos</span>
                </div>
                <div className={`h-[2px] w-8 bg-gray-200 ${step >= 3 && 'bg-orange-600'}`} />
                <div className={`flex items-center gap-2 font-bold ${step >= 3 ? 'text-orange-600' : 'text-gray-300'}`}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-orange-600 bg-orange-50' : 'border-gray-200'}`}>3</span>
                    <span className="hidden sm:inline">Validar</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                {/* LADO IZQUIERDO: Formulario */}
                <div className="lg:col-span-2">
                    
                    {/* STEP 1: TELÉFONO */}
                    {step === 1 && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in duration-300">
                            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <Phone className="text-orange-600" /> Ingresá tu WhatsApp
                            </h2>

                            <form onSubmit={handleCheckPhone} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tu Número</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                            placeholder="11 1234 5678"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2 px-1">Lo usaremos para confirmar que sos vos y para actualizarte del pedido.</p>
                                </div>

                                <button
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-3xl font-black text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                                >
                                    {loading ? 'Verificando...' : 'Siguiente'} <ChevronRight size={20} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* STEP 2: OTROS DATOS */}
                    {step === 2 && (
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in fade-in slide-in-from-right duration-300">
                            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <MapPin className="text-orange-600" /> Faltan algunos datos
                            </h2>

                            <form onSubmit={handleSaveData} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                            placeholder="Ej: Gastón Mahon"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dirección (Florida / Garín)</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-4 text-gray-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            className="w-full pl-12 p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                            placeholder="Calle y altura..."
                                            value={formData.direccion}
                                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Referencias (Opcional)</label>
                                    <textarea
                                        className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none font-medium"
                                        placeholder="Casa de rejas negras, timbre que no anda..."
                                        rows="2"
                                        value={formData.referencias}
                                        onChange={(e) => setFormData({ ...formData, referencias: e.target.value })}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="py-5 px-6 rounded-3xl font-black text-gray-400 bg-gray-50 hover:bg-gray-100 transition-all flex items-center justify-center"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                    <button
                                        disabled={loading}
                                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-5 rounded-3xl font-black text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95"
                                    >
                                        {loading ? 'Guardando...' : 'Confirmar Datos'} <ChevronRight size={20} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* STEP 3: VALIDACIÓN OTP */}
                    {step === 3 && (
                        <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShieldCheck size={40} className="text-green-600" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 mb-2">Verificá tu WhatsApp</h2>
                            <p className="text-gray-400 mb-8">Enviamos un código de 4 dígitos al <span className="text-gray-800 font-bold">{formData.telefono}</span></p>

                            <div className="max-w-xs mx-auto space-y-6">
                                <input
                                    type="text"
                                    maxLength="4"
                                    className="w-full text-center text-4xl font-black tracking-[1rem] p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-3xl focus:border-orange-500 focus:ring-0 outline-none transition-all"
                                    placeholder="0000"
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <button
                                    onClick={handleFinalizeOrder}
                                    disabled={otp.length < 4 || loading}
                                    className={`w-full py-5 rounded-3xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-lg ${otp.length === 4 ? 'bg-orange-600 text-white shadow-orange-100' : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        }`}
                                >
                                    {loading ? 'Validando...' : 'Pedir Pizza ahora'} <CheckCircle2 size={20} />
                                </button>

                                <button
                                    onClick={() => setStep(1)}
                                    className="text-gray-400 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1 mx-auto hover:text-orange-600"
                                >
                                    <ArrowLeft size={14} /> Corregir Teléfono
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* LADO DERECHO: Resumen (Se mantiene siempre visible) */}
                <div className="lg:col-span-1">
                    <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white sticky top-28 shadow-xl">
                        <h3 className="text-lg font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                            <MessageCircle className="text-orange-500" size={20} /> Resumen
                        </h3>

                        <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
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

                        <p className="mt-8 text-[10px] text-gray-500 text-center uppercase font-bold tracking-widest leading-relaxed">
                            Al confirmar, aceptás que el pedido se enviará a <br /> {formData.direccion || 'tu dirección'}
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Checkout;