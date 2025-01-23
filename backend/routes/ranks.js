const express = require('express');
const db = require('../db');
const router = express.Router();

// Utility function to handle query errors
const handleQueryError = (error, res, message) => {
    console.error(message, error);
    return res.status(500).json({ message });
};

// Fetch all ranks
router.get('/', (req, res) => {
    const query = 'SELECT id, rank_name FROM posts';

    db.query(query, (error, results) => {
        if (error) return handleQueryError(error, res, 'Error fetching ranks');
        res.json(results);
    });
});

// Add a new rank
router.post('/', (req, res) => {
    const { rankName } = req.body;
    const query = 'INSERT INTO posts (rank_name) VALUES (?)';

    db.query(query, [rankName], (error, results) => {
        if (error) return handleQueryError(error, res, 'Error adding rank');
        res.status(201).json({ id: results.insertId, rank_name: rankName });
    });
});

// Update an existing rank
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { rankName } = req.body;
    const query = 'UPDATE posts SET rank_name = ? WHERE id = ?';

    db.query(query, [rankName, id], (error) => {
        if (error) return handleQueryError(error, res, 'Error updating rank');
        res.json({ message: 'Rank updated successfully' });
    });
});

// Delete a rank
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM posts WHERE id = ?';

    db.query(query, [id], (error) => {
        if (error) return handleQueryError(error, res, 'Error deleting rank');
        res.json({ message: 'Rank deleted successfully' });
    });
});

module.exports = router;
