import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Minus, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const OpcionFila = ({ marcada, unica, deshabilitada, onClick, nombre, extra }) => (
    <li>
        <button
            type="button"
            role={unica ? 'radio' : 'checkbox'}
            aria-checked={marcada}
            disabled={deshabilitada}
            onClick={onClick}
            className="w-full flex items-center gap-3 py-3 text-left text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
            <span className={`w-5 h-5 shrink-0 flex items-center justify-center border-2 transition-colors ${unica ? 'rounded-full' : 'rounded-md'} ${marcada ? 'bg-brand border-brand text-on-brand' : 'border-stone-300'}`}>
                {marcada && <Check size={13} strokeWidth={3} />}
            </span>
            <span className="flex-1 text-brand-secondary">{nombre}</span>
            {extra && <span className="text-xs text-muted tabular">{extra}</span>}
        </button>
    </li>
);

/**
 * Lista de opciones con máximo. `unica` = se elige exactamente una (guarnición).
 * value: ids elegidos (array).
 */
const GrupoOpciones = ({ titulo, regla, opciones, value, onChange, max, unica = false, conPrecio = false, falta = false }) => {
    const lleno = !unica && value.length >= max;
    const toggle = (id) => {
        if (unica) return onChange([id]);
        if (value.includes(id)) return onChange(value.filter(x => x !== id));
        if (!lleno) onChange([...value, id]);
    };
    return (
        <section>
            <div className="flex items-baseline justify-between gap-3 mb-2">
                <h3 className="font-semibold text-brand-secondary">{titulo}</h3>
                <span className={`text-xs font-semibold tabular ${falta ? 'text-brand' : 'text-muted'}`}>{regla}</span>
            </div>
            <ul className="divide-y divide-line border-y border-line">
                {opciones.map(o => {
                    const marcada = value.includes(o.id);
                    return (
                        <OpcionFila
                            key={o.id}
                            nombre={o.nombre}
                            unica={unica}
                            marcada={marcada}
                            deshabilitada={!o.disponible || (!marcada && lleno)}
                            onClick={() => toggle(o.id)}
                            extra={!o.disponible ? 'Sin stock' : conPrecio && o.precio_extra > 0 ? `+$${o.precio_extra.toLocaleString()}` : null}
                        />
                    );
                })}
            </ul>
        </section>
    );
};

const nombresDe = (lista, ids) => lista.filter(o => ids.includes(o.id)).map(o => o.nombre);

/**
 * Ventana para armar un helado (gustos) o una hamburguesa (guarnición, toppings, aderezos, carne extra),
 * con aclaración opcional y cantidad.
 */
