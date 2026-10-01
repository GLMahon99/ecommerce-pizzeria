// Días en orden Lunes -> Domingo (dia_semana: 0 = Domingo, como en el backend)
export const DIAS_SEMANA = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábado' },
    { id: 0, nombre: 'Domingo' }
];

const WEEKDAY_EN = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Día de la semana actual en Argentina (el local opera en esa zona, aunque el cliente esté en otra) */
export const diaHoyArgentina = () => {
    const weekday = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', weekday: 'short' }).format(new Date());
    return WEEKDAY_EN[weekday];
};

/** "19:00 a 23:30 · 12:00 a 15:00" o null si ese día está cerrado */
export const textoTurnosDelDia = (horarios, dia) => {
    const turnos = (horarios || [])
        .filter(t => t.dia_semana === dia)
        .sort((a, b) => a.apertura.localeCompare(b.apertura));
    if (!turnos.length) return null;
    return turnos.map(t => `${t.apertura} a ${t.cierre}`).join(' · ');
};
