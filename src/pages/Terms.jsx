import { useEffect } from 'react';
import { Shield, ArrowLeft, FileText, UserCheck, ShieldAlert, CreditCard, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';

const Terms = () => {
    const { tenant } = useTenant();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="pt-28 px-4 max-w-4xl mx-auto min-h-screen pb-20 animate-in fade-in duration-500">
            {/* Botón de volver */}
            <div className="mb-6">
                <Link 
                    to={`/${tenant?.slug || ''}`} 
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-brand transition-colors"
                >
                    <ArrowLeft size={16} /> Volver al menú
                </Link>
            </div>

            {/* Encabezado */}
            <div className="text-center mb-12">
                <div className="inline-flex p-3 bg-brand/5 rounded-3xl border border-brand/10 text-brand mb-4">
                    <FileText size={32} />
                </div>
                <h1 className="text-4xl font-black text-brand-secondary tracking-tight uppercase mb-2">
                    Términos y <span className="text-brand">Condiciones</span>
                </h1>
                <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">
                    Última actualización: Junio de 2026
                </p>
            </div>

            {/* Contenido en Card */}
            <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-[2.5rem] shadow-sm space-y-10">
                <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    Bienvenido a la plataforma de pedidos online de <b>{tenant?.nombre || 'nuestro comercio'}</b>. Al acceder y realizar un pedido en nuestro sitio, aceptás cumplir y estar sujeto a los siguientes términos y condiciones de uso. Por favor, leelos atentamente antes de comprar.
                </p>

                {/* Sección 1 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-brand-secondary flex items-center gap-2.5 uppercase tracking-wide">
                        <UserCheck className="text-brand" size={20} /> 1. Registro de Usuarios y Datos Personales
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium pl-8">
                        Para realizar pedidos a través del ecommerce, se te solicitará registrar tus datos básicos como nombre, teléfono, dirección de entrega y correo electrónico. Vos garantizás que toda la información provista es verdadera y exacta. Tus datos se utilizan únicamente para procesar tus pedidos y gestionar la logística de entrega de forma segura.
                    </p>
                </div>

                {/* Sección 2 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-brand-secondary flex items-center gap-2.5 uppercase tracking-wide">
                        <CreditCard className="text-brand" size={20} /> 2. Precios y Métodos de Pago
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium pl-8">
                        Todos los precios publicados en el menú corresponden a la moneda nacional argentina ($) e incluyen los impuestos aplicables. Los pagos se procesan de forma segura a través de **Mercado Pago** (tarjetas de crédito, débito o saldo en cuenta) o de manera física (efectivo al recibir/retirar) según las opciones habilitadas por el local.
                    </p>
                </div>

                {/* Sección 3 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-brand-secondary flex items-center gap-2.5 uppercase tracking-wide">
                        <Truck className="text-brand" size={20} /> 3. Envíos y Logística de Entrega
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium pl-8">
                        El comercio ofrece opciones de envío a domicilio (Delivery) o retiro por el local (Takeaway). Los costos de envío y límites de envío gratuito se detallan al momento de realizar la compra. Los plazos de entrega estimados son informativos y pueden variar debido al tráfico, volumen de pedidos o condiciones meteorológicas.
                    </p>
                </div>

                {/* Sección 4 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-brand-secondary flex items-center gap-2.5 uppercase tracking-wide">
                        <Shield className="text-brand" size={20} /> 4. Facturación Electrónica (AFIP/ARCA)
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium pl-8">
                        Las facturas electrónicas de venta son emitidas y autorizadas automáticamente de conformidad con las normativas vigentes de AFIP/ARCA. Recibirás tu comprobante fiscal correspondiente al finalizar tu pago. Si los servidores del fisco presentan inconvenientes técnicos temporales, el sistema emitirá un **comprobante provisorio de venta** interno y reintentará la emisión formal en segundo plano de manera automática.
                    </p>
                </div>

                {/* Sección 5 */}
                <div className="space-y-4">
                    <h2 className="text-lg font-black text-brand-secondary flex items-center gap-2.5 uppercase tracking-wide">
                        <ShieldAlert className="text-brand" size={20} /> 5. Modificaciones y Contacto
                    </h2>
                    <p className="text-gray-500 text-sm leading-relaxed font-medium pl-8">
                        Nos reservamos el derecho de modificar estos términos y condiciones en cualquier momento sin previo aviso. Para cualquier consulta o reclamo relativo a tu compra, podés contactarnos de forma directa al número de WhatsApp publicado en la sección de contacto de este sitio web.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
