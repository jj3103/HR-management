// backend/routes/notificationRoutes.js
const express = require('express');
const notificationController = require('../controllers/notificationController');
const router = express.Router();

router.get('/', notificationController.getAll);
router.post('/', notificationController.add);
router.delete('/:id', notificationController.remove);

module.exports = router;
