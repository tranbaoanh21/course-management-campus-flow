const { pool } = require('../config/db');
const { parseTaskListQuery } = require('../utils/taskListQuery');
const { VALID_STATUSES, parsePositiveInteger, validateTaskInput } = require('../utils/validation');

const TASK_SORT_SQL = {
  'due-asc': 'tasks.due_date ASC, tasks.id DESC',
  'due-desc': 'tasks.due_date DESC, tasks.id DESC',
  newest: 'tasks.id DESC',
};

async function projectExists(projectId, userId) {
  const [projects] = await pool.execute(
    `SELECT projects.id
     FROM projects
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE projects.id = ? AND courses.user_id = ?`,
    [projectId, userId],
  );
  return projects.length > 0;
}

function normalizeTask(task) {
  return {
    ...task,
    is_overdue: Boolean(task.is_overdue),
  };
}

async function findTask(taskId, userId) {
  const [tasks] = await pool.execute(
    `SELECT tasks.id, tasks.project_id, tasks.title, tasks.description,
            tasks.status, tasks.due_date,
            (tasks.due_date < CURDATE() AND tasks.status <> 'done') AS is_overdue
     FROM tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE tasks.id = ? AND courses.user_id = ?`,
    [taskId, userId],
  );

  return tasks[0] ? normalizeTask(tasks[0]) : null;
}

async function getTasks(request, response) {
  const { errors, filters } = parseTaskListQuery(request.query);

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const whereClauses = ['courses.user_id = ?'];
  const parameters = [request.user.id];

  if (filters.search) {
    whereClauses.push('LOCATE(?, tasks.title) > 0');
    parameters.push(filters.search);
  }

  if (filters.status) {
    whereClauses.push('tasks.status = ?');
    parameters.push(filters.status);
  }

  if (filters.overdue) {
    whereClauses.push("tasks.due_date < CURDATE() AND tasks.status <> 'done'");
  }

  const fromSql = `FROM tasks
    INNER JOIN projects ON projects.id = tasks.project_id
    INNER JOIN courses ON courses.id = projects.course_id`;
  const whereSql = `WHERE ${whereClauses.join(' AND ')}`;
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total ${fromSql} ${whereSql}`,
    parameters,
  );
  const total = Number(countRows[0].total);
  const totalPages = total === 0 ? 0 : Math.ceil(total / filters.limit);
  const offset = (filters.page - 1) * filters.limit;
  const [tasks] = await pool.execute(
    `SELECT tasks.id, tasks.project_id, tasks.title, tasks.description,
            tasks.status, tasks.due_date,
            projects.title AS project_title,
            courses.id AS course_id, courses.name AS course_name,
            (tasks.due_date < CURDATE() AND tasks.status <> 'done') AS is_overdue
     ${fromSql}
     ${whereSql}
     ORDER BY ${TASK_SORT_SQL[filters.sort]}
     LIMIT ? OFFSET ?`,
    [...parameters, filters.limit, offset],
  );

  return response.status(200).json({
    data: tasks.map(normalizeTask),
    pagination: {
      page: filters.page,
      limit: filters.limit,
      total,
      total_pages: totalPages,
    },
  });
}

async function getTasksByProject(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  if (!(await projectExists(projectId, request.user.id))) {
    return response.status(404).json({
      message: 'Project not found.',
    });
  }

  const [tasks] = await pool.execute(
    `SELECT id, project_id, title, description, status, due_date,
            (due_date < CURDATE() AND status <> 'done') AS is_overdue
     FROM tasks
     WHERE project_id = ?
     ORDER BY due_date ASC, id DESC`,
    [projectId],
  );

  return response.status(200).json({
    data: tasks.map(normalizeTask),
  });
}

async function createTask(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  if (!(await projectExists(projectId, request.user.id))) {
    return response.status(404).json({
      message: 'Project not found.',
    });
  }

  const { title, description, status, due_date: dueDate } = request.body;
  const errors = validateTaskInput({ title, description, status, dueDate });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  const trimmedTitle = title.trim();
  const normalizedDescription = description?.trim() || null;
  const [result] = await pool.execute(
    `INSERT INTO tasks (project_id, title, description, status, due_date)
     VALUES (?, ?, ?, ?, ?)`,
    [projectId, trimmedTitle, normalizedDescription, status, dueDate],
  );
  const task = await findTask(result.insertId, request.user.id);

  return response.status(201).json({
    data: task,
  });
}

async function updateTask(request, response) {
  const taskId = parsePositiveInteger(request.params.task_id);

  if (!taskId) {
    return response.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  if (!(await findTask(taskId, request.user.id))) {
    return response.status(404).json({
      message: 'Task not found.',
    });
  }

  const { title, description, status, due_date: dueDate } = request.body;
  const errors = validateTaskInput({ title, description, status, dueDate });

  if (Object.keys(errors).length > 0) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors,
    });
  }

  await pool.execute(
    `UPDATE tasks
     SET title = ?, description = ?, status = ?, due_date = ?
     WHERE id = ?`,
    [title.trim(), description?.trim() || null, status, dueDate, taskId],
  );

  return response.status(200).json({
    data: await findTask(taskId, request.user.id),
  });
}

async function updateTaskStatus(request, response) {
  const taskId = parsePositiveInteger(request.params.task_id);

  if (!taskId) {
    return response.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  const { status } = request.body;

  if (!VALID_STATUSES.includes(status)) {
    return response.status(400).json({
      message: 'Validation failed.',
      errors: {
        status: 'Status must be todo, in-progress, or done.',
      },
    });
  }

  const [result] = await pool.execute(
    `UPDATE tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     SET tasks.status = ?
     WHERE tasks.id = ? AND courses.user_id = ?`,
    [status, taskId, request.user.id],
  );

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Task not found.',
    });
  }

  return response.status(200).json({
    data: await findTask(taskId, request.user.id),
  });
}

async function deleteTask(request, response) {
  const taskId = parsePositiveInteger(request.params.task_id);

  if (!taskId) {
    return response.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  const [result] = await pool.execute(
    `DELETE tasks
     FROM tasks
     INNER JOIN projects ON projects.id = tasks.project_id
     INNER JOIN courses ON courses.id = projects.course_id
     WHERE tasks.id = ? AND courses.user_id = ?`,
    [taskId, request.user.id],
  );

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Task not found.',
    });
  }

  return response.status(200).json({
    message: 'Task deleted successfully.',
  });
}

module.exports = {
  getTasks,
  getTasksByProject,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
