const validationMiddleware = {
    validateCliente: (req, res, next) => {
        const { nombre, email, telefono, tipo_premio } = req.body;
        const errors = [];
        
        if (!nombre || nombre.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Email inválido');
        }
        
        if (!telefono || telefono.length < 8) {
            errors.push('Teléfono inválido');
        }
        
        if (!tipo_premio) {
            errors.push('Debe seleccionar un tipo de premio');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        
        next();
    },
    
    validateReserva: (req, res, next) => {
        const { nombre, telefono, servicio_id, fecha, hora } = req.body;
        const errors = [];
        
        if (!nombre || nombre.length < 3) {
            errors.push('El nombre debe tener al menos 3 caracteres');
        }
        
        if (!telefono || telefono.length < 8) {
            errors.push('Teléfono inválido');
        }
        
        if (!servicio_id) {
            errors.push('Debe seleccionar un servicio');
        }
        
        if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            errors.push('Fecha inválida');
        }
        
        if (!hora || !/^\d{2}:\d{2}$/.test(hora)) {
            errors.push('Hora inválida');
        }
        
        // Validar que la fecha no sea pasada
        const fechaReserva = new Date(fecha);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        if (fechaReserva < hoy) {
            errors.push('No se pueden hacer reservas en fechas pasadas');
        }
        
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        
        next();
    }
};

module.exports = validationMiddleware;