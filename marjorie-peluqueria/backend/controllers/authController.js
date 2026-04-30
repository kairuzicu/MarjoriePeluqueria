const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const authController = {
    async login(req, res) {
        try {
            const { username, password } = req.body;
            
            if (!username || !password) {
                return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
            }
            
            const [users] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
            
            if (users.length === 0) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            const user = users[0];
            const passwordValida = await bcrypt.compare(password, user.password_hash);
            
            if (!passwordValida) {
                return res.status(401).json({ error: 'Credenciales inválidas' });
            }
            
            // Actualizar último login
            await db.query('UPDATE usuarios SET last_login = NOW() WHERE id = ?', [user.id]);
            
            // Generar token JWT
            const token = jwt.sign(
                { id: user.id, username: user.username, rol: user.rol },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );
            
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                }
            });
        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    },
    
    async verificarToken(req, res) {
        res.json({ valid: true, user: req.user });
    },
    
    async cambiarPassword(req, res) {
        try {
            const { password_actual, password_nueva } = req.body;
            const userId = req.user.id;
            
            const [users] = await db.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
            const user = users[0];
            
            const passwordValida = await bcrypt.compare(password_actual, user.password_hash);
            
            if (!passwordValida) {
                return res.status(401).json({ error: 'Contraseña actual incorrecta' });
            }
            
            const nuevaHash = await bcrypt.hash(password_nueva, 10);
            await db.query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [nuevaHash, userId]);
            
            res.json({ success: true, message: 'Contraseña actualizada correctamente' });
        } catch (error) {
            console.error('Error al cambiar password:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};

module.exports = authController;