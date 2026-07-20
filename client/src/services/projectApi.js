import { request } from './apiClient';

export async function getProjects(courseId) {
  const result = await request(`/courses/${courseId}/projects`);
  return result.data;
}

export async function createProject(courseId, project) {
  const result = await request(`/courses/${courseId}/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });

  return result.data;
}

export async function updateProject(projectId, project) {
  const result = await request(`/projects/${projectId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(project),
  });

  return result.data;
}

export async function deleteProject(projectId) {
  return request(`/projects/${projectId}`, {
    method: 'DELETE',
  });
}
