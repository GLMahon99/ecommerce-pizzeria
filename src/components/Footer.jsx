import { Pizza, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const Footer = () => {
    const { tenant } = useTenant();

    return (
        <footer className="bg-white border-t border-gray-100 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

                    {/* Logo y Eslogan */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to={`/${tenant?.slug}`} className="flex items-center gap-2 mb-4">
                            {tenant?.logo_url ? (
                                <img src={tenant.logo_url} alt={tenant.nombre} className="h-10 w-auto object-contain" />
                            ) : (
                                <div className="bg-brand p-1.5 rounded-lg">
                                    <Pizza className="text-white" size={20} />
                                </div>
                            )}
                            <span className="text-xl font-black text-gray-800 tracking-tighter uppercase">
                                {tenant?.nombre || 'PIZZAAPP'}
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Llevando el sabor artesanal directo a tu mesa.
                        </p>
                    </div>

                    {/* Horarios */}
                    <div>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-orange-600" /> Horarios
                        </h4>
                        <ul className="text-gray-500 text-sm space-y-2 font-medium">
                            <li>Mar - Jue: 19:00 a 23:00</li>
                            <li className="text-orange-600 font-bold">Vie - Dom: 19:00 a 00:00</li>
                            <li>Lunes: Cerrado</li>
                        </ul>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <MapPin size={14} className="text-orange-600" /> Ubicación
                        </h4>
                        <ul className="text-gray-500 text-sm space-y-2 font-medium">
                            <li>Florida, Vicente López</li>
                            <li>Buenos Aires, Argentina</li>
                            <li className="flex items-center gap-2 mt-4 text-gray-800">
                                <Phone size={14} className="text-green-500" /> 11 1234 5678
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-widest mb-4">Seguinos</h4>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all">
                                <Phone size={20} />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Créditos Finales */}
                <div className="border-t border-gray-50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-400 font-black uppercase tracking-widest">
                    <p>© 2026 {tenant?.nombre?.toUpperCase() || 'PIZZAAPP'} - TODOS LOS DERECHOS RESERVADOS</p>
                    <p>DESARROLLADO POR <span className="text-gray-800">GASTON MAHON</span></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;