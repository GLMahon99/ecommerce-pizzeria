import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Pizza, Menu, X, MapPin } from 'lucide-react';

const Navbar = ({ onOpenCart }) => {
    const { itemCount } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">

                    {/* LADO IZQUIERDO: Logo y Ubicación */}
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="bg-orange-600 p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                                <Pizza className="text-white" size={24} />
                            </div>
                            <span className="text-2xl font-black text-gray-800 tracking-tighter uppercase">
                                PIZZA<span className="text-orange-600">APP</span>
                            </span>
                        </Link>

                        {/* Solo visible en Desktop - El toque local de Florida */}
                        <div className="hidden md:flex items-center gap-1 text-gray-400 text-[10px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                            <MapPin size={12} className="text-orange-500" />
                            Florida, Vicente López
                        </div>
                    </div>

                    {/* CENTRO/DERECHA: Navegación Desktop */}
                    <div className="hidden md:flex items-center gap-8 font-bold text-sm text-gray-600 uppercase tracking-tight">
                        <Link to="/" className="hover:text-orange-600 transition-colors">Menú</Link>
                        <a href="#contacto" className="hover:text-orange-600 transition-colors">Contacto</a>

                        {/* Botón Carrito Desktop */}
                        <button
                            onClick={onOpenCart}
                            className="relative bg-gray-900 text-white p-3 rounded-2xl hover:bg-black transition-all shadow-lg shadow-gray-200 active:scale-95 flex items-center gap-2"
                        >
                            <ShoppingCart size={18} />
                            <span className="hidden lg:block text-xs">Tu Pedido</span>
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-white animate-in zoom-in">
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
                            className="relative p-2.5 bg-orange-50 text-orange-600 rounded-xl"
                        >
                            <ShoppingCart size={22} />
                            {itemCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                                    {itemCount}
                                </span>
                            )}
                        </button>

                        {/* Botón Hamburguesa */}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
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
                        to="/"
                        className="block py-4 px-6 text-center font-black text-lg text-gray-800 bg-orange-50 rounded-2xl border border-orange-100"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        VER EL MENÚ
                    </Link>
                    <a
                        href="#contacto"
                        className="block py-4 text-center font-bold text-lg text-gray-500 hover:text-orange-600 transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Ubicación y Contacto
                    </a>

                    <div className="pt-4 border-t border-gray-50 flex flex-col items-center gap-2">
                        <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">Abierto hasta las 23:30 hs</p>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;