import { useEffect, useState, useCallback } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ChevronLeft, Copy, Check, Clock, Landmark, MessageCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext';

const ESTADOS_TRANSFERENCIA = ['Esperando transferencia', 'Transferencia informada', 'Pago no confirmado', 'Vencido'];
const shadow = 'shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]';

const hora = (iso) => new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'America/Argentina/Buenos_Aires' });
const pesos = (n) => `$${Number(n).toLocaleString('es-AR')}`;

const DatoCopiable = ({ label, valor }) => {
    const [copiado, setCopiado] = useState(false);
    if (!valor) return null;
    const copiar = async () => {
        try {
            await navigator.clipboard.writeText(valor);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 2000);
        } catch {
            /* el navegador no permitió copiar: el dato igual se puede seleccionar a mano */
        }
    };
    return (
        <div className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <p className="font-semibold text-brand-secondary tabular break-all select-all">{valor}</p>
            </div>
            <button
                type="button"
                onClick={copiar}
                className="press shrink-0 inline-flex items-center gap-1.5 h-10 px-3 rounded-lg border border-line text-sm font-semibold text-brand-secondary hover:bg-surface-2"
                aria-label={`Copiar ${label}`}
            >
                {copiado ? <Check size={16} className="text-green-700" /> : <Copy size={16} />}
                {copiado ? 'Copiado' : 'Copiar'}
            </button>
        </div>
    );
};

/**
 * Pantalla de pago por transferencia: datos para transferir, aviso "Ya hice la transferencia"
 * y el estado de la verificación del local. Se consulta cada 10 s, así cambia sola cuando el local confirma.
 */
