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
        <div className="sticky top-[var(--nav-h,100px)] z-30 -mx-4 px-4 sm:mx-0 sm:px-0 bg-surface/90 backdrop-blur-md border-b border-line">
            <div role="tablist" aria-label="Categorías" className="flex gap-1 overflow-x-auto no-scrollbar">
                {categories.map((cat) => {
                    const active = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            role="tab"
                            aria-selected={active}
                            onClick={() => setActiveCategory(cat)}
                            className={`press relative px-4 py-3.5 text-sm font-semibold whitespace-nowrap rounded-none ${active ? 'text-brand-secondary' : 'text-muted hover:text-brand-secondary'}`}
                        >
                            {cat}
                            <span
                                className={`absolute left-3 right-3 bottom-0 h-0.5 rounded-full bg-brand origin-center transition-transform duration-200 ${active ? 'scale-x-100' : 'scale-x-0'}`}
                                style={{ transitionTimingFunction: 'var(--ease-out)' }}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBar;
