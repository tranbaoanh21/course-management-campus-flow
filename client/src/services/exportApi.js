import { request } from './apiClient';

export async function getDataExport() {
  const result = await request('/export');
  return result.data;
}
