import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import { useState } from 'react';

const MainLayout = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Navbar con la función para abrir el carrito */}
            <Navbar onOpenCart={() => setIsCartOpen(true)} />

            {/* El carrito lateral que se activa desde la Navbar */}
            <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* Espacio para que el contenido no quede debajo del Navbar fijo */}
            <main className="flex-grow pt-20">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
};

export default MainLayout;