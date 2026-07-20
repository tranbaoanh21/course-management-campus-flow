const { pool } = require('../config/db');
const { VALID_STATUSES, parsePositiveInteger, validateTaskInput } = require('../utils/validation');

async function projectExists(projectId) {
  const [projects] = await pool.execute('SELECT id FROM projects WHERE id = ?', [projectId]);
  return projects.length > 0;
}

function normalizeTask(task) {
  return {
    ...task,
    is_overdue: Boolean(task.is_overdue),
  };
}

async function findTask(taskId) {
  const [tasks] = await pool.execute(
    `SELECT id, project_id, title, description, status, due_date,
            (due_date < CURDATE() AND status <> 'done') AS is_overdue
     FROM tasks
     WHERE id = ?`,
    [taskId],
  );

  return tasks[0] ? normalizeTask(tasks[0]) : null;
}

async function getTasksByProject(request, response) {
  const projectId = parsePositiveInteger(request.params.project_id);

  if (!projectId) {
    return response.status(400).json({
      message: 'Invalid project ID.',
    });
  }

  if (!(await projectExists(projectId))) {
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

  if (!(await projectExists(projectId))) {
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
  const task = await findTask(result.insertId);

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

  if (!(await findTask(taskId))) {
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
    data: await findTask(taskId),
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

  const [result] = await pool.execute('UPDATE tasks SET status = ? WHERE id = ?', [status, taskId]);

  if (result.affectedRows === 0) {
    return response.status(404).json({
      message: 'Task not found.',
    });
  }

  return response.status(200).json({
    data: await findTask(taskId),
  });
}

async function deleteTask(request, response) {
  const taskId = parsePositiveInteger(request.params.task_id);

  if (!taskId) {
    return response.status(400).json({
      message: 'Invalid task ID.',
    });
  }

  const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);

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
  getTasksByProject,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
