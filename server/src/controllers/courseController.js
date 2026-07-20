const { pool } = require('../config/db');

function parsePositiveInteger(value) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function validateCourseName(name) {
  if (typeof name !== 'string' || name.trim().length === 0) {
    return 'Name is required.';
  }

  if (name.trim().length > 150) {
    return 'Name must not exceed 150 characters.';
  }

  return null;
}

async function getCourses(request, response) {
  const [courses] = await pool.query('SELECT id, name FROM courses ORDER BY id DESC');

  return response.status(200).json({
    data: courses,
  });
}

async function createCourse(request, response) {
  const { name } = request.body;
  const errors = {};
  const nameError = validateCourseName(name);

  if (nameError) {
    errors.name = nameError;
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

async function updateCourse(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  const { name } = request.body;
  const nameError = validateCourseName(name);

  if (nameError) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors: {
        name: nameError,
      },
    });
  }

  const trimmedName = name.trim();
  const [result] = await pool.execute('UPDATE courses SET name = ? WHERE id = ?', [
    trimmedName,
    courseId,
  ]);

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  return response.status(200).json({
    data: {
      id: courseId,
      name: trimmedName,
    },
  });
}

async function deleteCourse(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
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
  updateCourse,
  deleteCourse,
};
