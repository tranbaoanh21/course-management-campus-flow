const { pool } = require('../config/db');

function parsePositiveInteger(value) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : null;
}

function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

async function courseExists(courseId) {
  const [courses] = await pool.execute('SELECT id FROM courses WHERE id = ?', [courseId]);
  return courses.length > 0;
}

async function getProjectsByCourse(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  if (!(await courseExists(courseId))) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  const [projects] = await pool.execute(
    `SELECT id, course_id, title, description, due_date
     FROM projects
     WHERE course_id = ?
     ORDER BY due_date ASC, id DESC`,
    [courseId],
  );

  return response.status(200).json({
    data: projects,
  });
}

async function createProject(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  if (!(await courseExists(courseId))) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  const { title, description, due_date: dueDate } = request.body;
  const errors = {};

  if (typeof title !== 'string' || title.trim().length === 0) {
    errors.title = 'Title is required.';
  } else if (title.trim().length > 200) {
    errors.title = 'Title must not exceed 200 characters.';
  }

  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.description = 'Description must be a string or null.';
  }

  if (!isValidDateString(dueDate)) {
    errors.due_date = 'Due date must be a valid date in YYYY-MM-DD format.';
  }

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const trimmedTitle = title.trim();
  const normalizedDescription = description?.trim() || null;
  const [result] = await pool.execute(
    `INSERT INTO projects (course_id, title, description, due_date)
     VALUES (?, ?, ?, ?)`,
    [courseId, trimmedTitle, normalizedDescription, dueDate],
  );

  return response.status(201).json({
    data: {
      id: result.insertId,
      course_id: courseId,
      title: trimmedTitle,
      description: normalizedDescription,
      due_date: dueDate,
    },
  });
}

async function deleteProject(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  const [result] = await pool.execute('DELETE FROM projects WHERE id = ?', [projectId]);

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Project not found.',
    });
  }

  return response.status(200).json({
    message: 'Project deleted successfully.',
  });
}

module.exports = {
  getProjectsByCourse,
  createProject,
  deleteProject,
};
