// Separate the db module and necessary imports
const express = require('express');
const db = require('../db');
const router = express.Router();

// Utility function to log and send errors
const handleQueryError = (err, res, message) => {
    console.error(message, err);
    return res.status(500).json({ error: err.message });
};

// API route for Coy Distribution
router.get('/api/coy-distribution', (req, res) => {
    const query = `
        SELECT coy, COUNT(*) as count 
        FROM personnel 
        GROUP BY coy;
    `;

    db.query(query, (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Coy distribution');
        res.json(results);
    });
});

// API route for Present Today by Coy
router.get('/api/present-today-by-coy', (req, res) => {
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    const query = `
        SELECT p.coy, COUNT(p.personnel_id) AS count
        FROM personnel p
        LEFT JOIN \`leave\` l ON p.service_number = l.service_number
        WHERE (l.leave_id IS NULL OR (l.end_date < ? OR l.start_date > ?))
        OR (l.leave_id IS NOT NULL AND (l.start_date > ? OR l.end_date < ?))
        GROUP BY p.coy;
    `;

    db.query(query, [today, today, today, today], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Present Today by Coy');
        console.log('Present Today by Coy:', results);
        res.json(results);
    });
});

// API route for Rank Distribution
router.get('/api/rank-distribution', (req, res) => {
    const query = `
        SELECT \`rank\`, COUNT(personnel_id) AS count
        FROM personnel
        GROUP BY \`rank\`;
    `;

    db.query(query, (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Rank distribution');
        console.log('Rank Distribution:', results);
        res.json(results);
    });
});

// API route for Present Today by Rank
router.get('/api/present-today-by-rank', (req, res) => {
    const today = new Date().toISOString().split('T')[0];

    const query = `
        SELECT p.\`rank\`, COUNT(p.personnel_id) AS count
        FROM personnel p
        LEFT JOIN \`leave\` l ON p.service_number = l.service_number
        WHERE (l.leave_id IS NULL OR (l.end_date < ? OR l.start_date > ?))
        OR (l.leave_id IS NOT NULL AND (l.start_date > ? OR l.end_date < ?))
        GROUP BY p.\`rank\`;
    `;

    db.query(query, [today, today, today, today], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Present Today by Rank');
        console.log('Present Today by Rank:', results);
        res.json(results);
    });
});

// API route for Leave Type Distribution
router.get('/api/leave-type-distribution', (req, res) => {
    const query = `
        SELECT l.leave_type, 
               CASE 
                   WHEN p.\`rank\` IN ('JCO') THEN 'JCO'
                   ELSE 'Others'
               END AS rank_category,
               COUNT(p.personnel_id) AS count
        FROM \`leave\` l
        JOIN personnel p ON l.service_number = p.service_number
        GROUP BY l.leave_type, rank_category;
    `;

    db.query(query, (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Leave Type distribution');
        console.log('Leave Type Distribution:', results);
        res.json(results);
    });
});

// API route for Caste Distribution
router.get('/api/caste-distribution', (req, res) => {
    const query = `
        SELECT caste, COUNT(personnel_id) AS count
        FROM personnel
        GROUP BY caste;
    `;

    db.query(query, (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching Caste distribution');
        console.log('Caste Distribution:', results);
        res.json(results);
    });
});

// Export the router to use in main app.js
module.exports = router;