const TransferPayment = () => {
    const { token } = useParams();
    const { tenant } = useTenant();
    const { cart, clearCart } = useCart();
    const [pedido, setPedido] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [noEncontrado, setNoEncontrado] = useState(false);
    const [titular, setTitular] = useState('');
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    // El pedido ya está creado: el carrito se vacía al llegar
    useEffect(() => {
        if (cart.length > 0) clearCart();
    }, [cart.length, clearCart]);

    const cargar = useCallback(async () => {
        try {
            const response = await api.get(`/pedidos/seguimiento/${token}`);
            setPedido(response.data);
            setTitular(prev => prev || response.data.cliente_nombre || '');
        } catch (err) {
            if (err.response?.status === 404) setNoEncontrado(true);
            console.error('Error al cargar el pedido:', err);
        } finally {
            setCargando(false);
        }
    }, [token]);

    useEffect(() => {
        cargar();
        const intervalo = setInterval(cargar, 10000);
        return () => clearInterval(intervalo);
    }, [cargar]);

    const informar = async () => {
        if (titular.trim().length < 2) {
            setError('Ingresá el nombre del titular de la cuenta desde la que transferiste.');
            return;
        }
        setError('');
        setEnviando(true);
        try {
            await api.post(`/pedidos/seguimiento/${token}/informar-transferencia`, { titular: titular.trim() });
            await cargar();
        } catch (err) {
            setError(err.response?.data?.message || 'No pudimos registrar tu aviso. Probá de nuevo.');
            await cargar();
        } finally {
            setEnviando(false);
        }
    };

    if (cargando) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-surface">
                <Loader2 className="animate-spin text-brand" size={32} aria-label="Cargando" />
            </div>
        );
    }

    if (noEncontrado || !pedido) {
        return (
            <div className="pt-36 px-4 max-w-md mx-auto text-center min-h-screen">
                <p className="font-semibold text-brand-secondary">No encontramos este pedido.</p>
                <Link to={`/${tenant?.slug}`} className="text-brand underline underline-offset-4 text-sm">Volver al menú</Link>
            </div>
        );
    }

    // Pago confirmado (o pedido que no es de transferencia): sigue el seguimiento normal del pedido
    if (pedido.metodo_pago !== 'transferencia' || !ESTADOS_TRANSFERENCIA.includes(pedido.estado)) {
        return <Navigate to={`/${tenant?.slug}/status/info/${token}`} replace />;
    }

    const datos = pedido.transferencia || {};
    const whatsappHref = `https://wa.me/${String(tenant?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(
        `¡Hola! Te escribo por mi pedido #${pedido.id_pedido} pagado por transferencia: ${pesos(pedido.total)}` +
        (pedido.transf_titular_origen ? `, desde la cuenta de ${pedido.transf_titular_origen}` : '') + '.'
    )}`;
    const botonWhatsapp = (texto) => (
        <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="press w-full flex items-center justify-center gap-2 bg-[#1f7a4d] hover:bg-[#186340] text-white h-12 rounded-xl font-semibold"
        >
            <MessageCircle size={20} aria-hidden="true" /> {texto}
        </a>
    );

    const esperando = pedido.estado === 'Esperando transferencia';
    const informada = pedido.estado === 'Transferencia informada';
    const noConfirmado = pedido.estado === 'Pago no confirmado';
    const vencido = pedido.estado === 'Vencido';

    return (
        <div className="pt-28 pb-20 px-4 sm:px-6 max-w-xl mx-auto min-h-screen">
            <Link to={`/${tenant?.slug}`} className="press inline-flex items-center gap-1.5 text-muted text-sm font-semibold hover:text-brand-secondary mt-4 mb-6">
                <ChevronLeft size={16} /> Volver al menú
            </Link>

            {(noConfirmado || vencido) && (
                <section role="alert" className={`bg-white rounded-2xl p-6 sm:p-8 ${shadow} space-y-4`}>
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={24} aria-hidden="true" />
                        <div>
                            <h1 className="font-display text-2xl font-extrabold text-brand-secondary">
                                {vencido ? 'Venció el plazo para pagar' : 'No pudimos confirmar tu pago'}
                            </h1>
                            <p className="text-muted mt-1">
                                {vencido
                                    ? 'Si ya transferiste, escribile al local para resolverlo.'
                                    : 'Escribile al local para resolverlo. Tené a mano el comprobante de tu transferencia.'}
                            </p>
                        </div>
                    </div>
                    {botonWhatsapp('Escribir al local por WhatsApp')}
                    <p className="text-xs text-muted text-center">Pedido #{pedido.id_pedido} · {pesos(pedido.total)}</p>
                </section>
            )}

            {informada && (
                <section role="status" className={`bg-white rounded-2xl p-6 sm:p-8 ${shadow} space-y-4`}>
                    <div className="flex items-start gap-3">
                        <Loader2 className="text-brand animate-spin shrink-0 mt-1" size={22} aria-hidden="true" />
                        <div>
                            <h1 className="font-display text-2xl font-extrabold text-brand-secondary">Recibimos tu aviso</h1>
                            <p className="text-muted mt-1">
                                Estamos verificando el pago. Cuando el local lo confirme, tu pedido pasa a preparación y esta pantalla se actualiza sola.
                            </p>
                        </div>
                    </div>
                    <dl className="text-sm divide-y divide-line border-y border-line">
                        <div className="flex justify-between py-2"><dt className="text-muted">Pedido</dt><dd className="font-semibold tabular">#{pedido.id_pedido}</dd></div>
                        <div className="flex justify-between py-2"><dt className="text-muted">Monto</dt><dd className="font-semibold tabular">{pesos(pedido.total)}</dd></div>
                        <div className="flex justify-between gap-4 py-2"><dt className="text-muted">Desde la cuenta de</dt><dd className="font-semibold text-right">{pedido.transf_titular_origen}</dd></div>
                    </dl>
                    {botonWhatsapp('¿Dudas? Escribile al local')}
                </section>
            )}

            {esperando && (
                <section className={`bg-white rounded-2xl p-6 sm:p-8 ${shadow}`}>
                    <div className="flex items-start gap-3 mb-5">
                        <span className="bg-brand text-on-brand w-11 h-11 rounded-full flex items-center justify-center shrink-0">
                            <Landmark size={20} aria-hidden="true" />
                        </span>
                        <div>
                            <h1 className="font-display text-2xl font-extrabold text-brand-secondary leading-tight">Transferí para confirmar tu pedido</h1>
                            {pedido.vence_en && (
                                <p className="text-sm text-muted mt-1 flex items-center gap-1.5">
                                    <Clock size={14} aria-hidden="true" /> Tenés tiempo hasta las {hora(pedido.vence_en)}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="bg-surface-2 rounded-xl p-4 mb-5 flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-brand-secondary">Monto exacto a transferir</span>
                        <span className="tabular font-display text-3xl font-extrabold text-brand-secondary">{pesos(pedido.total)}</span>
                    </div>
                    {Number(pedido.descuento_transferencia) > 0 && (
                        <p className="text-sm text-green-700 font-semibold -mt-3 mb-5">Incluye {pesos(pedido.descuento_transferencia)} de descuento por pagar con transferencia.</p>
                    )}

                    <div className="divide-y divide-line border-y border-line">
                        <DatoCopiable label="Alias" valor={datos.alias} />
                        <DatoCopiable label="CVU / CBU" valor={datos.cvu} />
                        {datos.titular && (
                            <div className="py-3">
                                <p className="text-xs text-muted">Titular de la cuenta</p>
                                <p className="font-semibold text-brand-secondary">{datos.titular}</p>
                            </div>
                        )}
                    </div>
                    {datos.instrucciones && <p className="text-sm text-muted mt-4">{datos.instrucciones}</p>}

                    <div className="mt-6 pt-6 border-t border-line space-y-3">
                        <label className="block">
                            <span className="block text-sm font-semibold text-brand-secondary mb-1.5">Titular de la cuenta desde la que transferiste</span>
                            <input
                                type="text"
                                maxLength={150}
                                value={titular}
                                onChange={(e) => setTitular(e.target.value)}
                                className="w-full bg-white border border-line px-4 h-12 rounded-xl outline-none text-base text-brand-secondary focus:border-brand focus:ring-2 focus:ring-brand/20"
                            />
                            <span className="block text-xs text-muted mt-1">Cambialo si pagó otra persona: así el local encuentra tu transferencia.</span>
                        </label>
                        {error && (
                            <p role="alert" className="flex items-start gap-2 bg-red-50 text-red-900 rounded-xl p-3 text-sm">
                                <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" aria-hidden="true" /> {error}
                            </p>
                        )}
                        <button
                            type="button"
                            onClick={informar}
                            disabled={enviando}
                            className="press w-full bg-brand hover:bg-brand-hover text-on-brand h-14 rounded-xl font-semibold text-base disabled:opacity-70"
                        >
                            {enviando ? 'Enviando…' : 'Ya hice la transferencia'}
                        </button>
                        <p className="text-xs text-muted text-center">Tocalo recién cuando hayas transferido. El local confirma el pago y empieza a preparar tu pedido.</p>
                    </div>
                </section>
            )}
        </div>
    );
};

export default TransferPayment;
