import { request } from './apiClient';

export async function getTasks(projectId) {
  const result = await request(`/projects/${projectId}/tasks`);
  return result.data;
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

export async function deleteTask(taskId) {
  return request(`/tasks/${taskId}`, {
    method: 'DELETE',
  });
}
