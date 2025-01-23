//backend/models/notification.js

const db = require('../db');

const getAll = () => {
    return new Promise((resolve, reject) => {
        db.query('SELECT * FROM notifications', (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const add = (notification) => {
    const { name, message, type, status } = notification;
    return new Promise((resolve, reject) => {
        db.query(
            'INSERT INTO notifications (name, time, message, type, status) VALUES (?, NOW(), ?, ?, ?)',
            [name, message, type, status],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const newNotification = {
                        id: results.insertId,
                        name,
                        time: new Date().toLocaleString(),
                        message,
                        type,
                        status
                    };
                    resolve(newNotification);
                }
            }
        );
    });
};

const remove = (id) => {
    return new Promise((resolve, reject) => {
        db.query('DELETE FROM notifications WHERE id = ?', [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results.affectedRows > 0);
            }
        });
    });
};

module.exports = {
    getAll,
    add,
    remove
};
