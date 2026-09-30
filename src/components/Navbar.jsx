import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useTenant } from '../context/TenantContext';
import { ShoppingBag, Store, Menu, X, MapPin, Bike } from 'lucide-react';

const Navbar = ({ onOpenCart }) => {
    const { itemCount } = useCart();
    const { tenant } = useTenant();
    const { pathname } = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const headerRef = useRef(null);

    // Publica la altura real del header para que la barra de categorías se pegue justo debajo
    useEffect(() => {
        const el = headerRef.current;
        if (!el) return;
        const set = () => document.documentElement.style.setProperty('--nav-h', `${el.offsetHeight}px`);
        set();
        const ro = new ResizeObserver(set);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const base = `/${tenant?.slug}`;
    const isMenu = pathname === base;
    const isOrders = pathname.startsWith(`${base}/pedidos`);

    let topbarMessage = '';
    if (tenant?.costo_envio == 0) {
        topbarMessage = 'Envío gratis a domicilio';
    } else if (tenant?.envio_gratis_desde) {
        topbarMessage = `Envío gratis a partir de $${Number(tenant.envio_gratis_desde).toLocaleString()}`;
    } else if (tenant?.costo_envio) {
        topbarMessage = `Costo de envío: $${Number(tenant.costo_envio).toLocaleString()}`;
    }

    const linkClass = (active) =>
        `relative py-2 text-sm font-semibold transition-colors ${active ? 'text-brand-secondary' : 'text-muted hover:text-brand-secondary'}`;

    return (
        <header ref={headerRef} className="fixed top-0 left-0 w-full z-50">
            {topbarMessage && (
                <div className="bg-brand text-on-brand text-xs font-semibold py-1.5 px-4 flex items-center justify-center gap-2">
                    <Bike size={14} strokeWidth={2} aria-hidden="true" />
                    {topbarMessage}
                </div>
            )}
            <nav className="bg-surface/90 backdrop-blur-md border-b border-line">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex justify-between items-center h-16 sm:h-[72px]">

                        {/* Marca */}
                        <div className="flex items-center gap-6 min-w-0">
                            <Link to={base} className="flex items-center gap-3 min-w-0 press rounded-xl">
                                {tenant?.logo_url ? (
                                    <img
                                        src={tenant.logo_url}
                                        alt=""
                                        className="h-10 sm:h-12 w-auto object-contain rounded-lg"
                                    />
                                ) : (
                                    <div className="bg-brand text-on-brand p-2 rounded-xl">
                                        <Store size={22} aria-hidden="true" />
                                    </div>
                                )}
                                <span className="font-display text-xl sm:text-2xl font-extrabold text-brand-secondary tracking-tight leading-none truncate">
                                    {tenant?.nombre || 'A-COMMERR'}
                                </span>
                            </Link>

                            <div className="hidden lg:flex items-center gap-1.5 text-muted text-xs font-medium">
                                <MapPin size={13} className="text-brand shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[16rem]">
                                    {tenant?.direccion ? `${tenant.direccion}${tenant.ciudad ? `, ${tenant.ciudad}` : ''}` : 'Florida, Vicente López'}
                                </span>
                            </div>
                        </div>

                        {/* Navegación desktop */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link to={base} aria-current={isMenu ? 'page' : undefined} className={linkClass(isMenu)}>
                                Menú
                                {isMenu && <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-brand" />}
                            </Link>
                            <Link to={`${base}/pedidos`} aria-current={isOrders ? 'page' : undefined} className={linkClass(isOrders)}>
                                Mis pedidos
                                {isOrders && <span className="absolute left-0 right-0 -bottom-0.5 h-0.5 rounded-full bg-brand" />}
                            </Link>

                            <button
                                onClick={onOpenCart}
                                className="press relative bg-brand-secondary text-white pl-4 pr-5 py-2.5 rounded-xl hover:bg-black flex items-center gap-2 text-sm font-semibold"
                            >
                                <ShoppingBag size={18} aria-hidden="true" />
                                Tu pedido
                                {itemCount > 0 && (
                                    <span className="tabular bg-brand text-on-brand text-[11px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Mobile */}
                        <div className="md:hidden flex items-center gap-1">
                            <button
                                onClick={onOpenCart}
                                aria-label={`Abrir pedido, ${itemCount} productos`}
                                className="press relative p-2.5 text-brand-secondary rounded-xl"
                            >
                                <ShoppingBag size={24} aria-hidden="true" />
                                {itemCount > 0 && (
                                    <span className="tabular absolute top-0.5 right-0 bg-brand text-on-brand text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full">
                                        {itemCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                                aria-expanded={isMenuOpen}
                                className="press p-2.5 text-brand-secondary rounded-xl"
                            >
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden border-t border-line px-4 py-4 space-y-1 rise-in" style={{ '--i': 0 }}>
                        <Link
                            to={base}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl font-semibold ${isMenu ? 'bg-brand/10 text-brand-secondary' : 'text-muted'}`}
                        >
                            Menú
                        </Link>
                        <Link
                            to={`${base}/pedidos`}
                            onClick={() => setIsMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl font-semibold ${isOrders ? 'bg-brand/10 text-brand-secondary' : 'text-muted'}`}
                        >
                            Mis pedidos
                        </Link>
                        <p className="px-4 pt-3 text-xs text-muted">{tenant?.horarios_atencion || 'Lunes a Domingo'}</p>
                    </div>
                )}
            </nav>
        </header>
    );
};

export default Navbar;
