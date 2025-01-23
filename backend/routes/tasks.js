const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path to your db connection
const moment = require('moment'); // Import moment.js for date formatting


// Endpoint to fetch all tasks
router.get('/', (req, res) => {
    const query = 'SELECT * FROM tasks ORDER BY created_at DESC';
    db.query(query, (err, rows) => {
        if (err) {
            console.error('Error fetching tasks:', err);
            return res.status(500).send('Error fetching tasks');
        }
        res.json(rows);
    });
});

router.post('/', (req, res) => {
    let { title, description, date, status } = req.body;

    // Convert empty fields to null
    title = title ? title : null;
    description = description ? description : null;
    status = status ? status : null;

    // Format date or set it to null if not provided
    date = date ? moment(date).format('YYYY-MM-DD') : null;

    const query = 'INSERT INTO tasks (title, description, date, status) VALUES (?, ?, ?, ?)';
    db.query(query, [title, description, date, status], (err, result) => {
        if (err) {
            console.error('Error creating task:', err);
            return res.status(500).send('Error creating task');
        }
        res.status(201).json({ taskId: result.insertId });
    });
});

// Endpoint to update a task
router.put('/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    let { title, description, date, status } = req.body;

    // Convert empty fields to null
    title = title ? title : null;
    description = description ? description : null;
    status = status ? status : null;

    // Format date or set it to null if not provided
    date = date ? moment(date).format('YYYY-MM-DD') : null;

    const query = 'UPDATE tasks SET title = ?, description = ?, date = ?, status = ? WHERE task_id = ?';
    db.query(query, [title, description, date, status, taskId], (err) => {
        if (err) {
            console.error('Error updating task:', err);
            return res.status(500).send('Error updating task');
        }
        res.status(200).send('Task updated successfully');
    });
});


// Endpoint to delete a task
router.delete('/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const query = 'DELETE FROM tasks WHERE task_id = ?';
    db.query(query, [taskId], (err) => {
        if (err) {
            console.error('Error deleting task:', err);
            return res.status(500).send('Error deleting task');
        }
        res.status(200).send('Task deleted successfully');
    });
});

module.exports = router;
