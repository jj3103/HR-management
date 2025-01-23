const PersonnelCourse = require('../models/PersonnelCourse');

// Add personnel course
exports.addPersonnelCourse = async (req, res) => {
  const { courseId, personnel_id, startDate, endDate } = req.body;
  try {
    const newPersonnelCourse = await PersonnelCourse.create({ courseId, personnel_id, startDate, endDate });
    res.json(newPersonnelCourse);
  } catch (error) {
    console.error('Error adding personnel course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
