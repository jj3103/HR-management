const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/AttendanceSummaryController');

router.get('/summary', AttendanceController.getAttendanceSummary);

module.exports = router;
