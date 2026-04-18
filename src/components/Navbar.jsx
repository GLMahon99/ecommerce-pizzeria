import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext'; // Importar Tenant
import { ShoppingCart, Store, Menu, X, MapPin, User as UserIcon } from 'lucide-react';

const Navbar = ({ onOpenCart }) => {
    const { itemCount } = useCart();
    const { user } = useAuth();
    const { tenant } = useTenant(); // Obtener los datos de la pizzería
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LADO IZQUIERDO: Logo y Ubicación */}
                    <div className="flex items-center gap-8">
                        <Link to={`/${tenant?.slug}`} className="flex items-center gap-3 group">
                            {tenant?.logo_url ? (
                                <img 
                                    src={tenant.logo_url} 
                                    alt={tenant?.nombre} 
                                    className="h-12 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                                />
                            ) : (
                                <div className="bg-brand p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                    <Store className="text-white" size={24} />
                                </div>
                            )}
                            <span className="text-2xl font-black text-brand-secondary tracking-tighter uppercase">
                                {tenant?.nombre || 'TIENDAAPP'}
                            </span>
                        </Link>

                        {/* Solo visible en Desktop - El toque local de Florida */}
                        <div className="hidden md:flex flex-col gap-0.5">
                            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100 w-fit">
                                <MapPin size={10} className="text-brand" />
                                Florida, Vicente López
                            </div>
                            {user && (
                                <p className="text-[11px] font-black text-brand-secondary uppercase tracking-tight ml-2">
                                    Hola, <span className="text-brand">{user?.nombre?.split(' ')[0]}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* CENTRO/DERECHA: Navegación Desktop */}
                    <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600 uppercase tracking-tight">
                        <Link to={`/${tenant?.slug}`} className="hover:text-brand transition-colors">Menú</Link>
                        <a href="#contacto" className="hover:text-brand transition-colors">Contacto</a>

                        {/* Botón Carrito Desktop */}
                        <button
                            onClick={onOpenCart}
                            className="relative bg-brand-secondary text-white p-3 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center gap-2"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden lg:block text-xs">Tu Pedido</span>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white animate-in zoom-in">
                                    {itemCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* MOBILE: Botones de acción rápida */}
                    <div className="md:hidden flex items-center gap-3">
                        {/* Botón Carrito Mobile */}
                        <button
                            onClick={onOpenCart}
                            className="relative p-2.5 bg-brand/10 text-brand rounded-xl"
                        >
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Botón Hamburguesa */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-brand-secondary hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* MENÚ DESPLEGABLE MOBILE */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top duration-300">
                    <Link
                        to={`/${tenant?.slug}`}
                        className="block py-4 px-6 text-center font-black text-lg text-brand-secondary bg-brand/10 rounded-2xl border border-brand/20"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        VER EL MENÚ
                    </Link>
                    <a
                        href="#contacto"
                        className="block py-4 text-center font-bold text-lg text-gray-500 hover:text-brand transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Ubicación y Contacto
                    </a>

                    <div className="pt-4 border-t border-gray-50 flex flex-col items-center gap-2">
                        {user && (
                            <div className="flex items-center gap-2 mb-2 bg-gray-50 px-4 py-2 rounded-2xl">
                                <UserIcon size={16} className="text-brand" />
                                <span className="text-sm font-black text-brand-secondary uppercase">Hola, {user.nombre}</span>
                            </div>
                        )}
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Abierto hasta las 23:30 hs</p>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;