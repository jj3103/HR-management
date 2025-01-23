const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Endpoint to fetch all leave types
router.get('/', (req, res) => {
    const query = 'SELECT * FROM leave_types';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching leave types:', err);
            return res.status(500).json({ error: 'Failed to fetch leave types' });
        }
        res.json(results);
    });
});

// Endpoint to create or update a leave type
router.post('/', (req, res) => {
    const { rank, leave_type, leave_count } = req.body;
    if (!rank || !leave_type || leave_count == null) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
        INSERT INTO leave_types (\`rank\`, leave_type, leave_count) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE leave_count = ?
    `;
    db.query(query, [rank, leave_type, leave_count, leave_count], (err) => {
        if (err) {
            console.error('Error saving leave type:', err);
            return res.status(500).json({ error: 'Failed to save leave type' });
        }
        res.json({ message: 'Leave type saved successfully!' });
    });
});

// Endpoint to update a leave type by ID
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { rank, leave_type, leave_count } = req.body;

    const query = `
        UPDATE leave_types 
        SET \`rank\` = ?, leave_type = ?, leave_count = ? 
        WHERE id = ?
    `;
    db.query(query, [rank, leave_type, leave_count, id], (err) => {
        if (err) {
            console.error('Error updating leave type:', err);
            return res.status(500).json({ error: 'Failed to update leave type' });
        }
        res.json({ message: 'Leave type updated successfully!' });
    });
});

// Endpoint to delete a leave type by ID
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM leave_types WHERE id = ?';

    db.query(query, [id], (err) => {
        if (err) {
            console.error('Error deleting leave type:', err);
            return res.status(500).json({ error: 'Failed to delete leave type' });
        }
        res.json({ message: 'Leave type deleted successfully!' });
    });
});

// Export the router
module.exports = router;
