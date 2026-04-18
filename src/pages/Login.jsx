import React, { useState } from 'react';
import { 
    Phone, 
    ChevronRight, 
    ShieldCheck, 
    User, 
    MapPin, 
    ArrowLeft,
    CheckCircle2
} from 'lucide-react';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const { tenant } = useTenant();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Tel, 2: Registro, 3: OTP
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        telefono: '',
        nombre: '',
        direccion: ''
    });
    
    const [otp, setOtp] = useState('');

    const handleCheckPhone = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const response = await api.get(`/clientes/buscar?telefono=${formData.telefono}`);
            
            if (response.data) {
                // Cliente existe
                setFormData({
                    ...formData,
                    nombre: response.data.nombre,
                    direccion: response.data.direccion
                });
                setStep(3); // Ir directo a OTP
            } else {
                // Cliente nuevo
                setStep(2); // Ir a registro
            }
        } catch (err) {
            console.error(err);
            setStep(2); // Asumimos nuevo si falla la búsqueda por ahora
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (formData.nombre && formData.direccion) {
            setStep(3);
        }
    };

    const handleVerifyOtp = async () => {
        setLoading(true);
        // Simulamos la verificación de WhatsApp (OTP)
        setTimeout(async () => {
            try {
                // Si el cliente no existía, lo creamos
                let finalUser;
                const check = await api.get(`/clientes/buscar?telefono=${formData.telefono}`);
                
                if (!check.data) {
                    const regResponse = await api.post('/clientes/registrar', {
                        nombre: formData.nombre,
                        telefono: formData.telefono,
                        direccion: formData.direccion,
                        empresa_id: tenant.id_empresa // Vincular al cliente con esta pizzería
                    });
                    finalUser = { 
                        id_cliente: regResponse.data.id_cliente,
                        ...formData 
                    };
                } else {
                    finalUser = check.data;
                }

                login(finalUser);
                // Una vez logueado, lo mandamos al checkout de su pizzería
                navigate(`/${tenant?.slug}/checkout`);
            } catch (err) {
                setError('Error al iniciar sesión. Intentá de nuevo.');
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Círculos decorativos de fondo */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl opacity-50"></div>

            <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl shadow-brand/20 border border-white p-8 md:p-12 relative z-10 transition-all duration-500">
                
                {/* Logo / Header */}
                <div className="text-center mb-10">
                    {tenant?.logo_url ? (
                        <div className="mb-6">
                            <img 
                                src={tenant.logo_url} 
                                alt={tenant?.nombre} 
                                className="h-24 w-auto mx-auto object-contain rounded-2xl drop-shadow-xl"
                            />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-brand rounded-3xl rotate-12 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand/20">
                            <span className="text-white text-4xl font-black italic -rotate-12">
                                {(tenant?.nombre || 'P')[0]}
                            </span>
                        </div>
                    )}
                    <h1 className="text-3xl font-black italic tracking-tighter text-brand-secondary uppercase">
                        {tenant?.nombre || 'TIENDA'}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-2">Acceso Exclusivo Clientes</p>
                </div>

                {/* Paso 1: Teléfono */}
                {step === 1 && (
                    <form onSubmit={handleCheckPhone} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tu Celular (WhatsApp)</label>
                            <div className="relative">
                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input
                                    type="tel"
                                    required
                                    placeholder="Ej: 11 1234 5678"
                                    className="w-full bg-gray-50 border-2 border-gray-100 p-5 pl-14 rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-bold text-lg"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-secondary hover:bg-black text-white py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 group shadow-xl"
                        >
                            {loading ? 'Verificando...' : 'Entrar a la Tienda'} <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>
                )}

                {/* Paso 2: Registro */}
                {step === 2 && (
                    <form onSubmit={handleRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <button onClick={() => setStep(1)} className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase tracking-widest hover:text-brand transition-colors">
                            <ArrowLeft size={14} /> Volver
                        </button>
                        <h2 className="text-xl font-black text-brand-secondary">¡Bienvenido! Danos tus datos para el envío</h2>
                        
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 p-5 pl-14 rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-bold"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Dirección de Entrega</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 p-5 pl-14 rounded-2xl focus:border-brand focus:bg-white outline-none transition-all font-bold"
                                        value={formData.direccion}
                                        onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-brand hover:bg-brand-hover text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand/10"
                        >
                            Continuar
                        </button>
                    </form>
                )}

                {/* Paso 3: OTP */}
                {step === 3 && (
                    <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                        <div className="text-center space-y-2">
                            <div className="bg-brand/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-brand border-4 border-white shadow-lg">
                                <ShieldCheck size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-brand-secondary tracking-tight">Verificá tu WhatsApp</h3>
                            <p className="text-gray-400 font-medium text-sm">
                                Te enviamos un código al <br />
                                <span className="text-brand-secondary font-black">{formData.telefono}</span>
                            </p>
                        </div>

                        <div className="space-y-4 max-w-xs mx-auto">
                            <input
                                type="text"
                                maxLength="4"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="0000"
                                className="w-full bg-gray-50 border-2 border-gray-100 p-6 rounded-3xl text-center text-4xl font-black tracking-[0.5em] focus:border-brand focus:bg-white outline-none transition-all placeholder:text-gray-200"
                            />
                        </div>

                        <button
                            onClick={handleVerifyOtp}
                            disabled={otp.length < 4 || loading}
                            className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 shadow-xl ${
                                otp.length === 4 
                                ? 'bg-brand text-white shadow-brand/10 hover:bg-brand-hover' 
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                            }`}
                        >
                            {loading ? 'Verificando...' : 'Confirmar y Entrar'} <CheckCircle2 size={20} />
                        </button>

                        <button onClick={() => setStep(1)} className="w-full text-center text-gray-400 text-xs font-black uppercase tracking-widest hover:text-brand transition-colors">
                            ¿Cambiar número?
                        </button>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 text-center text-xs font-bold mt-4 animate-bounce">{error}</p>
                )}
            </div>

            {/* Footer decorativo */}
            <p className="absolute bottom-8 text-gray-300 text-[10px] font-black uppercase tracking-[0.5em] text-center w-full">
                Sabor Artesanal & Tecnología Premium
            </p>
        </div>
    );
};

export default Login;
