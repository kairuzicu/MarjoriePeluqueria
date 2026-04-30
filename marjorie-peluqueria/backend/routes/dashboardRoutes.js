const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/estadisticas', dashboardController.getEstadisticas);
router.get('/actividades', dashboardController.getUltimasActividades);
router.get('/proximas-reservas', dashboardController.getProximasReservas);

module.exports = router;