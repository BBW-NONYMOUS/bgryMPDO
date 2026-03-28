const TOKEN_KEY = 'mpdo_token';
const USER_KEY = 'mpdo_user';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }

  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
