const { pool } = require('../config/db');
const { getMonthRange, parseCalendarMonth } = require('../utils/calendarQuery');

async function getCalendar(request, response) {
  const { error, month } = parseCalendarMonth(request.query.month);

  if (error) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors: {
        month: error,
      },
    });
  }

  const { startDate, endDate } = getMonthRange(month);
  const [tasks] = await pool.execute(
    `SELECT tasks.id, tasks.project_id, tasks.title, tasks.status, tasks.due_date,
            projects.title AS project_title,
            courses.id AS course_id, courses.name AS course_name,
            (tasks.due_date < CURDATE() AND tasks.status <> 'done') AS is_overdue
     FROM tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE courses.user_id = ?
       AND tasks.due_date >= ?
       AND tasks.due_date < ?
     ORDER BY tasks.due_date ASC, tasks.id DESC`,
    [request.user.id, startDate, endDate],
  );

  return response.status(200).json({
    data: {
      month,
      tasks: tasks.map((task) => ({
        ...task,
        is_overdue: Boolean(task.is_overdue),
      })),
    },
  });
}

module.exports = {
  getCalendar,
};
