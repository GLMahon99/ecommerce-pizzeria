const ETIQUETA_SELECCION = { GUSTO: 'Gustos', TOPPING: 'Toppings', ADEREZO: 'Aderezos', GUARNICION: 'Guarnición' };

/**
 * Detalle de un ítem de pedido que viene del servidor (seguimiento):
 * ["Gustos: Chocolate, Frutilla", "Carne extra: +1"]
 */
export const lineasDetallePedido = (item) => {
    const porTipo = {};
    for (const s of item.selecciones || []) {
        (porTipo[s.tipo] = porTipo[s.tipo] || []).push(s.nombre);
    }
    const lineas = Object.keys(ETIQUETA_SELECCION)
        .filter(tipo => porTipo[tipo])
        .map(tipo => `${ETIQUETA_SELECCION[tipo]}: ${porTipo[tipo].join(', ')}`);
    if (item.carnes_extra > 0) lineas.push(`Carne extra: +${item.carnes_extra}`);
    return lineas;
};

/** Tamaño a mostrar (los carritos viejos guardan 'Principal' para la grande) */
export const textoTamano = (tamano) => {
    if (!tamano || tamano === 'Normal') return null;
    return tamano === 'Principal' ? 'Grande' : tamano;
};
