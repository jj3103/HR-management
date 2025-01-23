// routes/personnelRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../db'); // Adjust the path as necessary

router.get('/personnel/combined/columns', (req, res) => {
    const queries = [
        `SELECT COLUMN_NAME,DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'personnel' ORDER BY ORDINAL_POSITION`,
        `SELECT COLUMN_NAME,DATA_TYPE  FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'additionalpersonnel' ORDER BY ORDINAL_POSITION`
    ];
  
    const resultsArray = [];
  
    const promises = queries.map(query => {
        return new Promise((resolve, reject) => {
            db.query(query, (error, results) => {
                if (error) {
                    console.error('Error fetching column metadata:', error);
                    return reject(error);
                }
  
                // Format the results into an array of objects
                const columns = results.map(col => ({
                    Field: col.COLUMN_NAME,
                    Type: col.DATA_TYPE
                }));
  
                resultsArray.push(...columns);
                resolve();
            });
        });
    });
  
    Promise.all(promises)
        .then(() => {
            res.json(resultsArray);
        })
        .catch(() => {
            res.status(500).json({ message: 'Internal server error' });
        });
  });
  
  // Ensure the personnel combined route remains as you have it:
  router.get('/personnel/combined', (req, res) => {
    const query = 
        `SELECT 
            p.*, 
            ap.*,
            p.service_number
        FROM 
            personnel p
        LEFT JOIN 
            additionalpersonnel ap ON p.service_number = ap.service_number
        `;
  
    db.query(query, (error, results) => {
        if (error) {
            console.error('Error fetching personnel data:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
  
        res.json(results);
    });
  });
  
  // Route to get combined column metadata from personnel and additionalpersonnel tables
router.get('/personnel/combined/columns', (req, res) => {
  const query = 
    `SELECT COLUMN_NAME, DATA_TYPE 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME IN ('personnel', 'additionalpersonnel') 
    ORDER BY TABLE_NAME, ORDINAL_POSITION
    `;

  db.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching column metadata:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Debugging: Log the fetched column metadata
    console.log('Fetched column metadata:', results);

    const columns = results.map(col => ({
      Field: col.COLUMN_NAME,
      Type: col.DATA_TYPE
    }));

    res.json(columns);
  });
});

