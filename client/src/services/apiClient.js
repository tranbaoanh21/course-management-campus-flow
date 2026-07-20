const API_URL = import.meta.env.VITE_API_URL;

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options);
  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.message || 'Request failed.');
    error.fieldErrors = result.errors || {};
    throw error;
  }

  return result;
}
