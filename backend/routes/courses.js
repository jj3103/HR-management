const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

const formatDate = (dateString) => {
  // Check if the dateString is valid and not empty
  if (dateString && !isNaN(Date.parse(dateString))) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // Convert to YYYY-MM-DD format
  }
  return null; // Return null if dateString is invalid or empty
};
// Endpoint to fetch all courses
router.get('/', (req, res) => {
    const query = 'SELECT id, name FROM courses'; // Assuming courses table has id and name
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            return res.status(500).json({ message: 'Error fetching courses' });
        }
        res.json(results);
    });
});

// Endpoint to fetch personnel courses with course details (name, start_date, end_date, grade)
router.get('/personnel/:serviceNumber', (req, res) => {
    const { serviceNumber } = req.params;
    const query = `
        SELECT pc.id, pc.start_date, pc.end_date, pc.grade, c.name AS course_name
        FROM personnelcourses pc
        INNER JOIN courses c ON pc.course_id = c.id
        WHERE pc.service_number = ?
    `;
    db.query(query, [serviceNumber], (err, results) => {
        if (err) {
            console.error('Error fetching personnel courses:', err);
            return res.status(500).json({ message: 'Error fetching personnel courses' });
        }
        res.json(results);
    });
});

// Endpoint to add course to personnelcourses table
router.post('/add', (req, res) => {
    const { serviceNumber, courseId, startDate, endDate, grade } = req.body;
    const query = 'INSERT INTO personnelcourses (service_number, course_id, start_date, end_date, grade) VALUES (?, ?, ?, ?, ?)';
    const values = [serviceNumber, courseId, startDate, endDate, grade];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error adding course:', err);
            return res.status(500).json({ message: 'Error adding course' });
        }
        res.json({ message: 'Course added successfully' });
    });
});

// Endpoint to fetch all courses with personnel count
router.get('/all', (req, res) => {
    const query = `
        SELECT c.id, c.name, c.duration, COUNT(pc.service_number) AS personnel_count
        FROM courses c
        LEFT JOIN personnelcourses pc ON c.id = pc.course_id
        GROUP BY c.id, c.name, c.duration
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            return res.status(500).json({ message: 'Error fetching courses' });
        }
        res.json(results);
    });
});

// Endpoint to add a new course
router.post('/addcourse', (req, res) => {
    const { name, duration } = req.body;
    const query = 'INSERT INTO courses (name, duration) VALUES (?, ?)';
    const values = [name, duration];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error adding course:', err);
            return res.status(500).json({ message: 'Error adding course' });
        }
        res.json({ message: 'Course added successfully', courseId: result.insertId });
    });
});

// Endpoint to fetch personnel enrolled in a course
router.get('/:courseId/personnel', (req, res) => {
    const { courseId } = req.params;
    const query = `
        SELECT p.service_number, p.first_name, p.last_name, pc.id, pc.start_date, pc.end_date, pc.grade
        FROM personnel p
        INNER JOIN personnelcourses pc ON p.service_number = pc.service_number
        WHERE pc.course_id = ?
    `;
    db.query(query, [courseId], (err, results) => {
        if (err) {
            console.error('Error fetching personnel for course:', err);
            return res.status(500).json({ message: 'Error fetching personnel for course' });
        }
        res.json(results);
    });
});


// PUT /api/courses/:courseId
router.put('/update/:courseId', async (req, res) => {
    const { courseId } = req.params;
    const { name, duration } = req.body;
  
    try {
      const query = 'UPDATE courses SET name = ?, duration = ? WHERE id = ?';
      await db.promise().query(query, [name, duration, courseId]);
  
      res.status(200).json({ message: 'Course updated successfully' });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// DELETE /api/courses/:courseId
router.delete('/delete/:courseId', async (req, res) => {
    const { courseId } = req.params;
  
    try {
      const query = 'DELETE FROM courses WHERE id = ?';
      await db.promise().query(query, [courseId]);
  
      res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // PUT /api/personnel/:personId

// Update personnel endpoint
router.put('/updatepersonnel/:id', async (req, res) => {
    const personnelId = req.params.id;
    const {grade, start_date, end_date } = req.body;

    // Update the personnel details in the database
    try {
        const [result] = await db.promise().query(
            `UPDATE personnelcourses SET  grade = ?, start_date = ?, end_date = ? WHERE id = ?`,
            [grade, start_date, end_date, personnelId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Personnel not found' });
        }

        res.json({ message: 'Personnel updated successfully' });
    } catch (error) {
        console.error('Error updating personnel:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


  
  // DELETE /api/personnel/:personId
router.delete('/deletepersonnel/:personId', async (req, res) => {
    const { personId } = req.params;
    console.log('Received personId:', personId);
    try {
      const query = 'DELETE FROM personnelcourses WHERE id = ?';
      await db.promise().query(query, [personId]);
  
      res.status(200).json({ message: 'Personnel deleted successfully' });
    } catch (error) {
      console.error('Error deleting personnel:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
// Export the router
module.exports = router;
