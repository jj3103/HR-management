const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary


router.get('/posts', (req, res) => {
    const query = 'SELECT id, rank_name FROM posts';
    db.query(query, (err, results) => {
      if (err) throw err;
      res.json(results);
    });
  });
  
  
// Endpoint to add promotion requirements
router.post('/requirements', (req, res) => {
    const { rank, qualificationIds, courseIds, yearsOfExperience, currentRank, remarks } = req.body;

    const promotionQuery = 'INSERT INTO personnel_promotion_requirements (`rank`, years_of_experience, current_rank, remarks) VALUES (?, ?, ?, ?)';
    db.query(promotionQuery, [rank, yearsOfExperience, currentRank, remarks], (err, result) => {
        if (err) {
            console.error('Error adding promotion requirement:', err);
            res.status(500).send('Error adding promotion requirement');
            return;
        }

        const promotionRequirementId = result.insertId;

        // Insert qualifications
        qualificationIds.forEach((qualificationId) => {
            const qualificationQuery = 'INSERT INTO promotion_qualifications (promotion_requirement_id, qualification_id) VALUES (?, ?)';
            db.query(qualificationQuery, [promotionRequirementId, qualificationId], (err) => {
                if (err) console.error('Error adding qualification:', err);
            });
        });

        // Insert courses
        courseIds.forEach((courseId) => {
            const courseQuery = 'INSERT INTO promotion_courses (promotion_requirement_id, course_id) VALUES (?, ?)';
            db.query(courseQuery, [promotionRequirementId, courseId], (err) => {
                if (err) console.error('Error adding course:', err);
            });
        });

        res.status(201).json({ message: 'Promotion Requirement added successfully.' });
    });
});

// Endpoint to fetch all promotion requirements
router.get('/requirements/all', (req, res) => {
    const query = `
        SELECT 
            ppr.id AS promotion_id,
            ppr.rank,
            ppr.years_of_experience,
            ppr.current_rank,
            ppr.remarks,
            GROUP_CONCAT(DISTINCT q.name SEPARATOR ', ') AS qualifications,
            GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS courses
        FROM 
            personnel_promotion_requirements ppr
        LEFT JOIN 
            promotion_qualifications pq ON ppr.id = pq.promotion_requirement_id
        LEFT JOIN 
            qualification q ON pq.qualification_id = q.id
        LEFT JOIN 
            promotion_courses pc ON ppr.id = pc.promotion_requirement_id
        LEFT JOIN 
            courses c ON pc.course_id = c.id
        GROUP BY 
            ppr.id
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching promotion requirements:', err);
            res.status(500).send('Error fetching promotion requirements');
            return;
        }
        res.json(results);
    });
});

// Endpoint to delete promotion requirements by ID
router.delete('/requirements/:id', (req, res) => {
    const { id } = req.params;

    // Delete related promotion qualifications and courses first
    const deletePromotionQualifications = 'DELETE FROM promotion_qualifications WHERE promotion_requirement_id = ?';
    const deletePromotionCourses = 'DELETE FROM promotion_courses WHERE promotion_requirement_id = ?';
    const deletePromotionRequirement = 'DELETE FROM personnel_promotion_requirements WHERE id = ?';

    db.query(deletePromotionQualifications, [id], (err) => {
        if (err) {
            console.error('Error deleting promotion qualifications:', err);
            res.status(500).send('Error deleting promotion qualifications');
            return;
        }
        db.query(deletePromotionCourses, [id], (err) => {
            if (err) {
                console.error('Error deleting promotion courses:', err);
                res.status(500).send('Error deleting promotion courses');
                return;
            }
            db.query(deletePromotionRequirement, [id], (err) => {
                if (err) {
                    console.error('Error deleting promotion requirement:', err);
                    res.status(500).send('Error deleting promotion requirement');
                    return;
                }
                res.json({ success: true, message: 'Promotion requirement deleted successfully' });
            });
        });
    });
});
// Endpoint to get qualified personnel based on promotion requirements
router.get('/qualified-personnel', (req, res) => {
    const sqlQuery = `
        SELECT 
            p.personnel_id,
            CONCAT(p.first_name, ' ', p.last_name) AS name,
            p.rank AS current_rank,
            pr.rank AS promotion_rank,
            pr.years_of_experience,
            pr.remarks
        FROM 
            personnel p
        JOIN 
            personnel_promotion_requirements pr
        ON 
            p.rank = pr.current_rank
        JOIN 
            personnel_qualification pq 
        ON 
            p.personnel_id = pq.personnel_id
        JOIN 
            promotion_qualifications pqr 
        ON 
            pr.id = pqr.promotion_requirement_id AND pq.qualification_id = pqr.qualification_id
        JOIN 
            personnelcourses pc 
        ON 
            p.service_number = pc.service_number
        JOIN 
            promotion_courses pcr 
        ON 
            pr.id = pcr.promotion_requirement_id AND pc.course_id = pcr.course_id
        WHERE 
            TIMESTAMPDIFF(YEAR, p.enlistment_date, CURDATE()) >= pr.years_of_experience
        GROUP BY 
            p.personnel_id, pr.id
        HAVING 
            COUNT(DISTINCT pqr.qualification_id) = (SELECT COUNT(*) FROM promotion_qualifications WHERE promotion_requirement_id = pr.id)
        AND 
            COUNT(DISTINCT pcr.course_id) = (SELECT COUNT(*) FROM promotion_courses WHERE promotion_requirement_id = pr.id);
    `;

    db.query(sqlQuery, (err, results) => {
        if (err) {
            console.error('Error fetching qualified personnel:', err);
            res.status(500).send('Error fetching qualified personnel');
            return;
        }
        res.json(results);
    });
});

// Export the router
module.exports = router;
