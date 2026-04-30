const db = require('../config/database');

class TarjetaFidelidad {
    static async create(clienteId, tipoPremio) {
        const numeroTarjeta = `FID-${String(Date.now()).slice(-6)}`;
        const [result] = await db.query(
            'INSERT INTO tarjetas_fidelidad (cliente_id, numero_tarjeta, tipo_premio) VALUES (?, ?, ?)',
            [clienteId, numeroTarjeta, tipoPremio]
        );
        return { id: result.insertId, numero_tarjeta: numeroTarjeta };
    }

    static async findByClienteId(clienteId) {
        const [rows] = await db.query(
            'SELECT * FROM tarjetas_fidelidad WHERE cliente_id = ? AND activa = true',
            [clienteId]
        );
        return rows[0];
    }

    static async agregarSello(clienteId) {
        const tarjeta = await this.findByClienteId(clienteId);
        if (!tarjeta) return null;
        
        if (tarjeta.sellos < 10 && !tarjeta.premio_reclamado) {
            const nuevosSellos = tarjeta.sellos + 1;
            await db.query(
                'UPDATE tarjetas_fidelidad SET sellos = ? WHERE id = ?',
                [nuevosSellos, tarjeta.id]
            );
            
            // Si completó la tarjeta, registrar evento
            if (nuevosSellos === 10) {
                return { completada: true, tarjeta };
            }
            return { completada: false, sellos: nuevosSellos };
        }
        return null;
    }

    static async reclamarPremio(clienteId) {
        const tarjeta = await this.findByClienteId(clienteId);
        if (!tarjeta || tarjeta.sellos < 10 || tarjeta.premio_reclamado) return null;
        
        await db.query(
            'UPDATE tarjetas_fidelidad SET premio_reclamado = true, premio_reclamado_en = NOW(), sellos = 0 WHERE id = ?',
            [tarjeta.id]
        );
        
        return tarjeta;
    }

    static async getAllActivas() {
        const [rows] = await db.query(`
            SELECT t.*, c.nombre as cliente_nombre, c.email as cliente_email
            FROM tarjetas_fidelidad t
            JOIN clientes c ON t.cliente_id = c.id
            WHERE t.activa = true
            ORDER BY t.sellos DESC
        `);
        return rows;
    }
}

module.exports = TarjetaFidelidad;