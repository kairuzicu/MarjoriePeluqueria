const Reserva = require('../models/Reserva');
const TarjetaFidelidad = require('../models/TarjetaFidelidad');
const db = require('../config/database');

const reservaController = {
    async listar(req, res) {
        try {
            const { estado, fecha, fechaInicio, fechaFin } = req.query;
            const reservas = await Reserva.findAll({ estado, fecha, fechaInicio, fechaFin });
            res.json(reservas);
        } catch (error) {
            console.error('Error al listar reservas:', error);
            res.status(500).json({ error: 'Error al obtener reservas' });
        }
    },
    
    async obtener(req, res) {
        try {
            const { id } = req.params;
            const reserva = await Reserva.findById(id);
            
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            res.json(reserva);
        } catch (error) {
            console.error('Error al obtener reserva:', error);
            res.status(500).json({ error: 'Error al obtener reserva' });
        }
    },
    
    async crear(req, res) {
        try {
            const { nombre, telefono, servicio_id, fecha, hora, notas } = req.body;
            
            // Verificar disponibilidad
            const disponibilidad = await this.verificarDisponibilidad(servicio_id, fecha, hora);
            if (!disponibilidad.disponible) {
                return res.status(409).json({ error: disponibilidad.mensaje });
            }
            
            // Buscar si el cliente ya existe
            let clienteId = null;
            const [clienteExistente] = await db.query(
                'SELECT id FROM clientes WHERE telefono = ? OR email = ?',
                [telefono, nombre.toLowerCase().replace(/\s/g, '') + '@temp.com']
            );
            
            if (clienteExistente.length > 0) {
                clienteId = clienteExistente[0].id;
            }
            
            // Crear reserva
            const reservaId = await Reserva.create({
                nombre, telefono, servicio_id, fecha, hora, notas
            }, clienteId);
            
            res.status(201).json({
                success: true,
                reserva_id: reservaId,
                message: 'Reserva creada exitosamente'
            });
        } catch (error) {
            console.error('Error al crear reserva:', error);
            res.status(500).json({ error: 'Error al crear reserva' });
        }
    },
    
    async actualizarEstado(req, res) {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            const reserva = await Reserva.findById(id);
            if (!reserva) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            await Reserva.updateEstado(id, estado);
            
            // Si se completa una visita, agregar sello a la tarjeta de fidelidad
            if (estado === 'completada' && reserva.cliente_id) {
                const resultado = await TarjetaFidelidad.agregarSello(reserva.cliente_id);
                
                if (resultado && resultado.completada) {
                    // Enviar notificación de tarjeta completada
                    await this.enviarNotificacionPremio(reserva.cliente_id);
                }
            }
            
            await db.query(
                'INSERT INTO historial (usuario_id, accion, descripcion, ip_address) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Reserva actualizada', `Reserva #${id} - Estado: ${estado}`, req.ip]
            );
            
            res.json({ success: true, message: 'Estado actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    },
    
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await Reserva.delete(id);
            
            if (eliminado === 0) {
                return res.status(404).json({ error: 'Reserva no encontrada' });
            }
            
            res.json({ success: true, message: 'Reserva eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
            res.status(500).json({ error: 'Error al eliminar reserva' });
        }
    },
    
    async verificarDisponibilidad(servicioId, fecha, hora) {
        // Obtener duración del servicio
        const [servicio] = await db.query('SELECT duracion_minutos FROM servicios WHERE id = ?', [servicioId]);
        if (!servicio.length) return { disponible: false, mensaje: 'Servicio no encontrado' };
        
        const duracion = servicio[0].duracion_minutos;
        const horaInicio = hora;
        const horaFin = this.calcularHoraFin(hora, duracion);
        
        // Verificar conflictos
        const [conflictos] = await db.query(
            `SELECT * FROM reservas 
             WHERE fecha = ? AND estado IN ('pendiente', 'confirmada')
             AND (
                (hora <= ? AND ADDTIME(hora, SEC_TO_TIME(duracion_minutos * 60)) > ?) OR
                (hora < ? AND ADDTIME(hora, SEC_TO_TIME(duracion_minutos * 60)) > ?)
             )`,
            [fecha, horaInicio, horaInicio, horaFin, horaFin]
        );
        
        if (conflictos.length > 0) {
            return { disponible: false, mensaje: 'Ya hay una reserva en ese horario' };
        }
        
        return { disponible: true };
    },
    
    calcularHoraFin(hora, minutos) {
        const [h, m] = hora.split(':');
        const fecha = new Date();
        fecha.setHours(parseInt(h), parseInt(m) + minutos);
        return `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    },
    
    async enviarNotificacionPremio(clienteId) {
        const [clientes] = await db.query('SELECT nombre, email, telefono FROM clientes WHERE id = ?', [clienteId]);
        const cliente = clientes[0];
        
        if (cliente) {
            // Aquí se integraría el envío real de email/WhatsApp
            console.log(`📧 Notificación de premio enviada a ${cliente.email}`);
        }
    }
};

module.exports = reservaController;