const categories = ['Todas', 'Pizzas', 'Empanadas', 'Bebidas', 'Postres'];

const CategoryBar = ({ activeCategory, setActiveCategory }) => {
    return (
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar mb-8">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-200 ${activeCategory === cat
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
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