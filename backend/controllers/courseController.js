const Course = require('../models/Course');

// Fetch all courses
exports.getAllCourses = async (req, res) => {
  try {
    const courses = await Course.findAll();
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Add a new course
exports.addCourse = async (req, res) => {
  const { name } = req.body;
  try {
    const newCourse = await Course.create({ name });
    res.json(newCourse);
  } catch (error) {
    console.error('Error adding course:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
