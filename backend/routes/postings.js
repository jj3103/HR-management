// postings.js
const express = require('express');
const db = require('../db'); // Adjust the path to your db connection
const router = express.Router();

// Create a posting
router.post('/', async (req, res) => {
  const {
    personnel_id,
    service_number,
    posted_to,
    start_date,
    end_date,
    no_of_days,
    prefix_date,
    suffix_date,
    remarks,
    reported_back,
    reporting_date,
    type_of_wt,
    report_to,
    rum_and_cig_allowance_paid_upto,
    type_of_arms,
    arms_regd_no,
    party_of,
    cea_and_cilq_pub_upto,
    auth,
    extra_copy_to
  } = req.body;

  const query = `
      INSERT INTO posting 
      (personnel_id, service_number, posted_to, start_date, end_date, no_of_days, prefix_date, suffix_date, remarks, reported_back, reporting_date,
       type_of_wt, report_to, rum_and_cig_allowance_paid_upto, type_of_arms, arms_regd_no, party_of, cea_and_cilq_pub_upto, auth, extra_copy_to) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    personnel_id,
    service_number,
    posted_to,
    start_date,
    end_date,
    no_of_days,
    prefix_date || null,
    suffix_date || null,
    remarks,
    reported_back,
    reporting_date || null,
    type_of_wt || null,
    report_to || null,
    rum_and_cig_allowance_paid_upto || null,
    type_of_arms || null,
    arms_regd_no || null,
    party_of || null,
    cea_and_cilq_pub_upto || null,
    auth || null,
    extra_copy_to || null
  ];

  try {
    console.log('Query:', query);
    console.log('Values:', values);
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error creating posting:', err);
        res.status(500).json({ error: 'Error creating posting' });
        return;
      }
      res.json({ message: 'Posting created successfully', id: results.insertId });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error creating posting' });
  }
});

// Fetch all postings
router.get('/', (req, res) => {
  const query = `
      SELECT 
          p.personnel_id,
          CONCAT(p.first_name, ' ', p.last_name) AS name, 
          ps.id,
          ps.posted_to,
          ps.service_number, 
          ps.start_date, 
          ps.end_date, 
          ps.no_of_days, 
          ps.prefix_date, 
          ps.suffix_date, 
          ps.remarks, 
          ps.reported_back, 
          ps.reporting_date,
          ps.type_of_wt,
          ps.report_to,
          ps.rum_and_cig_allowance_paid_upto,
          ps.type_of_arms,
          ps.arms_regd_no,
          ps.party_of,
          ps.cea_and_cilq_pub_upto,
          ps.auth,
          ps.extra_copy_to
      FROM 
          posting ps
      INNER JOIN 
          personnel p 
      ON 
          ps.personnel_id = p.personnel_id
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching postings:', err);
      res.status(500).json({ message: 'Error fetching postings' });
      return;
    }
    res.json(results);
  });
});

// Update a posting
router.put('/:id', (req, res) => {
  const {
    posted_to,
    start_date,
    end_date,
    no_of_days,
    prefix_date,
    suffix_date,
    remarks,
    reported_back,
    reporting_date,
    type_of_wt,
    report_to,
    rum_and_cig_allowance_paid_upto,
    type_of_arms,
    arms_regd_no,
    party_of,
    cea_and_cilq_pub_upto,
    auth,
    extra_copy_to
  } = req.body;

  const { id } = req.params;

  const query = `
      UPDATE posting 
      SET posted_to = ?, start_date = ?, end_date = ?, no_of_days = ?, prefix_date = ?, suffix_date = ?, remarks = ?, reported_back = ?, reporting_date = ?,
          type_of_wt = ?, report_to = ?, rum_and_cig_allowance_paid_upto = ?, type_of_arms = ?, arms_regd_no = ?, party_of = ?, cea_and_cilq_pub_upto = ?, auth = ?, extra_copy_to = ?
      WHERE id = ?
  `;

  const convertEmptyToNull = (value) => (value === '' ? null : value);

  const values = [
    convertEmptyToNull(posted_to),
    convertEmptyToNull(start_date),
    convertEmptyToNull(end_date),
    convertEmptyToNull(no_of_days),
    convertEmptyToNull(prefix_date),
    convertEmptyToNull(suffix_date),
    convertEmptyToNull(remarks),
    convertEmptyToNull(reported_back),
    convertEmptyToNull(reporting_date),
    convertEmptyToNull(type_of_wt),
    convertEmptyToNull(report_to),
    convertEmptyToNull(rum_and_cig_allowance_paid_upto),
    convertEmptyToNull(type_of_arms),
    convertEmptyToNull(arms_regd_no),
    convertEmptyToNull(party_of),
    convertEmptyToNull(cea_and_cilq_pub_upto),
    convertEmptyToNull(auth),
    convertEmptyToNull(extra_copy_to),
    id
  ];

  db.query(query, values, (err, results) => {
    if (err) {
      console.error('Error updating posting:', err);
      res.status(500).json({ message: 'Error updating posting' });
      return;
    }
    res.json({ message: 'Posting updated successfully' });
  });
});

// Get postings by service number
router.get('/:service_number', (req, res) => {
  const service_number = req.params.service_number;
  const query = `
    SELECT 
        p.id,
        p.posted_to, 
        p.start_date, 
        p.end_date, 
        p.no_of_days, 
        p.prefix_date, 
        p.suffix_date, 
        p.remarks, 
        p.reported_back, 
        p.reporting_date,
        p.type_of_wt,
        p.report_to,
        p.rum_and_cig_allowance_paid_upto,
        p.type_of_arms,
        p.arms_regd_no,
        p.party_of,
        p.cea_and_cilq_pub_upto,
        p.auth,
        p.extra_copy_to
    FROM 
        posting p 
    JOIN 
        personnel pe 
    ON 
        p.service_number = pe.service_number 
    WHERE 
        p.service_number = ?
  `;

  db.query(query, [service_number], (err, results) => {
    if (err) {
      console.error('Error fetching postings:', err);
      res.status(500).json({ message: 'Error fetching postings' });
      return;
    }
    res.json(results);
  });
});

// Delete a posting
router.delete('/delete/:id', (req, res) => {
  const { id } = req.params;

  const query = `
      DELETE FROM posting 
      WHERE id = ?
  `;

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error('Error deleting posting:', err);
      res.status(500).json({ message: 'Error deleting posting' });
      return;
    }

    if (results.affectedRows === 0) {
      res.status(404).json({ message: 'Posting not found' });
      return;
    }

    res.json({ message: 'Posting deleted successfully' });
  });
});

module.exports = router;
