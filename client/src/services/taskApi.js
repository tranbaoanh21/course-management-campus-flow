import { request } from './apiClient';

export async function getTasks(projectId) {
  const result = await request(`/projects/${projectId}/tasks`);
  return result.data;
}

export async function getAllTasks({ search, filter, sort, page, limit = 10 }) {
  const searchParams = new URLSearchParams({
    sort,
    page: String(page),
    limit: String(limit),
  });

  if (search) {
    searchParams.set('search', search);
  }

  if (filter === 'overdue') {
    searchParams.set('overdue', 'true');
  } else if (filter !== 'all') {
    searchParams.set('status', filter);
  }

  return request(`/tasks?${searchParams.toString()}`);
}

export async function createTask(projectId, task) {
  const result = await request(`/projects/${projectId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  return result.data;
}

export async function updateTaskStatus(taskId, status) {
  const result = await request(`/tasks/${taskId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  return result.data;
}

export async function updateTask(taskId, task) {
  const result = await request(`/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  });

  return result.data;
}

export async function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
