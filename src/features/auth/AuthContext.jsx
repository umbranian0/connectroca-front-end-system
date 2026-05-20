import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginWithLocalCredentials } from '../../api/authApi';
import { AUTH_EXPIRED_EVENT } from './constants';
import {
  clearStoredAuthToken,
  getStoredAuthToken,
  setStoredAuthToken,
} from './tokenStorage';

export const AuthContext = createContext(null);

function getTokenFromStorage() {
  return getStoredAuthToken();
}

function persistToken(nextToken) {
  if (!nextToken) {
    clearStoredAuthToken();
    return;
  }

  setStoredAuthToken(nextToken);
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getTokenFromStorage);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleAuthExpired = () => {
      setToken('');
      setUser(null);
      setError('Session expired. Please log in again.');
      persistToken('');
      setIsLoading(false);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function hydrateSession() {
      if (!token) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      if (user) {
        if (isMounted) {
          setIsLoading(false);
        }
        return;
      }

      if (isMounted) {
        setIsLoading(true);
      }

      try {
        const currentUser = await fetchCurrentUser(token);

        if (isMounted) {
          setUser(currentUser);
          setError('');
        }
      } catch {
        if (isMounted) {
          setToken('');
          setUser(null);
          persistToken('');
          setError('Session expired. Please log in again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void hydrateSession();

    return () => {
      isMounted = false;
    };
  }, [token, user]);

  const login = useCallback(async (identifier, password) => {
    setIsLoading(true);
    setError('');

    try {
      const payload = await loginWithLocalCredentials({ identifier, password });

      setToken(payload.jwt);
      setUser(payload.user ?? null);
      persistToken(payload.jwt);
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Unable to authenticate.';
      setError(message);
      throw authError;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setError('');
    persistToken('');
    setIsLoading(false);
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      error,
      isLoading,
      isAuthenticated: Boolean(token),
      login,
      logout,
      clearError,
    }),
    [token, user, error, isLoading, login, logout, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

