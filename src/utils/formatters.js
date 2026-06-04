export const parseAddress = (addressStr) => {
    try {
        if (addressStr && addressStr.trim().startsWith('{') && addressStr.trim().endsWith('}')) {
            return JSON.parse(addressStr);
        }
    } catch (e) {
        console.error("Error parsing address JSON:", e);
    }
    return {
        calle: addressStr || '',
        altura: '',
        piso: '',
        depto: '',
        cp: '',
        observaciones: ''
    };
};

export const formatAddress = (addressObj) => {
    if (!addressObj) return '';
    const parts = [];
    if (addressObj.calle) parts.push(addressObj.calle);
    if (addressObj.altura) parts.push(addressObj.altura);
    
    let formatted = parts.join(' ');
    
    const extraParts = [];
    if (addressObj.piso) extraParts.push(`Piso ${addressObj.piso}`);
    if (addressObj.depto) extraParts.push(`Depto ${addressObj.depto}`);
    if (addressObj.cp) extraParts.push(`CP ${addressObj.cp}`);
    
    if (extraParts.length > 0) {
        formatted += `, ${extraParts.join(', ')}`;
    }
    
    if (addressObj.observaciones) {
        formatted += ` (${addressObj.observaciones})`;
    }
    return formatted;
};
