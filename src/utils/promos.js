// Promociones en la tienda. Es la misma regla que aplica el servidor (promoService.js del backend):
// acá solo se muestra; el total que se cobra lo calcula siempre el servidor.

const round2 = (n) => Math.round(n * 100) / 100;

export const aplicaA = (promo, idProducto) =>
    promo.aplica_a === 'TODOS' || (promo.producto_ids || []).includes(idProducto);

/** Texto corto para la insignia: "2x1", "-15%" */
export const etiquetaPromo = (promo) =>
    promo.tipo === 'PORCENTAJE' ? `-${Number(promo.porcentaje)}%` : `${promo.lleva}x${promo.paga}`;

/** Descuento de una promo sobre unidades del mismo producto (uno por unidad, mismo orden) */
const descuentoPorUnidad = (promo, precios) => {
    const descuentos = precios.map(() => 0);
    if (promo.tipo === 'PORCENTAJE') {
        precios.forEach((p, i) => { descuentos[i] = round2(p * Number(promo.porcentaje) / 100); });
    } else {
        const gratis = Math.floor(precios.length / promo.lleva) * (promo.lleva - promo.paga);
        // Las unidades gratis son las más baratas
        const orden = precios.map((p, i) => [p, i]).sort((a, b) => a[0] - b[0]);
        for (let k = 0; k < gratis; k++) descuentos[orden[k][1]] = precios[orden[k][1]];
    }
    return descuentos;
};

/**
 * `items`: [{ id_producto, cantidad, precio }] (precio unitario).
 * Devuelve { lineas: [{ descuento, promo }] en el mismo orden, total }.
 * Una sola promo por producto: la que más descuenta.
 */
export const calcularPromos = (items, promos) => {
    const lineas = items.map(() => ({ descuento: 0, promo: null }));
    if (!promos?.length) return { lineas, total: 0 };

    const grupos = new Map();
    items.forEach((it, idx) => {
        if (!grupos.has(it.id_producto)) grupos.set(it.id_producto, []);
        grupos.get(it.id_producto).push(idx);
    });

    for (const [idProducto, indices] of grupos) {
        const candidatas = promos.filter((p) => aplicaA(p, idProducto));
        if (!candidatas.length) continue;

        const unidades = [];
        for (const idx of indices) {
            for (let u = 0; u < items[idx].cantidad; u++) unidades.push([idx, Number(items[idx].precio)]);
        }
        const precios = unidades.map((u) => u[1]);

        let mejor = null;
        for (const promo of candidatas) {
            const desc = descuentoPorUnidad(promo, precios);
            const suma = desc.reduce((a, b) => a + b, 0);
            if (suma > 0 && (!mejor || suma > mejor.suma)) mejor = { promo, desc, suma };
        }
        if (!mejor) continue;

        mejor.desc.forEach((d, i) => {
            if (d > 0) {
                const linea = lineas[unidades[i][0]];
                linea.descuento = round2(linea.descuento + d);
                linea.promo = mejor.promo;
            }
        });
    }

    items.forEach((it, idx) => {
        const tope = round2(Number(it.precio) * it.cantidad);
        if (lineas[idx].descuento > tope) lineas[idx].descuento = tope;
    });

    return { lineas, total: round2(lineas.reduce((acc, l) => acc + l.descuento, 0)) };
};

/** La promo que se muestra en la tarjeta de un producto (la de mayor descuento potencial) */
export const promoDeProducto = (idProducto, promos) => {
    const candidatas = (promos || []).filter((p) => aplicaA(p, idProducto));
    if (!candidatas.length) return null;
    const valor = (p) => (p.tipo === 'PORCENTAJE' ? Number(p.porcentaje) : ((p.lleva - p.paga) / p.lleva) * 100);
    return candidatas.reduce((a, b) => (valor(b) > valor(a) ? b : a));
};

/**
 * Aviso para promos "llevá N, pagá M": si al cliente le falta poco para el próximo regalo.
 * `unidades`: cantidad total de ese producto en el carrito. Devuelve { faltan, regalo } o null.
 */
export const sugerenciaNxM = (promo, unidades) => {
    if (!promo || promo.tipo !== 'NXM') return null;
    const resto = unidades % promo.lleva;
    if (resto >= promo.paga) return { faltan: promo.lleva - resto, regalo: promo.lleva - promo.paga };
    return null;
};
