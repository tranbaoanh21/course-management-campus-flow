const { pool } = require('../config/db');
const { buildDataExport } = require('../utils/dataExport');

async function exportUserData(request, response) {
  const userId = request.user.id;
  const [accountResult, courseResult, projectResult, taskResult] = await Promise.all([
    pool.execute('SELECT id, name, email, created_at FROM users WHERE id = ?', [userId]),
    pool.execute('SELECT id, name FROM courses WHERE user_id = ? ORDER BY id ASC', [userId]),
    pool.execute(
      `SELECT projects.id, projects.course_id, projects.title,
              projects.description, projects.due_date
       FROM projects
       INNER JOIN courses ON courses.id = projects.course_id
       WHERE courses.user_id = ?
       ORDER BY projects.course_id ASC, projects.id ASC`,
      [userId],
    ),
    pool.execute(
      `SELECT tasks.id, tasks.project_id, tasks.title,
              tasks.description, tasks.status, tasks.due_date
       FROM tasks
       INNER JOIN projects ON projects.id = tasks.project_id
       INNER JOIN courses ON courses.id = projects.course_id
       WHERE courses.user_id = ?
       ORDER BY tasks.project_id ASC, tasks.id ASC`,
      [userId],
    ),
  ]);

  return response.status(200).json({
    data: buildDataExport(accountResult[0][0], courseResult[0], projectResult[0], taskResult[0]),
  });
}

module.exports = {
  exportUserData,
};
