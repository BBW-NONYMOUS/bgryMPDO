import api from './axios';

export async function getSettings() {
  const response = await api.get('/settings');
  return response.data;
}

export async function updateSetting(key, value) {
  const response = await api.put(`/settings/${key}`, { value });
  return response.data;
}

