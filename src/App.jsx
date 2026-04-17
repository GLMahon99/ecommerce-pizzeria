import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Componentes
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import Footer from './components/Footer'; // Si ya lo tenés, si no, lo comentás

// Páginas
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import OrderStatus from './pages/OrderStatus';

import { useAuth } from './context/AuthContext';
import { useTenant } from './context/TenantContext'; // Importar Tenant
import Login from './pages/Login';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { tenant, loading: tenantLoading, error: tenantError } = useTenant();
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (authLoading || tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.3em] font-black text-xs text-orange-600">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mr-4"></div>
        Cargando Sabores...
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
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar onOpenCart={toggleCart} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="flex-grow">
          <Routes>
            {/* Todas las rutas ahora dependen del SLUG */}
            <Route path="/:slug" element={<Home />} />
            <Route path="/:slug/checkout" element={<Checkout />} />
            <Route path="/:slug/status/:result" element={<OrderStatus />} />
            <Route path="/:slug/status/:result/:id" element={<OrderStatus />} />
            
            {/* Redirección por defecto si no hay nada en la raíz (opcional) */}
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;