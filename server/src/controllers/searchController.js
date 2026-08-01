const { pool } = require('../config/db');
const { parseSearchQuery } = require('../utils/searchQuery');

async function searchWorkspace(request, response) {
  const parsedQuery = parseSearchQuery(request.query.q);

  if (parsedQuery.error) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors: {
        q: parsedQuery.error,
      },
    });
  }

  const { query } = parsedQuery;
  const userId = request.user.id;
  const [courseResult, projectResult, taskResult] = await Promise.all([
    pool.execute(
      `SELECT courses.id, courses.name
       FROM courses
       WHERE courses.user_id = ?
         AND LOCATE(LOWER(?), LOWER(courses.name)) > 0
       ORDER BY courses.name ASC, courses.id DESC
       LIMIT 5`,
      [userId, query],
    ),
    pool.execute(
      `SELECT projects.id, projects.course_id, projects.title,
              projects.description, projects.due_date,
              courses.name AS course_name
       FROM projects
       INNER JOIN courses ON courses.id = projects.course_id
       WHERE courses.user_id = ?
         AND LOCATE(LOWER(?), LOWER(projects.title)) > 0
       ORDER BY projects.due_date ASC, projects.id DESC
       LIMIT 5`,
      [userId, query],
    ),
    pool.execute(
      `SELECT tasks.id, tasks.project_id, tasks.title, tasks.status, tasks.due_date,
              projects.title AS project_title,
              courses.id AS course_id, courses.name AS course_name,
              (tasks.due_date < CURDATE() AND tasks.status <> 'done') AS is_overdue
       FROM tasks
       INNER JOIN projects ON projects.id = tasks.project_id
       INNER JOIN courses ON courses.id = projects.course_id
       WHERE courses.user_id = ?
         AND LOCATE(LOWER(?), LOWER(tasks.title)) > 0
       ORDER BY is_overdue DESC, tasks.due_date ASC, tasks.id DESC
       LIMIT 8`,
      [userId, query],
    ),
  ]);

  const courses = courseResult[0];
  const projects = projectResult[0];
  const tasks = taskResult[0].map((task) => ({
    ...task,
    is_overdue: Boolean(task.is_overdue),
  }));

  return response.status(200).json({
    data: {
      query,
      counts: {
        courses: courses.length,
        projects: projects.length,
        tasks: tasks.length,
      },
      courses,
      projects,
      tasks,
    },
  });
}

module.exports = {
  searchWorkspace,
};