// Route to get personnel data by service number
router.get('/personnel/combined/:serviceNumber', (req, res) => {
  const { serviceNumber } = req.params;
  const query = 
    `SELECT p.*, ap.*, p.service_number, ap.service_number
    FROM personnel p 
    LEFT JOIN additionalpersonnel ap ON p.service_number = ap.service_number 
    WHERE p.service_number = ?
    `;

  db.query(query, [serviceNumber], (error, results) => {
    if (error) {
      console.error('Error fetching personnel data:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Debugging: Log the results before checking the length
    console.log('Fetched personnel data:', results);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Personnel not found' });
    }

    res.json(results[0]);
  });
});

  // Route to update personnel data
  router.put('/personnel/update/:serviceNumber', (req, res) => {
    const { serviceNumber } = req.params;
    const updateData = req.body;
  
    console.log('Received update data:', updateData);  // Log received data
  
    // Separate data for personnel and additionalpersonnel tables
    const personnelData = {};
    const additionalPersonnelData = {};
    const dateColumns = new Set(); // To store date column names
  
    // Get column names and data types for each table
    db.query(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('personnel', 'additionalpersonnel')`,
      (error, results) => {
        if (error) {
          console.error('Error fetching column names:', error);
          return res.status(500).json({ message: 'Internal server error', error: error.message });
        }
  
        console.log('Column information:', results);  // Log column information
  
        const personnelColumns = results.filter(r => r.TABLE_NAME === 'personnel').map(r => r.COLUMN_NAME);
        const additionalPersonnelColumns = results.filter(r => r.TABLE_NAME === 'additionalpersonnel').map(r => r.COLUMN_NAME);
  
        // Populate dateColumns set with names of date type columns
        results.forEach(row => {
          if (row.DATA_TYPE === 'date') {
            if (row.TABLE_NAME === 'personnel') {
              dateColumns.add(row.COLUMN_NAME);
            } else if (row.TABLE_NAME === 'additionalpersonnel') {
              dateColumns.add(row.COLUMN_NAME);
            }
          }
        });
  
        // Function to convert timestamp to date
        const convertTimestampToDate = (value) => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
        };
  
        // Separate the update data into the respective objects
        Object.keys(updateData).forEach(key => {
          if (personnelColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            personnelData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          } else if (additionalPersonnelColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            additionalPersonnelData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          }
        });
  
        console.log('Separated data:', { personnelData, additionalPersonnelData });  // Log separated data
  
        // Update personnel table
        if (Object.keys(personnelData).length > 0) {
          const personnelQuery = 'UPDATE personnel SET ? WHERE service_number = ?';
          db.query(personnelQuery, [personnelData, serviceNumber], (error) => {
            if (error) {
              console.error('Error updating personnel data:', error);
              return res.status(500).json({ message: 'Error updating personnel data', error: error.message });
            }
  
            // Update additionalpersonnel table
            if (Object.keys(additionalPersonnelData).length > 0) {
              const additionalPersonnelQuery = 'UPDATE additionalpersonnel SET ? WHERE service_number = ?';
              db.query(additionalPersonnelQuery, [additionalPersonnelData, serviceNumber], (error) => {
                if (error) {
                  console.error('Error updating additional personnel data:', error);
                  return res.status(500).json({ message: 'Error updating additional personnel data', error: error.message });
                }
  
                res.json({ message: 'Personnel data updated successfully' });
              });
            } else {
              res.json({ message: 'Personnel data updated successfully' });
            }
          });
        } else {
          res.status(400).json({ message: 'No valid fields to update', receivedData: updateData });
        }
      }
    );
  });
  
  // Route to get all wife details
  router.get('/wife/combined', (req, res) => {
    const query = 
      `SELECT wd.*, aw.* 
      FROM wifedetails wd 
      LEFT JOIN additionalwife aw ON wd.wife_id = aw.wife_id
      `;
  
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching wife data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      res.json(results); // Send all wife details
    });
  });
  
  // Route to get all child details
  router.get('/child/combined', (req, res) => {
    const query = 
      `SELECT cd.*, ac.* , cd.service_number
      FROM childdetails cd 
      LEFT JOIN additionalchild ac ON cd.child_id = ac.child_id
      `;
  
    db.query(query, (error, results) => {
      if (error) {
        console.error('Error fetching child data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      res.json(results); // Send all child details
    });
  });
  
  // Route to get columns for wifedetails and additionalwife
  router.get('/wife/combined/columns', (req, res) => {
    const queries = [
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'wifedetails' ORDER BY ORDINAL_POSITION`,
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'additionalwife' ORDER BY ORDINAL_POSITION`
    ];
  
    const resultsArray = [];
  
    const promises = queries.map(query => {
      return new Promise((resolve, reject) => {
        db.query(query, (error, results) => {
          if (error) {
            console.error('Error fetching column metadata:', error);
            return reject(error);
          }
  
          // Format the results into an array of objects
          const columns = results.map(col => ({
            Field: col.COLUMN_NAME,
            Type: col.DATA_TYPE
          }));
  
          resultsArray.push(...columns);
          resolve();
        });
      });
    });
  
    Promise.all(promises)
      .then(() => {
        res.json(resultsArray);
      })
      .catch(() => {
        res.status(500).json({ message: 'Internal server error' });
      });
  });
  
  // Route to get combined wife details
  router.get('/wife/combined/:serviceNumber', (req, res) => {
    const { serviceNumber } = req.params; // Change from wifeId to serviceNumber
    const query = `
      SELECT wd.*, aw.* 
      FROM wifedetails wd 
      LEFT JOIN additionalwife aw ON wd.wife_id = aw.wife_id 
      WHERE wd.service_number = ?
    `;
  
    db.query(query, [serviceNumber], (error, results) => {
      if (error) {
        console.error('Error fetching wife data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Wife not found' });
      }
  
      res.json(results[0]);
    });
  });
  
  
  // Route to update wife details using serviceNumber
  router.put('/wife/update/:serviceNumber', (req, res) => {
    const { serviceNumber } = req.params; // Get service number from request params
    const updateData = req.body;
  
    console.log('Received update data for wife:', updateData); // Log received data
  
    const wifeData = {};
    const additionalWifeData = {};
    const dateColumns = new Set(); // To store date column names
  
    // Get column names and data types for each table
    db.query(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('wifedetails', 'additionalwife')`,
      (error, results) => {
        if (error) {
          console.error('Error fetching column names:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        const wifeColumns = results.filter(r => r.TABLE_NAME === 'wifedetails').map(r => r.COLUMN_NAME);
        const additionalWifeColumns = results.filter(r => r.TABLE_NAME === 'additionalwife').map(r => r.COLUMN_NAME);
        
        // Populate dateColumns set with names of date type columns
        results.forEach(row => {
          if (row.DATA_TYPE === 'date') {
            if (row.TABLE_NAME === 'wifedetails') {
              dateColumns.add(row.COLUMN_NAME);
            } else if (row.TABLE_NAME === 'additionalwife') {
              dateColumns.add(row.COLUMN_NAME);
            }
          }
        });
  
        // Function to convert timestamp to date
        const convertTimestampToDate = (value) => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
        };
  
        // Separate the update data into the respective objects
        Object.keys(updateData).forEach(key => {
          if (wifeColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            wifeData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          } else if (additionalWifeColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            additionalWifeData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          }
        });
  
        console.log('Separated data for wife:', { wifeData, additionalWifeData }); // Log separated data
  
        // Update wifedetails table
        if (Object.keys(wifeData).length > 0) {
          const wifeQuery = 'UPDATE wifedetails SET ? WHERE service_number = ?'; // Update by service number
          db.query(wifeQuery, [wifeData, serviceNumber], (error) => {
            if (error) {
              console.error('Error updating wife data:', error);
              return res.status(500).json({ message: 'Error updating wife data', error: error.message });
            }
  
            // If there is data to update in additionalwife, fetch wife_id from wifedetails
            if (Object.keys(additionalWifeData).length > 0) {
              const wifeIdQuery = 'SELECT wife_id FROM wifedetails WHERE service_number = ?'; // Fetch wife_id
              db.query(wifeIdQuery, [serviceNumber], (error, results) => {
                if (error) {
                  console.error('Error fetching wife_id:', error);
                  return res.status(500).json({ message: 'Error fetching wife_id', error: error.message });
                }
  
                if (results.length === 0) {
                  return res.status(404).json({ message: 'Wife not found' });
                }
  
                const wifeId = results[0].wife_id; // Get the wife_id
  
                // Update additionalwife table using wife_id
                const additionalWifeQuery = 'UPDATE additionalwife SET ? WHERE wife_id = ?'; // Update by wife_id
                db.query(additionalWifeQuery, [additionalWifeData, wifeId], (error) => {
                  if (error) {
                    console.error('Error updating additional wife data:', error);
                    return res.status(500).json({ message: 'Error updating additional wife data', error: error.message });
                  }
  
                  res.json({ message: 'Wife data updated successfully' });
                });
              });
            } else {
              res.json({ message: 'Wife data updated successfully' });
            }
          });
        } else {
          res.status(400).json({ message: 'No valid fields to update', receivedData: updateData });
        }
      }
    );
  });
  
  router.get('/child/combined/columns', (req, res) => {
    const queries = [
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'childdetails' ORDER BY ORDINAL_POSITION`,
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'additionalchild' ORDER BY ORDINAL_POSITION`
    ];
  
    const resultsArray = [];
  
    const promises = queries.map(query => {
      return new Promise((resolve, reject) => {
        db.query(query, (error, results) => {
          if (error) {
            console.error('Error fetching column metadata:', error);
            return reject(error);
          }
  
          // Format the results into an array of objects
          const columns = results.map(col => ({
            Field: col.COLUMN_NAME,
            Type: col.DATA_TYPE
          }));
  
          resultsArray.push(...columns);
          resolve();
        });
      });
    });
  
    Promise.all(promises)
      .then(() => {
        res.json(resultsArray);
      })
      .catch(() => {
        res.status(500).json({ message: 'Internal server error' });
      });
  });
  
  
  router.get('/child/combined/:childId', (req, res) => { // Change from serviceNumber to childId
    const { childId } = req.params; // Use childId from params
    const query = `
      SELECT cd.*, ac.* 
      FROM childdetails cd 
      LEFT JOIN additionalchild ac ON cd.child_id = ac.child_id 
      WHERE cd.child_id = ? 
    `;
  
    db.query(query, [childId], (error, results) => {
      if (error) {
        console.error('Error fetching child data:', error);
        return res.status(500).json({ message: 'Internal server error' });
      }
  
      if (results.length === 0) {
        return res.status(404).json({ message: 'Child not found' });
      }
  
      res.json(results[0]);
    });
  });
  
  router.put('/child/update/:childId', (req, res) => { // Add childId to the route
    const { childId } = req.params; // Get childId from request parameters
    const updateData = req.body;
  
    console.log('Received update data for child:', updateData); // Log received data
  
    const childData = {};
    const additionalChildData = {};
    const dateColumns = new Set(); // To store date column names
  
    // Get column names and data types for each table
    db.query(
      `SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('childdetails', 'additionalchild')`,
      (error, results) => {
        if (error) {
          console.error('Error fetching column names:', error);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        const childColumns = results.filter(r => r.TABLE_NAME === 'childdetails').map(r => r.COLUMN_NAME);
        const additionalChildColumns = results.filter(r => r.TABLE_NAME === 'additionalchild').map(r => r.COLUMN_NAME);
  
        // Populate dateColumns set with names of date type columns
        results.forEach(row => {
          if (row.DATA_TYPE === 'date') {
            if (row.TABLE_NAME === 'childdetails') {
              dateColumns.add(row.COLUMN_NAME);
            } else if (row.TABLE_NAME === 'additionalchild') {
              dateColumns.add(row.COLUMN_NAME);
            }
          }
        });
  
        // Function to convert timestamp to date
        const convertTimestampToDate = (value) => {
          const date = new Date(value);
          return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
        };
  
        // Separate the update data into the respective objects
        Object.keys(updateData).forEach(key => {
          if (childColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            childData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          } else if (additionalChildColumns.includes(key)) {
            // Check if the key is in dateColumns and convert if necessary
            additionalChildData[key] = dateColumns.has(key) && typeof updateData[key] === 'string' && updateData[key].includes('T') 
              ? convertTimestampToDate(updateData[key]) 
              : updateData[key];
          }
        });
  
        console.log('Separated data for child:', { childData, additionalChildData }); // Log separated data
  
        // Update childdetails table
        if (Object.keys(childData).length > 0) {
          const childQuery = 'UPDATE childdetails SET ? WHERE child_id = ?'; // Update by child_id
          db.query(childQuery, [childData, childId], (error) => {
            if (error) {
              console.error('Error updating child data:', error);
              return res.status(500).json({ message: 'Error updating child data', error: error.message });
            }
  
            // If there is data to update in additionalchild
            if (Object.keys(additionalChildData).length > 0) {
              // Update additionalchild table using child_id
              const additionalChildQuery = 'UPDATE additionalchild SET ? WHERE child_id = ?'; // Update by child_id
              db.query(additionalChildQuery, [additionalChildData, childId], (error) => {
                if (error) {
                  console.error('Error updating additional child data:', error);
                  return res.status(500).json({ message: 'Error updating additional child data', error: error.message });
                }
  
                res.json({ message: 'Child data updated successfully' });
              });
            } else {
              res.json({ message: 'Child data updated successfully' });
            }
          });
        } else {
          res.status(400).json({ message: 'No valid fields to update', receivedData: updateData });
        }
      }
    );
  });


module.exports = router;
