import api from './axios';

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function getProfile() {
  const response = await api.get('/auth/profile');
  return response.data;
}
