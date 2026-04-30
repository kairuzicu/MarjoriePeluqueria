const Cliente = require('../models/Cliente');
const TarjetaFidelidad = require('../models/TarjetaFidelidad');
const db = require('../config/database');

const clienteController = {
    async listar(req, res) {
        try {
            const clientes = await Cliente.findAll();
            res.json(clientes);
        } catch (error) {
            console.error('Error al listar clientes:', error);
            res.status(500).json({ error: 'Error al obtener clientes' });
        }
    },
    
    async obtener(req, res) {
        try {
            const { id } = req.params;
            const cliente = await Cliente.findById(id);
            
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            res.json(cliente);
        } catch (error) {
            console.error('Error al obtener cliente:', error);
            res.status(500).json({ error: 'Error al obtener cliente' });
        }
    },
    
    async crear(req, res) {
        try {
            const { nombre, email, telefono, fecha_nacimiento, direccion, notas, tipo_premio } = req.body;
            
            // Validar email único
            const existe = await Cliente.findByEmail(email);
            if (existe) {
                return res.status(400).json({ error: 'Ya existe un cliente con este email' });
            }
            
            // Crear cliente
            const clienteId = await Cliente.create({
                nombre, email, telefono, fecha_nacimiento, direccion, notas
            });
            
            // Crear tarjeta de fidelidad
            const tarjeta = await TarjetaFidelidad.create(clienteId, tipo_premio);
            
            // Registrar en historial
            await db.query(
                'INSERT INTO historial (usuario_id, accion, descripcion, ip_address) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Cliente registrado', `Nuevo cliente: ${nombre}`, req.ip]
            );
            
            res.status(201).json({
                success: true,
                cliente: { id: clienteId, nombre, email, telefono },
                tarjeta
            });
        } catch (error) {
            console.error('Error al crear cliente:', error);
            res.status(500).json({ error: 'Error al crear cliente' });
        }
    },
    
    async actualizar(req, res) {
        try {
            const { id } = req.params;
            const actualizado = await Cliente.update(id, req.body);
            
            if (actualizado === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            res.json({ success: true, message: 'Cliente actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar cliente:', error);
            res.status(500).json({ error: 'Error al actualizar cliente' });
        }
    },
    
    async eliminar(req, res) {
        try {
            const { id } = req.params;
            const eliminado = await Cliente.delete(id);
            
            if (eliminado === 0) {
                return res.status(404).json({ error: 'Cliente no encontrado' });
            }
            
            await db.query(
                'INSERT INTO historial (usuario_id, accion, descripcion, ip_address) VALUES (?, ?, ?, ?)',
                [req.user.id, 'Cliente eliminado', `Cliente ID: ${id}`, req.ip]
            );
            
            res.json({ success: true, message: 'Cliente eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar cliente:', error);
            res.status(500).json({ error: 'Error al eliminar cliente' });
        }
    },
    
    async buscar(req, res) {
        try {
            const { q } = req.query;
            const clientes = await Cliente.search(q);
            res.json(clientes);
        } catch (error) {
            console.error('Error al buscar clientes:', error);
            res.status(500).json({ error: 'Error al buscar clientes' });
        }
    }
};

module.exports = clienteController;