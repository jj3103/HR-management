const { DataTypes } = require('sequelize');
const db = require('../db');

const PersonnelCourse = db.define('personnelcourses', {
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'courses',
      key: 'id'
    }
  },
  personnel_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'personnel',
      key: 'id'
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
});

module.exports = PersonnelCourse;
