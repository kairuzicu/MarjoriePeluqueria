const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

// Rutas públicas (para el formulario del sitio web)
router.post('/public', validationMiddleware.validateReserva, reservaController.crear);

// Rutas protegidas
router.use(authMiddleware);

router.get('/', reservaController.listar);
router.get('/:id', reservaController.obtener);
router.post('/', validationMiddleware.validateReserva, reservaController.crear);
router.patch('/:id/estado', reservaController.actualizarEstado);
router.delete('/:id', reservaController.eliminar);

module.exports = router;