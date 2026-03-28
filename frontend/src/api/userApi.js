import api from './axios';

export async function getUsers(params = {}) {
  const response = await api.get('/users', { params });
  return response.data;
}

export async function createUser(payload) {
  const response = await api.post('/users', payload);
  return response.data;
}

export async function updateUser(id, payload) {
  const response = await api.put(`/users/${id}`, payload);
  return response.data;
}

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);
  return response.data;
}
