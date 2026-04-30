const db = require('../config/database');

class Reserva {
    static async findAll(filtros = {}) {
        let query = `
            SELECT r.*, s.nombre as servicio_nombre, s.duracion_minutos, s.precio as servicio_precio
            FROM reservas r
            JOIN servicios s ON r.servicio_id = s.id
            WHERE 1=1
        `;
        const params = [];
        
        if (filtros.estado && filtros.estado !== 'todas') {
            query += ' AND r.estado = ?';
            params.push(filtros.estado);
        }
        
        if (filtros.fecha) {
            query += ' AND r.fecha = ?';
            params.push(filtros.fecha);
        }
        
        if (filtros.fechaInicio && filtros.fechaFin) {
            query += ' AND r.fecha BETWEEN ? AND ?';
            params.push(filtros.fechaInicio, filtros.fechaFin);
        }
        
        query += ' ORDER BY r.fecha DESC, r.hora DESC';
        
        const [rows] = await db.query(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT r.*, s.nombre as servicio_nombre, s.duracion_minutos, s.precio as servicio_precio
            FROM reservas r
            JOIN servicios s ON r.servicio_id = s.id
            WHERE r.id = ?
        `, [id]);
        return rows[0];
    }

    static async create(reservaData, clienteId = null) {
        const { nombre, telefono, servicio_id, fecha, hora, notas } = reservaData;
        
        // Obtener información del servicio
        const [servicio] = await db.query('SELECT nombre, precio FROM servicios WHERE id = ?', [servicio_id]);
        
        const [result] = await db.query(
            `INSERT INTO reservas (cliente_id, nombre_cliente, telefono, servicio_id, servicio_nombre, fecha, hora, notas) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [clienteId, nombre, telefono, servicio_id, servicio[0].nombre, fecha, hora, notas]
        );
        
        return result.insertId;
    }

    static async updateEstado(id, estado) {
        const [result] = await db.query(
            'UPDATE reservas SET estado = ? WHERE id = ?',
            [estado, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM reservas WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async getReservasDelDia(fecha) {
        const [rows] = await db.query(
            'SELECT * FROM reservas WHERE fecha = ? AND estado IN ("pendiente", "confirmada") ORDER BY hora',
            [fecha]
        );
        return rows;
    }

    static async getEstadisticas() {
        const [reservasHoy] = await db.query(
            'SELECT COUNT(*) as total FROM reservas WHERE fecha = CURDATE()'
        );
        
        const [pendientes] = await db.query(
            'SELECT COUNT(*) as total FROM reservas WHERE estado = "pendiente"'
        );
        
        const [completadasMes] = await db.query(
            'SELECT COUNT(*) as total FROM reservas WHERE estado = "completada" AND MONTH(fecha) = MONTH(CURDATE()) AND YEAR(fecha) = YEAR(CURDATE())'
        );
        
        return {
            reservas_hoy: reservasHoy[0].total,
            pendientes: pendientes[0].total,
            completadas_mes: completadasMes[0].total
        };
    }
}

module.exports = Reserva;