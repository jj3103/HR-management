const express = require('express');
const db = require('../db');
const router = express.Router();

// Utility function to handle query errors
const handleQueryError = (error, res, message) => {
    console.error(message, error);
    return res.status(500).json({ message });
};

// Fetch bank details based on service number
router.get('/bankdetails/:service_number', (req, res) => {
    const { service_number } = req.params;

    const sql = 'SELECT * FROM bank_details WHERE service_number = ?';
    db.query(sql, [service_number], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching bank details');

        res.json(results);
    });
});

// Fetch leave data based on service number
router.get('/leave/:service_number', (req, res) => {
    const { service_number } = req.params;

    const sql = 'SELECT * FROM `leave` WHERE service_number = ?';
    db.query(sql, [service_number], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching leave details');

        res.json(results);
    });
});

// Fetch qualifications based on service number
router.get('/qualifications/:service_number', (req, res) => {
    const { service_number } = req.params;

    const sql = `
        SELECT 
            pq.id AS personnel_qualification_id, 
            q.id AS qualification_id, 
            q.name AS qualification_name, 
            q.*, 
            pq.*
        FROM 
            personnel_qualification pq
        JOIN 
            qualification q ON pq.qualification_id = q.id
        WHERE 
            pq.service_number = ?
    `;
  
    db.query(sql, [service_number], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching qualifications');

        res.json(results);
    });
});

module.exports = router;
