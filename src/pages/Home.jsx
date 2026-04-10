import { useState, useEffect } from 'react';
import CategoryBar from '../components/CategoryBar';
import ProductCard from '../components/ProductCard';
import api from '../api/axiosConfig';

const Home = () => {
    const [activeCategory, setActiveCategory] = useState('Todas');
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                setLoading(true);
                const response = await api.get('/productos');
                setProductos(response.data);
            } catch (error) {
                console.error('Error al cargar productos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProductos();
    }, []);

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
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                        Cargando el menú...
                    </div>
                ) : filteredProducts.map((p) => (
                    <ProductCard key={p.id_producto} product={p} />
                ))}
            </div>
        </div>
    );
};

export default Home;