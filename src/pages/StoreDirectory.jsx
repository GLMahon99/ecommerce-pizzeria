import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Clock, ArrowRight, Store } from 'lucide-react';

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
                setLoading(false);
            } catch (err) {
                console.error('Error al cargar tiendas:', err);
                setError('No pudimos cargar la lista de tiendas. Por favor, reintentá en unos momentos.');
                setLoading(false);
            }
        };

        fetchCompanies();
    }, []);

    // Filtrar tiendas por nombre o por ciudad
    const filteredCompanies = companies.filter(company => 
        company.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        company.ciudad?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                {/* Header Skeleton */}
                <div className="bg-gray-900 py-16 px-4 animate-pulse text-center">
                    <div className="h-6 w-32 bg-gray-800 rounded-full mx-auto mb-4"></div>
                    <div className="h-10 w-64 bg-gray-800 rounded-lg mx-auto mb-4"></div>
                    <div className="h-12 max-w-md bg-gray-800 rounded-2xl mx-auto mt-8"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm p-6 space-y-4 animate-pulse">
                                <div className="h-24 bg-gray-100 -m-6 mb-6"></div>
                                <div className="w-20 h-20 bg-gray-200 rounded-2xl border-4 border-white -mt-14 relative z-10"></div>
                                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                <div className="space-y-2 mt-4">
                                    <div className="h-4 w-1/2 bg-gray-100 rounded"></div>
                                    <div className="h-4 w-2/3 bg-gray-100 rounded"></div>
                                </div>
                                <div className="h-10 w-full bg-gray-200 rounded-xl mt-6"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 flex-col gap-4 text-center">
                <div className="bg-red-50 p-4 rounded-full text-red-500">
                    <Store size={48} />
                </div>
                <h1 className="text-3xl font-black text-gray-800 uppercase tracking-tight">¡Vaya!</h1>
                <p className="max-w-xs font-bold text-gray-500">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-black transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden border-b border-gray-850">
                {/* Fondo de patrón sutil */}
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <span className="bg-white/10 text-gray-300 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/5">
                        Portal de Tiendas
                    </span>
                    <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter mt-6 mb-4">
                        A-COMMERR <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Stores</span>
                    </h1>
                    <p className="text-gray-400 font-medium text-xs sm:text-sm max-w-md mx-auto">
                        Elegí tu sucursal favorita, ordená online en minutos y disfrutá de la mejor experiencia gastronómica.
                    </p>

                    {/* Buscador */}
                    <div className="mt-8 w-full max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-400 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ciudad..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white/5 hover:bg-white/10 focus:bg-white text-white focus:text-gray-900 rounded-2xl border border-white/15 focus:border-white transition-all outline-none font-bold text-xs tracking-wide shadow-2xl backdrop-blur-md"
                        />
                    </div>
                </div>
            </div>

            {/* Listado de Tiendas */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow w-full">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Tiendas disponibles ({filteredCompanies.length})
                    </h2>
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-700 transition-colors"
                        >
                            Limpiar búsqueda
                        </button>
                    )}
                </div>

                {filteredCompanies.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center max-w-md mx-auto shadow-sm flex flex-col items-center">
                        <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 mb-4">
                            <Store size={36} />
                        </div>
                        <h3 className="text-lg font-black uppercase text-gray-800">No encontramos resultados</h3>
                        <p className="text-xs text-gray-400 font-bold mt-2 max-w-xs">
                            No hay tiendas que coincidan con tu búsqueda. Intentá con otro nombre o ciudad.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCompanies.map(company => (
                            <div 
                                key={company.empresa_id}
                                className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-250 transition-all duration-300 flex flex-col group"
                            >
                                {/* Banner de Tienda con su color corporativo */}
                                <div 
                                    className="h-24 w-full relative transition-colors duration-300"
                                    style={{ backgroundColor: company.color_primario || '#1f2937' }}
                                >
                                    <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[size:16px_16px]"></div>
                                </div>

                                {/* Logo superpuesto */}
                                <div className="px-6 -mt-10 relative z-10 flex justify-between items-end">
                                    <div className="w-20 h-20 bg-white rounded-2xl p-1 shadow-md border border-gray-100 flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105">
                                        {company.logo_url ? (
                                            <img 
                                                src={company.logo_url} 
                                                alt={company.nombre} 
                                                className="w-full h-full object-contain rounded-xl"
                                            />
                                        ) : (
                                            <div 
                                                className="w-full h-full rounded-xl flex items-center justify-center text-white"
                                                style={{ backgroundColor: company.color_primario || '#1f2937' }}
                                            >
                                                <Store size={28} />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <span className="text-[8px] font-black uppercase tracking-widest bg-gray-50 border border-gray-100 text-gray-400 px-3 py-1 rounded-full mb-1">
                                        {company.ciudad || 'Online'}
                                    </span>
                                </div>

                                {/* Contenido */}
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-gray-800 group-hover:text-blue-500 transition-colors">
                                            {company.nombre}
                                        </h3>

                                        <div className="mt-4 space-y-2">
                                            <div className="flex items-center gap-2.5 text-xs text-gray-500 font-bold">
                                                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                                                <span>{company.direccion || 'Dirección no disponible'}</span>
                                            </div>
                                            <div className="flex items-center gap-2.5 text-[11px] text-gray-400">
                                                <Clock size={13} className="text-gray-400 flex-shrink-0" />
                                                <span>{company.horarios_atencion || 'Horarios no disponibles'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-gray-50">
                                        <Link 
                                            to={`/${company.slug}`}
                                            className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white transition-all duration-300 shadow-md group-hover:shadow-lg active:scale-95"
                                            style={{ backgroundColor: company.color_primario || '#1f2937' }}
                                        >
                                            Hacer Pedido
                                            <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer de Portal */}
            <div className="bg-gray-900 text-gray-500 py-6 text-center text-[10px] font-black uppercase tracking-widest border-t border-gray-950 mt-auto">
                © {new Date().getFullYear()} A-COMMERR. Todos los derechos reservados.
            </div>
        </div>
    );
};

export default StoreDirectory;
