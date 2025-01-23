const db = require('../db');

const userModel = {

  createUser: (email, hashedPassword, role, serviceNumber, status) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO users (email, password, role, service_number, status) VALUES (?, ?, ?, ?, ?)';
      db.query(sql, [email, hashedPassword, role, serviceNumber, status], (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  },

  getUserByUsername: (username, callback) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [username], (err, result) => {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
  },

  getAdmin: (callback) => {
    db.query('SELECT * FROM users WHERE role = "admin"', callback);
  },

  Desactivation: (id, callback) => {
    db.query('UPDATE users SET status = "desactive" where id = ?', id, callback);
  },

  Activation: (id, callback) => {
    db.query('UPDATE users SET status = "active" where id = ?', id, callback);
  },

  checkSuperAdmin: () => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM users WHERE role = "superadmin"';
      db.query(query, (err, result) => {
        if (err) {
          console.error('Error executing query:', err);
          reject(err); // Reject the promise with the error
          return;
        }
        resolve(result); // Resolve the promise with the result
      });
    });
  },

  getActiveAdmin: (callback) => {
    db.query('SELECT * FROM users WHERE status = "active" AND role = "admin" ', callback);
  }

}

module.exports = userModel;
