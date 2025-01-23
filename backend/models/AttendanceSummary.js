const db = require('../db');

const Attendance = {
    getLeave: (callback) => {
        const query = "SELECT count(*) as Count FROM `leave` WHERE status = 'absent'";
        db.query(query, callback);
    },
    getPresent: (callback) => {
        const query = 'SELECT count(*) as Count FROM personnel WHERE service_number NOT IN (SELECT service_number FROM `leave` WHERE status = "absent")';
        db.query(query, callback);
    },
    getTotalPersonnel: (callback) => {
        const query = "SELECT count(*) as Total FROM personnel";
        db.query(query, callback);
    }
};

module.exports = Attendance;
