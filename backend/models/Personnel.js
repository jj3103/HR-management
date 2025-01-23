const db = require('../db');

const Personnel = {
  getPersonnel: (tableName, callback) => {
    const query = `SELECT * FROM ${tableName}`;
    db.query(query, callback);
  },
  
  getRank: (callback) => {
    const query = `SELECT COUNT(*) AS totalNumber, \`rank\` FROM personnel GROUP BY \`rank\``;
    db.query(query, callback);
  },
  

  getPersonnelDetails: (serviceNumber, callback) => {
    // First, check if there is an entry in additionalpersonnel
    const checkQuery = 'SELECT COUNT(*) as count FROM additionalpersonnel WHERE service_number = ?';
    
    db.query(checkQuery, [serviceNumber], (error, results) => {
        if (error) {
            return callback(error);
        }

        const entryExists = results[0].count > 0;

        let query;
        if (entryExists) {
            // If entry found in additionalpersonnel, use the join query
            query = `
                SELECT p.*, ap.* 
                FROM personnel p
                INNER JOIN additionalpersonnel ap ON p.service_number = ap.service_number 
                WHERE p.service_number = ?`;
        } else {
            // Otherwise, use the normal query
            query = 'SELECT * FROM personnel WHERE service_number = ?';
        }

        // Execute the appropriate query
        db.query(query, [serviceNumber], callback);
    });
},

getWife: (serviceNumber, callback) => {
  // First, check if there is an entry in additionalwife
  const checkQuery = `
      SELECT COUNT(*) as count 
      FROM additionalwife 
      WHERE wife_id IN (SELECT wife_id FROM wifedetails WHERE service_number = ?)`;

  db.query(checkQuery, [serviceNumber], (error, results) => {
      if (error) {
          return callback(error);
      }

      const entryExists = results[0].count > 0;

      let query;
      if (entryExists) {
          // If entry found in additionalwife, use the join query
          query = `
              SELECT wd.*, aw.* 
              FROM wifedetails wd
              INNER JOIN additionalwife aw ON wd.wife_id = aw.wife_id 
              WHERE wd.service_number = ?`;
      } else {
          // Otherwise, use the normal query
          query = 'SELECT * FROM wifedetails WHERE service_number = ?';
      }

      // Execute the appropriate query
      db.query(query, [serviceNumber], callback);
  });
},


getChild: (serviceNumber, callback) => {
  // First, check if there is an entry in additionalchild
  const checkQuery = `
      SELECT COUNT(*) as count 
      FROM additionalchild 
      WHERE child_id IN (SELECT child_id FROM childdetails WHERE service_number = ?)`;

  db.query(checkQuery, [serviceNumber], (error, results) => {
      if (error) {
          return callback(error);
      }

      const entryExists = results[0].count > 0;

      let query;
      if (entryExists) {
          // If entry found in additionalchild, use the join query
          query = `
              SELECT cd.*, ac.* 
              FROM childdetails cd
              INNER JOIN additionalchild ac ON cd.child_id = ac.child_id 
              WHERE cd.service_number = ?`;
      } else {
          // Otherwise, use the normal query
          query = 'SELECT * FROM childdetails WHERE service_number = ?';
      }

      // Execute the appropriate query
      db.query(query, [serviceNumber], callback);
  });
},


  getColumn: (table, callback) => {
    const query = `SHOW COLUMNS FROM ${table}`;
    db.query(query, callback);
  },

  insertPersonnel: (personnelData, callback) => {
    const transformedData = Object.fromEntries(
        Object.entries(personnelData).map(([key, value]) => [key, value === '' ? null : value])
    );
    const query = 'INSERT INTO personnel SET ?';
    db.query(query, transformedData, callback);
},

insertWife: (wifeData, callback) => {
    const transformedData = Object.fromEntries(
        Object.entries(wifeData).map(([key, value]) => [key, value === '' ? null : value])
    );
    const query = 'INSERT INTO wifedetails SET ?';
    db.query(query, transformedData, callback);
},

insertChild: (childData, callback) => {
    const transformedData = Object.fromEntries(
        Object.entries(childData).map(([key, value]) => [key, value === '' ? null : value])
    );
    const query = 'INSERT INTO childdetails SET ?';
    db.query(query, transformedData, callback);
},

  getphoto: (serviceNumber, callback) => {
    const query = 'SELECT photo from personnel where service_number = ?';
    db.query(query, [serviceNumber], callback);
  },
  getname: (serviceNumber, callback) => {
    const query = 'SELECT first_name, last_name from personnel where service_number = ?';
    db.query(query, serviceNumber, callback);
  },

  getNumber: (callback) => {
    const query = 'SELECT count(*) as Number from personnel';
    db.query(query, callback);
  }
};

module.exports = Personnel;
