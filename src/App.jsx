import { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

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
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();
  const isDirectoryPage = location.pathname === '/';
  const urlSlug = location.pathname.split('/')[1];
  // Al navegar desde el directorio, el tenant aún es el anterior (o null) hasta que carga el nuevo
  const tenantPending = !!urlSlug && tenant?.slug !== urlSlug && !tenantError;

  if (tenantLoading || tenantPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.3em] font-black text-xs text-brand">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mr-4"></div>
        Cargando experiencia...
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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
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

      {!isDirectoryPage && <Footer />}
    </div>
  );
}

export default App;