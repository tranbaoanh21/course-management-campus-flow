import { request } from './apiClient';

export async function searchWorkspace(query) {
  const result = await request(`/search?q=${encodeURIComponent(query)}`);
  return result.data;
}
