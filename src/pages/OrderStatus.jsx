import { useEffect, useState } from 'react';
import {
    CheckCircle2,
    Clock,
    MapPin,
    UtensilsCrossed,
    Bike,
    MessageCircle,
    ChevronLeft,
    X
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useParams } from 'react-router-dom';

const OrderStatus = () => {
    const { result } = useParams();
    // En un caso real, estos datos vendrían del backend según el ID en la URL
    const [status, setStatus] = useState(result === 'success' ? 'recibido' : 'preparando'); 
    const [timeLeft, setTimeLeft] = useState(35); 

    const steps = [
        { id: 'recibido', label: 'Pedido Recibido', icon: <CheckCircle2 size={20} />, time: '12:45' },
        { id: 'preparando', label: 'En la Cocina', icon: <UtensilsCrossed size={20} />, time: '12:50' },
        { id: 'en camino', label: 'Repartidor en Camino', icon: <Bike size={20} />, time: '--:--' },
        { id: 'entregado', label: '¡Entregado!', icon: <MapPin size={20} />, time: '--:--' },
    ];

    // Buscamos el índice del estado actual para pintar el progreso
    const currentStepIndex = steps.findIndex(s => s.id === status);

    return (
        <div className="pt-28 pb-20 px-4 max-w-2xl mx-auto min-h-screen">

            {/* Botón Volver */}
            <Link to="/" className="inline-flex items-center gap-2 text-gray-400 font-bold text-sm mb-6 hover:text-orange-600 transition-colors">
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
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-orange-100/50 border border-orange-50 overflow-hidden">

                {/* Header con Tiempo Estimado */}
                <div className="bg-orange-600 p-10 text-center text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        {/* Patrón de fondo opcional */}
                        <div className="grid grid-cols-6 gap-4 p-4">
                            {[...Array(12)].map((_, i) => <UtensilsCrossed key={i} size={40} />)}
                        </div>
                    </div>

                    <p className="text-orange-100 text-xs font-black uppercase tracking-[0.2em] mb-2">Llegada estimada</p>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Clock size={32} className="text-orange-200" />
                        <h1 className="text-6xl font-black italic tracking-tighter">{timeLeft}</h1>
                        <span className="text-2xl font-bold italic">MIN</span>
                    </div>
                    <p className="text-orange-100 text-sm font-medium">Tu pedido en Florida está siendo mimado</p>
                </div>

                {/* Tracker (Línea de tiempo) */}
                <div className="p-8 md:p-12">
                    <div className="relative space-y-8">
                        {/* Línea vertical de fondo */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-100" />

                        {steps.map((step, index) => {
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.id} className="flex items-start gap-6 relative">
                                    {/* Círculo del paso */}
                                    <div className={`
                    z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                    ${isCompleted ? 'bg-orange-600 border-orange-100 text-white' : 'bg-white border-gray-100 text-gray-200'}
                    ${isCurrent ? 'ring-4 ring-orange-50 animate-pulse' : ''}
                  `}>
                                        {step.icon}
                                    </div>

                                    {/* Texto del paso */}
                                    <div className="flex-1 pt-1">
                                        <div className="flex justify-between items-center">
                                            <h3 className={`font-black text-lg ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>
                                                {step.label}
                                            </h3>
                                            <span className="text-xs font-bold text-gray-400 tracking-tighter">{step.time}</span>
                                        </div>
                                        {isCurrent && (
                                            <p className="text-orange-600 text-sm font-bold mt-1">
                                                {step.id === 'preparando' ? 'El horno está a 450°C...' : '¡Ya casi llega!'}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <hr className="my-10 border-gray-100" />

                    {/* Acciones de Ayuda */}
                    <div className="space-y-4">
                        <h4 className="text-center text-xs font-black text-gray-400 uppercase tracking-widest">¿Necesitás ayuda con tu pedido?</h4>
                        <a
                            href="https://wa.me/tu-numero-de-pizzeria"
                            className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-green-100 active:scale-95"
                        >
                            <MessageCircle size={20} /> Hablar con el local
                        </a>
                    </div>
                </div>
            </div>

            {/* Resumen Corto del Pedido */}
            <div className="mt-8 bg-gray-900 rounded-3xl p-6 text-white flex justify-between items-center">
                <div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pedido #2045</p>
                    <p className="font-bold">2x Muzza + 1x Coca Cola</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Total Pagado</p>
                    <p className="text-xl font-black text-orange-500">$12.500</p>
                </div>
            </div>

        </div>
    );
};

export default OrderStatus;