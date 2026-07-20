import { request } from './apiClient';

export async function getCourses() {
  const result = await request('/courses');
  return result.data;
}

export async function createCourse(name) {
  const result = await request('/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return result.data;
}

export async function updateCourse(courseId, name) {
  const result = await request(`/courses/${courseId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  return result.data;
}

export async function deleteCourse(courseId) {
  return request(`/courses/${courseId}`, {
    method: 'DELETE',
  });
}
