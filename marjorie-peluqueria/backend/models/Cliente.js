const db = require('../config/database');

class Cliente {
    static async findAll() {
        const [rows] = await db.query(`
            SELECT c.*, 
                   t.numero_tarjeta, t.sellos, t.tipo_premio, t.premio_reclamado,
                   COUNT(v.id) as visitas_totales
            FROM clientes c
            LEFT JOIN tarjetas_fidelidad t ON c.id = t.cliente_id AND t.activa = true
            LEFT JOIN visitas v ON c.id = v.cliente_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query(`
            SELECT c.*, 
                   t.id as tarjeta_id, t.numero_tarjeta, t.sellos, t.tipo_premio, t.premio_reclamado
            FROM clientes c
            LEFT JOIN tarjetas_fidelidad t ON c.id = t.cliente_id AND t.activa = true
            WHERE c.id = ?
        `, [id]);
        return rows[0];
    }

    static async findByEmail(email) {
        const [rows] = await db.query('SELECT * FROM clientes WHERE email = ?', [email]);
        return rows[0];
    }

    static async create(clienteData) {
        const { nombre, email, telefono, fecha_nacimiento, direccion, notas } = clienteData;
        const [result] = await db.query(
            'INSERT INTO clientes (nombre, email, telefono, fecha_nacimiento, direccion, notas) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, email, telefono, fecha_nacimiento, direccion, notas]
        );
        return result.insertId;
    }

    static async update(id, clienteData) {
        const { nombre, email, telefono, fecha_nacimiento, direccion, notas } = clienteData;
        const [result] = await db.query(
            'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, fecha_nacimiento = ?, direccion = ?, notas = ? WHERE id = ?',
            [nombre, email, telefono, fecha_nacimiento, direccion, notas, id]
        );
        return result.affectedRows;
    }

    static async delete(id) {
        const [result] = await db.query('DELETE FROM clientes WHERE id = ?', [id]);
        return result.affectedRows;
    }

    static async search(termino) {
        const [rows] = await db.query(
            `SELECT c.*, t.numero_tarjeta, t.sellos 
             FROM clientes c
             LEFT JOIN tarjetas_fidelidad t ON c.id = t.cliente_id AND t.activa = true
             WHERE c.nombre LIKE ? OR c.email LIKE ? OR c.telefono LIKE ?`,
            [`%${termino}%`, `%${termino}%`, `%${termino}%`]
        );
        return rows;
    }
}

module.exports = Cliente;