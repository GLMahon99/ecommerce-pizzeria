/** Selector segmentado (ej: tamaño Chica / Grande) */
const Segmented = ({ options, value, onChange, className = 'mb-3 sm:mb-4' }) => (
    <div className={`flex bg-surface-2 p-1 rounded-xl ${className}`} role="radiogroup">
        {options.map(([label, val]) => (
            <button
                key={val}
                type="button"
                role="radio"
                aria-checked={value === val}
                onClick={() => onChange(val)}
                className={`press flex-1 py-2.5 text-xs font-semibold rounded-lg ${value === val ? 'bg-white text-brand-secondary shadow-sm' : 'text-muted hover:text-brand-secondary'}`}
            >
                {label}
            </button>
        ))}
    </div>
);

export default Segmented;
