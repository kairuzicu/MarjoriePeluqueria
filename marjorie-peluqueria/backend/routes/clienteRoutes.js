const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.use(authMiddleware);

router.get('/', clienteController.listar);
router.get('/buscar', clienteController.buscar);
router.get('/:id', clienteController.obtener);
router.post('/', validationMiddleware.validateCliente, clienteController.crear);
router.put('/:id', clienteController.actualizar);
router.delete('/:id', clienteController.eliminar);

module.exports = router;