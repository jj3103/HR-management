//backend\routes\personnelRoutes.js

const express = require('express');
const router = express.Router();
const personnelController = require('../controllers/personnelController');
const upload = require('../middlewares/upload');

router.get('/', personnelController.getPersonnel);

router.get('/wifeAll',personnelController.getWifeAll);

router.get('/childAll', personnelController.getChildAll);

router.get('/getwife/:serviceNumber', personnelController.getWife);

router.get('/getchild/:serviceNumber', personnelController.getChild);

router.get('/columns', personnelController.getColumn);

router.get('/Details/:serviceNumber', personnelController.getDetails);

router.get('/columnswife', personnelController.getColumnWife);

router.get('/columnschild', personnelController.getColumnChild);

router.post('/', upload.single('photo'), personnelController.insertPersonnel);
    
router.post('/wife', upload.single('jointphoto'), personnelController.insertWife);

router.post('/child', personnelController.insertChild);

router.get('/rank', personnelController.getRank);

router.get('/photo/:serviceNumber', personnelController.getPhoto);

router.get('/total',personnelController.totalPersonnel);


module.exports = router;