import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Clock, ArrowRight, Store, Pizza, CupSoda, Utensils, Coffee, Croissant, Cake } from 'lucide-react';

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
                <div className="bg-[#FFE0B2] py-20 px-4 animate-pulse text-center flex flex-col items-center">
                    <div className="h-6 w-32 bg-gray-200 rounded-full mb-6"></div>
                    <div className="h-16 w-48 bg-gray-200 rounded-lg mb-6"></div>
                    <div className="h-12 max-w-md w-full bg-gray-200 rounded-2xl mt-8"></div>
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
            <div className="bg-[#FFE0B2] text-[#2C2520] py-20 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden border-b border-orange-200/50">
                {/* Fondo de patrón gastronómico/cálido sutil */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:20px_20px]"></div>
                
                {/* Iconos de alimentos intercalados en blanco con opacidad */}
                <div className="absolute inset-0 pointer-events-none select-none overflow-hidden opacity-80">
                    {/* Izquierda */}
                    <Pizza size={40} className="absolute text-white top-8 left-[5%] rotate-12" />
                    <CupSoda size={32} className="absolute text-white top-28 left-[18%] -rotate-12 hidden md:block" />
                    <Utensils size={36} className="absolute text-white bottom-8 left-[4%] rotate-45 hidden sm:block" />
                    <Coffee size={28} className="absolute text-white bottom-24 left-[15%] -rotate-45 hidden lg:block" />

                    {/* Centro */}
                    <Croissant size={32} className="absolute text-white top-6 left-[35%] rotate-45 hidden xl:block" />
                    <Cake size={28} className="absolute text-white bottom-6 left-[55%] -rotate-12 hidden xl:block" />

                    {/* Derecha */}
                    <Pizza size={36} className="absolute text-white top-12 right-[5%] -rotate-12" />
                    <CupSoda size={40} className="absolute text-white top-28 right-[18%] rotate-12 hidden md:block" />
                    <Utensils size={32} className="absolute text-white bottom-12 right-[4%] -rotate-45 hidden sm:block" />
                    <Coffee size={36} className="absolute text-white bottom-28 right-[16%] rotate-45 hidden lg:block" />
                </div>
                
                <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
                    <span className="bg-[#EADFC9]/50 text-[#8C6D3E] text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-[#DCD0B4] mb-6">
                        Portal de Tiendas
                    </span>
                    
                    <img 
                        src="/logo-acommerr.png" 
                        alt="A-COMMERR" 
                        className="h-16 sm:h-20 w-auto object-contain drop-shadow-sm mb-6 filter brightness-95" 
                    />
                    
                    <p className="text-[#6D6257] font-bold text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                        Elegí tu sucursal favorita, ordená online en minutos y disfrutá de la mejor experiencia gastronómica.
                    </p>

                    {/* Buscador */}
                    <div className="mt-8 w-full max-w-md relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8C6D3E] transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ciudad..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-11 pr-4 py-3.5 bg-white hover:bg-gray-50 focus:bg-white text-gray-800 rounded-2xl border border-gray-200 focus:border-[#8C6D3E] transition-all outline-none font-bold text-xs tracking-wide shadow-md"
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
