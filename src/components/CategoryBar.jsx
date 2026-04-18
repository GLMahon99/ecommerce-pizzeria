import { useState, useEffect } from 'react';
import api from '../api/axiosConfig';

const CategoryBar = ({ activeCategory, setActiveCategory }) => {
    const [categories, setCategories] = useState(['Todas']);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/productos/categorias');
                // Agregar 'Todas' al principio de la lista dinámica
                setCategories(['Todas', ...response.data]);
            } catch (error) {
                console.error('Error al cargar categorías:', error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                        ? 'bg-brand text-white shadow-lg shadow-brand/20'
                        : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryBar;