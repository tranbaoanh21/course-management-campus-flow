const { pool } = require('../config/db');

async function getCourses(request, response) {
  const [courses] = await pool.query('SELECT id, name FROM courses ORDER BY id DESC');

  return response.status(200).json({
    data: courses,
  });
}

async function createCourse(request, response) {
  const { name } = request.body;
  const errors = {};

  if (typeof name !== 'string') {
    errors.name = 'Name is required.';
  } else if (name.trim().length === 0) {
    errors.name = 'Name is required.';
  } else if (name.trim().length > 150) {
    errors.name = 'Name must not exceed 150 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const trimmedName = name.trim();
  const [result] = await pool.execute('INSERT INTO courses (name) VALUES (?)', [trimmedName]);

  return response.status(201).json({
    data: {
      id: result.insertId,
      name: trimmedName,
    },
  });
}

async function deleteCourse(request, response) {
  const courseId = Number(request.params.course_id);

  if (!Number.isInteger(courseId) || courseId <= 0) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  const [result] = await pool.execute('DELETE FROM courses WHERE id = ?', [courseId]);

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  return response.status(200).json({
    message: 'Course deleted successfully.',
  });
}

module.exports = {
  getCourses,
  createCourse,
  deleteCourse,
};
