import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Clock, ArrowUpRight, Store, X } from 'lucide-react';

const shadow = 'shadow-[0_1px_2px_rgb(60_40_10/0.06),0_8px_24px_-12px_rgb(60_40_10/0.12)]';

const StoreDirectory = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const apiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'https://pizzeria-ecommerce-production.up.railway.app/api';
                const response = await axios.get(`${apiUrl}/companies`);
                setCompanies(response.data);
            } catch (err) {
                console.error('Error al cargar tiendas:', err);
                setError('No pudimos cargar la lista de tiendas. Probá de nuevo en un rato.');
            } finally {
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Filtrar tiendas por nombre o por ciudad
    const query = search.trim().toLowerCase();
    const filteredCompanies = companies.filter(company =>
        company.nombre?.toLowerCase().includes(query) ||
        company.ciudad?.toLowerCase().includes(query)
    );

    if (error) {
        return (
            <div className="min-h-[100dvh] flex items-center justify-center bg-surface p-6 flex-col gap-4 text-center">
                <Store size={40} strokeWidth={1.5} className="text-muted" aria-hidden="true" />
                <h1 className="font-display text-3xl font-extrabold text-stone-900">No pudimos cargar las tiendas</h1>
                <p className="max-w-xs text-muted">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="press mt-2 h-12 px-6 bg-stone-900 text-white rounded-xl font-semibold text-sm"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-surface flex flex-col">
            <header className="px-4 sm:px-6 pt-8 sm:pt-14 pb-6 sm:pb-10 bg-[#fde9cc] border-b border-line">
                <div className="max-w-6xl mx-auto">
                    <img
                        src="/logo-acommerr.png"
                        alt="A-COMMERR"
                        className="h-10 sm:h-14 w-auto object-contain mb-6 sm:mb-8"
                    />
                    <h1 className="font-display text-[2.5rem] sm:text-6xl font-extrabold tracking-[-0.03em] leading-[1.02] text-stone-900 max-w-2xl">
                        ¿De dónde pedimos hoy?
                    </h1>
                    <p className="mt-3 text-[#5c4f43] text-[15px] sm:text-lg max-w-[46ch] leading-relaxed">
                        Elegí tu local, armá el pedido y lo recibís en casa o lo retirás.
                    </p>

                    <div className="mt-6 max-w-lg relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" size={20} aria-hidden="true" />
                        <input
                            type="search"
                            aria-label="Buscar tienda por nombre o ciudad"
                            placeholder="Buscar por nombre o ciudad"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full h-14 pl-12 pr-12 bg-white text-stone-900 placeholder:text-stone-500 rounded-2xl border border-transparent focus:border-stone-900 outline-none text-base shadow-[0_8px_24px_-12px_rgb(60_40_10/0.25)] [&::-webkit-search-cancel-button]:hidden"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                aria-label="Limpiar búsqueda"
                                className="press absolute right-1.5 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-muted hover:text-stone-900 rounded-xl"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-grow w-full">
                {!loading && (
                    <p className="text-sm text-muted mb-5" aria-live="polite">
                        {filteredCompanies.length === 1 ? '1 tienda' : `${filteredCompanies.length} tiendas`}
                        {query && ' para tu búsqueda'}
                    </p>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`bg-white rounded-2xl p-5 ${shadow}`}>
                                <div className="flex items-center gap-4">
                                    <div className="skeleton w-16 h-16 rounded-2xl" />
                                    <div className="flex-1 space-y-2.5">
                                        <div className="skeleton h-5 w-2/3 rounded-md" />
                                        <div className="skeleton h-3.5 w-1/2 rounded-md" />
                                    </div>
                                </div>
                                <div className="skeleton h-3.5 w-3/4 rounded-md mt-5" />
                            </div>
                        ))}
                    </div>
                ) : filteredCompanies.length === 0 ? (
                    <div className="py-16 text-center max-w-sm mx-auto">
                        <Store size={40} strokeWidth={1.5} className="text-muted mx-auto mb-4" aria-hidden="true" />
                        <h2 className="font-display text-2xl font-bold text-stone-900">No encontramos esa tienda</h2>
                        <p className="text-muted mt-2">Probá con otro nombre o con la ciudad.</p>
                        {search && (
                            <button onClick={() => setSearch('')} className="press mt-5 h-12 px-6 bg-stone-900 text-white rounded-xl font-semibold text-sm">
                                Ver todas
                            </button>
                        )}
                    </div>
                ) : (
                    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredCompanies.map((company, i) => {
                            const color = company.color_primario || '#1f2937';
                            return (
                                <li key={company.empresa_id} className="rise-in" style={{ '--i': Math.min(i, 8) }}>
                                    <Link
                                        to={`/${company.slug}`}
                                        className={`press group block h-full bg-white rounded-2xl p-5 ${shadow} hover:shadow-[0_1px_2px_rgb(60_40_10/0.06),0_14px_32px_-12px_rgb(60_40_10/0.22)]`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-16 h-16 rounded-2xl shrink-0 flex items-center justify-center overflow-hidden ring-1 ring-black/5"
                                                style={{ backgroundColor: company.logo_url ? '#fff' : color }}
                                            >
                                                {company.logo_url ? (
                                                    <img src={company.logo_url} alt="" className="w-full h-full object-contain p-1.5" />
                                                ) : (
                                                    <Store size={26} className="text-white" aria-hidden="true" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h2 className="font-display text-xl font-bold text-stone-900 leading-tight truncate">{company.nombre}</h2>
                                                <p className="text-sm text-muted truncate">{company.ciudad || 'Pedidos online'}</p>
                                                {company.estado && (
                                                    <span className={`mt-1 inline-flex items-center gap-1.5 text-xs font-semibold ${company.estado.abierto ? 'text-green-700' : 'text-red-700'}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${company.estado.abierto ? 'bg-green-500' : 'bg-red-500'}`} aria-hidden="true" />
                                                        {company.estado.abierto ? 'Abierto ahora' : 'Cerrado'}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white transition-transform duration-200 motion-safe:[@media(hover:hover)]:group-hover:translate-x-0.5 motion-safe:[@media(hover:hover)]:group-hover:-translate-y-0.5"
                                                style={{ backgroundColor: color }}
                                                aria-hidden="true"
                                            >
                                                <ArrowUpRight size={18} />
                                            </span>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-line space-y-1.5 text-sm text-muted">
                                            {company.direccion && (
                                                <p className="flex items-start gap-2">
                                                    <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                    <span>{company.direccion}</span>
                                                </p>
                                            )}
                                            {company.horarios_atencion && (
                                                <p className="flex items-start gap-2">
                                                    <Clock size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                                                    <span className="whitespace-pre-line">{company.horarios_atencion}</span>
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </main>

            <footer className="px-4 sm:px-6 py-6 border-t border-line text-center text-xs text-muted pb-safe">
                © {new Date().getFullYear()} A-COMMERR. Todos los derechos reservados.
            </footer>
        </div>
    );
};

export default StoreDirectory;
