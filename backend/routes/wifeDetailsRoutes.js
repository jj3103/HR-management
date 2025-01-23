const express = require('express');
const router = express.Router();
const wifeDetailsController = require('../controllers/wifeDetailsController');

// GET all wife details
router.get('/', wifeDetailsController.getAll);

// POST create new wife details
router.post('/', wifeDetailsController.create);

router.get('/columns', wifeDetailsController.getColumns);

router.post('/add-column', wifeDetailsController.addColumn);

module.exports = router;
