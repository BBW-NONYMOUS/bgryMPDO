import api from './axios';

export async function getCategories(params = {}) {
  const response = await api.get('/categories', { params });
  return response.data;
}

export async function createCategory(payload) {
  const response = await api.post('/categories', payload);
  return response.data;
}

export async function updateCategory(id, payload) {
  const response = await api.put(`/categories/${id}`, payload);
  return response.data;
}

export async function deleteCategory(id) {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
}

export async function getBarangays(params = {}) {
  const response = await api.get('/barangays', { params });
  return response.data;
}

export async function createBarangay(payload) {
  const response = await api.post('/barangays', payload);
  return response.data;
}

export async function updateBarangay(id, payload) {
  const response = await api.put(`/barangays/${id}`, payload);
  return response.data;
}

export async function deleteBarangay(id) {
  const response = await api.delete(`/barangays/${id}`);
  return response.data;
}
