import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import { useTenant } from '../context/TenantContext';
import { useCart } from '../context/CartContext';
import { aplicaA } from '../utils/promos';
import HorariosModal from '../components/HorariosModal';
import { diaHoyArgentina, textoTurnosDelDia } from '../utils/horarios';
import api from '../api/axiosConfig';

const SkeletonCard = () => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_2px_rgb(60_40_10/0.06)]">
        <div className="skeleton aspect-[4/3]" />
        <div className="p-5 space-y-3">
            <div className="skeleton h-5 w-2/3 rounded-md" />
            <div className="skeleton h-3.5 w-full rounded-md" />
            <div className="skeleton h-3.5 w-4/5 rounded-md" />
            <div className="skeleton h-11 w-full rounded-xl mt-4" />
        </div>
    </div>
);

const Home = () => {
    const { tenant, localAbierto } = useTenant();
    const { promos } = useCart();
    const [promoActiva, setPromoActiva] = useState(null);
    const [bannerRoto, setBannerRoto] = useState(false);
    const [horariosOpen, setHorariosOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const response = await api.get('/productos');
                setProductos(response.data);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

    // Si se filtra por una promo que ya no está vigente, el filtro se ignora
    const promoFiltro = promos.find(p => p.id_promocion === promoActiva) || null;
    const filteredProducts = productos
        .filter(p => activeCategory === 'Todas' || p.categoria === activeCategory)
        .filter(p => !promoFiltro || aplicaA(promoFiltro, p.id_producto));
    const verTodo = () => { setActiveCategory('Todas'); setPromoActiva(null); };
    const hayPortada = !!tenant?.banner_url && !bannerRoto;

    const address = tenant?.direccion
        ? `${tenant.direccion}${tenant.ciudad ? `, ${tenant.ciudad}` : ''}`
        : null;

    return (
        <div className="pt-28 px-4 sm:px-6 max-w-6xl mx-auto min-h-screen">
            <header className={hayPortada ? 'pt-3 sm:pt-6 pb-5 sm:pb-8' : 'pt-3 sm:pt-10 pb-5 sm:pb-10 max-w-2xl'}>
                {hayPortada ? (
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-surface-2 aspect-[16/10] sm:aspect-[16/6] shadow-[0_1px_2px_rgb(60_40_10/0.06),0_12px_32px_-12px_rgb(60_40_10/0.25)]">
                        <img
                            src={tenant.banner_url}
                            alt={`Portada de ${tenant?.nombre || 'la tienda'}`}
                            onError={() => setBannerRoto(true)}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/25 to-transparent" aria-hidden="true" />
                        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-10">
                            <h1 className="font-display text-[2rem] sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-white drop-shadow-sm">
                                ¿Qué comemos hoy?
                            </h1>
                        </div>
                    </div>
                ) : (
                    <h1 className="font-display text-[2.5rem] sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-brand-secondary">
                        ¿Qué comemos <span className="text-brand">hoy?</span>
                    </h1>
                )}
                <p className={`mt-3 sm:mt-4 text-muted text-[15px] sm:text-lg leading-relaxed max-w-[52ch]`}>
                    Elegí del menú de {tenant?.nombre || 'la casa'} y {tenant?.acepta_delivery === false ? 'lo retirás en el local' : tenant?.acepta_retiro === false ? 'lo recibís en tu puerta' : 'lo recibís en tu puerta o lo retirás'}.
                </p>
                {(address || tenant?.horarios_atencion || tenant?.estado) && (
                    <div className="mt-3 sm:mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] sm:text-sm text-muted">
                        {tenant?.estado && (
                            <span className={`inline-flex items-center gap-2 font-semibold ${localAbierto ? 'text-green-700' : 'text-red-700'}`}>
                                <span className={`w-2 h-2 rounded-full ${localAbierto ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
                                {localAbierto
                                    ? (tenant.estado.cierra_a ? `Abierto · cierra ${tenant.estado.cierra_a}` : 'Abierto')
                                    : 'Cerrado'}
                            </span>
                        )}
                        {tenant?.horarios ? (
                            <span className="flex items-center gap-2">
                                <Clock size={16} className="text-brand shrink-0" aria-hidden="true" />
                                <span>Hoy: <span className="tabular">{textoTurnosDelDia(tenant.horarios, diaHoyArgentina()) || 'Cerrado'}</span></span>
                                <button
                                    type="button"
                                    onClick={() => setHorariosOpen(true)}
                                    className="press font-semibold text-brand underline underline-offset-4 decoration-brand/40 hover:decoration-brand"
                                >
                                    Horarios
                                </button>
                            </span>
                        ) : tenant?.horarios_atencion && (
                            <span className="flex items-center gap-2">
                                <Clock size={16} className="text-brand shrink-0" aria-hidden="true" />
                                <span className="whitespace-pre-line">{tenant.horarios_atencion}</span>
                            </span>
                        )}
                        {address && (
                            <span className="flex items-center gap-2">
                                <MapPin size={16} className="text-brand shrink-0" aria-hidden="true" />
                                {address}
                            </span>
                        )}
                    </div>
                )}
            </header>

            {horariosOpen && (
                <HorariosModal horarios={tenant?.horarios} estado={tenant?.estado} onClose={() => setHorariosOpen(false)} />
            )}

            <PromoBanner promos={promos} activa={promoFiltro?.id_promocion ?? null} onSelect={setPromoActiva} />

            <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

            <div
                key={activeCategory}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 sm:gap-y-8 pt-4 sm:pt-8 pb-28 sm:pb-24"
            >
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <p className="font-display text-xl font-bold text-brand-secondary">{promoFiltro ? 'No hay productos de esta promo en esta categoría' : 'No hay productos en esta categoría'}</p>
                        <button
                            onClick={verTodo}
                            className="press mt-4 text-sm font-semibold text-brand-secondary underline underline-offset-4"
                        >
                            Ver todo el menú
                        </button>
                    </div>
                ) : (
                    filteredProducts.map((p, i) => (
                        <ProductCard key={p.id_producto} product={p} index={i} />
                    ))
                )}
            </div>
        </div>
    );
};

export default Home;
