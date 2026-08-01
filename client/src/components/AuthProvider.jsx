import { useCallback, useEffect, useMemo, useState } from 'react';

import AuthContext from '../contexts/AuthContext';
import {
  changePasswordAccount,
  getCurrentUser,
  loginAccount,
  logoutAccount,
  registerAccount,
  updateProfileAccount,
} from '../services/authApi';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');

  const loadSession = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch (error) {
      setUser(null);

      if (error.status !== 401) {
        setSessionError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    getCurrentUser()
      .then((authenticatedUser) => {
        if (isActive) {
          setUser(authenticatedUser);
        }
      })
      .catch((error) => {
        if (!isActive) {
          return;
        }

        setUser(null);

        if (error.status !== 401) {
          setSessionError(error.message);
        }
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  const restoreSession = useCallback(async () => {
    setIsLoading(true);
    setSessionError('');
    await loadSession();
  }, [loadSession]);

  useEffect(() => {
    function handleUnauthorized() {
      setUser(null);
      setSessionError('');
    }

    window.addEventListener('campusflow:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('campusflow:unauthorized', handleUnauthorized);
  }, []);

  const register = useCallback(async (account) => {
    const authenticatedUser = await registerAccount(account);
    setUser(authenticatedUser);
    setSessionError('');
    return authenticatedUser;
  }, []);

  const login = useCallback(async (credentials) => {
    const authenticatedUser = await loginAccount(credentials);
    setUser(authenticatedUser);
    setSessionError('');
    return authenticatedUser;
  }, []);

  const logout = useCallback(async () => {
    await logoutAccount();
    setUser(null);
    setSessionError('');
  }, []);

  const updateProfile = useCallback(async (profile) => {
    const updatedUser = await updateProfileAccount(profile);
    setUser(updatedUser);
    return updatedUser;
  }, []);

  const changePassword = useCallback(async (passwords) => {
    await changePasswordAccount(passwords);
  }, []);

  const contextValue = useMemo(
    () => ({
      user,
      isLoading,
      sessionError,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      restoreSession,
    }),
    [
      user,
      isLoading,
      sessionError,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      restoreSession,
    ],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
