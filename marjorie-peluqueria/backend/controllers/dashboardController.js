const db = require('../config/database');

const dashboardController = {
    async getEstadisticas(req, res) {
        try {
            // Reservas hoy
            const [reservasHoy] = await db.query(`
                SELECT COUNT(*) as total, 
                       SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END) as pendientes,
                       SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
                       SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas
                FROM reservas WHERE fecha = CURDATE()
            `);
            
            // Clientes totales
            const [totalClientes] = await db.query('SELECT COUNT(*) as total FROM clientes');
            
            // Tarjetas activas
            const [tarjetasActivas] = await db.query('SELECT COUNT(*) as total FROM tarjetas_fidelidad WHERE activa = true AND premio_reclamado = false');
            
            // Premios pendientes (tarjetas completadas)
            const [premiosPendientes] = await db.query('SELECT COUNT(*) as total FROM tarjetas_fidelidad WHERE sellos >= 10 AND premio_reclamado = false');
            
            // Ingresos del mes
            const [ingresosMes] = await db.query(`
                SELECT SUM(s.precio) as total 
                FROM reservas r
                JOIN servicios s ON r.servicio_id = s.id
                WHERE r.estado = 'completada' 
                AND MONTH(r.fecha) = MONTH(CURDATE()) 
                AND YEAR(r.fecha) = YEAR(CURDATE())
            `);
            
            // Servicios más populares
            const [serviciosPopulares] = await db.query(`
                SELECT s.nombre, COUNT(r.id) as cantidad
                FROM reservas r
                JOIN servicios s ON r.servicio_id = s.id
                WHERE r.estado = 'completada'
                GROUP BY r.servicio_id
                ORDER BY cantidad DESC
                LIMIT 5
            `);
            
            res.json({
                reservas_hoy: reservasHoy[0],
                total_clientes: totalClientes[0].total,
                tarjetas_activas: tarjetasActivas[0].total,
                premios_pendientes: premiosPendientes[0].total,
                ingresos_mes: ingresosMes[0].total || 0,
                servicios_populares: serviciosPopulares
            });
        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            res.status(500).json({ error: 'Error al obtener estadísticas' });
        }
    },
    
    async getUltimasActividades(req, res) {
        try {
            const [actividades] = await db.query(`
                SELECT h.*, u.nombre as usuario_nombre
                FROM historial h
                LEFT JOIN usuarios u ON h.usuario_id = u.id
                ORDER BY h.created_at DESC
                LIMIT 20
            `);
            res.json(actividades);
        } catch (error) {
            console.error('Error al obtener actividades:', error);
            res.status(500).json({ error: 'Error al obtener actividades' });
        }
    },
    
    async getProximasReservas(req, res) {
        try {
            const [reservas] = await db.query(`
                SELECT r.*, s.nombre as servicio_nombre
                FROM reservas r
                JOIN servicios s ON r.servicio_id = s.id
                WHERE r.fecha >= CURDATE() AND r.estado IN ('pendiente', 'confirmada')
                ORDER BY r.fecha ASC, r.hora ASC
                LIMIT 10
            `);
            res.json(reservas);
        } catch (error) {
            console.error('Error al obtener próximas reservas:', error);
            res.status(500).json({ error: 'Error al obtener próximas reservas' });
        }
    }
};

module.exports = dashboardController;