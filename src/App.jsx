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

function App() {
  // Estado para controlar la apertura del carrito desde la Navbar
  const [isCartOpen, setIsCartOpen] = useState(false);

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gray-50">

        {/* Pasamos toggleCart a la Navbar para que el ícono de compra funcione */}
        <Navbar onOpenCart={toggleCart} />

        {/* El Carrito Lateral siempre está "al acecho" */}
        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

        {/* Contenido Principal */}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/status/:id" element={<OrderStatus />} />
            {/* Aquí podés agregar rutas como /contacto o /mis-pedidos*/}
          </Routes>
        </main>

        {/* Un footer simple para que la página no termine "en seco" */}
        <Footer />

      </div>
    </Router>
  );
}

export default App;