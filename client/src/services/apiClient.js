const API_URL = import.meta.env.VITE_API_URL;

export async function request(path, options = {}) {
  const { notifyUnauthorized = true, ...fetchOptions } = options;
  const response = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    credentials: 'include',
  });
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(result.message || 'Request failed.');
    error.status = response.status;
    error.fieldErrors = result.errors || {};

    if (response.status === 401 && notifyUnauthorized) {
      window.dispatchEvent(new Event('campusflow:unauthorized'));
    }

    throw error;
  }

  return result;
}
