const { DataTypes } = require('sequelize');
const db = require('../db');

const Course = db.define('Course', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Course;
