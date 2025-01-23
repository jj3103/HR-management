const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary
const fs = require('fs');
const path = require('path');

// Endpoint to check if personnel is an admin
router.get('/checkAdmin', async (req, res) => {
  try {
    const { service_number } = req.query;

    // Query the users table to check if the service number belongs to an admin
    const [result] = await db.promise().query(
      'SELECT * FROM users WHERE service_number = ? AND role = ?',
      [service_number, 'admin']
    );

    if (result.length > 0) {
      return res.json({
        isAdmin: true,
        message: 'Personnel is an admin. Please ask the super admin to first remove the admin role.',
      });
    }

    return res.json({ isAdmin: false });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to delete all records for a service number
router.delete('/:service_number', async (req, res) => {
  const { service_number } = req.params;

  try {
    // Begin transaction
    await db.promise().query('START TRANSACTION');

    // Variables to hold photo paths
    let jointPhotoPath = '';
    let personalPhotoPath = '';

    // Fetch jointphoto and photo for wifedetails and personnel
    const [wifePhotoResults] = await db.promise().query('SELECT jointphoto FROM wifedetails WHERE service_number = ?', [service_number]);
    if (wifePhotoResults.length > 0) {
      jointPhotoPath = wifePhotoResults[0].jointphoto;
    }

    const [personnelPhotoResults] = await db.promise().query('SELECT photo FROM personnel WHERE service_number = ?', [service_number]);
    if (personnelPhotoResults.length > 0) {
      personalPhotoPath = personnelPhotoResults[0].photo;
    }

    // Helper function to delete a file
    const deletePhoto = (photoPath) => {
      if (photoPath) {
        const filePath = path.join(__dirname, './uploads', photoPath);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    };

    // Delete photos if they exist
    deletePhoto(jointPhotoPath);
    deletePhoto(personalPhotoPath);

    // Prepare deletion promises
    const deletePromises = [];

    // Delete additionalwife and wifedetails records
    const [wifeResults] = await db.promise().query('SELECT wife_id FROM wifedetails WHERE service_number = ?', [service_number]);
    if (wifeResults.length > 0) {
      const wifeIds = wifeResults.map((row) => row.wife_id);
      deletePromises.push(db.promise().query('DELETE FROM additionalwife WHERE wife_id IN (?)', [wifeIds]));
    }
    deletePromises.push(db.promise().query('DELETE FROM wifedetails WHERE service_number = ?', [service_number]));

    // Delete additionalchild and childdetails records
    const [childResults] = await db.promise().query('SELECT child_id FROM childdetails WHERE service_number = ?', [service_number]);
    if (childResults.length > 0) {
      const childIds = childResults.map((row) => row.child_id);
      deletePromises.push(db.promise().query('DELETE FROM additionalchild WHERE child_id IN (?)', [childIds]));
    }
    deletePromises.push(db.promise().query('DELETE FROM childdetails WHERE service_number = ?', [service_number]));

    // Delete from all other tables
    const tables = [
      'posting', 
      'disciplinary_action', 
      'leave', 
      'bank_details', 
      'additionalpersonnel', 
      'personnelcourses', 
      'personnel_qualification'
    ];
    
    tables.forEach((table) => {
      deletePromises.push(db.promise().query(`DELETE FROM ${table} WHERE service_number = ?`, [service_number]));
    });

    // Finally, delete from personnel table
    deletePromises.push(db.promise().query('DELETE FROM personnel WHERE service_number = ?', [service_number]));

    // Execute all deletion queries
    const results = await Promise.allSettled(deletePromises);

    // Check if any deletion failed
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(`Error deleting record at index ${index}:`, result.reason);
      }
    });

    // Commit the transaction
    await db.promise().query('COMMIT');

    res.json({ message: 'Records deleted successfully for service_number: ' + service_number });
  } catch (error) {
    // Rollback transaction on error
    await db.promise().query('ROLLBACK');
    console.error('Error deleting records:', error);
    res.status(500).json({ message: 'Error deleting records', error });
  }
});

module.exports = router;
