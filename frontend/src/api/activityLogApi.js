import api from './axios';

export async function getActivityLogs(params = {}) {
  const response = await api.get('/activity-logs', { params });
  return response.data;
}
