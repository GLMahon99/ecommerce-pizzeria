import { Clock } from 'lucide-react';
import { useTenant } from '../context/TenantContext';

/** Aviso fijo cuando el local está cerrado (fuera de horario o cierre manual) */
const StoreClosedBanner = () => {
    const { tenant, localAbierto } = useTenant();
    if (localAbierto || !tenant?.estado) return null;

    return (
        <div role="status" className="bg-red-50 border-b border-red-100 text-red-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 text-sm">
                <Clock size={18} className="text-red-600 shrink-0" aria-hidden="true" />
                <p>
                    <span className="font-semibold">{tenant.estado.mensaje || 'Estamos cerrados.'}</span>
                    {' '}Podés ver el menú, pero no tomamos pedidos por ahora.
                </p>
            </div>
        </div>
    );
};

export default StoreClosedBanner;
