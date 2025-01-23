const express = require('express');
const router = express.Router();
const personnelCourseController = require('../controllers/personnelCourseController');

router.post('/personnelcourses', personnelCourseController.addPersonnelCourse);
router.get('/personnelcourses/:service_number', personnelCourseController.getAlldataCourses);

module.exports = router;
