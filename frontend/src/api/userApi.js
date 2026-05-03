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

export async function suspendUser(id, remark) {
  const response = await api.post(`/users/${id}/suspend`, remark ? { remark } : {});
  return response.data;
}

export async function unsuspendUser(id, remark) {
  const response = await api.post(`/users/${id}/unsuspend`, remark ? { remark } : {});
  return response.data;
}

export async function approveUser(id, remark) {
  const response = await api.post(`/users/${id}/approve`, remark ? { remark } : {});
  return response.data;
}

export async function rejectUser(id, remark) {
  const response = await api.post(`/users/${id}/reject`, remark ? { remark } : {});
  return response.data;
}
