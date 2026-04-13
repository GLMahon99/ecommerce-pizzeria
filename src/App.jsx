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
import Login from './pages/Login';

function App() {
  const { user, loading } = useAuth();
  const [isCartOpen, setIsCartOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase tracking-[0.3em] font-black text-xs text-orange-600">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mr-4"></div>
        Cargando Sabores...
      </div>
    );
  }

  // SI NO HAY USUARIO, SOLO MOSTRAMOS EL LOGIN
  if (!user) {
    return <Login />;
  }

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Navbar onOpenCart={toggleCart} />
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/status/:result" element={<OrderStatus />} />
            <Route path="/status/:result/:id" element={<OrderStatus />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;