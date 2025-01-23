const express = require('express');
const db = require('../db'); // Adjust path if necessary
const moment = require('moment'); // Ensure you have moment.js installed
const router = express.Router();

// Helper function to format date to MySQL DATE format (YYYY-MM-DD)
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Create a new leave request
router.post('/', (req, res) => {
    const {
        personnel_id,
        service_number,
        start_date,
        end_date,
        prefix_on,
        suffix_on,
        no_of_days,
        remarks,
        leave_type,
        status,
        reported_back,
        reporting_date
    } = req.body;

    const formattedStartDate = formatDate(start_date);
    const formattedEndDate = formatDate(end_date);
    const formattedPrefixOn = formatDate(prefix_on);
    const formattedSuffixOn = formatDate(suffix_on);
    const formattedReportingDate = formatDate(reporting_date);

    const query = `
      INSERT INTO \`leave\` (personnel_id, service_number, start_date, end_date, prefix_on, suffix_on, no_of_days, remarks, leave_type, status, reported_back, reporting_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        personnel_id,
        service_number,
        formattedStartDate,
        formattedEndDate,
        formattedPrefixOn,
        formattedSuffixOn,
        no_of_days,
        remarks || '',
        leave_type,
        status || 'pending',
        reported_back || 'no',
        formattedReportingDate
    ];

    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error creating leave request', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ message: 'Leave request created successfully', leave_id: result.insertId });
    });
});

// Get all leave records
router.get('/', (req, res) => {
    const sql = 'SELECT l.*, CONCAT(p.first_name, " ", p.last_name) AS name, p.personnel_id FROM `leave` l LEFT JOIN personnel p ON l.personnel_id = p.personnel_id';

    db.query(sql, (err, rows) => {
        if (err) {
            console.error('Error fetching leave records:', err);
            res.status(500).send('Error fetching leave records');
            return;
        }
        res.json(rows);
    });
});

// Get leave record by leave_id
router.get('/:leaveId', (req, res) => {
    const leaveId = req.params.leaveId;
    const sql = 'SELECT l.*, CONCAT(p.first_name, " ", p.last_name) AS name, p.personnel_id FROM `leave` l LEFT JOIN personnel p ON l.personnel_id = p.personnel_id WHERE l.leave_id = ?';

    db.query(sql, [leaveId], (err, rows) => {
        if (err) {
            console.error('Error fetching leave record:', err);
            res.status(500).send(`Error fetching leave record with leave_id ${leaveId}`);
            return;
        }
        if (rows.length === 0) {
            res.status(404).send(`Leave record with leave_id ${leaveId} not found`);
            return;
        }
        res.json(rows[0]);
    });
});

// Update a leave record
router.put('/:leaveId', (req, res) => {
    const leaveId = req.params.leaveId;
    const { 
        personnel_id, 
        service_number, 
        start_date, 
        end_date, 
        prefix_on, 
        suffix_on, 
        no_of_days, 
        remarks, 
        leave_type, 
        status, 
        reported_back, 
        reporting_date 
    } = req.body;

    const formattedStartDate = start_date ? moment(start_date).format('YYYY-MM-DD') : null;
    const formattedEndDate = end_date ? moment(end_date).format('YYYY-MM-DD') : null;
    const formattedPrefixOn = prefix_on ? moment(prefix_on).format('YYYY-MM-DD') : null;
    const formattedSuffixOn = suffix_on ? moment(suffix_on).format('YYYY-MM-DD') : null;
    const formattedReportingDate = reporting_date ? moment(reporting_date).format('YYYY-MM-DD') : null;

    const sql = `
      UPDATE \`leave\`
      SET
        personnel_id = ?,
        service_number = ?,
        start_date = ?,
        end_date = ?,
        prefix_on = ?,
        suffix_on = ?,
        no_of_days = ?,
        remarks = ?,
        leave_type = ?,
        status = ?,
        reported_back = ?,
        reporting_date = ?
      WHERE leave_id = ?`;

    db.query(sql, [
        personnel_id,
        service_number,
        formattedStartDate,
        formattedEndDate,
        formattedPrefixOn,
        formattedSuffixOn,
        no_of_days,
        remarks,
        leave_type,
        status,
        reported_back,
        formattedReportingDate,
        leaveId
    ], (err, result) => {
        if (err) {
            console.error('Error updating leave record:', err);
            res.status(500).send(`Error updating leave record with leave_id ${leaveId}`);
            return;
        }
        console.log(`Leave record with leave_id ${leaveId} updated successfully`);
        res.status(200).send(`Leave record with leave_id ${leaveId} updated successfully`);
    });
});

// Delete a leave record
router.delete('/:leaveId', (req, res) => {
    const leaveId = req.params.leaveId;
    const sql = 'DELETE FROM \`leave\` WHERE leave_id = ?';

    db.query(sql, [leaveId], (err) => {
        if (err) {
            console.error('Error deleting leave record:', err);
            res.status(500).send(`Error deleting leave record with leave_id ${leaveId}`);
            return;
        }
        console.log(`Leave record with leave_id ${leaveId} deleted successfully`);
        res.status(200).send(`Leave record with leave_id ${leaveId} deleted successfully`);
    });
});



module.exports = router;
