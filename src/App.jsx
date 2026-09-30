import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from './context/CartContext';

// Componentes
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer'; // Si ya lo tenés, si no, lo comentás

// Páginas
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';
import OrdersHistory from './pages/OrdersHistory';

import { useTenant } from './context/TenantContext'; // Importar Tenant
import Terms from './pages/Terms';
import StoreDirectory from './pages/StoreDirectory';

function App() {
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const { itemCount, total } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isDirectoryPage = location.pathname === '/';
  const urlSlug = location.pathname.split('/')[1];
  const isCheckoutPage = location.pathname.endsWith('/checkout');
  // Al navegar desde el directorio, el tenant aún es el anterior (o null) hasta que carga el nuevo
  const tenantPending = !!urlSlug && tenant?.slug !== urlSlug && !tenantError;

  if (tenantLoading || tenantPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-sm font-semibold text-brand-secondary">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mr-4"></div>
        Cargando tienda...
      </div>
    );
  }

  if (tenantError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6 flex-col gap-4 text-center">
        <h1 className="text-4xl font-black text-red-600">¡OH NO!</h1>
        <p className="max-w-xs font-bold text-gray-700">{tenantError}</p>
        <p className="text-xs text-gray-400">Verificá que la URL sea correcta.</p>
      </div>
    );
  }

  const toggleCart = () => setIsCartOpen(!isCartOpen);
  // Barra de pedido fija abajo en celular: solo donde se está eligiendo (menú), no en checkout ni seguimiento
  const showCartBar = location.pathname === `/${urlSlug}` && itemCount > 0 && !isCartOpen;

  return (
    <div className="flex flex-col min-h-screen bg-surface">
      {!isDirectoryPage && <Navbar onOpenCart={toggleCart} />}
      {!isDirectoryPage && <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<StoreDirectory />} />
          {/* ÚNICAS RUTAS VÁLIDAS: Todas requieren un :slug */}
          <Route path="/:slug" element={<Home />} />
          <Route path="/:slug/checkout" element={<Checkout />} />
          <Route path="/:slug/pedidos" element={<OrdersHistory />} />
          <Route path="/:slug/status/:result" element={<OrderStatus />} />
          <Route path="/:slug/status/:result/:token" element={<OrderStatus />} />
          <Route path="/:slug/terminos" element={<Terms />} />
        </Routes>
      </main>

      {!isDirectoryPage && !isCheckoutPage && <Footer />}

      {showCartBar && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 px-4 pt-3 pb-safe bg-gradient-to-t from-surface via-surface/95 to-transparent rise-in" style={{ '--i': 0 }}>
          <button
            onClick={toggleCart}
            className="press w-full h-14 px-5 rounded-2xl bg-brand text-on-brand flex items-center justify-between font-semibold shadow-[0_8px_24px_-6px_rgb(0_0_0/0.35)]"
          >
            <span className="flex items-center gap-3">
              <ShoppingBag size={20} aria-hidden="true" />
              Ver mi pedido
              <span className="tabular bg-on-brand/20 text-[13px] min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center">{itemCount}</span>
            </span>
            <span className="tabular">${total.toLocaleString()}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;