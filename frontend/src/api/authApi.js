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

export async function updateProfile(payload) {
  const response = await api.put('/auth/profile', payload);
  return response.data;
}

export async function updatePassword(payload) {
  const response = await api.put('/auth/profile/password', payload);
  return response.data;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post('/auth/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
