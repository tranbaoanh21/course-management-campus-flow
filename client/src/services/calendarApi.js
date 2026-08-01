import { request } from './apiClient';

export async function getCalendar(month) {
  const result = await request(`/calendar?month=${encodeURIComponent(month)}`);
  return result.data;
}
