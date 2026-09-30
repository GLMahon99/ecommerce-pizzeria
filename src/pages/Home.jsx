import { useState, useEffect } from 'react';
import { Clock, MapPin } from 'lucide-react';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import { useTenant } from '../context/TenantContext';
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
    const { tenant } = useTenant();
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

    const filteredProducts = activeCategory === 'Todas'
        ? productos
        : productos.filter(p => p.categoria === activeCategory);

    const address = tenant?.direccion
        ? `${tenant.direccion}${tenant.ciudad ? `, ${tenant.ciudad}` : ''}`
        : null;

    return (
        <div className="pt-28 px-4 sm:px-6 max-w-6xl mx-auto min-h-screen">
            <header className="pt-3 sm:pt-10 pb-5 sm:pb-10 max-w-2xl">
                <h1 className="font-display text-[2.5rem] sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-brand-secondary">
                    ¿Qué comemos <span className="text-brand">hoy?</span>
                </h1>
                <p className="mt-2 sm:mt-4 text-muted text-[15px] sm:text-lg leading-relaxed max-w-[52ch]">
                    Elegí del menú de {tenant?.nombre || 'la casa'} y lo recibís en tu puerta.
                </p>
                {(address || tenant?.horarios_atencion) && (
                    <div className="mt-3 sm:mt-5 flex flex-wrap gap-x-6 gap-y-1.5 text-[13px] sm:text-sm text-muted">
                        {tenant?.horarios_atencion && (
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

            <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

            <div
                key={activeCategory}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 sm:gap-y-8 pt-4 sm:pt-8 pb-28 sm:pb-24"
            >
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
                ) : filteredProducts.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <p className="font-display text-xl font-bold text-brand-secondary">No hay productos en esta categoría</p>
                        <button
                            onClick={() => setActiveCategory('Todas')}
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
