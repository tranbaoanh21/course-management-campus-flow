const { pool } = require('../config/db');

function toNumber(value) {
  return Number(value) || 0;
}

async function getDashboardOverview(request, response) {
  const userId = request.user.id;
  const [summaryRows] = await pool.execute(
    `SELECT COUNT(DISTINCT courses.id) AS courses,
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
     WHERE courses.user_id = ?`,
    [userId],
  );
  const [priorityTasks] = await pool.execute(
    `SELECT tasks.id, tasks.project_id, tasks.title, tasks.status, tasks.due_date,
            projects.title AS project_title,
            courses.id AS course_id, courses.name AS course_name,
            (tasks.due_date < CURDATE()) AS is_overdue
     FROM tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE courses.user_id = ? AND tasks.status <> 'done'
     ORDER BY is_overdue DESC, tasks.due_date ASC, tasks.id DESC
     LIMIT 6`,
    [userId],
  );

  const summary = summaryRows[0];
  const taskCount = toNumber(summary.tasks);
  const doneCount = toNumber(summary.done);

  return response.status(200).json({
    data: {
      counts: {
        courses: toNumber(summary.courses),
        projects: toNumber(summary.projects),
        tasks: taskCount,
      },
      task_status: {
        todo: toNumber(summary.todo),
        in_progress: toNumber(summary.in_progress),
        done: doneCount,
        overdue: toNumber(summary.overdue),
      },
      completion_percentage: taskCount === 0 ? 0 : Math.round((doneCount / taskCount) * 100),
      priority_tasks: priorityTasks.map((task) => ({
        ...task,
        is_overdue: Boolean(task.is_overdue),
      })),
    },
  });
}

module.exports = {
  getDashboardOverview,
};
