import { Store, Phone, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const socialClass = 'press w-10 h-10 bg-white border border-line rounded-xl flex items-center justify-center text-muted hover:text-brand-secondary hover:border-brand-secondary';

const Footer = () => {
    const { tenant } = useTenant();

    return (
        <footer className="bg-surface-2 border-t border-line pt-14 pb-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr_1.4fr] gap-10 md:gap-14 mb-12">

                    <div>
                        <Link to={`/${tenant?.slug}`} className="inline-flex items-center gap-3 mb-4">
                            {tenant?.logo_url ? (
                                <img src={tenant.logo_url} alt="" className="h-12 w-auto object-contain" />
                            ) : (
                                <div className="bg-brand text-on-brand p-2 rounded-xl">
                                    <Store size={20} aria-hidden="true" />
                                </div>
                            )}
                            <span className="font-display text-2xl font-extrabold text-brand-secondary tracking-tight">
                                {tenant?.nombre || 'A-COMMERR'}
                            </span>
                        </Link>
                        <p className="text-muted text-sm leading-relaxed max-w-[34ch]">
                            Pedí online y recibilo en tu casa.
                        </p>

                        <div className="flex gap-3 mt-6">
                            {tenant?.whatsapp && (
                                <a href={`https://wa.me/${tenant.whatsapp}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className={socialClass}>
                                    <Phone size={18} />
                                </a>
                            )}
                            {tenant?.instagram && (
                                <a href={tenant.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className={socialClass}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
                                </a>
                            )}
                            {tenant?.facebook && (
                                <a href={tenant.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className={socialClass}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-display font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <Clock size={16} className="text-brand" aria-hidden="true" /> Horarios
                            </h4>
                            <p className="text-muted text-sm whitespace-pre-line">
                                {tenant?.horarios_atencion || 'Lunes a Domingo'}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-display font-bold text-brand-secondary mb-2 flex items-center gap-2">
                                <MapPin size={16} className="text-brand" aria-hidden="true" /> Dónde estamos
                            </h4>
                            <p className="text-muted text-sm">{tenant?.direccion || 'Florida, Vicente López'}</p>
                            <p className="text-muted text-sm">{tenant?.ciudad || 'Buenos Aires, Argentina'}</p>
                            {tenant?.whatsapp && <p className="tabular text-brand-secondary text-sm font-semibold mt-2">{tenant.whatsapp}</p>}
                        </div>
                    </div>

                    <div className="w-full h-44 md:h-full min-h-40 rounded-2xl overflow-hidden border border-line">
                        <iframe
                            title="Ubicación del local"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            loading="lazy"
                            src={`https://maps.google.com/maps?q=${encodeURIComponent(
                                (tenant?.direccion || 'Florida') + ', ' + (tenant?.ciudad || 'Vicente López, Buenos Aires, Argentina')
                            )}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        ></iframe>
                    </div>
                </div>

                <div className="border-t border-line pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-muted">
                    <p>© 2026 {tenant?.nombre || 'A-COMMERR'}. Todos los derechos reservados.</p>
                    <Link to={`/${tenant?.slug || ''}/terminos`} className="underline underline-offset-4 decoration-line hover:text-brand-secondary hover:decoration-brand">
                        Términos y condiciones
                    </Link>
                    <p>Tienda creada con <span className="font-semibold text-brand-secondary">A-COMMERR</span> · Desarrollado por Gaston Mahon</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
