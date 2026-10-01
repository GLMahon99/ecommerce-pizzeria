import { useEffect, useRef } from 'react';
import { X, Clock } from 'lucide-react';
import { DIAS_SEMANA, diaHoyArgentina, textoTurnosDelDia } from '../utils/horarios';

/** Ventana con los horarios de toda la semana; resalta el día de hoy */
const HorariosModal = ({ horarios, estado, onClose }) => {
    const closeRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const hoy = diaHoyArgentina();

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    // Solo al abrir: foco, Escape y bloqueo del scroll (no se repite en cada render del padre)
    useEffect(() => {
        closeRef.current?.focus();
        const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = prev;
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="horarios-titulo">
            <div className="absolute inset-0 bg-stone-900/40 fade-in" onClick={onClose} />

            <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl fade-in pb-safe">
                <div className="px-6 h-16 border-b border-line flex items-center justify-between">
                    <h2 id="horarios-titulo" className="font-display text-xl font-extrabold text-brand-secondary flex items-center gap-2">
                        <Clock size={18} className="text-brand" aria-hidden="true" /> Horarios
                    </h2>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="press w-10 h-10 -mr-2 flex items-center justify-center rounded-full text-muted hover:bg-surface-2"
                    >
                        <X size={20} />
                    </button>
                </div>

                {estado && !estado.abierto && estado.tipo === 'cierre_manual' && (
                    <p className="mx-6 mt-4 bg-red-50 text-red-900 rounded-xl p-3 text-sm font-medium">{estado.mensaje}</p>
                )}

                <ul className="px-6 py-3">
                    {DIAS_SEMANA.map(dia => {
                        const texto = textoTurnosDelDia(horarios, dia.id);
                        const esHoy = dia.id === hoy;
                        return (
                            <li
                                key={dia.id}
                                className={`flex justify-between gap-4 py-3 border-b border-line last:border-0 text-sm ${esHoy ? 'font-semibold text-brand-secondary' : 'text-muted'}`}
                            >
                                <span className="flex items-center gap-2">
                                    {dia.nombre}
                                    {esHoy && <span className="text-[10px] uppercase tracking-wider bg-brand text-on-brand px-1.5 py-0.5 rounded">Hoy</span>}
                                </span>
                                <span className={`tabular text-right ${texto ? '' : 'text-stone-400'}`}>{texto || 'Cerrado'}</span>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default HorariosModal;
