const { pool } = require('../config/db');
const { normalizeCourseOverview } = require('../utils/courseOverview');
const { parsePositiveInteger } = require('../utils/validation');

async function getCourseOverview(request, response) {
  const courseId = parsePositiveInteger(request.params.course_id);

  if (!courseId) {
    return response.status(400).json({
      message: 'Invalid course ID.',
    });
  }

  const [summaryRows] = await pool.execute(
    `SELECT courses.id, courses.name,
            COUNT(DISTINCT projects.id) AS projects,
            COUNT(DISTINCT tasks.id) AS tasks,
            COALESCE(SUM(tasks.status = 'todo'), 0) AS todo,
            COALESCE(SUM(tasks.status = 'in-progress'), 0) AS in_progress,
            COALESCE(SUM(tasks.status = 'done'), 0) AS done,
            COALESCE(
              SUM(tasks.due_date < CURDATE() AND tasks.status <> 'done'),
              0
            ) AS overdue
     FROM courses
     LEFT JOIN projects ON projects.course_id = courses.id
     LEFT JOIN tasks ON tasks.project_id = projects.id
     WHERE courses.id = ? AND courses.user_id = ?
     GROUP BY courses.id, courses.name`,
    [courseId, request.user.id],
  );

  if (summaryRows.length === 0) {
    return response.status(404).json({
      message: 'Course not found.',
    });
  }

  const [deadlineRows] = await pool.execute(
    `SELECT tasks.id, tasks.project_id, tasks.title, tasks.status, tasks.due_date,
            projects.title AS project_title,
            (tasks.due_date < CURDATE()) AS is_overdue
     FROM tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE courses.id = ? AND courses.user_id = ? AND tasks.status <> 'done'
     ORDER BY tasks.due_date ASC, tasks.id DESC
     LIMIT 1`,
    [courseId, request.user.id],
  );

  return response.status(200).json({
    data: normalizeCourseOverview(summaryRows[0], deadlineRows[0]),
  });
}

module.exports = {
  getCourseOverview,
};
