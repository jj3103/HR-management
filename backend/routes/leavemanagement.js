const express = require('express');
const db = require('../db');
const router = express.Router();

// Utility function to handle query errors
const handleQueryError = (error, res, message) => {
    console.error(message, error);
    return res.status(500).json({ message });
};

// Fetch leave data based on personnel ID
router.get('/leavedata', (req, res) => {
    const personnelId = req.query.personnelId;

    // Fetch the rank of the selected personnel
    db.query('SELECT `rank` FROM personnel WHERE personnel_id = ?', [personnelId], (error, personnelResults) => {
        if (error) return handleQueryError(error, res, 'Error fetching personnel rank');

        if (personnelResults.length === 0) {
            return res.status(404).json({ message: 'Personnel not found' });
        }

        const rank = personnelResults[0].rank;

        // Fetch leave types that match the rank
        db.query('SELECT * FROM `leave_types` WHERE `rank` = ?', [rank], (error, leaveResults) => {
            if (error) return handleQueryError(error, res, 'Error fetching leave types');

            // Calculate days since last leave
            const lastLeaveQuery = `
                SELECT DATEDIFF(CURDATE(), MAX(end_date)) AS days_since_last_leave
                FROM \`leave\`
                WHERE personnel_id = ? AND end_date IS NOT NULL
            `;
            db.query(lastLeaveQuery, [personnelId], (error, daysSinceLastLeaveResults) => {
                if (error) return handleQueryError(error, res, 'Error calculating days since last leave');

                // Calculate total leave days by type in the current year
                const leaveTypeCountsQuery = `
                    SELECT 
                        leave_type,
                        SUM(no_of_days) AS leave_count
                    FROM \`leave\`
                    WHERE personnel_id = ?
                    GROUP BY leave_type
                `;
                db.query(leaveTypeCountsQuery, [personnelId], (error, leaveTypeCounts) => {
                    if (error) return handleQueryError(error, res, 'Error calculating leave counts by type');

                    // Check if the personnel is currently on leave
                    const currentLeaveStatusQuery = `
                        SELECT 
                            CASE 
                                WHEN COUNT(*) > 0 THEN 'Yes'
                                ELSE 'No'
                            END AS currently_on_leave
                        FROM \`leave\`
                        WHERE personnel_id = ?
                          AND start_date <= CURDATE()
                          AND (end_date IS NULL OR end_date >= CURDATE())
                    `;
                    db.query(currentLeaveStatusQuery, [personnelId], (error, currentlyOnLeaveResults) => {
                        if (error) return handleQueryError(error, res, 'Error checking current leave status');

                        const currentLeaveStatus = currentlyOnLeaveResults[0].currently_on_leave;
                        const daysSinceLastLeave = daysSinceLastLeaveResults[0].days_since_last_leave || 'N/A';

                        res.json({
                            rank,
                            leaveTypes: leaveResults,
                            daysSinceLastLeave,
                            leaveTypeCounts,
                            currentlyOnLeave: currentLeaveStatus
                        });
                    });
                });
            });
        });
    });
});

// Fetch personnel details for printing
router.get('/personnelprint/:service_number', (req, res) => {
    const { service_number } = req.params;

    const query = `
        SELECT \`rank\`, first_name, last_name, id_card_no, blood_group, coy, photo
        FROM personnel
        WHERE service_number = ?
    `;

    db.query(query, [service_number], (err, results) => {
        if (err) return handleQueryError(err, res, 'Error fetching personnel details');

        if (results.length === 0) {
            return res.status(404).json({ message: 'Personnel not found' });
        }

        res.json(results[0]);
    });
});

module.exports = router;
