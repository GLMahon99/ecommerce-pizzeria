import { useState } from 'react';
import { useCart } from '../context/CartContext';

/** Aclaración del comprador en un ítem del carrito (ej: "sin rúcula") */
const AclaracionItem = ({ item }) => {
    const { setObservacion } = useCart();
    const [editando, setEditando] = useState(false);
    const [texto, setTexto] = useState(item.observacion || '');
    const id = item.cartItemId || item.id_producto;

    const guardar = () => {
        setObservacion(id, texto);
        setEditando(false);
    };

    if (editando) {
        return (
            <div className="mt-1.5 flex gap-2">
                <input
                    type="text"
                    autoFocus
                    maxLength={150}
                    value={texto}
                    onChange={(e) => setTexto(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') guardar();
                        if (e.key === 'Escape') { setTexto(item.observacion || ''); setEditando(false); }
                    }}
                    placeholder="Ej: sin rúcula"
                    aria-label={`Aclaración para ${item.nombre}`}
                    className="flex-1 min-w-0 bg-white border border-line px-3 h-10 rounded-lg outline-none text-base text-brand-secondary placeholder:text-stone-400 focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
                <button type="button" onClick={guardar} className="press px-3 h-10 rounded-lg bg-brand-secondary text-white text-xs font-semibold">
                    Listo
                </button>
            </div>
        );
    }

    return item.observacion ? (
        <button type="button" onClick={() => setEditando(true)} className="block text-left text-xs text-amber-800 mt-0.5 hover:underline">
            “{item.observacion}” · editar
        </button>
    ) : (
        <button type="button" onClick={() => setEditando(true)} className="block text-xs font-semibold text-brand-secondary underline underline-offset-4 decoration-line hover:decoration-brand mt-0.5 py-1">
            Agregar aclaración
        </button>
    );
};

export default AclaracionItem;
