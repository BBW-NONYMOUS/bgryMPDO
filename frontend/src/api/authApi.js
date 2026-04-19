import api from './axios';

const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

function getApiOrigin() {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return 'http://localhost:8000';
  }
}

function normalizeProfilePhotoUrl(url) {
  if (!url) return null;

  const apiOrigin = getApiOrigin();

  try {
    const parsedUrl = new URL(url, apiOrigin);

    // Always rewrite localhost/127.0.0.1 storage URLs to use the configured API origin.
    // This fixes port mismatches when APP_URL in Laravel differs from VITE_API_URL
    // (e.g. Laravel uses http://127.0.0.1:8000 but frontend points to http://localhost:8000).
    if (
      parsedUrl.pathname.startsWith('/storage/') &&
      ['localhost', '127.0.0.1'].includes(parsedUrl.hostname)
    ) {
      return new URL(`${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`, apiOrigin).toString();
    }

    return parsedUrl.toString();
  } catch {
    return url;
  }
}

function normalizeUser(user) {
  if (!user) return user;

  return {
    ...user,
    profile_photo_url: normalizeProfilePhotoUrl(user.profile_photo_url),
  };
}

function normalizeResponse(data) {
  if (!data?.user) return data;

  return {
    ...data,
    user: normalizeUser(data.user),
  };
}

export async function login(payload) {
  const response = await api.post('/auth/login', payload);
  return normalizeResponse(response.data);
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function getProfile() {
  const response = await api.get('/auth/profile');
  return normalizeResponse(response.data);
}

export async function updateProfile(payload) {
  const response = await api.put('/auth/profile', payload);
  return normalizeResponse(response.data);
}

export async function updatePassword(payload) {
  const response = await api.put('/auth/profile/password', payload);
  return response.data;
}

export async function uploadProfilePhoto(file) {
  const formData = new FormData();
  formData.append('photo', file);

  const response = await api.post('/auth/profile/photo', formData);
  return normalizeResponse(response.data);
}
