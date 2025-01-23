const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

// Endpoint to fetch all qualifications
router.get('/', (req, res) => {
    db.query('SELECT * FROM qualification', (err, results) => {
        if (err) {
            console.error('Error fetching qualifications:', err);
            res.status(500).send('Error fetching qualifications');
        } else {
            res.json(results);
        }
    });
});

// Endpoint to assign qualifications to personnel
router.post('/assign', (req, res) => {
    const { personnel_id, service_number, qualifications } = req.body;

    const queries = qualifications.map(q => {
        return new Promise((resolve, reject) => {
            db.query(
                'INSERT INTO personnel_qualification (personnel_id, service_number, qualification_id) VALUES (?, ?, ?)',
                [personnel_id, service_number, q],
                (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                }
            );
        });
    });

    Promise.all(queries)
        .then(() => res.send('Qualifications assigned successfully'))
        .catch(err => {
            console.error('Error assigning qualifications:', err);
            res.status(500).send('Error assigning qualifications');
        });
});

// Endpoint to add a new qualification
router.post('/insert', (req, res) => {
    const { name } = req.body;
    db.query('INSERT INTO qualification (name) VALUES (?)', [name], (err, result) => {
        if (err) {
            console.error('Error adding qualification:', err);
            res.status(500).send('Error adding qualification');
        } else {
            res.json({ id: result.insertId, name });
        }
    });
});

// Endpoint to fetch personnel qualifications
router.get('/personnel', (req, res) => {
    const query = `
        SELECT pq.id, pq.personnel_id, p.service_number, CONCAT(p.first_name, ' ', p.last_name) AS name,
               GROUP_CONCAT(q.name SEPARATOR ', ') AS qualifications
        FROM personnel_qualification pq
        JOIN personnel p ON pq.personnel_id = p.personnel_id
        JOIN qualification q ON pq.qualification_id = q.id
        GROUP BY pq.id
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching personnel qualifications:', err);
            res.status(500).json({ error: 'Error fetching personnel qualifications' });
            return;
        }
        res.json(results);
    });
});

router.delete('/delete/:personnel_id', (req, res) => {
    const { personnel_id } = req.params;
    
    const sql = 'DELETE FROM personnel_qualification WHERE personnel_id = ?';
    
    db.query(sql, [personnel_id], (err, result) => {
      if (err) {
        // Debugging: Log the error
        console.error('Error deleting qualification:', err);
        return res.status(500).json({ message: 'Error deleting qualification', error: err.message });
      }

      return res.status(200).json({ message: 'Qualification deleted successfully', affectedRows: result.affectedRows });
    });
});

// Export the router
module.exports = router;