const ArmarProductoSheet = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [gustos, setGustos] = useState([]);
    const [toppings, setToppings] = useState([]);
    const [aderezos, setAderezos] = useState([]);
    const [guarnicion, setGuarnicion] = useState([]);
    const [carnes, setCarnes] = useState(0);
    const [observacion, setObservacion] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const closeRef = useRef(null);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    });

    // Solo al abrir: foco, Escape y bloqueo del scroll
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

    const esHelado = product.tipo === 'HELADO';
    const helado = product.helado;
    const burger = product.hamburguesa;

    // Precio unitario y validación de lo obligatorio
    let precio = Number(product.precio);
    let faltante = null;
    const detalleTexto = [];
    if (esHelado) {
        if (gustos.length < 1) faltante = 'Elegí al menos un gusto';
        if (gustos.length) detalleTexto.push(`Gustos: ${nombresDe(helado.gustos, gustos).join(', ')}`);
    } else {
        const g = burger.guarniciones.find(o => o.id === guarnicion[0]);
        precio += (g?.precio_extra || 0) + carnes * burger.precio_carne_extra;
        if (burger.guarniciones.length > 0 && !g) faltante = 'Elegí la guarnición';
        if (g) detalleTexto.push(`Guarnición: ${g.nombre}`);
        if (toppings.length) detalleTexto.push(`Toppings: ${nombresDe(burger.toppings, toppings).join(', ')}`);
        if (aderezos.length) detalleTexto.push(`Aderezos: ${nombresDe(burger.aderezos, aderezos).join(', ')}`);
        if (carnes > 0) detalleTexto.push(`Carne extra: +${carnes}`);
    }
    precio = Math.round(precio * 100) / 100;

    const agregar = () => {
        if (faltante) return;
        const obs = observacion.trim().slice(0, 150);
        const clave = esHelado
            ? `g${[...gustos].sort().join('.')}`
            : `gu${guarnicion.join('')}-t${[...toppings].sort().join('.')}-a${[...aderezos].sort().join('.')}-c${carnes}`;
        addToCart({
            ...product,
            precio,
            tamano: null,
            gustos: esHelado ? gustos : undefined,
            toppings: esHelado ? undefined : toppings,
            aderezos: esHelado ? undefined : aderezos,
            guarnicion: esHelado ? undefined : (guarnicion[0] ?? null),
            carnes_extra: esHelado ? undefined : carnes,
            observacion: obs || undefined,
            detalleTexto,
            cartItemId: `${product.id_producto}-${clave}${obs ? `#obs:${obs.toLowerCase()}` : ''}`
        }, cantidad);
        onClose();
    };

    // Portal al body: la tarjeta tiene una animación con transform que encerraría al `fixed`
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="armar-titulo">
            <div className="absolute inset-0 bg-stone-900/40 fade-in" onClick={onClose} />

            <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl fade-in flex flex-col max-h-[92dvh]">
                <div className="px-6 pt-5 pb-4 border-b border-line flex items-start justify-between gap-4 shrink-0">
                    <div className="min-w-0">
                        <h2 id="armar-titulo" className="font-display text-xl font-extrabold text-brand-secondary leading-tight">{product.nombre}</h2>
                        {product.descripcion && <p className="text-sm text-muted mt-1 line-clamp-2">{product.descripcion}</p>}
                    </div>
                    <button
                        ref={closeRef}
                        onClick={onClose}
                        aria-label="Cerrar"
                        className="press w-10 h-10 -mr-2 -mt-1 flex items-center justify-center rounded-full text-muted hover:bg-surface-2 shrink-0"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1">
                    {esHelado && (
                        <GrupoOpciones
                            titulo="Gustos"
                            regla={`${gustos.length}/${helado.max_gustos} · elegí hasta ${helado.max_gustos}`}
                            opciones={helado.gustos}
                            value={gustos}
                            onChange={setGustos}
                            max={helado.max_gustos}
                            falta={gustos.length < 1}
                        />
                    )}

                    {!esHelado && burger.guarniciones.length > 0 && (
                        <GrupoOpciones
                            titulo="Guarnición"
                            regla="Obligatorio · elegí 1"
                            opciones={burger.guarniciones}
                            value={guarnicion}
                            onChange={setGuarnicion}
                            unica
                            conPrecio
                            falta={guarnicion.length === 0}
                        />
                    )}

                    {!esHelado && burger.toppings.length > 0 && burger.max_toppings > 0 && (
                        <GrupoOpciones
                            titulo="Toppings"
                            regla={`${toppings.length}/${burger.max_toppings} · opcional`}
                            opciones={burger.toppings}
                            value={toppings}
                            onChange={setToppings}
                            max={burger.max_toppings}
                        />
                    )}

                    {!esHelado && burger.aderezos.length > 0 && burger.max_aderezos > 0 && (
                        <GrupoOpciones
                            titulo="Aderezos"
                            regla={`${aderezos.length}/${burger.max_aderezos} · opcional`}
                            opciones={burger.aderezos}
                            value={aderezos}
                            onChange={setAderezos}
                            max={burger.max_aderezos}
                        />
                    )}

                    {!esHelado && burger.max_carnes_extra > 0 && (
                        <section className="flex items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-brand-secondary">Carne extra</h3>
                                <p className="text-xs text-muted">+${burger.precio_carne_extra.toLocaleString()} cada una · hasta {burger.max_carnes_extra}</p>
                            </div>
                            <div className="flex items-center bg-surface-2 rounded-xl">
                                <button type="button" onClick={() => setCarnes(c => Math.max(0, c - 1))} aria-label="Quitar carne" className="press w-10 h-10 flex items-center justify-center text-brand-secondary"><Minus size={15} /></button>
                                <span className="tabular font-bold w-7 text-center">+{carnes}</span>
                                <button type="button" onClick={() => setCarnes(c => Math.min(burger.max_carnes_extra, c + 1))} aria-label="Sumar carne" className="press w-10 h-10 flex items-center justify-center text-brand-secondary"><Plus size={15} /></button>
                            </div>
                        </section>
                    )}

                    <section>
                        <label htmlFor="armar-obs" className="font-semibold text-brand-secondary">Aclaración <span className="text-muted font-normal text-sm">(opcional)</span></label>
                        <textarea
                            id="armar-obs"
                            rows={2}
                            maxLength={150}
                            value={observacion}
                            onChange={(e) => setObservacion(e.target.value)}
                            placeholder={esHelado ? 'Ej: poné el chocolate abajo' : 'Ej: sin cebolla'}
                            className="mt-2 w-full bg-white border border-line px-4 py-3 rounded-xl outline-none text-base text-brand-secondary placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
                        />
                    </section>
                </div>

                <div className="px-6 pt-4 pb-5 border-t border-line flex items-center gap-3 shrink-0 pb-safe">
                    <div className="flex items-center bg-surface-2 rounded-xl">
                        <button type="button" onClick={() => setCantidad(c => Math.max(1, c - 1))} aria-label="Quitar uno" className="press w-11 h-12 flex items-center justify-center text-brand-secondary"><Minus size={16} /></button>
                        <span className="tabular font-bold w-6 text-center">{cantidad}</span>
                        <button type="button" onClick={() => setCantidad(c => Math.min(99, c + 1))} aria-label="Agregar uno más" className="press w-11 h-12 flex items-center justify-center text-brand-secondary"><Plus size={16} /></button>
                    </div>
                    <button
                        type="button"
                        onClick={agregar}
                        disabled={!!faltante}
                        className="press flex-1 bg-brand hover:bg-brand-hover text-on-brand h-12 rounded-xl font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {faltante || `Agregar · $${(precio * cantidad).toLocaleString()}`}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ArmarProductoSheet;
