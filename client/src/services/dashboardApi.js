import { request } from './apiClient';

export async function getDashboardOverview() {
  const result = await request('/dashboard');
  return result.data;
}
