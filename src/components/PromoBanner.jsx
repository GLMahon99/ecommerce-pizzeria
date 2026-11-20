import { Flame, X } from 'lucide-react';
import { etiquetaPromo } from '../utils/promos';

const formatFin = (ymd) => ymd.split('-').reverse().slice(0, 2).join('/');

const alcance = (p) => {
    if (p.aplica_a === 'TODOS') return 'En todo el menú';
    const n = (p.producto_ids || []).length;
    return n === 1 ? 'En 1 producto' : `En ${n} productos`;
};

// Tira de promociones vigentes arriba del menú. Tocar una filtra el menú a los productos que la tienen.
const PromoBanner = ({ promos, activa, onSelect }) => {
    if (!promos?.length) return null;

    return (
        <section aria-label="Promociones vigentes" className="mb-5 sm:mb-8">
            <h2 className="flex items-center gap-2 font-display text-lg sm:text-xl font-extrabold text-brand-secondary mb-3">
                <Flame size={20} className="text-red-600" aria-hidden="true" /> Promociones de hoy
            </h2>
            <ul className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1 snap-x">
                {promos.map((p) => {
                    const seleccionada = activa === p.id_promocion;
                    return (
                        <li key={p.id_promocion} className="snap-start shrink-0 w-[78%] sm:w-auto sm:min-w-[17rem] sm:max-w-sm">
                            <button
                                type="button"
                                onClick={() => onSelect(seleccionada ? null : p.id_promocion)}
                                aria-pressed={seleccionada}
                                className={`press promo-card w-full h-full flex items-center gap-4 text-left rounded-2xl p-3.5 sm:p-4 text-white shadow-lg shadow-red-600/25 ring-offset-2 ring-offset-surface ${seleccionada ? 'ring-2 ring-red-700' : ''}`}
                            >
                                <span className="shrink-0 min-w-[4.5rem] text-center font-display text-3xl sm:text-4xl font-extrabold tracking-tight leading-none bg-white/15 rounded-xl px-3 py-3">
                                    {p.tipo === 'PORCENTAJE' ? `${Number(p.porcentaje)}%` : etiquetaPromo(p)}
                                    {p.tipo === 'PORCENTAJE' && <span className="block text-xs font-bold tracking-widest mt-1">OFF</span>}
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-display font-extrabold text-base sm:text-lg leading-tight">{p.nombre}</span>
                                    <span className="block text-[13px] text-white/90 mt-0.5">
                                        {alcance(p)}{p.fecha_hasta ? ` · hasta el ${formatFin(p.fecha_hasta)}` : ''}
                                    </span>
                                    <span className="block text-xs font-bold mt-1.5 underline underline-offset-4 decoration-white/50">
                                        {seleccionada ? 'Ver todo el menú' : 'Ver productos'}
                                    </span>
                                </span>
                                {seleccionada && <X size={18} className="shrink-0" aria-hidden="true" />}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};

export default PromoBanner;
