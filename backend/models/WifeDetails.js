const db = require('../db'); // Assuming db.js exports the MySQL connection

const WifeDetails = {
  getAll: (callback) => {
    db.query('SELECT * FROM wifeDetails', callback);
  },

  create: (wifeDetails, personnel_id, callback) => {
    wifeDetails.personnel_id = personnel_id;
    db.query('INSERT INTO wifeDetails SET ?', wifeDetails, callback);
  },

  getColumns: (callback) => {
    db.query('SHOW COLUMNS FROM wifeDetails', callback);
  },

  addColumn: (columnName, columnType, callback) => {
    const query = `ALTER TABLE wifeDetails ADD COLUMN ${columnName} ${columnType}`;
    db.query(query, callback);
  },
    
  
};

module.exports = WifeDetails;
