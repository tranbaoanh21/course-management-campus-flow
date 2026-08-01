const { pool } = require('../config/db');
const { normalizeProjectProgress } = require('../utils/projectProgress');
const { parsePositiveInteger, validateProjectInput } = require('../utils/validation');

const PROJECT_PROGRESS_SELECT = `projects.id, projects.course_id, projects.title,
  projects.description, projects.due_date,
  COUNT(tasks.id) AS task_count,
  COALESCE(SUM(tasks.status = 'done'), 0) AS completed_task_count,
  COALESCE(
    SUM(tasks.due_date < CURDATE() AND tasks.status <> 'done'),
    0
  ) AS overdue_task_count,
  (projects.due_date < CURDATE()) AS is_overdue`;

const PROJECT_GROUP_BY = `projects.id, projects.course_id, projects.title,
  projects.description, projects.due_date`;

async function courseExists(courseId, userId) {
  const [courses] = await pool.execute('SELECT id FROM courses WHERE id = ? AND user_id = ?', [
    courseId,
    userId,
  ]);
  return courses.length > 0;
}

async function findProject(projectId, userId) {
  const [projects] = await pool.execute(
    `SELECT ${PROJECT_PROGRESS_SELECT}
     FROM projects
     INNER JOIN courses ON courses.id = projects.course_id
     LEFT JOIN tasks ON tasks.project_id = projects.id
     WHERE projects.id = ? AND courses.user_id = ?
     GROUP BY ${PROJECT_GROUP_BY}`,
    [projectId, userId],
  );

  return projects[0] ? normalizeProjectProgress(projects[0]) : null;
}

async function getProjectsByCourse(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  if (!(await courseExists(courseId, request.user.id))) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  const [projects] = await pool.execute(
    `SELECT ${PROJECT_PROGRESS_SELECT}
     FROM projects
     INNER JOIN courses ON courses.id = projects.course_id
     LEFT JOIN tasks ON tasks.project_id = projects.id
     WHERE projects.course_id = ? AND courses.user_id = ?
     GROUP BY ${PROJECT_GROUP_BY}
     ORDER BY projects.due_date ASC, projects.id DESC`,
    [courseId, request.user.id],
  );

  return response.status(200).json({
    data: projects.map(normalizeProjectProgress),
  });
}

async function createProject(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  if (!(await courseExists(courseId, request.user.id))) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  const { title, description, due_date: dueDate } = request.body;
  const errors = validateProjectInput({ title, description, dueDate });

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
    data: await findProject(result.insertId, request.user.id),
  });
}

async function updateProject(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  if (!(await findProject(projectId, request.user.id))) {
    return response.status(404).json({
      message: 'Project not found.',
    });
  }

  const { title, description, due_date: dueDate } = request.body;
  const errors = validateProjectInput({ title, description, dueDate });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  await pool.execute(
    `UPDATE projects
     SET title = ?, description = ?, due_date = ?
     WHERE id = ?`,
    [title.trim(), description?.trim() || null, dueDate, projectId],
  );

  return response.status(200).json({
    data: await findProject(projectId, request.user.id),
  });
}

async function deleteProject(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  const [result] = await pool.execute(
    `DELETE projects
     FROM projects
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE projects.id = ? AND courses.user_id = ?`,
    [projectId, request.user.id],
  );

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
  updateProject,
  deleteProject,
};
