import { useState } from 'react';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('Todas');

    // Datos de prueba (Luego vendrán de tu API en Railway)
    const [productos] = useState([
        { id_producto: 1, nombre: 'Muzza Clasica', categoria: 'Pizzas', precio: 8500, descripcion: 'Mucha muzzarella, salsa de la casa y aceitunas.' },
        { id_producto: 2, nombre: 'Fugazzeta', categoria: 'Pizzas', precio: 9200, descripcion: 'Cebolla blanca, muzzarella y un toque de orégano.' },
        { id_producto: 3, nombre: 'Coca Cola 1.5L', categoria: 'Bebidas', precio: 2500, descripcion: 'Bebida gaseosa refrescante.' },
    ]);

    const filteredProducts = activeCategory === 'Todas'
        ? productos
        : productos.filter(p => p.categoria === activeCategory);

    return (
        <div className="pt-28 px-4 max-w-7xl mx-auto min-h-screen">
            {/* Texto de Bienvenida */}
            <div className="mb-10">
                <h2 className="text-4xl font-black text-gray-800 mb-2">
                    ¿Qué comemos <span className="text-orange-600">hoy?</span>
                </h2>
                <p className="text-gray-400 font-medium">Las mejores pizzas de Florida directo a tu casa.</p>
            </div>

            {/* Barra de Categorías */}
            <CategoryBar activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

            {/* Grilla de Productos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                {filteredProducts.map((p) => (
                    <ProductCard key={p.id_producto} product={p} />
                ))}
            </div>
        </div>
    );
};

export default Home;