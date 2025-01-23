//backend\routes\AdditionalColumns.js
const express = require('express');
const router = express.Router();

const AdditionalController = require('../controllers/AdditionalColumnsController');
const { route } = require('./personnelRoutes');

router.post('/add', AdditionalController.insertColumns);
router.post('/wife', AdditionalController.insertwifeColumns);
router.post('/child', AdditionalController.insertchildColumns);
router.get('/getcolumn', AdditionalController.getColumns);
router.get('/getwifecolumn', AdditionalController.getwifeColumns);
router.get('/getchildcolumn', AdditionalController.getchildColumns);
router.post('/insert',AdditionalController.insertPersonnelData);
router.post('/insertwife',AdditionalController.insertWifeData);
router.post('/insertchild', AdditionalController.insertChildData);
router.get('/getdata/:service_number', AdditionalController.getDetails);
router.get('/getwifedata/:wife_id', AdditionalController.getWifeDetails);
router.get('/getchildData/:child_id', AdditionalController.getChildDetails);

module.exports = router;