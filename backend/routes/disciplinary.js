const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Endpoint to create a new disciplinary action
router.post('/', (req, res) => {
    const { personnel_id, service_number, action_date, action_type, description, status, resolved_date, remarks } = req.body;

    const query = `
        INSERT INTO disciplinary_action 
        (personnel_id, service_number, action_date, action_type, description, status, resolved_date, remarks) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.execute(query, [
        personnel_id,
        service_number,
        action_date,
        action_type,
        description,
        status,
        resolved_date || null,
        remarks
    ], (error, results) => {
        if (error) {
            console.error('Error inserting disciplinary action:', error);
            return res.status(500).json({ error: 'Error inserting disciplinary action' });
        }
        res.status(201).json({ message: 'Disciplinary action saved successfully' });
    });
});

// Endpoint to fetch all disciplinary actions
router.get('/', (req, res) => {
    db.query(`
        SELECT d.*, p.first_name, p.last_name 
        FROM disciplinary_action d
        JOIN personnel p ON d.personnel_id = p.personnel_id
    `, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint to update a disciplinary action
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { action_date, action_type, description, status, resolved_date, remarks } = req.body;

    const formattedActionDate = action_date.split('T')[0];
    const formattedResolvedDate = resolved_date ? resolved_date.split('T')[0] : null;

    db.query(`
        UPDATE disciplinary_action 
        SET action_date = ?, action_type = ?, description = ?, status = ?, resolved_date = ?, remarks = ?
        WHERE action_id = ?
    `, [formattedActionDate, action_type, description, status, formattedResolvedDate, remarks, id], (err, results) => {
        if (err) {
            console.error('Error updating disciplinary action:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Disciplinary action updated successfully' });
    });
});

// Endpoint to fetch disciplinary actions by service number
router.get('/:service_number', (req, res) => {
    const { service_number } = req.params;

    const sql = 'SELECT * FROM disciplinary_action WHERE service_number = ?';
    db.query(sql, [service_number], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Endpoint to delete a disciplinary action
router.delete('/delete/:action_id', (req, res) => {
    const { action_id } = req.params;

    const query = `
        DELETE FROM disciplinary_action
        WHERE action_id = ?
    `;

    db.query(query, [action_id], (err, results) => {
        if (err) {
            console.error('Error deleting disciplinary action:', err);
            res.status(500).json({ message: 'Error deleting disciplinary action' });
            return;
        }

        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Disciplinary action not found' });
            return;
        }

        res.json({ message: 'Disciplinary action deleted successfully' });
    });
});

// Export the router
module.exports = router;
