const db = require('../db');

const Additional = {
  insertColumns: (tableName, columnName, dataType, callback) => {
    // Ensure tableName, columnName, and dataType are safe to use in the query
    const safeTableName = db.escapeId(tableName);
    const safeColumnName = db.escapeId(columnName);
    const safeDataType = db.escape(dataType).replace(/'/g, '');

    const query = `ALTER TABLE ${safeTableName} ADD COLUMN ${safeColumnName} ${safeDataType}`;

    db.query(query, callback);
  },

  getColumns: (tableName, callback) => {
    db.query(`SHOW COLUMNS FROM ${tableName}`, callback);
  },

  getdetails: (tableName, callback) => {
    db.query(`SELECT * FROM ${tableName}`, callback);
  },

  getData: (service_number, callback) => {
    db.query('SELECT * FROM `additionalpersonnel` WHERE `service_number` = ?', [service_number], callback);
  },

  getwifeData: (wife_id, callback) => {
    db.query('SELECT * FROM `additionalwife` WHERE `wife_id` = ?', [wife_id], callback);
  },

  getChildData: (child_id, callback) => {
    db.query('SELECT * FROM `additionalchild` WHERE `child_id` = ?', [child_id], callback);
  },

  insertData: (tableName, Data, callback) => {
    // Transform the Data object to set empty strings to null
    const transformedData = Object.fromEntries(
        Object.entries(Data).map(([key, value]) => [key, value === '' ? null : value])
    );

    // Check if the table name is 'additionalwife'
    if (tableName === 'additionalwife') {
        // Remove the id property if it exists
        const { id, ...dataWithoutId } = transformedData;
        db.query(`INSERT INTO ${tableName} SET ?`, dataWithoutId, callback);
    } else {
        db.query(`INSERT INTO ${tableName} SET ?`, transformedData, callback);
    }
}

};

module.exports = Additional;
