import { createContext, useEffect, useState } from 'react';
import { getProfile, login as loginRequest, logout as logoutRequest } from '../api/authApi';
import { clearSession, getStoredToken, getStoredUser, setStoredToken, setStoredUser } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getStoredToken());
  const [loading, setLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    async function bootstrap() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getProfile();
        setUser(response.user);
        setStoredUser(response.user);
      } catch (error) {
        clearSession();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [token]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    setToken(response.token);
    setUser(response.user);
    setStoredToken(response.token);
    setStoredUser(response.user);
    return response;
  }

  async function logout() {
    try {
      if (token) {
        await logoutRequest();
      }
    } finally {
      clearSession();
      setToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(token && user),
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
